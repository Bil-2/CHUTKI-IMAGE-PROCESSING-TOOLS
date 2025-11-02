import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

// Only import User model if database is enabled
let User = null;
try {
  if (global.DATABASE_CONNECTED !== false) {
    const userModule = await import('../models/User.js');
    User = userModule.default;
  }
} catch (error) {
  console.log(' User model not loaded - running in standalone mode');
}

// JWT Strategy for API authentication - only if database is connected
if (User) {
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'chutki-secret-key-2024'
  }, async (payload, done) => {
    try {
      const user = await User.findById(payload.id);
      if (user && user.isActive) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  }));
}

// Debug environment variables
console.log(' Passport.js - GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log(' Passport.js - GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');

// Google OAuth Strategy - Only initialize if credentials are available AND database is connected
const shouldEnableGoogleOAuth = process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  User &&
  global.DATABASE_CONNECTED !== false;

if (shouldEnableGoogleOAuth) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID?.trim(),
    clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim(),
    callbackURL: (process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback').trim()
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth Profile:', {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
        photo: profile.photos?.[0]?.value
      });

      const user = await User.findOrCreateGoogleUser(profile);
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      return done(error, null);
    }
  }));
  console.log('[SUCCESS] Google OAuth strategy initialized');
} else if (!User) {
  console.log('[INFO] Google OAuth disabled - Running in standalone mode (no database)');
} else {
  console.log('[WARNING] Google OAuth disabled - No valid credentials provided');
}

// Serialize user for session - only if database is connected
if (User) {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
} else {
  // Dummy serialization for standalone mode
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

export default passport;
