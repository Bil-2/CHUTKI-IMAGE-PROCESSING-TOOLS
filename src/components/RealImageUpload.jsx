import React, { useState, useRef } from 'react';

export default function RealImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageInfo, setImageInfo] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setProcessedImage(null);

      // Display image info
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImageInfo({
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            dimensions: `${img.width} x ${img.height}`,
            type: file.type
          });
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to different formats
        const formats = ['image/jpeg', 'image/png', 'image/webp'];
        const processedImages = {};

        formats.forEach(format => {
          const dataUrl = canvas.toDataURL(format, 0.8);
          processedImages[format] = dataUrl;
        });

        setProcessedImage(processedImages);
        setIsProcessing(false);
      };

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      setIsProcessing(false);
    }
  };

  const downloadImage = (dataUrl, format) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `processed_image.${format.split('/')[1]}`;
    link.click();
  };

  const compressImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Reduce quality for compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.3);
        setProcessedImage({ 'image/jpeg': compressedDataUrl });
        setIsProcessing(false);
      };

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Real Image Processing
      </h2>

      {/* File Upload */}
      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Select Image
        </button>
      </div>

      {/* Image Info */}
      {imageInfo && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Image Information:</h3>
          <p><strong>Name:</strong> {imageInfo.name}</p>
          <p><strong>Size:</strong> {imageInfo.size}</p>
          <p><strong>Dimensions:</strong> {imageInfo.dimensions}</p>
          <p><strong>Type:</strong> {imageInfo.type}</p>
        </div>
      )}

      {/* Processing Buttons */}
      {selectedFile && (
        <div className="mb-6 space-x-4">
          <button
            onClick={processImage}
            disabled={isProcessing}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Convert Formats'}
          </button>

          <button
            onClick={compressImage}
            disabled={isProcessing}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Compress Image'}
          </button>
        </div>
      )}

      {/* Processed Images */}
      {processedImage && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(processedImage).map(([format, dataUrl]) => (
            <div key={format} className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">
                {format.split('/')[1].toUpperCase()}
              </h4>
              <img
                src={dataUrl}
                alt={`Processed ${format}`}
                className="w-full h-32 object-cover rounded mb-2"
              />
              <button
                onClick={() => downloadImage(dataUrl, format)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Processing your image...</p>
        </div>
      )}
    </div>
  );
}
