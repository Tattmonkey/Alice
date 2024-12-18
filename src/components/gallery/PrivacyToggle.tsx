import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock } from 'lucide-react';
import { useGallery } from '../../contexts/GalleryContext';
import { GalleryItem } from '../../types/gallery';

interface PrivacyToggleProps {
  item: GalleryItem;
  className?: string;
}

export default function PrivacyToggle({ item, className = '' }: PrivacyToggleProps) {
  const { updateItem } = useGallery();

  const handleToggle = async () => {
    try {
      await updateItem(item.id, { isPublic: !item.isPublic });
    } catch (err) {
      console.error('Error toggling privacy:', err);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      className={`p-2 rounded-full transition-colors ${
        item.isPublic
          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30'
          : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
      } ${className}`}
      title={item.isPublic ? 'Make Private' : 'Make Public'}
    >
      {item.isPublic ? (
        <Unlock className="w-5 h-5" />
      ) : (
        <Lock className="w-5 h-5" />
      )}
    </motion.button>
  );
}
