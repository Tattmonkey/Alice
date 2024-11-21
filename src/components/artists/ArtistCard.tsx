import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Verified, Calendar, Instagram, Facebook, Twitter, Youtube, Globe, ExternalLink } from 'lucide-react';
import { Artist } from '../../types';

interface Props {
  artist: Artist;
  onBook: () => void;
}

export default function ArtistCard({ artist, onBook }: Props) {
  const { socials = {} } = artist; // Provide default empty object for socials

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="relative">
        <img
          src={artist.avatar}
          alt={artist.name}
          className="w-full h-48 object-cover"
        />
        {artist.verified && (
          <div className="absolute top-4 right-4 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Verified className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold mb-1">{artist.name}</h3>
        
        <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
          <MapPin className="w-4 h-4" />
          {artist.location}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="font-medium">{artist.rating}</span>
          </div>
          <span className="text-sm text-gray-500">
            ({artist.reviewCount} reviews)
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">{artist.bio}</p>

          <div className="flex flex-wrap gap-2">
            {artist.specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>

          {/* Social Media Links */}
          <div className="flex items-center gap-3 pt-3">
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-pink-600 transition-colors"
                title="Instagram Portfolio"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {socials.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Facebook Page"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                title="Twitter Profile"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {socials.youtube && (
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="YouTube Channel"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {socials.website && (
              <a
                href={socials.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-600 transition-colors"
                title="Personal Website"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            {socials.behance && (
              <a
                href={socials.behance}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-700 transition-colors flex items-center gap-1"
                title="Behance Portfolio"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="text-xs font-medium">Behance</span>
              </a>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-sm text-gray-500">Hourly Rate</span>
              <p className="font-semibold">R{artist.hourlyRate}/hr</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBook}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Book Now
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}