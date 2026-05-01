#!/usr/bin/env node
/**
 * CHUTKI Tools - Comprehensive Automated Test
 * Tests ALL 81 backend API endpoints one by one with a real image.
 * Prints PASS / FAIL for each tool with reason.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:5001/api/tools';
const TEST_IMAGE = '/tmp/test_image.jpg';

// ─── Colours ──────────────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

// ─── Results Tracking ─────────────────────────────────────────────────────────
const results = { passed: [], failed: [], skipped: [] };

// ─── Helper: Build multipart body using Node built-ins ─────────────────────────
function buildFormData(fields) {
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const parts = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value && value._isFile) {
      const fileBuffer = fs.readFileSync(value.path);
      const mimeType = value.mime || 'image/jpeg';
      const filename = path.basename(value.path);
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${key}"; filename="${filename}"\r\n` +
        `Content-Type: ${mimeType}\r\n\r\n`
      );
      parts.push(fileBuffer);
      parts.push('\r\n');
    } else {
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
        `${value}\r\n`
      );
    }
  }
  parts.push(`--${boundary}--\r\n`);

  const buffers = parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p));
  const body = Buffer.concat(buffers);
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

// ─── Helper: POST to a tool endpoint ──────────────────────────────────────────
async function callTool(endpoint, fields) {
  const { body, contentType } = buildFormData(fields);
  const url = `${BASE_URL}/${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': contentType },
      body,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const contentTypeRes = response.headers.get('content-type') || '';
    const isJson = contentTypeRes.includes('application/json');
    const isBinary = contentTypeRes.includes('image/') ||
                     contentTypeRes.includes('application/pdf') ||
                     contentTypeRes.includes('application/zip') ||
                     contentTypeRes.includes('application/octet-stream');

    if (response.ok) {
      if (isBinary) {
        const buf = await response.arrayBuffer();
        return { ok: true, size: buf.byteLength, contentType: contentTypeRes };
      }
      if (isJson) {
        const json = await response.json();
        return { ok: true, json, contentType: contentTypeRes };
      }
      return { ok: true, contentType: contentTypeRes };
    } else {
      let errText = '';
      try { errText = await response.text(); } catch {}
      return { ok: false, status: response.status, error: errText.slice(0, 200) };
    }
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// ─── File helper ──────────────────────────────────────────────────────────────
const img = () => ({ _isFile: true, path: TEST_IMAGE, mime: 'image/jpeg' });

// ─── Test Definitions (all 81 tools + extras) ─────────────────────────────────
const TESTS = [
  // ── Image Editing Tools ───────────────────────────────────────────────────
  { name: 'Black & White Image',          ep: 'black-white',           fields: () => ({ file: img(), quality: '90', contrast: '1.2' }) },
  { name: 'Grayscale Image',              ep: 'grayscale',             fields: () => ({ file: img(), quality: '90', intensity: '1.0' }) },
  { name: 'Flip Image',                   ep: 'flip',                  fields: () => ({ file: img(), direction: 'horizontal' }) },
  { name: 'Rotate Image',                 ep: 'rotate',                fields: () => ({ file: img(), angle: '90', background: 'white' }) },
  { name: 'Watermark Images',             ep: 'watermark',             fields: () => ({ file: img(), text: 'CHUTKI TEST', position: 'center', opacity: '0.5', color: 'white' }) },
  { name: 'Circle Crop',                  ep: 'circle-crop',           fields: () => ({ file: img(), border: '0' }) },
  { name: 'Pixelate Image',               ep: 'pixelate',              fields: () => ({ file: img(), intensity: '10' }) },
  { name: 'Pixelate Face',                ep: 'pixelate-face',         fields: () => ({ file: img(), intensity: '10' }) },
  { name: 'Blur Face',                    ep: 'blur-face',             fields: () => ({ file: img(), intensity: '10' }) },
  { name: 'Censor Photo',                 ep: 'censor',                fields: () => ({ file: img(), x: '50', y: '50', width: '100', height: '100' }) },
  { name: 'Freehand Crop',                ep: 'freehand-crop',         fields: () => ({ file: img(), x: '10', y: '10', width: '200', height: '150' }) },
  { name: 'Remove Background',            ep: 'remove-background',     fields: () => ({ file: img(), quality: '80', edge: '5' }) },
  { name: 'Color Picker',                 ep: 'color-picker',          fields: () => ({ file: img(), x: '100', y: '100' }) },
  { name: 'Split Image',                  ep: 'split-image',           fields: () => ({ file: img(), rows: '2', cols: '2' }) },
  { name: 'Pixel Art',                    ep: 'pixel-art',             fields: () => ({ file: img(), pixelSize: '10' }) },
  { name: 'Add Name & DOB on Photo',      ep: 'add-name-dob',          fields: () => ({ file: img(), name: 'Test User', dob: '01-01-2000', position: 'bottom', fontSize: '20' }) },
  { name: 'Convert DPI',                  ep: 'convert-dpi',           fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Check Image DPI',              ep: 'check-dpi',             fields: () => ({ file: img() }) },
  { name: 'Generate Signature',           ep: 'generate-signature',    fields: () => ({ file: img(), enhance: 'true', background: 'white' }) },
  { name: 'Super Resolution',             ep: 'super-resolution',      fields: () => ({ file: img(), scale: '2' }) },
  { name: 'AI Face Generator',            ep: 'ai-face-generator',     fields: () => ({ gender: 'male', age: '25', style: 'realistic' }) },

  // ── Resize Tools ────────────────────────────────────────────────────────────
  { name: 'Resize Pixel',                 ep: 'resize-pixel',          fields: () => ({ file: img(), width: '300', height: '200', maintainAspectRatio: 'false', quality: '80', format: 'jpeg', resizeMethod: 'stretch', upscaling: 'true', smartCrop: 'false' }) },
  { name: 'Resize CM',                    ep: 'resize-cm',             fields: () => ({ file: img(), width: '10', height: '8', dpi: '300' }) },
  { name: 'Resize MM',                    ep: 'resize-mm',             fields: () => ({ file: img(), width: '100', height: '80', dpi: '300' }) },
  { name: 'Resize Inches',                ep: 'resize-inches',         fields: () => ({ file: img(), width: '4', height: '3', dpi: '300' }) },
  { name: 'Resize 6x2 300DPI',            ep: 'resize-6x2-300dpi',     fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Resize 3.5x4.5cm',             ep: 'resize-3-5x4-5cm',      fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Resize 35x45mm',               ep: 'resize-35x45mm',        fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Resize 2x2 Inch',              ep: 'resize-2x2',            fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Resize 4x6',                   ep: 'resize-4x6',            fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Resize 3x4',                   ep: 'resize-3x4',            fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Resize 600x600',               ep: 'resize-600x600',        fields: () => ({ file: img(), quality: '80', maintain: 'true' }) },
  { name: 'Resize A4',                    ep: 'resize-a4',             fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Resize SSC',                   ep: 'resize-ssc',            fields: () => ({ file: img(), dpi: '300', quality: '80' }) },
  { name: 'Resize PAN Card',              ep: 'resize-pan',            fields: () => ({ file: img(), dpi: '300', quality: '80' }) },
  { name: 'Resize UPSC',                  ep: 'resize-upsc',           fields: () => ({ file: img(), dpi: '300', quality: '80' }) },
  { name: 'Resize WhatsApp DP',           ep: 'resize-whatsapp-dp',    fields: () => ({ file: img() }) },
  { name: 'Resize Instagram (No Crop)',   ep: 'resize-instagram',      fields: () => ({ file: img(), format: 'jpeg' }) },
  { name: 'Instagram Grid Maker',         ep: 'instagram-grid',        fields: () => ({ file: img(), rows: '3', cols: '3' }) },
  { name: 'Resize YouTube Banner',        ep: 'resize-youtube-banner', fields: () => ({ file: img(), quality: '80', maintain: 'true' }) },
  { name: 'Resize Signature',             ep: 'resize-signature',      fields: () => ({ file: img(), width: '200', height: '80' }) },
  { name: 'Resize Sign 50x20mm',          ep: 'resize-sign-50x20mm',   fields: () => ({ file: img(), dpi: '300' }) },
  { name: 'Join Images',                  ep: 'join-images',           fields: () => ({ 'files': img(), direction: 'horizontal', spacing: '0' }) },
  { name: 'Passport Photo Maker',         ep: 'passport-photo-advanced', fields: () => ({ file: img(), size: '35x45', dpi: '300', background: 'white', format: 'jpeg', quantity: '1' }) },
  { name: 'Reduce Image Size KB',         ep: 'reduce-size-kb',        fields: () => ({ file: img(), targetKB: '80' }) },
  { name: 'Increase Image Size KB',       ep: 'increase-size-kb',      fields: () => ({ file: img(), targetKB: '200' }) },
  { name: 'Resize Signature (legacy)',     ep: 'resize-signature',      fields: () => ({ file: img(), width: '150', height: '60' }) },

  // ── Compression Tools ───────────────────────────────────────────────────────
  { name: 'Image Compressor',             ep: 'image-compressor',      fields: () => ({ file: img(), quality: '80' }) },
  { name: 'Reduce Size MB',               ep: 'reduce-size-mb',        fields: () => ({ file: img(), targetMB: '0.1' }) },
  { name: 'Compress 5KB',                 ep: 'compress-5kb',          fields: () => ({ file: img(), quality: '10' }) },
  { name: 'Compress 10KB',                ep: 'compress-10kb',         fields: () => ({ file: img(), quality: '10' }) },
  { name: 'Compress 15KB',                ep: 'compress-15kb',         fields: () => ({ file: img(), quality: '15' }) },
  { name: 'Compress 20KB',                ep: 'compress-20kb',         fields: () => ({ file: img(), quality: '20' }) },
  { name: 'Compress 20-50KB',             ep: 'compress-20-50kb',      fields: () => ({ file: img(), targetKB: '35' }) },
  { name: 'Compress 25KB',                ep: 'compress-25kb',         fields: () => ({ file: img(), quality: '25' }) },
  { name: 'Compress 30KB',                ep: 'compress-30kb',         fields: () => ({ file: img(), quality: '30' }) },
  { name: 'Compress 40KB',                ep: 'compress-40kb',         fields: () => ({ file: img(), quality: '40' }) },
  { name: 'Compress 50KB',                ep: 'compress-50kb',         fields: () => ({ file: img(), quality: '50' }) },
  { name: 'Compress 100KB',               ep: 'compress-100kb',        fields: () => ({ file: img(), quality: '60' }) },
  { name: 'Compress 150KB',               ep: 'compress-150kb',        fields: () => ({ file: img(), quality: '70' }) },
  { name: 'Compress 200KB',               ep: 'compress-200kb',        fields: () => ({ file: img(), quality: '75' }) },
  { name: 'Compress 300KB',               ep: 'compress-300kb',        fields: () => ({ file: img(), quality: '80' }) },
  { name: 'Compress 500KB',               ep: 'compress-500kb',        fields: () => ({ file: img(), quality: '85' }) },
  { name: 'Compress 1MB',                 ep: 'compress-1mb',          fields: () => ({ file: img(), quality: '90' }) },
  { name: 'Compress 2MB',                 ep: 'compress-2mb',          fields: () => ({ file: img(), quality: '95' }) },
  { name: 'JPG to KB Convert',            ep: 'jpg-to-kb',             fields: () => ({ file: img(), targetKB: '50' }) },
  { name: 'Convert MB to KB',             ep: 'mb-to-kb',              fields: () => ({ file: img(), targetKB: '100' }) },
  { name: 'Convert KB to MB',             ep: 'kb-to-mb',              fields: () => ({ file: img(), targetMB: '1' }) },

  // ── Conversion Tools ────────────────────────────────────────────────────────
  { name: 'WEBP to JPG',                  ep: 'webp-to-jpg',           fields: () => ({ file: img(), quality: '85' }) },
  { name: 'JPEG to PNG',                  ep: 'jpeg-to-png',           fields: () => ({ file: img(), quality: '80' }) },
  { name: 'PNG to JPEG',                  ep: 'png-to-jpeg',           fields: () => ({ file: img(), quality: '80', background: 'white' }) },
  { name: 'JPG to Text (OCR)',             ep: 'jpg-to-text',           fields: () => ({ file: img(), language: 'eng' }) },
  { name: 'PNG to Text (OCR)',             ep: 'png-to-text',           fields: () => ({ file: img(), language: 'eng' }) },
  { name: 'JPG to PDF Under 50KB',        ep: 'jpg-to-pdf-50kb',       fields: () => ({ file: img(), quality: '50', pageSize: 'A4' }) },
  { name: 'JPG to PDF Under 100KB',       ep: 'jpg-to-pdf-100kb',      fields: () => ({ file: img(), quality: '70', pageSize: 'A4' }) },
  { name: 'JPEG to PDF Under 200KB',      ep: 'jpeg-to-pdf-200kb',     fields: () => ({ file: img(), quality: '80', pageSize: 'A4' }) },
  { name: 'JPG to PDF Under 300KB',       ep: 'jpg-to-pdf-300kb',      fields: () => ({ file: img(), quality: '85', pageSize: 'A4' }) },
  { name: 'JPG to PDF Under 500KB',       ep: 'jpg-to-pdf-500kb',      fields: () => ({ file: img(), quality: '90', pageSize: 'A4' }) },
  { name: 'Image To PDF',                 ep: 'image-to-pdf',          fields: () => ({ files: img(), pageSize: 'A4', maxSize: '5000' }) },
  { name: 'Bulk Resize',                  ep: 'bulk-resize',           fields: () => ({ files: img(), width: '300', height: '200', unit: 'px', dpi: '72' }) },
  { name: 'HEIC to JPG',                  ep: 'heic-to-jpg',           fields: () => ({ file: img(), quality: '85' }) },  // Will likely fail if not HEIC
];

// ─── Main Runner ──────────────────────────────────────────────────────────────
async function runTests() {
  console.log(`\n${BOLD}${CYAN}╔═══════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║         CHUTKI - Complete Tools Test Suite                    ║${RESET}`);
  console.log(`${BOLD}${CYAN}║         Testing ALL ${TESTS.length} API endpoints one by one            ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚═══════════════════════════════════════════════════════════════╝${RESET}\n`);

  // Verify test image
  if (!fs.existsSync(TEST_IMAGE)) {
    console.error(`${RED}ERROR: Test image not found at ${TEST_IMAGE}${RESET}`);
    process.exit(1);
  }
  const imgSize = Math.round(fs.statSync(TEST_IMAGE).size / 1024);
  console.log(`${CYAN}Test image: ${TEST_IMAGE} (${imgSize}KB)${RESET}`);
  console.log(`${CYAN}Backend:    ${BASE_URL}${RESET}\n`);
  console.log('─'.repeat(70));

  for (let i = 0; i < TESTS.length; i++) {
    const test = TESTS[i];
    const num = String(i + 1).padStart(2, '0');
    process.stdout.write(`[${num}/${TESTS.length}] ${test.name.padEnd(40)} ... `);

    const start = Date.now();
    try {
      const fields = test.fields();
      const result = await callTool(test.ep, fields);
      const elapsed = Date.now() - start;

      if (result.ok) {
        const detail = result.size
          ? `(${Math.round(result.size / 1024)}KB, ${result.contentType?.split('/')[1]?.split(';')[0]})`
          : result.json
            ? `(JSON: ${JSON.stringify(result.json).slice(0, 80)})`
            : `(${result.contentType})`;
        console.log(`${GREEN}✅ PASS${RESET} ${elapsed}ms ${detail}`);
        results.passed.push({ name: test.name, ep: test.ep, elapsed });
      } else {
        const errMsg = result.error || `HTTP ${result.status}`;
        console.log(`${RED}❌ FAIL${RESET} ${elapsed}ms — ${errMsg.slice(0, 120)}`);
        results.failed.push({ name: test.name, ep: test.ep, error: errMsg, status: result.status });
      }
    } catch (err) {
      const elapsed = Date.now() - start;
      console.log(`${RED}❌ ERROR${RESET} ${elapsed}ms — ${err.message}`);
      results.failed.push({ name: test.name, ep: test.ep, error: err.message });
    }
  }

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(70));
  console.log(`${BOLD}SUMMARY${RESET}`);
  console.log('─'.repeat(70));
  console.log(`${GREEN}✅ PASSED: ${results.passed.length}${RESET}`);
  console.log(`${RED}❌ FAILED: ${results.failed.length}${RESET}`);
  console.log(`Total tested: ${TESTS.length}`);

  if (results.failed.length > 0) {
    console.log(`\n${RED}${BOLD}FAILED TOOLS:${RESET}`);
    results.failed.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.name} (/${f.ep})`);
      console.log(`     Error: ${f.error || 'HTTP ' + f.status}`);
    });
  }

  console.log('\n' + '═'.repeat(70));
  const pct = Math.round((results.passed.length / TESTS.length) * 100);
  const colour = pct === 100 ? GREEN : pct >= 80 ? YELLOW : RED;
  console.log(`${colour}${BOLD}SUCCESS RATE: ${pct}% (${results.passed.length}/${TESTS.length})${RESET}`);

  // Save results to file
  const report = {
    timestamp: new Date().toISOString(),
    total: TESTS.length,
    passed: results.passed.length,
    failed: results.failed.length,
    successRate: `${pct}%`,
    failedTools: results.failed
  };
  fs.writeFileSync('/tmp/chutki-test-report.json', JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to: /tmp/chutki-test-report.json\n`);
}

runTests().catch(console.error);
