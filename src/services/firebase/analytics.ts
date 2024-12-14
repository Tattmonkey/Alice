import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp,
  increment,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const ANALYTICS_COLLECTION = 'analytics';
const EVENTS_COLLECTION = 'events';
const USER_STATS_COLLECTION = 'userStats';
const ARTIST_STATS_COLLECTION = 'artistStats';
const PRODUCT_STATS_COLLECTION = 'productStats';

interface AnalyticsEvent {
  type: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

interface UserStats {
  userId: string;
  totalBookings: number;
  completedBookings: number;
  totalSpent: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ArtistStats {
  artistId: string;
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  totalRatings: number;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductStats {
  productId: string;
  views: number;
  purchases: number;
  revenue: number;
  averageRating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

// Track events
export const trackEvent = async (
  type: string,
  userId?: string,
  data: Record<string, any> = {}
) => {
  try {
    const event: AnalyticsEvent = {
      type,
      userId,
      data,
      timestamp: new Date()
    };

    await addDoc(collection(db, EVENTS_COLLECTION), event);
  } catch (error) {
    console.error('Error tracking event:', error);
    throw error;
  }
};

// User Stats
export const updateUserStats = async (
  userId: string,
  updates: Partial<UserStats>
) => {
  try {
    const userStatsRef = doc(db, USER_STATS_COLLECTION, userId);
    const userStats = await getDoc(userStatsRef);

    if (!userStats.exists()) {
      // Create new stats document
      await addDoc(collection(db, USER_STATS_COLLECTION), {
        userId,
        totalBookings: 0,
        completedBookings: 0,
        totalSpent: 0,
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updates
      });
    } else {
      // Update existing stats
      await updateDoc(userStatsRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const userStatsDoc = await getDoc(doc(db, USER_STATS_COLLECTION, userId));
    if (!userStatsDoc.exists()) {
      return null;
    }
    return userStatsDoc.data() as UserStats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Artist Stats
export const updateArtistStats = async (
  artistId: string,
  updates: Partial<ArtistStats>
) => {
  try {
    const artistStatsRef = doc(db, ARTIST_STATS_COLLECTION, artistId);
    const artistStats = await getDoc(artistStatsRef);

    if (!artistStats.exists()) {
      // Create new stats document
      await addDoc(collection(db, ARTIST_STATS_COLLECTION), {
        artistId,
        totalBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
        averageRating: 0,
        totalRatings: 0,
        lastActive: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updates
      });
    } else {
      // Update existing stats
      await updateDoc(artistStatsRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating artist stats:', error);
    throw error;
  }
};

export const getArtistStats = async (artistId: string): Promise<ArtistStats | null> => {
  try {
    const artistStatsDoc = await getDoc(doc(db, ARTIST_STATS_COLLECTION, artistId));
    if (!artistStatsDoc.exists()) {
      return null;
    }
    return artistStatsDoc.data() as ArtistStats;
  } catch (error) {
    console.error('Error getting artist stats:', error);
    throw error;
  }
};

// Product Stats
export const updateProductStats = async (
  productId: string,
  updates: Partial<ProductStats>
) => {
  try {
    const productStatsRef = doc(db, PRODUCT_STATS_COLLECTION, productId);
    const productStats = await getDoc(productStatsRef);

    if (!productStats.exists()) {
      // Create new stats document
      await addDoc(collection(db, PRODUCT_STATS_COLLECTION), {
        productId,
        views: 0,
        purchases: 0,
        revenue: 0,
        averageRating: 0,
        totalRatings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updates
      });
    } else {
      // Update existing stats
      await updateDoc(productStatsRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating product stats:', error);
    throw error;
  }
};

export const getProductStats = async (productId: string): Promise<ProductStats | null> => {
  try {
    const productStatsDoc = await getDoc(doc(db, PRODUCT_STATS_COLLECTION, productId));
    if (!productStatsDoc.exists()) {
      return null;
    }
    return productStatsDoc.data() as ProductStats;
  } catch (error) {
    console.error('Error getting product stats:', error);
    throw error;
  }
};

// Analytics Queries
export const getTopArtists = async (limit: number = 10): Promise<ArtistStats[]> => {
  try {
    const q = query(
      collection(db, ARTIST_STATS_COLLECTION),
      where('completedBookings', '>', 0),
      where('averageRating', '>', 0)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => doc.data() as ArtistStats)
      .sort((a, b) => {
        // Sort by a combination of ratings and completed bookings
        const aScore = a.averageRating * Math.log(a.completedBookings + 1);
        const bScore = b.averageRating * Math.log(b.completedBookings + 1);
        return bScore - aScore;
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top artists:', error);
    throw error;
  }
};

export const getTopProducts = async (limit: number = 10): Promise<ProductStats[]> => {
  try {
    const q = query(
      collection(db, PRODUCT_STATS_COLLECTION),
      where('purchases', '>', 0)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => doc.data() as ProductStats)
      .sort((a, b) => b.purchases - a.purchases)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top products:', error);
    throw error;
  }
};

// Event Analysis
export const getEventsByType = async (
  type: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsEvent[]> => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('type', '==', type),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as AnalyticsEvent);
  } catch (error) {
    console.error('Error getting events by type:', error);
    throw error;
  }
};

export const getUserEvents = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsEvent[]> => {
  try {
    const q = query(
      collection(db, EVENTS_COLLECTION),
      where('userId', '==', userId),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as AnalyticsEvent);
  } catch (error) {
    console.error('Error getting user events:', error);
    throw error;
  }
};
