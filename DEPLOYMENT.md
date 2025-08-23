# 🚀 CHUTKI Image Tools - Deployment Guide

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Git
- Docker (optional)

## 🎯 Deployment Options

### 1. **Vercel Deployment (Recommended)**

#### Frontend Deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
vercel --prod
```

#### Backend Deployment:
```bash
cd backend
vercel --prod
```

**Environment Variables for Vercel:**
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Strong secret key
- `CLIENT_URL`: Your frontend URL
- `NODE_ENV`: production

### 2. **Docker Deployment**

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend: http://localhost:5001
```

### 3. **Manual Deployment**

#### Backend Setup:
```bash
cd backend
npm install
npm run setup
# Edit .env file with production values
npm start
```

#### Frontend Setup:
```bash
npm install
npm run build
# Serve dist folder with nginx/apache
```

## 🔧 Environment Configuration

### Backend (.env):
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chutki

# Server
PORT=5001
NODE_ENV=production

# Client
CLIENT_URL=https://yourdomain.com

# Security
JWT_SECRET=your-super-secret-jwt-key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
FILE_RETENTION_MINUTES=30
```

### Frontend (vite.config.js):
Update the proxy target to your backend URL:
```javascript
proxy: {
  '/api': {
    target: 'https://your-backend-url.com',
    changeOrigin: true,
    secure: true,
  },
},
```

## 🗄️ Database Setup

### MongoDB Atlas (Recommended):
1. Create MongoDB Atlas account
2. Create new cluster
3. Get connection string
4. Add to environment variables

### Local MongoDB:
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

## 🔒 Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Configure MongoDB authentication
- [ ] Set up environment variables
- [ ] Enable security headers
- [ ] Configure file upload limits

## 📊 Performance Optimization

### Frontend:
- Bundle size: 689KB (consider code splitting)
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading

### Backend:
- Enable compression middleware
- Configure proper caching headers
- Optimize image processing
- Set up monitoring

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check CLIENT_URL in backend .env
   - Verify CORS configuration

2. **File Upload Issues:**
   - Check uploads directory permissions
   - Verify file size limits

3. **Database Connection:**
   - Check MongoDB URI format
   - Verify network connectivity

4. **Build Errors:**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## 📈 Monitoring

### Health Check:
```bash
curl https://your-backend-url.com/api/health
```

### Logs:
```bash
# Docker
docker-compose logs -f

# Vercel
vercel logs
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check logs for error messages
2. Verify environment variables
3. Test endpoints individually
4. Check network connectivity

## 🎉 Success Checklist

- [ ] Frontend loads without errors
- [ ] Backend API responds to health check
- [ ] File upload works
- [ ] Image processing functions correctly
- [ ] Authentication works
- [ ] HTTPS is enabled
- [ ] Monitoring is set up
- [ ] Backups are configured
