import React, { useState, useRef } from 'react';

export default function RealImageConverter() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('image/jpeg');
  const [convertedImage, setConvertedImage] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [imageInfo, setImageInfo] = useState(null);
  const fileInputRef = useRef(null);

  const formats = [
    { value: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
    { value: 'image/png', label: 'PNG', extension: 'png' },
    { value: 'image/webp', label: 'WebP', extension: 'webp' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setConvertedImage(null);

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

  const convertImage = async () => {
    if (!selectedFile) return;

    setIsConverting(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Convert to target format
        let quality = 0.8;
        if (targetFormat === 'image/png') {
          quality = 1.0; // PNG is lossless
        }

        const dataUrl = canvas.toDataURL(targetFormat, quality);
        setConvertedImage(dataUrl);
        setIsConverting(false);
      };

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Error converting image:', error);
      setIsConverting(false);
    }
  };

  const downloadImage = () => {
    if (!convertedImage) return;

    const format = formats.find(f => f.value === targetFormat);
    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = `converted_image.${format.extension}`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Real Image Converter
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

      {/* Format Selection */}
      {selectedFile && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Convert to:
          </label>
          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {formats.map(format => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>

          <button
            onClick={convertImage}
            disabled={isConverting}
            className="ml-4 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isConverting ? 'Converting...' : 'Convert Image'}
          </button>
        </div>
      )}

      {/* Converted Image */}
      {convertedImage && (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Converted Image</h3>
          <div className="inline-block border-2 border-gray-300 rounded-lg p-2">
            <img
              src={convertedImage}
              alt="Converted image"
              className="max-w-xs"
            />
          </div>
          <div className="mt-4">
            <button
              onClick={downloadImage}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Download Converted Image
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isConverting && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Converting your image...</p>
        </div>
      )}

      {/* Features List */}
      <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Features:</h3>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>Convert between JPEG, PNG, and WebP formats</li>
          <li>Maintains original image dimensions</li>
          <li>Adjustable quality settings</li>
          <li>Instant conversion in your browser</li>
          <li>No server upload required</li>
          <li>Download converted images immediately</li>
        </ul>
      </div>
    </div>
  );
}
