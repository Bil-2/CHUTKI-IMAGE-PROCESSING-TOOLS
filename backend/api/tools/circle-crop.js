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

    const image = sharp(req.file.buffer);
    const { width: circleWidth } = await image.metadata();
    const radius = Math.min(circleWidth, circleWidth) / 2;

    const circleMask = Buffer.from(
      `<svg><circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/></svg>`
    );

    const processedBuffer = await image
      .resize(radius * 2, radius * 2, { fit: 'cover' })
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toBuffer();

    const filename = `circle_crop_${Date.now()}.png`;

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

  } catch (error) {
    console.error('Circle crop error:', error);
    res.status(500).json({ error: 'Failed to crop image to circle' });
  }
});

export default router;
