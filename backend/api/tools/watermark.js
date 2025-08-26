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

    const { text = 'Watermark', position = 'bottom-right', opacity = 0.5 } = req.body;

    const image = sharp(req.file.buffer);
    const { width: imgWidth, height: imgHeight } = await image.metadata();
    const fontSize = Math.max(24, Math.min(imgWidth, imgHeight) * 0.05);

    const svgText = `
      <svg width="${imgWidth}" height="${imgHeight}">
        <text x="${position.includes('right') ? imgWidth - 20 : 20}" 
              y="${position.includes('bottom') ? imgHeight - 20 : 40}"
              font-family="Arial" font-size="${fontSize}" 
              fill="white" fill-opacity="${opacity}"
              text-anchor="${position.includes('right') ? 'end' : 'start'}">
          ${text}
        </text>
      </svg>
    `;

    const processedBuffer = await image
      .composite([{
        input: Buffer.from(svgText),
        blend: 'over'
      }])
      .jpeg({ quality: 90 })
      .toBuffer();

    const filename = `watermarked_${Date.now()}.jpg`;

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

  } catch (error) {
    console.error('Watermark error:', error);
    res.status(500).json({ error: 'Failed to add watermark' });
  }
});

export default router;
