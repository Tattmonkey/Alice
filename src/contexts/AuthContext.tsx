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

export interface User extends Omit<FirebaseUser, 'id'> {
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

export interface AuthContextType {
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
  signIn: async () => { throw new Error('AuthContext not initialized'); },
  signInWithGoogle: async () => { throw new Error('AuthContext not initialized'); },
  signUp: async () => { throw new Error('AuthContext not initialized'); },
  logout: async () => { throw new Error('AuthContext not initialized'); },
  resetPassword: async () => { throw new Error('AuthContext not initialized'); },
  convertToArtist: async () => { throw new Error('AuthContext not initialized'); },
  updateUserRole: async () => { throw new Error('AuthContext not initialized'); },
};

export const AuthContext = createContext<AuthContextType>(defaultContext);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();
          
          const enrichedUser: User = {
            ...firebaseUser,
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            role: userData?.role || { type: 'user' },
            displayName: firebaseUser.displayName || userData?.displayName || null,
            email: firebaseUser.email || userData?.email || null,
            name: userData?.name || firebaseUser.displayName || null,
            photoURL: firebaseUser.photoURL,
            createdAt: userData?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          setUser(enrichedUser);
        } catch (err) {
          console.error('Error loading user data:', err);
          setUser(null);
        }
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
      
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
          role: { type: 'user' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
      
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        displayName: name,
        name,
        role: { type: 'user' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      if (result.user) {
        await updateDoc(doc(db, 'users', result.user.uid), {
          displayName: name,
          name
        });
      }
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
      await updateDoc(userRef, { 
        role,
        updatedAt: new Date().toISOString()
      });
      
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
      await updateUserRole(user.uid, { type: 'artist', status: 'pending' });
      
      await setDoc(doc(db, 'artistProfiles', user.uid), {
        userId: user.uid,
        displayName: user.displayName,
        name: user.name || user.displayName,
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
      console.error('Error converting to artist account:', err);
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
