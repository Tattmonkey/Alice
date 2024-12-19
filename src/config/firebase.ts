import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  setPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialize Auth
const auth = getAuth(app);

// Set persistence to local storage
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Initialize other services
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: 'user@example.com'
});

// Add scopes for user info
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Helper function to handle Google Sign In
export const signInWithGoogle = async () => {
  try {
    // First try popup
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error('Popup sign in failed:', error);
    
    // If popup fails, try redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.log('Trying redirect sign in...');
      await signInWithRedirect(auth, googleProvider);
      return null; // Redirect will reload the page
    }
    
    throw error;
  }
};

// Export initialized services
export { app, auth, db, storage, googleProvider };
