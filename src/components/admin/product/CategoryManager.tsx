import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  categories: string[];
  onCategoryChange: (categories: string[]) => void;
}

export default function CategoryManager({ categories, onCategoryChange }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editedCategory, setEditedCategory] = useState('');

  const handleAdd = () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (categories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }

    onCategoryChange([...categories, newCategory.trim()]);
    setNewCategory('');
    setIsAdding(false);
    toast.success('Category added successfully');
  };

  const handleEdit = (index: number) => {
    if (!editedCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    if (categories.includes(editedCategory.trim())) {
      toast.error('Category already exists');
      return;
    }

    const updatedCategories = [...categories];
    updatedCategories[index] = editedCategory.trim();
    onCategoryChange(updatedCategories);
    setEditingIndex(null);
    setEditedCategory('');
    toast.success('Category updated successfully');
  };

  const handleDelete = (index: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const updatedCategories = categories.filter((_, i) => i !== index);
    onCategoryChange(updatedCategories);
    toast.success('Category deleted successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">Categories</h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAdding(true)}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </motion.button>
      </div>

      <div className="space-y-2">
        {isAdding && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
              className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <Save className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsAdding(false);
                setNewCategory('');
              }}
              className="p-1 text-gray-600 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        )}

        {categories.map((category, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
            {editingIndex === index ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editedCategory}
                  onChange={(e) => setEditedCategory(e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleEdit(index)}
                  className="p-1 text-green-600 hover:text-green-700"
                >
                  <Save className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditingIndex(null);
                    setEditedCategory('');
                  }}
                  className="p-1 text-gray-600 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <>
                <span className="text-sm">{category}</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setEditingIndex(index);
                      setEditedCategory(category);
                    }}
                    className="p-1 text-gray-600 hover:text-purple-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(index)}
                    className="p-1 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}