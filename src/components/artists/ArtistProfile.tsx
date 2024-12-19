import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Save, Edit2, Instagram, Facebook, Twitter, Globe } from 'lucide-react';
import { ArtistProfile as ArtistProfileType } from '../../types/artist';
import { getArtistProfile, updateArtistProfile } from '../../utils/artist';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export default function ArtistProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ArtistProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ArtistProfileType>>({});

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user) return;
      const artistProfile = await getArtistProfile(user.uid);
      setProfile(artistProfile);
      setEditedProfile(artistProfile || {});
    } catch (error) {
      console.error('Error loading artist profile:', error);
      showErrorToast('Failed to load profile');
    }
  };

  const handleSave = async () => {
    try {
      if (!profile) return;
      await updateArtistProfile(profile.id, editedProfile);
      showSuccessToast('Profile updated successfully');
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      showErrorToast('Failed to update profile');
    }
  };

  const specialties = [
    'Traditional',
    'Neo-Traditional',
    'Japanese',
    'Realism',
    'Blackwork',
    'Tribal',
    'Watercolor',
    'Minimalist',
    'Custom',
  ];

  if (!profile) {
    return (
      <div className="p-4">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Artist Profile
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {isEditing ? (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 className="w-5 h-5" />
              Edit Profile
            </>
          )}
        </motion.button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.displayName || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, displayName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profile.displayName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profile.bio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Experience
              </label>
              {isEditing ? (
                <textarea
                  value={editedProfile.experience || ''}
                  onChange={(e) =>
                    setEditedProfile({ ...editedProfile, experience: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100">{profile.experience}</p>
              )}
            </div>
          </div>

          {/* Specialties and Contact */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Specialties
              </label>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2">
                  {specialties.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editedProfile.specialties?.includes(specialty) || false}
                        onChange={(e) => {
                          const updatedSpecialties = e.target.checked
                            ? [...(editedProfile.specialties || []), specialty]
                            : editedProfile.specialties?.filter((s) => s !== specialty) || [];
                          setEditedProfile({ ...editedProfile, specialties: updatedSpecialties });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {specialty}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.specialties?.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Information
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={editedProfile.contactInfo?.email || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        contactInfo: {
                          ...editedProfile.contactInfo,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="Email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="tel"
                    value={editedProfile.contactInfo?.phone || ''}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        contactInfo: {
                          ...editedProfile.contactInfo,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="Phone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-gray-900 dark:text-gray-100">
                    Email: {profile.contactInfo?.email}
                  </p>
                  {profile.contactInfo?.phone && (
                    <p className="text-gray-900 dark:text-gray-100">
                      Phone: {profile.contactInfo.phone}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Social Media
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={editedProfile.socialMedia?.instagram || ''}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          socialMedia: {
                            ...editedProfile.socialMedia,
                            instagram: e.target.value,
                          },
                        })
                      }
                      placeholder="Instagram username"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={editedProfile.socialMedia?.facebook || ''}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          socialMedia: {
                            ...editedProfile.socialMedia,
                            facebook: e.target.value,
                          },
                        })
                      }
                      placeholder="Facebook profile"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={editedProfile.socialMedia?.twitter || ''}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          socialMedia: {
                            ...editedProfile.socialMedia,
                            twitter: e.target.value,
                          },
                        })
                      }
                      placeholder="Twitter handle"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={editedProfile.socialMedia?.website || ''}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          socialMedia: {
                            ...editedProfile.socialMedia,
                            website: e.target.value,
                          },
                        })
                      }
                      placeholder="Personal website"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {profile.socialMedia?.instagram && (
                    <a
                      href={`https://instagram.com/${profile.socialMedia.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Instagram className="w-5 h-5" />
                      <span>@{profile.socialMedia.instagram}</span>
                    </a>
                  )}
                  {profile.socialMedia?.facebook && (
                    <a
                      href={profile.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Facebook className="w-5 h-5" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {profile.socialMedia?.twitter && (
                    <a
                      href={`https://twitter.com/${profile.socialMedia.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Twitter className="w-5 h-5" />
                      <span>@{profile.socialMedia.twitter}</span>
                    </a>
                  )}
                  {profile.socialMedia?.website && (
                    <a
                      href={profile.socialMedia.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <Globe className="w-5 h-5" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
