import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Upload, MapPin, DollarSign, Camera, Save, Loader2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import UserAvatar from '../UserAvatar';

const schema = z.object({
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  location: z.string().min(3, 'Please enter a valid location'),
  hourlyRate: z.number().min(1, 'Please enter a valid rate'),
  specialties: z.array(z.string()).min(1, 'Select at least one specialty'),
  socials: z.object({
    instagram: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    behance: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal(''))
  })
});

type FormData = z.infer<typeof schema>;

const specialties = [
  'Traditional',
  'Neo-Traditional',
  'Japanese',
  'Blackwork',
  'Realism',
  'Watercolor',
  'Tribal',
  'Minimalist',
  'Geometric',
  'Portrait',
  'Script',
  'Ornamental'
];

interface Props {
  onComplete: () => void;
}

export default function ArtistProfileSetup({ onComplete }: Props) {
  const [loading, setLoading] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<File[]>([]);
  const [portfolioPreviews, setPortfolioPreviews] = useState<string[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      specialties: [],
      socials: {
        instagram: '',
        facebook: '',
        twitter: '',
        youtube: '',
        tiktok: '',
        behance: '',
        website: ''
      }
    }
  });

  const handlePortfolioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPortfolioImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      // Here you would upload the avatar and portfolio images
      // and create the artist profile with the form data

      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
      onComplete();
      toast.success('Artist profile created successfully!');
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error('Failed to create artist profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6">Create Your Artist Profile</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Profile Picture
            </label>
            <div className="flex flex-col items-center gap-4">
              <UserAvatar size="lg" showUpload={true} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click the upload icon to change your profile picture
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
              placeholder="Tell potential clients about yourself, your experience, and your style..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('location')}
                  type="text"
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="Your studio location"
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hourly Rate (ZAR)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('hourlyRate', { valueAsNumber: true })}
                  type="number"
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                  placeholder="Your hourly rate"
                />
              </div>
              {errors.hourlyRate && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.hourlyRate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => (
                <label
                  key={specialty}
                  className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    watch('specialties')?.includes(specialty)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={specialty}
                    {...register('specialties')}
                    className="hidden"
                  />
                  {specialty}
                </label>
              ))}
            </div>
            {errors.specialties && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.specialties.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Portfolio Images
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {portfolioPreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={preview}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPortfolioImages(prev => prev.filter((_, i) => i !== index));
                      setPortfolioPreviews(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-purple-500 transition-colors">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Add Image</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePortfolioChange}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Social Media Links
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(watch('socials')).map(([platform]) => (
                <div key={platform}>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                    {platform}
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register(`socials.${platform as keyof typeof schema.shape.socials}`)}
                      type="url"
                      placeholder={`https://${platform}.com/yourusername`}
                      className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Create Profile
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}