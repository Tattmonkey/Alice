import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Upload, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showUpload?: boolean;
}

export default function UserAvatar({ size = 'md', showUpload = false }: UserAvatarProps) {
  const { user, updateUserProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Create a reference to the storage location
      const storageRef = ref(storage, `avatars/${user.id}/${Date.now()}-${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update the user's profile with the new avatar URL
      await updateUserProfile({ photoURL: downloadURL });
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {user?.photoURL ? (
        <motion.img
          src={user.photoURL}
          alt={user.name || 'User avatar'}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm ring-2 ring-purple-100 dark:ring-purple-900/30`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: showUpload ? 1.05 : 1 }}
        />
      ) : (
        <motion.div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm ring-2 ring-purple-100 dark:ring-purple-900/30`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: showUpload ? 1.05 : 1 }}
        >
          <User className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} text-purple-600 dark:text-purple-400`} />
        </motion.div>
      )}
      
      {showUpload && (
        <label className="absolute -bottom-1 -right-1 p-1.5 bg-purple-600 dark:bg-purple-500 text-white rounded-full cursor-pointer hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors shadow-sm ring-2 ring-white dark:ring-gray-800">
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
