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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { getCurrentUser, checkUserRole } from '../utils/auth';

interface User {
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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            setUser({
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              ...userDoc.data()
            });
          } else {
            const newUser = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: {
                type: 'user',
                verified: false,
                createdAt: new Date().toISOString()
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('[Auth] State observer error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('[Auth] Initiating Google sign-in...');
      
      // Clear any previous errors
      setError(null);

      // Use signInWithPopup with the configured googleProvider
      await signInWithPopup(auth, googleProvider);
      showSuccessToast('Successfully signed in with Google!');
    } catch (error) {
      console.error('[Auth] Google sign-in error:', error, {
        code: (error as AuthError)?.code,
        message: (error as AuthError)?.message,
        browser: navigator.userAgent
      });
      
      // Handle specific error cases
      if ((error as AuthError)?.code === 'auth/popup-blocked') {
        showErrorToast('Please allow popups for this site');
        // Fallback to redirect method if popup is blocked
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectError) {
          console.error('[Auth] Redirect fallback error:', redirectError);
        }
      } else if ((error as AuthError)?.code === 'auth/popup-closed-by-user') {
        showErrorToast('Sign-in was cancelled');
      } else if ((error as AuthError)?.code === 'auth/internal-error') {
        showErrorToast('An error occurred. Please try again in a few moments.');
        // Log additional details for debugging
        console.error('[Auth] Internal error details:', {
          authInstance: !!auth,
          providerInstance: !!googleProvider,
          timestamp: new Date().toISOString()
        });
      } else {
        showErrorToast('Failed to sign in with Google');
      }
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

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
