import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Palette, 
  Calendar, 
  MessageSquare, 
  Image as ImageIcon,
  Settings,
  ChevronRight,
  Loader,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import ProfileAvatar from './user/ProfileAvatar';
import AccountTypeConverter from './user/AccountTypeConverter';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('UserDashboard mounted, user:', user);
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Please sign in to view your dashboard</p>
      </div>
    );
  }

  // Check if user is already an artist
  const isArtist = user?.role?.type === 'artist';
  console.log('Current user role:', user?.role);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <ProfileAvatar size="lg" editable={true} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.displayName || 'Welcome!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.email}
          </p>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!isArtist && (
          <AccountTypeConverter />
        )}
        
        <DashboardCard
          icon={ImageIcon}
          title="My Gallery"
          description="View and manage your saved tattoo designs"
          onClick={() => navigate('/gallery')}
        />
        
        <DashboardCard
          icon={Calendar}
          title="My Bookings"
          description="View and manage your tattoo appointments"
          onClick={() => navigate('/bookings')}
        />
        
        <DashboardCard
          icon={Settings}
          title="Settings"
          description="Manage your account settings and preferences"
          onClick={() => navigate('/settings')}
        />
      </div>
    </div>
  );
}

interface DashboardCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: (e: React.MouseEvent) => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="w-full p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start">
      <Icon className="text-purple-600 dark:text-purple-400" size={24} />
      <ChevronRight className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" size={20} />
    </div>
    <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </div>
);
