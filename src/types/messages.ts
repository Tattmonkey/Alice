export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  attachments?: MessageAttachment[];
}

export interface MessageThread {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: { [userId: string]: number };
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface ThreadParticipant {
  id: string;
  name: string;
  avatar?: string;
  lastSeen?: string;
  isOnline: boolean;
}

export interface MessageNotification {
  id: string;
  threadId: string;
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
  read: boolean;
}
