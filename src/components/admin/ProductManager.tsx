import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, Save, Upload, Tag, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '../../types';
import ProductForm from './product/ProductForm';
import CategoryManager from './product/CategoryManager';

// Initial mock products
const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Tattoo Aftercare Kit',
    description: 'Complete kit for tattoo aftercare including healing cream, antibacterial soap, and moisturizer.',
    price: 299.99,
    images: ['https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&q=80'],
    category: 'Aftercare',
    tags: ['skincare', 'healing'],
    stock: 50,
    sku: 'TAK001',
    featured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Professional Tattoo Machine',
    description: 'High-quality tattoo machine for professional artists.',
    price: 1499.99,
    images: ['https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=800&q=80'],
    category: 'Equipment',
    tags: ['machine', 'professional'],
    stock: 15,
    sku: 'PTM001',
    featured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>(['Aftercare', 'Equipment', 'Accessories', 'Supplies']);

  const handleProductChange = (field: keyof Product, value: any) => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, [field]: value });
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingProduct) {
        // Update existing product
        setProducts(products.map(p => 
          p.id === editingProduct.id ? editingProduct : p
        ));
        toast.success('Product updated successfully');
      } else {
        // Add new product
        const newProduct: Product = {
          id: Date.now().toString(),
          name: '',
          description: '',
          price: 0,
          images: [],
          category: '',
          tags: [],
          stock: 0,
          sku: '',
          featured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProducts([newProduct, ...products]);
        toast.success('Product added successfully');
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleCategoryChange = (newCategories: string[]) => {
    setCategories(newCategories);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold">Products</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </motion.button>
        </div>

        {showForm ? (
          <ProductForm
            product={editingProduct || {}}
            onChange={handleProductChange}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            isEditing={!!editingProduct}
            categories={categories}
          />
        ) : (
          <>
            <div className="mb-8">
              <CategoryManager
                categories={categories}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      R{product.price}
                    </span>
                    <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      Stock: {product.stock}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-600 hover:text-purple-600"
                    >
                      <Edit2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}