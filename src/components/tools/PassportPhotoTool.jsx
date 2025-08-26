import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../shared/ToolLayout';
import config from '../../config';

const PassportPhotoSettings = ({ selectedFile, loading, onSubmit }) => {
  const [size, setSize] = useState('35x45');
  const [dpi, setDpi] = useState('300');
  const [background, setBackground] = useState('white');
  const [format, setFormat] = useState('jpg');
  const [quantity, setQuantity] = useState(1);
  const [customWidth, setCustomWidth] = useState('35');
  const [customHeight, setCustomHeight] = useState('45');
  const [customUnit, setCustomUnit] = useState('mm');

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

  const handleSubmit = () => {
    const formData = {
      size: size === 'custom' ? `${customWidth}x${customHeight}` : size,
      dpi,
      background,
      format,
      quantity
    };

    if (size === 'custom') {
      formData.width = customWidth;
      formData.height = customHeight;
      formData.unit = customUnit;
    }

    onSubmit(formData);
  };

  return (
    <>
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
                checked={size === option.value}
                onChange={(e) => setSize(e.target.value)}
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
        {size === 'custom' && (
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
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
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
        onClick={handleSubmit}
        disabled={!selectedFile || loading}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${!selectedFile || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
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
    </>
  );
};

const PassportPhotoTool = () => {
  return (
    <ToolLayout
      title="Make Passport Size Photo"
      description="Generate professional passport photos with custom sizes and backgrounds"
      endpoint={`${config.API_BASE_URL}/api/tools/passport-photo`}
      acceptedFormats="image/*"
      maxFileSize={10}
    >
      <PassportPhotoSettings />
    </ToolLayout>
  );
};

export default PassportPhotoTool;
