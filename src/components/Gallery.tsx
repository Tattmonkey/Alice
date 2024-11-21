import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Download, Search, TrendingUp, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Creation } from '../types';

type SortOption = 'trending' | 'latest' | 'mostLiked';

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [creations, setCreations] = useState<Creation[]>([]); // Would be populated from API

  const handleLike = async (creation: Creation) => {
    try {
      // API call to like creation
      toast.success('Design liked!');
    } catch (error) {
      toast.error('Failed to like design');
    }
  };

  const handleShare = async (creation: Creation) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Tattoo design by ${creation.username}`,
          text: `Check out this amazing tattoo design on Alice!\n\nSymbolic meanings:\n${creation.meanings
            .map((m) => `${m.symbol}: ${m.meaning}`)
            .join('\n')}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      toast.error('Failed to share design');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Discover Amazing Designs
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto">
          Explore a collection of meaningful tattoo designs created by our community
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search designs..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('trending')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              sortBy === 'trending'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Trending
          </button>
          <button
            onClick={() => setSortBy('latest')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              sortBy === 'latest'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Clock className="w-5 h-5" />
            Latest
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {creations.map((creation) => (
            <motion.div
              key={creation.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-square">
                <img
                  src={creation.imageUrl}
                  alt={`Tattoo design by ${creation.username}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="w-full flex items-center justify-between text-white">
                    <span className="font-medium">{creation.username}</span>
                    <div className="flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleLike(creation)}
                        className="flex items-center gap-1"
                      >
                        <Heart className="w-5 h-5" />
                        <span>{creation.likes}</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleShare(creation)}
                      >
                        <Share2 className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{creation.prompt}</p>
                
                <div className="space-y-2">
                  {creation.meanings.map((meaning, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-purple-600">
                        {meaning.symbol}:
                      </span>{' '}
                      <span className="text-gray-600">{meaning.meaning}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-sm text-gray-500">
                  {new Date(creation.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}