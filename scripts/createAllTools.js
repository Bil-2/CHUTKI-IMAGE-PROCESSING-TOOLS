#!/usr/bin/env node

/**
 * Creates all 82 tool pages automatically
 * Run: node scripts/createAllTools.js
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

console.log('🚀 Starting to generate all 82 tool pages...\n');

let totalCreated = 0;
const toolsDir = path.join(__dirname, '../src/components/tools');

// Ensure tools directory exists
if (!fs.existsSync(toolsDir)) {
  fs.mkdirSync(toolsDir, { recursive: true });
}

// Generate each tool page
Object.entries(ALL_TOOLS).forEach(([category, tools]) => {
  console.log(`\n📁 Category: ${category}`);
  
  tools.forEach(tool => {
    const componentName = tool.name.replace(/[^a-zA-Z0-9]/g, '') + 'Tool';
    const fileName = `${componentName}.jsx`;
    const filePath = path.join(toolsDir, fileName);
    
    const component = generateToolComponent(tool, category);
    
    fs.writeFileSync(filePath, component);
    totalCreated++;
    console.log(`  ✅ Created: ${fileName}`);
  });
});

console.log(`\n🎉 Successfully created ${totalCreated} tool pages!`);
console.log(`📂 Location: src/components/tools/`);
console.log(`\n✅ All 82 tools are ready to use!`);

function generateToolComponent(tool, category) {
  const componentName = tool.name.replace(/[^a-zA-Z0-9]/g, '') + 'Tool';
  
  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import config from '../../config';

const ${componentName} = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({${generateDefaultFormData(tool.fields)}});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(\`\${config.API_BASE_URL}/api/tools/${tool.route}\`, {
        method: 'POST',
        headers: token ? { 'Authorization': \`Bearer \${token}\` } : {},
        body: data
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setResult(url);
        toast.success('Image processed successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Processing failed');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const a = document.createElement('a');
      a.href = result;
      a.download = '${tool.route}-' + Date.now() + '.jpg';
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mb-4 flex items-center group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">${tool.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Process your images with professional quality</p>
          <span className="inline-block mt-3 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
            ${category}
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Image
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-indigo-500 transition-colors cursor-pointer"
                />
              </div>

              {/* Preview */}
              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
                  <img src={preview} alt="Preview" className="w-full h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600" />
                </div>
              )}

              ${generateFormFields(tool.fields)}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Process Image'}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Result
            </h2>
            
            {result ? (
              <div className="space-y-6">
                <img src={result} alt="Result" className="w-full h-80 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-500">
                {loading ? (
                  <>
                    <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Processing your image...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Upload and process an image to see results here
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}

function generateDefaultFormData(fields) {
  if (!fields || fields.length === 0) return '';
  return '\n    ' + fields.map(f => `${f}: ''`).join(',\n    ') + '\n  ';
}

function generateFormFields(fields) {
  if (!fields || fields.length === 0) return '';
  
  return fields.map(field => {
    const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `
              {/* ${label} */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ${label}
                </label>
                <input
                  type="text"
                  value={formData.${field}}
                  onChange={(e) => setFormData({...formData, ${field}: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter ${label.toLowerCase()}"
                />
              </div>`;
  }).join('\n');
}
