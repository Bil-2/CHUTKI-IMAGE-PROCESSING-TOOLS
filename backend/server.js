// backend/server.js
import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import PDFDocument from "pdfkit";
import Tesseract from "tesseract.js";
import JSZip from "jszip";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

// Load environment variables FIRST
dotenv.config({ path: './.env' });

// Import configurations and middleware AFTER dotenv
import connectDB from "./config/database.js";
// Import passport config AFTER environment variables are loaded
import "./config/passport.js";
import passport from "passport";
import { validateFile } from "./utils/validation.js";
import { successResponse, errorResponse } from "./utils/response.js";
import { validateEnvironment, getEnvironmentInfo } from "./utils/envValidation.js";

// Import modular tools router
import modularToolsRoutes from './api/modular-tools.js';

// Validate environment configuration
const { errors, warnings } = validateEnvironment();

if (errors.length > 0) {
  console.error('❌ Environment validation errors:');
  errors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}

if (warnings.length > 0) {
  console.warn('⚠️  Environment warnings:');
  warnings.forEach(warning => console.warn(`  - ${warning}`));
}

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== Security Middleware ==================
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 uploads per windowMs
  message: {
    error: 'Too many file uploads from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
});

app.use('/api/', generalLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/passport-photo', uploadLimiter);
app.use('/api/tools/', uploadLimiter);

// ================== Basic Middleware ==================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.CLIENT_URL
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Enhanced logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ================== File Upload Configuration ==================
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20 // Maximum 20 files
  },
  fileFilter
});

// ================== Image Cleanup System ==================
const cleanupInterval = 30 * 60 * 1000; // 30 minutes
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const cleanupOldFiles = () => {
  try {
    const files = fs.readdirSync(uploadsDir);
    const now = Date.now();
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtime.getTime();

      if (fileAge > cleanupInterval) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    });

    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} old files`);
    }
  } catch (error) {
    console.error('🚨 Cleanup error:', error.message);
  }
};

// Run cleanup every 30 minutes
setInterval(cleanupOldFiles, cleanupInterval);

// Initial cleanup
cleanupOldFiles();
console.log(`🧹 Cleanup completed. 0 files checked.`);

// Static files with security headers
app.use("/uploads", (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
}, express.static(path.join(__dirname, "uploads")));

// ================== Routes ==================
// Authentication routes
import authRoutes from "./routes/auth.js";
app.use('/api/auth', authRoutes);

// Use modular tools router
app.use('/api/tools', modularToolsRoutes);

// Debug endpoint to verify routing
app.get('/api/debug/routes', (req, res) => {
  res.json({
    message: 'Server is running with modular tools router',
    timestamp: new Date().toISOString(),
    routes: {
      '/api/tools/test': 'GET - Test endpoint',
      '/api/tools/passport-photo': 'POST - Passport photo tool',
      '/api/tools/:tool': 'POST - Any tool via modular router'
    }
  });
});

// Enhanced health check endpoint
app.get("/api/health", (req, res) => {
  const environmentInfo = getEnvironmentInfo();
  const healthData = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: environmentInfo,
    database: global.DATABASE_CONNECTED ? "connected" : "disconnected",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    version: process.env.npm_package_version || '1.0.0'
  };

  res.status(200).json(successResponse('Service healthy', healthData));
});

// Google OAuth routes - only if Google OAuth is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log("✅ Google OAuth routes initialized");

  app.get("/api/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${clientUrl}/oauth-success?token=${token}`);
    }
  );
} else {
  console.log("⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");

  app.get("/api/auth/google", (req, res) => {
    res.status(503).json(errorResponse(res,
      "Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables."
    ));
  });

  app.get("/api/auth/google/callback", (req, res) => {
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth_not_configured`);
  });
}

// ... rest of your code ...

// ================== Error Handling ==================
app.use((err, req, res, next) => {
  console.error(`🚨 Error [${req.requestId}]:`, err.stack);

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json(errorResponse(res, "File too large. Maximum size is 10MB."));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json(errorResponse(res, "Too many files. Maximum 20 files allowed."));
    }
    return res.status(400).json(errorResponse(res, `Upload error: ${err.message}`));
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json(errorResponse(res, "CORS policy violation"));
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(errorResponse(res, "Validation failed", err.errors));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse(res, "Invalid token"));
  }

  // MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json(errorResponse(res, "Database error"));
  }

  // Default error response
  res.status(500).json(errorResponse(res,
    process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    process.env.NODE_ENV === "production" ? undefined : err.stack
  ));
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json(errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`));
});

// ================== Graceful Shutdown ==================
const gracefulShutdown = (signal) => {
  console.log(`\n📦 Received ${signal}. Starting graceful shutdown...`);

  // Close server
  server.close(() => {
    console.log('🔒 HTTP server closed');

    // Close database connection
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(() => {
        console.log('📦 MongoDB connection closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// ================== Start Server ==================
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`🔗 Backend URL: http://localhost:${PORT}`);
      console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔒 Privacy Notice: Images are automatically deleted after 30 minutes`);
    });

    // Graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

const server = await startServer();
