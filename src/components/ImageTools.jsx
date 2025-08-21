import React from "react";
import { Link } from "react-router-dom";

const tools = {
  "Image Editing Tools": [
    "Passport Photo Maker", "Reduce Image Size in KB", "Resize Image Pixel", "Generate Signature",
    "Increase Image Size In KB", "Watermark Images", "Resize Signature", "Rotate Image", "Flip Image",
    "Resize Image to 6cm x 2cm (300 DPI)", "Pi7 Bulk Image Resizer", "Resize Image In Centimeter",
    "Resize Image In MM", "Resize Image In Inches", "Add Name & DOB on Photo", "Convert DPI (200,300,600)",
    "Check Image DPI", "Resize Image (3.5cm x 4.5cm)", "Resize Sign (50mm x 20mm)",
    "Resize Image for Instagram (No Crop)", "Resize Image for WhatsApp DP", "Instagram Grid Maker",
    "Join Images In One Image", "Image Color Picker", "Split Image", "Circle Crop", "Pixelate Image",
    "Freehand Crop (Custom Selection)", "Black & White Image", "Grayscale Image",
    "Remove Image Background", "Resize Image to 4x6", "Resize Image to 3x4", "Resize Image to 2x2 Inch",
    "Resize Image to 600x600", "Resize Image to 35mm x 45mm", "Resize Image to A4 Size",
    "Resize Image For SSC", "Resize Image For PAN Card", "Resize Image For UPSC",
    "Picture to Pixel Art", "Resize Image for YouTube Banner",
    "Super Resolution (Increase Image Quality)", "AI Face Generator (This Person Not Exist)"
  ],
  "Image Conversion Tools": [
    "HEIC to JPG", "WEBP to JPG", "JPEG to PNG", "PNG to JPEG", "JPG to Text", "PNG to Text",
    "JPG to PDF Under 50KB", "JPG to PDF Under 100KB", "JPEG to PDF Under 200KB", "JPG to PDF Under 300KB",
    "JPG to PDF Under 500KB", "Image To PDF", "PDF To JPG"
  ],
  "Image Compression Tools": [
    "Image Compressor", "Reduce Image Size in MB", "Compress Image To 5kb", "Compress JPEG To 10kb",
    "Compress Image To 15kb", "Compress Image To 20kb", "Compress Image Between 20kb to 50kb",
    "Compress Image To 25kb", "Compress JPEG To 30kb", "Compress JPEG To 40kb", "Compress Image to 50kb",
    "Compress Image to 100kb", "Compress JPEG To 150kb", "Compress Image To 200kb",
    "Compress JPEG To 300kb", "Compress JPEG To 500kb", "Compress Image To 1 MB", "Compress Image To 2 MB",
    "JPG To KB", "Convert Image MB To KB", "Convert Image KB To MB"
  ]
};

const ImageTools = ({ searchQuery }) => {
  const getToolLink = (toolName) => {
    const toolNameLower = toolName.toLowerCase();

    // Special cases for tools with specific routes
    if (toolNameLower.includes("passport photo maker")) {
      return "/passport-photo";
    }
    if (toolNameLower.includes("heic to jpg")) {
      return "/tools/heic-to-jpg";
    }
    if (toolNameLower.includes("webp to jpg")) {
      return "/tools/webp-to-jpg";
    }
    if (toolNameLower.includes("jpeg to png")) {
      return "/tools/jpeg-to-png";
    }
    if (toolNameLower.includes("png to jpeg")) {
      return "/tools/png-to-jpeg";
    }

    // Default route for other tools
    return "/tools";
  };

  const filteredTools = {};

  Object.keys(tools).forEach(category => {
    const filteredCategory = tools[category].filter(tool =>
      tool.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredCategory.length > 0) {
      filteredTools[category] = filteredCategory;
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {Object.keys(filteredTools).map((category) => (
        <div key={category} className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredTools[category].map((tool, index) => (
              <Link
                key={index}
                to={getToolLink(tool)}
                className="group bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-transform duration-300">
                    {tool.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 truncate">
                      {tool}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Click to use
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(filteredTools).length === 0 && searchQuery && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No tools found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try searching for something else
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageTools;
