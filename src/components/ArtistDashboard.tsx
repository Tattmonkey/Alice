import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  Image,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
  designUrl?: string;
}

interface Order {
  id: string;
  clientName: string;
  designUrl: string;
  status: 'pending' | 'in_progress' | 'completed';
  price: number;
  date: string;
}

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'orders' | 'portfolio'>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState({ daily: 0, weekly: 0, monthly: 0 });

  useEffect(() => {
    // Fetch artist data from Firestore
    const fetchArtistData = async () => {
      try {
        // TODO: Implement Firestore fetching
        // For now, using mock data
        setAppointments([
          {
            id: '1',
            clientName: 'John Doe',
            date: '2024-12-15',
            time: '14:00',
            status: 'pending',
          },
          {
            id: '2',
            clientName: 'Jane Smith',
            date: '2024-12-16',
            time: '15:30',
            status: 'confirmed',
            designUrl: 'https://example.com/design1.jpg',
          },
        ]);

        setOrders([
          {
            id: '1',
            clientName: 'Alice Johnson',
            designUrl: 'https://example.com/design2.jpg',
            status: 'in_progress',
            price: 299,
            date: '2024-12-12',
          },
          {
            id: '2',
            clientName: 'Bob Wilson',
            designUrl: 'https://example.com/design3.jpg',
            status: 'completed',
            price: 399,
            date: '2024-12-11',
          },
        ]);

        setEarnings({
          daily: 599,
          weekly: 2499,
          monthly: 8999,
        });
      } catch (error) {
        console.error('Error fetching artist data:', error);
      }
    };

    fetchArtistData();
  }, []);

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Earnings Cards */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-[#1a0b2e] p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <DollarSign className="w-8 h-8 text-green-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          R{earnings.daily}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">Daily Earnings</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-[#1a0b2e] p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-8 h-8 text-blue-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">This Week</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          R{earnings.weekly}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">Weekly Earnings</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-[#1a0b2e] p-6 rounded-xl shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <Users className="w-8 h-8 text-purple-500" />
          <span className="text-sm text-gray-500 dark:text-gray-400">This Month</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          R{earnings.monthly}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">Monthly Earnings</p>
      </motion.div>

      {/* Recent Activity */}
      <div className="col-span-full">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="bg-white dark:bg-[#1a0b2e] rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-4">
                  <Clock className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {appointment.clientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-600'
                      : appointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="bg-white dark:bg-[#1a0b2e] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Upcoming Appointments
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-300"
        >
          Add Appointment
        </motion.button>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <motion.div
            key={appointment.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {appointment.clientName}
                </h4>
                <p className="text-sm text-gray-500">
                  {appointment.date} at {appointment.time}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-600'
                      : appointment.status === 'completed'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Settings className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="bg-white dark:bg-[#1a0b2e] rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Recent Orders
        </h3>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            whileHover={{ scale: 1.01 }}
            className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={order.designUrl}
                  alt="Design preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {order.clientName}
                  </h4>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  R{order.price}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : order.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {order.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-[#0f0616] dark:to-[#150a24] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Artist Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your appointments, orders, and portfolio
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'orders', label: 'Orders', icon: DollarSign },
            { id: 'portfolio', label: 'Portfolio', icon: Image },
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(id as any)}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 ${
                activeTab === id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-[#1a0b2e] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2d1b4e]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'portfolio' && (
          <div className="text-center py-12 text-gray-500">
            Portfolio management coming soon...
          </div>
        )}
      </div>
    </div>
  );
}
