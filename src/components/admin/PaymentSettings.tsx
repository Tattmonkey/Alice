import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Percent, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentSettings() {
  const handleSave = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Payment settings saved successfully');
    } catch (error) {
      toast.error('Failed to save payment settings');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-6">Payment Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price per Credit (ZAR)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                min="0"
                step="0.01"
                defaultValue="4.00"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profit Margin
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                min="0"
                max="100"
                defaultValue="50"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Credit Packages</h4>
          <div className="space-y-4">
            {[
              { name: 'Starter', credits: 25, price: 99 },
              { name: 'Value Pack', credits: 125, price: 349 },
              { name: 'Pro Pack', credits: 375, price: 799 },
            ].map((pack, index) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <input
                  defaultValue={pack.name}
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Package Name"
                />
                <input
                  type="number"
                  defaultValue={pack.credits}
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Credits"
                />
                <input
                  type="number"
                  defaultValue={pack.price}
                  className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Price (ZAR)"
                />
              </div>
            ))}
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