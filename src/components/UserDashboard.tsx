import React, { useState } from 'react';
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

  const handleArtistConversion = async () => {
    try {
      setIsConverting(true);
      setError(null);
      await convertToArtist();
      setShowConfirmation(false);
      navigate('/artist/settings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsConverting(false);
    }
  };

  const isArtist = user?.role?.type === 'artist';
  const isPendingArtist = isArtist && user?.role?.status === 'pending';

  const ConfirmationModal = () => (
    <AnimatePresence>
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"
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
              Are you sure you want to convert your account to an artist account? This action cannot be undone.
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
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {isConverting ? (
                  <Loader className="animate-spin" size={16} />
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-[#0f0616] dark:to-[#150a24] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          {!isArtist && (
            <button
              onClick={() => setShowConfirmation(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <Palette className="mr-2" size={16} />
              Become an Artist
            </button>
          )}
          {isPendingArtist && (
            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
              <Loader className="animate-spin mr-2" size={16} />
              Artist Application Pending
            </div>
          )}
        </div>

        <ConfirmationModal />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={Calendar}
            title="My Bookings"
            description="View and manage your bookings"
            onClick={() => navigate('/bookings')}
          />
          <DashboardCard
            icon={MessageSquare}
            title="Messages"
            description="Chat with artists and clients"
            onClick={() => navigate('/messages')}
          />
          <DashboardCard
            icon={ImageIcon}
            title="Gallery"
            description="View your saved artwork"
            onClick={() => navigate('/gallery')}
          />
          <DashboardCard
            icon={Settings}
            title="Settings"
            description="Manage your account settings"
            onClick={() => navigate('/settings')}
          />
        </div>
      </div>
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
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
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
  </motion.button>
);
