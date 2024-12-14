import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  X,
  ChevronRight,
  Check,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { Booking, ArtistService } from '../../types/booking';
import LoadingScreen from '../LoadingScreen';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface BookingWithService extends Booking {
  serviceDetails?: ArtistService;
}

export default function UserBookings() {
  const { user } = useAuth();
  const { bookings, loading, cancelBooking } = useBooking();
  const [selectedBooking, setSelectedBooking] = useState<BookingWithService | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [bookingsWithServices, setBookingsWithServices] = useState<BookingWithService[]>([]);

  // Load service details for each booking
  useEffect(() => {
    const loadServiceDetails = async () => {
      const bookingsWithDetails = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const serviceDoc = await getDoc(doc(db, 'artistServices', booking.serviceId));
            return {
              ...booking,
              serviceDetails: serviceDoc.exists() ? serviceDoc.data() as ArtistService : undefined
            };
          } catch (err) {
            console.error('Error loading service details:', err);
            return booking;
          }
        })
      );
      setBookingsWithServices(bookingsWithDetails);
    };

    loadServiceDetails();
  }, [bookings]);

  if (loading) return <LoadingScreen />;
  if (!user) return <div className="text-red-500 p-4">Must be logged in to view bookings</div>;

  const upcomingBookings = bookingsWithServices.filter(
    booking => 
      ['pending', 'confirmed'].includes(booking.status) &&
      new Date(booking.date) >= new Date()
  );

  const pastBookings = bookingsWithServices.filter(
    booking => 
      ['completed', 'cancelled', 'no_show'].includes(booking.status) ||
      new Date(booking.date) < new Date()
  );

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'cancelled':
        return 'text-red-500';
      case 'no_show':
        return 'text-red-500';
      case 'completed':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim()) return;

    try {
      await cancelBooking(selectedBooking.id, cancellationReason);
      setSelectedBooking(null);
      setShowCancellationModal(false);
      setCancellationReason('');
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  const renderBookingCard = (booking: BookingWithService) => (
    <div
      key={booking.id}
      className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedBooking(booking)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            {booking.serviceDetails?.name || 'Booking'}
          </h3>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              {format(new Date(booking.date), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              {booking.startTime} - {booking.endTime}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <DollarSign className="w-4 h-4" />
              ${booking.price}
            </div>
          </div>
        </div>
        <span className={`text-sm font-medium ${getStatusColor(booking.status)}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
    </div>
  );

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="relative max-w-lg w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
          >
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Booking Details
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Service
                  </h3>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {selectedBooking.serviceDetails?.name || 'Booking'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date & Time
                  </h3>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {format(new Date(selectedBooking.date), 'MMMM d, yyyy')}
                    <br />
                    {selectedBooking.startTime} - {selectedBooking.endTime}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Price
                  </h3>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    ${selectedBooking.price}
                    {selectedBooking.deposit > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        (${selectedBooking.deposit} deposit)
                      </span>
                    )}
                  </p>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Notes
                    </h3>
                    <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-line">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {selectedBooking.consultation && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Consultation
                    </h3>
                    <div className="mt-1">
                      {selectedBooking.consultation.completed ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <Check className="w-4 h-4" />
                          Completed
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-yellow-500">
                          <AlertCircle className="w-4 h-4" />
                          Required
                        </div>
                      )}
                      {selectedBooking.consultation.notes && (
                        <p className="mt-2 text-gray-900 dark:text-white whitespace-pre-line">
                          {selectedBooking.consultation.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed' ? (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCancellationModal(true)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderCancellationModal = () => (
    <AnimatePresence>
      {showCancellationModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="relative max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Cancel Booking
              </h2>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Please provide a reason for cancelling this booking:
                </p>

                <textarea
                  value={cancellationReason}
                  onChange={e => setCancellationReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowCancellationModal(false);
                      setCancellationReason('');
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCancelBooking}
                    disabled={!cancellationReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        My Bookings
      </h1>

      <div className="space-y-8">
        {/* Upcoming Bookings */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Bookings
          </h2>
          <div className="grid gap-4">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => renderBookingCard(booking))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No upcoming bookings
              </p>
            )}
          </div>
        </section>

        {/* Past Bookings */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Past Bookings
          </h2>
          <div className="grid gap-4">
            {pastBookings.length > 0 ? (
              pastBookings.map(booking => renderBookingCard(booking))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No past bookings
              </p>
            )}
          </div>
        </section>
      </div>

      {renderBookingDetails()}
      {renderCancellationModal()}
    </div>
  );
}
