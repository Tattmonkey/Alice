import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  MoreVertical, 
  Check, 
  CheckCheck,
  Clock,
  Trash2,
  X
} from 'lucide-react';
import { useMessaging } from '../../contexts/MessagingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Message, MessageThread, ThreadParticipant } from '../../types/messages';
import LoadingScreen from '../LoadingScreen';

export default function UserMessages() {
  const { user } = useAuth();
  const { 
    threads,
    activeThread,
    messages,
    participants,
    loading,
    error,
    sendMessage,
    setActiveThread,
    markThreadAsRead,
    deleteMessage,
    getUnreadCount
  } = useMessaging();

  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark thread as read when opened
  useEffect(() => {
    if (activeThread) {
      markThreadAsRead(activeThread.id);
    }
  }, [activeThread]);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!user) return <div className="text-red-500 p-4">Must be logged in to view messages</div>;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || (!messageInput.trim() && !selectedFiles.length)) return;

    try {
      await sendMessage(activeThread.id, messageInput, selectedFiles);
      setMessageInput('');
      setSelectedFiles([]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getMessageStatus = (message: Message) => {
    switch (message.status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderThreadList = () => (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {threads.map(thread => {
          const otherParticipant = participants[
            thread.participants.find(id => id !== user.id) || ''
          ];
          const unreadCount = getUnreadCount(thread, user.id);
          
          return (
            <button
              key={thread.id}
              onClick={() => setActiveThread(thread)}
              className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                activeThread?.id === thread.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {otherParticipant?.avatar ? (
                    <img
                      src={otherParticipant.avatar}
                      alt={otherParticipant.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <span className="text-lg font-medium text-purple-700 dark:text-purple-300">
                        {otherParticipant?.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {otherParticipant?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className={`text-sm font-medium truncate ${
                      unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {otherParticipant?.name}
                    </p>
                    {thread.lastMessage && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(thread.lastMessage.timestamp), 'HH:mm')}
                      </p>
                    )}
                  </div>
                  {thread.lastMessage && (
                    <p className={`text-sm truncate ${
                      unreadCount > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {thread.lastMessage.content}
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <div className="min-w-[1.5rem] h-6 flex items-center justify-center bg-purple-500 rounded-full px-1.5">
                    <span className="text-xs font-medium text-white">
                      {unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderMessageThread = () => {
    if (!activeThread) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Select a conversation to start messaging
        </div>
      );
    }

    const otherParticipant = participants[
      activeThread.participants.find(id => id !== user.id) || ''
    ];

    return (
      <div className="flex-1 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <div className="relative">
            {otherParticipant?.avatar ? (
              <img
                src={otherParticipant.avatar}
                alt={otherParticipant.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <span className="text-lg font-medium text-purple-700 dark:text-purple-300">
                  {otherParticipant?.name.charAt(0)}
                </span>
              </div>
            )}
            {otherParticipant?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {otherParticipant?.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {otherParticipant?.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => {
            const isOwn = message.senderId === user.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className="relative group max-w-[70%]">
                  <div
                    className={`rounded-lg p-3 ${
                      isOwn
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p>{message.content}</p>
                    {message.attachments?.map(attachment => (
                      <div
                        key={attachment.id}
                        className="mt-2 rounded overflow-hidden"
                      >
                        {attachment.type === 'image' ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="max-w-full h-auto"
                          />
                        ) : (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
                          >
                            <Paperclip className="w-4 h-4" />
                            {attachment.name}
                          </a>
                        )}
                      </div>
                    ))}
                    <div className={`text-xs mt-1 flex items-center gap-1 ${
                      isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {format(new Date(message.timestamp), 'HH:mm')}
                      {isOwn && getMessageStatus(message)}
                    </div>
                  </div>

                  {isOwn && (
                    <button
                      onClick={() => setShowDeleteMenu(message.id)}
                      className="absolute top-0 right-0 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" />
                    </button>
                  )}

                  <AnimatePresence>
                    {showDeleteMenu === message.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-0 right-0 -mt-2 -mr-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
                      >
                        <button
                          onClick={() => {
                            deleteMessage(message.id);
                            setShowDeleteMenu(null);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {selectedFiles.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="relative group bg-gray-100 dark:bg-gray-800 rounded p-2 pr-8"
                >
                  <div className="flex items-center gap-2">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeSelectedFile(index)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
            <button
              type="submit"
              disabled={!messageInput.trim() && !selectedFiles.length}
              className="p-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 dark:hover:bg-purple-400"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white dark:bg-gray-900">
      {renderThreadList()}
      {renderMessageThread()}
    </div>
  );
}
