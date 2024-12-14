import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  ShoppingBag,
  Settings,
  FileText,
  BarChart2,
  Bell,
  CreditCard,
  Truck,
  Palette
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role?.type !== 'admin') {
    return (
      <div className="text-red-500 p-4">
        Must be an admin to access this page
      </div>
    );
  }

  const DashboardCard = ({ 
    title, 
    description, 
    icon: Icon, 
    to 
  }: {
    title: string;
    description: string;
    icon: React.ElementType;
    to: string;
  }) => (
    <Link to={to}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Admin Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="User Management"
          description="Manage users and artist applications"
          icon={Users}
          to="/admin/users"
        />

        <DashboardCard
          title="Product Management"
          description="Manage products and inventory"
          icon={ShoppingBag}
          to="/admin/products"
        />

        <DashboardCard
          title="Blog Management"
          description="Manage blog posts and articles"
          icon={FileText}
          to="/admin/blog"
        />

        <DashboardCard
          title="Analytics"
          description="View site statistics and reports"
          icon={BarChart2}
          to="/admin/analytics"
        />

        <DashboardCard
          title="Notifications"
          description="Manage system notifications"
          icon={Bell}
          to="/admin/notifications"
        />

        <DashboardCard
          title="Payment Settings"
          description="Configure payment options"
          icon={CreditCard}
          to="/admin/payments"
        />

        <DashboardCard
          title="Shipping Settings"
          description="Configure shipping options"
          icon={Truck}
          to="/admin/shipping"
        />

        <DashboardCard
          title="Artist Settings"
          description="Configure artist-related settings"
          icon={Palette}
          to="/admin/artist-settings"
        />

        <DashboardCard
          title="API Settings"
          description="Manage API keys and integrations"
          icon={Settings}
          to="/admin/api"
        />
      </div>
    </div>
  );
}
