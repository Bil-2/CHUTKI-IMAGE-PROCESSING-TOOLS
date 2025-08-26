import express from 'express';
import { uploadAny } from './tools/utils.js';
import { editingTools } from './tools/editing-tools.js';
import { resizeTools } from './tools/resize-tools.js';
import { compressionTools } from './tools/compression-tools.js';
import { conversionTools } from './tools/conversion-tools.js';

const router = express.Router();

// Combine all tool modules
const allTools = {
  ...editingTools,
  ...resizeTools,
  ...compressionTools,
  ...conversionTools
};

// Main tools endpoint - handles all 100+ tools
router.post('/:tool', uploadAny, async (req, res) => {
  const { tool } = req.params;

  console.log(`Processing tool: ${tool}`);
  console.log(`Files received: ${req.files?.length || 0}`);
  console.log(`Body params:`, Object.keys(req.body));

  try {
    // Check if tool exists in our modules
    if (!allTools[tool]) {
      console.log(`Tool '${tool}' not found in available tools`);
      return res.status(404).json({
        error: `Tool '${tool}' not found`,
        availableTools: Object.keys(allTools).slice(0, 10) // Show first 10 for reference
      });
    }

    // Execute the tool function
    await allTools[tool](req, res);

  } catch (error) {
    console.error(`Error in tool '${tool}':`, error);
    res.status(500).json({
      error: `Failed to process ${tool}: ${error.message}`,
      tool: tool,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    availableTools: Object.keys(allTools).length,
    modules: {
      editing: Object.keys(editingTools).length,
      resize: Object.keys(resizeTools).length,
      compression: Object.keys(compressionTools).length,
      conversion: Object.keys(conversionTools).length
    },
    timestamp: new Date().toISOString()
  });
});

// List all available tools
router.get('/list', (req, res) => {
  res.json({
    tools: Object.keys(allTools).sort(),
    totalCount: Object.keys(allTools).length,
    categories: {
      editing: Object.keys(editingTools),
      resize: Object.keys(resizeTools),
      compression: Object.keys(compressionTools),
      conversion: Object.keys(conversionTools)
    }
  });
});

export default router;
