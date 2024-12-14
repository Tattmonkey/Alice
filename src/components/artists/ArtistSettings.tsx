import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Save,
  Upload,
  Trash2,
  Plus,
  X,
  Clock,
  Calendar,
  Loader
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

interface ArtistProfile {
  displayName: string;
  bio: string;
  specialties: string[];
  experience: string;
  portfolio: string[];
  services: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
    requiresConsultation: boolean;
  }>;
  availability: {
    schedule: Record<string, {
      start: string;
      end: string;
    }>;
    exceptions: Array<{
      date: string;
      available: boolean;
    }>;
  };
}

export default function ArtistSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ArtistProfile>({
    displayName: user?.displayName || '',
    bio: '',
    specialties: [],
    experience: '',
    portfolio: [],
    services: [],
    availability: {
      schedule: {},
      exceptions: []
    }
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profileDoc = await getDoc(doc(db, 'artistProfiles', user.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data() as ArtistProfile);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      await updateDoc(doc(db, 'artistProfiles', user.uid), {
        ...profile,
        updatedAt: new Date().toISOString()
      });
      navigate('/artist/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.length) return;

    try {
      setError(null);
      const file = event.target.files[0];
      const imageRef = ref(storage, `portfolio/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setProfile(prev => ({
        ...prev,
        portfolio: [...prev.portfolio, url]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    }
  };

  const handleImageDelete = async (url: string) => {
    if (!user) return;

    try {
      setError(null);
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
      setProfile(prev => ({
        ...prev,
        portfolio: prev.portfolio.filter(img => img !== url)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const addService = () => {
    setProfile(prev => ({
      ...prev,
      services: [
        ...prev.services,
        {
          id: Date.now().toString(),
          name: '',
          description: '',
          price: 0,
          duration: 60,
          requiresConsultation: false
        }
      ]
    }));
  };

  const updateService = (id: string, updates: Partial<ArtistProfile['services'][0]>) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === id ? { ...service, ...updates } : service
      )
    }));
  };

  const removeService = (id: string) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== id)
    }));
  };

  if (loading) return <div className="flex justify-center items-center h-screen">
    <Loader className="w-8 h-8 animate-spin text-purple-600" />
  </div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Artist Settings
        </h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </motion.button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Basic Information */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={e => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Experience
              </label>
              <textarea
                value={profile.experience}
                onChange={e => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
              />
            </div>
          </div>
        </section>

        {/* Portfolio */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Portfolio
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {profile.portfolio.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleImageDelete(image)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full 
                    opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label className="relative flex items-center justify-center w-full h-48 border-2 
              border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer 
              hover:border-purple-500 transition-colors">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">Upload Image</span>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* Services */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Services
            </h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addService}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                flex items-center gap-1 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </motion.button>
          </div>
          <div className="space-y-4">
            {profile.services.map(service => (
              <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <input
                    type="text"
                    value={service.name}
                    onChange={e => updateService(service.id, { name: e.target.value })}
                    placeholder="Service Name"
                    className="text-lg font-medium bg-transparent border-none focus:outline-none 
                      text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => removeService(service.id)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={service.description}
                      onChange={e => updateService(service.id, { description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                        focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={e => updateService(service.id, { price: Number(e.target.value) })}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={service.duration}
                        onChange={e => updateService(service.id, { duration: Number(e.target.value) })}
                        min="15"
                        step="15"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-900"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`consultation-${service.id}`}
                        checked={service.requiresConsultation}
                        onChange={e => updateService(service.id, { requiresConsultation: e.target.checked })}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <label
                        htmlFor={`consultation-${service.id}`}
                        className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        Requires Consultation
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Availability */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Availability
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Regular Schedule
              </h3>
              {/* Add schedule management UI here */}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Exceptions
              </h3>
              {/* Add exceptions management UI here */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
