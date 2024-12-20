import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole, UserPreferences } from '../types';
import toast from 'react-hot-toast';

const ADMIN_EMAILS = ['washington@alicetattoos.com', 'support@alicetattoos.com'];

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  convertToUser: () => Promise<void>;
  convertToArtist: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

async function createOrGetUser(firebaseUser: FirebaseUser) {
  const isAdminUser = ADMIN_EMAILS.includes(firebaseUser.email || '');
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const userRole: UserRole = {
      type: (userData.role?.type as 'user' | 'artist' | 'admin') || (isAdminUser ? 'admin' : 'user')
    };

    const userPreferences: UserPreferences = {
      notifications: {
        email: true,
        push: true,
        bookingUpdates: true,
        marketingEmails: false
      },
      theme: 'light',
      language: 'en'
    };

    return {
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData.name || firebaseUser.displayName || 'User',
        role: userRole,
        credits: userData.credits || 0,
        profileImage: userData.profileImage || firebaseUser.photoURL,
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        isEmailVerified: firebaseUser.emailVerified,
        preferences: userData.preferences || userPreferences
      } as User,
      isAdmin: isAdminUser
    };
  }

  // Create new user document
  const userRole: UserRole = {
    type: isAdminUser ? 'admin' : 'user'
  };

  const userPreferences: UserPreferences = {
    notifications: {
      email: true,
      push: true,
      bookingUpdates: true,
      marketingEmails: false
    },
    theme: 'light',
    language: 'en'
  };

  const newUser: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || 'User',
    role: userRole,
    credits: 0,
    profileImage: firebaseUser.photoURL || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    isEmailVerified: firebaseUser.emailVerified,
    preferences: userPreferences
  };

  await setDoc(userRef, newUser);
  return { user: newUser, isAdmin: isAdminUser };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const { user, isAdmin } = await createOrGetUser(firebaseUser);
          setUser(user);
          setIsAdmin(isAdmin);
        } catch (error) {
          console.error('Error setting up user:', error);
          toast.error('Error loading user data');
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const { user, isAdmin } = await createOrGetUser(result.user);
      setUser(user);
      setIsAdmin(isAdmin);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in');
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const { user, isAdmin } = await createOrGetUser(result.user);
      setUser(user);
      setIsAdmin(isAdmin);
      toast.success('Successfully signed in with Google!');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
      toast.success('Successfully logged out');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to log out');
      throw error;
    }
  };

  const convertToUser = async () => {
    if (!user) {
      toast.error('No user logged in');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.id);
      const newRole: UserRole = {
        type: 'user'
      };
      await updateDoc(userRef, { role: newRole });
      setUser(prev => prev ? { ...prev, role: newRole } : null);
      toast.success('Successfully converted to user');
    } catch (error: any) {
      console.error('Error converting to user:', error);
      toast.error(error.message || 'Failed to convert to user');
      throw error;
    }
  };

  const convertToArtist = async () => {
    if (!user) {
      toast.error('No user logged in');
      return;
    }

    try {
      const userRef = doc(db, 'users', user.id);
      const newRole: UserRole = {
        type: 'artist'
      };
      await updateDoc(userRef, { role: newRole });
      setUser(prev => prev ? { ...prev, role: newRole } : null);
      toast.success('Successfully converted to artist');
    } catch (error: any) {
      console.error('Error converting to artist:', error);
      toast.error(error.message || 'Failed to convert to artist');
      throw error;
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    loginWithGoogle,
    logout,
    convertToUser,
    convertToArtist
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
