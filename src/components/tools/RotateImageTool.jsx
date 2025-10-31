import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../shared/ToolLayout';
import ScrollEffect from '../shared/ScrollEffect';
import config from '../../config';

const RotateImageSettings = ({ selectedFile, loading, onSubmit }) => {
  const [angle, setAngle] = useState('90');
  const [background, setBackground] = useState('white');

  const presetAngles = [
    { value: '90', label: '90° (Quarter turn right)' },
    { value: '180', label: '180° (Half turn)' },
    { value: '270', label: '270° (Quarter turn left)' },
    { value: '-90', label: '-90° (Quarter turn left)' }
  ];

  const backgroundOptions = [
    { value: 'white', label: 'White', color: '#FFFFFF' },
    { value: 'black', label: 'Black', color: '#000000' },
    { value: 'transparent', label: 'Transparent', color: 'transparent' },
    { value: 'red', label: 'Red', color: '#FF0000' },
    { value: 'blue', label: 'Blue', color: '#0000FF' },
    { value: 'green', label: 'Green', color: '#00FF00' }
  ];

  const handleSubmit = () => {
    const formData = { angle: parseFloat(angle), background };
    onSubmit(formData);
  };

  return (
    <>
      {/* Preset Angles */}
      <ScrollEffect animation="fade-up" duration={600} delay={0}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Rotation</h3>
        <div className="grid grid-cols-2 gap-3">
          {presetAngles.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setAngle(preset.value)}
              className={`p-3 border rounded-lg transition-colors ${angle === preset.value
                  ? 'bg-blue-50 border-blue-300'
                  : 'hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <div className="font-medium text-sm">{preset.label}</div>
            </button>
          ))}
        </div>
      </div>
      </ScrollEffect>

      {/* Custom Angle */}
      <ScrollEffect animation="fade-up" duration={600} delay={100}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Custom Angle</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Rotation Angle: {angle}°
            </label>
            <input
              type="range"
              min="-360"
              max="360"
              step="1"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-360°</span>
              <span>0°</span>
              <span>360°</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Or enter exact angle:</label>
            <input
              type="number"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              min="-360"
              max="360"
              step="0.1"
            />
          </div>
        </div>
      </div>
      </ScrollEffect>

      {/* Background Color */}
      <ScrollEffect animation="fade-up" duration={600} delay={150}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Background Fill</h3>
        <div className="grid grid-cols-2 gap-3">
          {backgroundOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setBackground(option.value)}
              className={`p-3 border rounded-lg transition-colors flex items-center space-x-2 ${background === option.value
                  ? 'bg-green-50 border-green-300'
                  : 'hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <div
                className="w-4 h-4 rounded border"
                style={{
                  backgroundColor: option.color,
                  border: option.color === 'transparent' ? '1px dashed #ccc' : 'none'
                }}
              ></div>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Background color fills empty areas created by rotation
        </p>
      </div>
      </ScrollEffect>

      {/* Rotation Preview */}
      {selectedFile && (
        <ScrollEffect animation="fade-up" duration={600} delay={200}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Rotation Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Rotation Angle:</span>
              <span className="font-medium">{angle}°</span>
            </div>
            <div className="flex justify-between">
              <span>Background:</span>
              <span className="font-medium capitalize">{background}</span>
            </div>
            <div className="flex justify-between">
              <span>Direction:</span>
              <span className="font-medium">
                {parseFloat(angle) > 0 ? 'Clockwise' : parseFloat(angle) < 0 ? 'Counter-clockwise' : 'No rotation'}
              </span>
            </div>
          </div>
        </div>
        </ScrollEffect>
      )}

      {/* Process Button */}
      <ScrollEffect animation="scale-up" duration={500} delay={250}>
      <motion.button
        onClick={handleSubmit}
        disabled={!selectedFile || loading}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${!selectedFile || loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700'
          }`}
        whileHover={!loading && selectedFile ? { scale: 1.02 } : {}}
        whileTap={!loading && selectedFile ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Rotating...
          </div>
        ) : (
          'Rotate Image'
        )}
      </motion.button>
      </ScrollEffect>

      {/* Tips */}
      <ScrollEffect animation="fade-up" duration={600} delay={300}>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-800 mb-2">Rotation Tips:</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Positive angles rotate clockwise</li>
          <li>• Negative angles rotate counter-clockwise</li>
          <li>• Use transparent background to preserve original shape</li>
          <li>• White background works best for documents</li>
        </ul>
      </div>
      </ScrollEffect>
    </>
  );
};

const RotateImageTool = () => {
  return (
    <ToolLayout
      title="Rotate Image"
      description="Rotate your image by any angle with customizable background fill"
      endpoint={`${config.API_BASE_URL}/api/tools/rotate`}
      acceptedFormats="image/*"
      maxFileSize={10}
    >
      <RotateImageSettings />
    </ToolLayout>
  );
};

export default RotateImageTool;
