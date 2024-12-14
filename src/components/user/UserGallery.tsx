import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload,
  Filter,
  Heart,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { useGallery } from '../../contexts/GalleryContext';
import { useAuth } from '../../contexts/AuthContext';
import { GalleryItem, GalleryFilter } from '../../types/gallery';
import LoadingScreen from '../LoadingScreen';

export default function UserGallery() {
  const { user } = useAuth();
  const { 
    userItems,
    loading,
    error,
    filter,
    setFilter,
    uploadItem,
    deleteItem,
    updateItem,
    likeItem,
    unlikeItem,
    addComment
  } = useGallery();

  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [comment, setComment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!user) return <div className="text-red-500 p-4">Must be logged in to view gallery</div>;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const img = new Image();
          img.onload = async () => {
            await uploadItem(file, {
              type: 'design',
              isPublic: true,
              metadata: {
                width: img.width,
                height: img.height,
                size: file.size,
                originalName: file.name
              }
            });
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Error uploading files:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFilterChange = (newFilter: Partial<GalleryFilter>) => {
    setFilter({ ...filter, ...newFilter });
    setShowFilterMenu(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await deleteItem(itemId);
      setSelectedItem(null);
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleUpdateItem = async (itemId: string, data: Partial<GalleryItem>) => {
    try {
      await updateItem(itemId, data);
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleAddComment = async (itemId: string) => {
    if (!comment.trim()) return;
    
    try {
      await addComment(itemId, comment);
      setComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const renderGalleryGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {userItems.map(item => (
        <motion.div
          key={item.id}
          layoutId={item.id}
          className="relative group cursor-pointer rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md"
          onClick={() => setSelectedItem(item)}
        >
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <h3 className="text-white font-medium truncate">{item.title}</h3>
            <div className="flex items-center gap-3 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {item.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {item.comments.length}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderItemModal = () => (
    <AnimatePresence>
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            layoutId={selectedItem.id}
            className="relative max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setEditingItem(selectedItem)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteItem(selectedItem.id)}
                className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="flex-1">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-auto"
                />
              </div>
              <div className="flex-1 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedItem.title}
                </h2>
                {selectedItem.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {selectedItem.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="border-t dark:border-gray-700 pt-4 mb-4">
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                    <button
                      onClick={() => selectedItem.likedBy.includes(user.id) 
                        ? unlikeItem(selectedItem.id)
                        : likeItem(selectedItem.id)
                      }
                      className="flex items-center gap-1"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          selectedItem.likedBy.includes(user.id)
                            ? 'fill-red-500 text-red-500'
                            : ''
                        }`}
                      />
                      {selectedItem.likes}
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-5 h-5" />
                      {selectedItem.comments.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedItem.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          {comment.userId.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white">
                          {comment.content}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      onClick={() => handleAddComment(selectedItem.id)}
                      disabled={!comment.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderEditModal = () => (
    <AnimatePresence>
      {editingItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Edit Item
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateItem(editingItem.id, {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
                  isPublic: formData.get('isPublic') === 'true'
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingItem.title}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingItem.description}
                  rows={3}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  defaultValue={editingItem.tags.join(', ')}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Visibility
                </label>
                <select
                  name="isPublic"
                  defaultValue={editingItem.isPublic.toString()}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="true">Public</option>
                  <option value="false">Private</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Gallery
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Filter className="w-5 h-5" />
                Filter
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <button
                      onClick={() => handleFilterChange({ type: 'tattoo' })}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Tattoos
                    </button>
                    <button
                      onClick={() => handleFilterChange({ type: 'design' })}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Designs
                    </button>
                    <button
                      onClick={() => handleFilterChange({ type: 'inspiration' })}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      Inspiration
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {renderGalleryGrid()}
        {renderItemModal()}
        {renderEditModal()}
      </div>
    </div>
  );
}
