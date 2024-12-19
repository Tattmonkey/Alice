import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  browserLocalPersistence, 
  setPersistence,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI1MQwk9_y_oBOkQB6dsiZbTIDMpjNWd8",
  authDomain: "alice-tattoos.firebaseapp.com",
  projectId: "alice-tattoos",
  storageBucket: "alice-tattoos.appspot.com",
  messagingSenderId: "489403546949",
  appId: "1:489403546949:web:800d27740abf66c737922c",
  measurementId: "G-C6GVG0PJCR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Initialize other services
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics conditionally
const analytics = isSupported()
  .then(yes => yes ? getAnalytics(app) : null)
  .catch(() => null);

// Initialize Google Auth Provider with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, storage, analytics, googleProvider };
