// Configuration for CHUTKI Image Tools
const config = {
  // Backend API URL - Use localhost for development, production URL for production
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://backend-fsdm6hd2l-biltu-bags-projects.vercel.app'
    : 'http://localhost:5000',

  // Frontend URL - Use localhost for development, production URL for production
  FRONTEND_URL: process.env.NODE_ENV === 'production'
    ? 'https://chutki-frontend-5q9sgmeth-biltu-bags-projects.vercel.app'
    : 'http://localhost:5173',

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
