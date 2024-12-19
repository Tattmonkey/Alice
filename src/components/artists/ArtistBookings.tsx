import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ArtistBookings() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Artist Bookings
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300">
          Here you can manage your bookings, schedule, and client requests.
        </p>
      </div>
    </div>
  );
}
