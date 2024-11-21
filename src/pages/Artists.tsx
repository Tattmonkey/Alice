import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Star, Filter, ChevronDown, Verified, Calendar } from 'lucide-react';
import { Artist } from '../types';
import ArtistCard from '../components/artists/ArtistCard';
import BookingModal from '../components/artists/BookingModal';
import toast from 'react-hot-toast';

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [minRate, setMinRate] = useState<number | ''>('');
  const [maxRate, setMaxRate] = useState<number | ''>('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const specialties = [
    'Traditional',
    'Neo-Traditional',
    'Japanese',
    'Blackwork',
    'Realism',
    'Watercolor',
    'Tribal',
    'Minimalist',
  ];

  const [artists] = useState<Artist[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      location: 'East London, South Africa',
      bio: 'Specializing in custom designs with 8+ years of experience. Passionate about bringing your vision to life.',
      specialties: ['Japanese', 'Neo-Traditional'],
      rating: 4.9,
      reviewCount: 127,
      hourlyRate: 800,
      portfolio: [],
      availability: [],
      reviews: [],
      verified: true,
    },
  ]);

  const handleBook = (artist: Artist) => {
    setSelectedArtist(artist);
    setIsBookingModalOpen(true);
  };

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !location || artist.location.toLowerCase().includes(location.toLowerCase());
    const matchesRate = (!minRate || artist.hourlyRate >= minRate) &&
      (!maxRate || artist.hourlyRate <= maxRate);
    const matchesSpecialties = selectedSpecialties.length === 0 ||
      selectedSpecialties.some(s => artist.specialties.includes(s));
    
    return matchesSearch && matchesLocation && matchesRate && matchesSpecialties;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 mb-4">
          Find Your Perfect Artist
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Connect with talented tattoo artists in your area
        </p>
      </motion.div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists by name..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-[#0a0412] dark:text-white"
            />
          </div>

          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-[#0a0412] dark:text-white"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-5 h-5 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
          </motion.button>
        </div>

        <AnimatePresence>
          {isFiltersOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white dark:bg-[#0a0412] rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Hourly Rate Range (ZAR)
                  </h3>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      value={minRate}
                      onChange={(e) => setMinRate(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Min"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-[#050208] dark:text-white"
                    />
                    <input
                      type="number"
                      value={maxRate}
                      onChange={(e) => setMaxRate(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Max"
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-[#050208] dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() => toggleSpecialty(specialty)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedSpecialties.includes(specialty)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <ArtistCard
            key={artist.id}
            artist={artist}
            onBook={() => handleBook(artist)}
          />
        ))}
      </div>

      <AnimatePresence>
        {isBookingModalOpen && selectedArtist && (
          <BookingModal
            artist={selectedArtist}
            onClose={() => setIsBookingModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}