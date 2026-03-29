// src/data/conversionToolsConfig.js
import config from '../config.js';

export const conversionToolsConfig = [
  { name: "HEIC to JPG", route: "/tools/heic-to-jpg", description: "Convert HEIC images to JPG format", endpoint: `${config.API_BASE_URL}/api/tools/heic-to-jpg`, method: "POST", fields: ["file","quality"] },
  { name: "WEBP to JPG", route: "/tools/webp-to-jpg", description: "Convert WEBP images to JPG format", endpoint: `${config.API_BASE_URL}/api/tools/webp-to-jpg`, method: "POST", fields: ["file","quality"] },
  { name: "JPEG to PNG", route: "/tools/jpeg-to-png", description: "Convert JPEG images to PNG format", endpoint: `${config.API_BASE_URL}/api/tools/jpeg-to-png`, method: "POST", fields: ["file","quality"] },
  { name: "PNG to JPEG", route: "/tools/png-to-jpeg", description: "Convert PNG images to JPEG format", endpoint: `${config.API_BASE_URL}/api/tools/png-to-jpeg`, method: "POST", fields: ["file","quality","background"] },
  { name: "JPG to Text", route: "/tools/jpg-to-text", description: "Extract text from JPG images using OCR", endpoint: `${config.API_BASE_URL}/api/tools/jpg-to-text`, method: "POST", fields: ["file","language"], returnsJson: true },
  { name: "PNG to Text", route: "/tools/png-to-text", description: "Extract text from PNG images using OCR", endpoint: `${config.API_BASE_URL}/api/tools/png-to-text`, method: "POST", fields: ["file","language"], returnsJson: true },
  { name: "JPG to PDF Under 50KB", route: "/tools/jpg-to-pdf-50kb", description: "Convert JPG to PDF under 50KB", endpoint: `${config.API_BASE_URL}/api/tools/jpg-to-pdf-50kb`, method: "POST", fields: ["file","quality","pageSize"] },
  { name: "JPG to PDF Under 100KB", route: "/tools/jpg-to-pdf-100kb", description: "Convert JPG to PDF under 100KB", endpoint: `${config.API_BASE_URL}/api/tools/jpg-to-pdf-100kb`, method: "POST", fields: ["file","quality","pageSize"] },
  { name: "JPEG to PDF Under 200KB", route: "/tools/jpeg-to-pdf-200kb", description: "Convert JPEG to PDF under 200KB", endpoint: `${config.API_BASE_URL}/api/tools/jpeg-to-pdf-200kb`, method: "POST", fields: ["file","quality","pageSize"] },
  { name: "JPG to PDF Under 300KB", route: "/tools/jpg-to-pdf-300kb", description: "Convert JPG to PDF under 300KB", endpoint: `${config.API_BASE_URL}/api/tools/jpg-to-pdf-300kb`, method: "POST", fields: ["file","quality","pageSize"] },
  { name: "JPG to PDF Under 500KB", route: "/tools/jpg-to-pdf-500kb", description: "Convert JPG to PDF under 500KB", endpoint: `${config.API_BASE_URL}/api/tools/jpg-to-pdf-500kb`, method: "POST", fields: ["file","quality","pageSize"] },
  { name: "Image To PDF", route: "/tools/image-to-pdf", description: "Convert any image format to PDF", endpoint: `${config.API_BASE_URL}/api/tools/image-to-pdf`, method: "POST", fields: ["files","pageSize","maxSize"] },
  { name: "PDF To JPG", route: "/tools/pdf-to-jpg", description: "Convert PDF pages to JPG images", endpoint: `${config.API_BASE_URL}/api/tools/pdf-to-jpg`, method: "POST", fields: ["file","dpi","quality"] },
];
