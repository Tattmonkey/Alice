import React, { useState } from 'react';
import { PenTool, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateArticle } from '../../utils/openai';
import { BlogPost } from '../../types';
import ArticleForm from './blog/ArticleForm';
import ArticleList from './blog/ArticleList';

// Initial mock articles
const initialPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Art and Symbolism of Traditional Japanese Tattoos',
    content: 'Traditional Japanese tattoos, known as Irezumi, have a rich history spanning centuries. These intricate designs often feature mythological creatures, natural elements, and symbolic meanings that tell stories of courage, protection, and spiritual beliefs.',
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
    content: 'The rise of minimalist tattoo designs reflects a broader cultural shift towards simplicity and meaningful expression. These designs focus on clean lines, negative space, and subtle symbolism to create powerful personal statements.',
    excerpt: 'Discover why less is more in the world of contemporary tattoo artistry.',
    coverImage: 'https://images.unsplash.com/photo-1542556398-95fb5b9f9b68?w=800&q=80',
    author: 'Alice Editorial',
    createdAt: new Date().toISOString(),
    readingTime: 4,
    tags: ['Minimalist', 'Modern', 'Trends'],
    likes: 38,
    shares: 15
  }
];

export default function BlogManager() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const handleGenerate = async () => {
    if (!topic) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const article = await generateArticle(topic);
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: article.title,
        content: article.content,
        excerpt: article.content.slice(0, 150) + '...',
        coverImage: coverImageUrl || 'https://images.unsplash.com/photo-1590246814883-57c511e76523?w=800&q=80',
        author: 'Alice Editorial',
        createdAt: new Date().toISOString(),
        readingTime: Math.ceil(article.content.split(' ').length / 200),
        tags: ['Tattoo Art'],
        likes: 0,
        shares: 0
      };

      setPosts([newPost, ...posts]);
      toast.success('Article generated successfully!');
      setTopic('');
      setCoverImageUrl('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate article';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTopic(post.content);
    setCoverImageUrl(post.coverImage);
  };

  const handleSave = async () => {
    if (!editingPost) return;

    try {
      const updatedPost = {
        ...editingPost,
        content: topic,
        excerpt: topic.slice(0, 150) + '...',
        coverImage: coverImageUrl || editingPost.coverImage,
        updatedAt: new Date().toISOString()
      };

      setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
      setEditingPost(null);
      setTopic('');
      setCoverImageUrl('');
      toast.success('Article updated successfully!');
    } catch (error) {
      toast.error('Failed to update article');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Article deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
    setTopic('');
    setCoverImageUrl('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <PenTool className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Blog Management</h2>
          </div>
          {editingPost && (
            <div className="text-sm text-gray-500">
              Editing: {editingPost.title}
            </div>
          )}
        </div>

        <ArticleForm
          topic={topic}
          setTopic={setTopic}
          coverImageUrl={coverImageUrl}
          setCoverImageUrl={setCoverImageUrl}
          loading={loading}
          onSubmit={editingPost ? handleSave : handleGenerate}
          onCancel={handleCancel}
          isEditing={!!editingPost}
          editingPost={editingPost}
        />

        {error && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg mt-4">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Articles</h3>
        <ArticleList
          posts={posts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}