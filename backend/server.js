// backend/server.js
import express from "express";
import passport from "passport";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import multer from "multer";
import sharp from "sharp";
import fs from "fs";

import "./config/passport.js"; // GoogleStrategy config
import User from "./models/User.js"; // User model

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// ================== Middleware ==================
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-session",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// ================= GOOGLE OAUTH =================
app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login`, session: false }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      res.redirect(`${process.env.CLIENT_URL}/login?token=${token}`);
    } catch (error) {
      console.error(error);
      res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  }
);

// ================= EMAIL + PASSWORD LOGIN =================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= IMAGE CONVERSION TOOLS =================
const upload = multer({ dest: "uploads/" });

const convertAndSend = async (req, res, format, ext) => {
  const inputPath = req.file.path;
  const outputPath = `uploads/${Date.now()}.${ext}`;

  try {
    await sharp(inputPath)[format]().toFile(outputPath);
    res.download(outputPath, `converted.${ext}`, () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Conversion failed: " + err.message);
  }
};

// HEIC → JPG
app.post("/api/heic-to-jpg", upload.single("file"), (req, res) =>
  convertAndSend(req, res, "jpeg", "jpg")
);

// WEBP → JPG
app.post("/api/webp-to-jpg", upload.single("file"), (req, res) =>
  convertAndSend(req, res, "jpeg", "jpg")
);

// JPEG → PNG
app.post("/api/jpeg-to-png", upload.single("file"), (req, res) =>
  convertAndSend(req, res, "png", "png")
);

// PNG → JPEG
app.post("/api/png-to-jpeg", upload.single("file"), (req, res) =>
  convertAndSend(req, res, "jpeg", "jpg")
);

// ================= SERVER =================
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
