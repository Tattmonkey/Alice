import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from '../types';

interface AdminSetupConfig {
  email: string;
  password: string;
  name?: string;
}

export async function setupAdminUser({ email, password, name = 'Admin' }: AdminSetupConfig) {
  try {
    let uid: string;
    
    // Try to create new user first
    try {
      const newUser = await createUserWithEmailAndPassword(auth, email, password);
      uid = newUser.user.uid;
    } catch (error: any) {
      // If user exists, verify credentials
      if (error.code === 'auth/email-already-in-use') {
        const existingUser = await signInWithEmailAndPassword(auth, email, password);
        uid = existingUser.user.uid;
      } else {
        throw error;
      }
    }
    
    // Get existing user data if any
    const userDoc = await getDoc(doc(db, 'users', uid));
    const existingData = userDoc.exists() ? userDoc.data() : {};
    
    // Create admin user document
    const adminData: User = {
      id: uid,
      email,
      name: existingData.name || name,
      role: {
        type: 'admin',
        createdAt: new Date().toISOString(),
        permissions: [
          'manage_users',
          'manage_products',
          'manage_orders',
          'manage_content',
          'view_analytics',
          'manage_settings'
        ]
      },
      credits: existingData.credits || 999999, // High number of credits for admin
      cart: existingData.cart || [],
      creations: existingData.creations || [],
      bookings: existingData.bookings || []
    };

    // Set the document with merge to preserve any existing data
    await setDoc(doc(db, 'users', uid), adminData, { merge: true });
    
    console.log('Admin user setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error setting up admin user:', error);
    throw error;
  }
}
