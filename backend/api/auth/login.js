export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Demo credentials
    if (email === 'demo@chutki.com' && password === 'Demo123!') {
      const token = `demo_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: 'demo_user',
          email: email,
          name: 'Demo User'
        }
      });
    }

    // Test credentials
    if (email === 'test@chutki.com' && password === 'Test123!') {
      const token = `test_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: 'test_user',
          email: email,
          name: 'Test User'
        }
      });
    }

    // Invalid credentials
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
