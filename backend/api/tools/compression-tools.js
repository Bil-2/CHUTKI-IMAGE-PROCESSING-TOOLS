import sharp from 'sharp';
import { validateFile, handleToolError, compressToSize } from './utils.js';

export const compressionTools = {
  'reduce-size-kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'reduce-size-kb')) return;

      const targetKB = parseInt(req.body.targetKB) || 100;
      const targetBytes = targetKB * 1024;

      console.log(`Processing reduce-size-kb: target=${targetKB}KB (${targetBytes} bytes)`);

      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_${targetKB}kb_${Date.now()}.jpg`;

      console.log(`reduce-size-kb completed: output size=${processedBuffer.length} bytes`);

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'reduce-size-kb');
    }
  },

  'compress-5kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-5kb')) return;

      const targetBytes = 5 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_5kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-5kb');
    }
  },

  'compress-10kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-10kb')) return;

      const targetBytes = 10 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_10kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-10kb');
    }
  },

  'compress-15kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-15kb')) return;

      const targetBytes = 15 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_15kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-15kb');
    }
  },

  'compress-20kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-20kb')) return;

      const targetBytes = 20 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_20kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-20kb');
    }
  },

  'compress-25kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-25kb')) return;

      const targetBytes = 25 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_25kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-25kb');
    }
  },

  'compress-30kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-30kb')) return;

      const targetBytes = 30 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_30kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-30kb');
    }
  },

  'compress-40kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-40kb')) return;

      const targetBytes = 40 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_40kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-40kb');
    }
  },

  'compress-50kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-50kb')) return;

      const targetBytes = 50 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_50kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-50kb');
    }
  },

  'compress-100kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-100kb')) return;

      const targetBytes = 100 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_100kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-100kb');
    }
  },

  'compress-150kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-150kb')) return;

      const targetBytes = 150 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_150kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-150kb');
    }
  },

  'compress-200kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-200kb')) return;

      const targetBytes = 200 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_200kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-200kb');
    }
  },

  'compress-300kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-300kb')) return;

      const targetBytes = 300 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_300kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-300kb');
    }
  },

  'compress-500kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-500kb')) return;

      const targetBytes = 500 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_500kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-500kb');
    }
  },

  'compress-1mb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-1mb')) return;

      const targetBytes = 1 * 1024 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_1mb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-1mb');
    }
  },

  'compress-2mb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-2mb')) return;

      const targetBytes = 2 * 1024 * 1024;
      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_2mb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-2mb');
    }
  },

  'mb-to-kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'mb-to-kb')) return;

      const targetKB = parseInt(req.body.targetKB) || 500;
      const targetBytes = targetKB * 1024;

      console.log(`Processing mb-to-kb: target=${targetKB}KB (${targetBytes} bytes)`);

      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `mb_to_${targetKB}kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'mb-to-kb');
    }
  },

  'increase-size-kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'increase-size-kb')) return;

      const targetKB = parseInt(req.body.targetKB) || 200;
      const targetBytes = targetKB * 1024;

      // For increasing size, we reduce compression quality
      let quality = 95;
      let processedBuffer = await sharp(req.files[0].buffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      // If still too small, add metadata or increase dimensions slightly
      if (processedBuffer.length < targetBytes) {
        const metadata = await sharp(req.files[0].buffer).metadata();
        const scaleFactor = Math.sqrt(targetBytes / processedBuffer.length);
        const newWidth = Math.round(metadata.width * scaleFactor);
        const newHeight = Math.round(metadata.height * scaleFactor);

        processedBuffer = await sharp(req.files[0].buffer)
          .resize(newWidth, newHeight, { fit: 'fill' })
          .jpeg({ quality: 95, mozjpeg: true })
          .toBuffer();
      }

      const filename = `increased_${targetKB}kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'increase-size-kb');
    }
  },

  'compress-kb': async (req, res) => {
    try {
      if (!validateFile(req, res, 'compress-kb')) return;

      const targetKB = parseInt(req.body.targetKB) || parseInt(req.body.size) || 100;
      const targetBytes = targetKB * 1024;

      const processedBuffer = await compressToSize(req.files[0].buffer, targetBytes);
      const filename = `compressed_${targetKB}kb_${Date.now()}.jpg`;

      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'compress-kb');
    }
  }
};
