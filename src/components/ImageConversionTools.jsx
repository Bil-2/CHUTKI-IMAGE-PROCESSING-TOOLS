// src/components/ImageConversionTools.jsx
import React from "react";
import { Link } from "react-router-dom";

const tools = [
  "HEIC to JPG", "WEBP to JPG", "JPEG to PNG", "PNG to JPEG", "JPG to Text", "PNG to Text",
  "JPG to PDF Under 50KB", "JPG to PDF Under 100KB", "JPEG to PDF Under 200KB",
  "JPG to PDF Under 300KB", "JPG to PDF Under 500KB", "Image To PDF", "PDF To JPG"
];

const ImageConversionTools = () => {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {tools.map((tool, index) => {
        const path = `/tools/${tool.replace(/\s+/g, "-").toLowerCase()}`;
        return (
          <Link
            key={index}
            to={path}
            className="p-4 bg-white shadow rounded-xl hover:bg-blue-100 transition"
          >
            {tool}
          </Link>
        );
      })}
    </div>
  );
};

export default ImageConversionTools;
