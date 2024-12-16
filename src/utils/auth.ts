import { auth, db } from '../config/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve, reject) => {
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error('Auth state check timed out'));
    }, 10000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        clearTimeout(timeout);
        unsubscribe();
        resolve(user);
      },
      (error) => {
        clearTimeout(timeout);
        unsubscribe();
        reject(error);
      }
    );
  });
};

export const checkUserRole = async (userId: string): Promise<string> => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId));
    if (adminDoc.exists()) return 'admin';

    const artistDoc = await getDoc(doc(db, 'artists', userId));
    if (artistDoc.exists()) return 'artist';

    return 'user';
  } catch (error) {
    console.error('Error checking user role:', error);
    return 'user';
  }
};

export const validateAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};
