import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getBookingsByArtist, 
  updateBooking, 
  subscribeToBookings 
} from '../../services/firebase/bookings';
import { Booking } from '../../types';

export default function BookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToBookings(
      user.id,
      (updatedBookings) => {
        setBookings(updatedBookings);
        setLoading(false);
      },
      (error) => {
        console.error('Error subscribing to bookings:', error);
        toast.error('Failed to load bookings');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const handleBookingAction = async (bookingId: string, status: 'accepted' | 'declined') => {
    if (!user?.id) return;
    
    setProcessingId(bookingId);
    try {
      await updateBooking(bookingId, { status });
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error(`Error ${status} booking:`, error);
      toast.error(`Failed to ${status} booking`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Calendar className="w-6 h-6 text-purple-600" />
        Booking Requests
      </h2>

      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No booking requests at the moment
        </p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    {booking.userName}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {new Date(booking.date).toLocaleDateString()} at{' '}
                    {new Date(booking.date).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleBookingAction(booking.id, 'accepted')}
                        disabled={!!processingId}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      >
                        {processingId === booking.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleBookingAction(booking.id, 'declined')}
                        disabled={!!processingId}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>{booking.description}</p>
              </div>

              {booking.status !== 'pending' && (
                <div className={`text-sm font-medium ${
                  booking.status === 'accepted' ? 'text-green-600' : 'text-red-600'
                }`}>
                  Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}