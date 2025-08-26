import multer from 'multer';
import sharp from 'sharp';

// Configure multer for memory storage - accept multiple field names
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create upload middleware that accepts multiple field names
export const uploadAny = upload.any();

// Binary search for exact file size compression
export const compressToSize = async (buffer, targetBytes, format = 'jpeg') => {
  let low = 10, high = 100, bestBuffer = buffer, bestQuality = 90;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const testBuffer = await sharp(buffer)
      .toFormat(format, { quality: mid, mozjpeg: true })
      .toBuffer();

    if (testBuffer.length <= targetBytes) {
      bestBuffer = testBuffer;
      bestQuality = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return bestBuffer;
};

// Face detection for passport photos
export const detectAndCropFace = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    const size = Math.min(metadata.width, metadata.height);
    const x = Math.max(0, (metadata.width - size) / 2);
    const y = Math.max(0, (metadata.height - size) / 4);

    return await sharp(buffer)
      .extract({ left: Math.round(x), top: Math.round(y), width: size, height: size })
      .toBuffer();
  } catch (error) {
    console.log('Face detection failed, using center crop');
    return buffer;
  }
};

// Common error handler
export const handleToolError = (res, error, toolName) => {
  console.error(`${toolName} Error:`, error);
  return res.status(500).json({
    error: `Failed to process ${toolName}: ${error.message}`
  });
};

// File validation
export const validateFile = (req, res, toolName) => {
  if (!req.files || !req.files[0]) {
    console.log(`${toolName} Error: No file found in request`);
    res.status(400).json({ error: 'No image file provided' });
    return false;
  }
  return true;
};
