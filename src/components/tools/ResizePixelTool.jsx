import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../shared/ToolLayout';
import config from '../../config';

const ResizePixelSettings = ({ selectedFile, loading, onSubmit }) => {
  const [width, setWidth] = useState('800');
  const [height, setHeight] = useState('600');
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [fitMode, setFitMode] = useState('inside');

  const presetSizes = [
    { name: 'HD (1280x720)', width: 1280, height: 720 },
    { name: 'Full HD (1920x1080)', width: 1920, height: 1080 },
    { name: 'Instagram Square (1080x1080)', width: 1080, height: 1080 },
    { name: 'Facebook Cover (820x312)', width: 820, height: 312 },
    { name: 'Twitter Header (1500x500)', width: 1500, height: 500 },
    { name: 'YouTube Thumbnail (1280x720)', width: 1280, height: 720 }
  ];

  const fitModes = [
    { value: 'inside', label: 'Fit Inside (maintain aspect)', description: 'Image fits within dimensions' },
    { value: 'outside', label: 'Fit Outside (crop)', description: 'Fill dimensions, may crop' },
    { value: 'fill', label: 'Fill Exact (stretch)', description: 'Exact dimensions, may distort' },
    { value: 'contain', label: 'Contain (add padding)', description: 'Fit with padding if needed' }
  ];

  const handlePresetSelect = (preset) => {
    setWidth(preset.width.toString());
    setHeight(preset.height.toString());
  };

  const handleSubmit = () => {
    const formData = {
      width: parseInt(width),
      height: parseInt(height),
      maintain: maintainAspect,
      fit: fitMode
    };
    onSubmit(formData);
  };

  return (
    <>
      {/* Preset Sizes */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Quick Presets</h3>
        <div className="grid grid-cols-1 gap-2">
          {presetSizes.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetSelect(preset)}
              className="text-left p-3 border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-sm text-gray-500">{preset.width} × {preset.height} pixels</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Dimensions */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Custom Dimensions</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Width (pixels)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="10000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Height (pixels)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              max="10000"
            />
          </div>
        </div>

        {/* Aspect Ratio Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-medium">Maintain aspect ratio</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Keep original proportions to prevent distortion
          </p>
        </div>

        {/* Fit Mode */}
        <div>
          <label className="block text-sm font-medium mb-2">Resize Mode</label>
          <select
            value={fitMode}
            onChange={(e) => setFitMode(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {fitModes.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {fitModes.find(m => m.value === fitMode)?.description}
          </p>
        </div>
      </div>

      {/* Preview Info */}
      {selectedFile && (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Resize Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Target Size:</span>
              <span className="font-medium">{width} × {height} px</span>
            </div>
            <div className="flex justify-between">
              <span>Aspect Ratio:</span>
              <span className="font-medium">
                {maintainAspect ? 'Maintained' : 'Custom'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Resize Mode:</span>
              <span className="font-medium">
                {fitModes.find(m => m.value === fitMode)?.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Process Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!selectedFile || loading || !width || !height}
        className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${!selectedFile || loading || !width || !height
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
          }`}
        whileHover={!loading && selectedFile && width && height ? { scale: 1.02 } : {}}
        whileTap={!loading && selectedFile && width && height ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Resizing...
          </div>
        ) : (
          'Resize Image'
        )}
      </motion.button>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-800 mb-2">Tips:</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Maintain aspect ratio to prevent distortion</li>
          <li>• Use "Fit Inside" for social media posts</li>
          <li>• Higher resolutions provide better quality</li>
          <li>• Consider your intended use case</li>
        </ul>
      </div>
    </>
  );
};

const ResizePixelTool = () => {
  return (
    <ToolLayout
      title="Resize Image by Pixels"
      description="Resize your images to exact pixel dimensions with various fit modes"
      endpoint={`${config.API_BASE_URL}/api/tools/resize-pixel`}
      acceptedFormats="image/*"
      maxFileSize={10}
    >
      <ResizePixelSettings />
    </ToolLayout>
  );
};

export default ResizePixelTool;
