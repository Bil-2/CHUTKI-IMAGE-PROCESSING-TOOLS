import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../shared/ToolLayout';
import ScrollEffect from '../shared/ScrollEffect';
import config from '../../config';

const CompressImageSettings = ({ selectedFile, loading, onSubmit }) => {
  const [compressionType, setCompressionType] = useState('quality');
  const [quality, setQuality] = useState(80);
  const [targetSize, setTargetSize] = useState('50');
  const [targetUnit, setTargetUnit] = useState('kb');

  const compressionPresets = [
    { name: 'High Quality (90%)', quality: 90, description: 'Minimal compression, best quality' },
    { name: 'Good Quality (80%)', quality: 80, description: 'Balanced compression and quality' },
    { name: 'Medium Quality (60%)', quality: 60, description: 'Moderate compression, good for web' },
    { name: 'Low Quality (40%)', quality: 40, description: 'High compression, smaller files' }
  ];

  const sizePresets = [
    { name: '5 KB', size: 5, unit: 'kb' },
    { name: '10 KB', size: 10, unit: 'kb' },
    { name: '20 KB', size: 20, unit: 'kb' },
    { name: '50 KB', size: 50, unit: 'kb' },
    { name: '100 KB', size: 100, unit: 'kb' },
    { name: '200 KB', size: 200, unit: 'kb' },
    { name: '500 KB', size: 500, unit: 'kb' },
    { name: '1 MB', size: 1, unit: 'mb' }
  ];

  const handlePresetQuality = (preset) => {
    setQuality(preset.quality);
    setCompressionType('quality');
  };

  const handlePresetSize = (preset) => {
    setTargetSize(preset.size.toString());
    setTargetUnit(preset.unit);
    setCompressionType('size');
  };

  const handleSubmit = () => {
    const formData = {
      type: compressionType,
      quality: compressionType === 'quality' ? quality : undefined,
      targetKB: compressionType === 'size' && targetUnit === 'kb' ? parseInt(targetSize) : undefined,
      targetMB: compressionType === 'size' && targetUnit === 'mb' ? parseInt(targetSize) : undefined
    };

    // Use appropriate endpoint based on compression type
    const endpoint = compressionType === 'size'
      ? `${config.API_BASE_URL}/api/tools/reduce-size-${targetUnit}`
      : `${config.API_BASE_URL}/api/tools/compress-50kb`;

    onSubmit(formData);
  };

  return (
    <>
      {/* Compression Type Selection */}
      <ScrollEffect animation="fade-up" duration={600} delay={0}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Compression Method</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="compressionType"
              value="quality"
              checked={compressionType === 'quality'}
              onChange={(e) => setCompressionType(e.target.value)}
            />
            <div>
              <div className="font-medium">Quality-based Compression</div>
              <div className="text-sm text-gray-500">Control compression by quality percentage</div>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="compressionType"
              value="size"
              checked={compressionType === 'size'}
              onChange={(e) => setCompressionType(e.target.value)}
            />
            <div>
              <div className="font-medium">Size-based Compression</div>
              <div className="text-sm text-gray-500">Compress to exact file size</div>
            </div>
          </label>
        </div>
      </div>
      </ScrollEffect>

      {/* Quality-based Settings */}
      {compressionType === 'quality' && (
        <ScrollEffect animation="fade-up" duration={600} delay={100}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Quality Presets</h3>
          <div className="grid grid-cols-1 gap-2 mb-4">
            {compressionPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetQuality(preset)}
                className={`text-left p-3 border rounded-lg transition-colors ${quality === preset.quality
                    ? 'bg-blue-50 border-blue-300'
                    : 'hover:bg-gray-50 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-sm text-gray-500">{preset.description}</div>
              </button>
            ))}
          </div>

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
      )}

      {/* Size-based Settings */}
      {compressionType === 'size' && (
        <ScrollEffect animation="fade-up" duration={600} delay={100}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Size Presets</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {sizePresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetSize(preset)}
                className={`p-3 border rounded-lg transition-colors ${targetSize === preset.size.toString() && targetUnit === preset.unit
                    ? 'bg-green-50 border-green-300'
                    : 'hover:bg-gray-50 hover:border-gray-300'
                  }`}
              >
                <div className="font-medium">{preset.name}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Target Size</label>
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Unit</label>
              <select
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="kb">KB</option>
                <option value="mb">MB</option>
              </select>
            </div>
          </div>
        </div>
        </ScrollEffect>
      )}

      {/* Compression Preview */}
      {selectedFile && (
        <ScrollEffect animation="fade-up" duration={600} delay={200}>
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Compression Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Original Size:</span>
              <span className="font-medium">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="font-medium">
                {compressionType === 'quality' ? `${quality}% Quality` : `${targetSize} ${targetUnit.toUpperCase()}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Expected Reduction:</span>
              <span className="font-medium text-green-600">
                {compressionType === 'quality'
                  ? `~${Math.round((100 - quality) * 0.8)}%`
                  : 'To target size'
                }
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
            : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
          }`}
        whileHover={!loading && selectedFile ? { scale: 1.02 } : {}}
        whileTap={!loading && selectedFile ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
            Compressing...
          </div>
        ) : (
          'Compress Image'
        )}
      </motion.button>
      </ScrollEffect>

      {/* Tips */}
      <ScrollEffect animation="fade-up" duration={600} delay={300}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Compression Tips:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• JPEG works best for photos with many colors</li>
          <li>• PNG is better for images with transparency</li>
          <li>• Lower quality = smaller file size</li>
          <li>• Size-based compression ensures exact file size</li>
        </ul>
      </div>
      </ScrollEffect>
    </>
  );
};

const CompressImageTool = () => {
  return (
    <ToolLayout
      title="Compress Image"
      description="Reduce image file size while maintaining quality using advanced compression"
      endpoint={`${config.API_BASE_URL}/api/tools/compress-50kb`}
      acceptedFormats="image/*"
      maxFileSize={10}
    >
      <CompressImageSettings />
    </ToolLayout>
  );
};

export default CompressImageTool;
