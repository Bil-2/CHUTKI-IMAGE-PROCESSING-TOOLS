import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../shared/ToolLayout';
import ScrollEffect from '../shared/ScrollEffect';
import config from '../../config';

const HeicToJpgSettings = ({ selectedFile, loading, onSubmit }) => {
  const [quality, setQuality] = useState(90);

  const qualityPresets = [
    { value: 95, label: 'Maximum Quality', description: 'Largest file size, best quality' },
    { value: 90, label: 'High Quality', description: 'Recommended for photos' },
    { value: 80, label: 'Good Quality', description: 'Balanced size and quality' },
    { value: 70, label: 'Medium Quality', description: 'Smaller files, good for web' },
    { value: 60, label: 'Lower Quality', description: 'Smallest files, basic quality' }
  ];

  const handleSubmit = () => {
    const formData = { quality };
    onSubmit(formData);
  };

  return (
    <>
      {/* Format Info */}
      <ScrollEffect animation="fade-up" duration={600} delay={0}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">HEIC to JPG Conversion</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-medium">HEIC Format</div>
            <div className="text-sm text-gray-600">Apple's high-efficiency format</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="font-medium">JPG Format</div>
            <div className="text-sm text-gray-600">Universal compatibility</div>
          </div>
        </div>
      </div>
      </ScrollEffect>

      {/* Quality Settings */}
      <ScrollEffect animation="fade-up" duration={600} delay={100}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Output Quality</h3>

        {/* Quality Presets */}
        <div className="space-y-2 mb-4">
          {qualityPresets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setQuality(preset.value)}
              className={`w-full text-left p-3 border rounded-lg transition-colors ${quality === preset.value
                  ? 'bg-blue-50 border-blue-300'
                  : 'hover:bg-gray-50 hover:border-gray-300'
                }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-sm text-gray-500">{preset.description}</div>
                </div>
                <div className="text-sm font-medium">{preset.value}%</div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Quality Slider */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Custom Quality: {quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Smaller file</span>
            <span>Better quality</span>
          </div>
        </div>
      </div>
      </ScrollEffect>

      {/* Conversion Preview */}
      {selectedFile && (
        <ScrollEffect animation="fade-up" duration={600} delay={200}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Conversion Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Input Format:</span>
              <span className="font-medium">HEIC</span>
            </div>
            <div className="flex justify-between">
              <span>Output Format:</span>
              <span className="font-medium">JPG</span>
            </div>
            <div className="flex justify-between">
              <span>Quality Setting:</span>
              <span className="font-medium">{quality}%</span>
            </div>
            <div className="flex justify-between">
              <span>Compatibility:</span>
              <span className="font-medium text-green-600">Universal</span>
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
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
          }`}
        whileHover={!loading && selectedFile ? { scale: 1.02 } : {}}
        whileTap={!loading && selectedFile ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Converting...
          </div>
        ) : (
          'Convert HEIC to JPG'
        )}
      </motion.button>
      </ScrollEffect>

      {/* Benefits */}
      <ScrollEffect animation="fade-up" duration={600} delay={300}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">Why Convert HEIC to JPG?</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• <strong>Universal Compatibility:</strong> Works on all devices and platforms</li>
          <li>• <strong>Easy Sharing:</strong> Share on social media and messaging apps</li>
          <li>• <strong>Web Compatible:</strong> Display on websites and online galleries</li>
          <li>• <strong>Editing Support:</strong> Open in any photo editing software</li>
        </ul>
      </div>
      </ScrollEffect>
    </>
  );
};

const HeicToJpgTool = () => {
  return (
    <ToolLayout
      title="HEIC to JPG Converter"
      description="Convert Apple HEIC photos to universal JPG format with quality control"
      endpoint={`${config.API_BASE_URL}/api/tools/heic-to-jpg`}
      acceptedFormats=".heic,.heif,image/heic,image/heif"
      maxFileSize={20}
    >
      <HeicToJpgSettings />
    </ToolLayout>
  );
};

export default HeicToJpgTool;
