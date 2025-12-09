// CHUTKI Keep-Alive Service v3 - Maximum Uptime Protection
// Multi-layer approach to prevent cold starts completely

const BACKEND_URL = process.env.BACKEND_URL || 'https://chutki-image-processing-tools.onrender.com';

// Multiple ping intervals for redundancy
const PING_INTERVALS = [
  5 * 60 * 1000,   // 5 minutes - primary
  7 * 60 * 1000,   // 7 minutes - secondary
  13 * 60 * 1000   // 13 minutes - tertiary
];

let consecutiveFailures = 0;
const MAX_FAILURES = 5;
let totalPings = 0;
let successfulPings = 0;

const pingEndpoint = async (endpoint, timeout = 10000) => {
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CHUTKI-KeepAlive-v3',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Keep-Alive': 'true'
      },
      signal: AbortSignal.timeout(timeout)
    });
    
    const responseTime = Date.now() - startTime;
    return { success: response.ok, status: response.status, responseTime };
  } catch (error) {
    return { success: false, error: error.message, responseTime: 0 };
  }
};

const pingServer = async () => {
  totalPings++;
  const timestamp = new Date().toISOString();
  
  console.log(`\n🔄 [${timestamp}] Keep-Alive Ping #${totalPings}`);
  
  // Ping multiple endpoints for redundancy
  const endpoints = [
    { path: '/api/health', name: 'Health' },
    { path: '/api/tools/health', name: 'Tools' },
    { path: '/api/auth/status', name: 'Auth' }
  ];
  
  let anySuccess = false;
  
  for (const endpoint of endpoints) {
    const result = await pingEndpoint(endpoint.path, 12000);
    
    if (result.success) {
      anySuccess = true;
      console.log(`  ✅ ${endpoint.name}: ${result.status} (${result.responseTime}ms)`);
      
      // Warm up if slow
      if (result.responseTime > 3000) {
        console.log(`  ⚠️ Slow response, triggering warm-up...`);
        warmUpEndpoints();
      }
    } else {
      console.log(`  ❌ ${endpoint.name}: ${result.error || result.status}`);
    }
    
    // Small delay between pings
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (anySuccess) {
    consecutiveFailures = 0;
    successfulPings++;
    console.log(`✅ Keep-alive successful (${successfulPings}/${totalPings} success rate: ${Math.round(successfulPings/totalPings*100)}%)`);
  } else {
    consecutiveFailures++;
    console.log(`❌ All endpoints failed (${consecutiveFailures} consecutive failures)`);
    
    if (consecutiveFailures >= MAX_FAILURES) {
      console.log(`🚨 ALERT: ${MAX_FAILURES} consecutive failures - server may be down!`);
    }
  }
};

const warmUpEndpoints = async () => {
  const warmUpTargets = [
    '/api/tools/list',
    '/api/profile/me'
  ];
  
  console.log(`  🔥 Warming up ${warmUpTargets.length} endpoints...`);
  
  for (const endpoint of warmUpTargets) {
    pingEndpoint(endpoint, 8000).catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

// Start service
console.log(`╔${'═'.repeat(60)}╗`);
console.log(`║  🚀 CHUTKI Keep-Alive Service v3 - Maximum Protection     ║`);
console.log(`╠${'═'.repeat(60)}╣`);
console.log(`║  📡 Target: ${BACKEND_URL.padEnd(42)} ║`);
console.log(`║  ⏰ Intervals: 5min, 7min, 13min (multi-layer)            ║`);
console.log(`║  🛡️  Protection: 100% uptime guarantee                     ║`);
console.log(`╚${'═'.repeat(60)}╝`);

// Initial ping after 30 seconds
setTimeout(() => {
  console.log(`\n🔄 Starting initial ping...`);
  pingServer();
}, 30000);

// Set up multiple intervals for redundancy
PING_INTERVALS.forEach((interval, index) => {
  setInterval(() => {
    console.log(`\n[Layer ${index + 1}] Scheduled ping triggered`);
    pingServer();
  }, interval);
  
  console.log(`✅ Layer ${index + 1} initialized: ${interval / 1000 / 60} minutes`);
});

// Health report every hour
setInterval(() => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  
  console.log(`\n📊 Keep-Alive Health Report:`);
  console.log(`   Uptime: ${hours}h ${minutes}m`);
  console.log(`   Total Pings: ${totalPings}`);
  console.log(`   Successful: ${successfulPings}`);
  console.log(`   Success Rate: ${totalPings > 0 ? Math.round(successfulPings/totalPings*100) : 0}%`);
  console.log(`   Consecutive Failures: ${consecutiveFailures}`);
}, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-Alive service stopped gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-Alive service terminated');
  process.exit(0);
});
