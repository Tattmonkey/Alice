import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Save, Trash2, Palette, Mail, Phone, MapPin, Image as ImageIcon, Type } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
}

interface SocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  tumblr: string;
  x: string;
}

interface BrandIdentity {
  siteName: string;
  tagline: string;
  logo: string | null;
  favicon: string | null;
}

export default function BrandingSettings() {
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity>({
    siteName: 'Alice Tattoos',
    tagline: 'Transform Your Ideas Into Beautiful Tattoo Designs',
    logo: null,
    favicon: null
  });
  const [colors, setColors] = useState<ColorScheme>({
    primary: '#9333EA',
    secondary: '#4F46E5',
    accent: '#EC4899',
    background: '#F9FAFB',
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'support@alicetattoos.com',
    phone: '071 462 1132',
    location: 'East London, South Africa',
  });
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    tumblr: '',
    x: '',
  });

  const onLogoDropAccepted = async (files: File[]) => {
    const file = files[0];
    try {
      const storageRef = ref(storage, `branding/logo-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setLogoPreview(url);
      setBrandIdentity(prev => ({ ...prev, logo: url }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    }
  };

  const onFaviconDropAccepted = async (files: File[]) => {
    const file = files[0];
    try {
      const storageRef = ref(storage, `branding/favicon-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFaviconPreview(url);
      setBrandIdentity(prev => ({ ...prev, favicon: url }));
      toast.success('Favicon uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload favicon');
    }
  };

  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } = useDropzone({
    onDropAccepted: onLogoDropAccepted,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    },
    maxFiles: 1
  });

  const { getRootProps: getFaviconRootProps, getInputProps: getFaviconInputProps } = useDropzone({
    onDropAccepted: onFaviconDropAccepted,
    accept: {
      'image/*': ['.png', '.ico']
    },
    maxFiles: 1
  });

  const handleColorChange = (key: keyof ColorScheme, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleContactChange = (key: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [key]: value }));
  };

  const handleSocialChange = (key: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      // Here you would implement the API call to save all settings
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="space-y-8">
      {/* Brand Identity Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Type className="w-5 h-5 text-purple-600" />
          Brand Identity
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={brandIdentity.siteName}
              onChange={(e) => setBrandIdentity(prev => ({ ...prev, siteName: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={brandIdentity.tagline}
              onChange={(e) => setBrandIdentity(prev => ({ ...prev, tagline: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo
              </label>
              <div
                {...getLogoRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
              >
                <input {...getLogoInputProps()} />
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-32 mx-auto"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLogoPreview('');
                        setBrandIdentity(prev => ({ ...prev, logo: null }));
                      }}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Drop logo here or click to upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended size: 200x50px
                    </p>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <div
                {...getFaviconRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors"
              >
                <input {...getFaviconInputProps()} />
                {faviconPreview ? (
                  <div className="relative">
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="w-16 h-16 mx-auto"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFaviconPreview('');
                        setBrandIdentity(prev => ({ ...prev, favicon: null }));
                      }}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Drop favicon here or click to upload
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended size: 32x32px
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Color Scheme Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-600" />
          Color Scheme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value)}
                  className="w-12 h-10 rounded border border-gray-200"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-6">Contact Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={contactInfo.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => handleContactChange('phone', e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={contactInfo.location}
                onChange={(e) => handleContactChange('location', e.target.value)}
                className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Links Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-6">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(socialLinks).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key === 'x' ? 'X (Twitter)' : key}
              </label>
              <input
                type="url"
                value={value}
                onChange={(e) => handleSocialChange(key as keyof SocialLinks, e.target.value)}
                placeholder={`https://${key}.com/...`}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setLogo(null);
            setFavicon(null);
            setLogoPreview('');
            setFaviconPreview('');
            setColors({
              primary: '#9333EA',
              secondary: '#4F46E5',
              accent: '#EC4899',
              background: '#F9FAFB',
            });
            setContactInfo({
              email: 'support@alicetattoos.com',
              phone: '071 462 1132',
              location: 'East London, South Africa',
            });
            setSocialLinks({
              facebook: '',
              twitter: '',
              instagram: '',
              youtube: '',
              tiktok: '',
              tumblr: '',
              x: '',
            });
          }}
          className="px-6 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Reset All
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </motion.button>
      </div>
    </div>
  );
}