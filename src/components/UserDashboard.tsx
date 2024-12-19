import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image, MessageSquare, Settings, Brush, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserGallery from './user/UserGallery';
import UserMessages from './user/UserMessages';
import UserBookings from './user/UserBookings';
import UserSettings from './UserSettings';
import ArtistGallery from './artists/ArtistGallery';
import ArtistBookings from './artists/ArtistBookings';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'bookings' | 'gallery' | 'messages' | 'settings' | 'artistGallery' | 'artistBookings'>('bookings');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please sign in to view your dashboard</p>
      </div>
    );
  }

  const isArtist = user.role?.type === 'artist';

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <UserBookings />;
      case 'gallery':
        return <UserGallery />;
      case 'messages':
        return <UserMessages />;
      case 'settings':
        return <UserSettings />;
      case 'artistGallery':
        return <ArtistGallery />;
      case 'artistBookings':
        return <ArtistBookings />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'gallery', label: 'My Gallery', icon: Image },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Add artist-specific tabs if user is an artist
  if (isArtist) {
    tabs.push(
      { id: 'artistGallery', label: 'Artist Gallery', icon: Palette },
      { id: 'artistBookings', label: 'Artist Bookings', icon: Brush }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {user.displayName || 'User'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage your bookings, view your gallery, and stay connected with artists.
                </p>
              </div>
              {user.role?.type !== 'artist' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full sm:w-auto"
                >
                  <AccountTypeConverter />
                </motion.div>
              )}
              {user.role?.type === 'artist' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/artist/dashboard')}
                  className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Brush className="w-5 h-5" />
                  Switch to Artist Dashboard
                </motion.button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex overflow-x-auto">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`
                      relative min-w-0 flex-1 overflow-hidden bg-white dark:bg-gray-800 py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-700 focus:z-10 
                      ${activeTab === id 
                        ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400' 
                        : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span>{label}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
