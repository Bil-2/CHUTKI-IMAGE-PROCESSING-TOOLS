import sharp from 'sharp';
import PDFDocument from 'pdfkit';
import Tesseract from 'tesseract.js';
import { validateFile, handleToolError } from './utils.js';

export const conversionTools = {
  'heic-to-jpg': async (req, res) => {
    try {
      if (!validateFile(req, res, 'heic-to-jpg')) return;

      const { quality = 90 } = req.body;
      const processedBuffer = await sharp(req.files[0].buffer)
        .jpeg({ quality: parseInt(quality) })
        .toBuffer();

      const filename = `converted_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'heic-to-jpg');
    }
  },

  'webp-to-jpg': async (req, res) => {
    try {
      if (!validateFile(req, res, 'webp-to-jpg')) return;

      const { quality = 90 } = req.body;
      const processedBuffer = await sharp(req.files[0].buffer)
        .jpeg({ quality: parseInt(quality) })
        .toBuffer();

      const filename = `webp_to_jpg_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'webp-to-jpg');
    }
  },

  'jpeg-to-png': async (req, res) => {
    try {
      if (!validateFile(req, res, 'jpeg-to-png')) return;

      const processedBuffer = await sharp(req.files[0].buffer)
        .png({ quality: 90 })
        .toBuffer();

      const filename = `jpeg_to_png_${Date.now()}.png`;
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'jpeg-to-png');
    }
  },

  'png-to-jpeg': async (req, res) => {
    try {
      if (!validateFile(req, res, 'png-to-jpeg')) return;

      const { quality = 90, background = 'white' } = req.body;
      const processedBuffer = await sharp(req.files[0].buffer)
        .flatten({ background })
        .jpeg({ quality: parseInt(quality) })
        .toBuffer();

      const filename = `png_to_jpeg_${Date.now()}.jpg`;
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'png-to-jpeg');
    }
  },

  'jpg-to-webp': async (req, res) => {
    try {
      if (!validateFile(req, res, 'jpg-to-webp')) return;

      const { quality = 80 } = req.body;
      const processedBuffer = await sharp(req.files[0].buffer)
        .webp({ quality: parseInt(quality) })
        .toBuffer();

      const filename = `jpg_to_webp_${Date.now()}.webp`;
      res.set({
        'Content-Type': 'image/webp',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'jpg-to-webp');
    }
  },

  'png-to-webp': async (req, res) => {
    try {
      if (!validateFile(req, res, 'png-to-webp')) return;

      const { quality = 80 } = req.body;
      const processedBuffer = await sharp(req.files[0].buffer)
        .webp({ quality: parseInt(quality) })
        .toBuffer();

      const filename = `png_to_webp_${Date.now()}.webp`;
      res.set({
        'Content-Type': 'image/webp',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.send(processedBuffer);
    } catch (error) {
      handleToolError(res, error, 'png-to-webp');
    }
  },

  'ocr': async (req, res) => {
    try {
      const file = req.files?.find(f => f.fieldname === 'image' || f.fieldname === 'images') || req.files?.[0];
      if (!file) {
        console.log('OCR Error: No file found in request');
        console.log('Available files:', req.files);
        return res.status(400).json({ error: 'No image file provided' });
      }

      const lang = req.body.lang || 'eng';
      console.log(`Processing OCR: language=${lang}`);

      const { data: { text } } = await Tesseract.recognize(file.buffer, lang, {
        logger: m => console.log('Tesseract:', m)
      });

      console.log(`OCR completed: extracted ${text.length} characters`);

      res.json({
        text: text.trim(),
        language: lang,
        success: true
      });
    } catch (error) {
      console.error('OCR Error:', error);
      res.status(500).json({ error: 'Failed to extract text from image: ' + error.message });
    }
  },

  'image-to-pdf': async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
      }

      console.log(`Processing image-to-pdf: ${req.files.length} files`);

      const doc = new PDFDocument({ autoFirstPage: false });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log(`PDF created: ${pdfBuffer.length} bytes`);

        const filename = `images_to_pdf_${Date.now()}.pdf`;
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`
        });
        res.send(pdfBuffer);
      });

      for (const file of req.files) {
        try {
          const metadata = await sharp(file.buffer).metadata();
          const maxWidth = 500;
          const maxHeight = 700;

          let { width, height } = metadata;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const processedBuffer = await sharp(file.buffer)
            .resize(width, height, { fit: 'inside' })
            .jpeg({ quality: 85 })
            .toBuffer();

          doc.addPage({ size: [width + 40, height + 40] });
          doc.image(processedBuffer, 20, 20, { width, height });
        } catch (imageError) {
          console.error('Error processing image:', imageError);
          continue;
        }
      }

      doc.end();
    } catch (error) {
      handleToolError(res, error, 'image-to-pdf');
    }
  },

  'jpg-to-text': async (req, res) => {
    try {
      const file = req.files?.find(f => f.fieldname === 'image' || f.fieldname === 'images') || req.files?.[0];
      if (!file) {
        return res.status(400).json({ error: 'No JPG file provided' });
      }

      const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng');

      res.json({
        text: text.trim(),
        success: true
      });
    } catch (error) {
      handleToolError(res, error, 'jpg-to-text');
    }
  },

  'png-to-text': async (req, res) => {
    try {
      const file = req.files?.find(f => f.fieldname === 'image' || f.fieldname === 'images') || req.files?.[0];
      if (!file) {
        return res.status(400).json({ error: 'No PNG file provided' });
      }

      const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng');

      res.json({
        text: text.trim(),
        success: true
      });
    } catch (error) {
      handleToolError(res, error, 'png-to-text');
    }
  }
};
