import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { getCurrentUser, checkUserRole } from '../utils/auth';

export interface User {
  id: string;
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  name?: string;
  role?: { type: string; verified: boolean; createdAt: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  convertToArtist: () => Promise<void>;
  revertToUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              role: userData.role || { type: 'user', verified: true, createdAt: new Date().toISOString() },
              ...userData
            });
          } else {
            // Create new user document if it doesn't exist
            const newUser = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              role: { type: 'user', verified: true, createdAt: new Date().toISOString() },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('[Auth] Initiating Google sign-in...');
      setError(null);
      await signInWithPopup(auth, googleProvider);
      showSuccessToast('Successfully signed in with Google!');
    } catch (error) {
      console.error('[Auth] Google sign-in error:', error);
      showErrorToast('Failed to sign in with Google');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        role: { type: 'user', verified: true, createdAt: new Date().toISOString() },
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
    if (!user) throw new Error('No user logged in');
    
    try {
      console.log('Starting artist conversion for user:', user.uid);
      const userRef = doc(db, 'users', user.uid);
      const artistRef = doc(db, 'artists', user.uid);
      
      const newRole = {
        type: 'artist',
        verified: false,
        createdAt: new Date().toISOString()
      };

      console.log('Updating user role:', newRole);
      // Update user role
      await setDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Creating artist profile');
      // Create artist profile
      await setDoc(artistRef, {
        userId: user.uid,
        displayName: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        bio: '',
        location: '',
        specialties: [],
        experience: '',
        socialLinks: {},
        hourlyRate: '',
        availability: '',
        languages: ['English'],
        createdAt: new Date().toISOString(),
        status: 'pending',
        verified: false
      });

      console.log('Updating local user state');
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          role: newRole
        };
      });

      showSuccessToast('Successfully converted to artist account');
    } catch (error) {
      console.error('Error converting to artist:', error);
      showErrorToast('Failed to convert account');
      throw error;
    }
  };

  const revertToUser = async () => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const artistRef = doc(db, 'artists', user.uid);
      
      const newRole = {
        type: 'user',
        verified: true,
        createdAt: new Date().toISOString()
      };

      // Update user role
      await setDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Delete artist profile
      await deleteDoc(artistRef);

      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          role: newRole
        };
      });

      showSuccessToast('Successfully reverted to user account');
    } catch (error) {
      console.error('Error reverting to user:', error);
      showErrorToast('Failed to revert account');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    convertToArtist,
    revertToUser
  };

  console.log('Auth context value:', {
    user: value.user,
    hasConvertToArtist: !!value.convertToArtist,
    loading: value.loading,
    error: value.error,
    userRole: value.user?.role?.type
  });

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
