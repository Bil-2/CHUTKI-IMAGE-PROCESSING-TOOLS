
# [REPORT] CHUTKI 1-HOUR STRESS TEST REPORT
**Date:** 10/31/2025, 4:57:02 PM  
**Duration:** 60 minutes 0 seconds

---

## 📊 OVERALL PERFORMANCE

### Request Statistics
- **Total Requests:** 1798
- **Successful:** 779 (43.33%)
- **Failed:** 1019
- **Requests per Minute:** 30

### Response Time Metrics
- **Average:** 27ms
- **Minimum:** 1ms
- **Maximum:** 452ms
- **Median (P50):** 6ms
- **95th Percentile:** 182ms
- **99th Percentile:** 197ms

### Stability Assessment
- **Success Rate:** ⚠️ NEEDS ATTENTION
- **Performance:** ✅ EXCELLENT
- **Reliability:** ⚠️ UNSTABLE

---

## 🎯 ENDPOINT BREAKDOWN

### Health Check
- **Requests:** 300
- **Success Rate:** 81.7%
- **Avg Response:** 4ms
- **Min/Max:** 1ms / 25ms
- **Status:** ⚠️ Issues Detected

### Rotate Image
- **Requests:** 300
- **Success Rate:** 25.0%
- **Avg Response:** 22ms
- **Min/Max:** 6ms / 217ms
- **Status:** ⚠️ Issues Detected

### Compress 50KB
- **Requests:** 300
- **Success Rate:** 24.3%
- **Avg Response:** 184ms
- **Min/Max:** 157ms / 452ms
- **Status:** ⚠️ Issues Detected

### Resize Pixel
- **Requests:** 300
- **Success Rate:** 24.0%
- **Avg Response:** 23ms
- **Min/Max:** 10ms / 46ms
- **Status:** ⚠️ Issues Detected

### Grayscale
- **Requests:** 299
- **Success Rate:** 24.1%
- **Avg Response:** 20ms
- **Min/Max:** 7ms / 149ms
- **Status:** ⚠️ Issues Detected

### AI Chat
- **Requests:** 299
- **Success Rate:** 80.9%
- **Avg Response:** 6ms
- **Min/Max:** 2ms / 89ms
- **Status:** ⚠️ Issues Detected


---

## 🧠 MEMORY ANALYSIS

### Memory Usage
- **Initial Heap:** 10MB
- **Final Heap:** 10MB
- **Memory Growth:** 0MB
- **Peak Memory:** 10MB

### Memory Health
✅ No significant memory leaks detected

---

## ⚠️ ERRORS & ISSUES


**Total Errors:** 1019

### Error Summary
1. **Rotate Image**: Status 429 (2025-10-31T10:32:05.985Z)
2. **Compress 50KB**: Status 429 (2025-10-31T10:32:07.983Z)
3. **Resize Pixel**: Status 429 (2025-10-31T10:32:09.978Z)
4. **Grayscale**: Status 429 (2025-10-31T10:32:11.983Z)
5. **Rotate Image**: Status 429 (2025-10-31T10:32:17.983Z)
6. **Compress 50KB**: Status 429 (2025-10-31T10:32:19.987Z)
7. **Resize Pixel**: Status 429 (2025-10-31T10:32:21.989Z)
8. **Grayscale**: Status 429 (2025-10-31T10:32:23.984Z)
9. **Rotate Image**: Status 429 (2025-10-31T10:32:29.990Z)
10. **Compress 50KB**: Status 429 (2025-10-31T10:32:31.992Z)


... and 1009 more errors


---

## 📈 PERFORMANCE TRENDS

### Response Time Over Time
- **0-10 min:** 45ms average
- **10-20 min:** 22ms average
- **20-30 min:** 23ms average
- **30-40 min:** 23ms average
- **40-50 min:** 32ms average
- **50-60 min:** 16ms average


### Throughput
- **Average Requests/Second:** 0.50
- **Peak Performance:** Maintained

---

## 🎯 FINAL VERDICT

### Overall Grade: ⭐ D (NEEDS IMPROVEMENT)

### Recommendations:
⚠️ Consider investigating failed requests and adding retry logic
✅ Outstanding response times - no optimization needed
✅ Memory usage is stable and healthy

---

## 📋 TEST CONFIGURATION

- **Test Duration:** 60 minutes
- **Request Interval:** 2 seconds
- **Endpoints Tested:** 6
- **Base URL:** http://localhost:5001

---

*Report generated automatically by CHUTKI Stress Test Suite*
*End Time: 10/31/2025, 4:57:02 PM*
