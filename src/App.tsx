import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { GalleryProvider } from './contexts/GalleryContext';
import { BookingProvider } from './contexts/BookingContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Artists from './pages/Artists';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Blog from './pages/Blog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Footer from './components/Footer';
import LoginModal from './components/auth/LoginModal';
import SignUpModal from './components/auth/SignUpModal';
import ResetPasswordModal from './components/auth/ResetPasswordModal';
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
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';

export default function App() {
  return (
    <AuthProvider>
      <GalleryProvider>
        <BookingProvider>
          <MessagingProvider>
            <div className="min-h-screen bg-purple-50 dark:bg-[#0f0616] transition-colors flex flex-col">
              <Navbar />
              
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
                      <ProtectedRoute>
                        <ArtistDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/artist/settings"
                    element={
                      <ProtectedRoute>
                        <ArtistSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>

              <Footer />
            </div>
          </MessagingProvider>
        </BookingProvider>
      </GalleryProvider>
    </AuthProvider>
  );
}
