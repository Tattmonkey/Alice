import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Star, DollarSign, Clock, Settings, Image, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import BookingList from './BookingList';
import ArtistSettings from './ArtistSettings';
import ArtistStats from './ArtistStats';
import UserGallery from '../user/UserGallery';
import UserMessages from '../user/UserMessages';

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'stats' | 'gallery' | 'messages' | 'settings'>('bookings');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please sign in to view your dashboard</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'bookings':
        return <BookingList />;
      case 'stats':
        return <ArtistStats />;
      case 'gallery':
        return <UserGallery />;
      case 'messages':
        return <UserMessages />;
      case 'settings':
        return <ArtistSettings />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'stats', label: 'Stats', icon: Star },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user.displayName || 'Artist'}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your bookings, update your gallery, and connect with clients all in one place.
            </p>
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