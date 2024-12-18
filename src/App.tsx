import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { GalleryProvider } from './contexts/GalleryContext';
import { BookingProvider } from './contexts/BookingContext';
import { User } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/auth/LoginModal';
import SignUpModal from './components/auth/SignUpModal';
import ResetPasswordModal from './components/auth/ResetPasswordModal';
import Home from './pages/Home';
import Artists from './pages/Artists';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Blog from './pages/Blog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import UserDashboard from './components/UserDashboard';
import UserSettings from './components/UserSettings';
import UserMessages from './components/user/UserMessages';
import UserGallery from './components/user/UserGallery';
import UserBookings from './components/user/UserBookings';
import ArtistDashboard from './components/artists/ArtistDashboard';
import ArtistSettings from './components/artists/ArtistSettings';
import ArtistSetup from './components/artists/ArtistSetup';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManager from './components/admin/UserManager';
import ProductManager from './components/admin/ProductManager';
import BlogManager from './components/admin/BlogManager';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import NotificationCenter from './components/admin/NotificationCenter';
import PaymentSettings from './components/admin/PaymentSettings';
import ShippingManager from './components/admin/shipping/ShippingManager';
import APISettings from './components/admin/APISettings';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => (
  <ProtectedRoute>
    {({ user }: { user: User }) => {
      if (user?.role?.type !== 'admin') {
        return (
          <div className="text-red-500 p-4">
            Must be an admin to access this page
          </div>
        );
      }
      return <>{children}</>;
    }}
  </ProtectedRoute>
);

interface ArtistRouteProps {
  children: React.ReactNode;
}

const ArtistRoute: React.FC<ArtistRouteProps> = ({ children }) => (
  <ProtectedRoute>
    {({ user }: { user: User }) => {
      if (user?.role?.type !== 'artist') {
        return (
          <div className="text-red-500 p-4">
            Must be an artist to access this page
          </div>
        );
      }
      return <>{children}</>;
    }}
  </ProtectedRoute>
);

export default function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  const handleSwitchToSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleResetPassword = () => {
    setIsLoginModalOpen(false);
    setIsResetPasswordModalOpen(true);
  };

  return (
    <AuthProvider>
      <GalleryProvider>
        <BookingProvider>
          <MessagingProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar 
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                onOpenSignUpModal={() => setIsSignUpModalOpen(true)}
              />
              <Toaster position="top-center" />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/shop/product/:id" element={<ProductDetail />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <UserSettings />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <UserMessages />
                    </ProtectedRoute>
                  } />
                  <Route path="/gallery" element={
                    <ProtectedRoute>
                      <UserGallery />
                    </ProtectedRoute>
                  } />
                  <Route path="/bookings" element={
                    <ProtectedRoute>
                      <UserBookings />
                    </ProtectedRoute>
                  } />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/refunds" element={<RefundPolicy />} />
                  <Route path="/admin" element={<AdminLogin />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/artist/dashboard"
                    element={
                      <ArtistRoute>
                        <ArtistDashboard />
                      </ArtistRoute>
                    }
                  />
                  <Route
                    path="/artist/settings"
                    element={
                      <ArtistRoute>
                        <ArtistSettings />
                      </ArtistRoute>
                    }
                  />
                  <Route
                    path="/artist/setup"
                    element={
                      <ArtistRoute>
                        <ArtistSetup />
                      </ArtistRoute>
                    }
                  />
                  
                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <UserManager />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/products"
                    element={
                      <AdminRoute>
                        <ProductManager />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/blog"
                    element={
                      <AdminRoute>
                        <BlogManager />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <AdminRoute>
                        <AnalyticsDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/notifications"
                    element={
                      <AdminRoute>
                        <NotificationCenter />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/payments"
                    element={
                      <AdminRoute>
                        <PaymentSettings />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/shipping"
                    element={
                      <AdminRoute>
                        <ShippingManager />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/api"
                    element={
                      <AdminRoute>
                        <APISettings />
                      </AdminRoute>
                    }
                  />
                </Routes>
              </main>

              <Footer />
            </div>

            <LoginModal 
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onSwitchToSignUp={handleSwitchToSignUp}
              onResetPassword={handleResetPassword}
            />
            <SignUpModal
              isOpen={isSignUpModalOpen}
              onClose={() => setIsSignUpModalOpen(false)}
              onSwitchToLogin={handleSwitchToLogin}
            />
            <ResetPasswordModal
              isOpen={isResetPasswordModalOpen}
              onClose={() => setIsResetPasswordModalOpen(false)}
              onSwitchToLogin={() => {
                setIsResetPasswordModalOpen(false);
                setIsLoginModalOpen(true);
              }}
            />

          </MessagingProvider>
        </BookingProvider>
      </GalleryProvider>
    </AuthProvider>
  );
}
