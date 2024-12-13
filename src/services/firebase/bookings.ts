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
  orderBy
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Booking } from '../../types';

const BOOKINGS_COLLECTION = 'bookings';

export const getBookingsByArtist = async (artistId: string) => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('artistId', '==', artistId),
      orderBy('date', 'desc')
    );
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

export const getBookingsByUser = async (userId: string) => {
  try {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
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

export const createBooking = async (booking: Omit<Booking, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), {
      ...booking,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await updateDoc(bookingRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

export const deleteBooking = async (bookingId: string) => {
  try {
    const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
    await deleteDoc(bookingRef);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

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
