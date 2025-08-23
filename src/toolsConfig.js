// src/toolsConfig.js
export const toolsConfig = {
  "Image Editing Tools": [
    {
      name: "Passport Photo Maker",
      route: "/passport-photo",
      description: "Generate passport photos with custom sizes and DPI",
      endpoint: "/api/passport-photo",
      method: "POST",
      fields: ["image", "size", "dpi", "background", "format", "quantity"]
    },
    {
      name: "Reduce Image Size in KB",
      route: "/tools/reduce-size-kb",
      description: "Reduce image size to target KB",
      endpoint: "/api/tools/reduce-size-kb",
      method: "POST",
      fields: ["image", "targetSize"]
    },
    {
      name: "Resize Image Pixel",
      route: "/tools/resize-pixel",
      description: "Resize image to specific pixel dimensions",
      endpoint: "/api/resize-with-dpi",
      method: "POST",
      fields: ["image", "width", "height", "dpi", "unit", "format", "background"]
    },
    {
      name: "Generate Signature",
      route: "/tools/generate-signature",
      description: "Generate signature with custom dimensions",
      endpoint: "/api/tools/generate-signature",
      method: "POST",
      fields: ["image", "width", "height", "background"]
    },
    {
      name: "Increase Image Size In KB",
      route: "/tools/increase-size-kb",
      description: "Increase image size while maintaining quality",
      endpoint: "/api/tools/super-resolution",
      method: "POST",
      fields: ["image", "scale"]
    },
    {
      name: "Watermark Images",
      route: "/tools/watermark",
      description: "Add watermark to images",
      endpoint: "/api/tools/watermark",
      method: "POST",
      fields: ["image", "watermark", "position", "opacity"]
    },
    {
      name: "Resize Signature",
      route: "/tools/resize-signature",
      description: "Resize signature to 50mm x 20mm",
      endpoint: "/api/tools/resize-signature",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Rotate Image",
      route: "/tools/rotate",
      description: "Rotate image by specified angle",
      endpoint: "/api/tools/rotate",
      method: "POST",
      fields: ["image", "angle", "background"]
    },
   {
  name: "Flip Image",
  route: "/tools/flip",
  description: "Flip image horizontally or vertically",
  endpoint: "/api/tools/flip",
  method: "POST",
  fields: ["image", "flipDirection"], // changed from direction
},
   
    {
      name: "Resize Image to 6cm x 2cm (300 DPI)",
      route: "/tools/resize-6x2cm",
      description: "Resize image to 6cm x 2cm at 300 DPI",
      endpoint: "/api/tools/resize-6x2cm",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Pi7 Bulk Image Resizer",
      route: "/tools/bulk-resize",
      description: "Resize multiple images at once",
      endpoint: "/api/tools/bulk-resize",
      method: "POST",
      fields: ["images", "width", "height", "quality", "format"]
    },
    {
      name: "Resize Image In Centimeter",
      route: "/tools/resize-cm",
      description: "Resize image using centimeter dimensions",
      endpoint: "/api/tools/resize-cm",
      method: "POST",
      fields: ["image", "width", "height", "dpi", "format"]
    },
    {
      name: "Resize Image In MM",
      route: "/tools/resize-mm",
      description: "Resize image using millimeter dimensions",
      endpoint: "/api/tools/resize-mm",
      method: "POST",
      fields: ["image", "width", "height", "dpi", "format"]
    },
    {
      name: "Resize Image In Inches",
      route: "/tools/resize-inches",
      description: "Resize image using inch dimensions",
      endpoint: "/api/tools/resize-inches",
      method: "POST",
      fields: ["image", "width", "height", "dpi", "format"]
    },
    {
      name: "Add Name & DOB on Photo",
      route: "/tools/add-text",
      description: "Add text overlay to images",
      endpoint: "/api/tools/add-text",
      method: "POST",
      fields: ["image", "text", "x", "y", "fontSize", "color"]
    },
    {
      name: "Convert DPI (200,300,600)",
      route: "/tools/convert-dpi",
      description: "Convert image DPI",
      endpoint: "/api/resize-with-dpi",
      method: "POST",
      fields: ["image", "dpi", "unit", "format"]
    },
    {
      name: "Check Image DPI",
      route: "/tools/check-dpi",
      description: "Check current image DPI",
      endpoint: "/api/tools/check-dpi",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image (3.5cm x 4.5cm)",
      route: "/tools/resize-35x45mm",
      description: "Resize image to 3.5cm x 4.5cm",
      endpoint: "/api/tools/resize-35x45mm",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image for Instagram (No Crop)",
      route: "/tools/resize-instagram",
      description: "Resize image for Instagram",
      endpoint: "/api/tools/resize-instagram",
      method: "POST",
      fields: ["image", "aspect"]
    },
    {
      name: "Resize Image for WhatsApp DP",
      route: "/tools/resize-whatsapp-dp",
      description: "Resize image for WhatsApp profile picture",
      endpoint: "/api/tools/resize-whatsapp-dp",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Instagram Grid Maker",
      route: "/tools/instagram-grid",
      description: "Create Instagram grid layouts",
      endpoint: "/api/tools/instagram-grid",
      method: "POST",
      fields: ["images", "gridSize"]
    },
   {
  name: "Join Images In One Image",
  route: "/tools/join-images",
  description: "Join multiple images into one",
  endpoint: "/api/tools/join-images",
  method: "POST",
  fields: ["images", "joinDirection", "spacing"], // changed from direction
},
    {
      name: "Image Color Picker",
      route: "/tools/color-picker",
      description: "Pick colors from images",
      endpoint: "/api/tools/color-picker",
      method: "POST",
      fields: ["image", "x", "y"]
    },
    {
      name: "Split Image",
      route: "/tools/split-image",
      description: "Split image into grid",
      endpoint: "/api/tools/split-image",
      method: "POST",
      fields: ["image", "rows", "cols"]
    },
    {
      name: "Circle Crop",
      route: "/tools/circle-crop",
      description: "Crop image to circle shape",
      endpoint: "/api/tools/circle-crop",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Pixelate Image",
      route: "/tools/pixelate",
      description: "Create pixelated effect",
      endpoint: "/api/tools/pixelate",
      method: "POST",
      fields: ["image", "pixelSize"]
    },
    {
      name: "Freehand Crop (Custom Selection)",
      route: "/tools/freehand-crop",
      description: "Custom crop selection",
      endpoint: "/api/tools/freehand-crop",
      method: "POST",
      fields: ["image", "x", "y", "width", "height"]
    },
    {
      name: "Black & White Image",
      route: "/tools/black-white",
      description: "Convert to black and white",
      endpoint: "/api/tools/black-white",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Grayscale Image",
      route: "/tools/grayscale",
      description: "Convert to grayscale",
      endpoint: "/api/tools/grayscale",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Remove Image Background",
      route: "/tools/remove-background",
      description: "Remove image background",
      endpoint: "/api/remove-background",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image to 4x6",
      route: "/tools/resize-4x6",
      description: "Resize image to 4x6 inches",
      endpoint: "/api/tools/resize-4x6",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image to 3x4",
      route: "/tools/resize-3x4",
      description: "Resize image to 3x4 inches",
      endpoint: "/api/tools/resize-3x4",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image to 2x2 Inch",
      route: "/tools/resize-2x2",
      description: "Resize image to 2x2 inches",
      endpoint: "/api/tools/resize-2x2",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image to 600x600",
      route: "/tools/resize-600x600",
      description: "Resize image to 600x600 pixels",
      endpoint: "/api/tools/resize-600x600",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image to 35mm x 45mm",
      route: "/tools/resize-35x45mm",
      description: "Resize image to 35mm x 45mm",
      endpoint: "/api/tools/resize-35x45mm",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image to A4 Size",
      route: "/tools/resize-a4",
      description: "Resize image to A4 dimensions",
      endpoint: "/api/tools/resize-a4",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image For SSC",
      route: "/tools/resize-ssc",
      description: "Resize image for SSC documents",
      endpoint: "/api/tools/resize-ssc",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image For PAN Card",
      route: "/tools/resize-pan-card",
      description: "Resize image for PAN card",
      endpoint: "/api/tools/resize-pan-card",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Resize Image For UPSC",
      route: "/tools/resize-upsc",
      description: "Resize image for UPSC documents",
      endpoint: "/api/tools/resize-upsc",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Picture to Pixel Art",
      route: "/tools/pixel-art",
      description: "Convert image to pixel art",
      endpoint: "/api/tools/pixel-art",
      method: "POST",
      fields: ["image", "pixelSize"]
    },
    {
      name: "Resize Image for YouTube Banner",
      route: "/tools/resize-youtube-banner",
      description: "Resize image for YouTube banner",
      endpoint: "/api/tools/resize-youtube-banner",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Super Resolution (Increase Image Quality)",
      route: "/tools/super-resolution",
      description: "Increase image resolution",
      endpoint: "/api/tools/super-resolution",
      method: "POST",
      fields: ["image", "scale"]
    },
    {
      name: "AI Face Generator (This Person Not Exist)",
      route: "/tools/ai-face",
      description: "Generate AI faces",
      endpoint: "/api/tools/ai-face",
      method: "POST",
      fields: []
    }
  ],
  "Image Conversion Tools": [
    {
      name: "HEIC to JPG",
      route: "/tools/heic-to-jpg",
      description: "Convert HEIC to JPG format",
      endpoint: "/api/convert/heic-to-jpg",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "WEBP to JPG",
      route: "/tools/webp-to-jpg",
      description: "Convert WEBP to JPG format",
      endpoint: "/api/convert/webp-to-jpg",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "JPEG to PNG",
      route: "/tools/jpeg-to-png",
      description: "Convert JPEG to PNG format",
      endpoint: "/api/convert/jpeg-to-png",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "PNG to JPEG",
      route: "/tools/png-to-jpeg",
      description: "Convert PNG to JPEG format",
      endpoint: "/api/convert/png-to-jpeg",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "JPG to Text",
      route: "/tools/jpg-to-text",
      description: "Extract text from JPG images (OCR)",
      endpoint: "/api/ocr",
      method: "POST",
      fields: ["image", "lang"]
    },
    {
      name: "PNG to Text",
      route: "/tools/png-to-text",
      description: "Extract text from PNG images (OCR)",
      endpoint: "/api/ocr",
      method: "POST",
      fields: ["image", "lang"]
    },
    {
      name: "JPG to PDF Under 50KB",
      route: "/tools/jpg-to-pdf-50kb",
      description: "Convert JPG to PDF under 50KB",
      endpoint: "/api/convert/jpg-to-pdf",
      method: "POST",
      fields: ["image"],
      query: { limit: 50 }
    },
    {
      name: "JPG to PDF Under 100KB",
      route: "/tools/jpg-to-pdf-100kb",
      description: "Convert JPG to PDF under 100KB",
      endpoint: "/api/convert/jpg-to-pdf",
      method: "POST",
      fields: ["image"],
      query: { limit: 100 }
    },
    {
      name: "JPEG to PDF Under 200KB",
      route: "/tools/jpeg-to-pdf-200kb",
      description: "Convert JPEG to PDF under 200KB",
      endpoint: "/api/convert/jpg-to-pdf",
      method: "POST",
      fields: ["image"],
      query: { limit: 200 }
    },
    {
      name: "JPG to PDF Under 300KB",
      route: "/tools/jpg-to-pdf-300kb",
      description: "Convert JPG to PDF under 300KB",
      endpoint: "/api/convert/jpg-to-pdf",
      method: "POST",
      fields: ["image"],
      query: { limit: 300 }
    },
    {
      name: "JPG to PDF Under 500KB",
      route: "/tools/jpg-to-pdf-500kb",
      description: "Convert JPG to PDF under 500KB",
      endpoint: "/api/convert/jpg-to-pdf",
      method: "POST",
      fields: ["image"],
      query: { limit: 500 }
    },
    {
      name: "Image To PDF",
      route: "/tools/image-to-pdf",
      description: "Convert multiple images to PDF",
      endpoint: "/api/convert/image-to-pdf",
      method: "POST",
      fields: ["images", "pageSize", "margin"]
    },
    {
      name: "PDF To JPG",
      route: "/tools/pdf-to-jpg",
      description: "Convert PDF pages to JPG images",
      endpoint: "/api/convert/pdf-to-jpg",
      method: "POST",
      fields: ["pdf"]
    }
  ],
  "Image Compression Tools": [
    {
      name: "Image Compressor",
      route: "/tools/compress-image",
      description: "Compress image with quality control",
      endpoint: "/api/compress-image",
      method: "POST",
      fields: ["image", "quality", "maxSize", "format"]
    },
    {
      name: "Reduce Image Size in MB",
      route: "/tools/reduce-size-mb",
      description: "Reduce image size to target MB",
      endpoint: "/api/tools/reduce-size-mb",
      method: "POST",
      fields: ["image", "targetSize"]
    },
    {
      name: "Compress Image To 5kb",
      route: "/tools/compress-to-5kb",
      description: "Compress image to 5KB",
      endpoint: "/api/tools/compress-to-5kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress JPEG To 10kb",
      route: "/tools/compress-to-10kb",
      description: "Compress JPEG to 10KB",
      endpoint: "/api/tools/compress-to-10kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image To 15kb",
      route: "/tools/compress-to-15kb",
      description: "Compress image to 15KB",
      endpoint: "/api/tools/compress-to-15kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image To 20kb",
      route: "/tools/compress-to-20kb",
      description: "Compress image to 20KB",
      endpoint: "/api/tools/compress-to-20kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image Between 20kb to 50kb",
      route: "/tools/compress-20-50kb",
      description: "Compress image between 20-50KB",
      endpoint: "/api/tools/compress-20-50kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image To 25kb",
      route: "/tools/compress-to-25kb",
      description: "Compress image to 25KB",
      endpoint: "/api/tools/compress-to-25kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress JPEG To 30kb",
      route: "/tools/compress-to-30kb",
      description: "Compress JPEG to 30KB",
      endpoint: "/api/tools/compress-to-30kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress JPEG To 40kb",
      route: "/tools/compress-to-40kb",
      description: "Compress JPEG to 40KB",
      endpoint: "/api/tools/compress-to-40kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image to 50kb",
      route: "/tools/compress-to-50kb",
      description: "Compress image to 50KB",
      endpoint: "/api/tools/compress-to-50kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image to 100kb",
      route: "/tools/compress-to-100kb",
      description: "Compress image to 100KB",
      endpoint: "/api/tools/compress-to-100kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress JPEG To 150kb",
      route: "/tools/compress-to-150kb",
      description: "Compress JPEG to 150KB",
      endpoint: "/api/tools/compress-to-150kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image To 200kb",
      route: "/tools/compress-to-200kb",
      description: "Compress image to 200KB",
      endpoint: "/api/tools/compress-to-200kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress JPEG To 300kb",
      route: "/tools/compress-to-300kb",
      description: "Compress JPEG to 300KB",
      endpoint: "/api/tools/compress-to-300kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress JPEG To 500kb",
      route: "/tools/compress-to-500kb",
      description: "Compress JPEG to 500KB",
      endpoint: "/api/tools/compress-to-500kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image To 1 MB",
      route: "/tools/compress-to-1mb",
      description: "Compress image to 1MB",
      endpoint: "/api/tools/compress-to-1mb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Compress Image To 2 MB",
      route: "/tools/compress-to-2mb",
      description: "Compress image to 2MB",
      endpoint: "/api/tools/compress-to-2mb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "JPG To KB",
      route: "/tools/jpg-to-kb",
      description: "Get JPG file size in KB",
      endpoint: "/api/tools/jpg-to-kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Convert Image MB To KB",
      route: "/tools/convert-mb-to-kb",
      description: "Convert image size from MB to KB",
      endpoint: "/api/tools/convert-mb-to-kb",
      method: "POST",
      fields: ["image"]
    },
    {
      name: "Convert Image KB To MB",
      route: "/tools/convert-kb-to-mb",
      description: "Convert image size from KB to MB",
      endpoint: "/api/tools/convert-kb-to-mb",
      method: "POST",
      fields: ["image"]
    }
  ],
  "AI Tools": [
    {
      name: "AI Image Captioning",
      route: "/tools/ai-caption",
      description: "Generate AI captions for images",
      endpoint: "/api/ai/caption",
      method: "POST",
      fields: ["image", "prompt"]
    }
  ]
};

// Helper function to get tool by name
export const getToolByName = (name) => {
  for (const category of Object.values(toolsConfig)) {
    const tool = category.find(t => t.name === name);
    if (tool) return tool;
  }
  return null;
};

// Helper function to get all tools
export const getAllTools = () => {
  const allTools = [];
  for (const category of Object.values(toolsConfig)) {
    allTools.push(...category);
  }
  return allTools;
};

// Helper function to search tools
export const searchTools = (query) => {
  const allTools = getAllTools();
  const lowercaseQuery = query.toLowerCase();
  return allTools.filter(tool =>
    tool.name.toLowerCase().includes(lowercaseQuery) ||
    tool.description.toLowerCase().includes(lowercaseQuery)
  );
};
