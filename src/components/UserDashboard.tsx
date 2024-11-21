import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Heart, Share2, Download, Trash2, Palette, Download as DownloadIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Creation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import UserDownloads from './UserDownloads';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'designs' | 'downloads'>('designs');
  const [hoveredCreation, setHoveredCreation] = useState<string | null>(null);

  // Early return if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view your dashboard</p>
      </div>
    );
  }

  const handleDownload = async (creation: Creation) => {
    try {
      const response = await fetch(creation.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tattoo-design-${creation.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Design downloaded successfully');
    } catch (error) {
      toast.error('Failed to download design');
    }
  };

  const handleShare = async (creation: Creation) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my tattoo design!',
          text: creation.prompt,
          url: creation.imageUrl
        });
      } else {
        await navigator.clipboard.writeText(creation.imageUrl);
        toast.success('Design URL copied to clipboard');
      }
    } catch (error) {
      toast.error('Failed to share design');
    }
  };

  const handleDelete = async (creation: Creation) => {
    try {
      // Here you would implement the API call to delete the creation
      toast.success('Design deleted successfully');
    } catch (error) {
      toast.error('Failed to delete design');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold dark:text-white">My Dashboard</h1>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('designs')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === 'designs'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <Palette className="w-5 h-5" />
            My Designs
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('downloads')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              activeTab === 'downloads'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            <DownloadIcon className="w-5 h-5" />
            Downloads
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        {activeTab === 'designs' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.creations.map((creation) => (
              <motion.div
                key={creation.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden hover:shadow-lg transition-all duration-300"
                onMouseEnter={() => setHoveredCreation(creation.id)}
                onMouseLeave={() => setHoveredCreation(null)}
              >
                <div className="relative aspect-square">
                  <img
                    src={creation.imageUrl}
                    alt="Tattoo design"
                    className="w-full h-full object-cover"
                  />
                  <AnimatePresence>
                    {hoveredCreation === creation.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-between p-4"
                      >
                        <div className="flex items-center gap-2 text-white">
                          <Heart className="w-5 h-5" />
                          <span>{creation.likes}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <Download className="w-5 h-5" />
                          <span>{creation.downloads}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{creation.prompt}</p>
                  
                  <div className="space-y-2">
                    {creation.meanings.map((meaning, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-sm"
                      >
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {meaning.symbol}:
                        </span>{' '}
                        <span className="text-gray-600 dark:text-gray-300">{meaning.meaning}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownload(creation)}
                        className="p-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                      >
                        <Download className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShare(creation)}
                        className="p-2 text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                      >
                        <Share2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(creation)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}

            {user.creations.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No designs yet</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start creating your first design!
                </p>
              </div>
            )}
          </div>
        ) : (
          <UserDownloads downloads={user.downloads || []} />
        )}
      </div>
    </div>
  );
}