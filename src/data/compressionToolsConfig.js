// src/data/compressionToolsConfig.js
import config from '../config.js';

export const compressionToolsConfig = [
  { name: "Image Compressor", route: "/tools/image-compressor", description: "General purpose image compressor", endpoint: `${config.API_BASE_URL}/api/tools/image-compressor`, method: "POST", fields: ["file","quality"] },
  { name: "Reduce Image Size in MB", route: "/tools/reduce-size-mb", description: "Reduce image size to target MB", endpoint: `${config.API_BASE_URL}/api/tools/reduce-size-mb`, method: "POST", fields: ["file","targetMB"] },
  { name: "Compress Image To 5kb", route: "/tools/compress-5kb", description: "Compress image to exactly 5KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-5kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress JPEG To 10kb", route: "/tools/compress-10kb", description: "Compress JPEG to exactly 10KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-10kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress Image To 15kb", route: "/tools/compress-15kb", description: "Compress image to exactly 15KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-15kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress Image To 20kb", route: "/tools/compress-20kb", description: "Compress image to exactly 20KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-20kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress Image Between 20kb to 50kb", route: "/tools/compress-20-50kb", description: "Compress image between 20KB to 50KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-20-50kb`, method: "POST", fields: ["file","targetKB"] },
  { name: "Compress Image To 25kb", route: "/tools/compress-25kb", description: "Compress image to exactly 25KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-25kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress JPEG To 30kb", route: "/tools/compress-30kb", description: "Compress JPEG to exactly 30KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-30kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress JPEG To 40kb", route: "/tools/compress-40kb", description: "Compress JPEG to exactly 40KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-40kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress Image to 50kb", route: "/tools/compress-50kb", description: "Compress image to exactly 50KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-50kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress Image to 100kb", route: "/tools/compress-100kb", description: "Compress image to exactly 100KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-100kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress JPEG To 150kb", route: "/tools/compress-150kb", description: "Compress JPEG to exactly 150KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-150kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress Image To 200kb", route: "/tools/compress-200kb", description: "Compress image to exactly 200KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-200kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress JPEG To 300kb", route: "/tools/compress-300kb", description: "Compress JPEG to exactly 300KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-300kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress JPEG To 500kb", route: "/tools/compress-500kb", description: "Compress JPEG to exactly 500KB", endpoint: `${config.API_BASE_URL}/api/tools/compress-500kb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress Image To 1 MB", route: "/tools/compress-1mb", description: "Compress image to exactly 1MB", endpoint: `${config.API_BASE_URL}/api/tools/compress-1mb`, method: "POST", fields: ["file","quality"] },
  { name: "Compress Image To 2 MB", route: "/tools/compress-2mb", description: "Compress image to exactly 2MB", endpoint: `${config.API_BASE_URL}/api/tools/compress-2mb`, method: "POST", fields: ["file","quality"] },
  { name: "JPG To KB Convert", route: "/tools/jpg-to-kb", description: "Convert JPG to specific KB size", endpoint: `${config.API_BASE_URL}/api/tools/jpg-to-kb`, method: "POST", fields: ["file","targetKB"] },
  { name: "Convert Image MB To KB", route: "/tools/mb-to-kb", description: "Convert image from MB to KB size", endpoint: `${config.API_BASE_URL}/api/tools/mb-to-kb`, method: "POST", fields: ["file","targetKB"] },
  { name: "Convert Image KB To MB", route: "/tools/kb-to-mb", description: "Convert image from KB to MB size", endpoint: `${config.API_BASE_URL}/api/tools/kb-to-mb`, method: "POST", fields: ["file","targetMB"] },
];
