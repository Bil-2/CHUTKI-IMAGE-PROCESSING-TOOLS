// External Keep-Alive Script for CHUTKI Backend
// Run this separately to keep the server warm

const BACKEND_URL = 'https://chutki-image-processing-tools.onrender.com';

const pingServer = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CHUTKI-External-KeepAlive',
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ [${new Date().toISOString()}] Server alive - Status: ${data.message?.data?.status}`);
    } else {
      console.log(`⚠️ [${new Date().toISOString()}] Server responded with: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ [${new Date().toISOString()}] Ping failed: ${error.message}`);
  }
};

// Ping every 10 minutes
const PING_INTERVAL = 10 * 60 * 1000;

console.log(`🚀 Starting CHUTKI Keep-Alive Service...`);
console.log(`📡 Target: ${BACKEND_URL}`);
console.log(`⏰ Interval: ${PING_INTERVAL / 1000 / 60} minutes`);

// Initial ping
pingServer();

// Set up interval
setInterval(pingServer, PING_INTERVAL);

// Keep the script running
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-Alive service stopped');
  process.exit(0);
});

console.log('✅ Keep-Alive service started successfully');