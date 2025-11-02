import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import config from '../../config';
import FileUploadZone from '../shared/FileUploadZone';

const PassportPhotoTool = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [formData, setFormData] = useState({
    size: '2x2',
    dpi: '300',
    background: '#FFFFFF',
    quantity: '1',
    paperSize: '4x6',
    enhance: true,
    country: 'US',
    complianceCheck: true,
    headPositionCheck: true,
    lightingCheck: true,
    backgroundCheck: true
  });

  const handleFileChange = (selectedFile) => {
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
    } else {
      // File was removed
      setFile(null);
      setPreview(null);
      setFileInfo(null);
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
      const response = await fetch(`${config.API_BASE_URL}/api/tools/passport-photo`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: data
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Get compliance status from response headers
        let complianceStatus = null;
        try {
          const complianceHeader = response.headers.get('X-Compliance-Status');
          if (complianceHeader) {
            complianceStatus = JSON.parse(complianceHeader);
          }
        } catch (parseError) {
          console.log('Failed to parse compliance status');
        }
        
        setResult({
          url,
          compliance: complianceStatus
        });
        
        // Show compliance toast
        if (complianceStatus && !complianceStatus.passed) {
          toast.error('Photo may not meet all requirements. Please check compliance report.');
        } else {
          toast.success('Passport photos generated successfully!');
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
      a.download = 'passport-photos-' + Date.now() + '.jpg';
      a.click();
    }
  };

  // Common passport sizes
  const passportSizes = [
    { label: '2x2 inches (51x51 mm)', value: '2x2' },
    { label: '1x1 inches (25x25 mm)', value: '1x1' },
    { label: '1.5x1.5 inches (38x38 mm)', value: '1.5x1.5' },
    { label: '35x45 mm', value: '35x45' },
    { label: '35x35 mm', value: '35x35' },
    { label: '45x45 mm', value: '45x45' },
    { label: '50x50 mm', value: '50x50' },
    { label: '51x51 mm', value: '51x51' }
  ];
  
  // Country options
  const countryOptions = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Australia', value: 'Australia' },
    { label: 'India', value: 'India' },
    { label: 'Germany', value: 'Germany' },
    { label: 'France', value: 'France' },
    { label: 'China', value: 'China' }
  ];

  // Paper sizes
  const paperSizes = [
    { label: '4x6 inches', value: '4x6' },
    { label: '5x7 inches', value: '5x7' },
    { label: '8x10 inches', value: '8x10' },
    { label: 'A4 (210x297 mm)', value: 'A4' },
    { label: 'A5 (148x210 mm)', value: 'A5' }
  ];

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Advanced Passport Photo Maker</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Create professional passport photos with face detection and enhancement</p>
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
              Upload Photo & Customize Settings
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Zone */}
              <FileUploadZone
                file={file}
                onFileSelect={handleFileChange}
                preview={preview}
                accept="image/*"
              />

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
              
              {/* Country Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country/Region
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {countryOptions.map((country) => (
                    <option key={country.value} value={country.value}>{country.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select your country for specific passport requirements</p>
              </div>

              {/* Passport Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Passport Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {passportSizes.map((size) => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>

              {/* DPI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  DPI (Dots Per Inch)
                </label>
                <select
                  value={formData.dpi}
                  onChange={(e) => setFormData({...formData, dpi: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="72">72 DPI (Screen)</option>
                  <option value="150">150 DPI (Standard)</option>
                  <option value="300">300 DPI (High Quality)</option>
                  <option value="600">600 DPI (Professional)</option>
                </select>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.background}
                    onChange={(e) => setFormData({...formData, background: e.target.value})}
                    className="w-12 h-12 border-0 rounded cursor-pointer"
                  />
                  <select
                    value={formData.background}
                    onChange={(e) => setFormData({...formData, background: e.target.value})}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="#FFFFFF">White</option>
                    <option value="#000000">Black</option>
                    <option value="#0000FF">Blue</option>
                    <option value="#FF0000">Red</option>
                    <option value="#00FF00">Green</option>
                    <option value="#FFFF00">Yellow</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Photos
                </label>
                <select
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {[1, 2, 4, 6, 8, 9, 10, 12, 16].map((num) => (
                    <option key={num} value={num}>{num} photos</option>
                  ))}
                </select>
              </div>

              {/* Paper Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paper Size
                </label>
                <select
                  value={formData.paperSize}
                  onChange={(e) => setFormData({...formData, paperSize: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {paperSizes.map((size) => (
                    <option key={size.value} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>

              {/* Enhance */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enhance"
                  checked={formData.enhance}
                  onChange={(e) => setFormData({...formData, enhance: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="enhance" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Enhance photo quality (sharpen, adjust brightness)
                </label>
              </div>
              
              {/* Compliance Check */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="complianceCheck"
                  checked={formData.complianceCheck}
                  onChange={(e) => setFormData({...formData, complianceCheck: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="complianceCheck" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  Enable compliance checking
                </label>
              </div>
              
              {/* Advanced Compliance Checks */}
              {formData.complianceCheck && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium text-indigo-800 dark:text-indigo-200">Advanced Compliance Checks</h3>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="headPositionCheck"
                      checked={formData.headPositionCheck}
                      onChange={(e) => setFormData({...formData, headPositionCheck: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="headPositionCheck" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      Head position analysis
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lightingCheck"
                      checked={formData.lightingCheck}
                      onChange={(e) => setFormData({...formData, lightingCheck: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="lightingCheck" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      Lighting quality check
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="backgroundCheck"
                      checked={formData.backgroundCheck}
                      onChange={(e) => setFormData({...formData, backgroundCheck: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="backgroundCheck" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                      Background color validation
                    </label>
                  </div>
                </div>
              )}

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
                    Generating...
                  </span>
                ) : 'Generate Passport Photos'}
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
                
                {/* Compliance Report */}
                {result.compliance && (
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Compliance Report</h3>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="flex items-center mb-2">
                        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${result.compliance.passed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        Status: {result.compliance.passed ? 'Passed' : 'Issues Detected'}
                      </p>
                      {result.compliance.issues && result.compliance.issues.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Issues:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {result.compliance.issues.map((issue, index) => (
                              <li key={index}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.compliance.suggestions && result.compliance.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Suggestions:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {result.compliance.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.compliance.details && (
                        <div className="mt-2">
                          <p className="font-medium">Details:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {Object.entries(result.compliance.details).map(([key, value]) => (
                              <li key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value.toString()}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleDownload}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Photos
                  </button>
                  <button
                    onClick={() => {
                      // Simulate print order functionality
                      toast.success('Print order functionality would be implemented here');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Order Prints
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-500">
                {loading ? (
                  <>
                    <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Generating your passport photos...</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Upload and process a photo to generate passport photos
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

export default PassportPhotoTool;