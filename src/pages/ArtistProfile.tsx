import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar,
  MessageSquare,
  Star,
  Clock,
  DollarSign,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  MapPin,
  Mail
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { showErrorToast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/LoadingScreen';

interface ArtistProfileData {
  uid: string;
  displayName: string;
  photoURL: string;
  bio: string;
  specialties: string[];
  experience: string;
  location: string;
  portfolio: string[];
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    requiresConsultation: boolean;
  }>;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    website?: string;
  };
  rating: number;
  reviewCount: number;
}

export default function ArtistProfile() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artist, setArtist] = useState<ArtistProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    const loadArtistProfile = async () => {
      try {
        if (!artistId) return;
        const artistDoc = await getDoc(doc(db, 'artists', artistId));
        if (!artistDoc.exists()) {
          showErrorToast('Artist not found');
          navigate('/artists');
          return;
        }
        setArtist({ ...artistDoc.data() as ArtistProfileData, uid: artistDoc.id });
      } catch (error) {
        console.error('Error loading artist profile:', error);
        showErrorToast('Failed to load artist profile');
      } finally {
        setLoading(false);
      }
    };

    loadArtistProfile();
  }, [artistId, navigate]);

  const handleBookService = (serviceId: string) => {
    if (!user) {
      showErrorToast('Please sign in to book a service');
      return;
    }
    setSelectedService(serviceId);
    setShowBookingModal(true);
  };

  const handleContactArtist = () => {
    if (!user) {
      showErrorToast('Please sign in to contact the artist');
      return;
    }
    navigate(`/messages?artist=${artistId}`);
  };

  if (loading) return <LoadingScreen />;
  if (!artist) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="w-full md:w-1/3">
          <img
            src={artist.photoURL}
            alt={artist.displayName}
            className="w-full aspect-square object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {artist.displayName}
          </h1>
          <div className="flex items-center gap-2 text-yellow-500 mb-4">
            <Star className="fill-current" size={20} />
            <span className="text-lg">{artist.rating.toFixed(1)}</span>
            <span className="text-gray-500 dark:text-gray-400">
              ({artist.reviewCount} reviews)
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-4">
            <MapPin size={20} />
            <span>{artist.location}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {artist.bio}
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {artist.specialties.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContactArtist}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <MessageSquare size={20} />
              Contact Artist
            </motion.button>
            <div className="flex gap-4">
              {artist.socialLinks.instagram && (
                <a
                  href={artist.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  <Instagram size={24} />
                </a>
              )}
              {artist.socialLinks.facebook && (
                <a
                  href={artist.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  <Facebook size={24} />
                </a>
              )}
              {artist.socialLinks.twitter && (
                <a
                  href={artist.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  <Twitter size={24} />
                </a>
              )}
              {artist.socialLinks.website && (
                <a
                  href={artist.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                >
                  <Globe size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Portfolio
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artist.portfolio.map((image, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="aspect-square rounded-lg overflow-hidden shadow-lg"
            >
              <img
                src={image}
                alt={`Portfolio piece ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Services
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artist.services.map((service) => (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {service.description}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                  <Clock size={16} />
                  <span>{service.duration} min</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                  <DollarSign size={16} />
                  <span>${service.price}</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleBookService(service.id)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                Book Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Add booking form here */}
          </div>
        </div>
      )}
    </div>
  );
}
