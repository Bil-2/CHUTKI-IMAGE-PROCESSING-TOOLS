import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  verifyToken,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

// Middleware to check database connection
const requireDatabase = (req, res, next) => {
  if (!global.DATABASE_CONNECTED) {
    return res.status(503).json({
      success: false,
      message: 'Database not available',
      error: 'DATABASE_UNAVAILABLE'
    });
  }
  next();
};

const router = express.Router();

// Local authentication routes
router.post('/register', requireDatabase, register);
router.post('/login', requireDatabase, login);
router.post('/logout', requireDatabase, logout);

// Password reset routes
router.post('/forgot-password', requireDatabase, forgotPassword);
router.post('/reset-password', requireDatabase, resetPassword);

// Token verification endpoint
router.get('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        error: 'NO_TOKEN_PROVIDED'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token verified',
      user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'INVALID_TOKEN'
    });
  }
});

router.get('/verify', requireDatabase, verifyToken);

// Protected routes
router.get('/profile', requireDatabase, protect, getProfile);
router.put('/profile', requireDatabase, protect, updateProfile);

// Google OAuth routes - Check credentials and database connection
const hasGoogleCredentials = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
const databaseConnected = global.DATABASE_CONNECTED !== false;

if (hasGoogleCredentials && databaseConnected) {
  // Google OAuth initiation
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  // Google OAuth callback handler with enhanced error handling
  const googleCallback = async (req, res) => {
    try {
      console.log('[OAUTH] Callback received');
      console.log('[OAUTH] Database connected:', global.DATABASE_CONNECTED);
      console.log('[OAUTH] User object:', req.user ? 'Present' : 'Missing');
      
      // Check database connection
      if (!global.DATABASE_CONNECTED) {
        console.error('[OAUTH] Database not connected');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=database_unavailable`);
      }
      
      if (!req.user) {
        console.error('[OAUTH] No user object in request');
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
      }

      console.log('[OAUTH] User ID:', req.user._id);
      console.log('[OAUTH] User email:', req.user.email);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email,
          provider: req.user.provider || 'google'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('[OAUTH] Token generated successfully');
      
      // Redirect to success page with token
      const redirectUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth-success?token=${token}`;
      console.log('[OAUTH] Redirecting to:', redirectUrl);
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('[OAUTH] Callback error:', error);
      console.error('[OAUTH] Error stack:', error.stack);
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_error`);
    }
  };

  router.get('/google/callback',
    passport.authenticate('google', {
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
      session: true
    }),
    googleCallback
  );

  console.log('✅ Google OAuth routes initialized successfully');
} else {
  // Fallback routes for when Google OAuth is disabled or database unavailable
  router.get('/google', (req, res) => {
    const reason = !databaseConnected ? 'Database not available' : 'Google OAuth is not configured';
    const error = !databaseConnected ? 'DATABASE_UNAVAILABLE' : 'OAUTH_DISABLED';

    res.status(503).json({
      success: false,
      message: reason,
      error: error
    });
  });

  router.get('/google/callback', (req, res) => {
    const errorParam = !databaseConnected ? 'database_unavailable' : 'oauth_disabled';
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=${errorParam}`);
  });

  const reason = !databaseConnected ? 'database unavailable' : 'OAuth not configured';
  console.log(`📝 Google OAuth routes disabled - ${reason}`);
}

export default router;
