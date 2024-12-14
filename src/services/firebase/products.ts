import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  orderBy,
  limit,
  startAfter,
  getDoc,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Product, ProductReview, ProductVariant } from '../../types';

const PRODUCTS_COLLECTION = 'products';
const BATCH_SIZE = 20;

// Product CRUD Operations
export const getAllProducts = async (
  category?: string,
  lastProduct?: Product,
  batchSize: number = BATCH_SIZE,
  filters: Partial<Product> = {}
) => {
  try {
    let q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('status', '==', 'active')
    );

    if (category) {
      q = query(q, where('category', '==', category));
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        q = query(q, where(key, '==', value));
      }
    });

    q = query(q, orderBy('createdAt', 'desc'));

    if (lastProduct) {
      q = query(q, startAfter(lastProduct.createdAt), limit(batchSize));
    } else {
      q = query(q, limit(batchSize));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
};

export const searchProducts = async (
  searchTerm: string,
  category?: string,
  lastProduct?: Product,
  batchSize: number = BATCH_SIZE
) => {
  try {
    // Note: This is a simple implementation. For better search, consider using
    // a dedicated search service like Algolia or Elasticsearch
    const searchTermLower = searchTerm.toLowerCase();
    let q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('status', '==', 'active')
    );

    if (category) {
      q = query(q, where('category', '==', category));
    }

    if (lastProduct) {
      q = query(q, startAfter(lastProduct.createdAt), limit(batchSize));
    } else {
      q = query(q, limit(batchSize));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product))
      .filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        product.description.toLowerCase().includes(searchTermLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, PRODUCTS_COLLECTION, productId));
    if (!productDoc.exists()) {
      return null;
    }
    return {
      id: productDoc.id,
      ...productDoc.data()
    } as Product;
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    // Validate SKU uniqueness
    const existingProducts = await getDocs(
      query(collection(db, PRODUCTS_COLLECTION), where('sku', '==', product.sku))
    );
    if (!existingProducts.empty) {
      throw new Error('SKU already exists');
    }

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      status: 'active',
      averageRating: 0,
      reviews: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: string,
  updates: Partial<Product>
) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const product = await getDoc(productRef);
    
    if (!product.exists()) {
      throw new Error('Product not found');
    }

    // If updating SKU, check uniqueness
    if (updates.sku && updates.sku !== product.data().sku) {
      const existingProducts = await getDocs(
        query(collection(db, PRODUCTS_COLLECTION), where('sku', '==', updates.sku))
      );
      if (!existingProducts.empty) {
        throw new Error('SKU already exists');
      }
    }

    await updateDoc(productRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const product = await getDoc(productRef);
    
    if (!product.exists()) {
      throw new Error('Product not found');
    }

    // Soft delete by updating status
    await updateDoc(productRef, {
      status: 'inactive',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Inventory Management
export const updateInventory = async (
  productId: string,
  quantity: number,
  variantId?: string
) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const product = await getDoc(productRef);
    
    if (!product.exists()) {
      throw new Error('Product not found');
    }

    const batch = writeBatch(db);

    if (variantId) {
      const variants = product.data().variants || [];
      const variantIndex = variants.findIndex((v: ProductVariant) => v.id === variantId);
      
      if (variantIndex === -1) {
        throw new Error('Variant not found');
      }

      const newStock = variants[variantIndex].stock + quantity;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      variants[variantIndex].stock = newStock;
      batch.update(productRef, {
        variants,
        updatedAt: serverTimestamp()
      });
    } else {
      const newStock = product.data().stock + quantity;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      batch.update(productRef, {
        stock: newStock,
        status: newStock === 0 ? 'out_of_stock' : 'active',
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

// Product Reviews
export const addProductReview = async (
  productId: string,
  review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt' | 'helpful'>
) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const product = await getDoc(productRef);
    
    if (!product.exists()) {
      throw new Error('Product not found');
    }

    const newReview: ProductReview = {
      id: Date.now().toString(),
      ...review,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const reviews = product.data().reviews || [];
    const totalRatings = reviews.length;
    const currentRating = product.data().averageRating || 0;
    const newAverageRating = 
      (currentRating * totalRatings + review.rating) / (totalRatings + 1);

    await updateDoc(productRef, {
      reviews: [...reviews, newReview],
      averageRating: newAverageRating,
      updatedAt: serverTimestamp()
    });

    return newReview;
  } catch (error) {
    console.error('Error adding product review:', error);
    throw error;
  }
};

export const updateReviewHelpfulness = async (
  productId: string,
  reviewId: string,
  increment: number
) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const product = await getDoc(productRef);
    
    if (!product.exists()) {
      throw new Error('Product not found');
    }

    const reviews = product.data().reviews || [];
    const reviewIndex = reviews.findIndex((r: ProductReview) => r.id === reviewId);
    
    if (reviewIndex === -1) {
      throw new Error('Review not found');
    }

    reviews[reviewIndex].helpful += increment;
    await updateDoc(productRef, {
      reviews,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating review helpfulness:', error);
    throw error;
  }
};

// Real-time Subscriptions
export const subscribeToProducts = (
  onUpdate: (products: Product[]) => void,
  onError: (error: Error) => void,
  category?: string
) => {
  let q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );

  if (category) {
    q = query(q, where('category', '==', category));
  }

  return onSnapshot(
    q,
    (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      onUpdate(products);
    },
    onError
  );
};
