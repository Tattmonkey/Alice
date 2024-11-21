import React from 'react';
import { BarChart3, Users, CreditCard, Image, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const stats = [
  {
    id: 'users',
    name: 'Total Users',
    value: '1,234',
    change: '+12.3%',
    trend: 'up',
    icon: Users,
  },
  {
    id: 'generations',
    name: 'Total Generations',
    value: '45,678',
    change: '+8.7%',
    trend: 'up',
    icon: Image,
  },
  {
    id: 'revenue',
    name: 'Revenue (ZAR)',
    value: 'R123,456',
    change: '+15.2%',
    trend: 'up',
    icon: CreditCard,
  },
  {
    id: 'conversion',
    name: 'Conversion Rate',
    value: '4.2%',
    change: '+2.1%',
    trend: 'up',
    icon: TrendingUp,
  },
];

export default function StatsPanel() {
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
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
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
          <h3 className="text-lg font-semibold mb-4">Generation History</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue History</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}