// backend/api/tools/individual/resize-pixel.js
// Tool: Resize Pixel
// Auto-generated individual route file

import express from 'express';
import multer from 'multer';
import sharp from 'sharp';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only image/PDF files allowed'));
  }
});

const compressToSize = async (buffer, targetBytes, format = 'jpeg') => {
  let low = 1, high = 100, best = buffer;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const test = await sharp(buffer).toFormat(format, { quality: mid, mozjpeg: format === 'jpeg' }).toBuffer();
    if (test.length <= targetBytes) { best = test; low = mid + 1; } else { high = mid - 1; }
  }
  return best;
};

const sendImage = (res, buffer, filename, mime = 'image/jpeg') => {
  res.setHeader('Content-Type', mime);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
  setImmediate(() => { if (global.gc) global.gc(); });
};

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const buf = req.file?.buffer; if (!buf) return res.status(400).json({ error: 'No file' });
    const { width, height, quality = 90, format = 'jpeg' } = req.body;
    const w = parseInt(width), h = parseInt(height);
    let out, mime = 'image/jpeg', ext = 'jpg';
    if (format === 'png') { out = await sharp(buf).resize(w, h, { fit: 'inside' }).png({ quality: parseInt(quality) }).toBuffer(); mime = 'image/png'; ext = 'png'; }
    else if (format === 'webp') { out = await sharp(buf).resize(w, h, { fit: 'inside' }).webp({ quality: parseInt(quality) }).toBuffer(); mime = 'image/webp'; ext = 'webp'; }
    else { out = await sharp(buf).resize(w, h, { fit: 'inside' }).jpeg({ quality: parseInt(quality), mozjpeg: true }).toBuffer(); }
    sendImage(res, out, `resized_${w}x${h}_${Date.now()}.${ext}`, mime);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
