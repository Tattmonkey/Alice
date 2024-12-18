import React, { useState } from 'react';
import { Share2, X, Instagram, Facebook, Twitter, Tumblr } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryItem } from '../../types/gallery';

interface ShareButtonProps {
  item: GalleryItem;
}

export default function ShareButton({ item }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = `${window.location.origin}/gallery/${item.id}`;
  const shareText = `Check out this amazing ${item.type} by ${item.userId}`;

  const shareLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: `https://www.instagram.com/share?url=${encodeURIComponent(shareUrl)}`,
      color: 'bg-pink-500 hover:bg-pink-600'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'bg-black hover:bg-gray-900'
    },
    {
      name: 'Tumblr',
      icon: Tumblr,
      url: `https://www.tumblr.com/share/link?url=${encodeURIComponent(shareUrl)}&name=${encodeURIComponent(item.title)}&description=${encodeURIComponent(item.description || '')}`,
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-0 mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 min-w-[200px]"
          >
            <div className="space-y-2">
              {shareLinks.map((link) => (
                <motion.button
                  key={link.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleShare(link.url)}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-white ${link.color} transition-colors`}
                >
                  <link.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
