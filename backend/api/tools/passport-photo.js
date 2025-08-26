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

// Utility function to save file with cleanup
const saveWithCleanup = async (buffer, filename) => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, buffer);

  // Schedule cleanup after 30 minutes
  setTimeout(() => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }, 30 * 60 * 1000);

  return `/uploads/${filename}`;
};

// Passport Photo Maker endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { size = '2x2', dpi = 300, background = 'white', format = 'jpg', quantity = 1 } = req.body;

    let [width, height] = size.includes('x') ?
      size.split('x').map(s => parseFloat(s)) : [2, 2];

    const pixelWidth = Math.round(width * parseInt(dpi));
    const pixelHeight = Math.round(height * parseInt(dpi));

    const processedBuffer = await sharp(req.file.buffer)
      .resize(pixelWidth, pixelHeight, { fit: 'cover', position: 'top' })
      .flatten({ background })
      .withMetadata({ density: parseInt(dpi) })
      .jpeg({ quality: 95, mozjpeg: true })
      .toBuffer();

    // Generate filename
    const filename = `passport_photo_${Date.now()}.jpg`;

    // Return file directly
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

  } catch (error) {
    console.error('Passport photo error:', error);
    res.status(500).json({ error: 'Failed to process passport photo' });
  }
});

export default router;
