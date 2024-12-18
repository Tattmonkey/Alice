import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Calendar } from 'lucide-react';
import { ArtistService } from '../../types/booking';
import BookingModal from '../booking/BookingModal';

interface ServiceCardProps {
  service: ArtistService;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        {/* Service Images */}
        {service.images && service.images.length > 0 && (
          <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
            <img
              src={service.images[0]}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Service Details */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {service.name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {service.description}
          </p>

          <div className="space-y-2 mb-4">
            {/* Duration */}
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Clock size={16} className="mr-2" />
              <span className="text-sm">{service.duration} minutes</span>
            </div>

            {/* Price */}
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <DollarSign size={16} className="mr-2" />
              <span className="text-sm">${service.price}</span>
              {service.deposit > 0 && (
                <span className="text-xs ml-2">
                  (${service.deposit} deposit required)
                </span>
              )}
            </div>
          </div>

          {/* Book Now Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsBookingModalOpen(true)}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Calendar size={20} />
            <span>Book Now</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        artistId={service.artistId}
        serviceId={service.id}
        serviceName={service.name}
        duration={service.duration}
        price={service.price}
      />
    </>
  );
}
