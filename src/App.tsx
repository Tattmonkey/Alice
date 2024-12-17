import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/auth/LoginModal';
import SignUpModal from './components/auth/SignUpModal';
import ResetPasswordModal from './components/auth/ResetPasswordModal';

// Pages
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
import AdminLogin from './pages/AdminLogin';

// User Components
import UserDashboard from './components/UserDashboard';
import UserSettings from './components/UserSettings';
import UserMessages from './components/user/UserMessages';
import UserGallery from './components/user/UserGallery';
import UserBookings from './components/user/UserBookings';

// Artist Components
import ArtistDashboard from './components/artists/ArtistDashboard';
import ArtistSettings from './components/artists/ArtistSettings';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManager from './components/admin/UserManager';
import ProductManager from './components/admin/ProductManager';
import BlogManager from './components/admin/BlogManager';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import NotificationCenter from './components/admin/NotificationCenter';
import PaymentSettings from './components/admin/PaymentSettings';
import ShippingManager from './components/admin/shipping/ShippingManager';
import APISettings from './components/admin/APISettings';

export default function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-[#0f0616] dark:to-[#150a24]">
        <Navbar 
          onOpenLoginModal={() => setShowLoginModal(true)}
          onOpenSignUpModal={() => setShowSignUpModal(true)}
        />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artists" element={<Artists />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:productId" element={<ProductDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/messages" element={
              <ProtectedRoute>
                <UserMessages />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/gallery" element={
              <ProtectedRoute>
                <UserGallery />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/bookings" element={
              <ProtectedRoute>
                <UserBookings />
              </ProtectedRoute>
            } />

            {/* Artist Routes */}
            <Route path="/artist/dashboard" element={
              <ProtectedRoute allowedRoles={['artist']}>
                <ArtistDashboard />
              </ProtectedRoute>
            } />
            <Route path="/artist/settings" element={
              <ProtectedRoute allowedRoles={['artist']}>
                <ArtistSettings />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProductManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/blog" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BlogManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <NotificationCenter />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PaymentSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/shipping" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ShippingManager />
              </ProtectedRoute>
            } />
            <Route path="/admin/api" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <APISettings />
              </ProtectedRoute>
            } />
          </Routes>
        </main>

        <Footer />

        {showLoginModal && (
          <LoginModal
            onClose={() => setShowLoginModal(false)}
            onSignUpClick={() => {
              setShowLoginModal(false);
              setShowSignUpModal(true);
            }}
            onForgotPasswordClick={() => {
              setShowLoginModal(false);
              setShowResetPasswordModal(true);
            }}
          />
        )}

        {showSignUpModal && (
          <SignUpModal
            onClose={() => setShowSignUpModal(false)}
            onLoginClick={() => {
              setShowSignUpModal(false);
              setShowLoginModal(true);
            }}
          />
        )}

        {showResetPasswordModal && (
          <ResetPasswordModal
            onClose={() => setShowResetPasswordModal(false)}
            onBackToLogin={() => {
              setShowResetPasswordModal(false);
              setShowLoginModal(true);
            }}
          />
        )}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            error: {
              duration: 10000,
              style: {
                background: '#FEE2E2',
                color: '#991B1B',
              }
            }
          }} 
        />
      </div>
    </ErrorBoundary>
  );
}
