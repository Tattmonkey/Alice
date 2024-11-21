import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Image as ImageIcon, Send } from 'lucide-react';
import { Artist, TimeSlot } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  artist: Artist;
  onClose: () => void;
}

export default function BookingModal({ artist, onClose }: Props) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [designUrl, setDesignUrl] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select a date and time slot');
      return;
    }

    try {
      // Here you would implement the booking API call
      toast.success('Booking request sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send booking request');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Book Appointment</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 transition-colors group-hover:text-purple-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-200 focus:shadow-lg focus:shadow-purple-100 dark:focus:shadow-purple-900/20"
                style={{ 
                  colorScheme: 'light',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Time Slot
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                <motion.button
                  key={time}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSlot({
                    id: time,
                    startTime: time,
                    endTime: `${parseInt(time) + 1}:00`,
                    available: true
                  })}
                  className={`py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    selectedSlot?.startTime === time
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200 dark:shadow-purple-900/20'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-md dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30'
                  }`}
                >
                  {time}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Design Reference (Optional)
            </label>
            <div className="relative group">
              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 transition-colors group-hover:text-purple-600" />
              <input
                type="url"
                value={designUrl}
                onChange={(e) => setDesignUrl(e.target.value)}
                placeholder="Paste image URL or upload design"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-200 focus:shadow-lg focus:shadow-purple-100 dark:focus:shadow-purple-900/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 hover:border-purple-200 focus:shadow-lg focus:shadow-purple-100 dark:focus:shadow-purple-900/20"
              placeholder="Describe your tattoo idea, size, placement, etc."
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hourly Rate</p>
              <p className="font-semibold text-gray-900 dark:text-white">R{artist.hourlyRate}/hr</p>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-200 dark:hover:shadow-purple-900/20 transition-all duration-300 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send Request
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}