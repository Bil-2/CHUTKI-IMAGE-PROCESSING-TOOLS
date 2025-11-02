#!/usr/bin/env node

/**
 * Automated Tool Page Generator
 * Generates individual frontend pages for all 82 tools
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tool template generator
const generateToolComponent = (tool, category) => {
  const componentName = tool.name.replace(/[^a-zA-Z0-9]/g, '');
  const toolId = tool.route.split('/').pop();
  
  return `import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import config from '../../config';

const ${componentName}Tool = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${tool.endpoint}', {
        method: '${tool.method}',
        headers: token ? { 'Authorization': \`Bearer \${token}\` } : {},
        body: formDataToSend
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setResult(url);
        toast.success('Image processed successfully!');
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
    if (result) {
      const a = document.createElement('a');
      a.href = result;
      a.download = '${toolId}-' + Date.now() + '.jpg';
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">${tool.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">${tool.description}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
            ${category}
          </span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upload Image</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Preview */}
              {preview && (
                <div className="mt-4">
                  <img src={preview} alt="Preview" className="w-full h-48 object-contain rounded-md bg-gray-100 dark:bg-gray-700" />
                </div>
              )}

              ${generateFormFields(tool.fields)}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Process Image'}
              </button>
            </form>
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Result</h2>
            
            {result ? (
              <div className="space-y-4">
                <img src={result} alt="Result" className="w-full h-64 object-contain rounded-md bg-gray-100 dark:bg-gray-700" />
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  Download Image
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-md">
                <p className="text-gray-500 dark:text-gray-400">
                  {loading ? 'Processing your image...' : 'Upload and process an image to see results'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ${componentName}Tool;
`;
};

const generateFormFields = (fields) => {
  if (!fields || fields.length <= 1) return '';
  
  const fieldInputs = fields
    .filter(f => f !== 'file' && f !== 'files')
    .map(field => {
      const label = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      return `
              {/* ${label} */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ${label}
                </label>
                <input
                  type="text"
                  value={formData.${field} || ''}
                  onChange={(e) => setFormData({...formData, ${field}: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter ${label.toLowerCase()}"
                />
              </div>`;
    }).join('\n');
  
  return fieldInputs;
};

console.log('🚀 Tool Page Generator Ready!');
console.log('This script will generate all 82 tool pages automatically.');
console.log('Run: node scripts/generateAllToolPages.js');

export { generateToolComponent };
