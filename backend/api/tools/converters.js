// backend/api/tools/converters.js
// All format-conversion tools (image ↔ format, image ↔ pdf, OCR)

import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import Tesseract from 'tesseract.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only image or PDF files are allowed'));
  }
});

// ── Helper: Binary-search to hit an exact byte target ──────────────────────────
const compressToSize = async (buffer, targetBytes, format = 'jpeg') => {
  let low = 10, high = 100, bestBuffer = buffer;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testBuffer = await sharp(buffer).toFormat(format, { quality: mid, mozjpeg: true }).toBuffer();
    if (testBuffer.length <= targetBytes) { bestBuffer = testBuffer; low = mid + 1; }
    else high = mid - 1;
  }
  return bestBuffer;
};

// ── POST /api/convert/:tool ─────────────────────────────────────────────────────
router.post('/:tool', upload.any(), async (req, res) => {
  try {
    const { tool } = req.params;
    const fileBuffer = req.files?.[0]?.buffer || req.file?.buffer;
    const customFilename = req.body.customFilename;
    let processedBuffer;
    let filename;
    let contentType = 'image/jpeg';

    switch (tool) {

      // ── Format conversions ──────────────────────────────────────────────────
      case 'heic-to-jpg':
        processedBuffer = await sharp(fileBuffer).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
        filename = customFilename ? `${customFilename}.jpg` : `heic_to_jpg_${Date.now()}.jpg`;
        break;

      case 'webp-to-jpg':
        processedBuffer = await sharp(fileBuffer).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
        filename = customFilename ? `${customFilename}.jpg` : `webp_to_jpg_${Date.now()}.jpg`;
        break;

      case 'png-to-jpeg':
        processedBuffer = await sharp(fileBuffer).flatten({ background: 'white' }).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
        filename = customFilename ? `${customFilename}.jpg` : `png_to_jpeg_${Date.now()}.jpg`;
        break;

      case 'jpeg-to-png':
        processedBuffer = await sharp(fileBuffer).png({ quality: 90 }).toBuffer();
        filename = customFilename ? `${customFilename}.png` : `jpeg_to_png_${Date.now()}.png`;
        contentType = 'image/png';
        break;

      // ── OCR tools ──────────────────────────────────────────────────────────
      case 'jpg-to-text':
      case 'png-to-text':
      case 'ocr': {
        if (!fileBuffer) return res.status(400).json({ error: 'No image file provided' });
        const lang = req.body.lang || 'eng';
        const { data: { text } } = await Tesseract.recognize(fileBuffer, lang, { logger: () => {} });
        return res.json({ success: true, text: text.trim(), language: lang });
      }

      // ── Image → PDF ─────────────────────────────────────────────────────────
      case 'image-to-pdf': {
        const imageFiles = req.files || [];
        if (imageFiles.length === 0) return res.status(400).json({ error: 'No images provided' });

        const doc = new PDFDocument({ autoFirstPage: false });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="converted-images.pdf"',
            'Content-Length': pdfBuffer.length
          });
          res.send(pdfBuffer);
        });

        for (const file of imageFiles) {
          try {
            const meta = await sharp(file.buffer).metadata();
            const maxWidth = 550, maxHeight = 800;
            let pw = meta.width, ph = meta.height;
            if (pw > maxWidth || ph > maxHeight) {
              const scale = Math.min(maxWidth / pw, maxHeight / ph);
              pw = pw * scale; ph = ph * scale;
            }
            doc.addPage({ size: [pw + 40, ph + 40], margin: 20 });
            doc.image(file.buffer, 20, 20, { width: pw, height: ph });
          } catch (e) { console.error('Image skip:', e.message); }
        }
        doc.end();
        return;
      }

      // ── PDF → JPG ───────────────────────────────────────────────────────────
      case 'pdf-to-jpg':
        if (!fileBuffer) return res.status(400).json({ error: 'No file provided' });
        processedBuffer = await sharp(fileBuffer).jpeg({ quality: 90 }).toBuffer();
        filename = customFilename ? `${customFilename}.jpg` : `pdf_to_jpg_${Date.now()}.jpg`;
        break;

      // ── JPG → PDF (size-limited) ────────────────────────────────────────────
      case 'jpg-to-pdf-50kb':
      case 'jpg-to-pdf-100kb':
      case 'jpg-to-pdf-300kb':
      case 'jpg-to-pdf-500kb':
      case 'jpeg-to-pdf-200kb': {
        if (!fileBuffer) return res.status(400).json({ error: 'No file provided' });
        const match = tool.match(/(\d+)kb/);
        const targetKB = match ? parseInt(match[1]) : 100;
        const compressed = await compressToSize(fileBuffer, targetKB * 800);
        const meta = await sharp(compressed).metadata();

        const pdfBuffer = await new Promise((resolve, reject) => {
          const pdfDoc = new PDFDocument({ autoFirstPage: false });
          const chunks = [];
          pdfDoc.on('data', c => chunks.push(c));
          pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
          pdfDoc.on('error', reject);
          pdfDoc.addPage({ size: [meta.width + 40, meta.height + 40], margin: 20 });
          pdfDoc.image(compressed, 20, 20, { width: meta.width, height: meta.height });
          pdfDoc.end();
        });

        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="image_${targetKB}kb_${Date.now()}.pdf"`
        });
        res.send(pdfBuffer);
        return;
      }

      default:
        return res.status(400).json({ error: `Converter tool '${tool}' not supported` });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(processedBuffer);

    setImmediate(() => { processedBuffer = null; if (global.gc) global.gc(); });
  } catch (error) {
    console.error(`[CONVERTERS] ${req.params.tool} error:`, error.message);
    res.status(500).json({ error: 'Conversion failed: ' + error.message });
  }
});

export default router;
