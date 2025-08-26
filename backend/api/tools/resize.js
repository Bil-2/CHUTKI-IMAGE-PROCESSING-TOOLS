import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Resize Image endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const {
      width = 800,
      height = 600,
      unit = 'pixels',
      dpi = 300,
      maintain = 'false'
    } = req.body;

    let resizeWidth = parseFloat(width);
    let resizeHeight = parseFloat(height);
    const targetDpi = parseInt(dpi);
    const maintainAspect = maintain === 'true';

    // Convert to pixels based on unit
    if (unit === 'cm') {
      resizeWidth = Math.round((resizeWidth / 2.54) * targetDpi);
      resizeHeight = Math.round((resizeHeight / 2.54) * targetDpi);
    } else if (unit === 'mm') {
      resizeWidth = Math.round((resizeWidth / 25.4) * targetDpi);
      resizeHeight = Math.round((resizeHeight / 25.4) * targetDpi);
    } else if (unit === 'inches') {
      resizeWidth = Math.round(resizeWidth * targetDpi);
      resizeHeight = Math.round(resizeHeight * targetDpi);
    }

    const fitMode = maintainAspect ? 'inside' : 'fill';
    let image = sharp(req.file.buffer)
      .resize(resizeWidth, resizeHeight, { fit: fitMode });

    if (unit !== 'pixels') {
      image = image.withMetadata({ density: targetDpi });
    }

    const processedBuffer = await image.jpeg({ quality: 90 }).toBuffer();

    // Generate filename
    const filename = `resized_${Date.now()}.jpg`;

    // Return file directly
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

  } catch (error) {
    console.error('Resize error:', error);
    res.status(500).json({ error: 'Failed to resize image' });
  }
});

export default router;
