import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, PenTool, ImageIcon } from 'lucide-react';
import { BlogPost } from '../../../types';

interface Props {
  posts: BlogPost[];
  onEdit: (post: BlogPost) => void;
  onDelete: (postId: string) => void;
}

export default function ArticleList({ posts, onEdit, onDelete }: Props) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h4 className="text-lg font-medium text-gray-900 mb-2">No Articles Yet</h4>
        <p className="text-gray-600">
          Generate your first article to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        >
          <div className="flex">
            <div className="w-48 h-32 relative group">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(post)}
                  className="p-2 bg-white rounded-full text-gray-600 hover:text-purple-600"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <h4 className="font-medium mb-1">{post.title}</h4>
              <p className="text-sm text-gray-500 mb-2">
                Created {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
              <div className="flex gap-2 mt-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 flex items-start gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onEdit(post)}
                className="p-2 text-gray-600 hover:text-purple-600"
              >
                <Edit2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDelete(post.id)}
                className="p-2 text-gray-600 hover:text-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}