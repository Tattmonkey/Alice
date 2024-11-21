import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin, MessageSquare, Check, X } from 'lucide-react';
import { Booking } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  bookings: Booking[];
}

export default function BookingList({ bookings = [] }: Props) {
  const handleAccept = async (bookingId: string) => {
    try {
      // Here you would implement the API call to accept booking
      toast.success('Booking accepted');
    } catch (error) {
      toast.error('Failed to accept booking');
    }
  };

  const handleDecline = async (bookingId: string) => {
    try {
      // Here you would implement the API call to decline booking
      toast.success('Booking declined');
    } catch (error) {
      toast.error('Failed to decline booking');
    }
  };

  return (
    <div className="space-y-6">
      {bookings.map((booking) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src={booking.clientAvatar}
                  alt={booking.clientName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{booking.clientName}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{booking.time}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAccept(booking.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Accept
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDecline(booking.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Decline
              </motion.button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Design Reference</h4>
                {booking.designUrl ? (
                  <img
                    src={booking.designUrl}
                    alt="Design reference"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                    No design reference provided
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Additional Notes</h4>
                <p className="text-gray-600">{booking.notes || 'No additional notes provided'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {(!bookings || bookings.length === 0) && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
          <p className="text-gray-600">
            When clients book appointments with you, they'll appear here.
          </p>
        </div>
      )}
    </div>
  );
}