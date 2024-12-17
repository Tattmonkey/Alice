import React, { useState, useEffect } from 'react';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  TooltipProps
} from 'recharts';
import { 
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Clock,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { BookingStats } from '../../types/booking';
import LoadingScreen from '../LoadingScreen';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

interface MonthlyData {
  month: string;
  revenue: number;
  bookings: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const { getBookingStats } = useBooking();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate: Date;
      let endDate = endOfMonth(now);

      switch (dateRange) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }

      const stats = await getBookingStats({
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      setStats(stats);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!user || user.role?.type !== 'admin') {
    return <div className="text-red-500 p-4">Must be an admin to view analytics</div>;
  }
  if (!stats) return null;

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </h3>
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${
            trend.positive ? 'text-green-500' : 'text-red-500'
          }`}>
            <TrendingUp className={`w-4 h-4 ${!trend.positive && 'rotate-180'}`} />
            <span className="ml-1">{trend.value}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );

  const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {format(new Date(label), 'MMMM yyyy')}
          </p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {`$${payload[0].value?.toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel: React.FC<{
    name: string;
    percent: number;
  }> = ({ name, percent }) => {
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDateRange('week')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'week'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'month'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setDateRange('year')}
            className={`px-4 py-2 rounded-lg ${
              dateRange === 'year'
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          title="Completed Bookings"
          value={stats.completedBookings}
          icon={CheckCircle}
        />
        <StatCard
          title="Cancelled Bookings"
          value={stats.cancelledBookings}
          icon={XCircle}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Revenue Over Time
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bookingsByMonth as MonthlyData[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value: string) => format(new Date(value), 'MMM')}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Booking Status Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats.bookingsByStatus.completed },
                    { name: 'Pending', value: stats.bookingsByStatus.pending },
                    { name: 'Confirmed', value: stats.bookingsByStatus.confirmed },
                    { name: 'Cancelled', value: stats.bookingsByStatus.cancelled },
                    { name: 'No Show', value: stats.bookingsByStatus.no_show }
                  ] as PieChartData[]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Services */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Popular Services
          </h2>
          <div className="space-y-4">
            {stats.popularServices.map((service, index) => (
              <div
                key={service.serviceId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-gray-900 dark:text-white">
                    {service.name}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {service.bookings} bookings
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Monthly Trends
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bookingsByMonth as MonthlyData[]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={(value: string) => format(new Date(value), 'MMM')}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bookings" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
