import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function AccountTypeConverter() {
  const { user, updateUserRole } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleConvertToArtist = async () => {
    if (!user) return;
    
    setIsConverting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: 'artist',
        convertedAt: new Date().toISOString(),
      });
      
      // Create artist profile
      const artistRef = doc(db, 'artists', user.uid);
      await updateDoc(artistRef, {
        userId: user.uid,
        createdAt: new Date().toISOString(),
        status: 'active'
      });
      
      await updateUserRole('artist');
      window.location.href = '/artist/setup'; // Redirect to artist profile setup
    } catch (error) {
      console.error('Error converting to artist:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const handleRevertToUser = async () => {
    if (!user) return;
    
    setOpenDialog(false);
    setIsConverting(true);
    try {
      // Delete artist profile
      await deleteDoc(doc(db, 'artists', user.uid));
      
      // Update user role
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role: 'user',
        convertedAt: null,
      });
      
      await updateUserRole('user');
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error reverting to user:', error);
    } finally {
      setIsConverting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="account-type-converter">
      {user.role === 'user' ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-4 py-2 text-white bg-primary rounded-lg shadow hover:bg-primary-dark transition-colors"
          onClick={handleConvertToArtist}
          disabled={isConverting}
        >
          {isConverting ? 'Converting...' : 'Convert to Artist Account'}
        </motion.button>
      ) : (
        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-4 py-2 text-white bg-red-500 rounded-lg shadow hover:bg-red-600 transition-colors"
            onClick={() => setOpenDialog(true)}
            disabled={isConverting}
          >
            Revert to Normal User
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

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to revert to a normal user account? This will:
                </p>
                
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                  <li>Delete your entire artist profile</li>
                  <li>Remove all your artist-specific content</li>
                  <li>This action cannot be undone</li>
                </ul>

                <div className="flex gap-4">
                  <button
                    onClick={() => setOpenDialog(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRevertToUser}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Yes, Revert Account
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
