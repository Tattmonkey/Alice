import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader2, ImageIcon, X, Save, Trash2 } from 'lucide-react';
import { BlogPost } from '../../../types';

interface Props {
  topic: string;
  setTopic: (topic: string) => void;
  coverImageUrl: string;
  setCoverImageUrl: (url: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
  editingPost: BlogPost | null;
}

export default function ArticleForm({
  topic,
  setTopic,
  coverImageUrl,
  setCoverImageUrl,
  loading,
  onSubmit,
  onCancel,
  isEditing,
  editingPost
}: Props) {
  const handleRemoveCover = () => {
    if (confirm('Are you sure you want to remove the cover image?')) {
      setCoverImageUrl('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isEditing ? 'Edit Article Content' : 'Generate New Article'}
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full h-32 px-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder={isEditing ? "Edit article content..." : "Enter a topic for the article..."}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image URL
        </label>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-purple-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          {coverImageUrl && (
            <motion.button
              type="button"
              onClick={handleRemoveCover}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-red-500 hover:text-red-600 bg-red-50 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {coverImageUrl && (
        <div className="relative aspect-video rounded-xl overflow-hidden group">
          <img
            src={coverImageUrl}
            alt="Cover preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <motion.button
              type="button"
              onClick={handleRemoveCover}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 text-white bg-red-500 rounded-full hover:bg-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-4">
        {isEditing && (
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel Edit
          </motion.button>
        )}
        <motion.button
          onClick={onSubmit}
          disabled={loading || (!topic && !editingPost)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isEditing ? (
            <>
              <Save className="w-5 h-5" />
              Update Article
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generate Article
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}