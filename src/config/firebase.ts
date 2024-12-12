import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAI1MQwk9_y_oBOkQB6dsiZbTIDMpjNWd8",
  authDomain: "alice-tattoos.firebaseapp.com",
  projectId: "alice-tattoos",
  storageBucket: "alice-tattoos.firebasestorage.app",
  messagingSenderId: "489403546949",
  appId: "1:489403546949:web:800d27740abf66c737922c",
  measurementId: "G-C6GVG0PJCR"
};

// Initialize Firebase only if it hasn't been initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

export const storage = getStorage(app);

// Initialize Analytics only if supported
export const analytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
