// PERMANENT MEMORY MONITORING SOLUTION
// This prevents tools from failing after 1 hour

const MEMORY_THRESHOLD = 0.85; // 85% memory usage threshold
const CHECK_INTERVAL = 60000; // Check every 1 minute

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function checkMemory() {
  const usage = process.memoryUsage();
  const totalHeap = usage.heapTotal;
  const usedHeap = usage.heapUsed;
  const memoryPercent = (usedHeap / totalHeap);

  console.log('[MEMORY-MONITOR]', {
    heapUsed: formatBytes(usedHeap),
    heapTotal: formatBytes(totalHeap),
    percentage: (memoryPercent * 100).toFixed(1) + '%',
    rss: formatBytes(usage.rss),
    external: formatBytes(usage.external)
  });

  // If memory usage is high, trigger garbage collection
  if (memoryPercent > MEMORY_THRESHOLD) {
    console.warn('[MEMORY-MONITOR] High memory usage detected! Triggering cleanup...');
    if (global.gc) {
      global.gc();
      console.log('[MEMORY-MONITOR] Garbage collection completed');
    } else {
      console.warn('[MEMORY-MONITOR] Garbage collection not available. Start with --expose-gc flag');
    }
  }
}

// Start monitoring
setInterval(checkMemory, CHECK_INTERVAL);

// Initial check
checkMemory();

console.log('[MEMORY-MONITOR] Started - checking every', CHECK_INTERVAL / 1000, 'seconds');

export { checkMemory };
