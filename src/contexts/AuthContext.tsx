import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase/init';
import { User } from '../types';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = ['washington@alicetattoos.com', 'support@alicetattoos.com'];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserCredits: (userId: string, amount: number) => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  revertToUser: () => Promise<void>;
  switchToArtist: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function handleUserData(firebaseUser: FirebaseUser): Promise<{ user: User; isAdmin: boolean }> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  const isAdminUser = ADMIN_EMAILS.includes(firebaseUser.email || '');

  if (userDoc.exists()) {
    const userData = userDoc.data();
    return {
      user: { id: firebaseUser.uid, ...userData } as User,
      isAdmin: isAdminUser
    };
  }

  // Create new user document
  const newUser: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || 'User',
    credits: 0,
    cart: [],
    creations: [],
    bookings: [],
    role: {
      type: isAdminUser ? 'admin' : 'user',
      verified: isAdminUser,
      createdAt: new Date().toISOString()
    }
  };

  await setDoc(userRef, newUser);
  return { user: newUser, isAdmin: isAdminUser };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.log('[Auth] Setting up auth state observer...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const { user: userData, isAdmin: isAdminUser } = await handleUserData(firebaseUser);
          setUser(userData);
          setIsAdmin(isAdminUser);
          console.log('[Auth] User authenticated:', { uid: userData.id, isAdmin: isAdminUser });
        } else {
          setUser(null);
          setIsAdmin(false);
          console.log('[Auth] No authenticated user');
        }
      } catch (error) {
        console.error('[Auth] State observer error:', error);
        setUser(null);
        setIsAdmin(false);
        toast.error('Authentication error occurred');
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    });

    return () => {
      console.log('[Auth] Cleaning up auth state observer');
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('[Auth] Sign in error:', error);
      if (error.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password');
      } else {
        toast.error('Failed to sign in');
      }
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Successfully signed in with Google!');
    } catch (error: any) {
      console.error('[Auth] Google sign in error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      toast.success('Successfully signed out');
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  }, []);

  const updateUserCredits = useCallback(async (userId: string, amount: number) => {
    if (!user) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', userId);
      const newCredits = user.credits + amount;
      await updateDoc(userRef, { credits: newCredits });
      setUser(prev => prev ? { ...prev, credits: newCredits } : null);
    } catch (error) {
      console.error('[Auth] Credits update error:', error);
      throw error;
    }
  }, [user]);

  const updateProfile = useCallback(async (data: { name: string; email: string }) => {
    if (!user) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name: data.name,
        email: data.email
      });
      setUser(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('[Auth] Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { deleted: true });
      await auth.currentUser?.delete();
      setUser(null);
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('[Auth] Account deletion error:', error);
      toast.error('Failed to delete account');
      throw error;
    }
  }, [user]);

  const revertToUser = useCallback(async () => {
    if (!user) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', user.id);
      const newRole = {
        type: 'user',
        verified: false,
        createdAt: new Date().toISOString()
      };
      await updateDoc(userRef, { role: newRole });
      setUser(prev => prev ? { ...prev, role: newRole } : null);
      toast.success('Successfully reverted to user account');
    } catch (error) {
      console.error('[Auth] Revert to user error:', error);
      toast.error('Failed to revert account');
      throw error;
    }
  }, [user]);

  const switchToArtist = useCallback(async () => {
    if (!user) throw new Error('No authenticated user');

    try {
      const userRef = doc(db, 'users', user.id);
      const newRole = {
        type: 'artist',
        verified: true,
        createdAt: new Date().toISOString()
      };
      await updateDoc(userRef, { role: newRole });
      setUser(prev => prev ? { ...prev, role: newRole } : null);
      toast.success('Successfully switched to artist account');
    } catch (error) {
      console.error('[Auth] Switch to artist error:', error);
      toast.error('Failed to switch to artist account');
      throw error;
    }
  }, [user]);

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signIn,
        signInWithGoogle,
        logout,
        updateUserCredits,
        updateProfile,
        deleteAccount,
        revertToUser,
        switchToArtist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
