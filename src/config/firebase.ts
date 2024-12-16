import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI1MQwk9_y_oBOkQB6dsiZbTIDMpjNWd8",
  authDomain: "alice-tattoos.firebaseapp.com",
  projectId: "alice-tattoos",
  storageBucket: "alice-tattoos.appspot.com", // Fixed storage bucket format
  messagingSenderId: "489403546949",
  appId: "1:489403546949:web:800d27740abf66c737922c",
  measurementId: "G-C6GVG0PJCR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('[Firebase] Persistence error:', error);
  });

// Initialize Analytics conditionally
isSupported().then(yes => yes ? getAnalytics(app) : null);

// Export initialized services
export { app, auth, db, storage };

// Export GoogleAuthProvider class for consistent configuration
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline',
  include_granted_scopes: 'true',
  // Add additional OAuth 2.0 scopes if needed
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ')
});
