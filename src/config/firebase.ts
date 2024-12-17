import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  setPersistence,
  onAuthStateChanged,
  connectAuthEmulator
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with persistence
const auth = getAuth(app);

// Initialize other services
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize services sequentially
const initializeServices = async () => {
  try {
    // Set auth persistence first
    await setPersistence(auth, browserLocalPersistence);

    // Initialize Analytics if supported
    const analyticsSupported = await isSupported();
    const analytics = analyticsSupported ? getAnalytics(app) : null;

    // Connect to emulators in development
    if (process.env.NODE_ENV === 'development') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
      } catch (error) {
        console.error('Error connecting to emulators:', error);
      }
    }

    return { auth, db, storage, analytics };
  } catch (error) {
    console.error('Error initializing services:', error);
    throw error;
  }
};

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

let authInitialized = false;

// Function to check if auth is initialized and ready
const checkAuthInitialized = () => {
  return new Promise((resolve) => {
    // If already initialized, resolve immediately
    if (authInitialized) {
      resolve(true);
      return;
    }

    // Wait for the first auth state change
    const unsubscribe = onAuthStateChanged(auth, () => {
      authInitialized = true;
      unsubscribe();
      resolve(true);
    });
  });
};

// Initialize services
initializeServices().catch(console.error);

// Export initialized services
export { app, auth, db, storage, googleProvider, checkAuthInitialized };
