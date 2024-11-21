import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserCog, Shield, Ban, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { User } from '../../types';
import toast from 'react-hot-toast';

interface VerificationModalProps {
  user: User;
  onClose: () => void;
  onVerify: () => Promise<void>;
}

const VerificationModal = ({ user, onClose, onVerify }: VerificationModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    try {
      setLoading(true);
      await onVerify();
      onClose();
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl p-6 max-w-lg w-full"
      >
        <h3 className="text-lg font-semibold mb-4">Verify Artist: {user.name}</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Portfolio Review</h4>
            <div className="grid grid-cols-2 gap-4">
              {user.creations?.slice(0, 4).map((creation, index) => (
                <img
                  key={index}
                  src={creation.imageUrl}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Artist Bio</h4>
            <p className="text-gray-600">{user.bio}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {user.specialties?.map((specialty, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleVerify}
              disabled={loading}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Verify Artist
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'artist' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleVerifyArtist = async (userId: string) => {
    try {
      // Here you would implement the API call to verify the artist
      // Update the user's verified status in the database
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? {
                ...user,
                role: {
                  ...user.role!,
                  verified: true
                }
              }
            : user
        )
      );
      toast.success('Artist verified successfully');
    } catch (error) {
      toast.error('Failed to verify artist');
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      // Here you would implement the API call to ban the user
      toast.success('User banned successfully');
    } catch (error) {
      toast.error('Failed to ban user');
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      // Here you would implement the API call to make the user an admin
      toast.success('User promoted to admin');
    } catch (error) {
      toast.error('Failed to promote user');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role?.type === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <UserCog className="w-6 h-6 text-purple-600" />
          User Management
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | 'user' | 'artist' | 'admin')}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="artist">Artists</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role?.type === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : user.role?.type === 'artist'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role?.type || 'user'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role?.verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.role?.verified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.role?.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {user.role?.type === 'artist' && !user.role?.verified && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Review Artist"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleVerifyArtist(user.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Verify Artist"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </motion.button>
                      </>
                    )}
                    {user.role?.type !== 'admin' && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleMakeAdmin(user.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Make Admin"
                      >
                        <Shield className="w-5 h-5" />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBanUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Ban User"
                    >
                      <Ban className="w-5 h-5" />
                    </motion.button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}

      {selectedUser && (
        <VerificationModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onVerify={() => handleVerifyArtist(selectedUser.id)}
        />
      )}
    </div>
  );
}