import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Load face detection models
export const loadModels = async () => {
  if (modelsLoaded) return;
  
  try {
    const MODEL_URL = '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
    throw error;
  }
};

// Detect face in image
export const detectFace = async (image) => {
  try {
    // Ensure models are loaded
    await loadModels();

    // Detect face with landmarks
    const detection = await faceapi
      .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    if (!detection) {
      return {
        success: false,
        error: 'No face detected in the image'
      };
    }

    // Extract face box
    const box = detection.detection.box;
    
    // Get eye positions from landmarks
    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    
    // Calculate average eye position
    const leftEyeCenter = {
      x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
      y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length
    };
    
    const rightEyeCenter = {
      x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
      y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length
    };
    
    const eyeLevel = {
      x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
      y: (leftEyeCenter.y + rightEyeCenter.y) / 2
    };

    return {
      success: true,
      box: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
      },
      eyeLevel,
      leftEye: leftEyeCenter,
      rightEye: rightEyeCenter,
      confidence: detection.detection.score,
      landmarks: landmarks.positions
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return {
      success: false,
      error: error.message || 'Face detection failed'
    };
  }
};

// Check compliance with country requirements
export const checkCompliance = (detection, imageSize, countryReqs) => {
  const results = {
    headSize: false,
    eyeLevel: false,
    centering: false,
    overall: false,
    details: {}
  };

  if (!detection.success || !countryReqs) {
    return results;
  }

  const { box, eyeLevel } = detection;
  const { width: imgWidth, height: imgHeight } = imageSize;

  // Check head size
  const headSizePercentage = (box.height / imgHeight) * 100;
  const targetHeadSize = countryReqs.headSize?.percentage || 70;
  const headSizeTolerance = 10; // ±10%
  
  results.headSize = Math.abs(headSizePercentage - targetHeadSize) <= headSizeTolerance;
  results.details.headSize = {
    current: headSizePercentage.toFixed(1),
    target: targetHeadSize,
    pass: results.headSize
  };

  // Check eye level
  const eyeLevelPercentage = (eyeLevel.y / imgHeight) * 100;
  const targetEyeLevel = countryReqs.eyeLevel?.percentage || 60;
  const eyeLevelTolerance = 10; // ±10%
  
  results.eyeLevel = Math.abs(eyeLevelPercentage - targetEyeLevel) <= eyeLevelTolerance;
  results.details.eyeLevel = {
    current: eyeLevelPercentage.toFixed(1),
    target: targetEyeLevel,
    pass: results.eyeLevel
  };

  // Check horizontal centering
  const faceCenter = box.x + box.width / 2;
  const imageCenter = imgWidth / 2;
  const centeringOffset = Math.abs(faceCenter - imageCenter);
  const centeringTolerance = imgWidth * 0.1; // 10% of image width
  
  results.centering = centeringOffset <= centeringTolerance;
  results.details.centering = {
    offset: centeringOffset.toFixed(1),
    tolerance: centeringTolerance.toFixed(1),
    pass: results.centering
  };

  // Overall compliance
  results.overall = results.headSize && results.eyeLevel && results.centering;

  return results;
};
