export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // For demo purposes, redirect to frontend with a demo token
    const demoToken = `google_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const frontendUrl = 'https://chutki-frontend-c7dxak7fx-biltu-bags-projects.vercel.app';

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/oauth-success?token=${demoToken}`);

  } catch (error) {
    console.error('Google OAuth error:', error);
    const frontendUrl = 'https://chutki-frontend-c7dxak7fx-biltu-bags-projects.vercel.app';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
}
