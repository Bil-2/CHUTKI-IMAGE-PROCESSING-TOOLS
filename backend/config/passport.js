import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

// Skip Google OAuth initialization if credentials are not properly set
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Only initialize Google OAuth if credentials are properly set
if (googleClientId && googleClientSecret && 
    googleClientId !== 'your_google_client_id_here' && 
    googleClientSecret !== 'your_google_client_secret_here') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth profile received:", {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails?.[0]?.value,
        });

        // Check if MongoDB is available
        if (mongoose.connection.readyState === 1) {
          const user = await User.findOrCreateGoogleUser(profile);

          console.log("User found/created:", {
            id: user._id,
            email: user.email,
            name: user.name,
          });

          // Update last login
          await user.updateLastLogin();

          // Return user here
          return done(null, user);
        } else {
          // Fallback for development without MongoDB
          const mockUser = {
            id: profile.id,
            email: profile.emails?.[0]?.value || "no-email@example.com",
            name: profile.displayName || "Unknown User",
            googleId: profile.id,
          };
          console.log("Using mock user for development:", mockUser);
          return done(null, mockUser);
        }
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error, null);
      }
    }
  )
);
}

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id || user._id);
  done(null, user.id || user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing user:", id);
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(id).select("-password");
      done(null, user);
    } else {
      const mockUser = {
        id: id,
        email: "dev-user@example.com",
        name: "Development User",
      };
      done(null, mockUser);
    }
  } catch (error) {
    console.error("Deserialize error:", error);
    done(error, null);
  }
});

export default passport;
