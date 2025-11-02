# CHUTKI Application Deployment Guide

This guide provides detailed steps for deploying your CHUTKI application to production with MongoDB Atlas, Render (backend), and Vercel (frontend).

## Prerequisites

Before starting, ensure you have:
- A GitHub account with your CHUTKI repository pushed
- A MongoDB Atlas account (see MONGODB_SETUP.md)
- A Render account
- A Vercel account

## Deployment Order

1. MongoDB Atlas (Database) - 10 minutes
2. Render (Backend) - 15 minutes
3. Vercel (Frontend) - 10 minutes
4. Update Cross-References - 5 minutes

---

## 1. MongoDB Atlas Setup

Follow the instructions in `MONGODB_SETUP.md` to:
1. Create a MongoDB Atlas account
2. Create a cluster named `chutki-cluster`
3. Create a database user named `chutki-user`
4. Obtain your connection string

Example connection string format:
```
mongodb+srv://chutki-user:your-password@chutki-cluster.abc123.mongodb.net/chutki
```

---

## 2. Render Deployment (Backend)

1. Go to [Render](https://render.com) and sign in
2. Click "New" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:
   - Name: `chutki-backend`
   - Region: Choose the region closest to your users
   - Branch: `main` (or your default branch)
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add the following environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secure-jwt-secret
   SESSION_SECRET=your-secure-session-secret
   CLIENT_URL=https://your-frontend.vercel.app
   ```
6. Click "Create Web Service"
7. Wait for deployment to complete (typically 5-10 minutes)
8. Note your backend URL (e.g., `https://chutki-backend.onrender.com`)

---

## 3. Vercel Deployment (Frontend)

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:
   - Project Name: `chutki-frontend`
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add the following environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Click "Deploy"
7. Wait for deployment to complete (typically 3-5 minutes)
8. Note your frontend URL (e.g., `https://your-project.vercel.app`)

---

## 4. Update Cross-References

### Update Backend with Frontend URL

1. Go back to your Render dashboard
2. Navigate to your `chutki-backend` service
3. Go to "Environment" tab
4. Update the `CLIENT_URL` environment variable with your actual Vercel frontend URL
5. Click "Save Changes"
6. Redeploy the service

### Update Frontend with Backend URL

1. Update `src/config.js` with your actual backend URL:
   ```javascript
   API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://your-backend.onrender.com'
   ```
2. Commit and push to GitHub (this will trigger an automatic redeployment on Vercel)

---

## Environment Variables Summary

### Backend (Render)
| Variable | Value |
|----------|-------|
| NODE_ENV | production |
| PORT | 10000 |
| MONGODB_URI | your MongoDB connection string |
| JWT_SECRET | your secure JWT secret |
| SESSION_SECRET | your secure session secret |
| CLIENT_URL | your Vercel frontend URL |

### Frontend (Vercel)
| Variable | Value |
|----------|-------|
| VITE_API_BASE_URL | your Render backend URL |
| VITE_FRONTEND_URL | your Vercel frontend URL |

---

## Testing Your Deployment

1. Visit your frontend URL
2. Try uploading an image and using one of the tools
3. Check that the backend API is responding at `/api/health`
4. Verify MongoDB connections are working by creating an account

---

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CLIENT_URL` in Render matches your Vercel frontend URL
2. **Database Connection**: Verify your MongoDB connection string and network access
3. **Environment Variables**: Double-check all environment variables are correctly set
4. **Build Failures**: Check logs in Render and Vercel dashboards

### Checking Logs

- **Render**: Go to your service dashboard and click "Logs"
- **Vercel**: Go to your project dashboard and click "Logs"
- **MongoDB Atlas**: Check the "Clusters" section for connection metrics

---

## Post-Deployment Checklist

- [ ] Application is accessible at your frontend URL
- [ ] Backend API is responding at `/api/health`
- [ ] User registration and login work
- [ ] Image processing tools function correctly
- [ ] Database connections are working
- [ ] SSL certificates are active
- [ ] CI/CD pipeline works (push to repo triggers redeployment)

---

## Maintenance

1. Regularly monitor your MongoDB Atlas usage
2. Check Render and Vercel for any service alerts
3. Update dependencies periodically
4. Review logs for any errors or performance issues

Your CHUTKI application is now deployed and ready for production use!