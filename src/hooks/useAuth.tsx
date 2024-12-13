import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  getUserById, 
  getArtistProfile, 
  subscribeToUserUpdates 
} from '../services/firebase/users';
import { User, ArtistProfile } from '../types';

interface AuthContextType {
  user: User | null;
  artistProfile: ArtistProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId: string) => {
    try {
      const userData = await getUserById(userId);
      setUser(userData);

      // If user is an artist, load artist profile
      if (userData.role?.type === 'artist' && userData.role.artistProfileId) {
        const profile = await getArtistProfile(userData.role.artistProfileId);
        setArtistProfile(profile);
      } else {
        setArtistProfile(null);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
      setArtistProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await loadUserData(firebaseUser.uid);
      } else {
        setUser(null);
        setArtistProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to user updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToUserUpdates(
      user.id,
      async (updatedUser) => {
        setUser(updatedUser);
        
        // Update artist profile if role changed
        if (updatedUser.role?.type === 'artist' && updatedUser.role.artistProfileId) {
          const profile = await getArtistProfile(updatedUser.role.artistProfileId);
          setArtistProfile(profile);
        } else {
          setArtistProfile(null);
        }
      },
      (error) => console.error('Error in user subscription:', error)
    );

    return () => unsubscribe();
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await loadUserData(credential.user.uid);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setArtistProfile(null);
  };

  const refreshUser = async () => {
    if (user?.id) {
      await loadUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        artistProfile,
        loading,
        signIn,
        signOut,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
