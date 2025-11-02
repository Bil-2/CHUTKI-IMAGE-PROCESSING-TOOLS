import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  getFullProfile,
  updateUserProfile,
  updatePreferences,
  getUserStatistics,
  getActivityLog,
  saveUserPreset,
  getUserPresets,
  deleteUserPreset,
  uploadAvatar,
  deleteAccount
} from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

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

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// All routes require authentication and database
router.use(requireDatabase, protect);

// Profile routes
router.get('/', getFullProfile);
router.put('/', updateUserProfile);
router.delete('/', deleteAccount);

// Preferences
router.put('/preferences', updatePreferences);

// Statistics
router.get('/statistics', getUserStatistics);

// Activity log
router.get('/activity', getActivityLog);

// Presets
router.get('/presets', getUserPresets);
router.post('/presets', saveUserPreset);
router.delete('/presets/:presetId', deleteUserPreset);

// Avatar
router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);

export default router;
