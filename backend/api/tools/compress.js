import express from 'express';
import multer from 'multer';
import sharp from 'sharp';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { targetSize = 100, unit = 'kb', quality = 80 } = req.body;

    const targetKB = unit === 'mb' ? parseInt(targetSize) * 1024 : parseInt(targetSize);

    // Binary search for optimal quality
    let minQuality = 10, maxQuality = 95, bestQuality = parseInt(quality);
    let attempts = 0;

    while (minQuality <= maxQuality && attempts < 10) {
      const testQuality = Math.floor((minQuality + maxQuality) / 2);
      const testBuffer = await sharp(req.file.buffer).jpeg({ quality: testQuality }).toBuffer();
      const testSize = testBuffer.length / 1024; // KB

      if (Math.abs(testSize - targetKB) < targetKB * 0.05) {
        bestQuality = testQuality;
        break;
      }

      if (testSize > targetKB) {
        maxQuality = testQuality - 1;
      } else {
        minQuality = testQuality + 1;
        bestQuality = testQuality;
      }
      attempts++;
    }

    const processedBuffer = await sharp(req.file.buffer)
      .jpeg({ quality: bestQuality, mozjpeg: true })
      .toBuffer();

    const filename = `compressed_${Date.now()}.jpg`;

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

  } catch (error) {
    console.error('Compress error:', error);
    res.status(500).json({ error: 'Failed to compress image' });
  }
});

export default router;
