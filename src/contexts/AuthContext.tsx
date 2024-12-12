import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { User, Creation, Download, CartItem } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  addCredits: (amount: number) => Promise<void>;
  switchToArtist: () => Promise<void>;
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
  const navigate = useNavigate();

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = doc(db, 'users', firebaseUser.uid);
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          credits: 5,
          isArtist: false,
          creations: [],
          downloads: [],
          cart: []
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
        uid: userCredential.user.uid,
        email,
        name,
        credits: 5,
        isArtist: false,
        creations: [],
        downloads: [],
        cart: []
      };
      
      const userDoc = doc(db, 'users', userData.uid);
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
        uid: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || result.user.email?.split('@')[0] || '',
        credits: 5,
        isArtist: false,
        creations: [],
        downloads: [],
        cart: []
      };

      const userDoc = doc(db, 'users', userData.uid);
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

  const signOut = async () => {
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

  const addToCart = async (item: CartItem) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.uid);
      const cart = user.cart;
      const productIndex = cart.findIndex((cartItem: CartItem) => cartItem.id === item.id);
      if (productIndex !== -1) {
        cart[productIndex].quantity += 1;
      } else {
        cart.push({ ...item, quantity: 1 });
      }
      await setDoc(userRef, { cart }, { merge: true });
      setUser(prev => prev ? { ...prev, cart } : null);
      toast.success('Product added to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.uid);
      const cart = user.cart;
      const productIndex = cart.findIndex((item: CartItem) => item.id === itemId);
      if (productIndex !== -1) {
        cart.splice(productIndex, 1);
      }
      await setDoc(userRef, { cart }, { merge: true });
      setUser(prev => prev ? { ...prev, cart } : null);
      toast.success('Product removed from cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.uid);
      const cart = user.cart;
      const productIndex = cart.findIndex((item: CartItem) => item.id === itemId);
      if (productIndex !== -1) {
        cart[productIndex].quantity = quantity;
      }
      await setDoc(userRef, { cart }, { merge: true });
      setUser(prev => prev ? { ...prev, cart } : null);
      toast.success('Cart item quantity updated');
    } catch (error) {
      console.error('Update cart item quantity error:', error);
      throw error;
    }
  };

  const addCredits = async (amount: number) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: increment(amount)
      });
      setUser(prev => prev ? { ...prev, credits: prev.credits + amount } : null);
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  };

  const switchToArtist = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isArtist: true
      });
      setUser(prev => prev ? { ...prev, isArtist: true } : null);
    } catch (error) {
      console.error('Error converting to artist:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    addCredits,
    switchToArtist
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}