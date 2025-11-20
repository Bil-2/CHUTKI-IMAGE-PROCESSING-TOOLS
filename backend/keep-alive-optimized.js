// Optimized Keep-Alive Service for CHUTKI
// Prevents cold starts by pinging server every 10 minutes

const BACKEND_URL = process.env.BACKEND_URL || 'https://chutki-image-processing-tools.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

let consecutiveFailures = 0;
const MAX_FAILURES = 3;

const pingServer = async () => {
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CHUTKI-KeepAlive-v2',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      consecutiveFailures = 0;
      console.log(`✅ [${new Date().toISOString()}] Server alive (${responseTime}ms)`);
      
      // Warm up additional endpoints if response was slow
      if (responseTime > 2000) {
        console.log(`⚠️ Slow response detected, warming up...`);
        warmUpEndpoints();
      }
    } else {
      consecutiveFailures++;
      console.log(`⚠️ [${new Date().toISOString()}] Status: ${response.status} (${responseTime}ms)`);
    }
  } catch (error) {
    consecutiveFailures++;
    console.log(`❌ [${new Date().toISOString()}] Ping failed: ${error.message}`);
    
    if (consecutiveFailures >= MAX_FAILURES) {
      console.log(`🚨 ${MAX_FAILURES} consecutive failures detected!`);
      // Optionally send alert or notification
    }
  }
};

const warmUpEndpoints = async () => {
  const endpoints = ['/api/tools/health', '/api/auth/status'];
  
  for (const endpoint of endpoints) {
    try {
      await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
    } catch (error) {
      // Silent fail for warm-up
    }
  }
};

// Start service
console.log(`🚀 CHUTKI Keep-Alive Service v2`);
console.log(`📡 Target: ${BACKEND_URL}`);
console.log(`⏰ Interval: ${PING_INTERVAL / 1000 / 60} minutes`);
console.log(`🔄 Starting...`);

// Initial ping
pingServer();

// Set up interval
setInterval(pingServer, PING_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-Alive service stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-Alive service terminated');
  process.exit(0);
});
