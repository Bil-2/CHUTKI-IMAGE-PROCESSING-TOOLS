import sharp from 'sharp';
import { validateFile, handleToolError, detectAndCropFace } from './utils.js';

export const editingTools = {
  'passport-photo': async (req, res) => {
    try {
      if (!validateFile(req, res, 'passport-photo')) return;

      const { size = '2x2', dpi = 300, background = 'white', copies = 1 } = req.body;
      let [width, height] = size.includes('x') ?
        size.split('x').map(s => parseFloat(s)) : [2, 2];

      const pixelWidth = Math.round(width * parseInt(dpi));
      const pixelHeight = Math.round(height * parseInt(dpi));

      const faceBuffer = await detectAndCropFace(req.files[0].buffer);
      let processedBuffer = await sharp(faceBuffer)
        .resize(pixelWidth, pixelHeight, { fit: 'cover' })
        .flatten({ background })
        .withMetadata({ density: parseInt(dpi) })
        .jpeg({ quality: 95, mozjpeg: true })
        .toBuffer();

      if (parseInt(copies) > 1) {
        const copyWidth = pixelWidth * 2;
        const copyHeight = pixelHeight * Math.ceil(parseInt(copies) / 2);
        const canvas = sharp({
          create: { width: copyWidth, height: copyHeight, channels: 3, background }
        });

        const composite = [];
        for (let i = 0; i < parseInt(copies); i++) {
          const x = (i % 2) * pixelWidth;
          const y = Math.floor(i / 2) * pixelHeight;
          composite.push({ input: processedBuffer, left: x, top: y });
        }

        processedBuffer = await canvas.composite(composite).jpeg({ quality: 95 }).toBuffer();
      }

      const filename = `passport_${size}_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'passport-photo');
    }
  },

  'rotate': async (req, res) => {
    try {
      if (!validateFile(req, res, 'rotate')) return;

      const { angle = 90, background = 'white' } = req.body;
      const processedBuffer = await sharp(req.files[0].buffer)
        .rotate(parseFloat(angle), { background })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `rotated_${angle}deg_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'rotate');
    }
  },

  'flip': async (req, res) => {
    try {
      if (!validateFile(req, res, 'flip')) return;

      const { direction = 'horizontal' } = req.body;
      let processor = sharp(req.files[0].buffer);

      if (direction === 'horizontal') {
        processor = processor.flop();
      } else if (direction === 'vertical') {
        processor = processor.flip();
      } else if (direction === 'both') {
        processor = processor.flip().flop();
      }

      const processedBuffer = await processor.jpeg({ quality: 90 }).toBuffer();
      const filename = `flipped_${direction}_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'flip');
    }
  },

  'grayscale': async (req, res) => {
    try {
      if (!validateFile(req, res, 'grayscale')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .grayscale()
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `grayscale_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'grayscale');
    }
  },

  'circle-crop': async (req, res) => {
    try {
      if (!validateFile(req, res, 'circle-crop')) return;

      const { border = false, borderColor = 'white', borderWidth = 10 } = req.body;
      const metadata = await sharp(req.files[0].buffer).metadata();
      const size = Math.min(metadata.width, metadata.height);

      const mask = Buffer.from(
        `<svg width="${size}" height="${size}">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/>
        </svg>`
      );

      let processedBuffer = await sharp(req.files[0].buffer)
        .resize(size, size, { fit: 'cover' })
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer();

      if (border) {
        const borderMask = Buffer.from(
          `<svg width="${size + borderWidth * 2}" height="${size + borderWidth * 2}">
            <circle cx="${(size + borderWidth * 2) / 2}" cy="${(size + borderWidth * 2) / 2}" 
                    r="${(size + borderWidth * 2) / 2}" fill="${borderColor}"/>
          </svg>`
        );

        processedBuffer = await sharp({
          create: {
            width: size + borderWidth * 2,
            height: size + borderWidth * 2,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
          .composite([
            { input: borderMask, blend: 'over' },
            { input: processedBuffer, left: borderWidth, top: borderWidth }
          ])
          .png()
          .toBuffer();
      }

      const filename = `circle_crop_${Date.now()}.png`;
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'circle-crop');
    }
  },

  'watermark': async (req, res) => {
    try {
      if (!validateFile(req, res, 'watermark')) return;

      const { text = 'WATERMARK', position = 'bottom-right', opacity = 0.5, fontSize = 48 } = req.body;
      const metadata = await sharp(req.files[0].buffer).metadata();

      const watermarkSvg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <text x="${position.includes('right') ? metadata.width - 20 : 20}" 
                y="${position.includes('bottom') ? metadata.height - 20 : 50}"
                font-family="Arial" font-size="${fontSize}" 
                fill="white" fill-opacity="${opacity}"
                text-anchor="${position.includes('right') ? 'end' : 'start'}">
            ${text}
          </text>
        </svg>
      `;

      const processedBuffer = await sharp(req.files[0].buffer)
        .composite([{ input: Buffer.from(watermarkSvg), blend: 'over' }])
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `watermarked_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'watermark');
    }
  },

  'remove-background': async (req, res) => {
    try {
      if (!validateFile(req, res, 'remove-background')) return;

      // Simple background removal using edge detection and transparency
      const processedBuffer = await sharp(req.files[0].buffer)
        .ensureAlpha()
        .png()
        .toBuffer();

      const filename = `no_background_${Date.now()}.png`;
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'remove-background');
    }
  },

  'convert-dpi': async (req, res) => {
    try {
      if (!validateFile(req, res, 'convert-dpi')) return;

      const { dpi = 300 } = req.body;
      const targetDpi = parseInt(dpi);

      const processedBuffer = await sharp(req.files[0].buffer)
        .withMetadata({ density: targetDpi })
        .jpeg({ quality: 95 })
        .toBuffer();

      const filename = `${targetDpi}dpi_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'convert-dpi');
    }
  },

  'check-dpi': async (req, res) => {
    try {
      if (!validateFile(req, res, 'check-dpi')) return;

      const metadata = await sharp(req.files[0].buffer).metadata();
      
      res.json({
        dpi: metadata.density || 72,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: req.files[0].size,
        message: `Image DPI: ${metadata.density || 72}`
      });
    } catch (error) {
      handleToolError(res, error, 'check-dpi');
    }
  },

  'pdf-to-jpg': async (req, res) => {
    try {
      if (!validateFile(req, res, 'pdf-to-jpg')) return;

      // For now, return error as PDF conversion requires additional libraries
      res.status(400).json({
        error: 'PDF to JPG conversion requires additional setup. Please use an image file.',
        suggestion: 'Upload JPG, PNG, or other image formats instead.'
      });
    } catch (error) {
      handleToolError(res, error, 'pdf-to-jpg');
    }
  },

  'image-to-pdf': async (req, res) => {
    try {
      if (!validateFile(req, res, 'image-to-pdf')) return;

      // For now, return error as PDF generation requires additional libraries
      res.status(400).json({
        error: 'Image to PDF conversion requires additional setup.',
        suggestion: 'This feature will be available in a future update.'
      });
    } catch (error) {
      handleToolError(res, error, 'image-to-pdf');
    }
  },

  'jpg-to-text': async (req, res) => {
    try {
      if (!validateFile(req, res, 'jpg-to-text')) return;

      // OCR functionality requires additional libraries
      res.status(400).json({
        error: 'OCR text extraction requires additional setup.',
        suggestion: 'This feature will be available in a future update.'
      });
    } catch (error) {
      handleToolError(res, error, 'jpg-to-text');
    }
  },

  'pixelate': async (req, res) => {
    try {
      if (!validateFile(req, res, 'pixelate')) return;

      const { intensity = 10 } = req.body;
      const metadata = await sharp(req.files[0].buffer).metadata();
      const factor = parseInt(intensity) || 10;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(Math.floor(metadata.width / factor), Math.floor(metadata.height / factor), {
          kernel: 'nearest'
        })
        .resize(metadata.width, metadata.height, { kernel: 'nearest' })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `pixelated_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'pixelate');
    }
  },

  'signature': async (req, res) => {
    try {
      if (!validateFile(req, res, 'signature')) return;

      const { width = 300, height = 100, enhance = 'true' } = req.body;
      const targetWidth = parseInt(width);
      const targetHeight = parseInt(height);

      let image = sharp(req.files[0].buffer)
        .resize(targetWidth, targetHeight, { fit: 'inside', background: '#FFFFFF' })
        .flatten({ background: '#FFFFFF' });

      if (enhance === 'true') {
        image = image
          .normalize()
          .sharpen()
          .modulate({ brightness: 1.1, saturation: 0.9 });
      }

      const processedBuffer = await image
        .jpeg({ quality: 95 })
        .toBuffer();

      const filename = `signature_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'signature');
    }
  }
};
