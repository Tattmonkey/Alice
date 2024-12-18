import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle, Loader } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

export default function AccountTypeConverter() {
  const { user, convertToArtist, revertToUser } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const navigate = useNavigate();

  const handleConvertToArtist = async () => {
    if (!user) return;
    
    setIsConverting(true);
    try {
      await convertToArtist();
      showSuccessToast('Successfully converted to artist account!');
      navigate('/artist/setup');
    } catch (error) {
      console.error('Error converting to artist:', error);
      showErrorToast('Failed to convert to artist account');
    } finally {
      setIsConverting(false);
    }
  };

  const handleRevertToUser = async () => {
    if (!user) return;
    
    setOpenDialog(false);
    setIsConverting(true);
    try {
      await revertToUser();
      showSuccessToast('Successfully reverted to user account');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error reverting to user:', error);
      showErrorToast('Failed to revert to user account');
    } finally {
      setIsConverting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="account-type-converter">
      {user.role?.type !== 'artist' ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-2 text-white bg-purple-600 rounded-lg shadow hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          onClick={handleConvertToArtist}
          disabled={isConverting}
        >
          {isConverting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Converting...</span>
            </>
          ) : (
            'Convert to Artist Account'
          )}
        </motion.button>
      ) : (
        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2 text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => setOpenDialog(true)}
            disabled={isConverting}
          >
            {isConverting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Reverting...</span>
              </>
            ) : (
              'Revert to Normal User'
            )}
          </motion.button>

          {openDialog && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-2 text-red-500 mb-4">
                  <AlertCircle className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Warning: Account Conversion</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to revert to a normal user account? This will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Remove your artist profile</li>
                    <li>Hide your portfolio</li>
                    <li>Cancel any pending bookings</li>
                  </ul>
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setOpenDialog(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevertToUser}
                    disabled={isConverting}
                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    {isConverting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Reverting...</span>
                      </>
                    ) : (
                      'Confirm Revert'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
