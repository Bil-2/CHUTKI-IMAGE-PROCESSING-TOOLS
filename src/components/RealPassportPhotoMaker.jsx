import React, { useState, useRef, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

export default function RealPassportPhotoMaker() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [passportSize, setPassportSize] = useState('us'); // us, uk, eu, indian
  const [processedPhoto, setProcessedPhoto] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const passportSizes = {
    us: { width: 2, height: 2, unit: 'inches', pixels: { width: 600, height: 600 } },
    uk: { width: 35, height: 45, unit: 'mm', pixels: { width: 413, height: 531 } },
    eu: { width: 35, height: 45, unit: 'mm', pixels: { width: 413, height: 531 } },
    indian: { width: 35, height: 45, unit: 'mm', pixels: { width: 413, height: 531 } }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setProcessedPhoto(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  };

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    const cropSize = passportSizes[passportSize];
    const aspectRatio = cropSize.pixels.width / cropSize.pixels.height;

    let cropWidth, cropHeight;
    if (width / height > aspectRatio) {
      cropHeight = height;
      cropWidth = height * aspectRatio;
    } else {
      cropWidth = width;
      cropHeight = width / aspectRatio;
    }

    const cropX = (width - cropWidth) / 2;
    const cropY = (height - cropHeight) / 2;

    setCrop({
      unit: '%',
      width: (cropWidth / width) * 100,
      height: (cropHeight / height) * 100,
      x: (cropX / width) * 100,
      y: (cropY / height) * 100
    });
  }, [passportSize]);

  const createPassportPhoto = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const cropSize = passportSizes[passportSize];

      // Set canvas size to passport photo dimensions
      canvas.width = cropSize.pixels.width;
      canvas.height = cropSize.pixels.height;

      // Create a white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate crop dimensions
      const imageElement = imgRef.current;
      const scaleX = imageElement.naturalWidth / imageElement.width;
      const scaleY = imageElement.naturalHeight / imageElement.height;

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      // Draw the cropped image
      ctx.drawImage(
        imageElement,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setProcessedPhoto(dataUrl);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error creating passport photo:', error);
      setIsProcessing(false);
    }
  };

  const downloadPhoto = () => {
    if (!processedPhoto) return;

    const link = document.createElement('a');
    link.href = processedPhoto;
    link.download = `passport_photo_${passportSize}.jpg`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Passport Photo Maker
      </h2>

      {/* Passport Size Selection */}
      <div className="mb-6 text-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Passport Size:
        </label>
        <select
          value={passportSize}
          onChange={(e) => setPassportSize(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="us">US Passport (2" x 2")</option>
          <option value="uk">UK Passport (35mm x 45mm)</option>
          <option value="eu">EU Passport (35mm x 45mm)</option>
          <option value="indian">Indian Passport (35mm x 45mm)</option>
        </select>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {passportSizes[passportSize].width} x {passportSizes[passportSize].height} {passportSizes[passportSize].unit}
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors text-lg"
        >
          Select Photo
        </button>
      </div>

      {/* Image Cropping */}
      {selectedFile && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center">Crop Your Photo</h3>
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={passportSizes[passportSize].pixels.width / passportSizes[passportSize].pixels.height}
            >
              <img
                ref={imgRef}
                src={URL.createObjectURL(selectedFile)}
                onLoad={onImageLoad}
                alt="Uploaded photo"
                className="max-w-full max-h-96"
              />
            </ReactCrop>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={createPassportPhoto}
              disabled={!completedCrop || isProcessing}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 text-lg"
            >
              {isProcessing ? 'Creating Photo...' : 'Create Passport Photo'}
            </button>
          </div>
        </div>
      )}

      {/* Processed Photo */}
      {processedPhoto && (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Your Passport Photo</h3>
          <div className="inline-block border-4 border-white shadow-lg">
            <img
              src={processedPhoto}
              alt="Passport photo"
              className="max-w-xs"
            />
          </div>
          <div className="mt-4">
            <button
              onClick={downloadPhoto}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors text-lg"
            >
              Download Photo
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Instructions:</h3>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Select your passport size from the dropdown</li>
          <li>Upload a clear, front-facing photo</li>
          <li>Crop the image to focus on your face</li>
          <li>Ensure good lighting and neutral background</li>
          <li>Click "Create Passport Photo" to generate</li>
          <li>Download your formatted passport photo</li>
        </ul>
      </div>
    </div>
  );
}
