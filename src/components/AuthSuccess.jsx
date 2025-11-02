import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import config from '../config';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');

    if (token) {
      // Store the token
      localStorage.setItem('token', token);
      
      // Verify the token and get user data
      fetch(`${config.API_BASE_URL}/api/auth/verify-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          // Redirect to dashboard after successful authentication
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          console.error('Token verification failed:', data);
          navigate('/login?error=auth_failed');
        }
      })
      .catch(error => {
        console.error('Auth verification error:', error);
        navigate('/login?error=auth_error');
      });
    } else {
      // No token found, redirect to login
      navigate('/login?error=no_token');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
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
          <svg className="w-full h-full text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          Authentication Successful!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600"
        >
          Redirecting you to the dashboard...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AuthSuccess;