import express from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

// Import configurations and middleware
import "../config/passport.js";
import { protect } from "../middleware/auth.js";
import authRoutes from "../routes/authRoutes.js";

// Import API handlers
import uploadHandler from '../api/upload.js';
import convertHandler from '../api/convert.js';
import compressHandler from '../api/compress.js';
import passportPhotoHandler from '../api/passport-photo.js';
import rotateHandler from '../api/tools/rotate.js';
import flipHandler from '../api/tools/flip.js';
import resizeCmHandler from '../api/tools/resize-cm.js';

dotenv.config();
const app = express();

// ================== Middleware ==================
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ================== Routes ==================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    mongoConnection: mongoose.connection.readyState
  });
});

// API endpoints
app.use('/api/upload', uploadHandler);
app.use('/api/convert', convertHandler);
app.use('/api/compress', compressHandler);
app.use('/api/passport-photo', passportPhotoHandler);
app.use('/api/tools/rotate', rotateHandler);
app.use('/api/tools/flip', flipHandler);
app.use('/api/tools/resize-cm', resizeCmHandler);

app.use("/api/auth", authRoutes);

// Google OAuth routes
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Handle both relative and absolute callback URLs
app.get("/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false
  }),
  (req, res) => {
    try {
      console.log("OAuth callback - User:", req.user);

      if (!req.user) {
        console.error("No user found in OAuth callback");
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
      }

      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("Generated JWT token, redirecting to:", `${process.env.CLIENT_URL}/oauth-success?token=${token.substring(0, 20)}...`);

      res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
  }
);

// ================== OAuth Test Endpoint ==================
app.get("/api/auth/test", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
    clientUrl: process.env.CLIENT_URL,
    jwtSecret: process.env.JWT_SECRET ? "Set" : "Not set",
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI ? "Set" : "Not set",
    mongoConnection: mongoose.connection.readyState
  });
});

// 404 handler
app.use("*", (req, res) => res.status(404).json({ error: "Route not found" }));

// ================== Database Connection ==================
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (uri) {
      await mongoose.connect(uri);
      console.log("✅ MongoDB connected successfully");
    } else {
      console.log("⚠️  No MongoDB URI provided, running without database");
    }
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("⚠️  Running without database for development");
  }
};

// Connect to database but don't start server (Vercel handles that)
connectDB();

// Export the Express app for Vercel
export default app;