# CHUTKI - AI-Powered Image Processing Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Professional image processing web application with 82+ tools for manipulation, conversion, and optimization.

## 🌐 **LIVE APPLICATION**

### 🚀 **[Try CHUTKI Now →](https://chutki-image-processing-tools.netlify.app)**

- **Frontend:** https://chutki-image-processing-tools.netlify.app
- **Backend API:** https://chutki-image-processing-tools.onrender.com
- **Status:** ✅ LIVE & OPERATIONAL | 82 Tools Active

## ✨ Features

### 🛠️ Image Processing Tools (82+)

- **Passport Photos** - Professional dimensions & DPI
- **Smart Compression** - Exact file sizes (5KB-2MB)
- **Format Conversion** - JPEG, PNG, WebP, HEIC
- **Advanced Editing** - Rotate, flip, crop, resize
- **Background Removal** - AI-powered processing
- **OCR Text Extraction** - Tesseract.js integration
- **PDF Tools** - Convert & extract images
- **Watermarking** - Text/image overlays

### 🤖 AI Assistant

- **Smart Chat** - Natural language processing
- **Tool Recommendations** - AI-powered suggestions
- **Voice Commands** - Speech-to-action processing

### 🔒 Security & Performance

- **JWT + Google OAuth** - Secure authentication
- **Rate Limiting** - DDoS protection
- **Auto Cleanup** - 30-minute file retention
- **Memory Processing** - No disk storage
- **HTTPS/SSL** - End-to-end encryption

## 🚀 Tech Stack

**Frontend:** React 19, Vite 7, Tailwind CSS, Framer Motion  
**Backend:** Node.js, Express.js, Sharp.js, MongoDB Atlas  
**Security:** Helmet.js, CORS, Passport.js, Rate Limiting  
**Deployment:** Netlify (Frontend), Render (Backend)

## 📦 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)

### Installation

```bash
# Clone & install
git clone https://github.com/Bil-2/CHUTKI-IMAGE-TOOL.git
cd CHUTKI
npm install
cd backend && npm install && cd ..

# Environment setup
cd backend && cp .env.example .env
# Edit .env with your configuration

# Start development
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

### Environment Variables

```env
# Backend (.env)
PORT=5001
MONGODB_URI=mongodb://localhost:27017/chutki
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=optional
GOOGLE_CLIENT_SECRET=optional
```

## 📡 API Reference

### Authentication

```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/google      # Google OAuth
POST /api/auth/logout      # User logout
```

### Image Processing

```http
POST /api/tools/{tool-name}
Content-Type: multipart/form-data

# Examples:
/api/tools/passport-photo     # Generate passport photos
/api/tools/reduce-size-kb     # Compress to exact KB
/api/tools/heic-to-jpg        # Format conversion
/api/tools/remove-background  # AI background removal
```

### AI Chat

```http
POST /api/ai/chat
{
  "message": "Compress my image to 100KB",
  "context": "previous conversation"
}
```

## 🚀 Deployment

### Production Build

```bash
npm run build                    # Build frontend
cd backend && npm start          # Start backend
```

### Docker

```bash
docker-compose up --build
```

### Cloud Deployment

- **Frontend:** Netlify (recommended)
- **Backend:** Render (recommended), Railway, Heroku
- **Database:** MongoDB Atlas (recommended)

## 🔧 Available Tools

### Compression & Optimization

- Reduce Size (5KB-2MB) | Compress 50KB | Compress 100KB | Compress 200KB
- Image Compressor | JPG to KB | KB to MB Converter

### Format Conversion

- HEIC to JPG | WEBP to JPG | PNG to JPEG | JPEG to PNG
- Image to PDF | PDF to JPG | Multiple PDF sizes

### Photo Enhancement

- Passport Photo Maker | Generate Signature | Add Watermark
- Circle Crop | Grayscale | Black & White | Pixelate

### Advanced Processing

- Remove Background | Super Resolution | OCR Text Extraction
- Join Images | Split Image | Instagram Grid | Color Picker

### Resize & Transform

- Resize (Pixel/CM/MM/Inches) | Rotate Image | Flip Image
- Convert DPI | Check DPI | Increase Size KB

## 🧪 Testing

```bash
cd backend && npm test           # Backend tests
npm test                         # Frontend tests
npm run test:e2e                 # End-to-end tests
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push branch: `git push origin feature/name`
5. Submit pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- **Live App:** [chutki-image-processing-tools.netlify.app](https://chutki-image-processing-tools.netlify.app)
- **Issues:** [Report Bugs](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues)
- **Discussions:** [Community](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/discussions)

## 🗺️ Roadmap

- [ ] Advanced AI enhancement
- [ ] Batch processing
- [ ] Mobile app
- [ ] Plugin system
- [ ] Multi-language support

---

<div align="center">

**CHUTKI** - Professional Image Processing Made Simple

[⭐ Star](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL) • [🐛 Report Bug](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues) • [💡 Feature Request](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues)

Made with ❤️ by the CHUTKI Team

</div>
