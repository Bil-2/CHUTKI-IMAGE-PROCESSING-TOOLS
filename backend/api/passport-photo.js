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
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'passport-' + uniqueSuffix + ext);
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

// Passport photo size configurations
const sizeConfigs = {
  "35x45": { width: 35, height: 45, unit: "mm" }, // India, Australia, Europe, UK, Pakistan
  "51x51": { width: 51, height: 51, unit: "mm" }, // USA, Philippines (2x2 inch)
  "50x70": { width: 50, height: 70, unit: "mm" }, // Canada
  "custom": { width: null, height: null, unit: "mm" } // Will be set from request
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

      // Get parameters from request
      const {
        size = "35x45",
        dpi = "300",
        background = "white",
        format = "jpeg",
        quantity = "1"
      } = req.body;

      // Get size configuration
      let config = sizeConfigs[size] || sizeConfigs["35x45"];
      
      // Handle custom size
      if (size === "custom") {
        config.width = parseInt(req.body.width) || 35;
        config.height = parseInt(req.body.height) || 45;
        config.unit = req.body.unit || "mm";
      }

      const dpiValue = parseInt(dpi) || 300;
      const quantityValue = parseInt(quantity) || 1;

      // Calculate pixel dimensions based on DPI
      const mmToInch = 0.0393701;
      const widthInInches = config.width * mmToInch;
      const heightInInches = config.height * mmToInch;
      const widthInPixels = Math.round(widthInInches * dpiValue);
      const heightInPixels = Math.round(heightInInches * dpiValue);

      // Validate format
      const validFormats = ['jpeg', 'png', 'webp'];
      const outputFormat = validFormats.includes(format) ? format : 'jpeg';

      // Generate unique filename
      const filename = `passport-${Date.now()}.${outputFormat}`;
      const outputPath = path.join(__dirname, '..', 'uploads', filename);

      try {
        // Process the image
        await sharp(req.file.path)
          .resize(widthInPixels, heightInPixels, {
            fit: 'cover',
            position: 'center'
          })
          .flatten({ background: background })
          [outputFormat]()
          .toFile(outputPath);

        // Create a composite image with multiple copies if quantity > 1
        if (quantityValue > 1) {
          const compositeWidth = widthInPixels * Math.min(4, quantityValue); // Max 4 photos per row
          const compositeHeight = heightInPixels * Math.ceil(quantityValue / 4);
          
          // Create a new blank image
          const compositeFilename = `passport-composite-${Date.now()}.${outputFormat}`;
          const compositeOutputPath = path.join(__dirname, '..', 'uploads', compositeFilename);
          
          // Create a blank canvas with white background
          const composite = sharp({
            create: {
              width: compositeWidth,
              height: compositeHeight,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
          });
          
          // Read the single passport photo
          const photoBuffer = await fs.promises.readFile(outputPath);
          
          // Create an array of composite operations
          const compositeOperations = [];
          for (let i = 0; i < quantityValue; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            compositeOperations.push({
              input: photoBuffer,
              left: col * widthInPixels,
              top: row * heightInPixels
            });
          }
          
          // Apply the composite operations
          await composite
            .composite(compositeOperations)
            [outputFormat]()
            .toFile(compositeOutputPath);
          
          // Return success with file details
          const fileUrl = `/uploads/${compositeFilename}`;
          res.status(200).json({
            success: true,
            message: 'Passport photos generated successfully',
            file: {
              filename: compositeFilename,
              url: fileUrl,
              format: outputFormat,
              quantity: quantityValue,
              size: `${config.width}x${config.height}${config.unit}`,
              dpi: dpiValue
            }
          });
          
          // Clean up the single photo
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
          
          // Schedule file deletion after 30 minutes
          setTimeout(() => {
            if (fs.existsSync(compositeOutputPath)) {
              fs.unlinkSync(compositeOutputPath);
              console.log(`Auto-deleted file: ${compositeFilename} (30 minutes expired)`);
            }
          }, 30 * 60 * 1000);
        } else {
          // Return success with file details for single photo
          const fileUrl = `/uploads/${filename}`;
          res.status(200).json({
            success: true,
            message: 'Passport photo generated successfully',
            file: {
              filename,
              url: fileUrl,
              format: outputFormat,
              size: `${config.width}x${config.height}${config.unit}`,
              dpi: dpiValue
            }
          });
          
          // Schedule file deletion after 30 minutes
          setTimeout(() => {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
              console.log(`Auto-deleted file: ${filename} (30 minutes expired)`);
            }
          }, 30 * 60 * 1000);
        }
        
        // Clean up the original uploaded file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
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
    console.error('Passport photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Passport photo generation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}