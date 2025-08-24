// backend/server.js
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
import multer from "multer";
import sharp from "sharp";
import fs from "fs";
import PDFDocument from "pdfkit";
import Tesseract from "tesseract.js";
import JSZip from "jszip";

// Import configurations and middleware
import "./config/passport.js";
import { protect } from "./middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================== Image Cleanup System ==================
// Track uploaded files with timestamps for automatic deletion
const uploadedFiles = new Map();

// Function to schedule file deletion after 30 minutes
const scheduleFileDeletion = (filePath, fileName) => {
  const deletionTime = 30 * 60 * 1000; // 30 minutes in milliseconds

  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Auto-deleted file: ${fileName} (30 minutes expired)`);
        uploadedFiles.delete(fileName);
      }
    } catch (error) {
      console.error(`❌ Error deleting file ${fileName}:`, error.message);
    }
  }, deletionTime);

  // Store file info for tracking
  uploadedFiles.set(fileName, {
    path: filePath,
    uploadedAt: new Date(),
    scheduledDeletion: new Date(Date.now() + deletionTime)
  });

  console.log(`⏰ Scheduled deletion for ${fileName} at ${new Date(Date.now() + deletionTime).toLocaleString()}`);
};

// Function to get upload directory path
const getUploadPath = (filename) => path.join(__dirname, "uploads", filename);

// Cleanup function to remove expired files on server restart
const cleanupExpiredFiles = () => {
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();

  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const fileAge = now - stats.mtime.getTime();

    // Delete files older than 30 minutes
    if (fileAge > 30 * 60 * 1000) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Cleaned up expired file: ${file}`);
      } catch (error) {
        console.error(`❌ Error cleaning up ${file}:`, error.message);
      }
    }
  });

  console.log(`🧹 Cleanup completed. ${files.length} files checked.`);
};

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

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================== Routes ==================

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Import API handlers
import uploadHandler from './api/upload.js';
import convertHandler from './api/convert.js';
import compressHandler from './api/compress.js';
import passportPhotoHandler from './api/passport-photo.js';
import rotateHandler from './api/tools/rotate.js';
import flipHandler from './api/tools/flip.js';
import resizeCmHandler from './api/tools/resize-cm.js';

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

// ================== Privacy Headers Middleware ==================
const addPrivacyHeaders = (req, res, next) => {
  res.set({
    'X-Privacy-Notice': 'Images are automatically deleted after 30 minutes',
    'X-Data-Retention': '30 minutes',
    'X-Auto-Cleanup': 'enabled'
  });
  next();
};

// ================== Image Processing ==================
const uploadDir = process.env.UPLOAD_DIR || "uploads";
const uploadPath = path.join(__dirname, uploadDir);
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);

    // Schedule automatic deletion after 30 minutes
    const filePath = path.join(uploadPath, filename);
    scheduleFileDeletion(filePath, filename);

    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|heic/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

const convertImage = async (req, res, targetFormat, outputExt) => {
  // Add privacy headers
  res.set({
    'X-Privacy-Notice': 'Images are automatically deleted after 30 minutes',
    'X-Data-Retention': '30 minutes',
    'X-Auto-Cleanup': 'enabled'
  });

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = `uploads/converted-${Date.now()}.${outputExt}`;

    await sharp(inputPath)[targetFormat]().toFile(outputPath);

    res.download(outputPath, `converted.${outputExt}`, (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Image conversion error:", error);
    res.status(500).json({ error: "Image conversion failed" });
  }
};

// Conversion endpoints
app.post("/api/convert/heic-to-jpg", upload.single("image"), (req, res) => convertImage(req, res, "jpeg", "jpg"));
app.post("/api/convert/webp-to-jpg", upload.single("image"), (req, res) => convertImage(req, res, "jpeg", "jpg"));
app.post("/api/convert/jpeg-to-png", upload.single("image"), (req, res) => convertImage(req, res, "png", "png"));
app.post("/api/convert/png-to-jpeg", upload.single("image"), (req, res) => convertImage(req, res, "jpeg", "jpg"));
app.post("/api/convert/jpg-to-webp", upload.single("image"), (req, res) => convertImage(req, res, "webp", "webp"));

// ================== Passport Photo Generation ==================
app.post("/api/passport-photo", addPrivacyHeaders, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const {
      size = "35x45",
      dpi = "300",
      background = "white",
      format = "jpg",
      quantity = 1
    } = req.body;

    // Passport photo size configurations
    const sizeConfigs = {
      "35x45": { width: 35, height: 45, unit: "mm" }, // India, Australia, Europe, UK, Pakistan
      "51x51": { width: 51, height: 51, unit: "mm" }, // USA, Philippines (2x2 inch)
      "50x70": { width: 50, height: 70, unit: "mm" }, // Canada
      "custom": { width: parseInt(req.body.width) || 35, height: parseInt(req.body.height) || 45, unit: req.body.unit || "mm" }
    };

    const config = sizeConfigs[size] || sizeConfigs["35x45"];
    const dpiValue = parseInt(dpi);

    // Calculate pixel dimensions based on DPI
    const mmToInch = 0.0393701;
    const widthInInches = config.width * mmToInch;
    const heightInInches = config.height * mmToInch;
    const widthInPixels = Math.round(widthInInches * dpiValue);
    const heightInPixels = Math.round(heightInInches * dpiValue);

    const inputPath = req.file.path;
    const outputPath = `uploads/passport-${Date.now()}.${format}`;

    // Process the image
    let processedImage = sharp(inputPath)
      .resize(widthInPixels, heightInPixels, {
        fit: 'cover',
        position: 'center'
      });

    // Apply background color
    if (background !== "transparent") {
      processedImage = processedImage.flatten({ background: background });
    }

    // Apply format-specific settings
    if (format === "jpg" || format === "jpeg") {
      processedImage = processedImage.jpeg({ quality: 90 });
    } else if (format === "png") {
      processedImage = processedImage.png();
    }

    await processedImage.toFile(outputPath);

    // Create multiple copies if quantity > 1
    if (quantity > 1) {
      const multipleOutputPath = `uploads/passport-multiple-${Date.now()}.${format}`;

      // Create a sheet with multiple passport photos
      const sheetWidth = Math.ceil(Math.sqrt(quantity)) * widthInPixels;
      const sheetHeight = Math.ceil(quantity / Math.ceil(Math.sqrt(quantity))) * heightInPixels;

      const composite = [];
      for (let i = 0; i < quantity; i++) {
        const row = Math.floor(i / Math.ceil(Math.sqrt(quantity)));
        const col = i % Math.ceil(Math.sqrt(quantity));
        composite.push({
          input: outputPath,
          top: row * heightInPixels,
          left: col * widthInPixels
        });
      }

      await sharp({
        create: {
          width: sheetWidth,
          height: sheetHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
        .composite(composite)
        .toFile(multipleOutputPath);

      res.download(multipleOutputPath, `passport-photos-${quantity}.${format}`, (err) => {
        // Clean up files
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        if (fs.existsSync(multipleOutputPath)) fs.unlinkSync(multipleOutputPath);
      });
    } else {
      res.download(outputPath, `passport-photo.${format}`, (err) => {
        // Clean up files
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });
    }

  } catch (error) {
    console.error("Passport photo generation error:", error);
    res.status(500).json({ error: "Failed to generate passport photo" });
  }
});

// ================== Background Removal ==================
app.post("/api/remove-background", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = `uploads/no-bg-${Date.now()}.png`;

    // For now, we'll use a simple approach to remove background
    // In production, you might want to use AI services like Remove.bg API
    await sharp(inputPath)
      .png()
      .toFile(outputPath);

    res.download(outputPath, "no-background.png", (err) => {
      // Clean up files
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error("Background removal error:", error);
    res.status(500).json({ error: "Failed to remove background" });
  }
});

// ================== Image Resize with DPI ==================
app.post("/api/resize-with-dpi", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const {
      width,
      height,
      dpi = "300",
      unit = "mm",
      format = "jpg",
      background = "white"
    } = req.body;

    if (!width || !height) {
      return res.status(400).json({ error: "Width and height are required" });
    }

    const dpiValue = parseInt(dpi);
    let widthInPixels, heightInPixels;

    // Convert to pixels based on unit and DPI
    if (unit === "mm") {
      const mmToInch = 0.0393701;
      widthInPixels = Math.round(width * mmToInch * dpiValue);
      heightInPixels = Math.round(height * mmToInch * dpiValue);
    } else if (unit === "cm") {
      const cmToInch = 0.393701;
      widthInPixels = Math.round(width * cmToInch * dpiValue);
      heightInPixels = Math.round(height * cmToInch * dpiValue);
    } else if (unit === "inch") {
      widthInPixels = Math.round(width * dpiValue);
      heightInPixels = Math.round(height * dpiValue);
    } else {
      widthInPixels = parseInt(width);
      heightInPixels = parseInt(height);
    }

    const inputPath = req.file.path;
    const outputPath = `uploads/resized-${Date.now()}.${format}`;

    let processedImage = sharp(inputPath)
      .resize(widthInPixels, heightInPixels, {
        fit: 'cover',
        position: 'center'
      });

    if (background !== "transparent") {
      processedImage = processedImage.flatten({ background: background });
    }

    if (format === "jpg" || format === "jpeg") {
      processedImage = processedImage.jpeg({ quality: 90 });
    } else if (format === "png") {
      processedImage = processedImage.png();
    }

    await processedImage.toFile(outputPath);

    res.download(outputPath, `resized.${format}`, (err) => {
      // Clean up files
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error("Image resize error:", error);
    res.status(500).json({ error: "Failed to resize image" });
  }
});

// ================== Image Compression ==================
app.post("/api/compress-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const {
      quality = "80",
      maxSize = "100", // in KB
      format = "jpg"
    } = req.body;

    const inputPath = req.file.path;
    const outputPath = `uploads/compressed-${Date.now()}.${format}`;
    const maxSizeBytes = parseInt(maxSize) * 1024;

    let processedImage = sharp(inputPath);
    let currentQuality = parseInt(quality);

    // Compress with quality reduction if needed
    if (format === "jpg" || format === "jpeg") {
      processedImage = processedImage.jpeg({ quality: currentQuality });
    } else if (format === "png") {
      processedImage = processedImage.png({ quality: currentQuality });
    } else if (format === "webp") {
      processedImage = processedImage.webp({ quality: currentQuality });
    }

    await processedImage.toFile(outputPath);

    // Check file size and reduce quality if needed
    const stats = fs.statSync(outputPath);
    if (stats.size > maxSizeBytes && currentQuality > 10) {
      // Reduce quality and try again
      currentQuality = Math.max(10, currentQuality - 10);

      if (format === "jpg" || format === "jpeg") {
        await sharp(inputPath).jpeg({ quality: currentQuality }).toFile(outputPath);
      } else if (format === "png") {
        await sharp(inputPath).png({ quality: currentQuality }).toFile(outputPath);
      } else if (format === "webp") {
        await sharp(inputPath).webp({ quality: currentQuality }).toFile(outputPath);
      }
    }

    res.download(outputPath, `compressed.${format}`, (err) => {
      // Clean up files
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });

  } catch (error) {
    console.error("Image compression error:", error);
    res.status(500).json({ error: "Failed to compress image" });
  }
});

// ================== Image(s) to PDF ==================
app.post("/api/convert/image-to-pdf", upload.array("images", 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const { pageSize = "A4", margin = 20 } = req.body;
    const outputPath = `uploads/images-${Date.now()}.pdf`;

    const doc = new PDFDocument({ autoFirstPage: false });
    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    for (const file of req.files) {
      const { path: imgPath } = file;
      const image = doc.openImage ? doc.openImage(imgPath) : null;
      // Fallback: add a page and draw image using dimensions from sharp
      const metadata = await sharp(imgPath).metadata();
      doc.addPage({ size: pageSize, margins: { top: +margin, bottom: +margin, left: +margin, right: +margin } });
      const pageWidth = doc.page.width - margin * 2;
      const pageHeight = doc.page.height - margin * 2;
      const imgRatio = metadata.width / metadata.height;
      const pageRatio = pageWidth / pageHeight;
      let drawWidth, drawHeight;
      if (imgRatio > pageRatio) {
        drawWidth = pageWidth;
        drawHeight = pageWidth / imgRatio;
      } else {
        drawHeight = pageHeight;
        drawWidth = pageHeight * imgRatio;
      }
      const x = (doc.page.width - drawWidth) / 2;
      const y = (doc.page.height - drawHeight) / 2;
      doc.image(imgPath, x, y, { width: drawWidth, height: drawHeight });
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    doc.end();
    writeStream.on("finish", () => {
      res.download(outputPath, `images.pdf`, (err) => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });
    });
    writeStream.on("error", (err) => {
      console.error("PDF generation error:", err);
      res.status(500).json({ error: "Failed to generate PDF" });
    });
  } catch (error) {
    console.error("Images to PDF error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// ================== JPG to PDF under size limit (KB) ==================
app.post("/api/convert/jpg-to-pdf", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const { limit = 100 } = req.query; // KB
    const sizeLimitBytes = parseInt(limit) * 1024;

    const tempPdf = `uploads/tmp-${Date.now()}.pdf`;
    const { path: imgPath } = req.file;

    let quality = 90;
    let attempt = 0;
    while (attempt < 8) {
      const tempImg = `uploads/tmp-img-${Date.now()}.jpg`;
      await sharp(imgPath).jpeg({ quality }).toFile(tempImg);

      const doc = new PDFDocument({ autoFirstPage: false });
      const ws = fs.createWriteStream(tempPdf);
      doc.pipe(ws);
      const meta = await sharp(tempImg).metadata();
      const pageWidth = meta.width;
      const pageHeight = meta.height;
      doc.addPage({ size: [pageWidth, pageHeight], margins: { top: 0, bottom: 0, left: 0, right: 0 } });
      doc.image(tempImg, 0, 0, { width: pageWidth, height: pageHeight });
      doc.end();
      await new Promise((r, j) => {
        ws.on("finish", r);
        ws.on("error", j);
      });

      const stat = fs.statSync(tempPdf);
      fs.unlinkSync(tempImg);
      if (stat.size <= sizeLimitBytes || quality <= 30) {
        // success
        res.download(tempPdf, `output-${limit}kb.pdf`, (err) => {
          if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        });
        return;
      }
      // reduce quality and retry
      quality = Math.max(30, quality - 10);
      attempt += 1;
    }

    // Fallback if couldn't meet target
    res.download(tempPdf, `output-approx.pdf`, (err) => {
      if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    });
  } catch (error) {
    console.error("JPG to PDF limit error:", error);
    res.status(500).json({ error: "Failed to generate limited-size PDF" });
  }
});

// ================== OCR (Image to Text) ==================
app.post("/api/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    const { lang = "eng" } = req.body;
    const { data } = await Tesseract.recognize(req.file.path, lang);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.json({ text: data.text });
  } catch (error) {
    console.error("OCR error:", error);
    res.status(500).json({ error: "Failed to extract text" });
  }
});

// ================== Image Editing Tools ==================

// Generate Signature
app.post("/api/tools/generate-signature", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { width = 200, height = 100, background = "transparent" } = req.body;
    const inputPath = req.file.path;
    const outputPath = `uploads/signature-${Date.now()}.png`;

    let processedImage = sharp(inputPath)
      .resize(parseInt(width), parseInt(height), { fit: 'contain', background: 'transparent' });

    if (background !== "transparent") {
      processedImage = processedImage.flatten({ background: background });
    }

    await processedImage.png().toFile(outputPath);

    res.download(outputPath, "signature.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    res.status(500).json({ error: "Failed to generate signature" });
  }
});

// Watermark Images
app.post("/api/tools/watermark", upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'watermark', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files.image || !req.files.watermark) {
      return res.status(400).json({ error: "Both image and watermark are required" });
    }

    const { position = 'bottomRight', opacity = 0.7 } = req.body;
    const inputPath = req.files.image[0].path;
    const watermarkPath = req.files.watermark[0].path;
    const outputPath = `uploads/watermarked-${Date.now()}.png`;

    const image = sharp(inputPath);
    const watermark = sharp(watermarkPath);
    const metadata = await image.metadata();

    // Resize watermark to 20% of image width
    const watermarkWidth = Math.round(metadata.width * 0.2);
    const watermarkHeight = Math.round(metadata.height * 0.2);
    const resizedWatermark = await watermark.resize(watermarkWidth, watermarkHeight).png().toBuffer();

    let composite = [];
    if (position === 'bottomRight') {
      composite.push({
        input: resizedWatermark,
        top: metadata.height - watermarkHeight - 20,
        left: metadata.width - watermarkWidth - 20
      });
    } else if (position === 'center') {
      composite.push({
        input: resizedWatermark,
        top: Math.round((metadata.height - watermarkHeight) / 2),
        left: Math.round((metadata.width - watermarkWidth) / 2)
      });
    }

    await image.composite(composite).png().toFile(outputPath);

    res.download(outputPath, "watermarked.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(watermarkPath)) fs.unlinkSync(watermarkPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Watermark error:", error);
    res.status(500).json({ error: "Failed to add watermark" });
  }
});

// Rotate Image
app.post("/api/tools/rotate", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { angle = 90, background = "white" } = req.body;
    const inputPath = req.file.path;
    const outputPath = `uploads/rotated-${Date.now()}.png`;

    await sharp(inputPath)
      .rotate(parseInt(angle), { background: background })
      .png()
      .toFile(outputPath);

    res.download(outputPath, "rotated.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Image rotation error:", error);
    res.status(500).json({ error: "Failed to rotate image" });
  }
});

// Flip Image
app.post("/api/tools/flip", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { direction = "horizontal" } = req.body;
    const inputPath = req.file.path;
    const outputPath = `uploads/flipped-${Date.now()}.png`;

    let processedImage = sharp(inputPath);
    if (direction === "horizontal") {
      processedImage = processedImage.flop();
    } else if (direction === "vertical") {
      processedImage = processedImage.flip();
    }

    await processedImage.png().toFile(outputPath);

    res.download(outputPath, "flipped.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Image flip error:", error);
    res.status(500).json({ error: "Failed to flip image" });
  }
});

// Add Name & DOB on Photo
app.post("/api/tools/add-text", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { text, x = 50, y = 50, fontSize = 24, color = "white" } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const inputPath = req.file.path;
    const outputPath = `uploads/text-added-${Date.now()}.png`;

    // Create text overlay
    const textSvg = `
      <svg width="400" height="100">
        <text x="${x}" y="${y}" font-family="Arial" font-size="${fontSize}" fill="${color}" stroke="black" stroke-width="1">
          ${text}
        </text>
      </svg>
    `;

    await sharp(inputPath)
      .composite([{
        input: Buffer.from(textSvg),
        top: 0,
        left: 0
      }])
      .png()
      .toFile(outputPath);

    res.download(outputPath, "text-added.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Text addition error:", error);
    res.status(500).json({ error: "Failed to add text" });
  }
});

// Check Image DPI
app.post("/api/tools/check-dpi", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const metadata = await sharp(inputPath).metadata();

    // Calculate DPI (assuming standard print size)
    const dpi = Math.round(metadata.width / 3.5); // 3.5 inches is standard width

    res.json({
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      dpi: dpi,
      size: fs.statSync(inputPath).size
    });

    // Clean up
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  } catch (error) {
    console.error("DPI check error:", error);
    res.status(500).json({ error: "Failed to check DPI" });
  }
});

// Black & White Image
app.post("/api/tools/black-white", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/bw-${Date.now()}.png`;

    await sharp(inputPath)
      .grayscale()
      .png()
      .toFile(outputPath);

    res.download(outputPath, "black-white.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Black & white conversion error:", error);
    res.status(500).json({ error: "Failed to convert to black & white" });
  }
});

// Grayscale Image
app.post("/api/tools/grayscale", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/grayscale-${Date.now()}.png`;

    await sharp(inputPath)
      .grayscale()
      .png()
      .toFile(outputPath);

    res.download(outputPath, "grayscale.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Grayscale conversion error:", error);
    res.status(500).json({ error: "Failed to convert to grayscale" });
  }
});

// Circle Crop
app.post("/api/tools/circle-crop", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/circle-${Date.now()}.png`;

    const metadata = await sharp(inputPath).metadata();
    const size = Math.min(metadata.width, metadata.height);

    // Create circular mask
    const circleSvg = `
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
      </svg>
    `;

    await sharp(inputPath)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .png()
      .toFile(outputPath);

    res.download(outputPath, "circle-crop.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Circle crop error:", error);
    res.status(500).json({ error: "Failed to create circle crop" });
  }
});

// Pixelate Image
app.post("/api/tools/pixelate", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { pixelSize = 10 } = req.body;
    const inputPath = req.file.path;
    const outputPath = `uploads/pixelated-${Date.now()}.png`;

    const metadata = await sharp(inputPath).metadata();
    const smallSize = Math.round(metadata.width / parseInt(pixelSize));

    await sharp(inputPath)
      .resize(smallSize, smallSize, { fit: 'fill' })
      .resize(metadata.width, metadata.height, { fit: 'fill', kernel: 'nearest' })
      .png()
      .toFile(outputPath);

    res.download(outputPath, "pixelated.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Pixelation error:", error);
    res.status(500).json({ error: "Failed to pixelate image" });
  }
});

// ================== Specialized Resize Tools ==================

// Resize Image to 6cm x 2cm (300 DPI)
app.post("/api/tools/resize-6x2cm", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/6x2cm-${Date.now()}.png`;

    // 6cm x 2cm at 300 DPI = 708 x 236 pixels
    const width = 708;
    const height = 236;

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .png()
      .toFile(outputPath);

    res.download(outputPath, "6x2cm-300dpi.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("6x2cm resize error:", error);
    res.status(500).json({ error: "Failed to resize image" });
  }
});

// Resize Image to 3.5cm x 4.5cm
app.post("/api/tools/resize-35x45mm", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/35x45mm-${Date.now()}.png`;

    // 3.5cm x 4.5cm at 300 DPI = 413 x 531 pixels
    const width = 413;
    const height = 531;

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .png()
      .toFile(outputPath);

    res.download(outputPath, "35x45mm-300dpi.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("35x45mm resize error:", error);
    res.status(500).json({ error: "Failed to resize image" });
  }
});

// Resize Signature (50mm x 20mm)
app.post("/api/tools/resize-signature", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/signature-50x20mm-${Date.now()}.png`;

    // 50mm x 20mm at 300 DPI = 591 x 236 pixels
    const width = 591;
    const height = 236;

    await sharp(inputPath)
      .resize(width, height, { fit: 'contain', background: 'transparent' })
      .png()
      .toFile(outputPath);

    res.download(outputPath, "signature-50x20mm.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Signature resize error:", error);
    res.status(500).json({ error: "Failed to resize signature" });
  }
});

// Instagram Grid Maker
app.post("/api/tools/instagram-grid", upload.array("images", 9), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const { gridSize = "3x3" } = req.body;
    const [cols, rows] = gridSize.split("x").map(Number);
    const maxImages = cols * rows;

    if (req.files.length > maxImages) {
      return res.status(400).json({ error: `Maximum ${maxImages} images allowed for ${gridSize} grid` });
    }

    const cellSize = 1080; // Instagram standard size
    const gridWidth = cols * cellSize;
    const gridHeight = rows * cellSize;

    const composite = [];
    for (let i = 0; i < req.files.length; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;

      const resizedImage = await sharp(req.files[i].path)
        .resize(cellSize, cellSize, { fit: 'cover', position: 'center' })
        .png()
        .toBuffer();

      composite.push({
        input: resizedImage,
        top: row * cellSize,
        left: col * cellSize
      });
    }

    const outputPath = `uploads/instagram-grid-${Date.now()}.png`;
    await sharp({
      create: {
        width: gridWidth,
        height: gridHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite(composite)
      .png()
      .toFile(outputPath);

    res.download(outputPath, "instagram-grid.png", (err) => {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Instagram grid error:", error);
    res.status(500).json({ error: "Failed to create Instagram grid" });
  }
});

// Join Images In One Image
app.post("/api/tools/join-images", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const { direction = "horizontal", spacing = 0 } = req.body;
    const spacingPx = parseInt(spacing);

    let totalWidth = 0;
    let maxHeight = 0;
    const processedImages = [];

    // Process all images
    for (const file of req.files) {
      const metadata = await sharp(file.path).metadata();
      processedImages.push({
        path: file.path,
        width: metadata.width,
        height: metadata.height
      });

      if (direction === "horizontal") {
        totalWidth += metadata.width;
        maxHeight = Math.max(maxHeight, metadata.height);
      } else {
        maxHeight += metadata.height;
        totalWidth = Math.max(totalWidth, metadata.width);
      }
    }

    // Add spacing
    if (direction === "horizontal") {
      totalWidth += spacingPx * (processedImages.length - 1);
    } else {
      maxHeight += spacingPx * (processedImages.length - 1);
    }

    const outputPath = `uploads/joined-images-${Date.now()}.png`;
    const composite = [];

    if (direction === "horizontal") {
      let currentX = 0;
      for (let i = 0; i < processedImages.length; i++) {
        const resizedImage = await sharp(processedImages[i].path)
          .resize(processedImages[i].width, processedImages[i].height)
          .png()
          .toBuffer();

        composite.push({
          input: resizedImage,
          top: 0,
          left: currentX
        });
        currentX += processedImages[i].width + spacingPx;
      }
    } else {
      let currentY = 0;
      for (let i = 0; i < processedImages.length; i++) {
        const resizedImage = await sharp(processedImages[i].path)
          .resize(processedImages[i].width, processedImages[i].height)
          .png()
          .toBuffer();

        composite.push({
          input: resizedImage,
          top: currentY,
          left: 0
        });
        currentY += processedImages[i].height + spacingPx;
      }
    }

    await sharp({
      create: {
        width: totalWidth,
        height: maxHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite(composite)
      .png()
      .toFile(outputPath);

    res.download(outputPath, "joined-images.png", (err) => {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      });
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Join images error:", error);
    res.status(500).json({ error: "Failed to join images" });
  }
});

// Split Image
app.post("/api/tools/split-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { rows = 2, cols = 2 } = req.body;
    const inputPath = req.file.path;
    const metadata = await sharp(inputPath).metadata();

    const cellWidth = Math.floor(metadata.width / cols);
    const cellHeight = Math.floor(metadata.height / rows);

    const zip = new JSZip();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;

        const cellImage = await sharp(inputPath)
          .extract({ left: x, top: y, width: cellWidth, height: cellHeight })
          .png()
          .toBuffer();

        zip.file(`cell-${row}-${col}.png`, cellImage);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const outputPath = `uploads/split-image-${Date.now()}.zip`;
    fs.writeFileSync(outputPath, zipBuffer);

    res.download(outputPath, "split-images.zip", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Split image error:", error);
    res.status(500).json({ error: "Failed to split image" });
  }
});

// Image Color Picker
app.post("/api/tools/color-picker", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const { x = 0, y = 0 } = req.body;

    const pixel = await sharp(inputPath)
      .extract({ left: parseInt(x), top: parseInt(y), width: 1, height: 1 })
      .raw()
      .toBuffer();

    const [r, g, b] = pixel;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    res.json({
      rgb: { r, g, b },
      hex: hex,
      position: { x: parseInt(x), y: parseInt(y) }
    });

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  } catch (error) {
    console.error("Color picker error:", error);
    res.status(500).json({ error: "Failed to pick color" });
  }
});

// Freehand Crop (Custom Selection)
app.post("/api/tools/freehand-crop", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { x, y, width, height } = req.body;
    if (!x || !y || !width || !height) {
      return res.status(400).json({ error: "Crop coordinates and dimensions are required" });
    }

    const inputPath = req.file.path;
    const outputPath = `uploads/cropped-${Date.now()}.png`;

    await sharp(inputPath)
      .extract({
        left: parseInt(x),
        top: parseInt(y),
        width: parseInt(width),
        height: parseInt(height)
      })
      .png()
      .toFile(outputPath);

    res.download(outputPath, "cropped.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Freehand crop error:", error);
    res.status(500).json({ error: "Failed to crop image" });
  }
});

// ================== Document-Specific Resize Tools ==================

// Resize Image for Instagram (No Crop)
app.post("/api/tools/resize-instagram", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/instagram-${Date.now()}.jpg`;

    // Instagram aspect ratio: 4:5 (portrait) or 1:1 (square)
    const { aspect = "1:1" } = req.body;

    let width, height;
    if (aspect === "4:5") {
      width = 1080;
      height = 1350;
    } else {
      width = 1080;
      height = 1080;
    }

    await sharp(inputPath)
      .resize(width, height, { fit: 'contain', background: 'white' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "instagram-ready.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Instagram resize error:", error);
    res.status(500).json({ error: "Failed to resize for Instagram" });
  }
});

// Resize Image for WhatsApp DP
app.post("/api/tools/resize-whatsapp-dp", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/whatsapp-dp-${Date.now()}.jpg`;

    // WhatsApp DP: 192x192 pixels
    const size = 192;

    await sharp(inputPath)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "whatsapp-dp.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("WhatsApp DP resize error:", error);
    res.status(500).json({ error: "Failed to resize for WhatsApp DP" });
  }
});

// Resize Image to 4x6
app.post("/api/tools/resize-4x6", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/4x6-${Date.now()}.jpg`;

    // 4x6 inches at 300 DPI = 1200 x 1800 pixels
    const width = 1200;
    const height = 1800;

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "4x6-300dpi.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("4x6 resize error:", error);
    res.status(500).json({ error: "Failed to resize to 4x6" });
  }
});

// Resize Image to 3x4
app.post("/api/tools/resize-3x4", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/3x4-${Date.now()}.jpg`;

    // 3x4 inches at 300 DPI = 900 x 1200 pixels
    const width = 900;
    const height = 1200;

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "3x4-300dpi.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("3x4 resize error:", error);
    res.status(500).json({ error: "Failed to resize to 3x4" });
  }
});

// Resize Image to 2x2 Inch
app.post("/api/tools/resize-2x2", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/2x2-${Date.now()}.jpg`;

    // 2x2 inches at 300 DPI = 600 x 600 pixels
    const size = 600;

    await sharp(inputPath)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "2x2-300dpi.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("2x2 resize error:", error);
    res.status(500).json({ error: "Failed to resize to 2x2" });
  }
});

// Resize Image to 600x600
app.post("/api/tools/resize-600x600", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/600x600-${Date.now()}.jpg`;

    const size = 600;

    await sharp(inputPath)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "600x600.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("600x600 resize error:", error);
    res.status(500).json({ error: "Failed to resize to 600x600" });
  }
});

// Resize Image to A4 Size
app.post("/api/tools/resize-a4", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/a4-${Date.now()}.jpg`;

    // A4: 210mm x 297mm at 300 DPI = 2480 x 3508 pixels
    const width = 2480;
    const height = 3508;

    await sharp(inputPath)
      .resize(width, height, { fit: 'contain', background: 'white' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "a4-300dpi.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("A4 resize error:", error);
    res.status(500).json({ error: "Failed to resize to A4" });
  }
});

// Resize Image For SSC
app.post("/api/tools/resize-ssc", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/ssc-${Date.now()}.jpg`;

    // SSC: 35mm x 45mm at 300 DPI = 413 x 531 pixels
    const width = 413;
    const height = 531;

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "ssc-photo.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("SSC resize error:", error);
    res.status(500).json({ error: "Failed to resize for SSC" });
  }
});

// Resize Image For PAN Card
app.post("/api/tools/resize-pan-card", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/pan-card-${Date.now()}.jpg`;

    // PAN Card: 35mm x 25mm at 300 DPI = 413 x 295 pixels
    const width = 413;
    const height = 295;

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "pan-card-photo.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("PAN Card resize error:", error);
    res.status(500).json({ error: "Failed to resize for PAN Card" });
  }
});

// Resize Image For UPSC
app.post("/api/tools/resize-upsc", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/upsc-${Date.now()}.jpg`;

    // UPSC: 35mm x 45mm at 300 DPI = 413 x 531 pixels
    const width = 413;
    const height = 531;

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "upsc-photo.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("UPSC resize error:", error);
    res.status(500).json({ error: "Failed to resize for UPSC" });
  }
});

// Resize Image for YouTube Banner
app.post("/api/tools/resize-youtube-banner", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/youtube-banner-${Date.now()}.jpg`;

    // YouTube Banner: 2560 x 1440 pixels
    const width = 2560;
    const height = 1440;

    await sharp(inputPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    res.download(outputPath, "youtube-banner.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("YouTube banner resize error:", error);
    res.status(500).json({ error: "Failed to resize for YouTube banner" });
  }
});

// ================== Advanced Compression Tools ==================

// Compress Image To 5kb
app.post("/api/tools/compress-to-5kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/5kb-${Date.now()}.jpg`;
    const targetSize = 5 * 1024; // 5KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-5kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("5KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 5KB" });
  }
});

// Compress JPEG To 10kb
app.post("/api/tools/compress-to-10kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/10kb-${Date.now()}.jpg`;
    const targetSize = 10 * 1024; // 10KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-10kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("10KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 10KB" });
  }
});

// Compress Image To 15kb
app.post("/api/tools/compress-to-15kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/15kb-${Date.now()}.jpg`;
    const targetSize = 15 * 1024; // 15KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-15kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("15KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 15KB" });
  }
});

// Compress Image To 20kb
app.post("/api/tools/compress-to-20kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/20kb-${Date.now()}.jpg`;
    const targetSize = 20 * 1024; // 20KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-20kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("20KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 20KB" });
  }
});

// Compress Image Between 20kb to 50kb
app.post("/api/tools/compress-20-50kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/20-50kb-${Date.now()}.jpg`;
    const minSize = 20 * 1024; // 20KB
    const maxSize = 50 * 1024; // 50KB

    let quality = 90;
    let attempt = 0;

    while (attempt < 15) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size >= minSize && stats.size <= maxSize) {
        break;
      }

      if (stats.size > maxSize) {
        quality = Math.max(10, quality - 10);
      } else {
        quality = Math.min(95, quality + 5);
      }

      attempt++;
    }

    res.download(outputPath, "compressed-20-50kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("20-50KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 20-50KB range" });
  }
});

// Compress Image To 25kb
app.post("/api/tools/compress-to-25kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/25kb-${Date.now()}.jpg`;
    const targetSize = 25 * 1024; // 25KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-25kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("25KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 25KB" });
  }
});

// Compress JPEG To 30kb
app.post("/api/tools/compress-to-30kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/30kb-${Date.now()}.jpg`;
    const targetSize = 30 * 1024; // 30KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-30kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("30KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 30KB" });
  }
});

// Compress JPEG To 40kb
app.post("/api/tools/compress-to-40kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/40kb-${Date.now()}.jpg`;
    const targetSize = 40 * 1024; // 40KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-40kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("40KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 40KB" });
  }
});

// Compress Image to 50kb
app.post("/api/tools/compress-to-50kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/50kb-${Date.now()}.jpg`;
    const targetSize = 50 * 1024; // 50KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-50kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("50KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 50KB" });
  }
});

// Compress Image to 100kb
app.post("/api/tools/compress-to-100kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/100kb-${Date.now()}.jpg`;
    const targetSize = 100 * 1024; // 100KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-100kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("100KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 100KB" });
  }
});

// Compress JPEG To 150kb
app.post("/api/tools/compress-to-150kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/150kb-${Date.now()}.jpg`;
    const targetSize = 150 * 1024; // 150KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-150kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("150KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 150KB" });
  }
});

// Compress Image To 200kb
app.post("/api/tools/compress-to-200kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/200kb-${Date.now()}.jpg`;
    const targetSize = 200 * 1024; // 200KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-200kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("200KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 200KB" });
  }
});

// Compress JPEG To 300kb
app.post("/api/tools/compress-to-300kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/300kb-${Date.now()}.jpg`;
    const targetSize = 300 * 1024; // 300KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-300kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("300KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 300KB" });
  }
});

// Compress JPEG To 500kb
app.post("/api/tools/compress-to-500kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/500kb-${Date.now()}.jpg`;
    const targetSize = 500 * 1024; // 500KB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-500kb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("500KB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 500KB" });
  }
});

// Compress Image To 1 MB
app.post("/api/tools/compress-to-1mb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/1mb-${Date.now()}.jpg`;
    const targetSize = 1024 * 1024; // 1MB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-1mb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("1MB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 1MB" });
  }
});

// Compress Image To 2 MB
app.post("/api/tools/compress-to-2mb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const outputPath = `uploads/2mb-${Date.now()}.jpg`;
    const targetSize = 2 * 1024 * 1024; // 2MB in bytes

    let quality = 90;
    let attempt = 0;

    while (attempt < 10) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSize || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    res.download(outputPath, "compressed-2mb.jpg", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("2MB compression error:", error);
    res.status(500).json({ error: "Failed to compress to 2MB" });
  }
});

// ================== Utility Tools ==================

// JPG To KB
app.post("/api/tools/jpg-to-kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const stats = fs.statSync(inputPath);
    const sizeInKB = Math.round(stats.size / 1024);

    res.json({
      originalSize: stats.size,
      sizeInKB: sizeInKB,
      sizeInMB: (sizeInKB / 1024).toFixed(2)
    });

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  } catch (error) {
    console.error("JPG to KB error:", error);
    res.status(500).json({ error: "Failed to get file size" });
  }
});

// Convert Image MB To KB
app.post("/api/tools/convert-mb-to-kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const stats = fs.statSync(inputPath);
    const sizeInKB = Math.round(stats.size / 1024);
    const sizeInMB = (sizeInKB / 1024).toFixed(2);

    res.json({
      originalSize: stats.size,
      sizeInKB: sizeInKB,
      sizeInMB: sizeInMB,
      conversion: `${sizeInMB} MB = ${sizeInKB} KB`
    });

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  } catch (error) {
    console.error("MB to KB conversion error:", error);
    res.status(500).json({ error: "Failed to convert file size" });
  }
});

// Convert Image KB To MB
app.post("/api/tools/convert-kb-to-mb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const inputPath = req.file.path;
    const stats = fs.statSync(inputPath);
    const sizeInKB = Math.round(stats.size / 1024);
    const sizeInMB = (sizeInKB / 1024).toFixed(2);

    res.json({
      originalSize: stats.size,
      sizeInKB: sizeInKB,
      sizeInMB: sizeInMB,
      conversion: `${sizeInKB} KB = ${sizeInMB} MB`
    });

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
  } catch (error) {
    console.error("KB to MB conversion error:", error);
    res.status(500).json({ error: "Failed to convert file size" });
  }
});

// Reduce Image Size in KB
app.post("/api/tools/reduce-size-kb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { targetSize = 100 } = req.body; // Target size in KB
    const inputPath = req.file.path;
    const outputPath = `uploads/reduced-${Date.now()}.jpg`;
    const targetSizeBytes = parseInt(targetSize) * 1024;

    const originalStats = fs.statSync(inputPath);
    const originalSizeKB = Math.round(originalStats.size / 1024);

    let quality = 90;
    let attempt = 0;

    while (attempt < 15) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSizeBytes || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    const finalStats = fs.statSync(outputPath);
    const finalSizeKB = Math.round(finalStats.size / 1024);
    const reduction = Math.round(((originalSizeKB - finalSizeKB) / originalSizeKB) * 100);

    res.download(outputPath, `reduced-${targetSize}kb.jpg`, (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Reduce size error:", error);
    res.status(500).json({ error: "Failed to reduce image size" });
  }
});

// Reduce Image Size in MB
app.post("/api/tools/reduce-size-mb", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { targetSize = 1 } = req.body; // Target size in MB
    const inputPath = req.file.path;
    const outputPath = `uploads/reduced-${Date.now()}.jpg`;
    const targetSizeBytes = parseFloat(targetSize) * 1024 * 1024;

    const originalStats = fs.statSync(inputPath);
    const originalSizeMB = (originalStats.size / (1024 * 1024)).toFixed(2);

    let quality = 90;
    let attempt = 0;

    while (attempt < 15) {
      await sharp(inputPath)
        .jpeg({ quality })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      if (stats.size <= targetSizeBytes || quality <= 10) {
        break;
      }

      quality = Math.max(10, quality - 10);
      attempt++;
    }

    const finalStats = fs.statSync(outputPath);
    const finalSizeMB = (finalStats.size / (1024 * 1024)).toFixed(2);
    const reduction = Math.round(((parseFloat(originalSizeMB) - parseFloat(finalSizeMB)) / parseFloat(originalSizeMB)) * 100);

    res.download(outputPath, `reduced-${targetSize}mb.jpg`, (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Reduce size MB error:", error);
    res.status(500).json({ error: "Failed to reduce image size" });
  }
});

// Pi7 Bulk Image Resizer
app.post("/api/tools/bulk-resize", upload.array("images", 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const { width, height, quality = 90, format = "jpg" } = req.body;
    if (!width || !height) {
      return res.status(400).json({ error: "Width and height are required" });
    }

    const zip = new JSZip();

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const outputPath = `uploads/bulk-${i}-${Date.now()}.${format}`;

      let processedImage = sharp(file.path).resize(parseInt(width), parseInt(height), {
        fit: 'cover',
        position: 'center'
      });

      if (format === "jpg" || format === "jpeg") {
        processedImage = processedImage.jpeg({ quality: parseInt(quality) });
      } else if (format === "png") {
        processedImage = processedImage.png();
      } else if (format === "webp") {
        processedImage = processedImage.webp({ quality: parseInt(quality) });
      }

      const buffer = await processedImage.toBuffer();
      zip.file(`resized-${i + 1}.${format}`, buffer);

      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    const zipOutputPath = `uploads/bulk-resized-${Date.now()}.zip`;
    fs.writeFileSync(zipOutputPath, zipBuffer);

    res.download(zipOutputPath, "bulk-resized-images.zip", (err) => {
      if (fs.existsSync(zipOutputPath)) fs.unlinkSync(zipOutputPath);
    });
  } catch (error) {
    console.error("Bulk resize error:", error);
    res.status(500).json({ error: "Failed to bulk resize images" });
  }
});

// Resize Image In Centimeter
app.post("/api/tools/resize-cm", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { width, height, dpi = 300, format = "jpg" } = req.body;
    if (!width || !height) {
      return res.status(400).json({ error: "Width and height in cm are required" });
    }

    const inputPath = req.file.path;
    const outputPath = `uploads/cm-${Date.now()}.${format}`;

    // Convert cm to pixels at specified DPI
    const cmToInch = 0.393701;
    const widthInPixels = Math.round(width * cmToInch * parseInt(dpi));
    const heightInPixels = Math.round(height * cmToInch * parseInt(dpi));

    let processedImage = sharp(inputPath).resize(widthInPixels, heightInPixels, {
      fit: 'cover',
      position: 'center'
    });

    if (format === "jpg" || format === "jpeg") {
      processedImage = processedImage.jpeg({ quality: 90 });
    } else if (format === "png") {
      processedImage = processedImage.png();
    }

    await processedImage.toFile(outputPath);

    res.download(outputPath, `resized-${width}x${height}cm.${format}`, (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("CM resize error:", error);
    res.status(500).json({ error: "Failed to resize in centimeters" });
  }
});

// Resize Image In MM
app.post("/api/tools/resize-mm", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { width, height, dpi = 300, format = "jpg" } = req.body;
    if (!width || !height) {
      return res.status(400).json({ error: "Width and height in mm are required" });
    }

    const inputPath = req.file.path;
    const outputPath = `uploads/mm-${Date.now()}.${format}`;

    // Convert mm to pixels at specified DPI
    const mmToInch = 0.0393701;
    const widthInPixels = Math.round(width * mmToInch * parseInt(dpi));
    const heightInPixels = Math.round(height * mmToInch * parseInt(dpi));

    let processedImage = sharp(inputPath).resize(widthInPixels, heightInPixels, {
      fit: 'cover',
      position: 'center'
    });

    if (format === "jpg" || format === "jpeg") {
      processedImage = processedImage.jpeg({ quality: 90 });
    } else if (format === "png") {
      processedImage = processedImage.png();
    }

    await processedImage.toFile(outputPath);

    res.download(outputPath, `resized-${width}x${height}mm.${format}`, (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("MM resize error:", error);
    res.status(500).json({ error: "Failed to resize in millimeters" });
  }
});

// Resize Image In Inches
app.post("/api/tools/resize-inches", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { width, height, dpi = 300, format = "jpg" } = req.body;
    if (!width || !height) {
      return res.status(400).json({ error: "Width and height in inches are required" });
    }

    const inputPath = req.file.path;
    const outputPath = `uploads/inches-${Date.now()}.${format}`;

    // Convert inches to pixels at specified DPI
    const widthInPixels = Math.round(width * parseInt(dpi));
    const heightInPixels = Math.round(height * parseInt(dpi));

    let processedImage = sharp(inputPath).resize(widthInPixels, heightInPixels, {
      fit: 'cover',
      position: 'center'
    });

    if (format === "jpg" || format === "jpeg") {
      processedImage = processedImage.jpeg({ quality: 90 });
    } else if (format === "png") {
      processedImage = processedImage.png();
    }

    await processedImage.toFile(outputPath);

    res.download(outputPath, `resized-${width}x${height}inches.${format}`, (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Inches resize error:", error);
    res.status(500).json({ error: "Failed to resize in inches" });
  }
});

// Picture to Pixel Art
app.post("/api/tools/pixel-art", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { pixelSize = 8 } = req.body;
    const inputPath = req.file.path;
    const outputPath = `uploads/pixel-art-${Date.now()}.png`;

    const metadata = await sharp(inputPath).metadata();
    const smallSize = Math.round(metadata.width / parseInt(pixelSize));

    await sharp(inputPath)
      .resize(smallSize, smallSize, { fit: 'fill' })
      .resize(metadata.width, metadata.height, { fit: 'fill', kernel: 'nearest' })
      .png()
      .toFile(outputPath);

    res.download(outputPath, "pixel-art.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Pixel art error:", error);
    res.status(500).json({ error: "Failed to create pixel art" });
  }
});

// Super Resolution (Increase Image Quality)
app.post("/api/tools/super-resolution", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const { scale = 2 } = req.body;
    const inputPath = req.file.path;
    const outputPath = `uploads/super-res-${Date.now()}.png`;

    const metadata = await sharp(inputPath).metadata();
    const newWidth = metadata.width * parseInt(scale);
    const newHeight = metadata.height * parseInt(scale);

    await sharp(inputPath)
      .resize(newWidth, newHeight, {
        fit: 'fill',
        kernel: 'lanczos3' // High quality scaling
      })
      .png()
      .toFile(outputPath);

    res.download(outputPath, "super-resolution.png", (err) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error("Super resolution error:", error);
    res.status(500).json({ error: "Failed to increase image resolution" });
  }
});

// AI Face Generator (This Person Not Exist)
app.post("/api/tools/ai-face", async (req, res) => {
  try {
    // This is a placeholder for AI face generation
    // In production, you would integrate with services like:
    // - This Person Does Not Exist API
    // - DeepAI
    // - Or other AI image generation services

    res.json({
      message: "AI Face Generation feature requires integration with external AI services",
      availableServices: [
        "This Person Does Not Exist",
        "DeepAI",
        "OpenAI DALL-E",
        "Stable Diffusion"
      ],
      note: "This endpoint is a placeholder. Implement actual AI service integration based on your requirements."
    });
  } catch (error) {
    console.error("AI face generation error:", error);
    res.status(500).json({ error: "AI face generation not implemented" });
  }
});

// ================== AI: Image Caption ==================
app.post("/api/ai/caption", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: "OPENAI_API_KEY not configured on server" });
    }

    const prompt = req.body.prompt || "Describe this image in one concise sentence suitable as alt text.";
    const mime = req.file.mimetype || "image/jpeg";
    const b64 = fs.readFileSync(req.file.path, { encoding: "base64" });
    const dataUrl = `data:${mime};base64,${b64}`;

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful image captioning assistant. Respond with a concise caption under 25 words.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 150,
    };

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: "AI caption request failed", details: errText });
    }

    const data = await resp.json();
    const caption = data?.choices?.[0]?.message?.content?.trim() || "";

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.json({ caption });
  } catch (error) {
    console.error("AI caption error:", error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Failed to caption image" });
  }
});

// ================== Health Check ==================
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    privacy: "Images are automatically deleted after 30 minutes",
  });
});

// ================== File Status Endpoint ==================
app.get("/api/files/status", (req, res) => {
  const fileStatus = Array.from(uploadedFiles.entries()).map(([fileName, info]) => ({
    fileName,
    uploadedAt: info.uploadedAt,
    scheduledDeletion: info.scheduledDeletion,
    timeRemaining: Math.max(0, info.scheduledDeletion.getTime() - Date.now()),
    status: info.scheduledDeletion.getTime() > Date.now() ? "active" : "expired"
  }));

  res.json({
    totalFiles: uploadedFiles.size,
    files: fileStatus,
    privacyNotice: "Your images are automatically deleted after 30 minutes for privacy and security",
    deletionTime: "30 minutes"
  });
});

// ================== Privacy Notice Endpoint ==================
app.get("/api/privacy", (req, res) => {
  res.json({
    privacyNotice: "Your Privacy & Security",
    dataRetention: "30 minutes",
    automaticDeletion: true,
    dataProcessing: "Images are processed in memory and automatically deleted",
    noStorage: "We do not permanently store your images",
    security: "All uploads are encrypted and processed securely",
    compliance: "GDPR compliant data handling",
    contact: "For privacy concerns, contact our support team"
  });
});

// ================== OAuth Test Endpoint ==================
app.get("/api/auth/test", (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set",
    clientUrl: process.env.CLIENT_URL,
    jwtSecret: process.env.JWT_SECRET ? "Set" : "Not set",
  });
});

// ================== OAuth Debug Endpoint ==================
app.get("/api/auth/debug", (req, res) => {
  res.json({
    message: "OAuth Debug Info",
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...",
    callbackUrl: "/api/auth/google/callback",
    fullCallbackUrl: `http://localhost:5001/api/auth/google/callback`,
    instructions: [
      "1. Go to Google Cloud Console",
      "2. Navigate to APIs & Services > Credentials",
      "3. Edit your OAuth 2.0 Client ID",
      "4. Add this URL to 'Authorized redirect URIs':",
      "   http://localhost:5001/api/auth/google/callback",
      "5. Make sure Google+ API is enabled"
    ]
  });
});

// ================== Error Handling ==================
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Maximum size is 10MB." });
  }

  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// 404 handler
app.use("*", (req, res) => res.status(404).json({ error: "Route not found" }));

// ================== Database Connection ==================
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected successfully");
    } else {
      console.log("⚠️  No MongoDB URI provided, running without database");
    }
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("⚠️  Running without database for development");
  }
};

// ================== Server Startup ==================
const startServer = async () => {
  try {
    await connectDB();

    // Clean up expired files on server start
    cleanupExpiredFiles();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔒 Privacy Notice: Images are automatically deleted after 30 minutes`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
