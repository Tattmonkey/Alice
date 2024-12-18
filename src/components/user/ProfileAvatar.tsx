import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Trash2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  userId?: string;
  imageUrl?: string;
}

export default function ProfileAvatar({ 
  size = 'md', 
  editable = false,
  userId,
  imageUrl: propImageUrl
}: ProfileAvatarProps) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canEdit = editable && user && (userId ? userId === user.id : true);
  const imageUrl = propImageUrl || user?.photoURL;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;

    try {
      setUploading(true);
      
      // Delete existing profile picture if it exists
      if (user.photoURL) {
        try {
          const oldImageRef = ref(storage, user.photoURL);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting old profile picture:', error);
        }
      }

      // Upload new image
      const timestamp = Date.now();
      const filename = `profile_${user.id}_${timestamp}`;
      const storageRef = ref(storage, `profile-pictures/${filename}`);
      
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      // Update user document
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        photoURL: downloadUrl
      });

      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user || !user.photoURL) return;

    try {
      setUploading(true);

      // Delete image from storage
      const imageRef = ref(storage, user.photoURL);
      await deleteObject(imageRef);

      // Update user document
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        photoURL: null
      });

      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <motion.div
        whileHover={{ scale: canEdit ? 1.05 : 1 }}
        className={`relative rounded-full overflow-hidden ${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-pink-500`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-medium">
            {user?.displayName ? (
              getInitials(user.displayName)
            ) : (
              <Camera className="w-1/2 h-1/2 opacity-75" />
            )}
          </div>
        )}

        {/* Upload Overlay */}
        <AnimatePresence>
          {canEdit && isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </motion.button>
              {imageUrl && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Progress Overlay */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
      />
    </div>
  );
}
