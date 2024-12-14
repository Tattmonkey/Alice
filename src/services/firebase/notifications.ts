import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  limit,
  startAfter,
  getDoc,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Notification, NotificationType } from '../../types';

const NOTIFICATIONS_COLLECTION = 'notifications';
const BATCH_SIZE = 20;

export const getUserNotifications = async (
  userId: string,
  lastNotification?: Notification,
  batchSize: number = BATCH_SIZE
) => {
  try {
    let q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    if (lastNotification) {
      q = query(q, startAfter(lastNotification.createdAt), limit(batchSize));
    } else {
      q = query(q, limit(batchSize));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    throw error;
  }
};

export const createNotification = async (
  notification: Omit<Notification, 'id' | 'createdAt'>
) => {
  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...notification,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const batch = writeBatch(db);
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export const deleteAllNotifications = async (userId: string) => {
  try {
    const batch = writeBatch(db);
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

export const subscribeToNotifications = (
  userId: string,
  onUpdate: (notifications: Notification[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      onUpdate(notifications);
    },
    onError
  );
};

// Helper function to create a notification with the correct format
export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  const notification: Omit<Notification, 'id' | 'createdAt'> = {
    userId,
    type: 'system_message',
    title,
    message,
    data,
    read: false
  };

  return createNotification(notification);
};

// Helper function to create a notification for a specific event type
export const createEventNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
) => {
  const notification: Omit<Notification, 'id' | 'createdAt'> = {
    userId,
    type,
    title,
    message,
    data,
    read: false
  };

  return createNotification(notification);
};
