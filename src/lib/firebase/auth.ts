import { Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from './index';

export const initializeAuth = async (): Promise<Auth> => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('[Firebase] Auth persistence set to local');
    return auth;
  } catch (error) {
    console.error('[Firebase] Auth initialization error:', error);
    throw error;
  }
};

export const getFirebaseAuth = (): Auth => auth;
