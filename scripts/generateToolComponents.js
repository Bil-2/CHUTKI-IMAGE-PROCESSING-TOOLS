import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tool configurations from toolsConfig.js
const toolsConfig = {
  "Image Editing Tools": [
    { name: "Passport Photo Maker", route: "passport-photo", endpoint: "passport-photo", fields: ["size", "dpi", "background", "format", "quantity"] },
    { name: "Reduce Image Size in KB", route: "reduce-size-kb", endpoint: "reduce-size-kb", fields: ["targetKB"] },
    { name: "Resize Image Pixel", route: "resize-pixel", endpoint: "resize-pixel", fields: ["width", "height", "maintain"] },
    { name: "Generate Signature", route: "generate-signature", endpoint: "generate-signature", fields: ["enhance", "background"] },
    { name: "Increase Image Size In KB", route: "increase-size-kb", endpoint: "increase-size-kb", fields: ["targetKB"] },
    { name: "Watermark Images", route: "watermark", endpoint: "watermark", fields: ["text", "position", "opacity", "color"] },
    { name: "Resize Signature", route: "resize-signature", endpoint: "resize-signature", fields: ["width", "height"] },
    { name: "Rotate Image", route: "rotate", endpoint: "rotate", fields: ["angle", "background"] },
    { name: "Flip Image", route: "flip", endpoint: "flip", fields: ["direction"] },
    { name: "Resize Image In Centimeter", route: "resize-cm", endpoint: "resize-cm", fields: ["width", "height", "dpi"] },
    { name: "Resize Image In MM", route: "resize-mm", endpoint: "resize-mm", fields: ["width", "height", "dpi"] },
    { name: "Resize Image In Inches", route: "resize-inches", endpoint: "resize-inches", fields: ["width", "height", "dpi"] },
    { name: "Convert DPI (200,300,600)", route: "convert-dpi", endpoint: "convert-dpi", fields: ["dpi"] },
    { name: "Circle Crop", route: "circle-crop", endpoint: "circle-crop", fields: ["border"] },
    { name: "Grayscale Image", route: "grayscale", endpoint: "grayscale", fields: [] },
    { name: "Remove Image Background", route: "remove-background", endpoint: "remove-background", fields: [] },
    { name: "Resize Image to 4x6", route: "resize-4x6", endpoint: "resize-4x6", fields: ["dpi"] },
    { name: "Resize Image to 3x4", route: "resize-3x4", endpoint: "resize-3x4", fields: ["dpi"] },
    { name: "Resize Image to 2x2 Inch", route: "resize-2x2", endpoint: "resize-2x2", fields: ["dpi"] },
    { name: "Resize Image to 600x600", route: "resize-600x600", endpoint: "resize-600x600", fields: [] },
    { name: "Resize Image to 35mm x 45mm", route: "resize-35x45mm", endpoint: "resize-35x45mm", fields: ["dpi"] },
    { name: "Resize Image to A4 Size", route: "resize-a4", endpoint: "resize-a4", fields: ["dpi"] },
    { name: "Resize Image For SSC", route: "resize-ssc", endpoint: "resize-ssc", fields: [] },
    { name: "Resize Image For PAN Card", route: "resize-pan", endpoint: "resize-pan", fields: [] },
    { name: "Resize Image For UPSC", route: "resize-upsc", endpoint: "resize-upsc", fields: [] },
    { name: "Resize Image for WhatsApp DP", route: "resize-whatsapp-dp", endpoint: "resize-whatsapp-dp", fields: [] },
    { name: "Resize Image for YouTube Banner", route: "resize-youtube-banner", endpoint: "resize-youtube-banner", fields: [] }
  ],
  "Image Conversion Tools": [
    { name: "HEIC to JPG", route: "heic-to-jpg", endpoint: "heic-to-jpg", fields: ["quality"] },
    { name: "WEBP to JPG", route: "webp-to-jpg", endpoint: "webp-to-jpg", fields: ["quality"] },
    { name: "JPEG to PNG", route: "jpeg-to-png", endpoint: "jpeg-to-png", fields: [] },
    { name: "PNG to JPEG", route: "png-to-jpeg", endpoint: "png-to-jpeg", fields: ["quality", "background"] },
    { name: "JPG to Text", route: "jpg-to-text", endpoint: "ocr", fields: ["language"], returnsJson: true },
    { name: "PNG to Text", route: "png-to-text", endpoint: "ocr", fields: ["language"], returnsJson: true },
    { name: "Image To PDF", route: "image-to-pdf", endpoint: "image-to-pdf", fields: ["pageSize", "maxSize"] },
    { name: "PDF To JPG", route: "pdf-to-jpg", endpoint: "pdf-to-jpg", fields: ["dpi", "quality"] }
  ],
  "Image Compression Tools": [
    { name: "Compress Image To 5kb", route: "compress-5kb", endpoint: "compress-5kb", fields: [] },
    { name: "Compress JPEG To 10kb", route: "compress-10kb", endpoint: "compress-10kb", fields: [] },
    { name: "Compress Image To 15kb", route: "compress-15kb", endpoint: "compress-15kb", fields: [] },
    { name: "Compress Image To 20kb", route: "compress-20kb", endpoint: "compress-20kb", fields: [] },
    { name: "Compress Image To 25kb", route: "compress-25kb", endpoint: "compress-25kb", fields: [] },
    { name: "Compress JPEG To 30kb", route: "compress-30kb", endpoint: "compress-30kb", fields: [] },
    { name: "Compress JPEG To 40kb", route: "compress-40kb", endpoint: "compress-40kb", fields: [] },
    { name: "Compress Image to 50kb", route: "compress-50kb", endpoint: "compress-50kb", fields: [] },
    { name: "Compress Image to 100kb", route: "compress-100kb", endpoint: "compress-100kb", fields: [] },
    { name: "Compress JPEG To 150kb", route: "compress-150kb", endpoint: "compress-150kb", fields: [] },
    { name: "Compress Image To 200kb", route: "compress-200kb", endpoint: "compress-200kb", fields: [] },
    { name: "Compress JPEG To 300kb", route: "compress-300kb", endpoint: "compress-300kb", fields: [] },
    { name: "Compress JPEG To 500kb", route: "compress-500kb", endpoint: "compress-500kb", fields: [] },
    { name: "Compress Image To 1 MB", route: "compress-1mb", endpoint: "compress-1mb", fields: [] },
    { name: "Compress Image To 2 MB", route: "compress-2mb", endpoint: "compress-2mb", fields: [] }
  ]
};

// Generate component name from tool name
const generateComponentName = (toolName) => {
  return toolName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Tool';
};

// Generate settings component based on fields
const generateSettingsComponent = (tool) => {
  const { fields, returnsJson } = tool;

  if (fields.length === 0) {
    return `
const ${generateComponentName(tool.name).replace('Tool', 'Settings')} = ({ selectedFile, loading, onSubmit }) => {
  const handleSubmit = () => {
    onSubmit({});
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Ready to Process</h3>
        <p className="text-gray-600 mb-4">
          This tool will process your image automatically with optimal settings.
        </p>
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={!selectedFile || loading}
        className={\`w-full py-4 rounded-lg font-semibold text-lg transition-all \${
          !selectedFile || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }\`}
        whileHover={!loading && selectedFile ? { scale: 1.02 } : {}}
        whileTap={!loading && selectedFile ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          'Process Image'
        )}
      </motion.button>
    </>
  );
};`;
  }

  // Generate state variables and form fields based on tool fields
  const stateVars = fields.map(field => {
    switch (field) {
      case 'quality': return `const [quality, setQuality] = useState(90);`;
      case 'width': return `const [width, setWidth] = useState('800');`;
      case 'height': return `const [height, setHeight] = useState('600');`;
      case 'dpi': return `const [dpi, setDpi] = useState('300');`;
      case 'targetKB': return `const [targetKB, setTargetKB] = useState('50');`;
      case 'angle': return `const [angle, setAngle] = useState('90');`;
      case 'direction': return `const [direction, setDirection] = useState('horizontal');`;
      case 'background': return `const [background, setBackground] = useState('white');`;
      case 'text': return `const [text, setText] = useState('WATERMARK');`;
      case 'position': return `const [position, setPosition] = useState('bottom-right');`;
      case 'opacity': return `const [opacity, setOpacity] = useState('0.5');`;
      case 'language': return `const [language, setLanguage] = useState('eng');`;
      default: return `const [${field}, set${field.charAt(0).toUpperCase() + field.slice(1)}] = useState('');`;
    }
  }).join('\n  ');

  const formFields = fields.map(field => {
    switch (field) {
      case 'quality':
        return `
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <label className="block text-sm font-medium mb-2">Quality: {quality}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full"
          />
        </div>`;
      case 'width':
      case 'height':
        return `
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <label className="block text-sm font-medium mb-2">${field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <input
            type="number"
            value={${field}}
            onChange={(e) => set${field.charAt(0).toUpperCase() + field.slice(1)}(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>`;
      case 'dpi':
        return `
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <label className="block text-sm font-medium mb-2">DPI</label>
          <select
            value={dpi}
            onChange={(e) => setDpi(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="150">150 DPI</option>
            <option value="200">200 DPI</option>
            <option value="300">300 DPI</option>
            <option value="600">600 DPI</option>
          </select>
        </div>`;
      default:
        return `
        <div className="bg-white rounded-lg p-4 shadow-lg">
          <label className="block text-sm font-medium mb-2">${field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <input
            type="text"
            value={${field}}
            onChange={(e) => set${field.charAt(0).toUpperCase() + field.slice(1)}(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>`;
    }
  }).join('\n      ');

  const formDataObject = fields.map(field => `${field}`).join(', ');

  return `
const ${generateComponentName(tool.name).replace('Tool', 'Settings')} = ({ selectedFile, loading, onSubmit }) => {
  ${stateVars}

  const handleSubmit = () => {
    const formData = { ${formDataObject} };
    onSubmit(formData);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        ${formFields}
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={!selectedFile || loading}
        className={\`w-full py-4 rounded-lg font-semibold text-lg transition-all \${
          !selectedFile || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
        }\`}
        whileHover={!loading && selectedFile ? { scale: 1.02 } : {}}
        whileTap={!loading && selectedFile ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          'Process Image'
        )}
      </motion.button>
    </>
  );
};`;
};

// Generate complete component file
const generateToolComponent = (tool) => {
  const componentName = generateComponentName(tool.name);
  const settingsComponent = generateSettingsComponent(tool);

  return `import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../shared/ToolLayout';
import config from '../../config';

${settingsComponent}

const ${componentName} = () => {
  return (
    <ToolLayout
      title="${tool.name}"
      description="Process your image with ${tool.name.toLowerCase()}"
      endpoint={\`\${config.API_BASE_URL}/api/tools/${tool.endpoint}\`}
      acceptedFormats="image/*"
      maxFileSize={10}
    >
      <${componentName.replace('Tool', 'Settings')} />
    </ToolLayout>
  );
};

export default ${componentName};
`;
};

// Generate all tool components
const generateAllComponents = () => {
  const toolsDir = path.join(__dirname, '../src/components/tools');

  // Create tools directory if it doesn't exist
  if (!fs.existsSync(toolsDir)) {
    fs.mkdirSync(toolsDir, { recursive: true });
  }

  let allTools = [];

  // Generate components for each category
  Object.entries(toolsConfig).forEach(([category, tools]) => {
    console.log(`\nGenerating ${category}:`);

    tools.forEach(tool => {
      const componentName = generateComponentName(tool.name);
      const fileName = `${componentName}.jsx`;
      const filePath = path.join(toolsDir, fileName);
      const componentCode = generateToolComponent(tool);

      fs.writeFileSync(filePath, componentCode);
      console.log(`✅ Generated: ${fileName}`);

      allTools.push({
        name: tool.name,
        route: tool.route,
        component: componentName,
        file: fileName
      });
    });
  });

  // Generate index file for easy imports
  const indexContent = allTools.map(tool =>
    `export { default as ${tool.component} } from './${tool.component}';`
  ).join('\n');

  fs.writeFileSync(path.join(toolsDir, 'index.js'), indexContent);
  console.log(`\n✅ Generated index.js with ${allTools.length} tool exports`);

  // Generate routing configuration
  const routingConfig = allTools.map(tool => ({
    path: `/tools/${tool.route}`,
    component: tool.component,
    name: tool.name
  }));

  fs.writeFileSync(
    path.join(__dirname, '../src/toolRoutes.json'),
    JSON.stringify(routingConfig, null, 2)
  );
  console.log(`✅ Generated toolRoutes.json with ${allTools.length} routes`);

  return allTools;
};

// Run the generator
console.log('[START] Starting tool component generation...');
const generatedTools = generateAllComponents();
console.log(`\n🎉 Successfully generated ${generatedTools.length} tool components!`);
