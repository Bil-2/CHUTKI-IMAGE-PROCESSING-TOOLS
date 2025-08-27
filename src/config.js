// Configuration for CHUTKI Image Tools
const config = {
  // Backend API URL - Use environment variable or fallback to localhost
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',

  // Frontend URL - Use localhost for development, production URL for production
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173',

  // API endpoints
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    GOOGLE_AUTH: '/api/auth/google',
    UPLOAD: '/api/upload',
    CONVERT: '/api/convert',
    COMPRESS: '/api/compress',
    HEALTH: '/api/health',
    // Modular tools endpoints
    TOOLS_HEALTH: '/api/tools/health',
    TOOLS_LIST: '/api/tools/list',
    TOOLS_BASE: '/api/tools'
  }
};

export default config;
