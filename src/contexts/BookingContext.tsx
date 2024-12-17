import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase/init';
import { useAuth } from './AuthContext';
import { Booking, BookingStatus, TimeSlot } from '../types/booking';
import toast from 'react-hot-toast';

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  createBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) => Promise<string>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getBooking: (bookingId: string) => Promise<Booking | null>;
  getArtistBookings: (artistId: string) => Promise<Booking[]>;
  getUserBookings: (userId: string) => Promise<Booking[]>;
  checkTimeSlotAvailability: (artistId: string, timeSlot: TimeSlot) => Promise<boolean>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Subscribe to user's bookings
  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
        setBookings(bookingData);
        setLoading(false);
      },
      (error) => {
        console.error('[Bookings] Subscription error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createBooking = useCallback(async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
    try {
      // Check if time slot is still available
      const isAvailable = await checkTimeSlotAvailability(
        bookingData.artistId,
        bookingData.timeSlot
      );

      if (!isAvailable) {
        throw new Error('Time slot is no longer available');
      }

      const newBooking = {
        ...bookingData,
        status: 'pending' as BookingStatus,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'bookings'), newBooking);
      
      // Update user's bookings array
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          bookings: [...user.bookings, docRef.id]
        });
      }

      toast.success('Booking created successfully');
      return docRef.id;
    } catch (error) {
      console.error('[Bookings] Create error:', error);
      toast.error('Failed to create booking');
      throw error;
    }
  }, [user]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { 
        status,
        updatedAt: serverTimestamp()
      });
      toast.success(`Booking ${status}`);
    } catch (error) {
      console.error('[Bookings] Status update error:', error);
      toast.error('Failed to update booking status');
      throw error;
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data() as Booking;
      
      // Only allow cancellation of pending or confirmed bookings
      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new Error(`Cannot cancel booking with status: ${booking.status}`);
      }

      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });

      // Remove from user's bookings array
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          bookings: user.bookings.filter(id => id !== bookingId)
        });
      }

      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('[Bookings] Cancel error:', error);
      toast.error('Failed to cancel booking');
      throw error;
    }
  }, [user]);

  const getBooking = useCallback(async (bookingId: string): Promise<Booking | null> => {
    try {
      const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
      if (!bookingDoc.exists()) return null;
      return { id: bookingDoc.id, ...bookingDoc.data() } as Booking;
    } catch (error) {
      console.error('[Bookings] Get booking error:', error);
      throw error;
    }
  }, []);

  const getArtistBookings = useCallback(async (artistId: string): Promise<Booking[]> => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('artistId', '==', artistId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
    } catch (error) {
      console.error('[Bookings] Get artist bookings error:', error);
      throw error;
    }
  }, []);

  const getUserBookings = useCallback(async (userId: string): Promise<Booking[]> => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[];
    } catch (error) {
      console.error('[Bookings] Get user bookings error:', error);
      throw error;
    }
  }, []);

  const checkTimeSlotAvailability = useCallback(async (artistId: string, timeSlot: TimeSlot): Promise<boolean> => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('artistId', '==', artistId),
        where('timeSlot.date', '==', timeSlot.date),
        where('timeSlot.time', '==', timeSlot.time),
        where('status', 'in', ['pending', 'confirmed'])
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty;
    } catch (error) {
      console.error('[Bookings] Check availability error:', error);
      throw error;
    }
  }, []);

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        getBooking,
        getArtistBookings,
        getUserBookings,
        checkTimeSlotAvailability
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
