import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Advanced Resize Image Pixel endpoint
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const {
      width,
      height,
      maintainAspectRatio = 'true',
      quality = '90',
      format = 'jpeg',
      resizeMethod = 'lanczos3',
      upscaling = 'false',
      smartCrop = 'false'
    } = req.body;

    // Validate required parameters
    if (!width || !height) {
      return res.status(400).json({ error: 'Width and height are required' });
    }

    const targetWidth = parseInt(width);
    const targetHeight = parseInt(height);
    const targetQuality = parseInt(quality);

    // Convert resize method to sharp kernel
    const kernelMap = {
      'nearest': 'nearest',
      'cubic': 'cubic',
      'mitchell': 'mitchell',
      'lanczos3': 'lanczos3'
    };

    const kernel = kernelMap[resizeMethod] || 'lanczos3';

    // Get original metadata
    const metadata = await sharp(req.file.buffer).metadata();
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    // Prepare resize options
    let resizeOptions = { kernel };

    // Handle aspect ratio
    if (maintainAspectRatio === 'true') {
      resizeOptions.fit = 'inside';
      resizeOptions.withoutEnlargement = upscaling === 'false';
    } else {
      resizeOptions.fit = 'fill';
    }

    // Handle smart cropping
    if (smartCrop === 'true') {
      resizeOptions.fit = 'cover';
      resizeOptions.position = 'attention'; // Focus on important areas
    }

    let processor;
    let processedBuffer;
    let contentType = 'image/jpeg';
    let filename;

    // Handle different resize scenarios
    if (maintainAspectRatio === 'true' && smartCrop === 'true') {
      // Smart crop to exact dimensions
      const targetRatio = targetWidth / targetHeight;
      const aspectRatio = originalWidth / originalHeight;

      if (aspectRatio > targetRatio) {
        // Original is wider, crop width
        const newWidth = Math.round(originalHeight * targetRatio);
        const left = Math.floor((originalWidth - newWidth) / 2);

        processor = sharp(req.file.buffer)
          .extract({ left, top: 0, width: newWidth, height: originalHeight })
          .resize(targetWidth, targetHeight, { kernel });
      } else {
        // Original is taller, crop height
        const newHeight = Math.round(originalWidth / targetRatio);
        const top = Math.floor((originalHeight - newHeight) / 2);

        processor = sharp(req.file.buffer)
          .extract({ left: 0, top, width: originalWidth, height: newHeight })
          .resize(targetWidth, targetHeight, { kernel });
      }
    } else {
      // Standard resize
      processor = sharp(req.file.buffer)
        .resize(targetWidth, targetHeight, resizeOptions);
    }

    // Apply format-specific processing
    switch (format.toLowerCase()) {
      case 'png':
        processedBuffer = await processor
          .png({ quality: targetQuality, compressionLevel: 6 })
          .toBuffer();
        contentType = 'image/png';
        filename = `resized_${targetWidth}x${targetHeight}_${Date.now()}.png`;
        break;
      case 'webp':
        processedBuffer = await processor
          .webp({ quality: targetQuality })
          .toBuffer();
        contentType = 'image/webp';
        filename = `resized_${targetWidth}x${targetHeight}_${Date.now()}.webp`;
        break;
      case 'jpeg':
      default:
        processedBuffer = await processor
          .jpeg({ quality: targetQuality, mozjpeg: true })
          .toBuffer();
        filename = `resized_${targetWidth}x${targetHeight}_${Date.now()}.jpg`;
    }

    // Add resize info to response headers
    const originalSize = req.file.buffer.length;
    const resizedSize = processedBuffer.length;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Resize-Info', JSON.stringify({
      originalWidth,
      originalHeight,
      targetWidth,
      targetHeight,
      originalSize,
      resizedSize,
      quality: targetQuality,
      format,
      resizeMethod,
      maintainAspectRatio: maintainAspectRatio === 'true',
      upscaling: upscaling === 'true',
      smartCrop: smartCrop === 'true',
      aspectRatioChanged: maintainAspectRatio === 'true' && (originalWidth / originalHeight) !== (targetWidth / targetHeight),
      upscaled: targetWidth > originalWidth || targetHeight > originalHeight
    }));

    res.send(processedBuffer);

  } catch (error) {
    console.error('Resize Pixel error:', error);
    res.status(500).json({ error: 'Failed to resize image: ' + error.message });
  }
});

export default router;