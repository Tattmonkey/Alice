import React, { createContext, useContext, useState, useCallback } from 'react';
import { doc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase/init';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    try {
      if (!user) return;

      const notificationData = {
        ...notification,
        read: false,
        createdAt: serverTimestamp(),
        userId: user.id
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      
      const newNotification: Notification = {
        id: docRef.id,
        ...notification,
        read: false,
        createdAt: new Date()
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Show toast notification
      toast[notification.type](notification.message, {
        duration: notification.type === 'error' ? 10000 : 5000
      });
    } catch (error) {
      console.error('[Notifications] Add notification error:', error);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      if (!user) return;

      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('[Notifications] Mark as read error:', error);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    try {
      if (!user) return;

      const unreadNotifications = notifications.filter(n => !n.read);
      
      // Update all unread notifications in Firestore
      await Promise.all(
        unreadNotifications.map(notification =>
          updateDoc(doc(db, 'notifications', notification.id), { read: true })
        )
      );

      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('[Notifications] Mark all as read error:', error);
      toast.error('Failed to mark notifications as read');
    }
  }, [user, notifications]);

  const clearNotifications = useCallback(async () => {
    try {
      if (!user) return;

      // Delete all notifications from Firestore
      await Promise.all(
        notifications.map(notification =>
          updateDoc(doc(db, 'notifications', notification.id), { deleted: true })
        )
      );

      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('[Notifications] Clear notifications error:', error);
      toast.error('Failed to clear notifications');
    }
  }, [user, notifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        unreadCount
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
