import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Calendar, 
  MessageSquare, 
  Image as ImageIcon,
  Settings,
  ChevronRight,
  Loader,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserDashboard() {
  const { user, convertToArtist } = useAuth();
  const navigate = useNavigate();
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    console.log('UserDashboard mounted, user:', user);
  }, [user]);

  const handleArtistConversion = async () => {
    console.log('Starting artist conversion...');
    try {
      if (!convertToArtist) {
        throw new Error('convertToArtist function not available');
      }
      setIsConverting(true);
      setError(null);
      console.log('Calling convertToArtist...');
      await convertToArtist();
      console.log('Conversion successful');
      setShowConfirmation(false);
      setTimeout(() => {
        navigate('/artist/settings');
      }, 1000);
    } catch (err) {
      console.error('Error during conversion:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during conversion');
    } finally {
      setIsConverting(false);
    }
  };

  // Check if user is already an artist
  const isArtist = user?.role?.type === 'artist';
  console.log('Current user role:', user?.role);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please sign in to view your dashboard</p>
      </div>
    );
  }

  const handleBecomeArtist = () => {
    console.log('Opening artist conversion modal');
    setShowConfirmation(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!isArtist && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
          >
            <DashboardCard
              icon={Palette}
              title="Become an Artist"
              description="Convert your account to an artist account and start showcasing your work"
              onClick={handleBecomeArtist}
            />
          </motion.div>
        )}
        
        <DashboardCard
          icon={ImageIcon}
          title="My Gallery"
          description="View and manage your saved tattoo designs"
          onClick={() => navigate('/gallery')}
        />
        
        <DashboardCard
          icon={Calendar}
          title="My Bookings"
          description="View and manage your tattoo appointments"
          onClick={() => navigate('/bookings')}
        />
        
        <DashboardCard
          icon={Settings}
          title="Settings"
          description="Manage your account settings and preferences"
          onClick={() => navigate('/settings')}
        />
      </div>

      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Become an Artist
                </h3>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to convert your account to an artist account? You'll be able to:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create your artist profile</li>
                  <li>Showcase your work</li>
                  <li>Accept bookings from clients</li>
                </ul>
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArtistConversion}
                  disabled={isConverting}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 flex items-center"
                >
                  {isConverting ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      <span>Converting...</span>
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface DashboardCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="w-full p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start">
      <Icon className="text-purple-600 dark:text-purple-400" size={24} />
      <ChevronRight className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" size={20} />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </div>
);
