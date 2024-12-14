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
  getDocs,
  getDoc,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { 
  Booking, 
  ArtistService, 
  ArtistAvailability, 
  BookingStats,
  DaySchedule,
  TimeSlot,
  BookingFilter,
  BookingContextType,
  BookingAttachment
} from '../types/booking';
import { addDays, format, parse, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';

const BookingContext = createContext<BookingContextType | null>(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [artistServices, setArtistServices] = useState<ArtistService[]>([]);
  const [availability, setAvailability] = useState<ArtistAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BookingStats | null>(null);

  // Subscribe to bookings
  useEffect(() => {
    if (!user) return;

    const isArtist = user.role?.type === 'artist';
    const field = isArtist ? 'artistId' : 'userId';

    const q = query(
      collection(db, 'bookings'),
      where(field, '==', user.id),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Booking[];
        
        setBookings(bookingData);
        setLoading(false);
      },
      (err) => {
        console.error('Bookings subscription error:', err);
        setError('Failed to load bookings');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to artist services
  useEffect(() => {
    if (!user || user.role?.type !== 'artist') return;

    const q = query(
      collection(db, 'artistServices'),
      where('artistId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const serviceData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as ArtistService[];
        
        setArtistServices(serviceData);
      },
      (err) => {
        console.error('Services subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to artist availability
  useEffect(() => {
    if (!user || user.role?.type !== 'artist') return;

    const q = query(
      collection(db, 'artistAvailability'),
      where('artistId', '==', user.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const availabilityData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as ArtistAvailability[];
        
        setAvailability(availabilityData);
      },
      (err) => {
        console.error('Availability subscription error:', err);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createBooking = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    if (!user) throw new Error('Must be logged in to create bookings');

    try {
      // Verify service exists and is active
      const serviceRef = doc(db, 'artistServices', data.serviceId);
      const serviceDoc = await getDoc(serviceRef);
      
      if (!serviceDoc.exists()) {
        throw new Error('Service not found');
      }

      const service = serviceDoc.data() as ArtistService;
      if (!service.active) {
        throw new Error('Service is not currently available');
      }

      // Verify artist availability
      const slots = await getArtistAvailability(
        data.artistId,
        data.date,
        data.date
      );

      const requestedSlot = slots[0]?.slots.find(
        slot => slot.startTime === data.startTime && slot.endTime === data.endTime
      );

      if (!requestedSlot?.available) {
        throw new Error('Selected time slot is not available');
      }

      // Create booking document
      const bookingData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      toast.success('Booking created successfully');
      
      return docRef.id;
    } catch (err) {
      console.error('Error creating booking:', err);
      toast.error('Failed to create booking');
      throw err;
    }
  };

  const updateBooking = async (bookingId: string, data: Partial<Booking>) => {
    if (!user) throw new Error('Must be logged in to update bookings');

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data() as Booking;

      // Verify user has permission
      if (booking.userId !== user.id && booking.artistId !== user.id && user.role?.type !== 'admin') {
        throw new Error('Unauthorized to update this booking');
      }

      await updateDoc(bookingRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });

      toast.success('Booking updated successfully');
    } catch (err) {
      console.error('Error updating booking:', err);
      toast.error('Failed to update booking');
      throw err;
    }
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    if (!user) throw new Error('Must be logged in to cancel bookings');

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data() as Booking;

      // Verify user has permission
      if (booking.userId !== user.id && booking.artistId !== user.id && user.role?.type !== 'admin') {
        throw new Error('Unauthorized to cancel this booking');
      }

      await updateDoc(bookingRef, {
        status: 'cancelled',
        notes: `${booking.notes ? booking.notes + '\n' : ''}Cancelled: ${reason}`,
        updatedAt: new Date().toISOString()
      });

      toast.success('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel booking');
      throw err;
    }
  };

  const getArtistAvailability = async (
    artistId: string,
    startDate: string,
    endDate: string
  ): Promise<DaySchedule[]> => {
    try {
      // Get artist's availability settings
      const availabilityQuery = query(
        collection(db, 'artistAvailability'),
        where('artistId', '==', artistId)
      );
      const availabilityDocs = await getDocs(availabilityQuery);
      const availabilitySettings = availabilityDocs.docs.map(
        doc => doc.data()
      ) as ArtistAvailability[];

      // Get existing bookings
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('artistId', '==', artistId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const bookingDocs = await getDocs(bookingsQuery);
      const existingBookings = bookingDocs.docs.map(
        doc => doc.data()
      ) as Booking[];

      // Generate schedule for each day
      const schedule: DaySchedule[] = [];
      let currentDate = new Date(startDate);
      const end = new Date(endDate);

      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Find availability settings for this day
        const dayAvailability = availabilitySettings.find(
          a => a.dayOfWeek === dayOfWeek
        );

        if (dayAvailability && dayAvailability.isAvailable) {
          // Generate time slots
          const slots: TimeSlot[] = [];
          let slotStart = parse(dayAvailability.startTime, 'HH:mm', currentDate);
          const slotEnd = parse(dayAvailability.endTime, 'HH:mm', currentDate);

          while (slotStart < slotEnd) {
            const startTimeStr = format(slotStart, 'HH:mm');
            const endTimeStr = format(addDays(slotStart, 30), 'HH:mm');

            // Check if slot conflicts with existing bookings
            const conflictingBooking = existingBookings.find(booking => 
              booking.date === dateStr &&
              isWithinInterval(parse(startTimeStr, 'HH:mm', currentDate), {
                start: parse(booking.startTime, 'HH:mm', currentDate),
                end: parse(booking.endTime, 'HH:mm', currentDate)
              })
            );

            slots.push({
              startTime: startTimeStr,
              endTime: endTimeStr,
              available: !conflictingBooking,
              existingBooking: conflictingBooking
            });

            slotStart = addDays(slotStart, 30);
          }

          schedule.push({
            date: dateStr,
            slots,
            isAvailable: true,
            totalBookings: existingBookings.filter(b => b.date === dateStr).length
          });
        } else {
          schedule.push({
            date: dateStr,
            slots: [],
            isAvailable: false,
            totalBookings: 0
          });
        }

        currentDate = addDays(currentDate, 1);
      }

      return schedule;
    } catch (err) {
      console.error('Error getting artist availability:', err);
      throw err;
    }
  };

  const createService = async (data: Omit<ArtistService, 'id'>): Promise<string> => {
    if (!user || user.role?.type !== 'artist') {
      throw new Error('Must be an artist to create services');
    }

    try {
      const docRef = await addDoc(collection(db, 'artistServices'), {
        ...data,
        artistId: user.id
      });

      toast.success('Service created successfully');
      return docRef.id;
    } catch (err) {
      console.error('Error creating service:', err);
      toast.error('Failed to create service');
      throw err;
    }
  };

  const updateService = async (serviceId: string, data: Partial<ArtistService>) => {
    if (!user || user.role?.type !== 'artist') {
      throw new Error('Must be an artist to update services');
    }

    try {
      const serviceRef = doc(db, 'artistServices', serviceId);
      const serviceDoc = await getDoc(serviceRef);

      if (!serviceDoc.exists()) {
        throw new Error('Service not found');
      }

      const service = serviceDoc.data() as ArtistService;

      if (service.artistId !== user.id) {
        throw new Error('Unauthorized to update this service');
      }

      await updateDoc(serviceRef, data);
      toast.success('Service updated successfully');
    } catch (err) {
      console.error('Error updating service:', err);
      toast.error('Failed to update service');
      throw err;
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!user || user.role?.type !== 'artist') {
      throw new Error('Must be an artist to delete services');
    }

    try {
      const serviceRef = doc(db, 'artistServices', serviceId);
      const serviceDoc = await getDoc(serviceRef);

      if (!serviceDoc.exists()) {
        throw new Error('Service not found');
      }

      const service = serviceDoc.data() as ArtistService;

      if (service.artistId !== user.id) {
        throw new Error('Unauthorized to delete this service');
      }

      // Check for existing bookings using this service
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('serviceId', '==', serviceId),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const bookingDocs = await getDocs(bookingsQuery);

      if (!bookingDocs.empty) {
        throw new Error('Cannot delete service with active bookings');
      }

      await deleteDoc(serviceRef);
      toast.success('Service deleted successfully');
    } catch (err) {
      console.error('Error deleting service:', err);
      toast.error('Failed to delete service');
      throw err;
    }
  };

  const updateAvailability = async (availabilityId: string, data: Partial<ArtistAvailability>) => {
    if (!user || user.role?.type !== 'artist') {
      throw new Error('Must be an artist to update availability');
    }

    try {
      const availabilityRef = doc(db, 'artistAvailability', availabilityId);
      await updateDoc(availabilityRef, data);
      toast.success('Availability updated successfully');
    } catch (err) {
      console.error('Error updating availability:', err);
      toast.error('Failed to update availability');
      throw err;
    }
  };

  const addAttachment = async (bookingId: string, file: File) => {
    if (!user) throw new Error('Must be logged in to add attachments');

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data() as Booking;

      // Verify user has permission
      if (booking.userId !== user.id && booking.artistId !== user.id) {
        throw new Error('Unauthorized to add attachments to this booking');
      }

      // Upload file
      const timestamp = Date.now();
      const filename = `${bookingId}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `booking-attachments/${bookingId}/${filename}`);
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Add attachment to booking
      const attachment: BookingAttachment = {
        id: `${timestamp}`,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };

      await updateDoc(bookingRef, {
        attachments: [...(booking.attachments || []), attachment],
        updatedAt: new Date().toISOString()
      });

      toast.success('Attachment added successfully');
    } catch (err) {
      console.error('Error adding attachment:', err);
      toast.error('Failed to add attachment');
      throw err;
    }
  };

  const removeAttachment = async (bookingId: string, attachmentId: string) => {
    if (!user) throw new Error('Must be logged in to remove attachments');

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const booking = bookingDoc.data() as Booking;

      // Verify user has permission
      if (booking.userId !== user.id && booking.artistId !== user.id) {
        throw new Error('Unauthorized to remove attachments from this booking');
      }

      const attachment = booking.attachments?.find(a => a.id === attachmentId);
      if (!attachment) {
        throw new Error('Attachment not found');
      }

      // Delete file from storage
      const filename = attachment.url.split('/').pop();
      if (filename) {
        const storageRef = ref(storage, `booking-attachments/${bookingId}/${filename}`);
        await deleteObject(storageRef);
      }

      // Remove attachment from booking
      await updateDoc(bookingRef, {
        attachments: booking.attachments?.filter(a => a.id !== attachmentId) || [],
        updatedAt: new Date().toISOString()
      });

      toast.success('Attachment removed successfully');
    } catch (err) {
      console.error('Error removing attachment:', err);
      toast.error('Failed to remove attachment');
      throw err;
    }
  };

  const getBookingStats = async (filter?: BookingFilter): Promise<BookingStats> => {
    try {
      let q = query(collection(db, 'bookings'));

      if (filter?.status) {
        q = query(q, where('status', 'in', filter.status));
      }
      if (filter?.startDate) {
        q = query(q, where('date', '>=', filter.startDate));
      }
      if (filter?.endDate) {
        q = query(q, where('date', '<=', filter.endDate));
      }
      if (filter?.artistId) {
        q = query(q, where('artistId', '==', filter.artistId));
      }
      if (filter?.userId) {
        q = query(q, where('userId', '==', filter.userId));
      }
      if (filter?.serviceId) {
        q = query(q, where('serviceId', '==', filter.serviceId));
      }

      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => doc.data() as Booking);

      // Calculate stats
      const stats: BookingStats = {
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        noShows: bookings.filter(b => b.status === 'no_show').length,
        totalRevenue: bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.price, 0),
        averageRating: 0, // TODO: Implement ratings
        popularServices: [],
        bookingsByStatus: {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
          no_show: 0
        },
        bookingsByMonth: []
      };

      // Calculate bookings by status
      bookings.forEach(booking => {
        stats.bookingsByStatus[booking.status]++;
      });

      // Calculate bookings by month
      const monthlyData = bookings.reduce((acc, booking) => {
        const month = booking.date.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = { bookings: 0, revenue: 0 };
        }
        acc[month].bookings++;
        if (booking.status === 'completed') {
          acc[month].revenue += booking.price;
        }
        return acc;
      }, {} as Record<string, { bookings: number; revenue: number }>);

      stats.bookingsByMonth = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          bookings: data.bookings,
          revenue: data.revenue
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // Calculate popular services
      const serviceBookings = bookings.reduce((acc, booking) => {
        if (!acc[booking.serviceId]) {
          acc[booking.serviceId] = { bookings: 0, name: '' };
        }
        acc[booking.serviceId].bookings++;
        return acc;
      }, {} as Record<string, { bookings: number; name: string }>);

      // Get service names
      for (const serviceId of Object.keys(serviceBookings)) {
        const serviceDoc = await getDoc(doc(db, 'artistServices', serviceId));
        if (serviceDoc.exists()) {
          const service = serviceDoc.data() as ArtistService;
          serviceBookings[serviceId].name = service.name;
        }
      }

      stats.popularServices = Object.entries(serviceBookings)
        .map(([serviceId, data]) => ({
          serviceId,
          name: data.name,
          bookings: data.bookings
        }))
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      return stats;
    } catch (err) {
      console.error('Error getting booking stats:', err);
      throw err;
    }
  };

  const refreshStats = async () => {
    try {
      const newStats = await getBookingStats();
      setStats(newStats);
    } catch (err) {
      console.error('Error refreshing stats:', err);
      toast.error('Failed to refresh stats');
    }
  };

  const value = {
    bookings,
    artistServices,
    availability,
    loading,
    error,
    stats,
    createBooking,
    updateBooking,
    cancelBooking,
    getArtistAvailability,
    createService,
    updateService,
    deleteService,
    updateAvailability,
    addAttachment,
    removeAttachment,
    getBookingStats,
    refreshStats
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}
