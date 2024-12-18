import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, User } from 'lucide-react';
import { useGallery } from '../../contexts/GalleryContext';
import { useAuth } from '../../contexts/AuthContext';
import ShareButton from './ShareButton';
import { Link } from 'react-router-dom';

export default function GalleryFeed() {
  const { items, loading, error, likeItem, unlikeItem } = useGallery();
  const { user } = useAuth();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const handleLike = async (itemId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeItem(itemId);
      } else {
        await likeItem(itemId);
      }
    } catch (err) {
      console.error('Error handling like:', err);
    }
  };

  // Infinite scroll setup
  const lastItemCallback = useCallback((node: HTMLDivElement) => {
    if (loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        // Load more items
        // This functionality is already handled by the GalleryContext
      }
    });

    if (node) {
      observerRef.current.observe(node);
      lastItemRef.current = node;
    }
  }, [loading]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading gallery: {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-8">
        {items.map((item, index) => {
          const isLiked = user ? item.likedBy.includes(user.id) : false;

          return (
            <motion.div
              key={item.id}
              ref={index === items.length - 1 ? lastItemCallback : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              {/* User Info */}
              <Link
                to={`/profile/${item.userId}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.userId}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>

              {/* Image */}
              <div className="relative aspect-square">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Actions */}
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleLike(item.id, isLiked)}
                    className={`p-2 rounded-full ${
                      isLiked
                        ? 'text-red-500'
                        : 'text-gray-600 dark:text-gray-300'
                    } hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors`}
                  >
                    <Heart
                      className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`}
                    />
                  </motion.button>

                  <Link
                    to={`/gallery/${item.id}`}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </Link>

                  <div className="ml-auto">
                    <ShareButton item={item} />
                  </div>
                </div>

                {/* Likes Count */}
                <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  {item.likes} likes
                </div>

                {/* Caption */}
                <div className="mt-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white mr-2">
                      {item.userId}
                    </span>
                    {item.description}
                  </p>
                </div>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <Link
                        key={tag}
                        to={`/gallery?tag=${tag}`}
                        className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Comments Preview */}
                {item.comments.length > 0 && (
                  <Link
                    to={`/gallery/${item.id}`}
                    className="mt-2 text-sm text-gray-500 dark:text-gray-400"
                  >
                    View all {item.comments.length} comments
                  </Link>
                )}
              </div>
            </motion.div>
          );
        })}

        {loading && (
          <div className="text-center py-4">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
