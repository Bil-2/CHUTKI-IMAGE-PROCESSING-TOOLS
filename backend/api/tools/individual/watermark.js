// backend/api/tools/individual/watermark.js
// Tool: Watermark
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
    const text = req.body.text || 'Watermark';
    const opacity = parseFloat(req.body.opacity) || 0.5;
    const meta = await sharp(buf).metadata();
    const fontSize = Math.round(Math.min(meta.width, meta.height) * 0.08);
    const svgWatermark = Buffer.from(`<svg width="${meta.width}" height="${meta.height}"><text x="50%" y="50%" font-size="${fontSize}" fill="rgba(255,255,255,${opacity})" text-anchor="middle" dominant-baseline="middle" transform="rotate(-30,${meta.width/2},${meta.height/2})">${text}</text></svg>`);
    const out = await sharp(buf).composite([{ input: svgWatermark, blend: 'over' }]).jpeg({ quality: 90 }).toBuffer();
    sendImage(res, out, `watermarked_${Date.now()}.jpg`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
