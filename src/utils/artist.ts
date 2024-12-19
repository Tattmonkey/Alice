import { db, storage } from '../config/firebase';
import { doc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ArtistProfile, PortfolioItem, ArtistBooking } from '../types/artist';

// Artist Profile Management
export const createArtistProfile = async (userId: string, profile: Partial<ArtistProfile>) => {
  const artistRef = collection(db, 'artists');
  await addDoc(artistRef, {
    userId,
    ...profile,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateArtistProfile = async (profileId: string, updates: Partial<ArtistProfile>) => {
  const artistRef = doc(db, 'artists', profileId);
  await updateDoc(artistRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const getArtistProfile = async (userId: string): Promise<ArtistProfile | null> => {
  const artistRef = collection(db, 'artists');
  const q = query(artistRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return null;
  }

  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ArtistProfile;
};

// Portfolio Management
export const addPortfolioItem = async (
  artistId: string,
  item: Omit<PortfolioItem, 'id' | 'imageUrl'>,
  imageFile: File
) => {
  // Upload image to Firebase Storage
  const storageRef = ref(storage, `portfolio/${artistId}/${imageFile.name}`);
  const uploadResult = await uploadBytes(storageRef, imageFile);
  const imageUrl = await getDownloadURL(uploadResult.ref);

  // Add portfolio item to Firestore
  const portfolioRef = collection(db, 'artists', artistId, 'portfolio');
  await addDoc(portfolioRef, {
    ...item,
    imageUrl,
    createdAt: new Date().toISOString(),
  });
};

export const deletePortfolioItem = async (artistId: string, itemId: string, imageUrl: string) => {
  // Delete image from Storage
  const storageRef = ref(storage, imageUrl);
  await deleteObject(storageRef);

  // Delete item from Firestore
  const itemRef = doc(db, 'artists', artistId, 'portfolio', itemId);
  await deleteDoc(itemRef);
};

// Booking Management
export const createBooking = async (booking: Omit<ArtistBooking, 'id'>) => {
  const bookingRef = collection(db, 'bookings');
  await addDoc(bookingRef, {
    ...booking,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
};

export const updateBookingStatus = async (
  bookingId: string,
  status: ArtistBooking['status'],
  notes?: string
) => {
  const bookingRef = doc(db, 'bookings', bookingId);
  await updateDoc(bookingRef, {
    status,
    artistNotes: notes,
    updatedAt: new Date().toISOString(),
  });
};

export const getArtistBookings = async (
  artistId: string,
  status?: ArtistBooking['status']
): Promise<ArtistBooking[]> => {
  const bookingsRef = collection(db, 'bookings');
  const q = status
    ? query(bookingsRef, where('artistId', '==', artistId), where('status', '==', status))
    : query(bookingsRef, where('artistId', '==', artistId));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ArtistBooking[];
};

// Availability Management
export const updateAvailability = async (artistId: string, availability: ArtistProfile['availability']) => {
  const artistRef = doc(db, 'artists', artistId);
  await updateDoc(artistRef, {
    availability,
    updatedAt: new Date().toISOString(),
  });
};

// Pricing Management
export const updatePricing = async (artistId: string, pricing: ArtistProfile['pricing']) => {
  const artistRef = doc(db, 'artists', artistId);
  await updateDoc(artistRef, {
    pricing,
    updatedAt: new Date().toISOString(),
  });
};
