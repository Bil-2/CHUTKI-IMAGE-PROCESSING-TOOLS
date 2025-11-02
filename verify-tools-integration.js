#!/usr/bin/env node

/**
 * Verification Script for CHUTKI Tools Integration
 * Checks that all 82 tools have proper frontend-backend integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 82 tools configuration
const ALL_TOOLS = {
  "Image Editing": [
    { name: "Passport Photo", route: "passport-photo", fields: ["size", "dpi", "background"] },
    { name: "Reduce Size KB", route: "reduce-size-kb", fields: ["targetKB"] },
    { name: "Reduce Size MB", route: "reduce-size-mb", fields: ["targetMB"] },
    { name: "Resize Pixel", route: "resize-pixel", fields: ["width", "height"] },
    { name: "Resize CM", route: "resize-cm", fields: ["width", "height", "dpi"] },
    { name: "Resize MM", route: "resize-mm", fields: ["width", "height", "dpi"] },
    { name: "Resize Inches", route: "resize-inches", fields: ["width", "height", "dpi"] },
    { name: "Resize 2x2", route: "resize-2x2", fields: [] },
    { name: "Resize 3x4", route: "resize-3x4", fields: [] },
    { name: "Resize 4x6", route: "resize-4x6", fields: [] },
    { name: "Resize 600x600", route: "resize-600x600", fields: [] },
    { name: "Resize 6x2 300DPI", route: "resize-6x2-300dpi", fields: [] },
    { name: "Resize 3.5x4.5cm", route: "resize-3-5x4-5cm", fields: [] },
    { name: "Resize 35x45mm", route: "resize-35x45mm", fields: [] },
    { name: "Resize A4", route: "resize-a4", fields: [] },
    { name: "Resize PAN", route: "resize-pan", fields: [] },
    { name: "Resize SSC", route: "resize-ssc", fields: [] },
    { name: "Resize UPSC", route: "resize-upsc", fields: [] },
    { name: "Resize Instagram", route: "resize-instagram", fields: ["format"] },
    { name: "Resize WhatsApp DP", route: "resize-whatsapp-dp", fields: [] },
    { name: "Resize YouTube Banner", route: "resize-youtube-banner", fields: [] },
    { name: "Resize Signature 50x20mm", route: "resize-sign-50x20mm", fields: [] },
    { name: "Resize Signature", route: "resize-signature", fields: ["width", "height"] },
    { name: "Bulk Resize", route: "bulk-resize", fields: ["width", "height", "unit"] },
    { name: "Generate Signature", route: "generate-signature", fields: ["enhance"] },
    { name: "Increase Size KB", route: "increase-size-kb", fields: ["targetKB"] },
  ],
  "Transform": [
    { name: "Rotate", route: "rotate", fields: ["angle"] },
    { name: "Flip", route: "flip", fields: ["direction"] },
    { name: "Grayscale", route: "grayscale", fields: [] },
    { name: "Black White", route: "black-white", fields: [] },
    { name: "Circle Crop", route: "circle-crop", fields: [] },
    { name: "Freehand Crop", route: "freehand-crop", fields: [] },
    { name: "Pixelate", route: "pixelate", fields: ["intensity"] },
    { name: "Pixelate Face", route: "pixelate-face", fields: [] },
    { name: "Blur Face", route: "blur-face", fields: [] },
    { name: "Censor", route: "censor", fields: [] },
    { name: "Pixel Art", route: "pixel-art", fields: [] },
    { name: "Watermark", route: "watermark", fields: ["text"] },
    { name: "Add Name DOB", route: "add-name-dob", fields: ["name", "dob"] },
    { name: "Remove Background", route: "remove-background", fields: [] },
    { name: "Super Resolution", route: "super-resolution", fields: [] },
    { name: "AI Face Generator", route: "ai-face-generator", fields: [] },
    { name: "Color Picker", route: "color-picker", fields: [] },
  ],
  "Format Conversion": [
    { name: "HEIC to JPG", route: "heic-to-jpg", fields: [] },
    { name: "WEBP to JPG", route: "webp-to-jpg", fields: [] },
    { name: "PNG to JPEG", route: "png-to-jpeg", fields: [] },
    { name: "JPEG to PNG", route: "jpeg-to-png", fields: [] },
    { name: "Image to PDF", route: "image-to-pdf", fields: [] },
    { name: "PDF to JPG", route: "pdf-to-jpg", fields: [] },
    { name: "JPG to PDF 50KB", route: "jpg-to-pdf-50kb", fields: [] },
    { name: "JPG to PDF 100KB", route: "jpg-to-pdf-100kb", fields: [] },
    { name: "JPG to PDF 300KB", route: "jpg-to-pdf-300kb", fields: [] },
    { name: "JPG to PDF 500KB", route: "jpg-to-pdf-500kb", fields: [] },
    { name: "JPEG to PDF 200KB", route: "jpeg-to-pdf-200kb", fields: [] },
  ],
  "Compression": [
    { name: "Compress 5KB", route: "compress-5kb", fields: [] },
    { name: "Compress 10KB", route: "compress-10kb", fields: [] },
    { name: "Compress 15KB", route: "compress-15kb", fields: [] },
    { name: "Compress 20KB", route: "compress-20kb", fields: [] },
    { name: "Compress 25KB", route: "compress-25kb", fields: [] },
    { name: "Compress 30KB", route: "compress-30kb", fields: [] },
    { name: "Compress 40KB", route: "compress-40kb", fields: [] },
    { name: "Compress 50KB", route: "compress-50kb", fields: [] },
    { name: "Compress 100KB", route: "compress-100kb", fields: [] },
    { name: "Compress 150KB", route: "compress-150kb", fields: [] },
    { name: "Compress 200KB", route: "compress-200kb", fields: [] },
    { name: "Compress 300KB", route: "compress-300kb", fields: [] },
    { name: "Compress 500KB", route: "compress-500kb", fields: [] },
    { name: "Compress 1MB", route: "compress-1mb", fields: [] },
    { name: "Compress 2MB", route: "compress-2mb", fields: [] },
    { name: "Compress 20-50KB", route: "compress-20-50kb", fields: [] },
    { name: "Image Compressor", route: "image-compressor", fields: ["quality"] },
    { name: "JPG to KB", route: "jpg-to-kb", fields: ["targetKB"] },
    { name: "KB to MB", route: "kb-to-mb", fields: [] },
    { name: "MB to KB", route: "mb-to-kb", fields: [] },
  ],
  "DPI & OCR": [
    { name: "Convert DPI", route: "convert-dpi", fields: ["dpi"] },
    { name: "Check DPI", route: "check-dpi", fields: [] },
    { name: "OCR", route: "ocr", fields: [] },
    { name: "JPG to Text", route: "jpg-to-text", fields: [] },
    { name: "PNG to Text", route: "png-to-text", fields: [] },
  ],
  "Advanced": [
    { name: "Join Images", route: "join-images", fields: ["direction"] },
    { name: "Split Image", route: "split-image", fields: ["parts"] },
    { name: "Instagram Grid", route: "instagram-grid", fields: ["rows", "cols"] },
  ]
};

console.log('🔍 Verifying CHUTKI Tools Integration...\n');

let totalTools = 0;
let verifiedTools = 0;
let missingFrontend = [];
let missingBackend = [];

// Check frontend components
const frontendToolsDir = path.join(__dirname, 'src', 'components', 'tools');
console.log('📁 Checking frontend components...');
if (fs.existsSync(frontendToolsDir)) {
  const frontendFiles = fs.readdirSync(frontendToolsDir).filter(file => file.endsWith('.jsx'));
  console.log(`✅ Found ${frontendFiles.length} frontend tool components`);
  
  // Check backend endpoints
  const backendToolsFile = path.join(__dirname, 'backend', 'api', 'unified-tools.js');
  console.log('\n🔧 Checking backend endpoints...');
  if (fs.existsSync(backendToolsFile)) {
    const backendContent = fs.readFileSync(backendToolsFile, 'utf8');
    // Extract all case statements, including those with multiple cases on one line
    const backendEndpoints = [];
    const caseLines = backendContent.match(/case '.*':/g) || [];
    caseLines.forEach(line => {
      // Handle multiple cases on one line (e.g., case 'a': case 'b': case 'c':)
      const cases = line.match(/case '[^']+'/g);
      if (cases) {
        cases.forEach(c => {
          const endpoint = c.replace(/case '|'/g, '').trim();
          if (endpoint && !backendEndpoints.includes(endpoint)) {
            backendEndpoints.push(endpoint);
          }
        });
      }
    });
    
    console.log(`✅ Found backend endpoints for tools`);
    
    // Verify each tool
    Object.entries(ALL_TOOLS).forEach(([category, tools]) => {
      console.log(`\n📂 Category: ${category}`);
      tools.forEach(tool => {
        totalTools++;
        const componentName = tool.name.replace(/[^a-zA-Z0-9]/g, '') + 'Tool';
        const fileName = `${componentName}.jsx`;
        const frontendPath = path.join(frontendToolsDir, fileName);
        
        // Check if frontend component exists
        if (fs.existsSync(frontendPath)) {
          // Check if backend endpoint exists
          if (backendEndpoints.includes(tool.route)) {
            console.log(`  ✅ ${tool.name} - Frontend and Backend OK`);
            verifiedTools++;
          } else {
            console.log(`  ❌ ${tool.name} - Frontend OK, Backend Missing`);
            missingBackend.push(tool.name);
          }
        } else {
          console.log(`  ❌ ${tool.name} - Frontend Missing`);
          missingFrontend.push(tool.name);
        }
      });
    });
  } else {
    console.log('❌ Backend tools file not found');
  }
} else {
  console.log('❌ Frontend tools directory not found');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Integration Verification Summary');
console.log('='.repeat(50));
console.log(`Total Tools: ${totalTools}`);
console.log(`✅ Verified: ${verifiedTools}`);
console.log(`❌ Missing Frontend: ${missingFrontend.length}`);
console.log(`❌ Missing Backend: ${missingBackend.length}`);

if (missingFrontend.length > 0) {
  console.log('\n📋 Missing Frontend Components:');
  missingFrontend.forEach(tool => console.log(`  - ${tool}`));
}

if (missingBackend.length > 0) {
  console.log('\n📋 Missing Backend Endpoints:');
  missingBackend.forEach(tool => console.log(`  - ${tool}`));
}

if (verifiedTools === totalTools) {
  console.log('\n🎉 All 82 tools are properly integrated between frontend and backend!');
  console.log('✨ The CHUTKI Image Processing Platform is ready for use.');
} else {
  console.log(`\n⚠️  ${totalTools - verifiedTools} tools need attention.`);
  console.log('Please check the missing components/endpoints above.');
}

process.exit(verifiedTools === totalTools ? 0 : 1);