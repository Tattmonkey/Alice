import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { PortfolioItem } from '../../types/artist';
import { toast } from 'react-toastify';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';

interface ArtistPortfolioProps {
  portfolio: PortfolioItem[];
  artistId: string;
  onUpdate: (portfolio: PortfolioItem[]) => void;
}

const ArtistPortfolio: React.FC<ArtistPortfolioProps> = ({ portfolio, artistId, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    title: '',
    description: '',
    category: '',
    tags: []
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !newItem.title) {
      toast.error('Please select a file and provide a title');
      return;
    }

    setLoading(true);
    try {
      // Upload image to Firebase Storage
      const imageRef = ref(storage, `portfolio/${artistId}/${Date.now()}_${selectedFile.name}`);
      const uploadResult = await uploadBytes(imageRef, selectedFile);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Create new portfolio item
      const newPortfolioItem: PortfolioItem = {
        id: Date.now().toString(),
        imageUrl,
        title: newItem.title,
        description: newItem.description || '',
        category: newItem.category || 'Other',
        tags: newItem.tags || [],
        createdAt: new Date().toISOString(),
        likes: 0
      };

      // Update Firestore
      await updateDoc(doc(db, 'artists', artistId), {
        portfolio: arrayUnion(newPortfolioItem)
      });

      // Update local state
      onUpdate([...portfolio, newPortfolioItem]);
      
      // Reset form
      setSelectedFile(null);
      setNewItem({
        title: '',
        description: '',
        category: '',
        tags: []
      });
      
      toast.success('Portfolio item added successfully');
    } catch (error) {
      console.error('Error uploading portfolio item:', error);
      toast.error('Failed to upload portfolio item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: PortfolioItem) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setLoading(true);
    try {
      // Delete image from Storage
      const imageRef = ref(storage, item.imageUrl);
      await deleteObject(imageRef);

      // Update Firestore
      await updateDoc(doc(db, 'artists', artistId), {
        portfolio: arrayRemove(item)
      });

      // Update local state
      onUpdate(portfolio.filter(p => p.id !== item.id));
      
      toast.success('Portfolio item deleted successfully');
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error('Failed to delete portfolio item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Upload New Work</h2>
        <div className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4"
          />
          <Input
            placeholder="Title"
            value={newItem.title}
            onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
          />
          <Textarea
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
          />
          <Input
            placeholder="Category"
            value={newItem.category}
            onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
          />
          <Input
            placeholder="Tags (comma separated)"
            value={newItem.tags?.join(', ')}
            onChange={(e) => setNewItem(prev => ({ 
              ...prev, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
            }))}
          />
          <Button 
            onClick={handleUpload} 
            disabled={loading || !selectedFile}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Upload
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolio.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Implement edit */}}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ArtistPortfolio;
