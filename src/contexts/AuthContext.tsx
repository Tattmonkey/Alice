import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { switchToArtist } from '../services/firebase/users';

interface AuthContextType {
  user: User | null;
  userDetails: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  convertToArtist: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          setUser(user);
          if (user) {
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                setUserDetails(userDoc.data());
              } else {
                // Create user document if it doesn't exist (for Google Sign-In)
                await setDoc(doc(db, 'users', user.uid), {
                  name: user.displayName || '',
                  email: user.email || '',
                  credits: 0,
                  isArtist: false,
                  createdAt: new Date().toISOString(),
                });
                setUserDetails({
                  name: user.displayName || '',
                  email: user.email || '',
                  credits: 0,
                  isArtist: false,
                  createdAt: new Date().toISOString(),
                });
              }
            } catch (error) {
              console.error('Error fetching user details:', error);
            }
          } else {
            setUserDetails(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        credits: 0,
        isArtist: false,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error in logout:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error in reset password:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      setUserDetails((prev: any) => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error in Google sign in:', error);
      throw error;
    }
  };

  const convertToArtist = async () => {
    if (!user) throw new Error('No user logged in');
    try {
      await switchToArtist(user.uid, {
        displayName: userDetails.name,
        bio: '',
        specialties: [],
        experience: '',
        portfolio: [],
        hourlyRate: 0,
      });
      // Refresh user details
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserDetails(userDoc.data());
      }
    } catch (error) {
      console.error('Error converting to artist:', error);
      throw error;
    }
  };

  const value = {
    user,
    userDetails,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    signInWithGoogle,
    convertToArtist,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}