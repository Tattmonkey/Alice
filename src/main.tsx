import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Initialize Firebase
import('./config/firebase');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);