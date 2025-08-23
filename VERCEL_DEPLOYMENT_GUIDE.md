# 🚀 Vercel Deployment Guide for CHUTKI Image Tools

## 📋 **Prerequisites**
- GitHub account
- Vercel account (free tier available)
- Your application tested and working locally

## 🎯 **Deployment Options**

### **Option 1: GitHub Integration (Recommended)**

#### Step 1: Push to GitHub
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit for Vercel deployment"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/chutki-image-tools.git
git push -u origin main
```

#### Step 2: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Vite configuration
6. Click "Deploy"

### **Option 2: Manual CLI Deployment**

#### Step 1: Login to Vercel
```bash
vercel login
# Choose your preferred login method
```

#### Step 2: Deploy Frontend
```bash
# From project root
vercel --prod
```

#### Step 3: Deploy Backend
```bash
cd backend
vercel --prod
```

## 🔧 **Configuration Settings**

### **Frontend Configuration (vercel.json)**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.vercel.app/api/$1"
    }
  ]
}
```

### **Backend Configuration (backend/vercel.json)**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

## 🌍 **Environment Variables Setup**

### **Frontend Environment Variables**
Set these in Vercel dashboard:
- `VITE_API_URL`: Your backend URL
- `VITE_APP_NAME`: CHUTKI Image Tools

### **Backend Environment Variables**
Set these in Vercel dashboard:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Strong secret key
- `CLIENT_URL`: Your frontend URL
- `NODE_ENV`: production
- `GOOGLE_CLIENT_ID`: Your Google OAuth ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth secret
- `GOOGLE_CALLBACK_URL`: Your backend URL + /api/auth/google/callback

## 📊 **Deployment Steps**

### **Step 1: Frontend Deployment**
1. Run: `./deploy-vercel.sh`
2. Follow prompts to complete frontend deployment
3. Note the frontend URL (e.g., `https://chutki-frontend.vercel.app`)

### **Step 2: Backend Deployment**
1. Navigate to backend directory
2. Run: `vercel --prod`
3. Follow prompts to complete backend deployment
4. Note the backend URL (e.g., `https://chutki-backend.vercel.app`)

### **Step 3: Environment Configuration**
1. Go to Vercel dashboard
2. Select your backend project
3. Go to Settings > Environment Variables
4. Add all required environment variables
5. Redeploy backend

### **Step 4: Update Frontend Configuration**
1. Update `vercel.json` with your backend URL
2. Redeploy frontend

## 🔗 **URL Configuration**

### **After Deployment:**
- **Frontend:** `https://chutki-frontend.vercel.app`
- **Backend:** `https://chutki-backend.vercel.app`

### **Update vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://chutki-backend.vercel.app/api/$1"
    }
  ]
}
```

## 🧪 **Testing Deployment**

### **Health Check:**
```bash
curl https://chutki-backend.vercel.app/api/health
```

### **Frontend Test:**
- Visit your frontend URL
- Test file upload functionality
- Test image processing tools

### **Backend Test:**
- Test API endpoints
- Verify file uploads work
- Check authentication flow

## 🚨 **Common Issues & Solutions**

### **Issue 1: Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check for syntax errors

### **Issue 2: Environment Variables**
- Ensure all variables are set in Vercel dashboard
- Check variable names match code
- Redeploy after adding variables

### **Issue 3: CORS Errors**
- Update CLIENT_URL in backend environment
- Check CORS configuration in server.js

### **Issue 4: File Upload Issues**
- Verify uploads directory permissions
- Check file size limits
- Ensure proper error handling

## 📈 **Post-Deployment**

### **Monitoring:**
- Check Vercel dashboard for deployment status
- Monitor function execution logs
- Set up error tracking

### **Optimization:**
- Enable caching for static assets
- Configure CDN settings
- Monitor performance metrics

## 🎉 **Success Checklist**

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] Environment variables configured
- [ ] File upload working
- [ ] Authentication functional
- [ ] All tools operational
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Performance optimized

## 📞 **Support**

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test endpoints individually
4. Check Vercel documentation
5. Contact Vercel support if needed

---

**🎯 Your CHUTKI Image Tools will be live on Vercel! 🚀**
