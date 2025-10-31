import fetch from 'node-fetch';
import FormData from 'form-data';
import { createCanvas } from 'canvas';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001';
const TEST_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const REQUEST_INTERVAL = 2000; // Request every 2 seconds

// Performance tracking
const metrics = {
  startTime: Date.now(),
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: [],
  endpointStats: {},
  timeSeriesData: [],
  memorySnapshots: []
};

// Endpoints to test
const testEndpoints = [
  { name: 'Health Check', method: 'GET', url: '/api/health' },
  { name: 'Rotate Image', method: 'POST', url: '/api/tools/rotate', needsImage: true },
  { name: 'Compress 50KB', method: 'POST', url: '/api/tools/compress-50kb', needsImage: true },
  { name: 'Resize Pixel', method: 'POST', url: '/api/tools/resize-pixel', needsImage: true },
  { name: 'Grayscale', method: 'POST', url: '/api/tools/grayscale', needsImage: true },
  { name: 'AI Chat', method: 'POST', url: '/api/ai/chat', needsJson: true }
];

// Create test image
function createTestImage() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#4A90E2';
  ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '48px Arial';
  ctx.fillText(`Test ${Date.now()}`, 250, 300);
  
  return canvas.toBuffer('image/jpeg');
}

// Make API request
async function makeRequest(endpoint) {
  const startTime = Date.now();
  
  try {
    let options = { method: endpoint.method };
    
    if (endpoint.needsImage) {
      const formData = new FormData();
      formData.append('file', createTestImage(), { filename: 'test.jpg', contentType: 'image/jpeg' });
      
      if (endpoint.url.includes('rotate')) formData.append('angle', '90');
      if (endpoint.url.includes('resize')) {
        formData.append('width', '500');
        formData.append('height', '400');
      }
      
      options.body = formData;
    } else if (endpoint.needsJson) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify({ message: 'Performance test query' });
    }
    
    const response = await fetch(`${BASE_URL}${endpoint.url}`, options);
    const duration = Date.now() - startTime;
    
    // Update metrics
    metrics.totalRequests++;
    
    if (response.ok) {
      metrics.successfulRequests++;
      metrics.responseTimes.push(duration);
      
      // Track per-endpoint stats
      if (!metrics.endpointStats[endpoint.name]) {
        metrics.endpointStats[endpoint.name] = {
          requests: 0,
          successes: 0,
          failures: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
          responseTimes: []
        };
      }
      
      const stat = metrics.endpointStats[endpoint.name];
      stat.requests++;
      stat.successes++;
      stat.totalTime += duration;
      stat.minTime = Math.min(stat.minTime, duration);
      stat.maxTime = Math.max(stat.maxTime, duration);
      stat.responseTimes.push(duration);
      
    } else {
      metrics.failedRequests++;
      metrics.errors.push({
        endpoint: endpoint.name,
        status: response.status,
        time: new Date().toISOString()
      });
      
      if (!metrics.endpointStats[endpoint.name]) {
        metrics.endpointStats[endpoint.name] = {
          requests: 0,
          successes: 0,
          failures: 0,
          totalTime: 0,
          minTime: Infinity,
          maxTime: 0,
          responseTimes: []
        };
      }
      metrics.endpointStats[endpoint.name].requests++;
      metrics.endpointStats[endpoint.name].failures++;
    }
    
    return { success: true, duration, status: response.status };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    metrics.totalRequests++;
    metrics.failedRequests++;
    metrics.errors.push({
      endpoint: endpoint.name,
      error: error.message,
      time: new Date().toISOString()
    });
    
    return { success: false, duration, error: error.message };
  }
}

// Take memory snapshot
function takeMemorySnapshot() {
  const usage = process.memoryUsage();
  metrics.memorySnapshots.push({
    time: Date.now() - metrics.startTime,
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  });
}

// Progress display
function displayProgress() {
  const elapsed = Date.now() - metrics.startTime;
  const remaining = TEST_DURATION - elapsed;
  const percentComplete = ((elapsed / TEST_DURATION) * 100).toFixed(1);
  
  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
    : 0;
  
  const avgResponseTime = metrics.responseTimes.length > 0
    ? Math.round(metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length)
    : 0;
  
  console.clear();
  console.log('[STRESS TEST] CHUTKI 1-HOUR STRESS TEST');
  console.log('='.repeat(80));
  console.log(`⏱️  Progress: ${percentComplete}% | Time Remaining: ${Math.floor(remaining / 1000 / 60)} minutes`);
  console.log(`📊 Total Requests: ${metrics.totalRequests}`);
  console.log(`✅ Successful: ${metrics.successfulRequests} (${successRate}%)`);
  console.log(`❌ Failed: ${metrics.failedRequests}`);
  console.log(`⚡ Avg Response Time: ${avgResponseTime}ms`);
  console.log(`🧠 Memory Used: ${metrics.memorySnapshots.length > 0 ? metrics.memorySnapshots[metrics.memorySnapshots.length - 1].heapUsed : 0}MB`);
  console.log('='.repeat(80));
  
  // Show recent errors
  if (metrics.errors.length > 0) {
    console.log(`\n⚠️  Recent Errors (Last 5):`);
    metrics.errors.slice(-5).forEach(err => {
      console.log(`   - ${err.endpoint}: ${err.error || 'Status ' + err.status}`);
    });
  }
}

// Generate final report
function generateReport() {
  const duration = Date.now() - metrics.startTime;
  const durationMinutes = Math.floor(duration / 1000 / 60);
  const durationSeconds = Math.floor((duration % (1000 * 60)) / 1000);
  
  const successRate = ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2);
  const avgResponseTime = Math.round(metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length);
  const minResponseTime = Math.min(...metrics.responseTimes);
  const maxResponseTime = Math.max(...metrics.responseTimes);
  
  // Calculate percentiles
  const sorted = [...metrics.responseTimes].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];
  
  // Memory analysis
  const memoryGrowth = metrics.memorySnapshots.length > 1
    ? metrics.memorySnapshots[metrics.memorySnapshots.length - 1].heapUsed - metrics.memorySnapshots[0].heapUsed
    : 0;
  
  const report = `
# [REPORT] CHUTKI 1-HOUR STRESS TEST REPORT
**Date:** ${new Date().toLocaleString()}  
**Duration:** ${durationMinutes} minutes ${durationSeconds} seconds

---

## 📊 OVERALL PERFORMANCE

### Request Statistics
- **Total Requests:** ${metrics.totalRequests}
- **Successful:** ${metrics.successfulRequests} (${successRate}%)
- **Failed:** ${metrics.failedRequests}
- **Requests per Minute:** ${Math.round(metrics.totalRequests / (duration / 60000))}

### Response Time Metrics
- **Average:** ${avgResponseTime}ms
- **Minimum:** ${minResponseTime}ms
- **Maximum:** ${maxResponseTime}ms
- **Median (P50):** ${p50}ms
- **95th Percentile:** ${p95}ms
- **99th Percentile:** ${p99}ms

### Stability Assessment
- **Success Rate:** ${successRate >= 99 ? '✅ EXCELLENT' : successRate >= 95 ? '✅ GOOD' : '⚠️ NEEDS ATTENTION'}
- **Performance:** ${avgResponseTime < 100 ? '✅ EXCELLENT' : avgResponseTime < 500 ? '✅ GOOD' : '⚠️ NEEDS OPTIMIZATION'}
- **Reliability:** ${metrics.failedRequests === 0 ? '✅ PERFECT' : metrics.failedRequests < 10 ? '✅ STABLE' : '⚠️ UNSTABLE'}

---

## 🎯 ENDPOINT BREAKDOWN

${Object.entries(metrics.endpointStats).map(([name, stat]) => {
  const avg = Math.round(stat.totalTime / stat.successes);
  const rate = ((stat.successes / stat.requests) * 100).toFixed(1);
  return `### ${name}
- **Requests:** ${stat.requests}
- **Success Rate:** ${rate}%
- **Avg Response:** ${avg}ms
- **Min/Max:** ${stat.minTime}ms / ${stat.maxTime}ms
- **Status:** ${rate >= 95 ? '✅ Healthy' : '⚠️ Issues Detected'}
`;
}).join('\n')}

---

## 🧠 MEMORY ANALYSIS

### Memory Usage
- **Initial Heap:** ${metrics.memorySnapshots[0]?.heapUsed || 0}MB
- **Final Heap:** ${metrics.memorySnapshots[metrics.memorySnapshots.length - 1]?.heapUsed || 0}MB
- **Memory Growth:** ${memoryGrowth > 0 ? '+' : ''}${memoryGrowth}MB
- **Peak Memory:** ${Math.max(...metrics.memorySnapshots.map(s => s.heapUsed))}MB

### Memory Health
${Math.abs(memoryGrowth) < 50 ? '✅ No significant memory leaks detected' : '⚠️ Potential memory leak - investigate'}

---

## ⚠️ ERRORS & ISSUES

${metrics.errors.length === 0 ? '✅ No errors encountered during the test!' : `
**Total Errors:** ${metrics.errors.length}

### Error Summary
${metrics.errors.slice(0, 10).map((err, i) => 
  `${i + 1}. **${err.endpoint}**: ${err.error || 'Status ' + err.status} (${err.time})`
).join('\n')}

${metrics.errors.length > 10 ? `\n... and ${metrics.errors.length - 10} more errors` : ''}
`}

---

## 📈 PERFORMANCE TRENDS

### Response Time Over Time
${generateTimeSeriesAnalysis()}

### Throughput
- **Average Requests/Second:** ${(metrics.totalRequests / (duration / 1000)).toFixed(2)}
- **Peak Performance:** ${avgResponseTime < 100 ? 'Maintained' : 'Varied'}

---

## 🎯 FINAL VERDICT

### Overall Grade: ${calculateGrade()}

### Recommendations:
${generateRecommendations()}

---

## 📋 TEST CONFIGURATION

- **Test Duration:** ${durationMinutes} minutes
- **Request Interval:** 2 seconds
- **Endpoints Tested:** ${testEndpoints.length}
- **Base URL:** ${BASE_URL}

---

*Report generated automatically by CHUTKI Stress Test Suite*
*End Time: ${new Date().toLocaleString()}*
`;

  return report;
}

// Calculate performance grade
function calculateGrade() {
  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
  const avgTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
  
  if (successRate >= 99 && avgTime < 100) return '⭐⭐⭐⭐⭐ A+ (EXCELLENT)';
  if (successRate >= 95 && avgTime < 200) return '⭐⭐⭐⭐ A (VERY GOOD)';
  if (successRate >= 90 && avgTime < 500) return '⭐⭐⭐ B (GOOD)';
  if (successRate >= 80) return '⭐⭐ C (ACCEPTABLE)';
  return '⭐ D (NEEDS IMPROVEMENT)';
}

// Generate recommendations
function generateRecommendations() {
  const recommendations = [];
  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
  const avgTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
  const memoryGrowth = metrics.memorySnapshots.length > 1
    ? metrics.memorySnapshots[metrics.memorySnapshots.length - 1].heapUsed - metrics.memorySnapshots[0].heapUsed
    : 0;
  
  if (successRate >= 99) {
    recommendations.push('✅ Excellent reliability - system is production-ready');
  } else if (successRate < 95) {
    recommendations.push('⚠️ Consider investigating failed requests and adding retry logic');
  }
  
  if (avgTime < 100) {
    recommendations.push('✅ Outstanding response times - no optimization needed');
  } else if (avgTime > 500) {
    recommendations.push('⚠️ Response times could be improved - consider caching or optimization');
  }
  
  if (Math.abs(memoryGrowth) > 50) {
    recommendations.push('⚠️ Significant memory growth detected - check for memory leaks');
  } else {
    recommendations.push('✅ Memory usage is stable and healthy');
  }
  
  if (metrics.errors.length === 0) {
    recommendations.push('✅ Zero errors - system is highly stable');
  }
  
  return recommendations.join('\n');
}

// Time series analysis
function generateTimeSeriesAnalysis() {
  const chunks = 6; // Divide hour into 6 chunks (10 min each)
  const chunkSize = Math.floor(metrics.responseTimes.length / chunks);
  
  let analysis = '';
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunkTimes = metrics.responseTimes.slice(start, end);
    
    if (chunkTimes.length > 0) {
      const avg = Math.round(chunkTimes.reduce((a, b) => a + b, 0) / chunkTimes.length);
      analysis += `- **${i * 10}-${(i + 1) * 10} min:** ${avg}ms average\n`;
    }
  }
  
  return analysis;
}

// Main test loop
async function runStressTest() {
  console.log('[START] Starting 1-hour stress test...\n');
  console.log('Testing endpoints:', testEndpoints.map(e => e.name).join(', '));
  console.log('\nPress Ctrl+C to stop early and generate report\n');
  
  const startTime = Date.now();
  let currentEndpointIndex = 0;
  
  // Take initial memory snapshot
  takeMemorySnapshot();
  
  const interval = setInterval(async () => {
    const elapsed = Date.now() - startTime;
    
    if (elapsed >= TEST_DURATION) {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearInterval(memoryInterval);
      await finishTest();
      return;
    }
    
    // Make request
    const endpoint = testEndpoints[currentEndpointIndex];
    await makeRequest(endpoint);
    
    // Rotate to next endpoint
    currentEndpointIndex = (currentEndpointIndex + 1) % testEndpoints.length;
    
  }, REQUEST_INTERVAL);
  
  // Update progress display every 5 seconds
  const progressInterval = setInterval(displayProgress, 5000);
  
  // Take memory snapshot every minute
  const memoryInterval = setInterval(takeMemorySnapshot, 60000);
  
  // Handle Ctrl+C
  process.on('SIGINT', async () => {
    clearInterval(interval);
    clearInterval(progressInterval);
    clearInterval(memoryInterval);
    console.log('\n\n⚠️  Test interrupted by user. Generating report...\n');
    await finishTest();
    process.exit(0);
  });
}

// Finish test and generate report
async function finishTest() {
  console.log('\n\n✅ Test completed! Generating report...\n');
  
  const report = generateReport();
  const filename = `STRESS_TEST_REPORT_${Date.now()}.md`;
  
  fs.writeFileSync(filename, report);
  
  console.log('='.repeat(80));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(80));
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%`);
  console.log(`Avg Response Time: ${Math.round(metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length)}ms`);
  console.log(`Overall Grade: ${calculateGrade()}`);
  console.log('='.repeat(80));
  console.log(`\n📄 Full report saved to: ${filename}\n`);
  
  // Also print report to console
  console.log(report);
}

// Start the test
runStressTest();
