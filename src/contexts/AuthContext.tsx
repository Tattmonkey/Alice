import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface User extends FirebaseUser {
  role?: {
    type: 'user' | 'artist' | 'admin';
    verified: boolean;
    createdAt: string;
  };
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserRole: (userId: string, role: User['role']) => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          setCurrentUser({
            ...user,
            role: userData?.role || {
              type: 'user',
              verified: false,
              createdAt: new Date().toISOString()
            }
          } as User);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: {
            type: 'user',
            verified: false,
            createdAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        });
      }

      // Force refresh the token to ensure we have the latest claims
      await result.user.getIdToken(true);
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        role: {
          type: 'user',
          verified: false,
          createdAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    try {
      await setDoc(doc(db, 'users', userId), { role }, { merge: true });
    } catch (error: any) {
      console.error('Update role error:', error);
      throw new Error('Failed to update user role');
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email is already in use';
      case 'auth/weak-password':
        return 'Password is too weak';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return 'An error occurred during authentication';
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
