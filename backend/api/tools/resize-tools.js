import sharp from 'sharp';
import { validateFile, handleToolError } from './utils.js';

export const resizeTools = {
  'resize-pixel': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-pixel')) return;

      const { width, height, maintain = 'true' } = req.body;
      const targetWidth = parseInt(width);
      const targetHeight = parseInt(height);

      let resizeOptions = { fit: 'fill' };
      if (maintain === 'true') {
        resizeOptions.fit = 'inside';
        resizeOptions.withoutEnlargement = false;
      }

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(targetWidth, targetHeight, resizeOptions)
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `resized_${targetWidth}x${targetHeight}_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-pixel');
    }
  },

  'resize-cm': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-cm')) return;

      const { width, height, dpi = 300 } = req.body;
      const targetDpi = parseInt(dpi);

      // Convert cm to pixels (1 cm = dpi/2.54 pixels)
      const pixelsPerCm = targetDpi / 2.54;
      const targetWidth = Math.round(parseFloat(width) * pixelsPerCm);
      const targetHeight = Math.round(parseFloat(height) * pixelsPerCm);

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(targetWidth, targetHeight, { fit: 'fill' })
        .withMetadata({ density: targetDpi })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `resized_${width}x${height}cm_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-cm');
    }
  },

  'resize-mm': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-mm')) return;

      const { width, height, dpi = 300 } = req.body;
      const targetDpi = parseInt(dpi);

      // Convert mm to pixels (1 mm = dpi/25.4 pixels)
      const pixelsPerMm = targetDpi / 25.4;
      const targetWidth = Math.round(parseFloat(width) * pixelsPerMm);
      const targetHeight = Math.round(parseFloat(height) * pixelsPerMm);

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(targetWidth, targetHeight, { fit: 'fill' })
        .withMetadata({ density: targetDpi })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `resized_${width}x${height}mm_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-mm');
    }
  },

  'resize-inches': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-inches')) return;

      const { width, height, dpi = 300 } = req.body;
      const targetDpi = parseInt(dpi);

      // Convert inches to pixels (1 inch = dpi pixels)
      const targetWidth = Math.round(parseFloat(width) * targetDpi);
      const targetHeight = Math.round(parseFloat(height) * targetDpi);

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(targetWidth, targetHeight, { fit: 'fill' })
        .withMetadata({ density: targetDpi })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `resized_${width}x${height}inch_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-inches');
    }
  },

  'resize-6cm-2cm': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-6cm-2cm')) return;

      const dpi = 300;
      const pixelWidth = Math.round(6 * dpi / 2.54);
      const pixelHeight = Math.round(2 * dpi / 2.54);

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(pixelWidth, pixelHeight, { fit: 'cover' })
        .withMetadata({ density: dpi })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `resized_6cm_2cm_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-6cm-2cm');
    }
  },

  'resize-whatsapp-dp': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-whatsapp-dp')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(500, 500, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `whatsapp_dp_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-whatsapp-dp');
    }
  },

  'resize-instagram-no-crop': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-instagram-no-crop')) return;

      const metadata = await sharp(req.files[0].buffer).metadata();
      const size = Math.max(metadata.width, metadata.height);

      const processedBuffer = await sharp({
        create: {
          width: size,
          height: size,
          channels: 3,
          background: 'white'
        }
      })
        .composite([{
          input: await sharp(req.files[0].buffer)
            .resize(size, size, { fit: 'inside' })
            .toBuffer(),
          gravity: 'center'
        }])
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `instagram_no_crop_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-instagram-no-crop');
    }
  },

  'resize-instagram-grid': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-instagram-grid')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(1080, 1080, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `instagram_grid_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-instagram-grid');
    }
  },

  'resize-youtube-banner': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-youtube-banner')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(2560, 1440, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `youtube_banner_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-youtube-banner');
    }
  },

  'resize-ssc': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-ssc')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(300, 300, { fit: 'cover' })
        .withMetadata({ density: 300 })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `ssc_photo_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-ssc');
    }
  },

  'resize-pan-card': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-pan-card')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(300, 360, { fit: 'cover' })
        .withMetadata({ density: 300 })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `pan_card_photo_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-pan-card');
    }
  },

  'resize-upsc': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-upsc')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(300, 400, { fit: 'cover' })
        .withMetadata({ density: 300 })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `upsc_photo_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-upsc');
    }
  },

  'resize-instagram': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-instagram')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(1080, 1080, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();

      const filename = `instagram_post_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-instagram');
    }
  },

  'resize-whatsapp': async (req, res) => {
    try {
      if (!validateFile(req, res, 'resize-whatsapp')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .resize(500, 500, { fit: 'cover' })
        .jpeg({ quality: 85 })
        .toBuffer();

      const filename = `whatsapp_dp_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'resize-whatsapp');
    }
  }
};
