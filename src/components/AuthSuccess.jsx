import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../config';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Get token from URL params
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');

        if (!token) {
          navigate('/login?error=no_token');
          return;
        }

        // Verify token and get user data
        const response = await fetch(`${config.API_BASE_URL}/api/auth/verify-token`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          // Store token and user data
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Trigger storage event to update AuthContext
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'token',
            newValue: token,
            storageArea: localStorage
          }));

          // Small delay to ensure context updates, then navigate
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 100);
        } else {
          navigate('/login?error=invalid_token');
        }
      } catch (error) {
        console.error('Auth success error:', error);
        navigate('/login?error=auth_error');
      }
    };

    handleAuthSuccess();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In...</h2>
        <p className="text-gray-600">Please wait while we redirect you.</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
