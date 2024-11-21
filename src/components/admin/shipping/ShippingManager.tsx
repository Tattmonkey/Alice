import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Edit2, Trash2, Save, X, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  rates: ShippingRate[];
}

interface ShippingRate {
  id: string;
  name: string;
  minWeight?: number;
  maxWeight?: number;
  price: number;
  freeAbove?: number;
}

export default function ShippingManager() {
  const [zones, setZones] = useState<ShippingZone[]>([
    {
      id: '1',
      name: 'South Africa',
      regions: ['Eastern Cape', 'Western Cape', 'Gauteng'],
      rates: [
        {
          id: '1',
          name: 'Standard Shipping',
          price: 50,
          freeAbove: 1000
        },
        {
          id: '2',
          name: 'Express Shipping',
          price: 150
        }
      ]
    }
  ]);

  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);

  const handleAddZone = (zone: ShippingZone) => {
    setZones([...zones, { ...zone, id: Date.now().toString() }]);
    setShowZoneForm(false);
    toast.success('Shipping zone added successfully');
  };

  const handleEditZone = (zone: ShippingZone) => {
    setZones(zones.map(z => z.id === zone.id ? zone : z));
    setEditingZone(null);
    toast.success('Shipping zone updated successfully');
  };

  const handleDeleteZone = (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this shipping zone?')) return;
    setZones(zones.filter(z => z.id !== zoneId));
    toast.success('Shipping zone deleted successfully');
  };

  const handleAddRate = (zoneId: string, rate: ShippingRate) => {
    setZones(zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          rates: [...zone.rates, { ...rate, id: Date.now().toString() }]
        };
      }
      return zone;
    }));
    setShowRateForm(false);
    toast.success('Shipping rate added successfully');
  };

  const handleEditRate = (zoneId: string, rate: ShippingRate) => {
    setZones(zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          rates: zone.rates.map(r => r.id === rate.id ? rate : r)
        };
      }
      return zone;
    }));
    setEditingRate(null);
    toast.success('Shipping rate updated successfully');
  };

  const handleDeleteRate = (zoneId: string, rateId: string) => {
    if (!confirm('Are you sure you want to delete this shipping rate?')) return;
    setZones(zones.map(zone => {
      if (zone.id === zoneId) {
        return {
          ...zone,
          rates: zone.rates.filter(r => r.id !== rateId)
        };
      }
      return zone;
    }));
    toast.success('Shipping rate deleted successfully');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">Shipping Management</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowZoneForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Shipping Zone
        </motion.button>
      </div>

      <div className="space-y-6">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white rounded-xl border border-gray-100 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{zone.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4" />
                  {zone.regions.join(', ')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditingZone(zone)}
                  className="p-2 text-gray-600 hover:text-purple-600"
                >
                  <Edit2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteZone(zone.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Shipping Rates</h4>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowRateForm(true)}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Rate
                </motion.button>
              </div>

              <div className="grid gap-4">
                {zone.rates.map((rate) => (
                  <div
                    key={rate.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h5 className="font-medium">{rate.name}</h5>
                      <p className="text-sm text-gray-600">
                        R{rate.price.toFixed(2)}
                        {rate.freeAbove && ` (Free above R${rate.freeAbove})`}
                      </p>
                      {(rate.minWeight || rate.maxWeight) && (
                        <p className="text-sm text-gray-500">
                          Weight: {rate.minWeight || 0}kg - {rate.maxWeight || '∞'}kg
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingRate(rate)}
                        className="p-2 text-gray-600 hover:text-purple-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteRate(zone.id, rate.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zone Form Modal */}
      {showZoneForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Shipping Zone</h3>
            {/* Zone form fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., South Africa"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regions
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter regions, one per line"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowZoneForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Save Zone
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Rate Form Modal */}
      {showRateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Shipping Rate</h3>
            {/* Rate form fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rate Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Standard Shipping"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (ZAR)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Above Amount (Optional)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Leave empty for no free shipping"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Weight (kg)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Weight (kg)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Leave empty for no limit"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowRateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Save Rate
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}