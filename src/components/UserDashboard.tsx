import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Calendar, 
  MessageCircle, 
  Image as ImageIcon,
  Settings,
  ChevronRight,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserDashboard() {
  const { user, convertToArtist } = useAuth();
  const navigate = useNavigate();
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleArtistConversion = async () => {
    try {
      setError(null);
      setIsConverting(true);
      await convertToArtist();
      // After conversion, navigate to artist settings to complete profile
      navigate('/artist/settings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert to artist');
    } finally {
      setIsConverting(false);
    }
  };

  const DashboardCard = ({ 
    title, 
    description, 
    icon: Icon, 
    onClick,
    disabled = false 
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
      </div>
    </motion.div>
  );

  const isArtist = user?.role?.type === 'artist';
  const isPendingArtist = isArtist && user?.role?.status === 'pending';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        {!isArtist && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleArtistConversion}
            disabled={isConverting}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isConverting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Palette className="w-4 h-4" />
                Become an Artist
              </>
            )}
          </motion.button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isPendingArtist && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          Your artist application is pending approval. You'll be notified once it's approved.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard
          title="Bookings"
          description="View and manage your appointments"
          icon={Calendar}
          onClick={() => navigate('/bookings')}
        />

        <DashboardCard
          title="Messages"
          description="Chat with artists and clients"
          icon={MessageCircle}
          onClick={() => navigate('/messages')}
        />

        <DashboardCard
          title="Gallery"
          description="View and manage your saved designs"
          icon={ImageIcon}
          onClick={() => navigate('/gallery')}
        />

        <DashboardCard
          title="Settings"
          description="Update your profile and preferences"
          icon={Settings}
          onClick={() => navigate('/settings')}
        />

        {isArtist && (
          <DashboardCard
            title="Artist Dashboard"
            description="Manage your artist profile and services"
            icon={Palette}
            onClick={() => navigate('/artist/dashboard')}
            disabled={isPendingArtist}
          />
        )}
      </div>
    </div>
  );
}
