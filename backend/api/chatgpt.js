import express from 'express';
import fetch from 'node-fetch';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for ChatGPT API
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 requests per minute
  message: {
    error: 'Too many chat requests. Please wait a minute before sending another message.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to chat endpoint
router.use('/chat', chatRateLimit);

// ChatGPT API endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.'
      });
    }

    // Prepare messages for ChatGPT
    const messages = [
      {
        role: 'system',
        content: `You are Chutki, a helpful AI assistant for an image processing tool called CHUTKI. You help users with:
        - Image compression and resizing
        - Format conversion (HEIC to JPG, PNG to JPEG, etc.)
        - OCR text extraction from images
        - Background removal
        - PDF creation from images
        - Passport photo generation
        - And many other image processing tasks

        Be friendly, concise, and helpful. When users ask about image processing, guide them to use the available tools. Keep responses under 150 words.`
      },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 200,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });

      if (response.status === 401) {
        return res.status(401).json({
          error: 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.'
        });
      } else if (response.status === 429) {
        return res.status(429).json({
          error: 'OpenAI API rate limit exceeded. Please wait a few minutes and try again. Consider upgrading your OpenAI plan for higher limits.',
          retryAfter: '5 minutes'
        });
      } else if (response.status === 402) {
        return res.status(402).json({
          error: 'OpenAI API quota exceeded. Please check your billing and usage at https://platform.openai.com/usage'
        });
      } else {
        return res.status(500).json({
          error: 'OpenAI API error: ' + (errorData.error?.message || `HTTP ${response.status}`)
        });
      }
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({
      response: aiResponse,
      conversationId: Date.now().toString(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('ChatGPT API Error:', error);
    res.status(500).json({
      error: 'Failed to process chat request: ' + error.message
    });
  }
});

// Get AI suggestions for image processing
router.post('/suggest', async (req, res) => {
  try {
    const { imageType, userIntent } = req.body;

    const suggestions = [];

    // Basic suggestions based on common use cases
    if (userIntent?.toLowerCase().includes('compress') || userIntent?.toLowerCase().includes('size')) {
      suggestions.push({
        action: 'compress-image',
        title: 'Compress Image',
        description: 'Reduce file size while maintaining quality'
      });
    }

    if (userIntent?.toLowerCase().includes('background') || userIntent?.toLowerCase().includes('remove')) {
      suggestions.push({
        action: 'remove-background',
        title: 'Remove Background',
        description: 'Remove background from your image'
      });
    }

    if (userIntent?.toLowerCase().includes('text') || userIntent?.toLowerCase().includes('ocr')) {
      suggestions.push({
        action: 'ocr',
        title: 'Extract Text (OCR)',
        description: 'Extract text from your image'
      });
    }

    if (userIntent?.toLowerCase().includes('pdf')) {
      suggestions.push({
        action: 'image-to-pdf',
        title: 'Convert to PDF',
        description: 'Convert images to PDF document'
      });
    }

    // Default suggestions if no specific intent
    if (suggestions.length === 0) {
      suggestions.push(
        {
          action: 'compress-image',
          title: 'Compress Image',
          description: 'Reduce file size'
        },
        {
          action: 'remove-background',
          title: 'Remove Background',
          description: 'Remove image background'
        },
        {
          action: 'ocr',
          title: 'Extract Text',
          description: 'Get text from image'
        }
      );
    }

    res.json({ suggestions });

  } catch (error) {
    console.error('AI Suggest Error:', error);
    res.status(500).json({
      error: 'Failed to generate suggestions: ' + error.message
    });
  }
});

export default router;
