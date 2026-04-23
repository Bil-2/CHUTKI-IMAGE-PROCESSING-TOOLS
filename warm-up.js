#!/usr/bin/env node

// CHUTKI Server Warm-up Script v3
// Comprehensive warm-up to eliminate cold starts completely

const BACKEND_URL = process.env.BACKEND_URL || 'https://chutki-image-processing-tools.onrender.com';

const endpoints = [
  { path: '/api/health', priority: 'critical', timeout: 15000 },
  { path: '/api/tools/health', priority: 'high', timeout: 12000 },
  { path: '/api/tools/list', priority: 'high', timeout: 10000 },
  { path: '/api/auth/status', priority: 'medium', timeout: 8000 },
  { path: '/api/profile/me', priority: 'low', timeout: 8000 }
];

const warmUpEndpoint = async (endpoint) => {
  try {
    console.log(`[HOT] Warming up: ${endpoint.path} [${endpoint.priority}]`);
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);
    
    const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CHUTKI-WarmUp-v3',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Warm-Up': 'true'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      const statusIcon = responseTime < 1000 ? '[START]' : responseTime < 3000 ? '[OK]' : '[WARN]';
      console.log(`${statusIcon} ${endpoint.path} - ${response.status} (${responseTime}ms)`);
    } else {
      console.log(`[WARN] ${endpoint.path} - ${response.status} (${responseTime}ms)`);
    }
    
    return { 
      endpoint: endpoint.path, 
      status: response.status, 
      responseTime, 
      success: response.ok,
      priority: endpoint.priority
    };
  } catch (error) {
    console.log(`[ERROR] ${endpoint.path} - Error: ${error.message}`);
    return { 
      endpoint: endpoint.path, 
      error: error.message, 
      success: false,
      priority: endpoint.priority
    };
  }
};

const warmUpServer = async () => {
  console.log(`╔${'═'.repeat(60)}╗`);
  console.log(`║  [START] CHUTKI Server Warm-up v3 - Cold Start Eliminator      ║`);
  console.log(`╠${'═'.repeat(60)}╣`);
  console.log(`║  [PING] Target: ${BACKEND_URL.padEnd(42)} ║`);
  console.log(`║  [TARGET] Endpoints: ${endpoints.length} (prioritized)                          ║`);
  console.log(`╚${'═'.repeat(60)}╝\n`);
  
  const results = [];
  
  // Warm up critical endpoints first
  const criticalEndpoints = endpoints.filter(e => e.priority === 'critical');
  const otherEndpoints = endpoints.filter(e => e.priority !== 'critical');
  
  console.log('🔴 Phase 1: Critical Endpoints');
  for (const endpoint of criticalEndpoints) {
    const result = await warmUpEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🟡 Phase 2: Other Endpoints');
  for (const endpoint of otherEndpoints) {
    const result = await warmUpEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 800));
  }
  
  // Summary
  console.log(`\n${'═'.repeat(62)}`);
  console.log('[STATS] Warm-up Summary:');
  console.log(`${'═'.repeat(62)}`);
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  const successRate = Math.round((successful / total) * 100);
  
  console.log(`[OK] Successful: ${successful}/${total} (${successRate}%)`);
  
  // Calculate average response time for successful requests
  const successfulResults = results.filter(r => r.success && r.responseTime);
  if (successfulResults.length > 0) {
    const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length;
    const minResponseTime = Math.min(...successfulResults.map(r => r.responseTime));
    const maxResponseTime = Math.max(...successfulResults.map(r => r.responseTime));
    
    console.log(`[TIME]  Average response time: ${Math.round(avgResponseTime)}ms`);
    console.log(`[FAST] Fastest: ${minResponseTime}ms | Slowest: ${maxResponseTime}ms`);
  }
  
  // Status by priority
  const criticalSuccess = results.filter(r => r.priority === 'critical' && r.success).length;
  const criticalTotal = results.filter(r => r.priority === 'critical').length;
  
  console.log(`\n[TARGET] Critical endpoints: ${criticalSuccess}/${criticalTotal} successful`);
  
  if (successful === total) {
    console.log('\n[DONE] Server is fully warmed up and ready!');
    console.log('[NEW] Cold start eliminated - all systems operational');
  } else if (criticalSuccess === criticalTotal) {
    console.log('\n[OK] Critical systems warmed up successfully');
    console.log('[WARN]  Some non-critical endpoints need attention');
  } else {
    console.log('\n[WARN]  Warm-up incomplete - some critical endpoints failed');
  }
  
  console.log(`${'═'.repeat(62)}\n`);
  
  return {
    success: successful === total,
    successRate,
    results
  };
};

// Run the warm-up
if (import.meta.url === `file://${process.argv[1]}`) {
  warmUpServer()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('[ERROR] Warm-up failed:', error);
      process.exit(1);
    });
}

export { warmUpServer };