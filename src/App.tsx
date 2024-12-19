import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { GalleryProvider } from './contexts/GalleryContext';
import { BookingProvider } from './contexts/BookingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginModal from './components/auth/LoginModal';
import SignUpModal from './components/auth/SignUpModal';
import ResetPasswordModal from './components/auth/ResetPasswordModal';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Artists from './pages/Artists';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Blog from './pages/Blog';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import UserSettings from './components/UserSettings';
import UserMessages from './components/user/UserMessages';
import UserGallery from './components/user/UserGallery';
import UserBookings from './components/user/UserBookings';
import UserDashboard from './components/UserDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';

function App() {
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
    <Router>
      <AuthProvider>
        <GalleryProvider>
          <BookingProvider>
            <MessagingProvider>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar 
                  onOpenLoginModal={() => setIsLoginModalOpen(true)}
                  onOpenSignUpModal={() => setIsSignUpModalOpen(true)}
                />
                
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/artists" element={<Artists />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/product/:id" element={<ProductDetail />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/refunds" element={<RefundPolicy />} />

                    {/* Protected Routes */}
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <Orders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <UserSettings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <ProtectedRoute>
                          <UserMessages />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/gallery"
                      element={
                        <ProtectedRoute>
                          <UserGallery />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bookings"
                      element={
                        <ProtectedRoute>
                          <UserBookings />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>

                <Footer />

                {/* Modals */}
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

                <ToastContainer 
                  position="top-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </div>
            </MessagingProvider>
          </BookingProvider>
        </GalleryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
