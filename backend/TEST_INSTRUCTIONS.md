# CHUTKI Test Suite - Instructions

## 📋 Available Tests

### 1. **1-Hour Performance Test** (`test-1hour-performance-100percent.js`)
**Target:** 100% Success Rate | 100% Uptime | Non-Stop Performance

**What it tests:**
- Continuous performance for 60 minutes
- Health checks every 10 seconds
- Random tool testing every 5 seconds
- Response time metrics (Min/Avg/Max/P50/P95/P99)
- Uptime monitoring
- Memory and performance tracking

**How to run:**
```bash
cd backend
node test-1hour-performance-100percent.js
```

**Report generated:** `PERFORMANCE_TEST_1HOUR_[timestamp].md`

---

### 2. **20x Comprehensive Tool Test** (`test-all-tools-20x-comprehensive.js`)
**Target:** 100% Success Rate | 20 Iterations Per Tool | All 100+ Tools

**What it tests:**
- All 81 tools (Image Editing, Conversion, Compression)
- 20 iterations per tool = 1,620 total tests
- Detailed success/failure tracking per tool
- Response time analysis per tool
- Zero failure tolerance validation

**How to run:**
```bash
cd backend
node test-all-tools-20x-comprehensive.js
```

**Report generated:** `TOOL_TEST_20X_REPORT_[timestamp].md`

---

## ⚙️ Prerequisites

1. **Backend server must be running:**
   ```bash
   cd backend
   npm start
   ```

2. **Server must be accessible at:** `http://localhost:5001`

3. **Required packages installed:**
   ```bash
   npm install node-fetch form-data canvas
   ```

---

## 🎯 Success Criteria

### 1-Hour Performance Test:
- ✅ **100% Success Rate** - All requests must succeed
- ✅ **100% Uptime** - Health checks must pass continuously
- ✅ **Consistent Performance** - Response times stable
- ✅ **No Errors** - Zero failures tolerated

### 20x Tool Test:
- ✅ **100% Success Rate** - All 1,620 tests must pass
- ✅ **Perfect Tools** - Each tool must succeed 20/20 times
- ✅ **Zero Failures** - No tool can have any failures
- ✅ **All Tools Working** - All 81 tools must be functional

---

## 📊 Report Formats

Both tests generate detailed Markdown reports with:

- ✅ Pass/Fail status
- 📊 Statistical analysis
- ⚡ Performance metrics
- 🛠️ Tool-by-tool breakdown
- ⚠️ Error analysis (if any)
- 🏆 Final verdict

---

## 🚀 Quick Start

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Run 1-hour performance test
cd backend
node test-1hour-performance-100percent.js

# OR

# Terminal 2: Run 20x comprehensive tool test
cd backend
node test-all-tools-20x-comprehensive.js
```

---

## ⚠️ Important Notes

1. **Rate Limiting:** Tests respect the 100 req/15min rate limit
   - Auto-retry if rate limited
   - Intelligent delays between requests

2. **Test Duration:**
   - 1-hour test: ~60 minutes
   - 20x tool test: ~3-4 hours (depending on delays)

3. **Do not stop tests mid-execution** - Let them complete for accurate reports

4. **Reports are auto-generated** upon completion in the `backend/` directory

---

## 📄 Report Example Structure

```markdown
# CHUTKI - [TEST NAME] REPORT

## 🎯 ACHIEVEMENT STATUS
✅ Success Rate: 100%
✅ Perfect Tools: 81/81
✅ Zero Failures

## 📊 STATISTICS
- Total Tests: 1,620
- Successes: 1,620 (100%)
- Failures: 0
- Avg Response: 245ms

## 🛠️ TOOL-BY-TOOL RESULTS
### Tool Name
- Status: ✅ PERFECT
- Success Rate: 100% (20/20)
- Response Time: 120/245/380ms

## 🏆 FINAL VERDICT
✅ PERFECT SCORE - PRODUCTION READY! 🚀
```

---

**Generated:** 2025-10-31  
**Platform:** CHUTKI Image Processing Platform  
**Version:** 1.0.0
