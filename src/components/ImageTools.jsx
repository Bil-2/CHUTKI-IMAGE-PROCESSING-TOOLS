import React from "react";
import { motion } from "framer-motion";

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

const ImageTools = ({ searchQuery = "" }) => {
  const lowerSearch = searchQuery.toLowerCase();

  return (
    <div className="min-h-screen px-4 py-6 bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {Object.entries(tools).map(([category, toolList]) => {
          const filteredTools = toolList.filter((tool) =>
            tool.toLowerCase().includes(lowerSearch)
          );

          // Hide category if no match
          if (filteredTools.length === 0) return null;

          return (
            <div key={category} className="mb-8">
              <h2 className="text-lg sm:text-2xl font-semibold mb-4">{category}</h2>
              <div className="flex flex-wrap gap-3">
                {filteredTools.map((tool, index) => (
                  <motion.button
                    key={`${tool}-${index}`} // ✅ Unique key
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition bg-gradient-to-br from-purple-500 to-indigo-500 text-white hover:shadow-md"
                  >
                    {tool}
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageTools;
