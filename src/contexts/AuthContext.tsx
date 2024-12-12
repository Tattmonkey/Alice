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
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { User } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserCredits: (userId: string, credits: number) => Promise<void>;
  addToCart: (product: any) => Promise<any>;
  removeFromCart: (productId: string) => Promise<any>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<any>;
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

  const addToCart = async (product: any) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.id);
      const cart = user.cart;
      const productIndex = cart.findIndex((item: any) => item.id === product.id);
      if (productIndex !== -1) {
        cart[productIndex].quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      await setDoc(userRef, { cart }, { merge: true });
      setUser(prev => prev ? { ...prev, cart } : null);
      toast.success('Product added to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.id);
      const cart = user.cart;
      const productIndex = cart.findIndex((item: any) => item.id === productId);
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

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    if (!user) throw new Error('No user logged in');

    try {
      const userRef = doc(db, 'users', user.id);
      const cart = user.cart;
      const productIndex = cart.findIndex((item: any) => item.id === productId);
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

  const value = {
    user,
    loading,
    isAdmin: false,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserCredits,
    addToCart,
    removeFromCart,
    updateCartItemQuantity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}