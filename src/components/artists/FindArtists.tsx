import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Clock, Languages } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

interface Artist {
  userId: string;
  displayName: string;
  location: string;
  specialties: string[];
  photoURL: string;
  coverImage: string;
  bio: string;
  experience: string;
  hourlyRate: string;
  availability: string;
  languages: string[];
}

export default function FindArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistsRef = collection(db, 'search_artists');
        const q = query(artistsRef);
        const querySnapshot = await getDocs(q);
        
        const artistsData = querySnapshot.docs.map(doc => ({
          userId: doc.id,
          ...doc.data()
        })) as Artist[];
        
        console.log('Fetched artists:', artistsData);
        setArtists(artistsData);
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const filteredArtists = artists.filter(artist => {
    const searchTerm = filter.toLowerCase();
    return (
      artist.displayName.toLowerCase().includes(searchTerm) ||
      artist.location.toLowerCase().includes(searchTerm) ||
      artist.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect Artist
          </h1>
          <input
            type="text"
            placeholder="Search by name, location, or style..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-xl px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArtists.map((artist) => (
            <motion.div
              key={artist.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={artist.coverImage || '/default-cover.jpg'}
                  alt={`${artist.displayName}'s cover`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <img
                    src={artist.photoURL || '/default-avatar.jpg'}
                    alt={artist.displayName}
                    className="w-16 h-16 rounded-full border-2 border-white object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {artist.displayName}
                    </h3>
                    <div className="flex items-center text-white/80 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {artist.location}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {artist.bio}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Star className="w-4 h-4 mr-2" />
                    <span>Experience: {artist.experience}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{artist.availability}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <Languages className="w-4 h-4 mr-2" />
                    <span>{artist.languages.join(', ')}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Specialties:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {artist.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/artist/${artist.userId}`}
                  className="block w-full text-center py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">
              No artists found matching your search.
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
