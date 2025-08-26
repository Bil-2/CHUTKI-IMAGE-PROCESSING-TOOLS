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

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_failed`,
    session: false
  }),
  googleCallback
);

export default router;
