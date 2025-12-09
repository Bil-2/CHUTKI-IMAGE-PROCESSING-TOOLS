// API endpoint to check cold start prevention status
import express from 'express';
import { getColdStartStats } from '../cold-start-prevention.js';

const router = express.Router();

// Get cold start prevention statistics
router.get('/status', (req, res) => {
  const stats = getColdStartStats();
  
  if (!stats) {
    return res.status(503).json({
      success: false,
      message: 'Cold start prevention system not initialized'
    });
  }

  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  res.json({
    success: true,
    data: {
      ...stats,
      uptime: {
        seconds: Math.floor(uptime),
        formatted: `${hours}h ${minutes}m`
      },
      status: stats.successRate > 90 ? 'excellent' : stats.successRate > 70 ? 'good' : 'needs-attention',
      timestamp: new Date().toISOString()
    }
  });
});

// Trigger manual warm-up
router.post('/warmup', async (req, res) => {
  try {
    const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || 'http://localhost:5001';
    
    const endpoints = [
      '/api/health',
      '/api/tools/health',
      '/api/tools/list'
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: 'GET',
          signal: AbortSignal.timeout(10000)
        });
        const responseTime = Date.now() - startTime;

        results.push({
          endpoint,
          success: response.ok,
          status: response.status,
          responseTime
        });
      } catch (error) {
        results.push({
          endpoint,
          success: false,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: 'Manual warm-up completed',
      data: {
        results,
        summary: {
          total: results.length,
          successful,
          failed: results.length - successful
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Warm-up failed',
      error: error.message
    });
  }
});

export default router;
