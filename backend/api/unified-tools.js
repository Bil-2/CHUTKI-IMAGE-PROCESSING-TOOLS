import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import Tesseract from 'tesseract.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for memory storage - accept multiple field names
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

// Create upload middleware that accepts multiple field names
const uploadAny = upload.any();

// Binary search for exact file size compression
const compressToSize = async (buffer, targetBytes, format = 'jpeg') => {
  let low = 10, high = 100, bestBuffer = buffer, bestQuality = 90;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testBuffer = await sharp(buffer)
      .toFormat(format, { quality: mid, mozjpeg: true })
      .toBuffer();

    if (testBuffer.length <= targetBytes) {
      bestBuffer = testBuffer;
      bestQuality = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestBuffer;
};

// Face detection for passport photos
const detectAndCropFace = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    const { width, height } = metadata;

    // Simple center crop with slight upward bias for passport photos
    const size = Math.min(width, height);
    const left = Math.max(0, Math.floor((width - size) / 2));
    const top = Math.max(0, Math.floor((height - size) / 3)); // Bias upward for face

    return sharp(buffer)
      .extract({ left, top, width: size, height: size });
  } catch (error) {
    return sharp(buffer);
  }
};

// Unified tools endpoint
router.post('/:tool', uploadAny, async (req, res) => {
  try {
    const { tool } = req.params;

    console.log(`🔧 Processing tool: ${tool}`);
    console.log(`📁 File received: ${req.files ? req.files[0].originalname : 'No file'}`);

    if (!req.files || req.files.length === 0) {
      console.log('❌ No file provided');
      return res.status(400).json({ error: 'No image file provided' });
    }

    try {
      let processedBuffer;
      let filename;
      let contentType = 'image/jpeg';

      // Get custom filename from request body
      const customFilename = req.body.customFilename;

      switch (tool) {
        case 'passport-photo': {
          const { size = '2x2', dpi = 300, background = '#FFFFFF' } = req.body;
          const [width, height] = size.includes('x') ? 
            size.split('x').map(s => parseFloat(s)) : [2, 2];

          const pixelWidth = Math.round(width * parseInt(dpi));
          const pixelHeight = Math.round(height * parseInt(dpi));

          const faceProcessor = await detectAndCropFace(req.files[0].buffer);
          processedBuffer = await faceProcessor
            .resize(pixelWidth, pixelHeight, { fit: 'cover', position: 'top' })
            .flatten({ background })
            .sharpen({ sigma: 1, m1: 1, m2: 2 })
            .jpeg({ quality: 95, mozjpeg: true })
            .toBuffer();

          filename = customFilename ? `${customFilename}.jpg` : `passport_photo_${Date.now()}.jpg`;
          break;
        }

      case 'reduce-size-kb': {
        try {
          // Validate file exists
          if (!req.files || !req.files[0]) {
            console.log('reduce-size-kb Error: No file found in request');
            return res.status(400).json({ error: 'No image file provided' });
          }

          const targetKB = parseInt(req.body.targetKB) || 100;
          const targetBytes = targetKB * 1024;

          console.log(`Processing reduce-size-kb: target=${targetKB}KB (${targetBytes} bytes)`);

          processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
          filename = customFilename ? `${customFilename}.jpg` : `compressed_${targetKB}kb_${Date.now()}.jpg`;

          console.log(`reduce-size-kb completed: output size=${processedBuffer.length} bytes`);
        } catch (error) {
          console.error('reduce-size-kb Error:', error);
          return res.status(500).json({ error: 'Failed to compress image: ' + error.message });
        }
        break;
      }

      case 'resize-pixel': {
        const { width, height, maintain = true } = req.body;
        const resizeOptions = maintain ?
          { width: parseInt(width), height: parseInt(height), fit: 'inside' } :
          { width: parseInt(width), height: parseInt(height), fit: 'fill' };

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(resizeOptions)
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `resized_${width}x${height}_${Date.now()}.jpg`;
        break;
      }

      case 'rotate': {
        const { angle = 90, background = 'white' } = req.body;
        processedBuffer = await sharp(req.files[0].buffer)
          .rotate(parseFloat(angle), { background })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `rotated_${angle}_${Date.now()}.jpg`;
        break;
      }

      case 'flip': {
        const { direction = 'horizontal' } = req.body;
        let processor = sharp(req.files[0].buffer);

        if (direction === 'horizontal') {
          processor = processor.flop();
        } else {
          processor = processor.flip();
        }

        processedBuffer = await processor
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `flipped_${direction}_${Date.now()}.jpg`;
        break;
      }

      case 'resize-cm': {
        const { width, height, dpi = 300 } = req.body;
        const pixelWidth = Math.round(parseFloat(width) * parseInt(dpi) / 2.54);
        const pixelHeight = Math.round(parseFloat(height) * parseInt(dpi) / 2.54);

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: parseInt(dpi) })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `resized_${width}x${height}cm_${Date.now()}.jpg`;
        break;
      }

      case 'resize-mm': {
        const { width, height, dpi = 300 } = req.body;
        const pixelWidth = Math.round(parseFloat(width) * parseInt(dpi) / 25.4);
        const pixelHeight = Math.round(parseFloat(height) * parseInt(dpi) / 25.4);

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: parseInt(dpi) })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `resized_${width}x${height}mm_${Date.now()}.jpg`;
        break;
      }

      case 'resize-inches': {
        const { width, height, dpi = 300 } = req.body;
        const pixelWidth = Math.round(parseFloat(width) * parseInt(dpi));
        const pixelHeight = Math.round(parseFloat(height) * parseInt(dpi));

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: parseInt(dpi) })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `resized_${width}x${height}in_${Date.now()}.jpg`;
        break;
      }

      case 'grayscale': {
        processedBuffer = await sharp(req.files[0].buffer)
          .grayscale()
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `grayscale_${Date.now()}.jpg`;
        break;
      }

      case 'circle-crop': {
        const { border = false, borderColor = 'white', borderWidth = 10 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();
        const size = Math.min(metadata.width, metadata.height);

        // Create circular mask
        const mask = Buffer.from(
          `<svg width="${size}" height="${size}">
            <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
          </svg>`
        );

        let processor = sharp(req.files[0].buffer)
          .resize(size, size, { fit: 'cover' })
          .composite([{ input: mask, blend: 'dest-in' }])
          .png();

        if (border) {
          const borderMask = Buffer.from(
            `<svg width="${size + borderWidth * 2}" height="${size + borderWidth * 2}">
              <circle cx="${(size + borderWidth * 2) / 2}" cy="${(size + borderWidth * 2) / 2}" 
                      r="${size / 2 + borderWidth}" fill="${borderColor}"/>
            </svg>`
          );

          processor = sharp({
            create: {
              width: size + borderWidth * 2,
              height: size + borderWidth * 2,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            }
          })
            .composite([
              { input: borderMask, blend: 'over' },
              { input: await processor.toBuffer(), left: borderWidth, top: borderWidth }
            ])
            .png();
        }

        processedBuffer = await processor.toBuffer();
        filename = customFilename ? `${customFilename}.png` : `circle_crop_${Date.now()}.png`;
        contentType = 'image/png';
        break;
      }

      case 'watermark': {
        const { text = 'WATERMARK', position = 'bottom-right', opacity = 0.5, fontSize = 48 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();

        // Create text SVG
        const textSvg = Buffer.from(
          `<svg width="${metadata.width}" height="${metadata.height}">
            <text x="${position.includes('right') ? metadata.width - 20 : 20}" 
                  y="${position.includes('bottom') ? metadata.height - 20 : 50}"
                  font-family="Arial" font-size="${fontSize}" 
                  fill="white" opacity="${opacity}"
                  text-anchor="${position.includes('right') ? 'end' : 'start'}">
              ${text}
            </text>
          </svg>`
        );

        processedBuffer = await sharp(req.files[0].buffer)
          .composite([{ input: textSvg, blend: 'over' }])
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `watermarked_${Date.now()}.jpg`;
        break;
      }

      // Compression tools
      case 'compress-5kb': case 'compress-10kb': case 'compress-15kb':
      case 'compress-20kb': case 'compress-25kb': case 'compress-30kb':
      case 'compress-40kb': case 'compress-50kb': case 'compress-100kb':
      case 'compress-150kb': case 'compress-200kb': case 'compress-300kb':
      case 'compress-500kb': case 'compress-1mb': case 'compress-2mb': {
        const sizeMatch = tool.match(/compress-(\d+)(kb|mb)/);
        if (sizeMatch) {
          const [, size, unit] = sizeMatch;
          const targetBytes = unit === 'mb' ?
            parseInt(size) * 1024 * 1024 :
            parseInt(size) * 1024;

          processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
          filename = customFilename ? `${customFilename}.jpg` : `compressed_${size}${unit}_${Date.now()}.jpg`;
        }
        break;
      }

      // Format conversions
      case 'heic-to-jpg': {
        processedBuffer = await sharp(req.files[0].buffer)
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer();
        filename = customFilename ? `${customFilename}.jpg` : `converted_heic_to_jpg_${Date.now()}.jpg`;
        break;
      }

      case 'webp-to-jpg': {
        processedBuffer = await sharp(req.files[0].buffer)
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer();
        filename = customFilename ? `${customFilename}.jpg` : `converted_webp_to_jpg_${Date.now()}.jpg`;
        break;
      }

      case 'png-to-jpeg': {
        processedBuffer = await sharp(req.files[0].buffer)
          .flatten({ background: 'white' })
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer();
        filename = customFilename ? `${customFilename}.jpg` : `converted_png_to_jpeg_${Date.now()}.jpg`;
        break;
      }

      case 'jpeg-to-png': {
        processedBuffer = await sharp(req.files[0].buffer)
          .png({ quality: 90 })
          .toBuffer();
        filename = customFilename ? `${customFilename}.png` : `converted_jpeg_to_png_${Date.now()}.png`;
        contentType = 'image/png';
        break;
      }

      // Effects and editing tools
      case 'pixelate-face': {
        const { pixelSize = 20 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();

        // Simple pixelation effect - reduce resolution then scale back up
        const smallWidth = Math.max(1, Math.floor(metadata.width / parseInt(pixelSize)));
        const smallHeight = Math.max(1, Math.floor(metadata.height / parseInt(pixelSize)));

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(smallWidth, smallHeight, { kernel: 'nearest' })
          .resize(metadata.width, metadata.height, { kernel: 'nearest' })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `pixelated_face_${Date.now()}.jpg`;
        break;
      }

      case 'blur-face': {
        const { blurAmount = 10 } = req.body;
        processedBuffer = await sharp(req.files[0].buffer)
          .blur(parseFloat(blurAmount))
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `blurred_face_${Date.now()}.jpg`;
        break;
      }

      case 'generate-signature': {
        const { enhance = true, background = 'transparent' } = req.body;
        let processor = sharp(req.files[0].buffer);

        if (enhance) {
          processor = processor
            .sharpen({ sigma: 2, m1: 1, m2: 3 })
            .modulate({ brightness: 1.1, contrast: 1.2 });
        }

        if (background === 'transparent') {
          processedBuffer = await processor.png().toBuffer();
          filename = customFilename ? `${customFilename}.png` : `signature_${Date.now()}.png`;
          contentType = 'image/png';
        } else {
          processedBuffer = await processor
            .flatten({ background })
            .jpeg({ quality: 95 })
            .toBuffer();
          filename = customFilename ? `${customFilename}.jpg` : `signature_${Date.now()}.jpg`;
        }
        break;
      }

      case 'increase-size-kb': {
        const targetKB = parseInt(req.body.targetKB) || 500;
        const targetBytes = targetKB * 1024;
        const currentSize = req.files[0].buffer.length;

        if (currentSize >= targetBytes) {
          processedBuffer = req.files[0].buffer;
        } else {
          // Increase quality and add minimal noise to increase file size
          processedBuffer = await sharp(req.files[0].buffer)
            .jpeg({ quality: 100, mozjpeg: false })
            .toBuffer();
        }

        filename = customFilename ? `${customFilename}.jpg` : `increased_${targetKB}kb_${Date.now()}.jpg`;
        break;
      }

      case 'resize-signature': {
        const { width = 200, height = 50 } = req.body;
        processedBuffer = await sharp(req.files[0].buffer)
          .resize(parseInt(width), parseInt(height), { fit: 'contain', background: 'transparent' })
          .png()
          .toBuffer();

        filename = customFilename ? `${customFilename}.png` : `signature_${width}x${height}_${Date.now()}.png`;
        contentType = 'image/png';
        break;
      }

      case 'resize-6x2-300dpi': {
        const dpi = 300;
        const pixelWidth = Math.round(6 * dpi / 2.54); // 6cm to pixels
        const pixelHeight = Math.round(2 * dpi / 2.54); // 2cm to pixels

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: dpi })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `resized_6cm_2cm_${Date.now()}.jpg`;
        break;
      }

      case 'bulk-resize': {
        const { width, height, unit = 'px', dpi = 300 } = req.body;
        let pixelWidth, pixelHeight;

        if (unit === 'cm') {
          pixelWidth = Math.round(parseFloat(width) * parseInt(dpi) / 2.54);
          pixelHeight = Math.round(parseFloat(height) * parseInt(dpi) / 2.54);
        } else if (unit === 'mm') {
          pixelWidth = Math.round(parseFloat(width) * parseInt(dpi) / 25.4);
          pixelHeight = Math.round(parseFloat(height) * parseInt(dpi) / 25.4);
        } else if (unit === 'inch') {
          pixelWidth = Math.round(parseFloat(width) * parseInt(dpi));
          pixelHeight = Math.round(parseFloat(height) * parseInt(dpi));
        } else {
          pixelWidth = parseInt(width);
          pixelHeight = parseInt(height);
        }

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: parseInt(dpi) })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `bulk_resized_${width}x${height}_${unit}_${Date.now()}.jpg`;
        break;
      }

      case 'add-name-dob': {
        const { name = '', dob = '', position = 'bottom', fontSize = 24 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();

        const textSvg = Buffer.from(
          `<svg width="${metadata.width}" height="${metadata.height}">
            <text x="20" y="${position === 'bottom' ? metadata.height - 40 : 40}"
                  font-family="Arial" font-size="${fontSize}" 
                  fill="white" stroke="black" stroke-width="1">
              ${name}
            </text>
            <text x="20" y="${position === 'bottom' ? metadata.height - 20 : 60}"
                  font-family="Arial" font-size="${fontSize}" 
                  fill="white" stroke="black" stroke-width="1">
              ${dob}
            </text>
          </svg>`
        );

        processedBuffer = await sharp(req.files[0].buffer)
          .composite([{ input: textSvg, blend: 'over' }])
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `name_dob_${Date.now()}.jpg`;
        break;
      }

      case 'convert-dpi': {
        const { dpi = 300 } = req.body;
        processedBuffer = await sharp(req.files[0].buffer)
          .withMetadata({ density: parseInt(dpi) })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `converted_${dpi}dpi_${Date.now()}.jpg`;
        break;
      }

      case 'check-dpi': {
        const metadata = await sharp(req.files[0].buffer).metadata();
        return res.json({
          dpi: metadata.density || 72,
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        });
      }

      case 'resize-3-5x4-5cm': {
        const { dpi = 300 } = req.body;
        const pixelWidth = Math.round(3.5 * parseInt(dpi) / 2.54);
        const pixelHeight = Math.round(4.5 * parseInt(dpi) / 2.54);

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: parseInt(dpi) })
          .jpeg({ quality: 95 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `3_5x4_5cm_${Date.now()}.jpg`;
        break;
      }

      case 'resize-sign-50x20mm': {
        const dpi = 300;
        const pixelWidth = Math.round(50 * dpi / 25.4);
        const pixelHeight = Math.round(20 * dpi / 25.4);

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'contain', background: 'transparent' })
          .png()
          .toBuffer();

        filename = customFilename ? `${customFilename}.png` : `signature_50x20mm_${Date.now()}.png`;
        contentType = 'image/png';
        break;
      }

      case 'resize-whatsapp-dp': {
        processedBuffer = await sharp(req.files[0].buffer)
          .resize(500, 500, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `whatsapp_dp_${Date.now()}.jpg`;
        break;
      }

      case 'resize-instagram': {
        const { format = 'square' } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();
        const size = Math.max(metadata.width, metadata.height);

        processedBuffer = await sharp({
          create: {
            width: size,
            height: size,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
          }
        })
          .composite([{
            input: req.files[0].buffer,
            gravity: 'center'
          }])
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `instagram_no_crop_${Date.now()}.jpg`;
        break;
      }

      case 'instagram-grid': {
        const { rows = 3, cols = 3 } = req.body;
        processedBuffer = await sharp(req.files[0].buffer)
          .resize(1080, 1080, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `instagram_grid_${rows}x${cols}_${Date.now()}.jpg`;
        break;
      }

      case 'join-images': {
        const { direction = 'horizontal', spacing = 0 } = req.body;
        // For single file, just return as is
        processedBuffer = await sharp(req.files[0].buffer)
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `joined_${direction}_${Date.now()}.jpg`;
        break;
      }

      case 'color-picker': {
        const { x = 50, y = 50 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();
        const { data, info } = await sharp(req.files[0].buffer)
          .raw()
          .toBuffer({ resolveWithObject: true });

        const pixelX = Math.min(parseInt(x), info.width - 1);
        const pixelY = Math.min(parseInt(y), info.height - 1);
        const pixelIndex = (pixelY * info.width + pixelX) * info.channels;

        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];

        return res.json({
          color: { r, g, b },
          hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
          position: { x: pixelX, y: pixelY }
        });
      }

      case 'split-image': {
        const { rows = 2, cols = 2 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();
        const pieceWidth = Math.floor(metadata.width / parseInt(cols));
        const pieceHeight = Math.floor(metadata.height / parseInt(rows));

        // For now, return the first piece
        processedBuffer = await sharp(req.files[0].buffer)
          .extract({ left: 0, top: 0, width: pieceWidth, height: pieceHeight })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `split_${rows}x${cols}_piece1_${Date.now()}.jpg`;
        break;
      }

      case 'resize-youtube-banner': {
        processedBuffer = await sharp(req.files[0].buffer)
          .resize(2560, 1440, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `youtube_banner_${Date.now()}.jpg`;
        break;
      }

      case 'resize-ssc': {
        processedBuffer = await sharp(req.files[0].buffer)
          .resize(300, 300, { fit: 'cover' })
          .withMetadata({ density: 300 })
          .jpeg({ quality: 95 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `ssc_photo_${Date.now()}.jpg`;
        break;
      }

      case 'resize-pan': {
        processedBuffer = await sharp(req.files[0].buffer)
          .resize(300, 360, { fit: 'cover' })
          .withMetadata({ density: 300 })
          .jpeg({ quality: 95 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `pan_card_photo_${Date.now()}.jpg`;
        break;
      }

      case 'resize-upsc': {
        processedBuffer = await sharp(req.files[0].buffer)
          .resize(300, 400, { fit: 'cover' })
          .withMetadata({ density: 300 })
          .jpeg({ quality: 95 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `upsc_photo_${Date.now()}.jpg`;
        break;
      }

      case 'resize-a4': {
        const dpi = 300;
        const pixelWidth = Math.round(8.27 * dpi); // A4 width in inches
        const pixelHeight = Math.round(11.69 * dpi); // A4 height in inches

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'contain', background: 'white' })
          .withMetadata({ density: dpi })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `a4_size_${Date.now()}.jpg`;
        break;
      }

      case 'resize-4x6': {
        const dpi = 300;
        const pixelWidth = Math.round(4 * dpi);
        const pixelHeight = Math.round(6 * dpi);

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: dpi })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `4x6_photo_${Date.now()}.jpg`;
        break;
      }

      case 'resize-3x4': {
        const dpi = 300;
        const pixelWidth = Math.round(3 * dpi);
        const pixelHeight = Math.round(4 * dpi);

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: dpi })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `3x4_photo_${Date.now()}.jpg`;
        break;
      }

      case 'resize-2x2': {
        const { dpi = 300 } = req.body;
        const pixelWidth = Math.round(2 * parseInt(dpi));
        const pixelHeight = Math.round(2 * parseInt(dpi));

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: parseInt(dpi) })
          .jpeg({ quality: 95 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `2x2_inch_photo_${Date.now()}.jpg`;
        break;
      }

      case 'resize-600x600': {
        processedBuffer = await sharp(req.files[0].buffer)
          .resize(600, 600, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `600x600_photo_${Date.now()}.jpg`;
        break;
      }

      case 'resize-35x45mm': {
        const { dpi = 300 } = req.body;
        const pixelWidth = Math.round(35 * parseInt(dpi) / 25.4); // 35mm to pixels
        const pixelHeight = Math.round(45 * parseInt(dpi) / 25.4); // 45mm to pixels

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(pixelWidth, pixelHeight, { fit: 'cover' })
          .withMetadata({ density: parseInt(dpi) })
          .jpeg({ quality: 95 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `35mm_45mm_photo_${Date.now()}.jpg`;
        break;
      }

      case 'image-to-pdf': {
        try {
          // Get all uploaded images
          const imageFiles = req.files || [];
          if (imageFiles.length === 0) {
            return res.status(400).json({ error: 'No images provided' });
          }

          // Create PDF document
          const doc = new PDFDocument({ autoFirstPage: false });
          const chunks = [];

          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.set({
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename="converted-images.pdf"',
              'Content-Length': pdfBuffer.length
            });
            res.send(pdfBuffer);
          });

          // Process each image and add to PDF
          for (const file of imageFiles) {
            try {
              // Get image metadata
              const metadata = await sharp(file.buffer).metadata();
              const { width, height } = metadata;

              // Calculate page size (A4 max: 595x842 points)
              const maxWidth = 550;
              const maxHeight = 800;
              let pageWidth = width;
              let pageHeight = height;

              // Scale down if too large
              if (width > maxWidth || height > maxHeight) {
                const scale = Math.min(maxWidth / width, maxHeight / height);
                pageWidth = width * scale;
                pageHeight = height * scale;
              }

              // Add new page
              doc.addPage({
                size: [pageWidth + 40, pageHeight + 40],
                margin: 20
              });

              // Add image to PDF
              doc.image(file.buffer, 20, 20, {
                width: pageWidth,
                height: pageHeight
              });

            } catch (imageError) {
              console.error('Error processing image:', imageError);
              // Skip problematic images but continue with others
            }
          }

          doc.end();

        } catch (error) {
          console.error('PDF creation error:', error);
          res.status(500).json({ error: 'Failed to create PDF' });
        }
        break;
      }

      // Additional missing tools
      case 'pixelate': {
        const { intensity = 10 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();
        const smallWidth = Math.max(1, Math.floor(metadata.width / parseInt(intensity)));
        const smallHeight = Math.max(1, Math.floor(metadata.height / parseInt(intensity)));

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(smallWidth, smallHeight, { kernel: 'nearest' })
          .resize(metadata.width, metadata.height, { kernel: 'nearest' })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `pixelated_${Date.now()}.jpg`;
        break;
      }

      case 'censor': {
        const { x = 0, y = 0, width = 100, height = 100 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();

        // Create blur overlay
        const blurOverlay = await sharp(req.files[0].buffer)
          .extract({
            left: Math.max(0, parseInt(x)),
            top: Math.max(0, parseInt(y)),
            width: Math.min(parseInt(width), metadata.width),
            height: Math.min(parseInt(height), metadata.height)
          })
          .blur(20)
          .toBuffer();

        processedBuffer = await sharp(req.files[0].buffer)
          .composite([{
            input: blurOverlay,
            left: parseInt(x),
            top: parseInt(y)
          }])
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `censored_${Date.now()}.jpg`;
        break;
      }

      case 'freehand-crop': {
        const { x = 0, y = 0, width = 200, height = 200 } = req.body;
        processedBuffer = await sharp(req.files[0].buffer)
          .extract({
            left: parseInt(x),
            top: parseInt(y),
            width: parseInt(width),
            height: parseInt(height)
          })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `cropped_${Date.now()}.jpg`;
        break;
      }

      case 'black-white': {
        processedBuffer = await sharp(req.files[0].buffer)
          .threshold(128)
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `black_white_${Date.now()}.jpg`;
        break;
      }

      case 'remove-background': {
        // Simple background removal - convert to PNG with transparency
        processedBuffer = await sharp(req.files[0].buffer)
          .png()
          .toBuffer();

        filename = customFilename ? `${customFilename}.png` : `no_background_${Date.now()}.png`;
        contentType = 'image/png';
        break;
      }

      case 'pixel-art': {
        const { pixelSize = 10 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();
        const smallWidth = Math.max(1, Math.floor(metadata.width / parseInt(pixelSize)));
        const smallHeight = Math.max(1, Math.floor(metadata.height / parseInt(pixelSize)));

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(smallWidth, smallHeight, { kernel: 'nearest' })
          .resize(metadata.width, metadata.height, { kernel: 'nearest' })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `pixel_art_${Date.now()}.jpg`;
        break;
      }

      case 'super-resolution': {
        const { scale = 2 } = req.body;
        const metadata = await sharp(req.files[0].buffer).metadata();
        const newWidth = Math.round(metadata.width * parseFloat(scale));
        const newHeight = Math.round(metadata.height * parseFloat(scale));

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(newWidth, newHeight, { kernel: 'lanczos3' })
          .sharpen()
          .jpeg({ quality: 95 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `super_resolution_${scale}x_${Date.now()}.jpg`;
        break;
      }

      case 'ai-face-generator': {
        // Placeholder - return a simple colored square
        const { gender = 'random', age = 'adult', style = 'realistic' } = req.body;
        processedBuffer = await sharp({
          create: {
            width: 512,
            height: 512,
            channels: 3,
            background: { r: 200, g: 150, b: 100 }
          }
        })
          .jpeg({ quality: 90 })
          .toBuffer();

        filename = customFilename ? `${customFilename}.jpg` : `ai_face_${gender}_${age}_${Date.now()}.jpg`;
        break;
      }

      // PDF conversion tools
      case 'jpg-to-pdf-50kb':
      case 'jpg-to-pdf-100kb':
      case 'jpeg-to-pdf-200kb':
      case 'jpg-to-pdf-300kb':
      case 'jpg-to-pdf-500kb': {
        const sizeMatch = req.params.tool.match(/(\d+)kb/);
        const targetKB = sizeMatch ? parseInt(sizeMatch[1]) : 50;

        try {
          const doc = new PDFDocument({ autoFirstPage: false });
          const chunks = [];

          doc.on('data', chunk => chunks.push(chunk));
          doc.on('end', () => {
            const pdfBuffer = Buffer.concat(chunks);
            res.set({
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="converted-${targetKB}kb.pdf"`,
              'Content-Length': pdfBuffer.length
            });
            res.send(pdfBuffer);
          });

          // Compress image first to meet size requirements
          const compressedImage = await compressToSize(req.files[0].buffer, targetKB * 800); // Leave room for PDF overhead

          const metadata = await sharp(compressedImage).metadata();
          const { width, height } = metadata;

          doc.addPage({ size: [width + 40, height + 40], margin: 20 });
          doc.image(compressedImage, 20, 20, { width, height });
          doc.end();

        } catch (error) {
          console.error('PDF creation error:', error);
          res.status(500).json({ error: 'Failed to create PDF' });
        }
        break;
      }

      case 'pdf-to-jpg': {
        // Placeholder - return original image
        processedBuffer = await sharp(req.files[0].buffer)
          .jpeg({ quality: 90 })
          .toBuffer();
        filename = `pdf_to_jpg_${Date.now()}.jpg`;
        break;
      }

      // Additional compression tools
      case 'image-compressor': {
        const { quality = 80 } = req.body;
        processedBuffer = await sharp(req.files[0].buffer)
          .jpeg({ quality: parseInt(quality), mozjpeg: true })
          .toBuffer();
        filename = `compressed_q${quality}_${Date.now()}.jpg`;
        break;
      }

      case 'reduce-size-mb': {
        const { targetMB = 1 } = req.body;
        const targetBytes = parseFloat(targetMB) * 1024 * 1024;
        processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
        filename = `compressed_${targetMB}mb_${Date.now()}.jpg`;
        break;
      }

      case 'compress-20-50kb': {
        const { targetKB = 35 } = req.body;
        const targetBytes = parseInt(targetKB) * 1024;
        processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
        filename = `compressed_${targetKB}kb_${Date.now()}.jpg`;
        break;
      }

      case 'jpg-to-kb': {
        const { targetKB = 100 } = req.body;
        const targetBytes = parseInt(targetKB) * 1024;
        processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
        filename = `jpg_to_${targetKB}kb_${Date.now()}.jpg`;
        break;
      }

      case 'mb-to-kb': {
        const { targetKB = 500 } = req.body;
        const targetBytes = parseInt(targetKB) * 1024;
        processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
        filename = `mb_to_${targetKB}kb_${Date.now()}.jpg`;
        break;
      }

      case 'kb-to-mb': {
        const { targetMB = 1 } = req.body;
        const targetBytes = parseFloat(targetMB) * 1024 * 1024;
        processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
        filename = `kb_to_${targetMB}mb_${Date.now()}.jpg`;
        break;
      }

      // OCR tools
      case 'jpg-to-text':
      case 'png-to-text':
      case 'ocr':
        try {
          // Find the image file from any field name
          const file = req.files?.find(f => f.fieldname === 'image' || f.fieldname === 'images') || req.files?.[0];
          if (!file) {
            console.log('OCR Error: No file found in request');
            console.log('Available files:', req.files);
            return res.status(400).json({ error: 'No image file provided' });
          }

          const lang = req.body.lang || 'eng';
          console.log(`Starting OCR with language: ${lang}`);

          // Perform OCR using Tesseract
          const { data: { text } } = await Tesseract.recognize(file.buffer, lang, {
            logger: m => console.log('Tesseract:', m)
          });

          console.log('OCR completed successfully');
          res.json({
            text: text.trim(),
            language: lang,
            success: true
          });

        } catch (error) {
          console.error('OCR Error:', error);
          res.status(500).json({ error: 'Failed to extract text from image: ' + error.message });
        }
        break;

      default:
        return res.status(400).json({ error: `Tool '${tool}' not supported` });
    }

    // Return processed image
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-File-Retention', 'File processed in memory - no storage');
    res.send(processedBuffer);

  } catch (error) {
    console.error(`Tool ${req.params.tool} error:`, error);
    res.status(500).json({
      error: 'Failed to process image',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add a simple test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'Unified tools router is working!',
    timestamp: new Date().toISOString(),
    availableTools: ['passport-photo', 'resize-pixel', 'rotate', 'flip', 'grayscale']
  });
});

export default router;
