// backend/api/tools/individual/freehand-crop.js
// Tool: Freehand Crop
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
    const x = parseInt(req.body.x) || 0, y = parseInt(req.body.y) || 0;
    const w = parseInt(req.body.width) || 100, h = parseInt(req.body.height) || 100;
    const meta = await sharp(buf).metadata();
    const region = { left: Math.min(x, meta.width-1), top: Math.min(y, meta.height-1), width: Math.min(w, meta.width-x), height: Math.min(h, meta.height-y) };
    const out = await sharp(buf).extract(region).jpeg({ quality: 90 }).toBuffer();
    sendImage(res, out, `cropped_${Date.now()}.jpg`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
