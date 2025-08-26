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

    const {
      text = 'Sample Text',
      x = 50,
      y = 50,
      fontSize = 24,
      color = 'white'
    } = req.body;

    const textSvg = `
      <svg width="1000" height="100">
        <text x="0" y="${fontSize}" font-family="Arial" font-size="${fontSize}" fill="${color}">
          ${text}
        </text>
      </svg>
    `;

    const processedBuffer = await sharp(req.file.buffer)
      .composite([{
        input: Buffer.from(textSvg),
        left: parseInt(x),
        top: parseInt(y)
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    const filename = `text_overlay_${Date.now()}.jpg`;

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

  } catch (error) {
    console.error('Add text error:', error);
    res.status(500).json({ error: 'Failed to add text to image' });
  }
});

export default router;
