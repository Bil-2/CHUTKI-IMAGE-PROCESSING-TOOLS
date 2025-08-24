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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to get file extension from mime type
const getExtensionFromMimeType = (mimeType) => {
  const types = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  return types[mimeType] || 'jpg';
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

      // Get target format from request
      const targetFormat = req.body.format || 'jpeg';
      
      // Validate format
      const validFormats = ['jpeg', 'png', 'webp', 'gif'];
      if (!validFormats.includes(targetFormat)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid format: ${targetFormat}. Supported formats: ${validFormats.join(', ')}` 
        });
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `converted-${Date.now()}.${targetFormat}`;
      const outputPath = path.join(uploadDir, filename);

      // Process image with sharp
      try {
        await sharp(req.file.buffer)
          [targetFormat]({
            quality: parseInt(req.body.quality) || 80
          })
          .toFile(outputPath);

        // Return success with file details
        const fileUrl = `/uploads/${filename}`;
        res.status(200).json({
          success: true,
          message: 'Image converted successfully',
          format: targetFormat,
          fileUrl,
          filename
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
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      message: 'Conversion failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
