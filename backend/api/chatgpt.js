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

    // Check if AI chat is disabled
    if (process.env.DISABLE_AI_CHAT === 'true') {
      return res.json({
        response: "Hi! I'm Chutki Assistant. AI chat is currently disabled, but I can still help you with image processing tools. Try uploading an image and I'll suggest the best tools for your needs!",
        conversationId: Date.now().toString(),
        timestamp: new Date().toISOString(),
        fallback: true
      });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      // Provide helpful fallback response
      const fallbackResponse = getFallbackResponse(message);
      return res.json({
        response: fallbackResponse,
        conversationId: Date.now().toString(),
        timestamp: new Date().toISOString(),
        fallback: true
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

      // Provide fallback response for rate limits and other errors
      const fallbackResponse = getFallbackResponse(message);

      if (response.status === 401) {
        return res.json({
          response: fallbackResponse + "\n\n(Note: OpenAI API key is invalid)",
          conversationId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          fallback: true
        });
      } else if (response.status === 429) {
        return res.json({
          response: fallbackResponse + "\n\n(Note: AI is temporarily busy, but I can still help!)",
          conversationId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          fallback: true
        });
      } else if (response.status === 402) {
        return res.json({
          response: fallbackResponse + "\n\n(Note: AI quota exceeded, using built-in responses)",
          conversationId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          fallback: true
        });
      } else {
        return res.json({
          response: fallbackResponse,
          conversationId: Date.now().toString(),
          timestamp: new Date().toISOString(),
          fallback: true
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
    const fallbackResponse = getFallbackResponse(req.body.message || '');
    res.json({
      response: fallbackResponse,
      conversationId: Date.now().toString(),
      timestamp: new Date().toISOString(),
      fallback: true
    });
  }
});

// Fallback response function
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('compress') || lowerMessage.includes('size')) {
    return "I can help you compress images! Try the 'Reduce Image Size in KB' tool or specific compression tools like 'Compress to 100KB'. Upload your image and select the compression tool that fits your needs.";
  }

  if (lowerMessage.includes('background') || lowerMessage.includes('remove')) {
    return "For background removal, try the 'Remove Background' tool. Upload your image and it will automatically detect and remove the background, giving you a transparent PNG file.";
  }

  if (lowerMessage.includes('resize')) {
    return "I can help resize your images! Use tools like 'Resize Image Pixel', 'Resize Image in CM', or specific presets like 'Instagram Size' or 'Passport Photo Maker'. What dimensions do you need?";
  }

  if (lowerMessage.includes('pdf')) {
    return "To convert images to PDF, use the 'Image to PDF' tool. You can also create size-specific PDFs like 'JPG to PDF Under 50KB' or 'JPG to PDF Under 100KB'.";
  }

  if (lowerMessage.includes('text') || lowerMessage.includes('ocr')) {
    return "For text extraction, use the 'JPG to Text' or 'PNG to Text' OCR tools. Upload your image and I'll extract all readable text from it.";
  }

  if (lowerMessage.includes('passport') || lowerMessage.includes('photo')) {
    return "The 'Passport Photo Maker' tool can create professional passport photos with the correct dimensions and background. Just upload your photo and it will generate multiple copies in standard sizes.";
  }

  return "Hi! I'm Chutki Assistant. I can help you with image processing tasks like compression, resizing, format conversion, background removal, OCR text extraction, and more. Upload an image and I'll suggest the best tools for your needs!";
}

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
