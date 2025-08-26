# CHUTKI - AI-Powered Image Processing Tool

CHUTKI is a comprehensive image processing web application that provides various tools for image manipulation, conversion, and optimization. Built with React frontend and Express.js backend.

## Features

### 🖼️ Image Processing Tools
- **Passport Photo Generator** - Create passport-sized photos with custom dimensions
- **Image Compression** - Reduce file size while maintaining quality
- **Format Conversion** - Convert between JPEG, PNG, WebP formats
- **Image Rotation** - Rotate images by any angle
- **Image Flipping** - Flip images horizontally, vertically, or both
- **Resize by CM** - Resize images to specific centimeter dimensions

### � User Management
- **User Registration & Login** - Secure authentication system
- **Google OAuth Integration** - Sign in with Google account
- **JWT Token Authentication** - Secure API access

### �️ Privacy & Security
- **Automatic File Cleanup** - Files deleted after 30 minutes
- **Secure File Handling** - Memory-based processing
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Comprehensive request validation

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Sharp** - High-performance image processing
- **Multer** - File upload handling
- **Passport.js** - Authentication middleware

## Installation & Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local or cloud)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <https://github.com/Bil-2/CHUTKI-IMAGE-TOOL.git>
   cd CHUTKI/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/chutki
   
   # Server
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   
   # Security (REQUIRED - Change these!)
   JWT_SECRET=your-secure-jwt-secret-here
   SESSION_SECRET=your-secure-session-secret-here
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   
   # File Settings
   MAX_FILE_SIZE=10485760
   UPLOAD_DIR=uploads
   FILE_RETENTION_MINUTES=30
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../src
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
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
  "password": "Password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Google OAuth
```http
GET /api/auth/google
GET /api/auth/google/callback
```

### Image Processing Endpoints

#### Upload Image
```http
POST /api/upload
Content-Type: multipart/form-data

file: <image-file>
```

#### Compress Image
```http
POST /api/compress
Content-Type: multipart/form-data

image: <image-file>
quality: 80 (optional, 1-100)
format: jpeg (optional: jpeg, png, webp)
```

#### Convert Image Format
```http
POST /api/convert
Content-Type: multipart/form-data

image: <image-file>
format: png (jpeg, png, webp)
quality: 90 (optional, for JPEG)
```

#### Generate Passport Photo
```http
POST /api/passport-photo
Content-Type: multipart/form-data

image: <image-file>
size: 35x45 (35x45, 51x51, 50x70, custom)
dpi: 300 (optional)
background: white (optional)
format: jpeg (optional)
quantity: 1 (optional)
```

#### Rotate Image
```http
POST /api/tools/rotate
Content-Type: multipart/form-data

image: <image-file>
angle: 90 (rotation angle in degrees)
background: white (optional)
```

#### Flip Image
```http
POST /api/tools/flip
Content-Type: multipart/form-data

image: <image-file>
flipDirection: horizontal (horizontal, vertical, both)
```

#### Resize by CM
```http
POST /api/tools/resize-cm
Content-Type: multipart/form-data

image: <image-file>
width: 10 (width in cm)
height: 10 (height in cm)
dpi: 300 (optional)
format: jpeg (optional)
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chutki
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-super-secure-jwt-secret-for-production
SESSION_SECRET=your-super-secure-session-secret-for-production
GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
```

### Deployment Platforms

#### Vercel (Recommended for Backend)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds

#### Netlify (Recommended for Frontend)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure redirects for SPA routing

#### Railway/Render (Alternative)
1. Connect repository
2. Set environment variables
3. Deploy with automatic builds

### Docker Deployment

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## Security Considerations

- **File Cleanup**: All uploaded files are automatically deleted after 30 minutes
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Consider implementing rate limiting for production
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never commit sensitive data to version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on the GitHub repository.

---

**CHUTKI** - Making image processing simple and accessible for everyone! 
