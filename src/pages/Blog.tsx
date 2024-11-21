import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenTool, Search, Tag, Clock, Heart, Share2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { generateArticle } from '../utils/openai';
import toast from 'react-hot-toast';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    try {
      // Mock initial posts while API integration is pending
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'The Art and Symbolism of Traditional Japanese Tattoos',
          content: 'Traditional Japanese tattoos, known as Irezumi, have a rich history spanning centuries...',
          excerpt: 'Explore the rich history and deep meanings behind traditional Japanese tattoo art, from koi fish to cherry blossoms.',
          coverImage: 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=80',
          author: 'Alice Editorial',
          createdAt: new Date().toISOString(),
          readingTime: 5,
          tags: ['Japanese', 'Traditional', 'Symbolism'],
          likes: 42,
          shares: 12
        },
        {
          id: '2',
          title: 'Modern Minimalist Tattoo Design Trends',
          content: 'The rise of minimalist tattoo designs reflects a broader cultural shift...',
          excerpt: 'Discover why less is more in the world of contemporary tattoo artistry.',
          coverImage: 'https://images.unsplash.com/photo-1542556398-95fb5b9f9b68?w=800&q=80',
          author: 'Alice Editorial',
          createdAt: new Date().toISOString(),
          readingTime: 4,
          tags: ['Minimalist', 'Modern', 'Trends'],
          likes: 38,
          shares: 15
        },
        {
          id: '3',
          title: 'The Psychology of Color in Tattoo Design',
          content: 'Colors in tattoos carry deep psychological significance...',
          excerpt: 'Understanding how color choices in tattoos can affect their meaning and impact.',
          coverImage: 'https://images.unsplash.com/photo-1590246814883-57c511e76823?w=800&q=80',
          author: 'Alice Editorial',
          createdAt: new Date().toISOString(),
          readingTime: 6,
          tags: ['Psychology', 'Color', 'Design'],
          likes: 56,
          shares: 23
        }
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      toast.error('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: post.likes + 1 }
            : post
        )
      );
      toast.success('Post liked!');
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleShare = async (post: BlogPost) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      toast.error('Failed to share post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <PenTool className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading articles...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-[#0f0616] dark:to-[#150a24]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <PenTool className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              Tattoo Insights Blog
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the stories, meanings, and artistry behind tattoo culture
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-[#0a0412] dark:text-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(posts.flatMap(post => post.tags))).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="wait">
            {filteredPosts.map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-[#0a0412] rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
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
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                    <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <button
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        {post.shares}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Articles Found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}