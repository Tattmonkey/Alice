import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  increment,
  getDocs,
  getDoc,
  writeBatch,
  serverTimestamp,
  limit,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { GalleryItem, GalleryFilter, GalleryStats, GalleryContextType } from '../types/gallery';
import toast from 'react-hot-toast';

const GalleryContext = createContext<GalleryContextType | null>(null);

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

const ITEMS_PER_PAGE = 20;

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [userItems, setUserItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [filter, setFilter] = useState<GalleryFilter>({
    sortBy: 'recent',
    isPublic: true
  });
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot | null>(null);

  // Subscribe to gallery items based on filter
  useEffect(() => {
    if (!user) return;

    let q = query(
      collection(db, 'galleryItems'),
      where('isPublic', '==', filter.isPublic ?? true),
      orderBy(filter.sortBy === 'recent' ? 'createdAt' : 'likes', 'desc'),
      limit(ITEMS_PER_PAGE)
    );

    if (filter.type) {
      q = query(q, where('type', '==', filter.type));
    }

    if (filter.tags?.length) {
      q = query(q, where('tags', 'array-contains-any', filter.tags));
    }

    if (filter.userId) {
      q = query(q, where('userId', '==', filter.userId));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const galleryData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as GalleryItem[];
        
        setItems(galleryData);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
        setLoading(false);
      },
      (err) => {
        console.error('Gallery subscription error:', err);
        setError('Failed to load gallery items');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, filter]);

  // Subscribe to user's personal gallery items
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'galleryItems'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userGalleryData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as GalleryItem[];
        
        setUserItems(userGalleryData);
      },
      (err) => {
        console.error('User gallery subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const loadMore = async () => {
    if (!lastVisible || !user) return;

    let q = query(
      collection(db, 'galleryItems'),
      where('isPublic', '==', filter.isPublic ?? true),
      orderBy(filter.sortBy === 'recent' ? 'createdAt' : 'likes', 'desc'),
      startAfter(lastVisible),
      limit(ITEMS_PER_PAGE)
    );

    if (filter.type) {
      q = query(q, where('type', '==', filter.type));
    }

    if (filter.tags?.length) {
      q = query(q, where('tags', 'array-contains-any', filter.tags));
    }

    if (filter.userId) {
      q = query(q, where('userId', '==', filter.userId));
    }

    try {
      const snapshot = await getDocs(q);
      const newItems = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as GalleryItem[];

      setItems(prev => [...prev, ...newItems]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      console.error('Error loading more items:', err);
      toast.error('Failed to load more items');
    }
  };

  const uploadItem = async (file: File, data: Partial<GalleryItem>): Promise<string> => {
    if (!user) throw new Error('Must be logged in to upload');
    
    try {
      // Upload image to Storage
      const timestamp = Date.now();
      const filename = `${user.id}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `gallery/${user.id}/${filename}`);
      
      const uploadResult = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Create gallery item in Firestore
      const itemData: Omit<GalleryItem, 'id'> = {
        userId: user.id,
        imageUrl,
        title: data.title || 'Untitled',
        description: data.description || '',
        tags: data.tags || [],
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: data.isPublic ?? true,
        type: data.type || 'design',
        metadata: {
          width: data.metadata?.width || 0,
          height: data.metadata?.height || 0,
          size: file.size,
          originalName: file.name
        }
      };

      const docRef = await addDoc(collection(db, 'galleryItems'), itemData);
      toast.success('Image uploaded successfully');
      
      return docRef.id;
    } catch (err) {
      console.error('Error uploading gallery item:', err);
      toast.error('Failed to upload image');
      throw err;
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!user) throw new Error('Must be logged in to delete');

    try {
      const itemRef = doc(db, 'galleryItems', itemId);
      const itemDoc = await getDoc(itemRef);

      if (!itemDoc.exists()) {
        throw new Error('Item not found');
      }

      const itemData = itemDoc.data() as GalleryItem;

      // Verify ownership
      if (itemData.userId !== user.id && user.role?.type !== 'admin') {
        throw new Error('Unauthorized to delete this item');
      }

      // Delete image from Storage
      const imageRef = ref(storage, itemData.imageUrl);
      await deleteObject(imageRef);

      // Delete document from Firestore
      await deleteDoc(itemRef);

      toast.success('Item deleted successfully');
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      toast.error('Failed to delete item');
      throw err;
    }
  };

  const updateItem = async (itemId: string, data: Partial<GalleryItem>) => {
    if (!user) throw new Error('Must be logged in to update');

    try {
      const itemRef = doc(db, 'galleryItems', itemId);
      const itemDoc = await getDoc(itemRef);

      if (!itemDoc.exists()) {
        throw new Error('Item not found');
      }

      const itemData = itemDoc.data() as GalleryItem;

      // Verify ownership
      if (itemData.userId !== user.id && user.role?.type !== 'admin') {
        throw new Error('Unauthorized to update this item');
      }

      await updateDoc(itemRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });

      toast.success('Item updated successfully');
    } catch (err) {
      console.error('Error updating gallery item:', err);
      toast.error('Failed to update item');
      throw err;
    }
  };

  const likeItem = async (itemId: string) => {
    if (!user) throw new Error('Must be logged in to like items');

    try {
      const itemRef = doc(db, 'galleryItems', itemId);
      await updateDoc(itemRef, {
        likes: increment(1),
        likedBy: [...(items.find(i => i.id === itemId)?.likedBy || []), user.id]
      });
    } catch (err) {
      console.error('Error liking item:', err);
      toast.error('Failed to like item');
      throw err;
    }
  };

  const unlikeItem = async (itemId: string) => {
    if (!user) throw new Error('Must be logged in to unlike items');

    try {
      const itemRef = doc(db, 'galleryItems', itemId);
      const item = items.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      await updateDoc(itemRef, {
        likes: increment(-1),
        likedBy: item.likedBy.filter(id => id !== user.id)
      });
    } catch (err) {
      console.error('Error unliking item:', err);
      toast.error('Failed to unlike item');
      throw err;
    }
  };

  const addComment = async (itemId: string, content: string) => {
    if (!user) throw new Error('Must be logged in to comment');

    try {
      const itemRef = doc(db, 'galleryItems', itemId);
      const comment = {
        id: `comment_${Date.now()}`,
        userId: user.id,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };

      await updateDoc(itemRef, {
        comments: [...(items.find(i => i.id === itemId)?.comments || []), comment]
      });
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
      throw err;
    }
  };

  const deleteComment = async (itemId: string, commentId: string) => {
    if (!user) throw new Error('Must be logged in to delete comments');

    try {
      const itemRef = doc(db, 'galleryItems', itemId);
      const item = items.find(i => i.id === itemId);
      if (!item) throw new Error('Item not found');

      const comment = item.comments.find(c => c.id === commentId);
      if (!comment) throw new Error('Comment not found');

      // Verify ownership or admin status
      if (comment.userId !== user.id && user.role?.type !== 'admin') {
        throw new Error('Unauthorized to delete this comment');
      }

      await updateDoc(itemRef, {
        comments: item.comments.filter(c => c.id !== commentId)
      });
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
      throw err;
    }
  };

  const refreshStats = async () => {
    if (!user) return;

    try {
      const snapshot = await getDocs(collection(db, 'galleryItems'));
      const allItems = snapshot.docs.map(doc => doc.data() as GalleryItem);

      // Calculate stats
      const stats: GalleryStats = {
        totalItems: allItems.length,
        totalLikes: allItems.reduce((sum, item) => sum + item.likes, 0),
        totalComments: allItems.reduce((sum, item) => sum + item.comments.length, 0),
        popularTags: calculatePopularTags(allItems),
        itemsByType: {
          tattoo: allItems.filter(item => item.type === 'tattoo').length,
          design: allItems.filter(item => item.type === 'design').length,
          inspiration: allItems.filter(item => item.type === 'inspiration').length
        }
      };

      setStats(stats);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      toast.error('Failed to refresh stats');
    }
  };

  const calculatePopularTags = (items: GalleryItem[]) => {
    const tagCounts = items.reduce((counts, item) => {
      item.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const value = {
    items,
    userItems,
    loading,
    error,
    stats,
    filter,
    uploadItem,
    deleteItem,
    updateItem,
    likeItem,
    unlikeItem,
    addComment,
    deleteComment,
    setFilter,
    refreshStats
  };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
}
