import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, DollarSign, User, MessageSquare, Check, X, Calendar as CalendarIcon } from 'lucide-react';
import { ArtistProfile, ArtistBooking } from '../../types/artist';
import { getArtistProfile, getArtistBookings, updateBookingStatus, updateAvailability } from '../../utils/artist';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export default function ArtistBookings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [bookings, setBookings] = useState<ArtistBooking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<ArtistBooking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    try {
      if (!user) return;
      const artistProfile = await getArtistProfile(user.uid);
      setProfile(artistProfile);
      const bookingsData = await getArtistBookings(artistProfile?.id || '', activeTab);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading artist data:', error);
      showErrorToast('Failed to load bookings');
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: ArtistBooking['status']) => {
    try {
      await updateBookingStatus(bookingId, status, notes);
      showSuccessToast('Booking status updated successfully');
      setIsModalOpen(false);
      setSelectedBooking(null);
      setNotes('');
      loadData();
    } catch (error) {
      console.error('Error updating booking status:', error);
      showErrorToast('Failed to update booking status');
    }
  };

  const handleAvailabilityUpdate = async (availability: ArtistProfile['availability']) => {
    try {
      if (!profile) return;
      await updateAvailability(profile.id, availability);
      showSuccessToast('Availability updated successfully');
      setIsAvailabilityModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error updating availability:', error);
      showErrorToast('Failed to update availability');
    }
  };

  const getStatusColor = (status: ArtistBooking['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ] as const;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Booking Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAvailabilityModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <CalendarIcon className="w-5 h-5" />
          Manage Availability
        </motion.button>
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{booking.clientId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>{formatDate(booking.dateTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>{booking.duration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <span>${booking.totalAmount}</span>
                </div>
              </div>

              <div className="space-y-4">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-gray-500">
                <strong>Design Details:</strong>
                <p>{booking.designDetails.description}</p>
                <p>Size: {booking.designDetails.size}</p>
                <p>Placement: {booking.designDetails.placement}</p>
                <p>Style: {booking.designDetails.style}</p>
                <p>Colors: {booking.designDetails.colors ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Confirm Booking</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes for Client
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedBooking.id, 'confirmed')}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Availability Modal */}
      <AnimatePresence>
        {isAvailabilityModalOpen && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Manage Availability</h3>
                <button
                  onClick={() => setIsAvailabilityModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Availability management UI will be implemented here */}
              <div className="space-y-4">
                <p className="text-gray-600">
                  Availability management features coming soon...
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
