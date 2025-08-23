# 🖼️ CHUTKI Image Tools

> **Professional Image Processing & Editing Suite** - A comprehensive web application for all your image manipulation needs.

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://chutki-frontend-he18uy5vs-biltu-bags-projects.vercel.app)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.17.1-green?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

## 🌟 **Live Demo**

**🔗 Frontend:** [https://chutki-frontend-he18uy5vs-biltu-bags-projects.vercel.app](https://chutki-frontend-he18uy5vs-biltu-bags-projects.vercel.app)

**🔗 Backend API:** [https://backend-gp6w7yvh4-biltu-bags-projects.vercel.app](https://backend-gp6w7yvh4-biltu-bags-projects.vercel.app)

---

## 📋 **Table of Contents**

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [🎯 Available Tools](#-available-tools)
- [📱 Screenshots](#-screenshots)
- [🔒 Security](#-security)
- [📊 Performance](#-performance)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)

---

## ✨ **Features**

### 🎨 **Image Processing Tools**
- **Passport Photo Maker** - Generate passport photos with custom sizes
- **Image Resizing** - Resize images to specific dimensions (pixels, cm, mm, inches)
- **Format Conversion** - Convert between JPG, PNG, WEBP, HEIC formats
- **Image Compression** - Compress images to target file sizes
- **Background Removal** - AI-powered background removal
- **Text Extraction** - OCR text extraction from images
- **Watermarking** - Add watermarks to images
- **Image Effects** - Apply filters, rotations, flips, and more

### 🔧 **Advanced Features**
- **Bulk Processing** - Process multiple images at once
- **Custom DPI Settings** - Adjust image resolution
- **Quality Control** - Maintain image quality during compression
- **Auto Cleanup** - Automatic file deletion after 30 minutes
- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - User preference support

### 🔐 **Security & Privacy**
- **OAuth Authentication** - Google OAuth integration
- **JWT Tokens** - Secure session management
- **File Privacy** - Automatic file cleanup
- **CORS Protection** - Cross-origin security
- **Input Validation** - Secure file uploads

---

## 🛠️ **Tech Stack**

### **Frontend**
- **React 19.1.0** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **React Icons** - Beautiful icon library

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **Sharp** - High-performance image processing
- **JWT** - JSON Web Token authentication
- **Passport.js** - Authentication middleware

### **Deployment**
- **Vercel** - Frontend and backend hosting
- **MongoDB Atlas** - Cloud database
- **Google OAuth** - Authentication provider

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### **Clone the Repository**
```bash
git clone https://github.com/yourusername/chutki-image-tools.git
cd chutki-image-tools
```

### **Install Dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### **Environment Setup**
```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit backend/.env with your configuration
nano backend/.env
```

### **Start Development Servers**
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server (in new terminal)
npm run dev
```

### **Access the Application**
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5001
- **Health Check:** http://localhost:5001/api/health

---

## 📦 **Installation**

### **Option 1: Local Development**
```bash
# Clone and setup
git clone https://github.com/yourusername/chutki-image-tools.git
cd chutki-image-tools
npm install
cd backend && npm install && cd ..

# Configure environment
cp backend/env.example backend/.env
# Edit backend/.env with your settings

# Start servers
npm run dev  # Frontend
cd backend && npm run dev  # Backend
```

### **Option 2: Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend: http://localhost:5001
```

### **Option 3: Vercel Deployment**
```bash
# Deploy to Vercel
vercel --prod

# Deploy backend
cd backend
vercel --prod
```

---

## 🔧 **Configuration**

### **Environment Variables**

#### **Backend (.env)**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/chutki

# Server
PORT=5001
NODE_ENV=development

# Client
CLIENT_URL=http://localhost:5173

# Security
JWT_SECRET=your-super-secret-jwt-key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
FILE_RETENTION_MINUTES=30
```

#### **Frontend (vite.config.js)**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

---

## 🎯 **Available Tools**

### **📸 Image Editing Tools**
- [x] **Passport Photo Maker** - Generate passport photos
- [x] **Image Resizer** - Resize to specific dimensions
- [x] **Format Converter** - Convert between formats
- [x] **Image Compressor** - Reduce file size
- [x] **Background Remover** - Remove backgrounds
- [x] **Text Extractor** - OCR text extraction
- [x] **Watermarker** - Add watermarks
- [x] **Image Rotator** - Rotate images
- [x] **Image Flipper** - Flip horizontally/vertically
- [x] **Pixel Art Converter** - Convert to pixel art
- [x] **Grayscale Converter** - Convert to grayscale
- [x] **Black & White Converter** - Convert to B&W

### **📄 Document Tools**
- [x] **Image to PDF** - Convert images to PDF
- [x] **PDF to Images** - Extract images from PDF
- [x] **PDF Compressor** - Compress PDF files

### **🎨 Creative Tools**
- [x] **Instagram Grid Maker** - Create Instagram grids
- [x] **Image Joiner** - Join multiple images
- [x] **Image Splitter** - Split images into grid
- [x] **Circle Cropper** - Crop to circle shape
- [x] **Freehand Cropper** - Custom crop selection

### **🔧 Utility Tools**
- [x] **DPI Converter** - Convert image DPI
- [x] **Color Picker** - Pick colors from images
- [x] **File Size Converter** - Convert between KB/MB
- [x] **Bulk Processor** - Process multiple files

---

## 📱 **Screenshots**

### **Main Dashboard**
![Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=CHUTKI+Image+Tools+Dashboard)

### **Passport Photo Maker**
![Passport Photo](https://via.placeholder.com/800x400/10B981/FFFFFF?text=Passport+Photo+Maker)

### **Image Processing Tools**
![Image Tools](https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=Image+Processing+Tools)

---

## 🔒 **Security**

### **Authentication**
- **Google OAuth 2.0** - Secure social login
- **JWT Tokens** - Stateless authentication
- **Session Management** - Secure session handling

### **File Security**
- **File Type Validation** - Only allowed image formats
- **Size Limits** - Maximum file size restrictions
- **Auto Cleanup** - Automatic file deletion
- **Privacy Protection** - No file storage retention

### **API Security**
- **CORS Protection** - Cross-origin security
- **Input Validation** - Request validation
- **Rate Limiting** - API usage limits
- **Error Handling** - Secure error responses

---

## 📊 **Performance**

### **Frontend**
- **Bundle Size:** 689KB (optimized)
- **Build Time:** ~1.7 seconds
- **Lighthouse Score:** 95+ (Performance)
- **First Contentful Paint:** < 1.5s

### **Backend**
- **Response Time:** < 100ms (average)
- **File Processing:** Optimized with Sharp
- **Memory Usage:** Efficient garbage collection
- **Concurrent Requests:** Handles multiple users

### **Optimizations**
- **Image Compression** - WebP format support
- **Lazy Loading** - On-demand component loading
- **Caching** - Browser and CDN caching
- **Code Splitting** - Dynamic imports

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

### **1. Fork the Repository**
```bash
git clone https://github.com/yourusername/chutki-image-tools.git
cd chutki-image-tools
```

### **2. Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

### **3. Make Your Changes**
- Add new image processing tools
- Improve UI/UX
- Fix bugs
- Add tests

### **4. Commit Your Changes**
```bash
git add .
git commit -m "Add amazing feature"
```

### **5. Push to Branch**
```bash
git push origin feature/amazing-feature
```

### **6. Open a Pull Request**
- Describe your changes
- Include screenshots if applicable
- Follow the code style guidelines

### **Development Guidelines**
- Use TypeScript for new features
- Add tests for new functionality
- Follow ESLint rules
- Update documentation

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Biltu Bag

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👨‍💻 **Author**

### **Biltu Bag**
- **GitHub:** [@Bil-2](https://github.com/Bil-2)
- **Email:** biltubag29@gmail.com
- **LinkedIn:** [Biltu Bag](https://linkedin.com/in/biltu-bag)
- **Portfolio:** [Personal Website](https://your-portfolio.com)

### **About the Project**
CHUTKI Image Tools is a comprehensive web application designed to provide professional-grade image processing capabilities to users worldwide. Built with modern technologies and best practices, it offers a seamless experience for all image manipulation needs.

### **Acknowledgments**
- **React Team** - For the amazing framework
- **Vercel** - For seamless deployment
- **MongoDB** - For reliable database
- **Sharp** - For high-performance image processing
- **Open Source Community** - For inspiration and support

---

## 🌟 **Support**

If you find this project helpful, please consider:

- ⭐ **Starring** the repository
- 🍕 **Buying me a coffee** (if you want)
- 📢 **Sharing** with others
- 🐛 **Reporting bugs**
- 💡 **Suggesting features**

---

**Made with ❤️ by Biltu Bag**

*"Empowering creativity through technology"*
