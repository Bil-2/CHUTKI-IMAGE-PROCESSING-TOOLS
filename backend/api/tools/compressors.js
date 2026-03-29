// backend/api/tools/compressors.js
// All compression-related tools (compress to X KB/MB, image-compressor, etc.)

import express from 'express';
import multer from 'multer';
import sharp from 'sharp';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// ── Helper: Binary-search to hit an exact byte target ──────────────────────────
const compressToSize = async (buffer, targetBytes, format = 'jpeg') => {
  let low = 10, high = 100, bestBuffer = buffer;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testBuffer = await sharp(buffer)
      .toFormat(format, { quality: mid, mozjpeg: true })
      .toBuffer();

    if (testBuffer.length <= targetBytes) {
      bestBuffer = testBuffer;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return bestBuffer;
};

// ── POST /api/compress/:tool ────────────────────────────────────────────────────
router.post('/:tool', upload.any(), async (req, res) => {
  try {
    const { tool } = req.params;
    const fileBuffer = req.files?.[0]?.buffer || req.file?.buffer;
    if (!fileBuffer) return res.status(400).json({ error: 'No image file provided' });

    const customFilename = req.body.customFilename;
    let processedBuffer;
    let filename;
    let contentType = 'image/jpeg';

    // ── reduce-size-kb ───────────────────────────────────────────────────────
    if (tool === 'reduce-size-kb') {
      const targetKB = parseInt(req.body.targetKB) || 100;
      const targetBytes = targetKB * 1024;
      const quality = parseInt(req.body.quality) || 80;
      const format = (req.body.format || 'jpeg').toLowerCase();

      switch (format) {
        case 'png':
          processedBuffer = await sharp(fileBuffer).png({ quality, compressionLevel: 6 }).toBuffer();
          if (processedBuffer.length > targetBytes) processedBuffer = await compressToSize(processedBuffer, targetBytes);
          contentType = 'image/png';
          filename = customFilename ? `${customFilename}.png` : `compressed_${targetKB}kb_${Date.now()}.png`;
          break;
        case 'webp':
          processedBuffer = await compressToSize(fileBuffer, targetBytes);
          processedBuffer = await sharp(processedBuffer).webp({ quality }).toBuffer();
          contentType = 'image/webp';
          filename = customFilename ? `${customFilename}.webp` : `compressed_${targetKB}kb_${Date.now()}.webp`;
          break;
        default:
          processedBuffer = await compressToSize(fileBuffer, targetBytes);
          processedBuffer = await sharp(processedBuffer).jpeg({ quality, mozjpeg: true }).toBuffer();
          filename = customFilename ? `${customFilename}.jpg` : `compressed_${targetKB}kb_${Date.now()}.jpg`;
      }

    // ── reduce-size-mb ───────────────────────────────────────────────────────
    } else if (tool === 'reduce-size-mb') {
      const targetMB = parseFloat(req.body.targetMB) || 1;
      const targetBytes = targetMB * 1024 * 1024;
      processedBuffer = await compressToSize(fileBuffer, targetBytes);
      filename = customFilename ? `${customFilename}.jpg` : `compressed_${targetMB}mb_${Date.now()}.jpg`;

    // ── increase-size-kb ─────────────────────────────────────────────────────
    } else if (tool === 'increase-size-kb') {
      const targetKB = parseInt(req.body.targetSize) || parseInt(req.body.targetKB) || 500;
      const targetBytes = targetKB * 1024;
      const metadata = await sharp(fileBuffer).metadata();
      const currentSize = fileBuffer.length;

      if (currentSize >= targetBytes) {
        processedBuffer = await sharp(fileBuffer).jpeg({ quality: 95 }).toBuffer();
      } else {
        const scaleFactor = Math.sqrt(targetBytes / currentSize);
        const newWidth = Math.round(metadata.width * Math.min(scaleFactor, 2));
        const newHeight = Math.round(metadata.height * Math.min(scaleFactor, 2));
        processedBuffer = await sharp(fileBuffer)
          .resize(newWidth, newHeight, { kernel: 'lanczos3' })
          .jpeg({ quality: 100, chromaSubsampling: '4:4:4', mozjpeg: false })
          .toBuffer();
      }
      filename = customFilename ? `${customFilename}.jpg` : `increased_${targetKB}kb_${Date.now()}.jpg`;

    // ── image-compressor ─────────────────────────────────────────────────────
    } else if (tool === 'image-compressor' || tool === 'compress-image') {
      const quality = parseInt(req.body.quality) || 80;
      const format = (req.body.format || 'jpeg').toLowerCase();
      const preserveMetadata = req.body.preserveMetadata === 'true';

      let processor = sharp(fileBuffer);
      if (!preserveMetadata) processor = processor.withMetadata({ exif: null, iptc: null, xmp: null });

      switch (format) {
        case 'png':
          processedBuffer = await processor.png({ quality, compressionLevel: 6 }).toBuffer();
          contentType = 'image/png';
          filename = customFilename ? `${customFilename}.png` : `compressed_q${quality}_${Date.now()}.png`;
          break;
        case 'webp':
          processedBuffer = await processor.webp({ quality }).toBuffer();
          contentType = 'image/webp';
          filename = customFilename ? `${customFilename}.webp` : `compressed_q${quality}_${Date.now()}.webp`;
          break;
        default:
          processedBuffer = await processor.jpeg({ quality, mozjpeg: true }).toBuffer();
          filename = customFilename ? `${customFilename}.jpg` : `compressed_q${quality}_${Date.now()}.jpg`;
      }

    // ── All compress-XKB / compress-XMB / jpg-to-kb / mb-to-kb / kb-to-mb ──
    } else {
      const sizeMatch = tool.match(/compress-(\d+)(kb|mb)/) || tool.match(/(\d+)(kb|mb)/);
      let targetBytes;

      if (tool === 'compress-20-50kb') targetBytes = 35 * 1024;
      else if (tool === 'jpg-to-kb') targetBytes = (parseInt(req.body.targetKB) || 100) * 1024;
      else if (tool === 'kb-to-mb') targetBytes = (parseFloat(req.body.targetMB) || 1) * 1024 * 1024;
      else if (tool === 'mb-to-kb') targetBytes = (parseInt(req.body.targetKB) || 500) * 1024;
      else if (sizeMatch) {
        const [, size, unit] = sizeMatch;
        targetBytes = unit === 'mb' ? parseInt(size) * 1024 * 1024 : parseInt(size) * 1024;
      } else {
        targetBytes = 100 * 1024;
      }

      processedBuffer = await compressToSize(fileBuffer, targetBytes);
      filename = customFilename ? `${customFilename}.jpg` : `compressed_${Date.now()}.jpg`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

    setImmediate(() => { processedBuffer = null; if (global.gc) global.gc(); });
  } catch (error) {
    console.error(`[COMPRESSORS] ${req.params.tool} error:`, error.message);
    res.status(500).json({ error: 'Compression failed: ' + error.message });
  }
});

export default router;
