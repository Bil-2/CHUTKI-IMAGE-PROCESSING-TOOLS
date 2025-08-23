#!/bin/bash

echo "🚀 CHUTKI Image Tools - Vercel Deployment Script"
echo "================================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI installed"

# Build frontend
echo "📦 Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully!"

# Deploy frontend
echo "🚀 Deploying frontend to Vercel..."
echo "Please follow the prompts to complete deployment:"
echo "1. Choose your account/team"
echo "2. Set project name: chutki-frontend"
echo "3. Confirm deployment settings"
echo ""

vercel --prod

echo ""
echo "🎉 Frontend deployment completed!"
echo ""

# Deploy backend
echo "🚀 Deploying backend to Vercel..."
cd backend

echo "Please follow the prompts to complete backend deployment:"
echo "1. Choose your account/team"
echo "2. Set project name: chutki-backend"
echo "3. Confirm deployment settings"
echo ""

vercel --prod

echo ""
echo "🎉 Backend deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure custom domains (optional)"
echo "3. Test the deployed application"
echo ""
echo "🔗 Vercel Dashboard: https://vercel.com/dashboard"
