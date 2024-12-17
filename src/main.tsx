import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GalleryProvider } from './contexts/GalleryContext';
import { BookingProvider } from './contexts/BookingContext';
import { MessagingProvider } from './contexts/MessagingContext';
import './index.css';

// Initialize Firebase
import './lib/firebase/init';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <GalleryProvider>
              <BookingProvider>
                <MessagingProvider>
                  <App />
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
                </MessagingProvider>
              </BookingProvider>
            </GalleryProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);