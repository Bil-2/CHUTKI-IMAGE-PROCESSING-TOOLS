// Configuration for CHUTKI Image Tools
const config = {
  // Backend API URL - Use production URL directly for Vercel deployment
  // Updated to match the URL in vercel.json
  API_BASE_URL: 'https://backend-fsdm6hd2l-biltu-bags-projects.vercel.app',

  // Frontend URL - Use current production URL
  // Updated to use the current deployment URL
  FRONTEND_URL: 'https://chutki-frontend-5q9sgmeth-biltu-bags-projects.vercel.app',

  // API endpoints
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    GOOGLE_AUTH: '/api/auth/google',
    UPLOAD: '/api/upload',
    CONVERT: '/api/convert',
    COMPRESS: '/api/compress',
    HEALTH: '/api/health'
  }
};

export default config;
