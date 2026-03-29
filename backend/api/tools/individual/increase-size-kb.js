// backend/api/tools/individual/increase-size-kb.js
// Tool: Increase Size KB
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
    const targetKB = parseInt(req.body.targetKB) || 500;
    const targetBytes = targetKB * 1024;
    const meta = await sharp(buf).metadata();
    let out;
    if (buf.length >= targetBytes) {
      out = await sharp(buf).jpeg({ quality: 95 }).toBuffer();
    } else {
      const scale = Math.sqrt(targetBytes / buf.length);
      const w = Math.round(meta.width * Math.min(scale, 2));
      const h = Math.round(meta.height * Math.min(scale, 2));
      out = await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).jpeg({ quality: 100, chromaSubsampling: '4:4:4' }).toBuffer();
    }
    sendImage(res, out, `increased_${targetKB}kb_${Date.now()}.jpg`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
