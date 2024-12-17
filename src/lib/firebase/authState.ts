import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './index';
import { User } from '../../types';

const ADMIN_EMAILS = ['washington@alicetattoos.com', 'support@alicetattoos.com'];

export async function handleAuthStateChange(firebaseUser: FirebaseUser | null): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  if (!firebaseUser) {
    return { user: null, isAdmin: false };
  }

  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    const isAdminUser = ADMIN_EMAILS.includes(firebaseUser.email || '');

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        user: { id: firebaseUser.uid, ...userData } as User,
        isAdmin: isAdminUser
      };
    }

    // Create new user document
    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'User',
      credits: 0,
      cart: [],
      creations: [],
      bookings: [],
      role: {
        type: isAdminUser ? 'admin' : 'user',
        verified: isAdminUser,
        createdAt: new Date().toISOString()
      }
    };

    await setDoc(userRef, newUser);
    return { user: newUser, isAdmin: isAdminUser };
  } catch (error) {
    console.error('[Auth] User data error:', error);
    throw error;
  }
}
