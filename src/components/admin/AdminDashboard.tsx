import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Users, CreditCard, Image, Bell, Key, BarChart3, BookOpen, Package, ShoppingBag, Loader2, UserCog, Truck } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import StatsPanel from './StatsPanel';
import APISettings from './APISettings';
import BrandingSettings from './BrandingSettings';
import PaymentSettings from './PaymentSettings';
import NotificationCenter from './NotificationCenter';
import BlogManager from './BlogManager';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';
import InventoryManager from './InventoryManager';
import UserManager from './UserManager';
import ShippingManager from './shipping/ShippingManager';

const tabs = [
  { id: 'stats', name: 'Statistics', icon: BarChart3 },
  { id: 'users', name: 'Users', icon: UserCog },
  { id: 'products', name: 'Products', icon: Package },
  { id: 'orders', name: 'Orders', icon: ShoppingBag },
  { id: 'inventory', name: 'Inventory', icon: Package },
  { id: 'shipping', name: 'Shipping', icon: Truck },
  { id: 'branding', name: 'Branding', icon: Image },
  { id: 'api', name: 'API Keys', icon: Key },
  { id: 'payments', name: 'Payments', icon: CreditCard },
  { id: 'blog', name: 'Blog', icon: BookOpen },
  { id: 'notifications', name: 'Notifications', icon: Bell },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setupFirestoreListener = () => {
      const unsubscribe = onSnapshot(
        collection(db, 'stats'),
        (snapshot) => {
          // Handle stats updates
        },
        (error) => {
          if (error.code === 'unavailable') {
            toast.error('Lost connection to server. Some features may be limited.');
          }
        }
      );
      return unsubscribe;
    };

    const unsubscribe = setupFirestoreListener();
    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <StatsPanel />;
      case 'users':
        return <UserManager />;
      case 'products':
        return <ProductManager />;
      case 'orders':
        return <OrderManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'shipping':
        return <ShippingManager />;
      case 'branding':
        return <BrandingSettings />;
      case 'api':
        return <APISettings />;
      case 'payments':
        return <PaymentSettings />;
      case 'blog':
        return <BlogManager />;
      case 'notifications':
        return <NotificationCenter />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold">Admin Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } transition-all duration-200 min-w-[120px] whitespace-nowrap`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.name}
            </motion.button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}