import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, MapPin, Link as LinkIcon, Save, Instagram, Facebook, Twitter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { storage, db } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  website?: string;
}

interface ArtistProfile {
  displayName: string;
  bio: string;
  location: string;
  specialties: string[];
  experience: string;
  socialLinks: SocialLinks;
  profileImage?: string;
  coverImage?: string;
  hourlyRate?: string;
  availability?: string;
  languages?: string[];
}

const specialtyOptions = [
  'Traditional',
  'Neo-Traditional',
  'Japanese',
  'Realism',
  'Black & Grey',
  'Color',
  'Watercolor',
  'Tribal',
  'Blackwork',
  'Minimalist',
  'Portrait',
  'Custom Design',
];

const languageOptions = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hebrew',
];

export default function ArtistSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ArtistProfile>({
    displayName: user?.displayName || '',
    bio: '',
    location: '',
    specialties: [],
    experience: '',
    socialLinks: {},
    hourlyRate: '',
    availability: '',
    languages: ['English'],
  });
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (!user) return;
      try {
        const artistDoc = await doc(db, 'artists', user.uid);
        const artistData = (await artistDoc).data();
        if (artistData) {
          setProfile(prev => ({
            ...prev,
            ...artistData,
          }));
        }
      } catch (error) {
        console.error('Error fetching artist profile:', error);
      }
    };
    fetchArtistProfile();
  }, [user]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    if (!event.target.files || !event.target.files[0] || !user) return;

    const file = event.target.files[0];
    const setUploading = type === 'profile' ? setUploadingProfile : setUploadingCover;
    setUploading(true);

    try {
      const storageRef = ref(storage, `artists/${user.uid}/${type}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setProfile(prev => ({
        ...prev,
        [type === 'profile' ? 'profileImage' : 'coverImage']: downloadURL,
      }));

      showSuccessToast(`${type === 'profile' ? 'Profile' : 'Cover'} image uploaded successfully`);
    } catch (error) {
      console.error('Error uploading image:', error);
      showErrorToast(`Failed to upload ${type} image`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const artistRef = doc(db, 'artists', user.uid);
      await updateDoc(artistRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
      });

      // Update user profile in auth context
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: profile.displayName,
        photoURL: profile.profileImage,
        updatedAt: new Date().toISOString(),
      });

      showSuccessToast('Profile saved successfully');
      navigate('/artist/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      showErrorToast('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="relative h-48 rounded-t-lg overflow-hidden">
            {profile.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-500" />
            )}
            <label className="absolute bottom-4 right-4 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'cover')}
                className="hidden"
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow text-sm"
              >
                <Upload className="w-4 h-4" />
                {uploadingCover ? 'Uploading...' : 'Upload Cover'}
              </motion.div>
            </label>
          </div>

          <div className="p-6">
            <div className="flex flex-col gap-6">
              {/* Profile Image Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Upload className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profile')}
                      className="hidden"
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-purple-600 text-white rounded-full shadow"
                    >
                      <Upload className="w-4 h-4" />
                    </motion.div>
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    value={profile.displayName}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Display Name"
                    className="text-xl font-bold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell clients about yourself and your work..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specialties
                </label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((specialty) => (
                    <motion.button
                      key={specialty}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          specialties: prev.specialties.includes(specialty)
                            ? prev.specialties.filter(s => s !== specialty)
                            : [...prev.specialties, specialty]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.specialties.includes(specialty)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {specialty}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((language) => (
                    <motion.button
                      key={language}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          languages: prev.languages?.includes(language)
                            ? prev.languages.filter(l => l !== language)
                            : [...(prev.languages || []), language]
                        }));
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.languages?.includes(language)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {language}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Experience and Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="text"
                    value={profile.experience}
                    onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                    placeholder="e.g., 5+ years"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hourly Rate
                  </label>
                  <input
                    type="text"
                    value={profile.hourlyRate}
                    onChange={(e) => setProfile(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="e.g., $150/hour"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Availability
                </label>
                <input
                  type="text"
                  value={profile.availability}
                  onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value }))}
                  placeholder="e.g., Available weekdays, 3-month waiting list"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                />
              </div>

              {/* Social Links */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Social Links
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.socialLinks.instagram || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                      }))}
                      placeholder="Instagram Profile URL"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.socialLinks.facebook || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                      }))}
                      placeholder="Facebook Profile URL"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.socialLinks.twitter || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                      }))}
                      placeholder="Twitter Profile URL"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={profile.socialLinks.website || ''}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        socialLinks: { ...prev.socialLinks, website: e.target.value }
                      }))}
                      placeholder="Personal Website URL"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-purple-600 dark:focus:border-purple-400 bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Profile</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
