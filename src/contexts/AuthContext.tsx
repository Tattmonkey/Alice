import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserCredits: (userId: string, credits: number) => Promise<void>;
  switchToArtist: () => Promise<void>;
  revertToUser: () => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
  const navigate = useNavigate();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = doc(db, 'users', firebaseUser.uid);
        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          email: firebaseUser.email || '',
          credits: 5,
          cart: [],
          creations: [],
          bookings: [],
          role: null
        };
        await setDoc(userDoc, userData, { merge: true });
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      const userData: User = {
        id: userCredential.user.uid,
        name,
        email,
        credits: 5,
        cart: [],
        creations: [],
        bookings: [],
        role: null
      };
      
      const userDoc = doc(db, 'users', userData.id);
      await setDoc(userDoc, userData);
      
      setUser(userData);
      navigate('/dashboard');
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use');
      } else {
        toast.error('Failed to create account');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Invalid email or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      const userData: User = {
        id: result.user.uid,
        name: result.user.displayName || result.user.email?.split('@')[0] || '',
        email: result.user.email || '',
        credits: 5,
        cart: [],
        creations: [],
        bookings: [],
        role: null
      };

      const userDoc = doc(db, 'users', userData.id);
      await setDoc(userDoc, userData, { merge: true });
      setUser(userData);
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Please enable popups to sign in with Google');
      } else if (error.code === 'auth/cancelled-popup-request') {
        return;
      } else {
        toast.error('Failed to sign in with Google');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email');
      } else {
        toast.error('Failed to send reset email');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserCredits = async (userId: string, credits: number) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', userId);
      const newCredits = user.credits + credits;
      await setDoc(userRef, { credits: newCredits }, { merge: true });
      setUser(prev => prev ? { ...prev, credits: newCredits } : null);
      toast.success(`${credits > 0 ? 'Added' : 'Used'} ${Math.abs(credits)} credits`);
    } catch (error) {
      console.error('Update credits error:', error);
      throw error;
    }
  };

  const switchToArtist = async () => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.id);
      const artistRole = {
        type: 'artist',
        verified: false,
        createdAt: new Date().toISOString()
      };
      
      await updateDoc(userRef, { role: artistRole });
      setUser(prev => prev ? { ...prev, role: artistRole } : null);
    } catch (error) {
      console.error('Switch to artist error:', error);
      throw error;
    }
  };

  const revertToUser = async () => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { role: null });
      setUser(prev => prev ? { ...prev, role: null } : null);
    } catch (error) {
      console.error('Revert to user error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: { name: string; email: string }) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, data);
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.id);
      await deleteDoc(userRef);
      await auth.currentUser?.delete();
      setUser(null);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    signInWithGoogle,
    resetPassword,
    updateUserCredits,
    switchToArtist,
    revertToUser,
    updateProfile,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}