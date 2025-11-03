#!/usr/bin/env node

// CHUTKI Server Warm-up Script
// This script warms up the production server to reduce cold start times

const BACKEND_URL = 'https://chutki-image-processing-tools.onrender.com';

const endpoints = [
  '/api/health',
  '/api/tools/health',
  '/api/tools/list'
];

const warmUpEndpoint = async (endpoint) => {
  try {
    console.log(`🔥 Warming up: ${endpoint}`);
    const startTime = Date.now();
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'CHUTKI-WarmUp-Script',
        'Accept': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.ok) {
      console.log(`✅ ${endpoint} - ${response.status} (${responseTime}ms)`);
    } else {
      console.log(`⚠️ ${endpoint} - ${response.status} (${responseTime}ms)`);
    }
    
    return { endpoint, status: response.status, responseTime, success: response.ok };
  } catch (error) {
    console.log(`❌ ${endpoint} - Error: ${error.message}`);
    return { endpoint, error: error.message, success: false };
  }
};

const warmUpServer = async () => {
  console.log('🚀 Starting CHUTKI Server Warm-up...');
  console.log(`📡 Target: ${BACKEND_URL}`);
  console.log('=' .repeat(50));
  
  const results = [];
  
  // Warm up endpoints sequentially
  for (const endpoint of endpoints) {
    const result = await warmUpEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('=' .repeat(50));
  console.log('📊 Warm-up Summary:');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  
  if (successful === total) {
    console.log('🎉 Server is now warm and ready!');
  } else {
    console.log('⚠️ Some endpoints failed to warm up');
  }
  
  // Calculate average response time
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + r.responseTime, 0) / successful;
    
  if (avgResponseTime) {
    console.log(`⏱️ Average response time: ${Math.round(avgResponseTime)}ms`);
  }
};

// Run the warm-up
warmUpServer().catch(console.error);

export { warmUpServer };