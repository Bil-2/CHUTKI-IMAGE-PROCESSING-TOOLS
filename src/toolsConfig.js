// src/toolsConfig.js

export const tools = [
  { title: "HEIC to JPG", slug: "heic-to-jpg", apiEndpoint: "/api/convert/heic-to-jpg" },
  { title: "WEBP to JPG", slug: "webp-to-jpg", apiEndpoint: "/api/convert/webp-to-jpg" },
  { title: "JPEG to PNG", slug: "jpeg-to-png", apiEndpoint: "/api/convert/jpeg-to-png" },
  { title: "PNG to JPEG", slug: "png-to-jpeg", apiEndpoint: "/api/convert/png-to-jpeg" },
  { title: "JPG to Text", slug: "jpg-to-text", apiEndpoint: "/api/convert/jpg-to-text" },
  { title: "PNG to Text", slug: "png-to-text", apiEndpoint: "/api/convert/png-to-text" },
  { title: "JPG to PDF Under 50KB", slug: "jpg-to-pdf-under-50kb", apiEndpoint: "/api/convert/jpg-to-pdf?limit=50" },
  { title: "JPG to PDF Under 100KB", slug: "jpg-to-pdf-under-100kb", apiEndpoint: "/api/convert/jpg-to-pdf?limit=100" },
  { title: "JPEG to PDF Under 200KB", slug: "jpeg-to-pdf-under-200kb", apiEndpoint: "/api/convert/jpeg-to-pdf?limit=200" },
  { title: "JPG to PDF Under 300KB", slug: "jpg-to-pdf-under-300kb", apiEndpoint: "/api/convert/jpg-to-pdf?limit=300" },
  { title: "JPG to PDF Under 500KB", slug: "jpg-to-pdf-under-500kb", apiEndpoint: "/api/convert/jpg-to-pdf?limit=500" },
  { title: "Image To PDF", slug: "image-to-pdf", apiEndpoint: "/api/convert/image-to-pdf" },
  { title: "PDF To JPG", slug: "pdf-to-jpg", apiEndpoint: "/api/convert/pdf-to-jpg" },
];
