// CHUTKI Cold Start Prevention System
// This module implements multiple strategies to prevent server cold starts

import { EventEmitter } from 'events';

class ColdStartPrevention extends EventEmitter {
  constructor(serverUrl) {
    super();
    this.serverUrl = serverUrl || process.env.RENDER_EXTERNAL_URL;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.stats = {
      totalPings: 0,
      successfulPings: 0,
      failedPings: 0,
      lastPingTime: null,
      lastSuccessTime: null,
      uptime: 0
    };
    this.intervals = [];
  }

  // Self-ping mechanism - server pings itself
  startSelfPing() {
    if (!this.isProduction || !this.serverUrl) {
      console.log('[COLD-START] Self-ping disabled (not in production or no URL)');
      return;
    }

    console.log('[COLD-START] Starting self-ping mechanism...');

    // Multiple intervals for redundancy
    const intervals = [
      { time: 5 * 60 * 1000, name: 'Primary (5min)' },
      { time: 8 * 60 * 1000, name: 'Secondary (8min)' },
      { time: 13 * 60 * 1000, name: 'Tertiary (13min)' }
    ];

    intervals.forEach(({ time, name }) => {
      const intervalId = setInterval(() => {
        this.performSelfPing(name);
      }, time);
      
      this.intervals.push(intervalId);
      console.log(`[COLD-START] ${name} interval started`);
    });

    // Initial ping after 1 minute
    setTimeout(() => this.performSelfPing('Initial'), 60000);
  }

  async performSelfPing(source = 'Unknown') {
    this.stats.totalPings++;
    this.stats.lastPingTime = new Date();

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${this.serverUrl}/api/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'CHUTKI-SelfPing',
          'X-Self-Ping': 'true',
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(15000)
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        this.stats.successfulPings++;
        this.stats.lastSuccessTime = new Date();
        
        console.log(`[COLD-START] ✅ Self-ping successful [${source}] (${responseTime}ms)`);
        this.emit('ping:success', { source, responseTime });

        // If response is slow, trigger additional warm-up
        if (responseTime > 3000) {
          console.log(`[COLD-START] ⚠️ Slow response detected, triggering warm-up...`);
          this.warmUpEndpoints();
        }
      } else {
        this.stats.failedPings++;
        console.log(`[COLD-START] ⚠️ Self-ping returned ${response.status} [${source}]`);
        this.emit('ping:warning', { source, status: response.status });
      }
    } catch (error) {
      this.stats.failedPings++;
      console.log(`[COLD-START] ❌ Self-ping failed [${source}]: ${error.message}`);
      this.emit('ping:error', { source, error: error.message });
    }
  }

  async warmUpEndpoints() {
    const endpoints = [
      '/api/tools/health',
      '/api/tools/list',
      '/api/auth/status'
    ];

    for (const endpoint of endpoints) {
      try {
        await fetch(`${this.serverUrl}${endpoint}`, {
          method: 'GET',
          signal: AbortSignal.timeout(8000)
        });
      } catch (error) {
        // Silent fail for warm-up
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('[COLD-START] 🔥 Warm-up completed');
  }

  // Activity monitoring - track incoming requests
  trackActivity() {
    this.stats.uptime = process.uptime();
    
    // Log stats every hour
    setInterval(() => {
      this.logStats();
    }, 60 * 60 * 1000);
  }

  logStats() {
    const successRate = this.stats.totalPings > 0 
      ? Math.round((this.stats.successfulPings / this.stats.totalPings) * 100)
      : 0;

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         COLD START PREVENTION - STATUS REPORT          ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  Total Pings: ${String(this.stats.totalPings).padEnd(42)} ║`);
    console.log(`║  Successful: ${String(this.stats.successfulPings).padEnd(43)} ║`);
    console.log(`║  Failed: ${String(this.stats.failedPings).padEnd(47)} ║`);
    console.log(`║  Success Rate: ${String(successRate + '%').padEnd(41)} ║`);
    console.log(`║  Last Success: ${String(this.stats.lastSuccessTime?.toISOString() || 'N/A').padEnd(41)} ║`);
    console.log(`║  Uptime: ${String(Math.floor(process.uptime() / 60) + ' minutes').padEnd(47)} ║`);
    console.log('╚════════════════════════════════════════════════════════╝\n');
  }

  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalPings > 0 
        ? Math.round((this.stats.successfulPings / this.stats.totalPings) * 100)
        : 0
    };
  }

  stop() {
    console.log('[COLD-START] Stopping prevention system...');
    this.intervals.forEach(intervalId => clearInterval(intervalId));
    this.intervals = [];
  }
}

// Singleton instance
let instance = null;

export const initColdStartPrevention = (serverUrl) => {
  if (!instance) {
    instance = new ColdStartPrevention(serverUrl);
    instance.startSelfPing();
    instance.trackActivity();
    
    console.log('[COLD-START] ✅ Prevention system initialized');
  }
  return instance;
};

export const getColdStartStats = () => {
  return instance ? instance.getStats() : null;
};

export default ColdStartPrevention;
