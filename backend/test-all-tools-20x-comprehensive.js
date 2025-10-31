import fetch from 'node-fetch';
import FormData from 'form-data';
import { createCanvas } from 'canvas';
import fs from 'fs';

const BASE_URL = 'http://localhost:5001';
const ITERATIONS_PER_TOOL = 20;
const DELAY_BETWEEN_REQUESTS = 8000;
const DELAY_BETWEEN_TOOLS = 5000;
const RATE_LIMIT_WAIT = 90000;

// ALL 100+ TOOLS COMPREHENSIVE LIST
const ALL_TOOLS = [
  // IMAGE EDITING TOOLS (47 tools)
  { name: 'Passport Photo Maker', endpoint: '/api/tools/passport-photo', params: { size: '2x2', dpi: '300', background: '#FFFFFF' } },
  { name: 'Reduce Image Size in KB', endpoint: '/api/tools/reduce-size-kb', params: { targetKB: 100 } },
  { name: 'Resize Image Pixel', endpoint: '/api/tools/resize-pixel', params: { width: 800, height: 600, maintain: 'true' } },
  { name: 'Generate Signature', endpoint: '/api/tools/generate-signature', params: { enhance: 'true' } },
  { name: 'Increase Image Size In KB', endpoint: '/api/tools/increase-size-kb', params: { targetKB: 500 } },
  { name: 'Watermark Images', endpoint: '/api/tools/watermark', params: { text: 'CHUTKI', position: 'bottom-right', opacity: 0.7 } },
  { name: 'Resize Signature', endpoint: '/api/tools/resize-signature', params: { width: 200, height: 80 } },
  { name: 'Rotate Image', endpoint: '/api/tools/rotate', params: { angle: 90, background: 'white' } },
  { name: 'Flip Image', endpoint: '/api/tools/flip', params: { direction: 'horizontal' } },
  { name: 'Resize 6x2 300DPI', endpoint: '/api/tools/resize-6x2-300dpi', params: { dpi: 300 } },
  { name: 'Resize CM', endpoint: '/api/tools/resize-cm', params: { width: 10, height: 15, dpi: 300 } },
  { name: 'Resize MM', endpoint: '/api/tools/resize-mm', params: { width: 100, height: 150, dpi: 300 } },
  { name: 'Resize Inches', endpoint: '/api/tools/resize-inches', params: { width: 4, height: 6, dpi: 300 } },
  { name: 'Add Name & DOB', endpoint: '/api/tools/add-name-dob', params: { name: 'John Doe', dob: '01/01/1990', position: 'bottom' } },
  { name: 'Convert DPI', endpoint: '/api/tools/convert-dpi', params: { dpi: 300 } },
  { name: 'Check DPI', endpoint: '/api/tools/check-dpi', params: {}, returnsJson: true },
  { name: 'Resize 3.5x4.5cm', endpoint: '/api/tools/resize-3-5x4-5cm', params: { dpi: 300 } },
  { name: 'Resize Sign 50x20mm', endpoint: '/api/tools/resize-sign-50x20mm', params: { dpi: 300 } },
  { name: 'Resize Instagram', endpoint: '/api/tools/resize-instagram', params: { format: 'square' } },
  { name: 'Resize WhatsApp DP', endpoint: '/api/tools/resize-whatsapp-dp', params: {} },
  { name: 'Instagram Grid Maker', endpoint: '/api/tools/instagram-grid', params: { rows: 3, cols: 3 } },
  { name: 'Circle Crop', endpoint: '/api/tools/circle-crop', params: {} },
  { name: 'Pixelate Image', endpoint: '/api/tools/pixelate', params: { intensity: 10 } },
  { name: 'Grayscale Image', endpoint: '/api/tools/grayscale', params: {} },
  { name: 'Black & White', endpoint: '/api/tools/black-white', params: {} },
  { name: 'Remove Background', endpoint: '/api/tools/remove-background', params: { quality: 'high' } },
  { name: 'Resize 4x6', endpoint: '/api/tools/resize-4x6', params: { dpi: 300 } },
  { name: 'Resize 3x4', endpoint: '/api/tools/resize-3x4', params: { dpi: 300 } },
  { name: 'Resize 2x2 Inch', endpoint: '/api/tools/resize-2x2', params: { dpi: 300 } },
  { name: 'Resize 600x600', endpoint: '/api/tools/resize-600x600', params: { quality: 90 } },
  { name: 'Resize 35x45mm', endpoint: '/api/tools/resize-35x45mm', params: { dpi: 300 } },
  { name: 'Resize A4', endpoint: '/api/tools/resize-a4', params: { dpi: 300 } },
  { name: 'Resize SSC', endpoint: '/api/tools/resize-ssc', params: { dpi: 300, quality: 90 } },
  { name: 'Resize PAN Card', endpoint: '/api/tools/resize-pan', params: { dpi: 300, quality: 90 } },
  { name: 'Resize UPSC', endpoint: '/api/tools/resize-upsc', params: { dpi: 300, quality: 90 } },
  { name: 'Picture to Pixel Art', endpoint: '/api/tools/pixel-art', params: { pixelSize: 10 } },
  { name: 'Resize YouTube Banner', endpoint: '/api/tools/resize-youtube-banner', params: { quality: 90 } },

  // IMAGE CONVERSION TOOLS (13 tools)
  { name: 'HEIC to JPG', endpoint: '/api/tools/heic-to-jpg', params: { quality: 90 } },
  { name: 'WEBP to JPG', endpoint: '/api/tools/webp-to-jpg', params: { quality: 90 } },
  { name: 'JPEG to PNG', endpoint: '/api/tools/jpeg-to-png', params: { quality: 90 } },
  { name: 'PNG to JPEG', endpoint: '/api/tools/png-to-jpeg', params: { quality: 90, background: '#FFFFFF' } },
  { name: 'JPG to PDF 50KB', endpoint: '/api/tools/jpg-to-pdf-50kb', params: { quality: 80 } },
  { name: 'JPG to PDF 100KB', endpoint: '/api/tools/jpg-to-pdf-100kb', params: { quality: 85 } },
  { name: 'JPEG to PDF 200KB', endpoint: '/api/tools/jpeg-to-pdf-200kb', params: { quality: 90 } },
  { name: 'JPG to PDF 300KB', endpoint: '/api/tools/jpg-to-pdf-300kb', params: { quality: 90 } },
  { name: 'JPG to PDF 500KB', endpoint: '/api/tools/jpg-to-pdf-500kb', params: { quality: 95 } },
  { name: 'Image To PDF', endpoint: '/api/tools/image-to-pdf', params: { pageSize: 'A4' } },
  { name: 'PDF To JPG', endpoint: '/api/tools/pdf-to-jpg', params: { dpi: 150, quality: 90 } },

  // IMAGE COMPRESSION TOOLS (21 tools)
  { name: 'Image Compressor', endpoint: '/api/tools/image-compressor', params: { quality: 80 } },
  { name: 'Reduce Size MB', endpoint: '/api/tools/reduce-size-mb', params: { targetMB: 1 } },
  { name: 'Compress 5KB', endpoint: '/api/tools/compress-5kb', params: {} },
  { name: 'Compress 10KB', endpoint: '/api/tools/compress-10kb', params: {} },
  { name: 'Compress 15KB', endpoint: '/api/tools/compress-15kb', params: {} },
  { name: 'Compress 20KB', endpoint: '/api/tools/compress-20kb', params: {} },
  { name: 'Compress 20-50KB', endpoint: '/api/tools/compress-20-50kb', params: { targetKB: 35 } },
  { name: 'Compress 25KB', endpoint: '/api/tools/compress-25kb', params: {} },
  { name: 'Compress 30KB', endpoint: '/api/tools/compress-30kb', params: {} },
  { name: 'Compress 40KB', endpoint: '/api/tools/compress-40kb', params: {} },
  { name: 'Compress 50KB', endpoint: '/api/tools/compress-50kb', params: {} },
  { name: 'Compress 100KB', endpoint: '/api/tools/compress-100kb', params: {} },
  { name: 'Compress 150KB', endpoint: '/api/tools/compress-150kb', params: {} },
  { name: 'Compress 200KB', endpoint: '/api/tools/compress-200kb', params: {} },
  { name: 'Compress 300KB', endpoint: '/api/tools/compress-300kb', params: {} },
  { name: 'Compress 500KB', endpoint: '/api/tools/compress-500kb', params: {} },
  { name: 'Compress 1MB', endpoint: '/api/tools/compress-1mb', params: {} },
  { name: 'Compress 2MB', endpoint: '/api/tools/compress-2mb', params: {} },
  { name: 'JPG to KB', endpoint: '/api/tools/jpg-to-kb', params: { targetKB: 100 } },
  { name: 'MB to KB', endpoint: '/api/tools/mb-to-kb', params: { targetKB: 500 } },
  { name: 'KB to MB', endpoint: '/api/tools/kb-to-mb', params: { targetMB: 2 } }
];

const testResults = {
  startTime: Date.now(),
  endTime: null,
  totalTools: ALL_TOOLS.length,
  totalTests: ALL_TOOLS.length * ITERATIONS_PER_TOOL,
  completedTests: 0,
  toolResults: {},
  overallStats: {
    totalSuccesses: 0,
    totalFailures: 0,
    totalResponseTime: 0,
    perfectTools: 0,
    failedTools: 0,
    errors: []
  }
};

function createTestImage() {
  const canvas = createCanvas(1000, 750);
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createLinearGradient(0, 0, 1000, 750);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(0.5, '#764ba2');
  gradient.addColorStop(1, '#f093fb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1000, 750);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CHUTKI 20x Test', 500, 300);
  ctx.font = '24px Arial';
  ctx.fillText(`Test #${testResults.completedTests + 1}`, 500, 350);
  ctx.fillText(new Date().toLocaleString(), 500, 400);
  
  return canvas.toBuffer('image/jpeg');
}

async function testTool(tool, iteration) {
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
    
    if (response.status === 429) {
      return { success: false, status: 429, duration, iteration, rateLimited: true };
    }
    
    return {
      success: response.ok,
      status: response.status,
      duration,
      iteration,
      rateLimited: false,
      isJson: tool.returnsJson
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    return { success: false, error: error.message, duration, iteration, rateLimited: false };
  }
}

function displayProgress() {
  const elapsed = Date.now() - testResults.startTime;
  const progress = (testResults.completedTests / testResults.totalTests * 100).toFixed(1);
  const avgTime = testResults.overallStats.totalSuccesses > 0 
    ? Math.round(testResults.overallStats.totalResponseTime / testResults.overallStats.totalSuccesses)
    : 0;
  const successRate = testResults.completedTests > 0
    ? ((testResults.overallStats.totalSuccesses / testResults.completedTests) * 100).toFixed(2)
    : 0;
  
  console.clear();
  console.log('═'.repeat(120));
  console.log('[TEST] CHUTKI - COMPREHENSIVE 20x TOOL TESTING | TARGET: 100% SUCCESS RATE');
  console.log('═'.repeat(120));
  console.log(`\n⏱️  Progress: ${progress}% | Tests: ${testResults.completedTests}/${testResults.totalTests} | Elapsed: ${Math.floor(elapsed/1000)}s`);
  console.log(`🎯 Target: 100% Success Rate | 20 Iterations Per Tool | ${testResults.totalTools} Total Tools`);
  console.log('═'.repeat(120));
  console.log(`\n📊 CURRENT STATISTICS:`);
  console.log(`   Tools Tested: ${Object.keys(testResults.toolResults).length}/${testResults.totalTools}`);
  console.log(`   ✅ Successes: ${testResults.overallStats.totalSuccesses} (${successRate}%)`);
  console.log(`   ❌ Failures: ${testResults.overallStats.totalFailures}`);
  console.log(`   ⚡ Avg Response: ${avgTime}ms`);
  console.log(`   🏆 Perfect Tools (20/20): ${testResults.overallStats.perfectTools}`);
  
  const recentTools = Object.entries(testResults.toolResults).slice(-5);
  if (recentTools.length > 0) {
    console.log(`\n📋 Recent Tests:`);
    recentTools.forEach(([name, result]) => {
      const rate = ((result.successes / result.attempts) * 100).toFixed(0);
      const status = rate === '100' ? '✅' : rate >= '90' ? '⚠️' : '❌';
      console.log(`   ${status} ${name}: ${result.successes}/${result.attempts} (${rate}%)`);
    });
  }
  console.log('═'.repeat(120));
}

async function runAllToolsTest() {
  console.log('[START] Testing all tools - 20 iterations each...\n');
  
  for (const tool of ALL_TOOLS) {
    console.log(`\n[TESTING] ${tool.name}...`);
    
    testResults.toolResults[tool.name] = {
      endpoint: tool.endpoint,
      attempts: 0,
      successes: 0,
      failures: 0,
      totalTime: 0,
      minTime: Infinity,
      maxTime: 0,
      avgTime: 0,
      errors: []
    };
    
    for (let i = 1; i <= ITERATIONS_PER_TOOL; i++) {
      const result = await testTool(tool, i);
      const toolResult = testResults.toolResults[tool.name];
      
      toolResult.attempts++;
      testResults.completedTests++;
      
      if (result.rateLimited) {
        console.log(`[RATE LIMIT] Waiting ${RATE_LIMIT_WAIT/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_WAIT));
        i--;
        toolResult.attempts--;
        testResults.completedTests--;
        continue;
      }
      
      if (result.success) {
        toolResult.successes++;
        toolResult.totalTime += result.duration;
        toolResult.minTime = Math.min(toolResult.minTime, result.duration);
        toolResult.maxTime = Math.max(toolResult.maxTime, result.duration);
        testResults.overallStats.totalSuccesses++;
        testResults.overallStats.totalResponseTime += result.duration;
      } else {
        toolResult.failures++;
        toolResult.errors.push({ iteration: i, error: result.error || `Status ${result.status}` });
        testResults.overallStats.totalFailures++;
        testResults.overallStats.errors.push({ tool: tool.name, error: result.error || `Status ${result.status}`, iteration: i });
      }
      
      toolResult.avgTime = toolResult.successes > 0 ? Math.round(toolResult.totalTime / toolResult.successes) : 0;
      displayProgress();
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS));
    }
    
    if (testResults.toolResults[tool.name].successes === ITERATIONS_PER_TOOL) {
      testResults.overallStats.perfectTools++;
    } else {
      testResults.overallStats.failedTools++;
    }
    
    await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_TOOLS));
  }
  
  await generateFinalReport();
}

async function generateFinalReport() {
  testResults.endTime = Date.now();
  const duration = testResults.endTime - testResults.startTime;
  const successRate = ((testResults.overallStats.totalSuccesses / testResults.totalTests) * 100).toFixed(2);
  const avgResponseTime = testResults.overallStats.totalSuccesses > 0 
    ? Math.round(testResults.overallStats.totalResponseTime / testResults.overallStats.totalSuccesses)
    : 0;
  
  const report = `# CHUTKI - COMPREHENSIVE 20x TOOL TESTING REPORT

**Test Completed:** ${new Date().toLocaleString()}  
**Test Duration:** ${Math.floor(duration/60000)}m ${Math.floor((duration%60000)/1000)}s  
**Target:** 100% Success Rate | 20 Iterations Per Tool

---

## 🎯 FINAL ACHIEVEMENT

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Overall Success Rate | 100% | ${successRate}% | ${successRate === '100.00' ? '✅ PERFECT' : successRate >= '95.00' ? '⚠️ EXCELLENT' : '❌ NEEDS FIX'} |
| Perfect Tools (20/20) | ${testResults.totalTools} | ${testResults.overallStats.perfectTools} | ${testResults.overallStats.perfectTools === testResults.totalTools ? '✅ ALL PERFECT' : '⚠️ SOME FAILED'} |
| Failed Tools | 0 | ${testResults.overallStats.failedTools} | ${testResults.overallStats.failedTools === 0 ? '✅ NONE' : '❌ FIX REQUIRED'} |
| Total Tests Executed | ${testResults.totalTests} | ${testResults.completedTests} | ✅ COMPLETE |

---

## 📊 COMPREHENSIVE STATISTICS

- **Total Tools Tested:** ${testResults.totalTools}
- **Total Test Iterations:** ${testResults.totalTests} (20x each tool)
- **✅ Successful Tests:** ${testResults.overallStats.totalSuccesses} (${successRate}%)
- **❌ Failed Tests:** ${testResults.overallStats.totalFailures}
- **🏆 Perfect Tools (20/20 success):** ${testResults.overallStats.perfectTools}
- **⚠️ Failed Tools (<20/20):** ${testResults.overallStats.failedTools}
- **⚡ Average Response Time:** ${avgResponseTime}ms

---

## 🛠️ DETAILED TOOL-BY-TOOL RESULTS

${Object.entries(testResults.toolResults)
  .sort((a, b) => b[1].successes - a[1].successes)
  .map(([name, result]) => {
    const rate = ((result.successes / result.attempts) * 100).toFixed(1);
    const status = rate === '100.0' ? '✅ PERFECT' : rate >= '90.0' ? '⚠️ GOOD' : '❌ FAILED';
    const timing = result.successes > 0 ? `${result.minTime}/${result.avgTime}/${result.maxTime}ms` : 'N/A';
    return `### ${name}
- **Status:** ${status}
- **Success Rate:** ${rate}% (${result.successes}/${result.attempts})
- **Response Time (Min/Avg/Max):** ${timing}
- **Endpoint:** \`${result.endpoint}\`
${result.errors.length > 0 ? `- **Errors:** ${result.errors.length} error(s) detected\n${result.errors.slice(0, 3).map(e => `  - Iteration ${e.iteration}: ${e.error}`).join('\n')}` : ''}
`;
  }).join('\n')}

---

## ${testResults.overallStats.errors.length > 0 ? '⚠️ ERRORS ANALYSIS' : '✅ NO ERRORS DETECTED'}

${testResults.overallStats.errors.length > 0 ? `
**Total Errors:** ${testResults.overallStats.errors.length}

**Error Summary:**
${testResults.overallStats.errors.slice(0, 30).map((err, i) => 
  `${i+1}. **${err.tool}** (Iteration ${err.iteration}): ${err.error}`
).join('\n')}

${testResults.overallStats.errors.length > 30 ? `\n*...and ${testResults.overallStats.errors.length - 30} more errors*` : ''}

**Tools with Errors:**
${[...new Set(testResults.overallStats.errors.map(e => e.tool))].join(', ')}
` : '**No errors occurred! All tools working perfectly! 🎉**'}

---

## 🏆 FINAL VERDICT

${successRate === '100.00' && testResults.overallStats.perfectTools === testResults.totalTools ? `
### ✅ PERFECT SCORE - 100% SUCCESS ACHIEVED!

**CONGRATULATIONS! ALL TOOLS ARE PRODUCTION READY! 🚀**

- ✅ **${testResults.totalTools} Tools Tested**
- ✅ **${testResults.totalTests} Total Tests Executed** 
- ✅ **100% Success Rate** - Every single test passed!
- ✅ **All ${testResults.totalTools} Tools Perfect** - 20/20 success for each tool
- ✅ **Average Response Time:** ${avgResponseTime}ms
- ✅ **Zero Failures** - Not a single error!

**Platform Status:** PRODUCTION READY - DEPLOY WITH CONFIDENCE! 🎉
` : `
### ${successRate >= '95.00' ? '⚠️ EXCELLENT BUT NOT PERFECT' : '❌ CRITICAL ISSUES DETECTED'}

**Results Summary:**
- Success Rate: ${successRate}% ${successRate >= '95.00' ? '(Excellent)' : '(Needs Improvement)'}
- Perfect Tools: ${testResults.overallStats.perfectTools}/${testResults.totalTools}
- Failed Tools: ${testResults.overallStats.failedTools}
- Total Errors: ${testResults.overallStats.errors.length}

**⚠️ ACTION REQUIRED:**
${testResults.overallStats.failedTools > 0 ? `\n1. **Fix ${testResults.overallStats.failedTools} Failed Tools** - Review errors above and implement fixes` : ''}
${successRate < '100.00' ? `\n2. **Investigate ${testResults.overallStats.totalFailures} Failed Tests** - Debug and resolve issues` : ''}
${testResults.overallStats.failedTools > 0 ? `\n3. **Retest All Failed Tools** - Ensure 20/20 success before deployment` : ''}

**Platform Status:** ${successRate >= '95.00' ? 'ALMOST READY - Minor fixes needed' : 'NOT READY - Critical fixes required'} ⚠️
`}

---

**Generated:** ${new Date().toLocaleString()}  
**Platform:** CHUTKI Image Processing Platform  
**Test Type:** Comprehensive 20x Iteration Tool Testing  
**Total Test Duration:** ${Math.floor(duration/60000)} minutes ${Math.floor((duration%60000)/1000)} seconds
`;

  const filename = `TOOL_TEST_20X_REPORT_${Date.now()}.md`;
  fs.writeFileSync(filename, report);
  
  console.clear();
  console.log('\n\n' + '═'.repeat(120));
  console.log('[COMPLETE] 20x COMPREHENSIVE TOOL TESTING FINISHED');
  console.log('═'.repeat(120));
  console.log(report);
  console.log('═'.repeat(120));
  console.log(`\n📄 Full report saved to: ${filename}\n`);
  
  process.exit(successRate === '100.00' ? 0 : 1);
}

runAllToolsTest().catch(error => {
  console.error('[ERROR] Test failed:', error);
  process.exit(1);
});
