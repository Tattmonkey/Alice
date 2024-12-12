import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Tag, Upload, File, Info } from 'lucide-react';
import { Product, DownloadableProduct } from '../../../types';
import ImageUpload from './ImageUpload';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../config/firebase';
import toast from 'react-hot-toast';

interface Props {
  product: Partial<Product | DownloadableProduct>;
  onChange: (field: keyof (Product | DownloadableProduct), value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
  categories: string[];
}

export default function ProductForm({ product, onChange, onSubmit, onCancel, isEditing, categories }: Props) {
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    onChange('fileSize', (file.size / (1024 * 1024)).toFixed(2) + ' MB');
    onChange('fileType', file.type);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadingFile(true);
      const storageRef = ref(storage, `downloads/${Date.now()}-${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const url = await getDownloadURL(storageRef);
      onChange('downloadUrl', url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Name
        </label>
        <input
          type="text"
          value={product.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={product.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (ZAR)
          </label>
          <input
            type="number"
            value={product.price || ''}
            onChange={(e) => onChange('price', parseFloat(e.target.value))}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SKU
          </label>
          <input
            type="text"
            value={product.sku || ''}
            onChange={(e) => onChange('sku', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={product.category || ''}
          onChange={(e) => onChange('category', e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images
        </label>
        <ImageUpload
          images={product.images || []}
          onImagesChange={(urls) => onChange('images', urls)}
        />
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="isDownloadable"
            checked={(product as DownloadableProduct).isDownloadable || false}
            onChange={(e) => onChange('isDownloadable', e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
          />
          <label htmlFor="isDownloadable" className="ml-2 text-sm font-medium text-gray-700">
            This is a downloadable product
          </label>
        </div>

        {(product as DownloadableProduct).isDownloadable && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Download Limit (per purchase)
              </label>
              <input
                type="number"
                value={(product as DownloadableProduct).downloadLimit || ''}
                onChange={(e) => onChange('downloadLimit', parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Downloadable File
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="productFile"
                />
                <label
                  htmlFor="productFile"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 cursor-pointer"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                </label>
                {selectedFile && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <File className="w-4 h-4" />
                      {selectedFile.name}
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFileUpload}
                      disabled={uploadingFile}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {uploadingFile ? 'Uploading...' : 'Upload File'}
                    </motion.button>
                  </div>
                )}
                {(product as DownloadableProduct).downloadUrl && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Info className="w-4 h-4" />
                    File uploaded successfully
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isEditing ? 'Update Product' : 'Create Product'}
        </motion.button>
      </div>
    </form>
  );
}