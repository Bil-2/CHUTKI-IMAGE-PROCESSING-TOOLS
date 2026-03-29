// backend/api/tools/individual/bulk-resize.js
// Tool: Bulk Resize
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

router.post('/', upload.array('files'), async (req, res) => {
  try {
    const files = req.files; if (!files?.length) return res.status(400).json({ error: 'No files' });
    const { width, height, unit = 'px', dpi = 300 } = req.body;
    let pw, ph;
    if (unit === 'cm') { pw = Math.round(parseFloat(width)*parseInt(dpi)/2.54); ph = Math.round(parseFloat(height)*parseInt(dpi)/2.54); }
    else if (unit === 'mm') { pw = Math.round(parseFloat(width)*parseInt(dpi)/25.4); ph = Math.round(parseFloat(height)*parseInt(dpi)/25.4); }
    else if (unit === 'inch') { pw = Math.round(parseFloat(width)*parseInt(dpi)); ph = Math.round(parseFloat(height)*parseInt(dpi)); }
    else { pw = parseInt(width); ph = parseInt(height); }
    const out = await sharp(files[0].buffer).resize(pw, ph, { fit: 'cover' }).withMetadata({ density: parseInt(dpi) }).jpeg({ quality: 90 }).toBuffer();
    sendImage(res, out, `bulk_${Date.now()}.jpg`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
