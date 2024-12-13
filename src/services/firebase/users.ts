import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
  Timestamp,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { User, UserRole, ArtistProfile } from '../../types';

const USERS_COLLECTION = 'users';
const ARTIST_PROFILES_COLLECTION = 'artist_profiles';

export const getUserById = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: UserRole) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      role,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const updateUserCredits = async (userId: string, credits: number) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      credits,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating user credits:', error);
    throw error;
  }
};

export const getAllArtists = async () => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('role.type', '==', 'artist'),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as User));
  } catch (error) {
    console.error('Error getting artists:', error);
    throw error;
  }
};

export const subscribeToUserUpdates = (
  userId: string,
  onUpdate: (user: User) => void,
  onError: (error: Error) => void
) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  
  return onSnapshot(
    userRef,
    (doc) => {
      if (doc.exists()) {
        onUpdate({ id: doc.id, ...doc.data() } as User);
      }
    },
    onError
  );
};

export const switchToArtist = async (userId: string, artistProfile: Omit<ArtistProfile, 'id' | 'userId'>) => {
  try {
    await runTransaction(db, async (transaction) => {
      // Create artist profile
      const artistProfileRef = doc(collection(db, ARTIST_PROFILES_COLLECTION));
      transaction.set(artistProfileRef, {
        ...artistProfile,
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        status: 'active',
        rating: 0,
        totalBookings: 0,
        completedBookings: 0
      });

      // Update user role
      const userRef = doc(db, USERS_COLLECTION, userId);
      transaction.update(userRef, {
        role: {
          type: 'artist',
          artistProfileId: artistProfileRef.id
        },
        updatedAt: Timestamp.now()
      });
    });

    return true;
  } catch (error) {
    console.error('Error switching to artist:', error);
    throw error;
  }
};

export const getArtistProfile = async (artistProfileId: string) => {
  try {
    const profileDoc = await getDoc(doc(db, ARTIST_PROFILES_COLLECTION, artistProfileId));
    if (!profileDoc.exists()) {
      throw new Error('Artist profile not found');
    }
    return { id: profileDoc.id, ...profileDoc.data() } as ArtistProfile;
  } catch (error) {
    console.error('Error getting artist profile:', error);
    throw error;
  }
};

export const subscribeToArtistProfile = (
  artistProfileId: string,
  onUpdate: (profile: ArtistProfile) => void,
  onError: (error: Error) => void
) => {
  const profileRef = doc(db, ARTIST_PROFILES_COLLECTION, artistProfileId);
  
  return onSnapshot(
    profileRef,
    (doc) => {
      if (doc.exists()) {
        onUpdate({ id: doc.id, ...doc.data() } as ArtistProfile);
      }
    },
    onError
  );
};
