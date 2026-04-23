#!/usr/bin/env node

// CHUTKI Uptime Monitor
// Real-time monitoring of server uptime and cold start prevention

const BACKEND_URL = process.env.BACKEND_URL || 'https://chutki-image-processing-tools.onrender.com';
const CHECK_INTERVAL = 60000; // 1 minute

let stats = {
  totalChecks: 0,
  successfulChecks: 0,
  failedChecks: 0,
  responseTimes: [],
  startTime: Date.now()
};

const checkServer = async () => {
  stats.totalChecks++;
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CHUTKI-Monitor',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    const responseTime = Date.now() - startTime;
    stats.responseTimes.push(responseTime);
    
    // Keep only last 100 response times
    if (stats.responseTimes.length > 100) {
      stats.responseTimes.shift();
    }
    
    if (response.ok) {
      stats.successfulChecks++;
      const status = responseTime < 1000 ? '🟢' : responseTime < 3000 ? '🟡' : '🟠';
      console.log(`${status} [${new Date().toLocaleTimeString()}] Server UP (${responseTime}ms)`);
    } else {
      stats.failedChecks++;
      console.log(`🔴 [${new Date().toLocaleTimeString()}] Server returned ${response.status}`);
    }
  } catch (error) {
    stats.failedChecks++;
    console.log(`🔴 [${new Date().toLocaleTimeString()}] Server DOWN: ${error.message}`);
  }
};

const displayStats = () => {
  const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = uptime % 60;
  
  const successRate = stats.totalChecks > 0 
    ? ((stats.successfulChecks / stats.totalChecks) * 100).toFixed(2)
    : 0;
  
  const avgResponseTime = stats.responseTimes.length > 0
    ? Math.round(stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length)
    : 0;
  
  const minResponseTime = stats.responseTimes.length > 0
    ? Math.min(...stats.responseTimes)
    : 0;
  
  const maxResponseTime = stats.responseTimes.length > 0
    ? Math.max(...stats.responseTimes)
    : 0;
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║           CHUTKI UPTIME MONITOR - STATISTICS           ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Monitor Uptime: ${String(`${hours}h ${minutes}m ${seconds}s`).padEnd(39)} ║`);
  console.log(`║  Total Checks: ${String(stats.totalChecks).padEnd(41)} ║`);
  console.log(`║  Successful: ${String(stats.successfulChecks).padEnd(43)} ║`);
  console.log(`║  Failed: ${String(stats.failedChecks).padEnd(47)} ║`);
  console.log(`║  Success Rate: ${String(successRate + '%').padEnd(41)} ║`);
  console.log(`║  Avg Response: ${String(avgResponseTime + 'ms').padEnd(41)} ║`);
  console.log(`║  Min/Max: ${String(`${minResponseTime}ms / ${maxResponseTime}ms`).padEnd(46)} ║`);
  console.log('╚════════════════════════════════════════════════════════╝\n');
};

// Start monitoring
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║         [START] CHUTKI UPTIME MONITOR STARTED [START]            ║');
console.log('╠════════════════════════════════════════════════════════╣');
console.log(`║  Target: ${BACKEND_URL.padEnd(47)} ║`);
console.log(`║  Interval: ${String(CHECK_INTERVAL / 1000 + ' seconds').padEnd(45)} ║`);
console.log(`║  Started: ${new Date().toLocaleString().padEnd(46)} ║`);
console.log('╚════════════════════════════════════════════════════════╝\n');

// Initial check
checkServer();

// Set up interval
setInterval(checkServer, CHECK_INTERVAL);

// Display stats every 5 minutes
setInterval(displayStats, 5 * 60 * 1000);

// Display stats on exit
process.on('SIGINT', () => {
  console.log('\n\n[STOP] Monitoring stopped\n');
  displayStats();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n[STOP] Monitoring terminated\n');
  displayStats();
  process.exit(0);
});
