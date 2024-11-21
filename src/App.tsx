import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import ArtistDashboard from './components/artists/ArtistDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLogin from './pages/AdminLogin';

export default function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = React.useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = React.useState(false);

  const handleOpenSignUp = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleOpenLogin = () => {
    setIsSignUpModalOpen(false);
    setIsResetPasswordModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleOpenResetPassword = () => {
    setIsLoginModalOpen(false);
    setIsResetPasswordModalOpen(true);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-purple-50 dark:bg-[#0f0616] transition-colors flex flex-col">
        <Navbar 
          onLoginClick={() => setIsLoginModalOpen(true)} 
          onSignUpClick={() => setIsSignUpModalOpen(true)}
        />
        
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
        
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          onSwitchToSignUp={handleOpenSignUp}
          onResetPassword={handleOpenResetPassword}
        />
        
        <SignUpModal 
          isOpen={isSignUpModalOpen} 
          onClose={() => setIsSignUpModalOpen(false)}
          onSwitchToLogin={handleOpenLogin}
        />

        <ResetPasswordModal
          isOpen={isResetPasswordModalOpen}
          onClose={() => setIsResetPasswordModalOpen(false)}
          onBackToLogin={handleOpenLogin}
        />
      </div>
    </AuthProvider>
  );
}