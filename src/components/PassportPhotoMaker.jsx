import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const PassportPhotoMaker = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState('35x45');
  const [dpi, setDpi] = useState('300');
  const [background, setBackground] = useState('white');
  const [format, setFormat] = useState('jpg');
  const [quantity, setQuantity] = useState(1);
  const [customWidth, setCustomWidth] = useState('35');
  const [customHeight, setCustomHeight] = useState('45');
  const [customUnit, setCustomUnit] = useState('mm');
  const fileInputRef = useRef(null);

  const sizeOptions = [
    { value: '35x45', label: '3.5 CM x 4.5 CM (35 MM x 45 MM)', countries: 'India, Australia, Europe, UK, Pakistan' },
    { value: '51x51', label: '2 Inch X 2 Inch (51 MM X 51 MM)', countries: 'USA, Philippines' },
    { value: '50x70', label: '50 MM X 70MM (5 CM x 7 CM)', countries: 'Canada' },
    { value: 'custom', label: 'Custom Size', countries: 'Custom requirements' }
  ];

  const backgroundOptions = [
    { value: 'white', label: 'White', color: '#FFFFFF' },
    { value: 'blue', label: 'Blue', color: '#0066CC' },
    { value: 'red', label: 'Red', color: '#CC0000' },
    { value: 'green', label: 'Green', color: '#00CC00' },
    { value: 'transparent', label: 'Transparent', color: 'transparent' }
  ];

  const formatOptions = [
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' }
  ];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const generatePassportPhoto = async () => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('size', selectedSize);
    formData.append('dpi', dpi);
    formData.append('background', background);
    formData.append('format', format);
    formData.append('quantity', quantity);

    if (selectedSize === 'custom') {
      formData.append('width', customWidth);
      formData.append('height', customHeight);
      formData.append('unit', customUnit);
    }

    try {
      const response = await fetch('/api/passport-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `passport-photo.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate passport photo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate passport photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Make Passport Size Photo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome to Chutki Image Tool – Your Reliable Solution for Passport Size Images!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image Upload and Preview */}
          <div className="space-y-6">
            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer bg-white"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!preview ? (
                <div>
                  <div className="text-6xl mb-4">📷</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select Or Drag & Drop Image Here
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Supports JPG, PNG, WEBP, HEIC formats
                  </p>
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Select Image
                  </button>
                </div>
              ) : (
                <div>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Image Preview</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>File: {selectedFile?.name}</span>
                  <span>Size: {(selectedFile?.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Size Selection */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Select Passport Photo Size</h3>

              <div className="space-y-3">
                {sizeOptions.map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="size"
                      value={option.value}
                      checked={selectedSize === option.value}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.countries}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom Size Inputs */}
              {selectedSize === 'custom' && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Width</label>
                      <input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Height</label>
                      <input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Unit</label>
                      <select
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="mm">MM</option>
                        <option value="cm">CM</option>
                        <option value="inch">Inch</option>
                        <option value="px">PX</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* DPI Setting */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <label className="block text-sm font-medium mb-2">DPI</label>
                <select
                  value={dpi}
                  onChange={(e) => setDpi(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="150">150 DPI</option>
                  <option value="200">200 DPI</option>
                  <option value="300">300 DPI</option>
                  <option value="600">600 DPI</option>
                </select>
              </div>

              {/* Background Color */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <label className="block text-sm font-medium mb-2">Background</label>
                <select
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {backgroundOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <label className="block text-sm font-medium mb-2">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {formatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Generate Button */}
            <motion.button
              onClick={generatePassportPhoto}
              disabled={!selectedFile || loading}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${!selectedFile || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                }`}
              whileHover={!loading && selectedFile ? { scale: 1.02 } : {}}
              whileTap={!loading && selectedFile ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Generating...
                </div>
              ) : (
                'Generate Passport Photo'
              )}
            </motion.button>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Upload a clear, front-facing photo</li>
                <li>• Ensure good lighting and neutral expression</li>
                <li>• Remove glasses and hats if required</li>
                <li>• Use plain background for best results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassportPhotoMaker;
