# Multi-stage Docker build for CHUTKI
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build

# Add metadata labels
LABEL maintainer="CHUTKI Team"
LABEL description="CHUTKI - AI-Powered Image Processing Platform"
LABEL version="1.0.0"

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend package files (for better layer caching)
COPY package*.json ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY eslint.config.js ./
COPY index.html ./

# Install frontend dependencies (including devDependencies for build tools)
RUN npm install

# Copy frontend source code
COPY src/ ./src/
COPY public/ ./public/

# Build frontend
RUN npm run build

# Stage 2: Backend production image
FROM node:18-alpine AS backend

# Add metadata labels
LABEL maintainer="CHUTKI Team"
LABEL description="CHUTKI Backend with Frontend Assets"

# Install system dependencies for Sharp and Canvas
RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm install --production

# Copy backend source code
COPY --chown=nodejs:nodejs backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-build --chown=nodejs:nodejs /app/frontend/dist ./public

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"]