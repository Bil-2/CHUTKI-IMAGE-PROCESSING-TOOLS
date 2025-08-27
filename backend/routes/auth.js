import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  googleCallback,
  getProfile,
  updateProfile,
  logout,
  verifyToken
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

// Middleware to check database connection
const requireDatabase = (req, res, next) => {
  if (!global.DATABASE_CONNECTED) {
    return res.status(503).json({
      success: false,
      message: 'Database not available. Authentication features are disabled.',
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
router.get('/verify', requireDatabase, verifyToken);

// Protected routes
router.get('/profile', requireDatabase, protect, getProfile);
router.put('/profile', requireDatabase, protect, updateProfile);

// Google OAuth routes - Check if strategy exists
const hasGoogleStrategy = passport._strategies && passport._strategies.google;

if (hasGoogleStrategy || (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id-here' && process.env.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com'))) {
  router.get('/google', (req, res, next) => {
    // Check if Google strategy is available at runtime
    if (!passport._strategies || !passport._strategies.google) {
      return res.status(503).json({
        success: false,
        message: 'Google OAuth strategy not initialized',
        error: 'OAUTH_STRATEGY_NOT_FOUND'
      });
    }
    
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
  });

  router.get('/google/callback', (req, res, next) => {
    // Check if Google strategy is available at runtime
    if (!passport._strategies || !passport._strategies.google) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_strategy_missing`);
    }
    
    passport.authenticate('google', {
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`,
      session: false
    })(req, res, next);
  }, googleCallback);
  
  console.log('✅ Google OAuth routes initialized with runtime strategy check');
} else {
  // Fallback routes for when Google OAuth is disabled
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured',
      error: 'OAUTH_DISABLED'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_disabled`);
  });
  console.log('⚠️  Google OAuth routes disabled - using fallback handlers');
}

export default router;
