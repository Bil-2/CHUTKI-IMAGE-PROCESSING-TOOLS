import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Compression quality presets
const compressionLevels = {
  low: 80,
  medium: 60,
  high: 40,
  custom: null // Will be set from request
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Process as multipart form data
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: 'Upload failed', error: err.message });
      }

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }

      // Get compression level from request
      const compressionLevel = req.body.compressionLevel || 'medium';
      let quality;
      
      if (compressionLevel === 'custom' && req.body.quality) {
        quality = parseInt(req.body.quality);
        if (isNaN(quality) || quality < 1 || quality > 100) {
          quality = 60; // Default to medium if invalid
        }
      } else {
        quality = compressionLevels[compressionLevel.toLowerCase()] || 60;
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Get original format or use jpeg as default
      const format = req.body.format || 'jpeg';
      const validFormats = ['jpeg', 'png', 'webp'];
      if (!validFormats.includes(format)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid format: ${format}. Supported formats: ${validFormats.join(', ')}` 
        });
      }

      // Generate unique filename
      const filename = `compressed-${Date.now()}.${format}`;
      const outputPath = path.join(uploadDir, filename);

      // Get original image info
      const originalInfo = await sharp(req.file.buffer).metadata();

      // Process image with sharp
      try {
        await sharp(req.file.buffer)
          [format]({
            quality: quality
          })
          .toFile(outputPath);

        // Get compressed file size
        const stats = fs.statSync(outputPath);
        const fileSizeInBytes = stats.size;
        const fileSizeInKB = fileSizeInBytes / 1024;

        // Calculate compression ratio
        const originalSizeInKB = req.file.size / 1024;
        const compressionRatio = ((originalSizeInKB - fileSizeInKB) / originalSizeInKB * 100).toFixed(2);

        // Return success with file details
        const fileUrl = `/uploads/${filename}`;
        res.status(200).json({
          success: true,
          message: 'Image compressed successfully',
          file: {
            filename,
            url: fileUrl,
            originalSize: `${originalSizeInKB.toFixed(2)} KB`,
            compressedSize: `${fileSizeInKB.toFixed(2)} KB`,
            compressionRatio: `${compressionRatio}%`,
            quality: quality,
            format: format
          }
        });

        // Schedule file deletion after 30 minutes
        setTimeout(() => {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            console.log(`Auto-deleted file: ${filename} (30 minutes expired)`);
          }
        }, 30 * 60 * 1000);

      } catch (sharpError) {
        console.error('Sharp processing error:', sharpError);
        return res.status(500).json({
          success: false,
          message: 'Image processing failed',
          error: process.env.NODE_ENV === 'development' ? sharpError.message : 'Processing error'
        });
      }
    });
  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({
      success: false,
      message: 'Compression failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
