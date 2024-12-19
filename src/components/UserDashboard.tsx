import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image, MessageSquare, Settings, Brush, Palette, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserGallery from './user/UserGallery';
import UserMessages from './user/UserMessages';
import UserBookings from './user/UserBookings';
import UserSettings from './UserSettings';
import ArtistGallery from './artists/ArtistGallery';
import ArtistBookings from './artists/ArtistBookings';
import ArtistProfile from './artists/ArtistProfile';

type TabType = 'bookings' | 'gallery' | 'messages' | 'settings' | 'artistGallery' | 'artistBookings' | 'artistProfile';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');

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
      case 'artistProfile':
        return <ArtistProfile />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'bookings' as TabType, label: 'My Bookings', icon: Calendar },
    { id: 'gallery' as TabType, label: 'My Gallery', icon: Image },
    { id: 'messages' as TabType, label: 'Messages', icon: MessageSquare },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings }
  ];

  // Add artist-specific tabs if user is an artist
  if (isArtist) {
    tabs.push(
      { id: 'artistProfile' as TabType, label: 'Artist Profile', icon: User },
      { id: 'artistGallery' as TabType, label: 'Artist Gallery', icon: Palette },
      { id: 'artistBookings' as TabType, label: 'Artist Bookings', icon: Brush }
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
