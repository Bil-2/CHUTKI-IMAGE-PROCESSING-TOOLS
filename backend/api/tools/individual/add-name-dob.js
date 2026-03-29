// backend/api/tools/individual/add-name-dob.js
// Tool: Add Name & DOB
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
    const name = req.body.name || 'Name', dob = req.body.dob || '';
    const meta = await sharp(buf).metadata();
    const fontSize = Math.round(meta.width * 0.05);
    const text = dob ? `${name} | DOB: ${dob}` : name;
    const svg = Buffer.from(`<svg width="${meta.width}" height="60"><rect width="100%" height="100%" fill="rgba(0,0,0,0.6)"/><text x="50%" y="35" font-size="${fontSize}" fill="white" text-anchor="middle" font-family="Arial">${text}</text></svg>`);
    const out = await sharp(buf).composite([{ input: svg, gravity: 'south' }]).jpeg({ quality: 90 }).toBuffer();
    sendImage(res, out, `named_${Date.now()}.jpg`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
