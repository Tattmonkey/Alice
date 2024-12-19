import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ArtistGallery() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Artist Gallery
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-300">
          This is where you can manage your artist portfolio and showcase your work.
        </p>
      </div>
    </div>
  );
}
