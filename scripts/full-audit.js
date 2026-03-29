#!/usr/bin/env node
// scripts/full-audit.js - Complete CHUTKI project audit
// Tests every tool endpoint with real image upload, auth, and frontend routes

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import https from 'https';
import http from 'http';

const BASE = process.env.API || 'https://chutki-backend-bfcn.onrender.com';
const FRONTEND = 'https://chutki-image-tool.netlify.app';
const results = { pass: [], fail: [], warn: [] };

// ─── Tiny 1x1 red JPEG (for upload tests, no external deps) ──────────────────
const TINY_JPEG_B64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k=';
const TINY_JPEG = Buffer.from(TINY_JPEG_B64, 'base64');

// ─── HTTP helper ──────────────────────────────────────────────────────────────
const request = (url, options = {}) => new Promise((resolve, reject) => {
  const parsed = new URL(url);
  const lib = parsed.protocol === 'https:' ? https : http;
  const req = lib.request(url, { method: options.method || 'GET', headers: options.headers || {}, timeout: 15000 }, (res) => {
    const chunks = [];
    res.on('data', c => chunks.push(c));
    res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks), headers: res.headers }));
  });
  req.on('error', reject);
  req.on('timeout', () => { req.destroy(); reject(new Error('TIMEOUT')); });
  if (options.body) req.write(options.body);
  req.end();
});

// ─── Multipart form builder ───────────────────────────────────────────────────
const buildMultipart = (fields = {}, files = []) => {
  const boundary = '----CHUTKI_TEST_' + Date.now();
  const parts = [];
  for (const [k, v] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`
    );
  }
  for (const { name, filename, data, mime } of files) {
    parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: ${mime || 'image/jpeg'}\r\n\r\n`);
    parts.push(data);
    parts.push('\r\n');
  }
  parts.push(`--${boundary}--\r\n`);
  const body = Buffer.concat(parts.map(p => typeof p === 'string' ? Buffer.from(p) : p));
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
};

// ─── Test runner ───────────────────────────────────────────────────────────────
let pass = 0, fail = 0, warn = 0;
const log = [];

const test = async (label, fn) => {
  const start = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - start;
    if (result === 'WARN') {
      warn++;
      log.push({ status: '⚠️ WARN', label, ms });
      console.log(`  ⚠️  ${label} (${ms}ms)`);
    } else {
      pass++;
      log.push({ status: '✅ PASS', label, ms });
      console.log(`  ✅ ${label} (${ms}ms)`);
    }
  } catch (e) {
    const ms = Date.now() - start;
    fail++;
    log.push({ status: '❌ FAIL', label, ms, error: e.message });
    console.log(`  ❌ ${label} → ${e.message} (${ms}ms)`);
  }
};

// ─── Helper: POST image tool ────────────────────────────────────────────────
const postTool = async (endpoint, fields = {}, multiFile = false) => {
  const { body, contentType } = buildMultipart(fields, [
    { name: multiFile ? 'files' : 'file', filename: 'test.jpg', data: TINY_JPEG, mime: 'image/jpeg' }
  ]);
  const res = await request(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType, 'Content-Length': body.length },
    body
  });
  if (res.status >= 500) throw new Error(`HTTP ${res.status}: ${res.body.toString().slice(0,100)}`);
  if (res.status === 404) throw new Error(`HTTP 404 - Route not found`);
  return res;
};

// ─── GET helper ──────────────────────────────────────────────────────────────
const get = async (url) => {
  const res = await request(url);
  if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
  return res;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n════════════════════════════════════');
console.log(' CHUTKI FULL AUDIT - ' + new Date().toISOString());
console.log('════════════════════════════════════');

console.log('\n🔧 [1] INFRASTRUCTURE');
await test('Backend health endpoint', async () => {
  const r = await get(`${BASE}/api/health`);
  const d = JSON.parse(r.body);
  if (!d.success) throw new Error('Health returned success:false');
});

await test('Auth status endpoint', async () => {
  const r = await get(`${BASE}/api/auth/status`);
  const d = JSON.parse(r.body);
  if (d.status !== 'OK') throw new Error('Auth status not OK');
});

await test('Tools health endpoint', async () => {
  const r = await get(`${BASE}/api/tools/health`);
  // any 2xx is fine
});

await test('Netlify frontend (200)', async () => get(FRONTEND));
await test('Netlify /image-tools route (SPA routing)', async () => get(`${FRONTEND}/image-tools`));
await test('Netlify /image-editing-tools route', async () => get(`${FRONTEND}/image-editing-tools`));
await test('Netlify /image-conversion-tools route', async () => get(`${FRONTEND}/image-conversion-tools`));
await test('Netlify /image-compression-tools route', async () => get(`${FRONTEND}/image-compression-tools`));

// ═══════════════════════════════════════════════════════════════════════════════
// 2. AUTH ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n🔐 [2] AUTH ENDPOINTS');

await test('POST /api/auth/register (new user)', async () => {
  const ts = Date.now();
  const body = JSON.stringify({ name: `TestUser${ts}`, email: `test${ts}@example.com`, password: 'Test@123456' });
  const r = await request(`${BASE}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }, body
  });
  if (r.status !== 201 && r.status !== 200) throw new Error(`HTTP ${r.status}: ${r.body.toString().slice(0,150)}`);
});

await test('POST /api/auth/login (wrong password → 401)', async () => {
  const body = JSON.stringify({ email: 'fake@example.com', password: 'wrongpass' });
  const r = await request(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }, body
  });
  if (r.status !== 401 && r.status !== 400 && r.status !== 404) throw new Error(`Unexpected ${r.status}`);
});

await test('GET /api/auth/google (OAuth initiation)', async () => {
  const r = await request(`${BASE}/api/auth/google`, { method: 'GET', headers: {} });
  // Should be 302 redirect to Google OR 503 if DB not connected
  if (r.status !== 302 && r.status !== 301 && r.status !== 503) throw new Error(`HTTP ${r.status}`);
});

await test('GET /api/auth/verify-token (no token → 401)', async () => {
  const r = await request(`${BASE}/api/auth/verify-token`);
  if (r.status !== 401) throw new Error(`Expected 401, got ${r.status}`);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. COMPRESSION TOOLS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n🗜️ [3] COMPRESSION TOOLS (21 tools)');

const compressEndpoints = [
  ['/api/tools/image-compressor', { quality: '80' }],
  ['/api/tools/reduce-size-kb', { targetKB: '50' }],
  ['/api/tools/reduce-size-mb', { targetMB: '0.5' }],
  ['/api/tools/increase-size-kb', { targetKB: '500' }],
  ['/api/tools/compress-5kb'],
  ['/api/tools/compress-10kb'],
  ['/api/tools/compress-15kb'],
  ['/api/tools/compress-20kb'],
  ['/api/tools/compress-20-50kb', { targetKB: '35' }],
  ['/api/tools/compress-25kb'],
  ['/api/tools/compress-30kb'],
  ['/api/tools/compress-40kb'],
  ['/api/tools/compress-50kb'],
  ['/api/tools/compress-100kb'],
  ['/api/tools/compress-150kb'],
  ['/api/tools/compress-200kb'],
  ['/api/tools/compress-300kb'],
  ['/api/tools/compress-500kb'],
  ['/api/tools/compress-1mb'],
  ['/api/tools/compress-2mb'],
  ['/api/tools/jpg-to-kb', { targetKB: '50' }],
  ['/api/tools/mb-to-kb', { targetKB: '500' }],
  ['/api/tools/kb-to-mb', { targetMB: '1' }],
];

for (const [ep, fields = {}] of compressEndpoints) {
  await test(`${ep}`, async () => postTool(ep, fields));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. CONVERSION TOOLS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n🔄 [4] CONVERSION TOOLS (13 tools)');

const convertEndpoints = [
  ['/api/tools/heic-to-jpg', { quality: '90' }],
  ['/api/tools/webp-to-jpg', { quality: '90' }],
  ['/api/tools/jpeg-to-png'],
  ['/api/tools/png-to-jpeg', { quality: '90' }],
  ['/api/tools/jpg-to-text'],
  ['/api/tools/png-to-text'],
  ['/api/tools/jpg-to-pdf-50kb'],
  ['/api/tools/jpg-to-pdf-100kb'],
  ['/api/tools/jpeg-to-pdf-200kb'],
  ['/api/tools/jpg-to-pdf-300kb'],
  ['/api/tools/jpg-to-pdf-500kb'],
  ['/api/tools/image-to-pdf'],
  ['/api/tools/pdf-to-jpg'],
];

for (const [ep, fields = {}] of convertEndpoints) {
  await test(`${ep}`, async () => postTool(ep, fields));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. RESIZE TOOLS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n📐 [5] RESIZE TOOLS (24 tools)');

const resizeEndpoints = [
  ['/api/tools/resize-pixel', { width: '200', height: '200' }],
  ['/api/tools/resize-cm', { width: '5', height: '5', dpi: '300' }],
  ['/api/tools/resize-mm', { width: '50', height: '50', dpi: '300' }],
  ['/api/tools/resize-inches', { width: '2', height: '2', dpi: '300' }],
  ['/api/tools/resize-6x2-300dpi', { dpi: '300' }],
  ['/api/tools/resize-3-5x4-5cm', { dpi: '300' }],
  ['/api/tools/resize-35x45mm', { dpi: '300' }],
  ['/api/tools/resize-2x2', { dpi: '300' }],
  ['/api/tools/resize-4x6'],
  ['/api/tools/resize-3x4'],
  ['/api/tools/resize-600x600'],
  ['/api/tools/resize-a4', { dpi: '150' }],
  ['/api/tools/resize-ssc'],
  ['/api/tools/resize-pan'],
  ['/api/tools/resize-upsc'],
  ['/api/tools/resize-whatsapp-dp'],
  ['/api/tools/resize-instagram'],
  ['/api/tools/instagram-grid', { rows: '2', cols: '2' }],
  ['/api/tools/resize-youtube-banner'],
  ['/api/tools/super-resolution', { scale: '2' }],
  ['/api/tools/resize-signature', { width: '200', height: '50' }],
  ['/api/tools/resize-sign-50x20mm', { dpi: '300' }],
  ['/api/tools/bulk-resize', { width: '200', height: '200', unit: 'px' }, true],
  ['/api/tools/join-images', {}, true],
];

for (const [ep, fields = {}, multi = false] of resizeEndpoints) {
  await test(`${ep}`, async () => postTool(ep, fields, multi));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. EDITING TOOLS
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n✂️ [6] EDITING TOOLS (20 tools)');

const editEndpoints = [
  ['/api/tools/rotate', { angle: '90' }],
  ['/api/tools/flip', { direction: 'horizontal' }],
  ['/api/tools/watermark', { text: 'CHUTKI', opacity: '0.5' }],
  ['/api/tools/black-white'],
  ['/api/tools/grayscale'],
  ['/api/tools/circle-crop'],
  ['/api/tools/pixelate', { intensity: '10' }],
  ['/api/tools/pixelate-face', { intensity: '10' }],
  ['/api/tools/blur-face', { intensity: '15' }],
  ['/api/tools/censor', { x: '10', y: '10', width: '30', height: '30' }],
  ['/api/tools/freehand-crop', { x: '0', y: '0', width: '50', height: '50' }],
  ['/api/tools/remove-background'],
  ['/api/tools/color-picker', { x: '0', y: '0' }],
  ['/api/tools/split-image', { rows: '2', cols: '2' }],
  ['/api/tools/add-name-dob', { name: 'Test User', dob: '01-01-2000' }],
  ['/api/tools/convert-dpi', { dpi: '300' }],
  ['/api/tools/check-dpi'],
  ['/api/tools/pixel-art', { pixelSize: '5' }],
  ['/api/tools/generate-signature'],
  ['/api/tools/ai-face-generator'],
];

for (const [ep, fields = {}] of editEndpoints) {
  await test(`${ep}`, async () => postTool(ep, fields));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. PASSPORT PHOTO (special tool)
// ═══════════════════════════════════════════════════════════════════════════════
console.log('\n📸 [7] SPECIAL TOOLS');

await test('/api/tools/passport-photo-advanced', async () => 
  postTool('/api/tools/passport-photo-advanced', { size: '35x45', dpi: '300', background: 'white' })
);

// ═══════════════════════════════════════════════════════════════════════════════
// RESULTS SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
const totalPass = log.filter(l => l.status.includes('PASS')).length;
const totalFail = log.filter(l => l.status.includes('FAIL')).length;
const totalWarn = log.filter(l => l.status.includes('WARN')).length;

console.log('\n════════════════════════════════════');
console.log('           AUDIT RESULTS');
console.log('════════════════════════════════════');
console.log(`  ✅ Passed : ${totalPass}`);
console.log(`  ❌ Failed : ${totalFail}`);
console.log(`  ⚠️  Warned : ${totalWarn}`);
console.log(`  📊 Total  : ${log.length}`);
console.log(`  🎯 Score  : ${Math.round(totalPass/log.length*100)}%`);
console.log('════════════════════════════════════');

if (totalFail > 0) {
  console.log('\n❌ FAILED TESTS:');
  log.filter(l => l.status.includes('FAIL')).forEach(l => {
    console.log(`  • ${l.label}`);
    console.log(`    → ${l.error}`);
  });
}

// Write JSON report
const report = { timestamp: new Date().toISOString(), score: Math.round(totalPass/log.length*100), pass: totalPass, fail: totalFail, warn: totalWarn, results: log };
writeFileSync('/tmp/chutki-audit-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Full report: /tmp/chutki-audit-report.json');

process.exit(totalFail > 0 ? 1 : 0);
