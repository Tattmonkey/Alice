import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, Loader } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export default function AccountTypeConverter() {
  const auth = useAuth();
  if (!auth) {
    return null; // Return early if not within AuthProvider
  }
  
  const { user, convertToArtist, revertToUser } = auth;
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();

  const handleConvertToArtist = async () => {
    if (!user || !convertToArtist) {
      showErrorToast('Unable to convert account at this time');
      return;
    }
    
    setIsConverting(true);
    try {
      await convertToArtist();
      showSuccessToast('Successfully converted to artist account!');
      navigate('/dashboard'); // Navigate to dashboard instead of artist setup
    } catch (error) {
      console.error('Error converting to artist:', error);
      showErrorToast('Failed to convert to artist account');
    } finally {
      setIsConverting(false);
    }
  };

  const handleRevertToUser = async () => {
    if (!user || !revertToUser) {
      showErrorToast('Unable to revert account at this time');
      return;
    }

    setIsConverting(true);
    try {
      await revertToUser();
      showSuccessToast('Successfully reverted to user account!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error reverting to user:', error);
      showErrorToast('Failed to revert to user account');
    } finally {
      setIsConverting(false);
    }
  };

  const isArtist = user?.role?.type === 'artist';

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Account Type
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            {isArtist
              ? "You're currently an artist. You can revert to a regular user account if you wish."
              : "Want to showcase your art? Convert your account to an artist account!"}
          </p>
        </div>

        {isConverting ? (
          <div className="flex items-center justify-center p-4">
            <Loader className="animate-spin mr-2" />
            <span>Processing...</span>
          </div>
        ) : (
          <button
            onClick={isArtist ? handleRevertToUser : handleConvertToArtist}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            disabled={isConverting}
          >
            {isArtist ? 'Revert to User Account' : 'Convert to Artist Account'}
          </button>
        )}
      </motion.div>
    </div>
  );
}
