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
      setError(null);
      setIsConverting(true);
      await convertToArtist();
      // After conversion, navigate to artist settings to complete profile
      navigate('/artist/settings');
    } catch (err) {
      console.error('Error converting to artist:', err);
      setError(err instanceof Error ? err.message : 'Failed to convert to artist. Please try again.');
    } finally {
      setIsConverting(false);
      setShowConfirmation(false);
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Become an Artist
              </h3>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to become an artist? This will:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
              <li>Create your artist profile</li>
              <li>Allow you to set up services and availability</li>
              <li>Enable booking management</li>
              <li>Submit your application for review</li>
            </ul>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                  dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
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
                  'Confirm'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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
            onClick={() => setShowConfirmation(true)}
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        </motion.div>
      )}

      {isPendingArtist && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Application Pending</p>
            <p>Your artist application is being reviewed. You'll be notified once it's approved.</p>
          </div>
        </motion.div>
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
          icon={MessageSquare}
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

      <ConfirmationModal />
    </div>
  );
}

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  disabled = false 
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
