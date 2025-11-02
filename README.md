# CHUTKI - Professional Image Processing Platform

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.5.0-brightgreen.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CHUTKI is a comprehensive, AI-powered image processing web application providing 100+ professional tools for image manipulation, conversion, and optimization.

## ✨ Key Features

### 🛠️ 100+ Image Processing Tools

- **Passport Photo Generator** - Professional photos with custom dimensions
- **Smart Compression** - Exact file sizes (5KB-2MB) with binary search
- **Format Conversion** - JPEG, PNG, WebP, HEIC with quality control
- **Advanced Editing** - Rotate, flip, crop, resize with precision
- **Background Removal** - AI-powered background processing
- **OCR Text Extraction** - Extract text using Tesseract.js
- **PDF Tools** - Convert images to PDF and extract from PDF
- **Watermarking** - Text/image watermarks with position control

### 🤖 AI-Powered Assistant

- **Chutki AI Chat** - Intelligent conversation interface
- **Natural Language Processing** - Describe needs in plain English
- **Smart Recommendations** - AI suggests optimal tools and settings
- **Voice Commands** - Process images using voice input

### 🔒 Enterprise Security

- **JWT Authentication** - Secure token-based auth
- **Google OAuth** - One-click sign-in
- **Rate Limiting** - 100 req/15min, 20 uploads/15min
- **Auto File Cleanup** - Files deleted after 30 minutes
- **Input Validation** - Comprehensive security measures

## 🚀 Tech Stack

**Frontend:** React 19.1.0, Vite 7.0.4, Tailwind CSS 3.4.17, Framer Motion  
**Backend:** Node.js 18+, Express.js 4.18.2, Sharp 0.32.6, MongoDB 7.5.0  
**Security:** Helmet.js, CORS, Passport.js, Rate Limiting

## 📦 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/Bil-2/CHUTKI-IMAGE-TOOL.git
cd CHUTKI

# Install dependencies
npm install
cd backend && npm install && cd ..

# Setup environment
cd backend
cp .env.example .env
# Edit .env with your configuration

# Start development servers
# Terminal 1: Backend (Port 5001)
cd backend && npm run dev

# Terminal 2: Frontend (Port 5173)
npm run dev
```

### Environment Configuration

**Backend (.env)**

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/chutki
JWT_SECRET=your-super-secure-jwt-secret
SESSION_SECRET=your-super-secure-session-secret
GOOGLE_CLIENT_ID=your-google-client-id (optional)
GOOGLE_CLIENT_SECRET=your-google-client-secret (optional)
```

## 📡 API Documentation

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/google
```

### Image Processing

All tools use unified endpoint: `POST /api/tools/{tool-name}`

**Examples:**

```http
# Passport Photo
POST /api/tools/passport-photo
Content-Type: multipart/form-data
image: <file>, size: "2x2", dpi: 300

# Smart Compression
POST /api/tools/reduce-size-kb
Content-Type: multipart/form-data
image: <file>, targetKB: 100

# Format Conversion
POST /api/tools/heic-to-jpg
Content-Type: multipart/form-data
image: <file>, quality: 90
```

### AI Chat

```http
POST /api/ai/chat
Content-Type: application/json
{
  "message": "Compress my image to 100KB",
  "context": "previous conversation"
}
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Start backend
cd backend
NODE_ENV=production npm start
```

### Docker

```bash
docker-compose up --build
```

### Cloud Options

- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Backend:** Railway, Heroku, AWS EC2, DigitalOcean
- **Database:** MongoDB Atlas, AWS DocumentDB

### Production Environment

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chutki
CLIENT_URL=https://your-domain.com
JWT_SECRET=production-jwt-secret
SESSION_SECRET=production-session-secret
```

## 🔐 Security Features

- **Auto File Cleanup** - 30-minute retention
- **Input Validation** - Comprehensive sanitization
- **Rate Limiting** - DDoS protection
- **HTTPS Enforcement** - SSL/TLS encryption
- **File Type Validation** - Image formats only
- **Memory Processing** - No disk storage during processing

## ⚡ Performance Features

- **Binary Search Compression** - Exact target sizes
- **Sharp.js Optimization** - High-performance processing
- **Memory Management** - Efficient cleanup
- **Code Splitting** - Optimized bundles
- **CDN Ready** - Content delivery optimization

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
npm test

# E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Submit pull request

### Guidelines

- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Ensure responsive design

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📚 Support & Links

- **Issues:** [Report bugs](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues)
- **Discussions:** [Community](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/discussions)
- **API Docs:** Available at `/api/docs`

## 🗺️ Roadmap

- [ ] Advanced AI image enhancement
- [ ] Batch processing improvements
- [ ] Mobile app development
- [ ] Plugin system for custom tools
- [ ] Multi-language support
- [ ] Cloud storage integration

## 🙏 Acknowledgments

Built with **Sharp.js**, **React**, **Express.js**, **MongoDB**, and **Tailwind CSS**

---

<div align="center">

**CHUTKI** - Professional Image Processing Made Simple

[⭐ Star](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL) • [🐛 Report Bug](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues) • [💡 Request Feature](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues)

Made with ❤️ by the CHUTKI Team

</div>
