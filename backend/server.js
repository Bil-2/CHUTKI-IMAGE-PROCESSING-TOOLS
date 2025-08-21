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

// Import configurations and middleware
import "./config/passport.js";
import { protect } from "./middleware/auth.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use("/api/auth", authRoutes);

// Google OAuth routes
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

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

// ================== Image Processing ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
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
app.post("/api/passport-photo", upload.single("image"), async (req, res) => {
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
    await mongoose.connect(process.env.MONGO_URI); // ✅ no deprecated options
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// ================== Server Startup ==================
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
