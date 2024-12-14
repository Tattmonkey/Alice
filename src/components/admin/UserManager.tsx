import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon,
  Check,
  X,
  AlertCircle,
  Loader,
  Search,
  Filter
} from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../contexts/AuthContext';

interface ExtendedUser extends Omit<User, 'role'> {
  role: {
    type: 'user' | 'artist' | 'admin';
    status?: 'pending' | 'approved' | 'rejected';
  };
}

interface UserWithId extends ExtendedUser {
  id: string;
}

export default function UserManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithId | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const loadedUsers: UserWithId[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role?.type) {
          loadedUsers.push({
            ...userData,
            id: doc.id,
            role: {
              type: userData.role.type,
              status: userData.role.status
            }
          } as UserWithId);
        }
      });
      
      setUsers(loadedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveArtist = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'role.status': 'approved',
        updatedAt: new Date().toISOString()
      });
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? {
                ...user,
                role: {
                  ...user.role,
                  status: 'approved'
                }
              }
            : user
        )
      );
    } catch (err) {
      console.error('Error approving artist:', err);
      setError('Failed to approve artist');
    }
  };

  const handleRejectArtist = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'role.status': 'rejected',
        updatedAt: new Date().toISOString()
      });
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? {
                ...user,
                role: {
                  ...user.role,
                  status: 'rejected'
                }
              }
            : user
        )
      );
    } catch (err) {
      console.error('Error rejecting artist:', err);
      setError('Failed to reject artist');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'pending' && user.role?.type === 'artist' && user.role?.status === 'pending') ||
      (filter === 'approved' && user.role?.type === 'artist' && user.role?.status === 'approved') ||
      (filter === 'rejected' && user.role?.type === 'artist' && user.role?.status === 'rejected');
    
    return matchesSearch && matchesFilter;
  });

  if (currentUser?.role?.type !== 'admin') {
    return (
      <div className="text-red-500 p-4">
        Must be an admin to access this page
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800"
            >
              <option value="all">All Users</option>
              <option value="pending">Pending Artists</option>
              <option value="approved">Approved Artists</option>
              <option value="rejected">Rejected Artists</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 
                      flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user.displayName || 'Unnamed User'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Role: {user.role.type}
                      </span>
                      {user.role.type === 'artist' && user.role.status && (
                        <span className={`text-sm px-2 py-0.5 rounded-full ${
                          user.role.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : user.role.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.role.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {user.role.type === 'artist' && user.role.status === 'pending' && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApproveArtist(user.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRejectArtist(user.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
