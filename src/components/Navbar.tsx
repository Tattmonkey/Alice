import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu,
  X,
  User,
  LogOut,
  Settings,
  MessageSquare,
  ImageIcon,
  Calendar,
  Palette
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import UserAvatar from './UserAvatar';

interface NavbarProps {
  onOpenLoginModal: () => void;
  onOpenSignUpModal: () => void;
}

export default function Navbar({ onOpenLoginModal, onOpenSignUpModal }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isArtist = user?.role?.type === 'artist';
  const isAdmin = user?.role?.type === 'admin';

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Logo className="h-8 w-auto" />
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/artists"
                className="text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 
                  px-3 py-2 text-sm font-medium transition-colors"
              >
                Artists
              </Link>
              <Link
                to="/shop"
                className="text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 
                  px-3 py-2 text-sm font-medium transition-colors"
              >
                Shop
              </Link>
              <Link
                to="/blog"
                className="text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 
                  px-3 py-2 text-sm font-medium transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>

          {/* User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <UserAvatar size="sm" showUpload={false} />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{user.name || 'User'}</span>
                  </div>
                </button>

                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 
                      ring-1 ring-black ring-opacity-5 focus:outline-none"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    {isArtist && (
                      <>
                        <Link
                          to="/dashboard/bookings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <Calendar className="mr-3 h-4 w-4" />
                          Bookings
                        </Link>
                        <Link
                          to="/dashboard/portfolio"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <ImageIcon className="mr-3 h-4 w-4" />
                          Portfolio
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 
                        hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={onOpenLoginModal}
                  className="text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 
                    px-3 py-2 text-sm font-medium transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={onOpenSignUpModal}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium 
                    hover:bg-purple-700 transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto' } : { height: 0 }}
        className="sm:hidden overflow-hidden"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/artists"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 
              hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Artists
          </Link>
          <Link
            to="/shop"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 
              hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Shop
          </Link>
          <Link
            to="/blog"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 
              hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Blog
          </Link>
        </div>
      </motion.div>
    </nav>
  );
}
