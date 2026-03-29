// backend/api/tools/individual/join-images.js
// Tool: Join Images
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
    const direction = req.body.direction || 'horizontal';
    const spacing = parseInt(req.body.spacing) || 0;
    if (files.length < 2) {
      const out = await sharp(files[0].buffer).jpeg({ quality: 90 }).toBuffer();
      return sendImage(res, out, `joined_${Date.now()}.jpg`);
    }
    const metas = await Promise.all(files.map(f => sharp(f.buffer).metadata()));
    let canvas, composites = [];
    if (direction === 'horizontal') {
      const totalW = metas.reduce((s,m) => s+m.width, 0) + spacing*(files.length-1);
      const maxH = Math.max(...metas.map(m => m.height));
      let left = 0;
      for (let i = 0; i < files.length; i++) {
        composites.push({ input: await sharp(files[i].buffer).resize({ height: maxH, fit: 'inside' }).toBuffer(), left, top: 0 });
        left += metas[i].width + spacing;
      }
      canvas = { width: totalW, height: maxH, channels: 3, background: { r:255,g:255,b:255 } };
    } else {
      const maxW = Math.max(...metas.map(m => m.width));
      const totalH = metas.reduce((s,m) => s+m.height, 0) + spacing*(files.length-1);
      let top = 0;
      for (let i = 0; i < files.length; i++) {
        composites.push({ input: await sharp(files[i].buffer).resize({ width: maxW, fit: 'inside' }).toBuffer(), left: 0, top });
        top += metas[i].height + spacing;
      }
      canvas = { width: maxW, height: totalH, channels: 3, background: { r:255,g:255,b:255 } };
    }
    const out = await sharp({ create: canvas }).composite(composites).jpeg({ quality: 90 }).toBuffer();
    sendImage(res, out, `joined_${Date.now()}.jpg`);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
