import React from 'react';
import { motion } from 'framer-motion';
import { Users, Star, DollarSign, Calendar, TrendingUp, BarChart } from 'lucide-react';
import { User } from '../../types';

interface Props {
  user: User;
}

export default function ArtistStats({ user }: Props) {
  const stats = [
    {
      id: 'bookings',
      name: 'Total Bookings',
      value: user.bookings.length,
      change: '+12.3%',
      trend: 'up',
      icon: Calendar,
    },
    {
      id: 'clients',
      name: 'Total Clients',
      value: '45',
      change: '+8.7%',
      trend: 'up',
      icon: Users,
    },
    {
      id: 'rating',
      name: 'Average Rating',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: Star,
    },
    {
      id: 'revenue',
      name: 'Monthly Revenue',
      value: 'R12,450',
      change: '+15.2%',
      trend: 'up',
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold mt-4">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Booking History</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <BarChart className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue History</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}