import React from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

const LoadingSpinner = ({ message = "Loading CHUTKI..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mx-auto h-16 w-16 mb-6"
        >
          <Logo className="w-full h-full" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-gray-700 mb-2"
        >
          {message}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 text-sm"
        >
          Please wait while we prepare your tools...
        </motion.p>
        
        {/* Loading dots */}
        <div className="flex justify-center mt-4 space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-2 h-2 bg-purple-500 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;