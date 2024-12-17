import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  getDocs,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Message, MessageThread, ThreadParticipant, MessageStatus, MessageAttachment } from '../types/messages';
import { uploadMultipleAttachments, deleteMessageAttachment } from '../utils/storage';
import toast from 'react-hot-toast';

interface MessagingContextType {
  threads: MessageThread[];
  activeThread: MessageThread | null;
  messages: Message[];
  participants: Record<string, ThreadParticipant>;
  loading: boolean;
  error: string | null;
  sendMessage: (threadId: string, content: string, attachments?: File[]) => Promise<void>;
  createThread: (participantId: string, initialMessage: string, attachments?: File[]) => Promise<string>;
  markThreadAsRead: (threadId: string) => Promise<void>;
  setActiveThread: (thread: MessageThread | null) => void;
  deleteMessage: (messageId: string) => Promise<void>;
  getParticipantInfo: (userId: string) => Promise<ThreadParticipant>;
  getUnreadCount: (thread: MessageThread, userId: string) => number;
}

const MessagingContext = createContext<MessagingContextType | null>(null);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Record<string, ThreadParticipant>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get unread count for a specific user in a thread
  const getUnreadCount = (thread: MessageThread, userId: string): number => {
    return thread.unreadCount[userId] || 0;
  };

  // Subscribe to user's message threads
  useEffect(() => {
    if (!user) return;

    const threadsQuery = query(
      collection(db, 'messageThreads'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(threadsQuery, 
      async (snapshot) => {
        try {
          const threadData: MessageThread[] = [];
          
          for (const doc of snapshot.docs) {
            const thread = doc.data() as MessageThread;
            thread.id = doc.id;
            
            // Fetch participant info if not already cached
            for (const participantId of thread.participants) {
              if (!participants[participantId]) {
                const participantInfo = await getParticipantInfo(participantId);
                setParticipants(prev => ({
                  ...prev,
                  [participantId]: participantInfo
                }));
              }
            }
            
            threadData.push(thread);
          }
          
          setThreads(threadData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching threads:', err);
          setError('Failed to load message threads');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Thread subscription error:', err);
        setError('Failed to subscribe to message updates');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages in active thread
  useEffect(() => {
    if (!activeThread) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, 'messages'),
      where('threadId', '==', activeThread.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery,
      (snapshot) => {
        const messageData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Message[];
        setMessages(messageData);
      },
      (err) => {
        console.error('Messages subscription error:', err);
        toast.error('Failed to load messages');
      }
    );

    return () => unsubscribe();
  }, [activeThread]);

  const getParticipantInfo = async (userId: string): Promise<ThreadParticipant> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('User not found');
      }

      return {
        id: userId,
        name: userData.name,
        avatar: userData.avatar,
        lastSeen: userData.lastSeen,
        isOnline: userData.isOnline || false
      };
    } catch (err) {
      console.error('Error fetching participant info:', err);
      return {
        id: userId,
        name: 'Unknown User',
        isOnline: false
      };
    }
  };

  const sendMessage = async (threadId: string, content: string, attachments?: File[]) => {
    if (!user) throw new Error('Must be logged in to send messages');
    
    try {
      // Create message document first to get ID
      const messageRef = doc(collection(db, 'messages'));
      
      // Upload attachments if any
      let messageAttachments: MessageAttachment[] = [];
      if (attachments?.length) {
        messageAttachments = await uploadMultipleAttachments(
          attachments,
          threadId,
          messageRef.id
        );
      }

      const recipientId = activeThread?.participants.find(id => id !== user.id);
      if (!recipientId) throw new Error('Recipient not found');

      // Create message data
      const messageData: Omit<Message, 'id'> = {
        threadId,
        senderId: user.id,
        recipientId,
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachments: messageAttachments
      };

      // Use a batch write to ensure consistency
      const batch = writeBatch(db);
      
      // Set message document
      batch.set(messageRef, messageData);

      // Update thread
      const threadRef = doc(db, 'messageThreads', threadId);
      batch.update(threadRef, {
        lastMessage: { ...messageData, id: messageRef.id },
        updatedAt: serverTimestamp(),
        [`unreadCount.${recipientId}`]: increment(1)
      });

      await batch.commit();
      toast.success('Message sent');
      
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
      throw err;
    }
  };

  const createThread = async (participantId: string, initialMessage: string, attachments?: File[]): Promise<string> => {
    if (!user) throw new Error('Must be logged in to create message threads');

    try {
      // Create thread document
      const threadData: Omit<MessageThread, 'id'> = {
        participants: [user.id, participantId],
        unreadCount: { [participantId]: 1, [user.id]: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const threadRef = await addDoc(collection(db, 'messageThreads'), threadData);

      // Send initial message
      await sendMessage(threadRef.id, initialMessage, attachments);

      return threadRef.id;
    } catch (err) {
      console.error('Error creating thread:', err);
      toast.error('Failed to create message thread');
      throw err;
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    if (!user) return;

    try {
      const batch = writeBatch(db);

      // Update thread unread count
      const threadRef = doc(db, 'messageThreads', threadId);
      batch.update(threadRef, {
        [`unreadCount.${user.id}`]: 0
      });

      // Mark all unread messages as read
      const messagesQuery = query(
        collection(db, 'messages'),
        where('threadId', '==', threadId),
        where('recipientId', '==', user.id),
        where('status', '!=', 'read')
      );

      const unreadMessages = await getDocs(messagesQuery);
      
      unreadMessages.docs.forEach(doc => {
        batch.update(doc.ref, { status: 'read' as MessageStatus });
      });

      await batch.commit();
    } catch (err) {
      console.error('Error marking thread as read:', err);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) throw new Error('Must be logged in to delete messages');

    try {
      const messageRef = doc(db, 'messages', messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error('Message not found');
      }

      const messageData = messageDoc.data() as Message;

      // Only allow sender to delete their own messages
      if (messageData.senderId !== user.id) {
        throw new Error('Can only delete your own messages');
      }

      // Delete attachments if any
      if (messageData.attachments?.length) {
        await Promise.all(
          messageData.attachments.map(attachment => {
            const filename = attachment.url.split('/').pop();
            if (filename) {
              return deleteMessageAttachment(messageData.threadId, filename);
            }
            return Promise.resolve();
          })
        );
      }

      // Update message content
      await updateDoc(messageRef, {
        content: 'This message has been deleted',
        attachments: []
      });

      toast.success('Message deleted');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
      throw err;
    }
  };

  const value = {
    threads,
    activeThread,
    messages,
    participants,
    loading,
    error,
    sendMessage,
    createThread,
    markThreadAsRead,
    setActiveThread,
    deleteMessage,
    getParticipantInfo,
    getUnreadCount
  };

  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}
