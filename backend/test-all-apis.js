import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import { createCanvas } from 'canvas';

const BASE_URL = 'http://localhost:5001';
const results = [];

// Helper to measure response time
async function testEndpoint(name, url, options = {}) {
  const startTime = Date.now();
  try {
    const response = await fetch(url, options);
    const endTime = Date.now();
    const duration = endTime - startTime;
    const status = response.status;
    const success = status >= 200 && status < 300;
    
    results.push({
      name,
      url,
      status,
      duration: `${duration}ms`,
      success,
      performance: duration < 2000 ? '✅ FAST' : duration < 5000 ? '⚠️ SLOW' : '❌ TOO SLOW'
    });
    
    return { success, duration, response };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    results.push({
      name,
      url,
      status: 'ERROR',
      duration: `${duration}ms`,
      success: false,
      performance: '❌ FAILED',
      error: error.message
    });
    return { success: false, duration, error };
  }
}

// Create test image buffer
function createTestImage() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Draw test pattern
  ctx.fillStyle = '#4A90E2';
  ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '48px Arial';
  ctx.fillText('Test Image', 300, 300);
  
  return canvas.toBuffer('image/jpeg');
}

async function runTests() {
  console.log('\n[TEST SUITE] CHUTKI API Performance Test Suite\n');
  console.log('=' .repeat(80));
  
  const testImage = createTestImage();
  
  // 1. HEALTH & STATUS ENDPOINTS
  console.log('\n📊 1. HEALTH & STATUS ENDPOINTS');
  console.log('-'.repeat(80));
  await testEndpoint('Health Check', `${BASE_URL}/api/health`);
  await testEndpoint('Tools List', `${BASE_URL}/api/tools/list`);
  await testEndpoint('Tools Health', `${BASE_URL}/api/tools/health`);
  
  // 2. AUTHENTICATION ENDPOINTS
  console.log('\n🔐 2. AUTHENTICATION ENDPOINTS');
  console.log('-'.repeat(80));
  
  // Register test
  const registerData = {
    name: 'Test User ' + Date.now(),
    email: `test${Date.now()}@example.com`,
    password: 'Test123!'
  };
  await testEndpoint('Register User', `${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerData)
  });
  
  // Login test
  await testEndpoint('Login User', `${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: registerData.email,
      password: registerData.password
    })
  });
  
  // 3. IMAGE EDITING TOOLS
  console.log('\n🎨 3. IMAGE EDITING TOOLS');
  console.log('-'.repeat(80));
  
  const editingTools = [
    'passport-photo',
    'rotate',
    'flip',
    'grayscale',
    'circle-crop',
    'watermark',
    'pixelate',
    'signature'
  ];
  
  for (const tool of editingTools) {
    const formData = new FormData();
    formData.append('file', testImage, { filename: 'test.jpg', contentType: 'image/jpeg' });
    
    if (tool === 'rotate') formData.append('angle', '90');
    if (tool === 'flip') formData.append('direction', 'horizontal');
    if (tool === 'watermark') {
      formData.append('text', 'TEST');
      formData.append('position', 'center');
    }
    
    await testEndpoint(`Tool: ${tool}`, `${BASE_URL}/api/tools/${tool}`, {
      method: 'POST',
      body: formData
    });
  }
  
  // 4. RESIZE TOOLS
  console.log('\n📏 4. RESIZE TOOLS');
  console.log('-'.repeat(80));
  
  const resizeTools = [
    { tool: 'resize-pixel', params: { width: '500', height: '400' } },
    { tool: 'resize-cm', params: { width: '10', height: '8', dpi: '300' } },
    { tool: 'resize-mm', params: { width: '100', height: '80', dpi: '300' } },
    { tool: 'resize-inches', params: { width: '4', height: '3', dpi: '300' } },
    { tool: 'resize-instagram', params: {} },
    { tool: 'resize-whatsapp', params: {} }
  ];
  
  for (const { tool, params } of resizeTools) {
    const formData = new FormData();
    formData.append('file', testImage, { filename: 'test.jpg', contentType: 'image/jpeg' });
    Object.entries(params).forEach(([key, value]) => formData.append(key, value));
    
    await testEndpoint(`Tool: ${tool}`, `${BASE_URL}/api/tools/${tool}`, {
      method: 'POST',
      body: formData
    });
  }
  
  // 5. COMPRESSION TOOLS
  console.log('\n🗜️  5. COMPRESSION TOOLS');
  console.log('-'.repeat(80));
  
  const compressionTools = [
    'reduce-size-kb',
    'compress-10kb',
    'compress-20kb',
    'compress-50kb',
    'compress-100kb',
    'compress-200kb',
    'compress-500kb',
    'compress-1mb'
  ];
  
  for (const tool of compressionTools) {
    const formData = new FormData();
    formData.append('file', testImage, { filename: 'test.jpg', contentType: 'image/jpeg' });
    
    if (tool === 'reduce-size-kb') {
      formData.append('targetKB', '50');
    }
    
    await testEndpoint(`Tool: ${tool}`, `${BASE_URL}/api/tools/${tool}`, {
      method: 'POST',
      body: formData
    });
  }
  
  // 6. CONVERSION TOOLS
  console.log('\n🔄 6. CONVERSION TOOLS');
  console.log('-'.repeat(80));
  
  const conversionTools = [
    'webp-to-jpg',
    'jpeg-to-png',
    'png-to-jpeg',
    'convert-dpi',
    'check-dpi'
  ];
  
  for (const tool of conversionTools) {
    const formData = new FormData();
    formData.append('file', testImage, { filename: 'test.jpg', contentType: 'image/jpeg' });
    
    if (tool === 'convert-dpi') {
      formData.append('dpi', '300');
    }
    
    await testEndpoint(`Tool: ${tool}`, `${BASE_URL}/api/tools/${tool}`, {
      method: 'POST',
      body: formData
    });
  }
  
  // 7. AI CHAT ENDPOINTS
  console.log('\n🤖 7. AI CHAT ENDPOINTS');
  console.log('-'.repeat(80));
  
  await testEndpoint('AI Chat', `${BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello, how can you help me?' })
  });
  
  await testEndpoint('AI Recommend Tools', `${BASE_URL}/api/ai/recommend-tools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'resize image', imageType: 'photo' })
  });
  
  // SUMMARY REPORT
  console.log('\n' + '='.repeat(80));
  console.log('📊 PERFORMANCE SUMMARY REPORT');
  console.log('='.repeat(80));
  
  const totalTests = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const fast = results.filter(r => r.performance === '✅ FAST').length;
  const slow = results.filter(r => r.performance === '⚠️ SLOW').length;
  const tooSlow = results.filter(r => r.performance === '❌ TOO SLOW').length;
  
  console.log(`\n📈 Total Tests: ${totalTests}`);
  console.log(`✅ Successful: ${successful} (${((successful/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed} (${((failed/totalTests)*100).toFixed(1)}%)`);
  console.log(`\n⚡ Performance Breakdown:`);
  console.log(`  ✅ Fast (<2s): ${fast} (${((fast/totalTests)*100).toFixed(1)}%)`);
  console.log(`  ⚠️  Slow (2-5s): ${slow} (${((slow/totalTests)*100).toFixed(1)}%)`);
  console.log(`  ❌ Too Slow (>5s): ${tooSlow} (${((tooSlow/totalTests)*100).toFixed(1)}%)`);
  
  // Show slow endpoints
  const slowEndpoints = results.filter(r => r.performance !== '✅ FAST');
  if (slowEndpoints.length > 0) {
    console.log('\n⚠️  ENDPOINTS NEEDING OPTIMIZATION:');
    console.log('-'.repeat(80));
    slowEndpoints.forEach(endpoint => {
      console.log(`${endpoint.performance} ${endpoint.name}: ${endpoint.duration}`);
      if (endpoint.error) console.log(`   Error: ${endpoint.error}`);
    });
  }
  
  // Show all results in table
  console.log('\n📋 DETAILED RESULTS:');
  console.log('-'.repeat(80));
  console.table(results.map(r => ({
    'Endpoint': r.name,
    'Status': r.status,
    'Duration': r.duration,
    'Performance': r.performance
  })));
  
  // Average response time
  const durations = results.filter(r => r.success).map(r => parseInt(r.duration));
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  console.log(`\n⏱️  Average Response Time: ${avgDuration.toFixed(0)}ms`);
  
  // Performance grade
  let grade = 'A+';
  if (avgDuration > 2000) grade = 'B';
  if (avgDuration > 3000) grade = 'C';
  if (avgDuration > 5000) grade = 'D';
  if (failed > totalTests * 0.1) grade = 'F';
  
  console.log(`🎯 Overall Performance Grade: ${grade}`);
  console.log('\n' + '='.repeat(80));
}

// Run tests
runTests().catch(console.error);
