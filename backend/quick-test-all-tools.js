import fetch from 'node-fetch';
import FormData from 'form-data';
import { createCanvas } from 'canvas';

const BASE_URL = 'http://localhost:5001';

// Test all tools - one test per tool (ALL 82 TOOLS)
const ALL_TOOLS = [
  { name: 'Passport Photo', endpoint: '/api/tools/passport-photo', params: { size: '2x2', dpi: '300' } },
  { name: 'Reduce Size KB', endpoint: '/api/tools/reduce-size-kb', params: { targetKB: 100 } },
  { name: 'Reduce Size MB', endpoint: '/api/tools/reduce-size-mb', params: { targetMB: 1 } },
  { name: 'Resize Pixel', endpoint: '/api/tools/resize-pixel', params: { width: 800, height: 600 } },
  { name: 'Resize CM', endpoint: '/api/tools/resize-cm', params: { width: 10, height: 15 } },
  { name: 'Resize MM', endpoint: '/api/tools/resize-mm', params: { width: 100, height: 150 } },
  { name: 'Resize Inches', endpoint: '/api/tools/resize-inches', params: { width: 4, height: 6 } },
  { name: 'Resize 2x2', endpoint: '/api/tools/resize-2x2', params: {} },
  { name: 'Resize 3x4', endpoint: '/api/tools/resize-3x4', params: {} },
  { name: 'Resize 4x6', endpoint: '/api/tools/resize-4x6', params: {} },
  { name: 'Resize 600x600', endpoint: '/api/tools/resize-600x600', params: {} },
  { name: 'Resize 6x2 300DPI', endpoint: '/api/tools/resize-6x2-300dpi', params: {} },
  { name: 'Resize 3.5x4.5cm', endpoint: '/api/tools/resize-3-5x4-5cm', params: {} },
  { name: 'Resize 35x45mm', endpoint: '/api/tools/resize-35x45mm', params: {} },
  { name: 'Resize A4', endpoint: '/api/tools/resize-a4', params: {} },
  { name: 'Resize PAN', endpoint: '/api/tools/resize-pan', params: {} },
  { name: 'Resize SSC', endpoint: '/api/tools/resize-ssc', params: {} },
  { name: 'Resize UPSC', endpoint: '/api/tools/resize-upsc', params: {} },
  { name: 'Resize Instagram', endpoint: '/api/tools/resize-instagram', params: { format: 'square' } },
  { name: 'Resize WhatsApp DP', endpoint: '/api/tools/resize-whatsapp-dp', params: {} },
  { name: 'Resize YouTube Banner', endpoint: '/api/tools/resize-youtube-banner', params: {} },
  { name: 'Resize Signature 50x20mm', endpoint: '/api/tools/resize-sign-50x20mm', params: {} },
  { name: 'Resize Signature', endpoint: '/api/tools/resize-signature', params: { width: 200, height: 80 } },
  { name: 'Bulk Resize', endpoint: '/api/tools/bulk-resize', params: { width: 800, height: 600, unit: 'px' } },
  { name: 'Generate Signature', endpoint: '/api/tools/generate-signature', params: { enhance: 'true' } },
  { name: 'Increase Size KB', endpoint: '/api/tools/increase-size-kb', params: { targetKB: 500 } },
  { name: 'Rotate', endpoint: '/api/tools/rotate', params: { angle: 90 } },
  { name: 'Flip', endpoint: '/api/tools/flip', params: { direction: 'horizontal' } },
  { name: 'Grayscale', endpoint: '/api/tools/grayscale', params: {} },
  { name: 'Black & White', endpoint: '/api/tools/black-white', params: {} },
  { name: 'Circle Crop', endpoint: '/api/tools/circle-crop', params: {} },
  { name: 'Freehand Crop', endpoint: '/api/tools/freehand-crop', params: {} },
  { name: 'Pixelate', endpoint: '/api/tools/pixelate', params: { intensity: 10 } },
  { name: 'Pixelate Face', endpoint: '/api/tools/pixelate-face', params: {} },
  { name: 'Blur Face', endpoint: '/api/tools/blur-face', params: {} },
  { name: 'Censor', endpoint: '/api/tools/censor', params: {} },
  { name: 'Pixel Art', endpoint: '/api/tools/pixel-art', params: {} },
  { name: 'Watermark', endpoint: '/api/tools/watermark', params: { text: 'TEST' } },
  { name: 'Add Name & DOB', endpoint: '/api/tools/add-name-dob', params: { name: 'Test', dob: '01/01/2000' } },
  { name: 'Remove Background', endpoint: '/api/tools/remove-background', params: {} },
  { name: 'Super Resolution', endpoint: '/api/tools/super-resolution', params: {} },
  { name: 'AI Face Generator', endpoint: '/api/tools/ai-face-generator', params: {} },
  { name: 'Color Picker', endpoint: '/api/tools/color-picker', params: {} },
  { name: 'HEIC to JPG', endpoint: '/api/tools/heic-to-jpg', params: {} },
  { name: 'WEBP to JPG', endpoint: '/api/tools/webp-to-jpg', params: {} },
  { name: 'PNG to JPEG', endpoint: '/api/tools/png-to-jpeg', params: {} },
  { name: 'JPEG to PNG', endpoint: '/api/tools/jpeg-to-png', params: {} },
  { name: 'Image to PDF', endpoint: '/api/tools/image-to-pdf', params: {} },
  { name: 'PDF to JPG', endpoint: '/api/tools/pdf-to-jpg', params: {} },
  { name: 'JPG to PDF 50KB', endpoint: '/api/tools/jpg-to-pdf-50kb', params: {} },
  { name: 'JPG to PDF 100KB', endpoint: '/api/tools/jpg-to-pdf-100kb', params: {} },
  { name: 'JPG to PDF 300KB', endpoint: '/api/tools/jpg-to-pdf-300kb', params: {} },
  { name: 'JPG to PDF 500KB', endpoint: '/api/tools/jpg-to-pdf-500kb', params: {} },
  { name: 'JPEG to PDF 200KB', endpoint: '/api/tools/jpeg-to-pdf-200kb', params: {} },
  { name: 'Compress 5KB', endpoint: '/api/tools/compress-5kb', params: {} },
  { name: 'Compress 10KB', endpoint: '/api/tools/compress-10kb', params: {} },
  { name: 'Compress 15KB', endpoint: '/api/tools/compress-15kb', params: {} },
  { name: 'Compress 20KB', endpoint: '/api/tools/compress-20kb', params: {} },
  { name: 'Compress 25KB', endpoint: '/api/tools/compress-25kb', params: {} },
  { name: 'Compress 30KB', endpoint: '/api/tools/compress-30kb', params: {} },
  { name: 'Compress 40KB', endpoint: '/api/tools/compress-40kb', params: {} },
  { name: 'Compress 50KB', endpoint: '/api/tools/compress-50kb', params: {} },
  { name: 'Compress 100KB', endpoint: '/api/tools/compress-100kb', params: {} },
  { name: 'Compress 150KB', endpoint: '/api/tools/compress-150kb', params: {} },
  { name: 'Compress 200KB', endpoint: '/api/tools/compress-200kb', params: {} },
  { name: 'Compress 300KB', endpoint: '/api/tools/compress-300kb', params: {} },
  { name: 'Compress 500KB', endpoint: '/api/tools/compress-500kb', params: {} },
  { name: 'Compress 1MB', endpoint: '/api/tools/compress-1mb', params: {} },
  { name: 'Compress 2MB', endpoint: '/api/tools/compress-2mb', params: {} },
  { name: 'Compress 20-50KB', endpoint: '/api/tools/compress-20-50kb', params: {} },
  { name: 'Image Compressor', endpoint: '/api/tools/image-compressor', params: { quality: 80 } },
  { name: 'JPG to KB', endpoint: '/api/tools/jpg-to-kb', params: { targetKB: 100 } },
  { name: 'KB to MB', endpoint: '/api/tools/kb-to-mb', params: {} },
  { name: 'MB to KB', endpoint: '/api/tools/mb-to-kb', params: {} },
  { name: 'Convert DPI', endpoint: '/api/tools/convert-dpi', params: { dpi: 300 } },
  { name: 'Check DPI', endpoint: '/api/tools/check-dpi', params: {} },
  { name: 'OCR', endpoint: '/api/tools/ocr', params: {} },
  { name: 'JPG to Text', endpoint: '/api/tools/jpg-to-text', params: {} },
  { name: 'PNG to Text', endpoint: '/api/tools/png-to-text', params: {} },
  { name: 'Join Images', endpoint: '/api/tools/join-images', params: { direction: 'horizontal' } },
  { name: 'Split Image', endpoint: '/api/tools/split-image', params: { parts: 4 } },
  { name: 'Instagram Grid', endpoint: '/api/tools/instagram-grid', params: { rows: 3, cols: 3 } },
];

function createTestImage() {
  const canvas = createCanvas(1000, 750);
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, 1000, 750);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 750);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CHUTKI TEST', 500, 375);
  
  return canvas.toBuffer('image/jpeg');
}

async function testTool(tool) {
  try {
    const formData = new FormData();
    formData.append('file', createTestImage(), { 
      filename: 'test.jpg', 
      contentType: 'image/jpeg' 
    });
    
    Object.entries(tool.params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    const response = await fetch(`${BASE_URL}${tool.endpoint}`, {
      method: 'POST',
      body: formData,
      timeout: 10000
    });
    
    return {
      name: tool.name,
      success: response.ok,
      status: response.status,
      error: response.ok ? null : await response.text()
    };
  } catch (error) {
    return {
      name: tool.name,
      success: false,
      status: 0,
      error: error.message
    };
  }
}

async function runQuickTest() {
  console.log('\n' + '='.repeat(100));
  console.log('[QUICK TEST] Testing All Tools - 1 Test Per Tool');
  console.log('='.repeat(100) + '\n');
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  for (const tool of ALL_TOOLS) {
    process.stdout.write(`Testing ${tool.name}... `);
    const result = await testTool(tool);
    results.push(result);
    
    if (result.success) {
      console.log('✅ PASS');
      successCount++;
    } else {
      console.log(`❌ FAIL (${result.status}): ${result.error}`);
      failureCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(100));
  console.log('[RESULTS] Quick Test Completed');
  console.log('='.repeat(100));
  console.log(`Total Tools Tested: ${ALL_TOOLS.length}`);
  console.log(`✅ Passed: ${successCount} (${((successCount/ALL_TOOLS.length)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log('='.repeat(100));
  
  if (failureCount > 0) {
    console.log('\n❌ FAILED TOOLS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  } else {
    console.log('\n🎉 ALL TOOLS WORKING PERFECTLY! 100% SUCCESS RATE!');
  }
  
  console.log('\n');
  process.exit(failureCount > 0 ? 1 : 0);
}

runQuickTest().catch(error => {
  console.error('[ERROR] Test failed:', error);
  process.exit(1);
});
