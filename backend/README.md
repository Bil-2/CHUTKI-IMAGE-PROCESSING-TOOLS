# CHUTKI Backend API

A robust Node.js/Express backend for the CHUTKI application with authentication, image processing, and user management features.

## 🚀 Features

- **Authentication System**

  - JWT-based authentication
  - Google OAuth integration
  - Password hashing with bcrypt
  - Session management

- **Image Processing**

  - HEIC to JPG conversion
  - WEBP to JPG conversion
  - JPEG to PNG conversion
  - PNG to JPEG conversion
  - JPG to WEBP conversion
  - File upload with validation

- **User Management**

  - User registration and login
  - Profile management
  - Password change functionality
  - User preferences

- **Security Features**
  - Input validation and sanitization
  - Rate limiting
  - CORS configuration
  - Environment-based security

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google OAuth credentials (for OAuth login)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   PORT=5001
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/chutki_db
   JWT_SECRET=your-super-secret-jwt-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   CLIENT_URL=http://localhost:5173
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth

```http
GET /api/auth/google
```

#### Get User Profile

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### Change Password

```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Image Processing Endpoints

#### Convert HEIC to JPG

```http
POST /api/convert/heic-to-jpg
Content-Type: multipart/form-data

file: <image_file>
```

#### Convert WEBP to JPG

```http
POST /api/convert/webp-to-jpg
Content-Type: multipart/form-data

file: <image_file>
```

#### Convert JPEG to PNG

```http
POST /api/convert/jpeg-to-png
Content-Type: multipart/form-data

file: <image_file>
```

#### Convert PNG to JPEG

```http
POST /api/convert/png-to-jpeg
Content-Type: multipart/form-data

file: <image_file>
```

#### Convert JPG to WEBP

```http
POST /api/convert/jpg-to-webp
Content-Type: multipart/form-data

file: <image_file>
```

### Utility Endpoints

#### Health Check

```http
GET /api/health
```

## 🔧 Configuration

### Environment Variables

| Variable               | Description                | Default                 |
| ---------------------- | -------------------------- | ----------------------- |
| `PORT`                 | Server port                | `5001`                  |
| `NODE_ENV`             | Environment mode           | `development`           |
| `MONGO_URI`            | MongoDB connection string  | Required                |
| `JWT_SECRET`           | JWT signing secret         | Required                |
| `JWT_EXPIRES_IN`       | JWT expiration time        | `7d`                    |
| `SESSION_SECRET`       | Session secret             | Required                |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID     | Required                |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Required                |
| `CLIENT_URL`           | Frontend URL               | `http://localhost:5173` |
| `MAX_FILE_SIZE`        | Maximum file upload size   | `10485760` (10MB)       |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

## 🏗️ Project Structure

```
backend/
├── config/
│   └── passport.js          # Passport configuration
├── controllers/
│   └── authController.js    # Authentication controllers
├── middleware/
│   └── auth.js             # Authentication middleware
├── models/
│   └── User.js             # User model
├── routes/
│   └── authRoutes.js       # Authentication routes
├── utils/
│   ├── validation.js       # Validation utilities
│   └── response.js         # Response utilities
├── uploads/                # File upload directory
├── server.js              # Main server file
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔒 Security Features

- **Password Hashing**: Uses bcrypt with salt rounds of 12
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: File type and size validation
- **CORS Protection**: Configurable CORS settings
- **Rate Limiting**: Built-in rate limiting (can be enhanced)

## 🧪 Testing

```bash
# Run tests (if configured)
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Google OAuth Error**

   - Verify Google OAuth credentials
   - Check redirect URI configuration
   - Ensure Google+ API is enabled

3. **File Upload Issues**

   - Check file size limits
   - Verify file type restrictions
   - Ensure upload directory exists

4. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper token format

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
