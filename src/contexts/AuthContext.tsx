import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { toast } from 'react-toastify';

interface User extends FirebaseUser {
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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserRole: (userId: string, role: User['role']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          toast.error('Error loading user data');
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
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in');
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        role: {
          type: 'user',
          verified: false,
          createdAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString()
      });

      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Failed to create account');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document for Google sign-in
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          role: {
            type: 'user',
            verified: false,
            createdAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString()
        });
      }

      toast.success('Successfully signed in with Google!');
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Failed to send reset email');
      throw error;
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    try {
      await setDoc(doc(db, 'users', userId), { role }, { merge: true });
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Update role error:', error);
      toast.error('Failed to update user role');
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
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

export { AuthContext, useAuth, AuthProvider };
