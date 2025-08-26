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

    const { effect = 'grayscale', intensity = 10 } = req.body;

    let image = sharp(req.file.buffer);

    switch (effect) {
      case 'grayscale':
        image = image.grayscale();
        break;
      case 'black-white':
        image = image.grayscale().threshold(128);
        break;
      case 'pixelate':
        const { width: pxlWidth, height: pxlHeight } = await image.metadata();
        image = image
          .resize(Math.floor(pxlWidth / parseInt(intensity)), Math.floor(pxlHeight / parseInt(intensity)), {
            kernel: 'nearest'
          })
          .resize(pxlWidth, pxlHeight, { kernel: 'nearest' });
        break;
      case 'blur':
        image = image.blur(parseInt(intensity));
        break;
      default:
        image = image.grayscale();
    }

    const processedBuffer = await image.jpeg({ quality: 90 }).toBuffer();

    const filename = `${effect}_${Date.now()}.jpg`;

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

  } catch (error) {
    console.error('Effects error:', error);
    res.status(500).json({ error: 'Failed to apply effect' });
  }
});

export default router;
