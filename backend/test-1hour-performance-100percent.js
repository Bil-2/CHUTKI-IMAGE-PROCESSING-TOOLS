import fetch from 'node-fetch';
import FormData from 'form-data';
import { createCanvas } from 'canvas';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001';
const TEST_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const REQUEST_INTERVAL = 5000; // 5 seconds between requests
const HEALTH_CHECK_INTERVAL = 10000; // 10 seconds

// Test configuration
const testConfig = {
  startTime: Date.now(),
  endTime: null,
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  healthChecks: 0,
  healthChecksPassed: 0,
  healthChecksFailed: 0,
  responseTimesMs: [],
  errors: [],
  uptimeChecks: [],
  memoryUsage: [],
  cpuUsage: [],
  toolsUsed: new Map(),
  performanceMetrics: {
    avgResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    p50ResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0
  }
};

// All available tools for testing
const AVAILABLE_TOOLS = [
  { name: 'Compress 100KB', endpoint: '/api/tools/compress-100kb', params: {} },
  { name: 'Compress 50KB', endpoint: '/api/tools/compress-50kb', params: {} },
  { name: 'Resize Pixel', endpoint: '/api/tools/resize-pixel', params: { width: 800, height: 600 } },
  { name: 'Rotate', endpoint: '/api/tools/rotate', params: { angle: 90 } },
  { name: 'Flip', endpoint: '/api/tools/flip', params: { direction: 'horizontal' } },
  { name: 'Grayscale', endpoint: '/api/tools/grayscale', params: {} },
  { name: 'Circle Crop', endpoint: '/api/tools/circle-crop', params: {} },
  { name: 'Pixelate', endpoint: '/api/tools/pixelate', params: { intensity: 10 } },
  { name: 'HEIC to JPG', endpoint: '/api/tools/heic-to-jpg', params: { quality: 90 } },
  { name: 'PNG to JPEG', endpoint: '/api/tools/png-to-jpeg', params: { quality: 90 } },
  { name: 'Watermark', endpoint: '/api/tools/watermark', params: { text: 'CHUTKI', position: 'bottom-right' } },
  { name: 'Passport Photo', endpoint: '/api/tools/passport-photo', params: { size: '2x2', dpi: '300' } },
];

// Create test image
function createTestImage() {
  const canvas = createCanvas(1200, 800);
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(0.5, '#764ba2');
  gradient.addColorStop(1, '#f093fb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 800);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CHUTKI Performance Test', 600, 300);
  ctx.font = '30px Arial';
  ctx.fillText(`Request #${testConfig.totalRequests + 1}`, 600, 400);
  ctx.fillText(new Date().toLocaleString(), 600, 450);
  
  return canvas.toBuffer('image/jpeg');
}

// Health check
async function performHealthCheck() {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      testConfig.healthChecksPassed++;
      testConfig.uptimeChecks.push({ time: new Date(), status: 'UP', responseTime: duration });
      return true;
    } else {
      testConfig.healthChecksFailed++;
      testConfig.uptimeChecks.push({ time: new Date(), status: 'DOWN', responseTime: duration });
      return false;
    }
  } catch (error) {
    testConfig.healthChecksFailed++;
    testConfig.uptimeChecks.push({ time: new Date(), status: 'DOWN', error: error.message });
    return false;
  } finally {
    testConfig.healthChecks++;
  }
}

// Test random tool
async function testRandomTool() {
  const tool = AVAILABLE_TOOLS[Math.floor(Math.random() * AVAILABLE_TOOLS.length)];
  const startTime = Date.now();
  
  try {
    const formData = new FormData();
    formData.append('file', createTestImage(), { 
      filename: 'test.jpg', 
      contentType: 'image/jpeg' 
    });
    
    Object.entries(tool.params).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    
    const response = await fetch(`${BASE_URL}${tool.endpoint}`, {
      method: 'POST',
      body: formData,
      timeout: 30000
    });
    
    const duration = Date.now() - startTime;
    testConfig.responseTimesMs.push(duration);
    
    if (response.ok) {
      testConfig.successfulRequests++;
      
      // Track tool usage
      const count = testConfig.toolsUsed.get(tool.name) || 0;
      testConfig.toolsUsed.set(tool.name, count + 1);
      
      return { success: true, tool: tool.name, duration, status: response.status };
    } else {
      testConfig.failedRequests++;
      const error = { tool: tool.name, status: response.status, duration, time: new Date() };
      testConfig.errors.push(error);
      return { success: false, ...error };
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    testConfig.failedRequests++;
    const err = { tool: tool.name, error: error.message, duration, time: new Date() };
    testConfig.errors.push(err);
    return { success: false, ...err };
  } finally {
    testConfig.totalRequests++;
  }
}

// Calculate performance metrics
function calculateMetrics() {
  if (testConfig.responseTimesMs.length === 0) return;
  
  const sorted = [...testConfig.responseTimesMs].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  testConfig.performanceMetrics.avgResponseTime = Math.round(sum / sorted.length);
  testConfig.performanceMetrics.minResponseTime = sorted[0];
  testConfig.performanceMetrics.maxResponseTime = sorted[sorted.length - 1];
  testConfig.performanceMetrics.p50ResponseTime = sorted[Math.floor(sorted.length * 0.5)];
  testConfig.performanceMetrics.p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)];
  testConfig.performanceMetrics.p99ResponseTime = sorted[Math.floor(sorted.length * 0.99)];
}

// Display real-time progress
function displayProgress() {
  const elapsed = Date.now() - testConfig.startTime;
  const remaining = TEST_DURATION - elapsed;
  const progress = (elapsed / TEST_DURATION * 100).toFixed(1);
  const successRate = testConfig.totalRequests > 0 
    ? ((testConfig.successfulRequests / testConfig.totalRequests) * 100).toFixed(2)
    : 0;
  const uptime = testConfig.healthChecks > 0
    ? ((testConfig.healthChecksPassed / testConfig.healthChecks) * 100).toFixed(2)
    : 0;
  
  calculateMetrics();
  
  console.clear();
  console.log('═'.repeat(110));
  console.log('[PERFORMANCE TEST] CHUTKI - 1 HOUR NON-STOP PERFORMANCE & 100% UPTIME MONITORING');
  console.log('═'.repeat(110));
  console.log(`\n⏱️  Progress: ${progress}% | Elapsed: ${formatTime(elapsed)} | Remaining: ${formatTime(remaining)}`);
  console.log(`🎯 Target: 100% Success Rate | 100% Uptime | 1 Hour Duration`);
  console.log('═'.repeat(110));
  
  console.log(`\n📊 REQUEST STATISTICS:`);
  console.log(`   Total Requests: ${testConfig.totalRequests}`);
  console.log(`   ✅ Successful: ${testConfig.successfulRequests} (${successRate}%)`);
  console.log(`   ❌ Failed: ${testConfig.failedRequests}`);
  console.log(`   🎯 Success Rate: ${successRate}% ${successRate === '100.00' ? '✅ PERFECT!' : successRate >= '95.00' ? '⚠️' : '❌'}`);
  
  console.log(`\n🏥 UPTIME MONITORING:`);
  console.log(`   Health Checks: ${testConfig.healthChecks}`);
  console.log(`   ✅ Passed: ${testConfig.healthChecksPassed}`);
  console.log(`   ❌ Failed: ${testConfig.healthChecksFailed}`);
  console.log(`   📈 Uptime: ${uptime}% ${uptime === '100.00' ? '✅ 100% UPTIME!' : uptime >= '99.00' ? '⚠️' : '❌'}`);
  
  console.log(`\n⚡ PERFORMANCE METRICS:`);
  console.log(`   Average Response Time: ${testConfig.performanceMetrics.avgResponseTime}ms`);
  console.log(`   Min/Max: ${testConfig.performanceMetrics.minResponseTime}ms / ${testConfig.performanceMetrics.maxResponseTime}ms`);
  console.log(`   P50 (Median): ${testConfig.performanceMetrics.p50ResponseTime}ms`);
  console.log(`   P95: ${testConfig.performanceMetrics.p95ResponseTime}ms`);
  console.log(`   P99: ${testConfig.performanceMetrics.p99ResponseTime}ms`);
  
  if (testConfig.toolsUsed.size > 0) {
    console.log(`\n🛠️  TOOLS TESTED (Top 5):`);
    const topTools = [...testConfig.toolsUsed.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    topTools.forEach(([tool, count]) => {
      console.log(`   ${tool}: ${count} requests`);
    });
  }
  
  if (testConfig.errors.length > 0) {
    console.log(`\n⚠️  RECENT ERRORS (Last 3):`);
    testConfig.errors.slice(-3).forEach(err => {
      console.log(`   ${err.tool}: ${err.error || `Status ${err.status}`} (${err.duration}ms)`);
    });
  }
  
  console.log('\n' + '═'.repeat(110));
  console.log(`💡 Target Achievement: Success Rate ${successRate === '100.00' ? '✅' : '❌'} | Uptime ${uptime === '100.00' ? '✅' : '❌'}`);
  console.log('═'.repeat(110));
}

// Format time
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
}

// Generate final report
async function generateFinalReport() {
  testConfig.endTime = Date.now();
  const duration = testConfig.endTime - testConfig.startTime;
  const successRate = ((testConfig.successfulRequests / testConfig.totalRequests) * 100).toFixed(2);
  const uptime = ((testConfig.healthChecksPassed / testConfig.healthChecks) * 100).toFixed(2);
  
  calculateMetrics();
  
  const report = `# CHUTKI - 1 HOUR PERFORMANCE TEST REPORT

**Test Completed:** ${new Date().toLocaleString()}  
**Duration:** ${formatTime(duration)}  
**Target:** 100% Success Rate | 100% Uptime

---

## 🎯 ACHIEVEMENT STATUS

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Success Rate | 100% | ${successRate}% | ${successRate === '100.00' ? '✅ PERFECT' : successRate >= '95.00' ? '⚠️ GOOD' : '❌ NEEDS IMPROVEMENT'} |
| Uptime | 100% | ${uptime}% | ${uptime === '100.00' ? '✅ PERFECT' : uptime >= '99.00' ? '⚠️ GOOD' : '❌ NEEDS IMPROVEMENT'} |
| Test Duration | 60 minutes | ${formatTime(duration)} | ✅ COMPLETE |

---

## 📊 REQUEST STATISTICS

- **Total Requests:** ${testConfig.totalRequests}
- **✅ Successful Requests:** ${testConfig.successfulRequests} (${successRate}%)
- **❌ Failed Requests:** ${testConfig.failedRequests}
- **📈 Requests per Minute:** ${Math.round(testConfig.totalRequests / (duration / 60000))}

---

## 🏥 UPTIME MONITORING

- **Total Health Checks:** ${testConfig.healthChecks}
- **✅ Passed:** ${testConfig.healthChecksPassed}
- **❌ Failed:** ${testConfig.healthChecksFailed}
- **📈 Uptime Percentage:** ${uptime}%
- **✅ 100% Uptime Achieved:** ${uptime === '100.00' ? 'YES 🎉' : 'NO ⚠️'}

---

## ⚡ PERFORMANCE METRICS

| Metric | Value |
|--------|-------|
| Average Response Time | ${testConfig.performanceMetrics.avgResponseTime}ms |
| Minimum Response Time | ${testConfig.performanceMetrics.minResponseTime}ms |
| Maximum Response Time | ${testConfig.performanceMetrics.maxResponseTime}ms |
| Median (P50) | ${testConfig.performanceMetrics.p50ResponseTime}ms |
| P95 | ${testConfig.performanceMetrics.p95ResponseTime}ms |
| P99 | ${testConfig.performanceMetrics.p99ResponseTime}ms |

---

## 🛠️ TOOLS USAGE BREAKDOWN

${[...testConfig.toolsUsed.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([tool, count]) => `- **${tool}:** ${count} requests`)
  .join('\n')}

---

## ${testConfig.errors.length > 0 ? '⚠️ ERRORS DETECTED' : '✅ NO ERRORS'}

${testConfig.errors.length > 0 ? `
**Total Errors:** ${testConfig.errors.length}

${testConfig.errors.slice(0, 20).map((err, i) => 
  `${i + 1}. **${err.tool}** - ${err.error || `Status ${err.status}`} (${err.duration}ms) - ${new Date(err.time).toLocaleTimeString()}`
).join('\n')}

${testConfig.errors.length > 20 ? `\n*...and ${testConfig.errors.length - 20} more errors*` : ''}
` : '**No errors occurred during the entire test! 🎉**'}

---

## 🏆 FINAL VERDICT

${successRate === '100.00' && uptime === '100.00' ? `
### ✅ PERFECT SCORE - 100% SUCCESS & 100% UPTIME ACHIEVED!

**Congratulations!** Your CHUTKI platform has achieved:
- ✅ **100% Success Rate** - All ${testConfig.totalRequests} requests succeeded
- ✅ **100% Uptime** - Platform was available throughout the entire test
- ✅ **Consistent Performance** - Average ${testConfig.performanceMetrics.avgResponseTime}ms response time

**Platform Status:** PRODUCTION READY 🚀
` : `
### ${successRate >= '95.00' && uptime >= '99.00' ? '⚠️ EXCELLENT PERFORMANCE' : '❌ NEEDS IMPROVEMENT'}

**Results:**
- Success Rate: ${successRate}% ${successRate >= '95.00' ? '✅' : '❌'}
- Uptime: ${uptime}% ${uptime >= '99.00' ? '✅' : '❌'}
- ${testConfig.errors.length} errors detected

**Recommendations:**
${testConfig.errors.length > 0 ? '- Investigate and fix the errors listed above' : ''}
${successRate < '100.00' ? '- Improve error handling for edge cases' : ''}
${uptime < '100.00' ? '- Enhance server stability and resource management' : ''}
`}

---

**Generated:** ${new Date().toLocaleString()}  
**Platform:** CHUTKI Image Processing Platform  
**Test Type:** 1 Hour Non-Stop Performance & Uptime Monitoring
`;

  const filename = `PERFORMANCE_TEST_1HOUR_${Date.now()}.md`;
  fs.writeFileSync(filename, report);
  
  console.clear();
  console.log('\n\n' + '═'.repeat(110));
  console.log('[COMPLETE] 1 HOUR PERFORMANCE TEST FINISHED');
  console.log('═'.repeat(110));
  console.log(report);
  console.log('═'.repeat(110));
  console.log(`\n📄 Full report saved to: ${filename}\n`);
  
  return { successRate, uptime, perfect: successRate === '100.00' && uptime === '100.00' };
}

// Main test execution
async function runPerformanceTest() {
  console.log('[START] CHUTKI - 1 Hour Performance Test');
  console.log(`Target: 100% Success Rate | 100% Uptime | ${TEST_DURATION / 60000} Minutes\n`);
  
  // Start health check monitoring
  const healthCheckInterval = setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);
  
  // Start request loop
  const requestInterval = setInterval(async () => {
    await testRandomTool();
    displayProgress();
    
    // Check if test duration completed
    if (Date.now() - testConfig.startTime >= TEST_DURATION) {
      clearInterval(requestInterval);
      clearInterval(healthCheckInterval);
      
      const result = await generateFinalReport();
      
      if (result.perfect) {
        console.log('\n🎉 PERFECT SCORE ACHIEVED! 100% SUCCESS & 100% UPTIME!\n');
        process.exit(0);
      } else {
        console.log(`\n⚠️  Test completed with ${result.successRate}% success rate and ${result.uptime}% uptime\n`);
        process.exit(0);
      }
    }
  }, REQUEST_INTERVAL);
  
  // Initial display
  displayProgress();
}

// Start the test
runPerformanceTest().catch(error => {
  console.error('[ERROR] Performance test failed:', error);
  process.exit(1);
});
