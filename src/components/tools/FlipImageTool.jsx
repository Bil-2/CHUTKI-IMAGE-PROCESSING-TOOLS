import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../shared/ToolLayout';
import config from '../../config';

const FlipImageSettings = ({ selectedFile, loading, onSubmit }) => {
  const [direction, setDirection] = useState('horizontal');

  const flipOptions = [
    {
      value: 'horizontal',
      label: 'Horizontal Flip',
      description: 'Mirror image left to right',
      icon: '↔️'
    },
    {
      value: 'vertical',
      label: 'Vertical Flip',
      description: 'Mirror image top to bottom',
      icon: '↕️'
    }
  ];

  const handleSubmit = () => {
    const formData = { direction };
    onSubmit(formData);
  };

  return (
    <>
      {/* Flip Direction Selection */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Select Flip Direction</h3>
        <div className="space-y-4">
          {flipOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-4 cursor-pointer p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="direction"
                value={option.value}
                checked={direction === option.value}
                onChange={(e) => setDirection(e.target.value)}
                className="w-4 h-4"
              />
              <div className="text-2xl">{option.icon}</div>
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Visual Preview */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Flip Preview</h3>
        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-2 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="text-sm text-gray-600">Original</div>
          </div>

          <div className="text-2xl text-gray-400">→</div>

          <div className="text-center">
            <div
              className={`w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg mb-2 flex items-center justify-center text-white font-bold ${direction === 'horizontal' ? 'transform scale-x-[-1]' : 'transform scale-y-[-1]'
                }`}
            >
              A
            </div>
            <div className="text-sm text-gray-600">
              {direction === 'horizontal' ? 'Horizontally Flipped' : 'Vertically Flipped'}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Summary */}
      {selectedFile && (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Flip Settings</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Direction:</span>
              <span className="font-medium capitalize">{direction}</span>
            </div>
            <div className="flex justify-between">
              <span>Effect:</span>
              <span className="font-medium">
                {direction === 'horizontal' ? 'Left ↔ Right mirror' : 'Top ↕ Bottom mirror'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Quality:</span>
              <span className="font-medium text-green-600">Lossless</span>
            </div>
          </div>
        </div>
      )}

      {/* Process Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!selectedFile || loading}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${!selectedFile || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700'
          }`}
        whileHover={!loading && selectedFile ? { scale: 1.02 } : {}}
        whileTap={!loading && selectedFile ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Flipping...
          </div>
        ) : (
          `Flip Image ${direction === 'horizontal' ? 'Horizontally' : 'Vertically'}`
        )}
      </motion.button>

      {/* Use Cases */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Common Use Cases:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Horizontal:</strong> Fix selfies, create mirror effects</li>
          <li>• <strong>Vertical:</strong> Correct upside-down images, artistic effects</li>
          <li>• Perfect for social media and photo corrections</li>
          <li>• No quality loss - completely reversible</li>
        </ul>
      </div>
    </>
  );
};

const FlipImageTool = () => {
  return (
    <ToolLayout
      title="Flip Image"
      description="Mirror your image horizontally or vertically with perfect quality"
      endpoint={`${config.API_BASE_URL}/api/tools/flip`}
      acceptedFormats="image/*"
      maxFileSize={10}
    >
      <FlipImageSettings />
    </ToolLayout>
  );
};

export default FlipImageTool;
