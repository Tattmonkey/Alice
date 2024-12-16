import React from 'react';
import { motion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import Generator from '../components/Generator';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="animated-background" />
      
      {/* Animated Blobs */}
      <div className="animated-blob bg-purple-300/50 dark:bg-purple-600/30" 
        style={{ 
          position: 'fixed',
          top: '20%',
          left: '10%',
          width: '500px',
          height: '500px',
          zIndex: -10 
        }} 
      />
      <div className="animated-blob bg-indigo-300/50 dark:bg-indigo-600/30" 
        style={{ 
          position: 'fixed',
          top: '60%',
          right: '10%',
          width: '400px',
          height: '400px',
          zIndex: -10 
        }} 
      />
      <div className="animated-blob bg-pink-300/50 dark:bg-pink-600/30" 
        style={{ 
          position: 'fixed',
          top: '40%',
          left: '60%',
          width: '300px',
          height: '300px',
          zIndex: -10 
        }} 
      />

      <div className="relative w-full max-w-7xl mx-auto px-4 pt-24 pb-12 md:pt-28 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Transform Your Ideas Into Beautiful Tattoo Designs
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Use AI-powered technology to create unique, meaningful tattoo designs that tell your story.
          </motion.p>

          <Generator user={user || { id: '', name: '', email: '', credits: 0, cart: [], creations: [], bookings: [], role: null }} />
        </motion.div>
      </div>
    </div>
  );
}