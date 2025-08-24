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
    cb(null, 'flip-' + uniqueSuffix + ext);
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
      const flipDirection = req.body.flipDirection || 'horizontal';
      
      // Validate flip direction
      if (!['horizontal', 'vertical', 'both'].includes(flipDirection)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid flip direction. Must be one of: horizontal, vertical, both' 
        });
      }
      
      // Get file extension to determine output format
      const ext = path.extname(req.file.originalname).toLowerCase().substring(1);
      const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
      const outputFormat = validFormats.includes(ext) ? (ext === 'jpg' ? 'jpeg' : ext) : 'jpeg';

      // Generate unique filename
      const filename = `flipped-${flipDirection}-${Date.now()}.${outputFormat}`;
      const outputPath = path.join(__dirname, '..', '..', 'uploads', filename);

      try {
        // Process the image based on flip direction
        let processedImage = sharp(req.file.path);
        
        if (flipDirection === 'horizontal' || flipDirection === 'both') {
          processedImage = processedImage.flop();
        }
        
        if (flipDirection === 'vertical' || flipDirection === 'both') {
          processedImage = processedImage.flip();
        }
        
        // Save the processed image
        await processedImage[outputFormat]().toFile(outputPath);

        // Get file metadata
        const metadata = await sharp(outputPath).metadata();
        
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
    console.error('Flip error:', error);
    res.status(500).json({
      success: false,
      message: 'Image flip failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}