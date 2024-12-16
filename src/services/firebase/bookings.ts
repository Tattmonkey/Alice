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
  Timestamp,
  orderBy,
  limit,
  startAfter,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Booking, 
  BookingStatus, 
  ArtistAvailability, 
  PaymentDetails,
  BookingMessage,
  BookingRating,
} from '../../types';

const BOOKINGS_COLLECTION = 'bookings';
const ARTISTS_COLLECTION = 'artists';
const USERS_COLLECTION = 'users';
const BATCH_SIZE = 10;

type CreateBookingData = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> & {
  artistId: string;
  userId: string;
  serviceId: string;
  status: BookingStatus;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  deposit: number;
  depositPaid: boolean;
};

// Booking CRUD Operations
export const getBookingsByArtist = async (
  artistId: string, 
  status?: BookingStatus[], 
  lastBooking?: Booking,
  batchSize: number = BATCH_SIZE
) => {
  try {
    let q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('artistId', '==', artistId),
      orderBy('date', 'desc')
    );

    if (status && status.length > 0) {
      q = query(q, where('status', 'in', status));
    }

    if (lastBooking) {
      q = query(q, startAfter(lastBooking.date), limit(batchSize));
    } else {
      q = query(q, limit(batchSize));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking));
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

export const getBookingsByUser = async (
  userId: string,
  status?: BookingStatus[],
  lastBooking?: Booking,
  batchSize: number = BATCH_SIZE
) => {
  try {
    let q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    if (status && status.length > 0) {
      q = query(q, where('status', 'in', status));
    }

    if (lastBooking) {
      q = query(q, startAfter(lastBooking.date), limit(batchSize));
    } else {
      q = query(q, limit(batchSize));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking));
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
  try {
    const bookingDoc = await getDoc(doc(db, BOOKINGS_COLLECTION, bookingId));
    if (!bookingDoc.exists()) {
      return null;
    }
    return {
      id: bookingDoc.id,
      ...bookingDoc.data()
    } as Booking;
  } catch (error) {
    console.error('Error getting booking:', error);
    throw error;
  }
};

export const createBooking = async (booking: CreateBookingData) => {
  try {
    // Check artist availability first
    const isAvailable = await checkArtistAvailability(
      booking.artistId,
      booking.date,
      booking.startTime,
      booking.endTime
    );

    if (!isAvailable) {
      throw new Error('Artist is not available for the selected time slot');
    }

    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
      ...booking,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Send notification to artist
    await sendBookingNotification(docRef.id, 'new_booking');

    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const updateBooking = async (
  bookingId: string, 
  updates: Partial<Booking>
) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const currentBooking = await getDoc(bookingRef);
    
    if (!currentBooking.exists()) {
      throw new Error('Booking not found');
    }

    // If updating time/date, check availability
    if (updates.date || updates.startTime || updates.endTime) {
      const isAvailable = await checkArtistAvailability(
        currentBooking.data().artistId,
        updates.date || currentBooking.data().date,
        updates.startTime || currentBooking.data().startTime,
        updates.endTime || currentBooking.data().endTime
      );

      if (!isAvailable) {
        throw new Error('Artist is not available for the selected time slot');
      }
    }

    await updateDoc(bookingRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    // Send notification based on update type
    if (updates.status) {
      await sendBookingNotification(bookingId, `booking_${updates.status}`);
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

export const deleteBooking = async (bookingId: string) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const booking = await getDoc(bookingRef);
    
    if (!booking.exists()) {
      throw new Error('Booking not found');
    }

    // Only allow deletion of pending bookings
    if (booking.data().status !== 'pending') {
      throw new Error('Only pending bookings can be deleted');
    }

    await deleteDoc(bookingRef);
    await sendBookingNotification(bookingId, 'booking_deleted');
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// Availability Management
export const checkArtistAvailability = async (
  artistId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> => {
  try {
    // Get artist's availability settings
    const artistDoc = await getDoc(doc(db, ARTISTS_COLLECTION, artistId));
    if (!artistDoc.exists()) {
      throw new Error('Artist not found');
    }

    const availability: ArtistAvailability = artistDoc.data().availability;

    // Check if date is blocked
    if (availability.blockedDates?.includes(date)) {
      return false;
    }

    // Check regular working hours
    const dayOfWeek = new Date(date).getDay();
    const regularHours = availability.regularHours?.find(h => h.day === dayOfWeek);
    
    if (!regularHours || !regularHours.isAvailable) {
      return false;
    }

    // Check custom availability
    const customSlot = availability.customAvailability?.find(
      slot => new Date(slot.date).getTime() === new Date(date).getTime()
    );

    if (customSlot) {
      if (!customSlot.isAvailable) {
        return false;
      }
      // Use custom slot times instead of regular hours
      if (startTime < customSlot.startTime || endTime > customSlot.endTime) {
        return false;
      }
    } else {
      // Use regular hours
      if (startTime < regularHours.startTime || endTime > regularHours.endTime) {
        return false;
      }
    }

    // Check for overlapping bookings
    const existingBookings = await getDocs(
      query(
        collection(db, BOOKINGS_COLLECTION),
        where('artistId', '==', artistId),
        where('date', '==', date),
        where('status', 'in', ['pending', 'accepted', 'in_progress'])
      )
    );

    return !existingBookings.docs.some(doc => {
      const booking = doc.data();
      return (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime)
      );
    });
  } catch (error) {
    console.error('Error checking artist availability:', error);
    throw error;
  }
};

// Booking Messages
export const addBookingMessage = async (
  bookingId: string,
  message: Omit<BookingMessage, 'id' | 'createdAt'>
) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const booking = await getDoc(bookingRef);
    
    if (!booking.exists()) {
      throw new Error('Booking not found');
    }

    const newMessage: BookingMessage = {
      id: Date.now().toString(),
      ...message,
      createdAt: new Date(),
    };

    const messages = booking.data().messages || [];
    await updateDoc(bookingRef, {
      messages: [...messages, newMessage],
      updatedAt: serverTimestamp()
    });

    await sendBookingNotification(bookingId, 'new_message');
    return newMessage;
  } catch (error) {
    console.error('Error adding booking message:', error);
    throw error;
  }
};

// Booking Ratings
export const addBookingRating = async (
  bookingId: string,
  rating: Omit<BookingRating, 'createdAt'>
) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const booking = await getDoc(bookingRef);
    
    if (!booking.exists()) {
      throw new Error('Booking not found');
    }

    if (booking.data().status !== 'completed') {
      throw new Error('Can only rate completed bookings');
    }

    if (booking.data().rating) {
      throw new Error('Booking has already been rated');
    }

    const newRating: BookingRating = {
      ...rating,
      createdAt: new Date()
    };

    await updateDoc(bookingRef, {
      rating: newRating,
      updatedAt: serverTimestamp()
    });

    // Update artist's average rating
    const artistRef = doc(db, ARTISTS_COLLECTION, booking.data().artistId);
    const artistDoc = await getDoc(artistRef);
    
    if (artistDoc.exists()) {
      const currentRating = artistDoc.data().rating || 0;
      const totalRatings = artistDoc.data().totalRatings || 0;
      const newAverageRating = 
        (currentRating * totalRatings + rating.rating) / (totalRatings + 1);

      await updateDoc(artistRef, {
        rating: newAverageRating,
        totalRatings: totalRatings + 1,
        updatedAt: serverTimestamp()
      });
    }

    await sendBookingNotification(bookingId, 'new_rating');
    return newRating;
  } catch (error) {
    console.error('Error adding booking rating:', error);
    throw error;
  }
};

// Real-time Subscriptions
export const subscribeToBookings = (
  artistId: string,
  onUpdate: (bookings: Booking[]) => void,
  onError: (error: Error) => void
) => {
  const q = query(
    collection(db, BOOKINGS_COLLECTION),
    where('artistId', '==', artistId),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Booking));
      onUpdate(bookings);
    },
    onError
  );
};

// Notification Helper
const sendBookingNotification = async (bookingId: string, type: string) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    const booking = await getDoc(bookingRef);
    
    if (!booking.exists()) {
      throw new Error('Booking not found');
    }

    const batch = writeBatch(db);

    // Create notification for artist
    const artistNotificationRef = doc(collection(db, 'notifications'));
    batch.set(artistNotificationRef, {
      userId: booking.data().artistId,
      type: type,
      title: getNotificationTitle(type),
      message: getNotificationMessage(type, booking.data()),
      read: false,
      createdAt: serverTimestamp()
    });

    // Create notification for user
    const userNotificationRef = doc(collection(db, 'notifications'));
    batch.set(userNotificationRef, {
      userId: booking.data().userId,
      type: type,
      title: getNotificationTitle(type),
      message: getNotificationMessage(type, booking.data()),
      read: false,
      createdAt: serverTimestamp()
    });

    await batch.commit();
  } catch (error) {
    console.error('Error sending booking notification:', error);
    throw error;
  }
};

// Helper functions for notifications
const getNotificationTitle = (type: string): string => {
  const titles: Record<string, string> = {
    new_booking: 'New Booking Request',
    booking_accepted: 'Booking Accepted',
    booking_declined: 'Booking Declined',
    booking_completed: 'Booking Completed',
    booking_cancelled: 'Booking Cancelled',
    booking_in_progress: 'Booking Started',
    new_message: 'New Message',
    new_rating: 'New Rating',
    booking_deleted: 'Booking Deleted'
  };
  return titles[type] || 'Booking Update';
};

const getNotificationMessage = (type: string, booking: any): string => {
  const messages: Record<string, string> = {
    new_booking: `New booking request for ${booking.date}`,
    booking_accepted: `Your booking for ${booking.date} has been accepted`,
    booking_declined: `Your booking for ${booking.date} has been declined`,
    booking_completed: `Booking for ${booking.date} has been marked as completed`,
    booking_cancelled: `Booking for ${booking.date} has been cancelled`,
    booking_in_progress: `Your booking for ${booking.date} has started`,
    new_message: 'You have a new message regarding your booking',
    new_rating: 'Your booking has received a new rating',
    booking_deleted: `Booking for ${booking.date} has been deleted`
  };
  return messages[type] || 'Your booking has been updated';
};
