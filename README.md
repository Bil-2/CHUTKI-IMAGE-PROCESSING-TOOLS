# CHUTKI - Professional Image Processing Platform 

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.5.0-brightgreen.svg)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

CHUTKI is a comprehensive, AI-powered image processing web application that provides 100+ professional tools for image manipulation, conversion, and optimization. Built with modern React frontend and robust Express.js backend.

## Key Features

### 100+ Image Processing Tools
- **Passport Photo Generator** - Professional passport photos with multiple copies and custom dimensions
- **Smart Compression** - Reduce to exact file sizes (5KB to 2MB) with binary search optimization
- **Format Conversion** - Convert between JPEG, PNG, WebP, HEIC formats with quality control
- **Advanced Editing** - Rotate, flip, crop, resize with pixel-perfect precision
- **Background Removal** - AI-powered background removal and replacement
- **OCR Text Extraction** - Extract text from images with Tesseract.js
- **PDF Tools** - Convert images to PDF and extract images from PDF
- **Watermarking** - Add text/image watermarks with position control
- **Effects & Filters** - Grayscale, pixelate, circle crop, and more

### AI-Powered Assistant
- **Chutki AI Chat** - Intelligent conversation interface for image processing
- **Natural Language Processing** - Describe what you need in plain English
- **Smart Recommendations** - AI suggests optimal tools and settings
- **Voice Commands** - Process images using voice input
- **Real-time Analysis** - AI analyzes uploaded images and provides insights

### Enterprise-Grade Security
- **JWT Authentication** - Secure token-based authentication with configurable expiration
- **Password Reset System** - Secure token-based password recovery with 10-minute expiration
- **Google OAuth Integration** - One-click sign-in with Google
- **Rate Limiting** - Protection against abuse (100 req/15min, 20 uploads/15min)
- **File Validation** - Comprehensive upload security and virus scanning
- **Privacy First** - Automatic file deletion after 30 minutes
- **CORS Protection** - Cross-origin request security
- **Helmet.js Security** - Production-grade security headers

### Modern User Experience
- **Responsive Design** - Perfect on mobile, tablet, and desktop
- **Dark Mode Support** - Eye-friendly dark theme
- **Drag & Drop Interface** - Intuitive file upload experience
- **Real-time Progress** - Live processing feedback with animations
- **Batch Processing** - Handle multiple files simultaneously
- **Download Management** - Organized file downloads with history

## Tech Stack

### Frontend
- **React 19.1.0** - Latest React with concurrent features
- **Vite 7.0.4** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS with custom design system
- **React Router 7.7.1** - Modern client-side routing
- **Framer Motion** - Smooth animations and transitions
- **React Hot Toast** - Beautiful notification system

### Backend
- **Node.js 18+** - Modern JavaScript runtime
- **Express.js 4.18.2** - Fast, minimalist web framework
- **Sharp 0.32.6** - High-performance image processing
- **MongoDB 7.5.0** - Flexible NoSQL database
- **Mongoose** - Elegant MongoDB object modeling
- **Passport.js** - Comprehensive authentication middleware
- **Multer** - Efficient file upload handling
- **Tesseract.js** - OCR text extraction
- **PDFKit** - PDF generation and manipulation

### DevOps & Security
- **Helmet.js** - Security headers and protection
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Request throttling and abuse prevention
- **Compression** - Response compression for performance
- **Morgan** - HTTP request logging
- **Validator** - Input validation and sanitization

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local or MongoDB Atlas)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Bil-2/CHUTKI-IMAGE-TOOL.git
   cd CHUTKI
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   ```

3. **Environment setup**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   nano .env  # Configure your environment variables
   
   # Frontend environment (optional)
   cd ..
   cp .env.example .env
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Start backend (Port 5001)
   cd backend
   npm run dev
   
   # Terminal 2: Start frontend (Port 5173)
   cd ..
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001
   - Health Check: http://localhost:5001/api/health

### Environment Configuration

#### Backend (.env)
```env
# Server Configuration
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (Required)
MONGODB_URI=mongodb://localhost:27017/chutki
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/chutki

# Security (REQUIRED - Change these!)
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Processing
MAX_FILE_SIZE=10485760  # 10MB
FILE_RETENTION_MINUTES=30
UPLOAD_DIR=uploads
```

#### Frontend (.env) - Optional
```env
VITE_API_BASE_URL=http://localhost:5001
VITE_FRONTEND_URL=http://localhost:5173
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

#### Google OAuth
```http
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/verify-token
```

### Image Processing Endpoints

All image processing tools use the unified endpoint structure:

```http
POST /api/tools/{tool-name}
Content-Type: multipart/form-data
```

#### Popular Tools

**Passport Photo Generator**
```http
POST /api/tools/passport-photo
Content-Type: multipart/form-data

image: <image-file>
size: "2x2" (2x2, 35x45, 51x51, custom)
dpi: 300
background: "white"
copies: 1
```

**Smart Compression**
```http
POST /api/tools/reduce-size-kb
Content-Type: multipart/form-data

image: <image-file>
targetKB: 100
quality: 80
```

**Format Conversion**
```http
POST /api/tools/heic-to-jpg
Content-Type: multipart/form-data

image: <image-file>
quality: 90
```

**Image Rotation**
```http
POST /api/tools/rotate
Content-Type: multipart/form-data

image: <image-file>
angle: 90
background: "white"
```

**Background Removal**
```http
POST /api/tools/remove-background
Content-Type: multipart/form-data

image: <image-file>
```

### AI Chat Endpoints

```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "Compress my image to 100KB",
  "context": "previous conversation context"
}
```

```http
POST /api/ai/analyze-image
Content-Type: multipart/form-data

image: <image-file>
```

## Deployment

For comprehensive deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Quick Deployment Options

#### Production Build
```bash
# Build frontend
npm run build

# Start backend in production
cd backend
NODE_ENV=production npm start
```

#### Docker Deployment
```bash
docker-compose up --build
```

#### Cloud Deployment
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Railway, Heroku, AWS EC2, DigitalOcean
- **Database**: MongoDB Atlas, AWS DocumentDB

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chutki
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-super-secure-production-jwt-secret
SESSION_SECRET=your-super-secure-production-session-secret
```

## Security Features

- **Automatic File Cleanup** - All uploaded files deleted after 30 minutes
- **Input Validation** - Comprehensive request validation and sanitization
- **Rate Limiting** - Protection against abuse and DDoS attacks
- **HTTPS Enforcement** - SSL/TLS encryption in production
- **CORS Protection** - Controlled cross-origin access
- **Security Headers** - Helmet.js protection against common vulnerabilities
- **File Type Validation** - Only allowed image formats accepted
- **Size Limits** - Maximum 10MB file upload limit
- **Memory Processing** - No files stored on disk during processing

## Performance Features

- **Binary Search Compression** - Achieve exact target file sizes efficiently
- **Sharp.js Optimization** - High-performance image processing
- **Memory Management** - Efficient memory usage with automatic cleanup
- **Caching** - Smart caching for improved response times
- **Code Splitting** - Optimized bundle sizes with lazy loading
- **CDN Ready** - Optimized for content delivery networks
- **Progressive Loading** - Smooth user experience with loading states

## Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
npm test

# Run end-to-end tests
npm run test:e2e
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Submit a pull request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages
- Ensure responsive design

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support & Documentation

- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Documentation**: Available at `/api/docs` when running
- **GitHub Issues**: [Report bugs or request features](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues)
- **Discussions**: [Community discussions](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/discussions)

## Roadmap

- [ ] Advanced AI image enhancement
- [ ] Batch processing improvements
- [ ] Mobile app development
- [ ] Plugin system for custom tools
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Cloud storage integration

## Acknowledgments

- **Sharp.js** - Incredible image processing performance
- **React Team** - Amazing frontend framework
- **Express.js** - Reliable backend framework
- **MongoDB** - Flexible database solution
- **Tailwind CSS** - Beautiful utility-first CSS

---

<div align="center">

**CHUTKI** - Professional Image Processing Made Simple 

[ Star this repo](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL) • [Report Bug](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues) • [Request Feature](https://github.com/Bil-2/CHUTKI-IMAGE-TOOL/issues)

Made with  by the CHUTKI Team

</div>
