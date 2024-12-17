import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { validateFirebaseConfig, getFirebaseConfig } from './config';

let app: ReturnType<typeof initializeApp>;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;

export const initializeFirebase = async () => {
  try {
    // Validate Firebase configuration
    await validateFirebaseConfig();
    
    // Initialize Firebase app
    app = initializeApp(getFirebaseConfig());
    
    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Set auth persistence
    await setPersistence(auth, browserLocalPersistence);
    console.log('[Firebase] Auth persistence set to local');
    
    console.log('[Firebase] Initialized with config:', {
      projectId: getFirebaseConfig().projectId,
      authDomain: getFirebaseConfig().authDomain,
      environment: import.meta.env.MODE
    });
    
    return { app, auth, db, storage };
  } catch (error) {
    console.error('[Firebase] Initialization error:', error);
    throw error;
  }
};

// Initialize Firebase immediately
const firebaseInstance = initializeFirebase();

// Export initialized instances
export { firebaseInstance as default, app, auth, db, storage };
