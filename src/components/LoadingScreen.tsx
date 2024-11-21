import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50"
    >
      <div className="relative">
        <motion.div
          className="w-20 h-20 border-4 border-purple-200 dark:border-purple-900 rounded-full"
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 2,
            ease: "linear",
            repeat: Infinity
          }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-purple-600 rounded-full"
          style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent' }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 1,
            ease: "linear",
            repeat: Infinity
          }}
        />
        <motion.div
          className="absolute inset-0 border-4 border-indigo-500 rounded-full"
          style={{ borderLeftColor: 'transparent', borderTopColor: 'transparent' }}
          animate={{
            rotate: -360
          }}
          transition={{
            duration: 1.5,
            ease: "linear",
            repeat: Infinity
          }}
        />
      </div>
    </motion.div>
  );
}