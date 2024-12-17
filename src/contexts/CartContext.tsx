import React, { createContext, useContext, useState, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/init';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = useCallback(async (item: CartItem) => {
    try {
      const existingItem = items.find(i => i.id === item.id);
      let updatedItems: CartItem[];

      if (existingItem) {
        updatedItems = items.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updatedItems = [...items, { ...item, quantity: 1 }];
      }

      setItems(updatedItems);

      // Update user's cart in Firestore if logged in
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { cart: updatedItems });
      }

      toast.success(`${item.name} added to cart`);
    } catch (error) {
      console.error('[Cart] Add item error:', error);
      toast.error('Failed to add item to cart');
    }
  }, [items, user]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);

      // Update user's cart in Firestore if logged in
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { cart: updatedItems });
      }

      toast.success('Item removed from cart');
    } catch (error) {
      console.error('[Cart] Remove item error:', error);
      toast.error('Failed to remove item from cart');
    }
  }, [items, user]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeItem(itemId);
        return;
      }

      const updatedItems = items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );

      setItems(updatedItems);

      // Update user's cart in Firestore if logged in
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { cart: updatedItems });
      }
    } catch (error) {
      console.error('[Cart] Update quantity error:', error);
      toast.error('Failed to update item quantity');
    }
  }, [items, user, removeItem]);

  const clearCart = useCallback(async () => {
    try {
      setItems([]);

      // Update user's cart in Firestore if logged in
      if (user) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, { cart: [] });
      }

      toast.success('Cart cleared');
    } catch (error) {
      console.error('[Cart] Clear cart error:', error);
      toast.error('Failed to clear cart');
    }
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
