import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ToolLayout = ({
  title,
  description,
  endpoint,
  children,
  onSubmit,
  acceptedFormats = "image/*",
  maxFileSize = 10,
  showPreview = true
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`File size must be less than ${maxFileSize}MB`);
        return;
      }

      setSelectedFile(file);
      setResult(null);

      if (showPreview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (formData) => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('file', selectedFile);

      // Add additional form data if provided
      if (formData) {
        Object.entries(formData).forEach(([key, value]) => {
          data.append(key, value);
        });
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          // Handle JSON response (e.g., OCR results)
          const jsonResult = await response.json();
          setResult({ type: 'json', data: jsonResult });
          toast.success('Processing completed!');
        } else {
          // Handle file download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `processed_${selectedFile.name}`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          toast.success('File downloaded successfully!');
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Processing failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - File Upload */}
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
                accept={acceptedFormats}
                onChange={handleFileSelect}
                className="hidden"
              />

              {!preview ? (
                <div>
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select Or Drag & Drop File Here
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Max file size: {maxFileSize}MB
                  </p>
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Select File
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
                      setResult(null);
                    }}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">File Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Name: {selectedFile.name}</div>
                  <div>Size: {(selectedFile.size / 1024).toFixed(1)} KB</div>
                  <div>Type: {selectedFile.type}</div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && result.type === 'json' && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Results</h3>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right Column - Tool Settings */}
          <div className="space-y-6">
            {/* Tool-specific settings passed as children */}
            {children && React.cloneElement(children, {
              selectedFile,
              loading,
              onSubmit: handleSubmit
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;
