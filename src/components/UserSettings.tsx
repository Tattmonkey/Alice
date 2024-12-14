import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Trash2, AlertTriangle, Palette, UserX, History, Package, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function UserSettings() {
  const { user, revertToUser, deleteAccount, updateProfile, switchToArtist } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToArtist = async () => {
    try {
      setLoading(true);
      navigate('/profile/become-artist');
    } catch (error) {
      console.error('Error navigating to artist form:', error);
      toast.error('Failed to navigate to artist form');
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToUser = async () => {
    try {
      setLoading(true);
      await revertToUser();
      toast.success('Successfully reverted to regular user account');
      navigate('/dashboard');
    } catch (error) {
      console.error('Revert to user error:', error);
      toast.error('Failed to revert account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteAccount();
      navigate('/');
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Please sign in to view settings</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold dark:text-white">Account Settings</h2>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Profile Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </motion.button>
              )}
            </div>
          </section>

          {/* Account Type Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Account Type</h3>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-purple-600 dark:text-purple-400">
                    {user.role?.type === 'artist' ? 'Artist Account' : 'Regular Account'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.role?.type === 'artist' 
                      ? 'You can accept bookings and manage your artist profile'
                      : 'Switch to an artist account to accept bookings and showcase your work'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={user.role?.type === 'artist' ? handleRevertToUser : handleSwitchToArtist}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {user.role?.type === 'artist' ? (
                    <>
                      <UserX className="w-5 h-5" />
                      Revert to Regular Account
                    </>
                  ) : (
                    <>
                      <Palette className="w-5 h-5" />
                      Switch to Artist Account
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </section>

          {/* Quick Links Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/orders"
                className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Package className="w-5 h-5 text-purple-600" />
                <span className="font-medium dark:text-white">Order History</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <History className="w-5 h-5 text-purple-600" />
                <span className="font-medium dark:text-white">Generation History</span>
              </Link>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </motion.button>
          </section>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Delete Account</h3>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>Deleting...</>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Delete Account
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}