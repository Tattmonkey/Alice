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
import { auth, db } from '../lib/firebase';

interface User extends FirebaseUser {
  role?: {
    type: 'user' | 'artist' | 'admin';
    status?: 'pending' | 'approved' | 'rejected';
  };
  displayName: string | null;
  email: string | null;
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
  updateUserRole: (userId: string, role: { type: 'user' | 'artist' | 'admin'; status?: 'pending' | 'approved' | 'rejected' }) => Promise<void>;
  convertToArtist: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        
        // Combine Firebase user with Firestore data
        const enrichedUser: User = {
          ...firebaseUser,
          role: userData?.role || { type: 'user' },
          displayName: firebaseUser.displayName || userData?.displayName || null,
          email: firebaseUser.email || userData?.email || null,
        };
        
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if this is a new user
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          role: { type: 'user' },
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      throw err;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        displayName: name,
        role: { type: 'user' },
        createdAt: new Date().toISOString(),
      });
      
      // Update Firebase user profile
      await result.user.updateProfile({
        displayName: name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log out');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
      throw err;
    }
  };

  const updateUserRole = async (userId: string, role: { type: 'user' | 'artist' | 'admin'; status?: 'pending' | 'approved' | 'rejected' }) => {
    try {
      setError(null);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role });
      
      // Update local user state if it's the current user
      if (user && user.uid === userId) {
        setUser(prev => prev ? { ...prev, role } : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
      throw err;
    }
  };

  const convertToArtist = async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      setError(null);
      // Update user role to artist with pending status
      await updateUserRole(user.uid, { type: 'artist', status: 'pending' });
      
      // Create initial artist profile
      await setDoc(doc(db, 'artistProfiles', user.uid), {
        userId: user.uid,
        displayName: user.displayName,
        email: user.email,
        bio: '',
        specialties: [],
        experience: '',
        portfolio: [],
        services: [],
        availability: {
          schedule: {},
          exceptions: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert to artist');
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
