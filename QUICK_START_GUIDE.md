# 🚀 CHUTKI - Quick Start Guide

## Starting Your Application

### 1. Start MongoDB

```bash
brew services start mongodb-community
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

**Backend will run on:** http://localhost:5001

### 3. Start Frontend

```bash
npm run dev
```

**Frontend will run on:** http://localhost:5173

---

## Testing Your Application

### Run All Tool Tests (82 tools)

```bash
cd backend
node quick-test-all-tools.js
```

### Test Health Check

```bash
curl http://localhost:5001/api/health
```

### Test Authentication

```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
```

---

## Available Endpoints

### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile (protected)
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/google` - Google OAuth login
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password

### Image Tools

- POST `/api/tools/:tool` - Process image with specific tool
- GET `/api/health` - Health check

### AI Chat

- POST `/api/chatgpt/chat` - Chat with AI assistant
- POST `/api/ai/chat` - AI tool recommendations
- POST `/api/ai/recommend-tools` - Get tool suggestions

---

## All 82 Available Tools

### Image Editing (26 tools)

1. passport-photo
2. reduce-size-kb
3. reduce-size-mb
4. resize-pixel
5. resize-cm
6. resize-mm
7. resize-inches
8. resize-2x2
9. resize-3x4
10. resize-4x6
11. resize-600x600
12. resize-6x2-300dpi
13. resize-3-5x4-5cm
14. resize-35x45mm
15. resize-a4
16. resize-pan
17. resize-ssc
18. resize-upsc
19. resize-instagram
20. resize-whatsapp-dp
21. resize-youtube-banner
22. resize-sign-50x20mm
23. resize-signature
24. bulk-resize
25. generate-signature
26. increase-size-kb

### Transformations (10 tools)

27. rotate
28. flip
29. grayscale
30. black-white
31. circle-crop
32. freehand-crop
33. pixelate
34. pixelate-face
35. blur-face
36. censor

### Effects (6 tools)

37. pixel-art
38. watermark
39. add-name-dob
40. remove-background
41. super-resolution
42. ai-face-generator

### Utilities (3 tools)

43. color-picker
44. convert-dpi
45. check-dpi

### Format Conversion (8 tools)

46. heic-to-jpg
47. webp-to-jpg
48. png-to-jpeg
49. jpeg-to-png
50. image-to-pdf
51. pdf-to-jpg
52. jpg-to-pdf-50kb
53. jpg-to-pdf-100kb
54. jpg-to-pdf-300kb
55. jpg-to-pdf-500kb
56. jpeg-to-pdf-200kb

### Compression (20 tools)

57. compress-5kb
58. compress-10kb
59. compress-15kb
60. compress-20kb
61. compress-25kb
62. compress-30kb
63. compress-40kb
64. compress-50kb
65. compress-100kb
66. compress-150kb
67. compress-200kb
68. compress-300kb
69. compress-500kb
70. compress-1mb
71. compress-2mb
72. compress-20-50kb
73. image-compressor
74. jpg-to-kb
75. kb-to-mb
76. mb-to-kb

### OCR (3 tools)

77. ocr
78. jpg-to-text
79. png-to-text

### Advanced (3 tools)

80. join-images
81. split-image
82. instagram-grid

---

## Example: Using a Tool

### Upload and Process Image

```bash
curl -X POST http://localhost:5001/api/tools/grayscale \
  -F "file=@/path/to/image.jpg"
```

### With Parameters

```bash
curl -X POST http://localhost:5001/api/tools/resize-pixel \
  -F "file=@/path/to/image.jpg" \
  -F "width=800" \
  -F "height=600"
```

---

## Environment Variables

Create `.env` file in backend directory:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
JWT_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

ENABLE_MONGODB=true
MONGODB_URI=mongodb://localhost:27017/chutki

MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
FILE_RETENTION_MINUTES=30

OPENAI_API_KEY=your-openai-api-key
```

---

## Troubleshooting

### MongoDB Connection Failed

```bash
# Restart MongoDB
brew services restart mongodb-community

# Check if running
ps aux | grep mongod
```

### Port Already in Use

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Clear Node Modules

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
```

---

## Build for Production

### Frontend

```bash
npm run build
```

Output will be in `dist/` directory

### Backend

```bash
cd backend
npm start
```

---

## Useful Commands

### Check All Services

```bash
# MongoDB
brew services list | grep mongodb

# Backend
curl http://localhost:5001/api/health

# Frontend
curl http://localhost:5173
```

### Run Tests

```bash
cd backend
npm test
```

### View Logs

```bash
# Backend logs are in console
# Check MongoDB logs
tail -f /opt/homebrew/var/log/mongodb/mongo.log
```

---

## Support

For issues or questions:

1. Check `PROJECT_HEALTH_REPORT.md` for system status
2. Review error logs in console
3. Verify all environment variables are set
4. Ensure MongoDB is running
5. Check port availability

---

**Happy Image Processing! 🎨**
