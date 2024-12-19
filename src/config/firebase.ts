import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from 'firebase/auth';
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

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics conditionally
let analytics = null;
isSupported()
  .then(yes => yes && getAnalytics(app))
  .catch(error => {
    console.error('Analytics error:', error);
  });

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, storage, analytics, googleProvider };
