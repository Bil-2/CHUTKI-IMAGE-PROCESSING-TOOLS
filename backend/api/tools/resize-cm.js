import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resize-' + uniqueSuffix + ext);
  },
});

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

      // Get parameters from request
      const width = parseFloat(req.body.width) || 10; // Default 10cm
      const height = parseFloat(req.body.height) || 10; // Default 10cm
      const dpi = parseInt(req.body.dpi) || 300; // Default 300 DPI
      
      // Get file extension to determine output format
      const requestedFormat = req.body.format || 'jpeg';
      const validFormats = ['jpeg', 'png', 'webp'];
      const outputFormat = validFormats.includes(requestedFormat) ? requestedFormat : 'jpeg';

      // Convert cm to pixels based on DPI
      const cmToInch = 0.393701;
      const widthInPixels = Math.round(width * cmToInch * dpi);
      const heightInPixels = Math.round(height * cmToInch * dpi);

      // Generate unique filename
      const filename = `resized-${width}x${height}cm-${Date.now()}.${outputFormat}`;
      const outputPath = path.join(__dirname, '..', '..', 'uploads', filename);

      try {
        // Process the image
        await sharp(req.file.path)
          .resize(widthInPixels, heightInPixels, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          [outputFormat]()
          .toFile(outputPath);

        // Return success with file details
        const fileUrl = `/uploads/${filename}`;
        res.status(200).json({
          success: true,
          message: 'Image resized successfully',
          file: {
            filename,
            url: fileUrl,
            format: outputFormat,
            width: `${width}cm`,
            height: `${height}cm`,
            widthInPixels,
            heightInPixels,
            dpi
          }
        });
        
        // Clean up the original uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
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
    console.error('Resize error:', error);
    res.status(500).json({
      success: false,
      message: 'Image resize failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}