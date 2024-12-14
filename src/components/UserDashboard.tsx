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
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-[#0f0616] dark:to-[#150a24] p-6">
      <ConfirmationModal />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your orders, appointments, and credits
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Create Design"
            description="Generate unique tattoo designs with AI"
            icon={ImageIcon}
            onClick={() => navigate('/create')}
          />
          <DashboardCard
            title="My Designs"
            description="View and manage your generated designs"
            icon={Palette}
            onClick={() => navigate('/designs')}
          />
          <DashboardCard
            title="Messages"
            description="Chat with artists and manage bookings"
            icon={MessageSquare}
            onClick={() => navigate('/messages')}
          />
        </div>

        {/* Become an Artist Section */}
        {!isArtist && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Become an Artist</h2>
                <p className="text-purple-100 mb-4">
                  Share your artwork and connect with clients
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmation(true)}
                  className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 
                    transition-all duration-300 flex items-center gap-2"
                >
                  Get Started
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
              <Palette className="w-24 h-24 text-purple-300" />
            </div>
          </motion.div>
        )}
      </div>
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

function DashboardCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  disabled = false 
}: DashboardCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-[#1a0b2e] p-6 rounded-xl shadow-lg cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  );
}