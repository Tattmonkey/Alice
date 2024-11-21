import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function APISettings() {
  const [showKeys, setShowKeys] = useState(false);
  const [keys, setKeys] = useState({
    ikhokha: {
      merchantId: import.meta.env.VITE_IKHOKHA_MERCHANT_ID || '',
      apiKey: import.meta.env.VITE_IKHOKHA_API_KEY || '',
    },
    imageGeneration: {
      apiKey: '',
      model: 'dall-e-3',
    },
  });

  const handleSave = async () => {
    try {
      // Here you would implement the API call to save the keys
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('API settings saved successfully');
    } catch (error) {
      toast.error('Failed to save API settings');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">API Configuration</h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowKeys(!showKeys)}
            className="text-gray-600 hover:text-gray-900"
          >
            {showKeys ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">iKhokha Payment Gateway</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Merchant ID
                </label>
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={keys.ikhokha.merchantId}
                  onChange={(e) => setKeys({
                    ...keys,
                    ikhokha: { ...keys.ikhokha, merchantId: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={keys.ikhokha.apiKey}
                  onChange={(e) => setKeys({
                    ...keys,
                    ikhokha: { ...keys.ikhokha, apiKey: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Image Generation API</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type={showKeys ? 'text' : 'password'}
                  value={keys.imageGeneration.apiKey}
                  onChange={(e) => setKeys({
                    ...keys,
                    imageGeneration: { ...keys.imageGeneration, apiKey: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={keys.imageGeneration.model}
                  onChange={(e) => setKeys({
                    ...keys,
                    imageGeneration: { ...keys.imageGeneration, model: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="dall-e-3">DALL-E 3</option>
                  <option value="dall-e-2">DALL-E 2</option>
                  <option value="stable-diffusion">Stable Diffusion</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
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
    </div>
  );
}