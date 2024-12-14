import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { PaymentDetails, PaymentStatus, Order, Booking } from '../../types';

const PAYMENTS_COLLECTION = 'payments';
const ORDERS_COLLECTION = 'orders';
const BOOKINGS_COLLECTION = 'bookings';

export const createPayment = async (
  amount: number,
  currency: string,
  method: string,
  orderId?: string,
  bookingId?: string
) => {
  try {
    // Here you would typically integrate with a payment provider like Stripe
    // This is a simplified version
    const payment: Omit<PaymentDetails, 'id'> = {
      amount,
      currency,
      method: method as any,
      status: 'pending',
      provider: 'stripe', // Replace with actual provider
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), payment);
    const paymentId = docRef.id;

    // Update the associated order or booking
    const batch = writeBatch(db);

    if (orderId) {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      batch.update(orderRef, {
        'payment.id': paymentId,
        'payment.status': 'pending',
        updatedAt: serverTimestamp()
      });
    }

    if (bookingId) {
      const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      batch.update(bookingRef, {
        'payment.id': paymentId,
        'payment.status': 'pending',
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
    return paymentId;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

export const processPayment = async (paymentId: string) => {
  try {
    // Here you would typically process the payment through your payment provider
    // This is a simplified version
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const payment = await getDoc(paymentRef);

    if (!payment.exists()) {
      throw new Error('Payment not found');
    }

    // Simulate payment processing
    await updateDoc(paymentRef, {
      status: 'completed',
      transactionId: `tr_${Date.now()}`,
      updatedAt: serverTimestamp()
    });

    // Update associated order or booking
    const batch = writeBatch(db);

    // Find and update associated order
    const orderSnapshot = await getDocs(
      query(collection(db, ORDERS_COLLECTION), where('payment.id', '==', paymentId))
    );

    orderSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        'payment.status': 'completed',
        status: 'processing',
        updatedAt: serverTimestamp()
      });
    });

    // Find and update associated booking
    const bookingSnapshot = await getDocs(
      query(collection(db, BOOKINGS_COLLECTION), where('payment.id', '==', paymentId))
    );

    bookingSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        'payment.status': 'completed',
        status: 'accepted',
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export const refundPayment = async (paymentId: string, amount?: number) => {
  try {
    // Here you would typically process the refund through your payment provider
    // This is a simplified version
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const payment = await getDoc(paymentRef);

    if (!payment.exists()) {
      throw new Error('Payment not found');
    }

    if (payment.data().status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    const refundAmount = amount || payment.data().amount;
    const refundId = `rf_${Date.now()}`;

    await updateDoc(paymentRef, {
      status: 'refunded',
      refundId,
      updatedAt: serverTimestamp()
    });

    // Update associated order or booking
    const batch = writeBatch(db);

    // Find and update associated order
    const orderSnapshot = await getDocs(
      query(collection(db, ORDERS_COLLECTION), where('payment.id', '==', paymentId))
    );

    orderSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        'payment.status': 'refunded',
        status: 'refunded',
        updatedAt: serverTimestamp()
      });
    });

    // Find and update associated booking
    const bookingSnapshot = await getDocs(
      query(collection(db, BOOKINGS_COLLECTION), where('payment.id', '==', paymentId))
    );

    bookingSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        'payment.status': 'refunded',
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    return refundId;
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
};

export const getPaymentById = async (paymentId: string): Promise<PaymentDetails | null> => {
  try {
    const paymentDoc = await getDoc(doc(db, PAYMENTS_COLLECTION, paymentId));
    if (!paymentDoc.exists()) {
      return null;
    }
    return {
      id: paymentDoc.id,
      ...paymentDoc.data()
    } as PaymentDetails;
  } catch (error) {
    console.error('Error getting payment:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  transactionId?: string
) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const payment = await getDoc(paymentRef);

    if (!payment.exists()) {
      throw new Error('Payment not found');
    }

    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (transactionId) {
      updates.transactionId = transactionId;
    }

    await updateDoc(paymentRef, updates);

    // Update associated order or booking
    const batch = writeBatch(db);

    // Find and update associated order
    const orderSnapshot = await getDocs(
      query(collection(db, ORDERS_COLLECTION), where('payment.id', '==', paymentId))
    );

    orderSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        'payment.status': status,
        updatedAt: serverTimestamp()
      });
    });

    // Find and update associated booking
    const bookingSnapshot = await getDocs(
      query(collection(db, BOOKINGS_COLLECTION), where('payment.id', '==', paymentId))
    );

    bookingSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        'payment.status': status,
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};
