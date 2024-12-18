import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBooking } from '../../contexts/BookingContext';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

interface BookingFormProps {
  artistId: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  onClose: () => void;
}

export default function BookingForm({
  artistId,
  serviceId,
  serviceName,
  duration,
  price,
  onClose
}: BookingFormProps) {
  const { user } = useAuth();
  const { createBooking } = useBooking();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showErrorToast('Please sign in to book an appointment');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingDateTime = new Date(`${selectedDate}T${selectedTime}`);
      if (bookingDateTime < new Date()) {
        throw new Error('Please select a future date and time');
      }

      await createBooking({
        artistId,
        serviceId,
        userId: user.uid,
        date: bookingDateTime.toISOString(),
        duration,
        price,
        status: 'pending',
        notes,
        createdAt: new Date().toISOString()
      });

      showSuccessToast('Booking request sent successfully!');
      onClose();
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
      showErrorToast('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const start = 9; // 9 AM
    const end = 17; // 5 PM
    
    for (let hour = start; hour <= end; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour !== end) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Book Appointment
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {serviceName}
        </h4>
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <span>${price}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="time"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Time
          </label>
          <select
            id="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select a time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            placeholder="Any special requests or details about your tattoo idea..."
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Booking...</span>
            </>
          ) : (
            <>
              <Calendar size={20} />
              <span>Confirm Booking</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
}
