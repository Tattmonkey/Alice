import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart, Share2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  posts: BlogPost[];
}

export default function BlogList({ posts }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
        >
          <Link to={`/blog/${post.id}`}>
            <div className="relative aspect-video">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </Link>

          <div className="p-6">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readingTime} min read
              </div>
            </div>

            <Link to={`/blog/${post.id}`}>
              <h2 className="text-xl font-bold mb-2 hover:text-purple-600 transition-colors">
                {post.title}
              </h2>
            </Link>

            <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-purple-600 bg-purple-50 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {post.likes}
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  {post.shares}
                </div>
              </div>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}