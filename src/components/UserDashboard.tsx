import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, ShoppingBag, Palette, ChevronRight, Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CreditPlans from './CreditPlans';

export default function UserDashboard() {
  const { user, switchToArtist } = useAuth();
  const navigate = useNavigate();
  const [showCreditPlans, setShowCreditPlans] = useState(false);

  const handleArtistConversion = async () => {
    try {
      await switchToArtist();
      navigate('/artist/dashboard');
    } catch (error) {
      console.error('Error converting to artist account:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-[#0f0616] dark:to-[#150a24] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your orders, appointments, and credits
          </p>
        </div>

        {/* Credits Section */}
        <div className="bg-white dark:bg-[#1a0b2e] rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Your Credits
              </h2>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {user?.credits || 0} credits
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreditPlans(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Top Up Credits
            </motion.button>
          </div>
          
          {showCreditPlans && (
            <CreditPlans onClose={() => setShowCreditPlans(false)} />
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Orders Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-[#1a0b2e] p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingBag className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">View All</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recent Orders</h3>
            <p className="text-gray-600 dark:text-gray-300">Track and manage your orders</p>
          </motion.div>

          {/* Appointments Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-[#1a0b2e] p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Schedule</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Appointments</h3>
            <p className="text-gray-600 dark:text-gray-300">View and book appointments</p>
          </motion.div>

          {/* Credit History Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-[#1a0b2e] p-6 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">History</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Credit History</h3>
            <p className="text-gray-600 dark:text-gray-300">View your credit transactions</p>
          </motion.div>
        </div>

        {/* Become an Artist Section */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Become an Artist</h2>
              <p className="text-purple-100 mb-4">
                Share your artwork and connect with clients
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleArtistConversion}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-all duration-300 flex items-center gap-2"
              >
                <Palette className="w-5 h-5" />
                Convert to Artist Account
              </motion.button>
            </div>
            <ChevronRight className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}