import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { switchToArtist } from '../services/firebase/users';

interface User {
  id: string;
  uid: string;
  role?: {
    type: 'user' | 'artist' | 'admin';
    status?: 'pending' | 'approved' | 'rejected';
  };
  displayName: string | null;
  email: string | null;
  name?: string;
  photoURL: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  convertToArtist: () => Promise<void>;
  updateUserRole: (userId: string, role: { type: 'user' | 'artist' | 'admin'; status?: 'pending' | 'approved' | 'rejected' }) => Promise<void>;
}

const defaultContext: AuthContextType = {
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signInWithGoogle: async () => {},
  signUp: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  convertToArtist: async () => {},
  updateUserRole: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();

          setUser({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            name: userData?.name,
            role: userData?.role,
            createdAt: userData?.createdAt,
            updatedAt: userData?.updatedAt,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();

      setUser({
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
        name: userData?.name,
        role: userData?.role,
        createdAt: userData?.createdAt,
        updatedAt: userData?.updatedAt,
      });
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const userDoc = doc(db, 'users', userCredential.user.uid);
      const userSnapshot = await getDoc(userDoc);

      if (!userSnapshot.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userDoc, {
          name: userCredential.user.displayName,
          email: userCredential.user.email,
          photoURL: userCredential.user.photoURL,
          role: { type: 'user' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      const userData = userSnapshot.data();
      setUser({
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        displayName: userCredential.user.displayName,
        email: userCredential.user.email,
        photoURL: userCredential.user.photoURL,
        name: userData?.name,
        role: userData?.role,
        createdAt: userData?.createdAt,
        updatedAt: userData?.updatedAt,
      });
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userDoc = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDoc, {
        name,
        email,
        role: { type: 'user' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setUser({
        id: userCredential.user.uid,
        uid: userCredential.user.uid,
        displayName: name,
        email: userCredential.user.email,
        photoURL: null,
        name,
        role: { type: 'user' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      throw err;
    }
  };

  const convertToArtist = async () => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');
      
      await switchToArtist(user.uid);
      
      // Update local user state
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      setUser(prev => prev ? {
        ...prev,
        role: userData?.role || { type: 'artist', status: 'pending' }
      } : null);
    } catch (err) {
      console.error('Error converting to artist:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert to artist');
      throw err;
    }
  };

  const updateUserRole = async (
    userId: string,
    role: { type: 'user' | 'artist' | 'admin'; status?: 'pending' | 'approved' | 'rejected' }
  ) => {
    try {
      setError(null);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role,
        updatedAt: new Date().toISOString(),
      });

      if (user && user.uid === userId) {
        setUser(prev => prev ? {
          ...prev,
          role
        } : null);
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signUp,
    logout,
    resetPassword,
    updateUserRole,
    convertToArtist,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
