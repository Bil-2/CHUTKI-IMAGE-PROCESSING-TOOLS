import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.post('/flip', upload.single('image'), async (req, res) => {
  try {
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Get parameters from request
    const direction = req.body.direction || 'horizontal';

    // Validate flip direction
    if (!['horizontal', 'vertical'].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flip direction. Must be one of: horizontal, vertical'
      });
    }

    // Process the image based on flip direction
    let processedImage = sharp(req.file.buffer);

    if (direction === 'horizontal') {
      processedImage = processedImage.flop();
    } else {
      processedImage = processedImage.flip();
    }

    // Save the processed image
    const processedBuffer = await processedImage.jpeg({ quality: 90 }).toBuffer();

    // Get file metadata
    const metadata = await sharp(processedBuffer).metadata();

    // Return success with file details
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="flipped_${Date.now()}.jpg"`);
    res.send(processedBuffer);

  } catch (sharpError) {
    console.error('Sharp processing error:', sharpError);
    return res.status(500).json({
      success: false,
      message: 'Image processing failed',
      error: process.env.NODE_ENV === 'development' ? sharpError.message : 'Processing error'
    });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Add CORS headers
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    // Get parameters from request
    const flipDirection = req.body.flipDirection || 'horizontal';

    // Validate flip direction
    if (!['horizontal', 'vertical', 'both'].includes(flipDirection)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid flip direction. Must be one of: horizontal, vertical, both'
      });
    }

    // Get file extension to determine output format
    const originalName = req.file.originalname || 'image.jpg';
    const ext = path.extname(originalName).toLowerCase().substring(1);
    const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    const outputFormat = validFormats.includes(ext) ? (ext === 'jpg' ? 'jpeg' : ext) : 'jpeg';

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `flipped-${flipDirection}-${Date.now()}-${Math.round(Math.random() * 1E9)}.${outputFormat}`;
    const outputPath = path.join(uploadDir, filename);

    try {
      // Process the image based on flip direction
      let processedImage = sharp(req.file.buffer);

      if (flipDirection === 'horizontal' || flipDirection === 'both') {
        processedImage = processedImage.flop();
      }

      if (flipDirection === 'vertical' || flipDirection === 'both') {
        processedImage = processedImage.flip();
      }

      // Save the processed image
      const processedBuffer = await processedImage.toFormat(outputFormat).toBuffer();
      await fs.promises.writeFile(outputPath, processedBuffer);

      // Get file metadata
      const metadata = await sharp(processedBuffer).metadata();

      // Schedule file deletion
      const retentionMinutes = parseInt(process.env.FILE_RETENTION_MINUTES) || 30;
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
          console.log(`Auto-deleted file: ${filename} (${retentionMinutes} minutes expired)`);
        }
      }, retentionMinutes * 60 * 1000);

      // Add privacy header
      res.header('X-File-Retention', `File will be automatically deleted after ${retentionMinutes} minutes for privacy`);

      // Return success with file details
      const fileUrl = `/uploads/${filename}`;
      res.status(200).json({
        success: true,
        message: 'Image flipped successfully',
        file: {
          filename,
          url: fileUrl,
          format: outputFormat,
          width: metadata.width,
          height: metadata.height,
          flipDirection
        }
      });

    } catch (sharpError) {
      console.error('Sharp processing error:', sharpError);
      return res.status(500).json({
        success: false,
        message: 'Image processing failed',
        error: process.env.NODE_ENV === 'development' ? sharpError.message : 'Processing error'
      });
    }
  } catch (error) {
    console.error('Flip error:', error);
    res.status(500).json({
      success: false,
      message: 'Image flip failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Handle OPTIONS request for CORS
router.options('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

export default router;