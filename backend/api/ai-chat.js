import express from 'express';

const router = express.Router();

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Enhanced AI responses with context awareness
    const aiResponse = await generateAIResponse(message, context);

    res.json({
      response: aiResponse.text,
      suggestions: aiResponse.suggestions || [],
      actions: aiResponse.actions || []
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// AI Image Analysis endpoint
router.post('/analyze-image', async (req, res) => {
  try {
    const { prompt = "Describe this image in detail" } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    // Simulate AI image analysis (replace with actual AI service)
    const analysis = await analyzeImageWithAI(req.file.buffer, prompt);

    res.json({
      description: analysis.description,
      objects: analysis.objects || [],
      colors: analysis.colors || [],
      suggestions: analysis.suggestions || []
    });

  } catch (error) {
    console.error('AI Image Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// Smart tool recommendations
router.post('/recommend-tools', async (req, res) => {
  try {
    const { description, imageType } = req.body;

    const recommendations = getToolRecommendations(description, imageType);

    res.json({
      recommendations: recommendations,
      reasoning: `Based on your request: "${description}", here are the best tools for your needs.`
    });

  } catch (error) {
    console.error('Tool Recommendation Error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// AI Response Generator
async function generateAIResponse(message, context) {
  const lowerMessage = message.toLowerCase();

  // Image processing related queries
  if (lowerMessage.includes('resize') || lowerMessage.includes('size')) {
    return {
      text: "I can help you resize images! You can resize by pixels, centimeters, or target specific dimensions like passport photos. Would you like me to suggest the best resizing tool for your needs?",
      suggestions: ["Resize Image Pixel", "Passport Photo Maker", "Resize Image to 6cm x 2cm"],
      actions: ["resize-pixel", "passport-photo", "resize-cm"]
    };
  }

  if (lowerMessage.includes('compress') || lowerMessage.includes('reduce')) {
    return {
      text: "I can compress your images to reduce file size! I can target specific sizes like 100KB, 50KB, or compress to a percentage. What size do you need?",
      suggestions: ["Compress to 100KB", "Compress to 50KB", "General Compression"],
      actions: ["compress-100kb", "compress-50kb", "compress-image"]
    };
  }

  if (lowerMessage.includes('background') || lowerMessage.includes('remove')) {
    return {
      text: "I can remove backgrounds from your images automatically! This works great for portraits, products, and objects. Want to try it?",
      suggestions: ["Remove Background", "Add Transparent Background"],
      actions: ["remove-background"]
    };
  }

  if (lowerMessage.includes('pdf') || lowerMessage.includes('convert')) {
    return {
      text: "I can convert images to PDF or extract text from images! I can also convert between different image formats. What conversion do you need?",
      suggestions: ["Images to PDF", "JPG to Text (OCR)", "Format Conversion"],
      actions: ["image-to-pdf", "ocr", "convert-format"]
    };
  }

  if (lowerMessage.includes('text') || lowerMessage.includes('ocr') || lowerMessage.includes('read')) {
    return {
      text: "I can extract text from your images using OCR technology! This works with documents, screenshots, and any image containing text. Upload an image and I'll read it for you.",
      suggestions: ["Extract Text from Image", "JPG to Text", "Document OCR"],
      actions: ["ocr"]
    };
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
    return {
      text: "I'm Chutki, your AI image processing assistant! I can help you with:\n\n• Resize images to any dimension\n• Compress images to specific sizes\n• Remove backgrounds automatically\n• Convert images to PDF\n• Extract text from images (OCR)\n• Apply various effects and filters\n\nJust tell me what you need or upload an image to get started!",
      suggestions: ["Show All Tools", "Upload Image", "Voice Commands"],
      actions: ["show-tools"]
    };
  }

  if (lowerMessage.includes('passport') || lowerMessage.includes('photo')) {
    return {
      text: "I can create perfect passport photos with proper dimensions and background! I'll automatically detect faces and crop to standard passport photo requirements.",
      suggestions: ["Make Passport Photo", "Resize for Documents", "Add White Background"],
      actions: ["passport-photo"]
    };
  }

  // General conversational responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return {
      text: "Hello! I'm Chutki, your friendly AI assistant for image processing. How can I help you today? You can upload images or just tell me what you need!",
      suggestions: ["Show Available Tools", "Upload Image", "Help"],
      actions: ["help"]
    };
  }

  // Default response with smart suggestions
  return {
    text: "I understand you want to work with images! I can help with resizing, compression, background removal, format conversion, and much more. What would you like to do?",
    suggestions: ["Resize Image", "Compress Image", "Remove Background", "Convert to PDF"],
    actions: ["resize", "compress", "remove-background", "convert-pdf"]
  };
}

// AI Image Analysis (placeholder for actual AI service)
async function analyzeImageWithAI(imageBuffer, prompt) {
  // This would integrate with actual AI services like OpenAI Vision, Google Vision, etc.
  // For now, returning mock analysis
  return {
    description: "This appears to be a digital image. Based on the content, I can suggest appropriate processing tools.",
    objects: ["image", "digital_content"],
    colors: ["various"],
    suggestions: [
      "Try resizing if you need different dimensions",
      "Compress if the file size is too large",
      "Remove background if you need transparency",
      "Convert to PDF for document purposes"
    ]
  };
}

// Tool Recommendations based on user input
function getToolRecommendations(description, imageType) {
  const recommendations = [];
  const desc = description.toLowerCase();

  if (desc.includes('small') || desc.includes('size') || desc.includes('kb')) {
    recommendations.push({
      tool: "compress-image",
      name: "Image Compressor",
      reason: "Reduces file size while maintaining quality"
    });
  }

  if (desc.includes('document') || desc.includes('passport') || desc.includes('id')) {
    recommendations.push({
      tool: "passport-photo",
      name: "Passport Photo Maker",
      reason: "Perfect for official documents and ID photos"
    });
  }

  if (desc.includes('background') || desc.includes('transparent')) {
    recommendations.push({
      tool: "remove-background",
      name: "Background Remover",
      reason: "Automatically removes background for clean images"
    });
  }

  if (desc.includes('text') || desc.includes('read') || desc.includes('extract')) {
    recommendations.push({
      tool: "ocr",
      name: "Text Extractor (OCR)",
      reason: "Extracts text from images and documents"
    });
  }

  // Default recommendations if no specific match
  if (recommendations.length === 0) {
    recommendations.push(
      {
        tool: "resize-pixel",
        name: "Resize Image",
        reason: "Most commonly needed tool for image processing"
      },
      {
        tool: "compress-image",
        name: "Compress Image",
        reason: "Useful for reducing file sizes"
      }
    );
  }

  return recommendations;
}

export default router;
