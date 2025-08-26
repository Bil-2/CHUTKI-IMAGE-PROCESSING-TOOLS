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

    const { format = 'jpeg', quality = 90 } = req.body;

    let image = sharp(req.file.buffer);
    let contentType = 'image/jpeg';
    let extension = 'jpg';

    switch (format.toLowerCase()) {
      case 'png':
        image = image.png();
        contentType = 'image/png';
        extension = 'png';
        break;
      case 'webp':
        image = image.webp({ quality: parseInt(quality) });
        contentType = 'image/webp';
        extension = 'webp';
        break;
      case 'jpeg':
      case 'jpg':
      default:
        image = image.jpeg({ quality: parseInt(quality) });
        contentType = 'image/jpeg';
        extension = 'jpg';
        break;
    }

    const processedBuffer = await image.toBuffer();

    const filename = `converted_${Date.now()}.${extension}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

  } catch (error) {
    console.error('Format conversion error:', error);
    res.status(500).json({ error: 'Failed to convert image format' });
  }
});

export default router;
