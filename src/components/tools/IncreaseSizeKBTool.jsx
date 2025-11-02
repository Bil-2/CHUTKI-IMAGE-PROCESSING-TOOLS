import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import config from '../../config';
import FileUploadZone from '../shared/FileUploadZone';

const IncreaseSizeKBTool = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [formData, setFormData] = useState({
    targetKB: '',
    quality: 95,
    format: 'jpeg',
    preserveMetadata: true,
    upscaleMethod: 'standard'
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
      
      // Get file info
      const sizeInKB = (selectedFile.size / 1024).toFixed(2);
      setFileInfo({
        name: selectedFile.name,
        size: sizeInKB,
        type: selectedFile.type
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/api/tools/increase-size-kb`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: data
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Get size increase info from response headers
        let sizeIncreaseInfo = null;
        try {
          const sizeIncreaseHeader = response.headers.get('X-Size-Increase-Info');
          if (sizeIncreaseHeader) {
            sizeIncreaseInfo = JSON.parse(sizeIncreaseHeader);
          }
        } catch (parseError) {
          console.log('Failed to parse size increase info');
        }
        
        setResult({
          url,
          sizeIncreaseInfo
        });
        
        // Show size increase results toast
        if (sizeIncreaseInfo) {
          toast.success(`Image size increased by ${sizeIncreaseInfo.increasePercentage}% (${(sizeIncreaseInfo.increase / 1024).toFixed(2)} KB)`);
        } else {
          toast.success('Image processed successfully!');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Processing failed');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result && result.url) {
      const a = document.createElement('a');
      a.href = result.url;
      const extension = formData.format === 'png' ? '.png' : formData.format === 'webp' ? '.webp' : '.jpg';
      a.download = 'increased-' + Date.now() + extension;
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mb-4 flex items-center group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Increase Image Size in KB</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Increase your image file size with quality controls and format options</p>
          <span className="inline-block mt-3 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
            Image Editing
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Image
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-indigo-500 transition-colors cursor-pointer"
                />
              </div>

              {/* File Info */}
              {fileInfo && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">File Information</h3>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <p><span className="font-medium">Name:</span> {fileInfo.name}</p>
                    <p><span className="font-medium">Size:</span> {fileInfo.size} KB</p>
                    <p><span className="font-medium">Type:</span> {fileInfo.type}</p>
                  </div>
                </div>
              )}

              {/* Preview */}
              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
                  <img src={preview} alt="Preview" className="w-full h-64 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600" />
                </div>
              )}

              {/* Target Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Size (KB)
                </label>
                <input
                  type="number"
                  value={formData.targetKB}
                  onChange={(e) => setFormData({...formData, targetKB: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter target size in KB"
                  min="1"
                />
              </div>

              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quality: {formData.quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formData.quality}
                  onChange={(e) => setFormData({...formData, quality: e.target.value})}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Low Quality</span>
                  <span>High Quality</span>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Output Format
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({...formData, format: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>

              {/* Upscale Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upscale Method
                </label>
                <select
                  value={formData.upscaleMethod}
                  onChange={(e) => setFormData({...formData, upscaleMethod: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="ai">AI Upscaling (for small files)</option>
                </select>
              </div>

              {/* Preserve Metadata */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="preserveMetadata"
                  checked={formData.preserveMetadata}
                  onChange={(e) => setFormData({...formData, preserveMetadata: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="preserveMetadata" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Preserve metadata (EXIF, GPS, etc.)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Process Image'}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Result
            </h2>
            
            {result ? (
              <div className="space-y-6">
                <img src={result.url} alt="Result" className="w-full h-80 object-contain rounded-lg bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600" />
                
                {/* Size Increase Results */}
                {result.sizeIncreaseInfo && (
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Size Increase Results</h3>
                    <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <p><span className="font-medium">Original Size:</span> {(result.sizeIncreaseInfo.originalSize / 1024).toFixed(2)} KB</p>
                      <p><span className="font-medium">Increased Size:</span> {(result.sizeIncreaseInfo.increasedSize / 1024).toFixed(2)} KB</p>
                      <p><span className="font-medium">Size Increase:</span> {(result.sizeIncreaseInfo.increase / 1024).toFixed(2)} KB ({result.sizeIncreaseInfo.increasePercentage}%)</p>
                      <p><span className="font-medium">Target:</span> {result.sizeIncreaseInfo.targetKB} KB</p>
                      <p><span className="font-medium">Quality:</span> {result.sizeIncreaseInfo.quality}%</p>
                      <p><span className="font-medium">Format:</span> {result.sizeIncreaseInfo.format.toUpperCase()}</p>
                      <p><span className="font-medium">Upscale Method:</span> {result.sizeIncreaseInfo.upscaleMethod}</p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleDownload}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Increased Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-500">
                {loading ? (
                  <>
                    <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Processing your image...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Upload and process an image to see results here
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncreaseSizeKBTool;
