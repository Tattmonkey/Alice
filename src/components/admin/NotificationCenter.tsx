import React from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

const notifications = [
  {
    id: 1,
    type: 'success',
    message: 'New user registration',
    time: '2 minutes ago',
    icon: CheckCircle,
  },
  {
    id: 2,
    type: 'warning',
    message: 'Low credit balance alert',
    time: '1 hour ago',
    icon: AlertTriangle,
  },
  {
    id: 3,
    type: 'info',
    message: 'System maintenance scheduled',
    time: '2 hours ago',
    icon: Bell,
  },
];

export default function NotificationCenter() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-6">Recent Notifications</h3>
        
        <div className="space-y-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg flex items-start space-x-4 ${
                notification.type === 'success'
                  ? 'bg-green-50'
                  : notification.type === 'warning'
                  ? 'bg-yellow-50'
                  : 'bg-blue-50'
              }`}
            >
              <notification.icon
                className={`w-5 h-5 ${
                  notification.type === 'success'
                    ? 'text-green-600'
                    : notification.type === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`}
              />
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{notification.message}</p>
                <p className="text-sm text-gray-500">{notification.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-6">Notification Settings</h3>
        
        <div className="space-y-4">
          {[
            { id: 'new-users', label: 'New User Registrations' },
            { id: 'low-credits', label: 'Low Credit Alerts' },
            { id: 'payments', label: 'Payment Notifications' },
            { id: 'system', label: 'System Updates' },
          ].map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <label htmlFor={setting.id} className="text-gray-700">
                {setting.label}
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id={setting.id}
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}