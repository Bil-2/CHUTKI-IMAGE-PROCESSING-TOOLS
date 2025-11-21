import React, { useEffect, useRef } from 'react';

const FaceDetectionOverlay = ({ image, detection, imageSize }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !image || !detection || !detection.success) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Get the displayed image dimensions
    const displayWidth = image.offsetWidth;
    const displayHeight = image.offsetHeight;
    
    // Set canvas size to match displayed image
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    // Calculate scale factors
    const scaleX = displayWidth / imageSize.width;
    const scaleY = displayHeight / imageSize.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw face box
    const box = detection.box;
    ctx.strokeStyle = '#10B981'; // Green
    ctx.lineWidth = 3;
    ctx.strokeRect(
      box.x * scaleX,
      box.y * scaleY,
      box.width * scaleX,
      box.height * scaleY
    );
    
    // Draw eye level line
    if (detection.eyeLevel) {
      ctx.strokeStyle = '#3B82F6'; // Blue
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, detection.eyeLevel.y * scaleY);
      ctx.lineTo(canvas.width, detection.eyeLevel.y * scaleY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw center line
    ctx.strokeStyle = '#F59E0B'; // Orange
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw eye points
    if (detection.leftEye && detection.rightEye) {
      ctx.fillStyle = '#EF4444'; // Red
      ctx.beginPath();
      ctx.arc(detection.leftEye.x * scaleX, detection.leftEye.y * scaleY, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(detection.rightEye.x * scaleX, detection.rightEye.y * scaleY, 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw confidence label
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(
      `${(detection.confidence * 100).toFixed(1)}%`,
      box.x * scaleX + 5,
      box.y * scaleY - 5
    );
    
  }, [image, detection, imageSize]);

  if (!detection || !detection.success) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};

export default FaceDetectionOverlay;
