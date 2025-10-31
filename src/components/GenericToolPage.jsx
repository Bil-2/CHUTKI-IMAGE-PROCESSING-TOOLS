import React, { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toolsConfig } from "../toolsConfig";
import ScrollEffect from "./shared/ScrollEffect";

const GenericToolPage = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [customFilename, setCustomFilename] = useState('');
  const fileInputRef = useRef(null);

  // Memoize tool lookup to prevent excessive re-renders
  const tool = useMemo(() => {
    const currentPath = window.location.pathname;
    return Object.values(toolsConfig)
      .flat()
      .find(t => t.route === currentPath);
  }, []);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tool Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested tool could not be found.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", selectedFile);

      // Add other form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add custom filename if provided
      if (customFilename.trim()) {
        formDataToSend.append('customFilename', customFilename.trim());
      }


      const response = await fetch(tool.endpoint, {
        method: tool.method,
        body: formDataToSend,
      });

      if (response.ok) {
        if (tool.returnsJson || tool.name.toLowerCase().includes("text") || tool.name.toLowerCase().includes("dpi") || tool.name.toLowerCase().includes("color")) {
          // Handle JSON response
          const data = await response.json();
          setResult(data.text || data.dpi || data.color || data.message || "Processing completed");
        } else if (tool.name.toLowerCase().includes("pdf")) {
          // Handle PDF download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;

          // Use custom filename if provided, otherwise use default
          const defaultName = `processed-${Date.now()}.pdf`;
          const finalFilename = customFilename.trim() ?
            `${customFilename.trim()}.pdf` : defaultName;
          a.download = finalFilename;

          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setResult("PDF generated successfully!");
        } else {
          // Handle image download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;

          // Use custom filename if provided, otherwise use default
          const defaultName = `processed-${Date.now()}.jpg`;
          const finalFilename = customFilename.trim() ?
            `${customFilename.trim()}.jpg` : defaultName;
          a.download = finalFilename;

          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          setResult("Image processed successfully!");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Processing failed");
      }
    } catch (err) {
      setError("An error occurred while processing the file");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderFormField = (field) => {
    if (field === "image" || field === "file") return null; // Skip image/file fields as they're handled separately

    const fieldConfig = {
      width: { type: "number", placeholder: "Width", label: "Width" },
      height: { type: "number", placeholder: "Height", label: "Height" },
      dpi: { type: "number", placeholder: "300", label: "DPI", defaultValue: "300" },
      quality: { type: "number", placeholder: "80", label: "Quality", defaultValue: "80" },
      format: { type: "select", options: ["jpg", "png", "webp"], label: "Output Format" },
      background: { type: "select", options: ["white", "transparent", "black"], label: "Background" },
      size: { type: "select", options: ["35x45", "51x51", "50x70", "custom"], label: "Size" },
      angle: { type: "number", placeholder: "90", label: "Rotation Angle", defaultValue: "90" },
      direction: { type: "select", options: ["horizontal", "vertical"], label: "Direction" },
      flipDirection: { type: "select", options: ["horizontal", "vertical"], label: "Flip Direction" },
      text: { type: "text", placeholder: "Enter text", label: "Text to add" },
      name: { type: "text", placeholder: "Enter name", label: "Name" },
      dob: { type: "text", placeholder: "DD/MM/YYYY", label: "Date of Birth" },
      x: { type: "number", placeholder: "50", label: "X Position", defaultValue: "50" },
      y: { type: "number", placeholder: "50", label: "Y Position", defaultValue: "50" },
      fontSize: { type: "number", placeholder: "24", label: "Font Size", defaultValue: "24" },
      color: { type: "text", placeholder: "white", label: "Text Color", defaultValue: "white" },
      pixelSize: { type: "number", placeholder: "10", label: "Pixel Size", defaultValue: "10" },
      scale: { type: "number", placeholder: "2", label: "Scale Factor", defaultValue: "2" },
      targetSize: { type: "number", placeholder: "100", label: "Target Size (KB)", defaultValue: "100" },
      targetKB: { type: "number", placeholder: "100", label: "Target Size (KB)", defaultValue: "100" },
      targetMB: { type: "number", placeholder: "1", label: "Target Size (MB)", defaultValue: "1" },
      maxSize: { type: "number", placeholder: "100", label: "Max Size (KB)", defaultValue: "100" },
      unit: { type: "select", options: ["mm", "cm", "inch", "px"], label: "Unit" },
      language: { type: "select", options: ["eng", "fra", "spa", "deu", "ita"], label: "Language" },
      lang: { type: "select", options: ["eng", "fra", "spa", "deu", "ita"], label: "Language" },
      pageSize: { type: "select", options: ["A4", "Letter", "Legal", "A3"], label: "Page Size" },
      maintain: { type: "select", options: ["true", "false"], label: "Maintain Aspect Ratio" },
      position: { type: "select", options: ["center", "top-left", "top-right", "bottom-left", "bottom-right"], label: "Position" },
      opacity: { type: "number", placeholder: "0.5", label: "Opacity", defaultValue: "0.5", min: "0", max: "1", step: "0.1" },
      intensity: { type: "number", placeholder: "5", label: "Intensity", defaultValue: "5", min: "1", max: "10" },
      quantity: { type: "number", placeholder: "4", label: "Quantity", defaultValue: "4", min: "1", max: "16" },
      border: { type: "select", options: ["none", "thin", "thick"], label: "Border" },
      enhance: { type: "select", options: ["true", "false"], label: "Auto Enhance" },
      edge: { type: "select", options: ["soft", "hard"], label: "Edge Detection" },
      contrast: { type: "number", placeholder: "1", label: "Contrast", defaultValue: "1", min: "0.5", max: "2", step: "0.1" },
      rows: { type: "number", placeholder: "3", label: "Rows", defaultValue: "3", min: "1", max: "10" },
      cols: { type: "number", placeholder: "3", label: "Columns", defaultValue: "3", min: "1", max: "10" },
      spacing: { type: "number", placeholder: "10", label: "Spacing (px)", defaultValue: "10", min: "0", max: "50" },
      gender: { type: "select", options: ["male", "female", "random"], label: "Gender" },
      age: { type: "select", options: ["young", "adult", "senior", "random"], label: "Age Group" },
      style: { type: "select", options: ["realistic", "artistic", "cartoon"], label: "Style" }
    };

    const config = fieldConfig[field];
    if (!config) return null;

    return (
      <div key={field} className="mb-3 sm:mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {config.label}
        </label>
        {config.type === "select" ? (
          <select
            value={formData[field] ?? config.defaultValue ?? ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base transition-all duration-200"
          >
            <option value="">Select {config.label}</option>
            {config.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={config.type}
            placeholder={config.placeholder}
            value={formData[field] ?? config.defaultValue ?? ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            min={config.min}
            max={config.max}
            step={config.step}
            className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm sm:text-base transition-all duration-200"
          />
        )}
      </div>
    );
  };

  // Initialize form data with default values when tool changes
  React.useEffect(() => {
    if (tool && tool.fields) {
      const initialData = {};
      tool.fields.forEach(field => {
        const fieldConfig = {
          dpi: "300",
          quality: "80",
          angle: "90",
          fontSize: "24",
          color: "white",
          pixelSize: "10",
          scale: "2",
          targetSize: "100",
          maxSize: "100",
          x: "50",
          y: "50",
          margin: "20",
          spacing: "0",
          rows: "2",
          cols: "2",
          opacity: "0.7"
        };
        if (fieldConfig[field]) {
          initialData[field] = fieldConfig[field];
        }
      });
      setFormData(initialData);
    }
  }, [tool]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2 sm:mb-4">
            {tool.name}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
            {tool.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Image Upload and Preview */}
          <div className="space-y-4 sm:space-y-6">
            {/* File Upload Area */}
            <div
              className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-4 sm:p-6 lg:p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer bg-white dark:bg-gray-800 min-h-[200px] sm:min-h-[250px] flex flex-col justify-center"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!preview ? (
                <div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-4">📷</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Select Or Drag & Drop Image Here
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                    Supports JPG, PNG, WEBP, HEIC formats
                  </p>
                  <button className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base font-medium">
                    Select Image
                  </button>
                </div>
              ) : (
                <div>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full h-32 sm:h-48 lg:h-64 object-contain mx-auto rounded-lg shadow-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setPreview(null);
                      setResult(null);
                    }}
                    className="mt-3 sm:mt-4 bg-red-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">File Information</h3>
                <div className="space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <div className="break-all">Name: {selectedFile.name}</div>
                  <div>Size: {(selectedFile.size / 1024).toFixed(1)} KB</div>
                  <div>Type: {selectedFile.type}</div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Success!</h3>
                <p className="text-sm sm:text-base text-green-700 dark:text-green-300">{result}</p>
              </motion.div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm sm:text-base text-red-700 dark:text-red-300">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Right Column - Tool Settings and Process */}
          <div className="space-y-4 sm:space-y-6">
            {/* Tool Settings */}
            {tool.fields && tool.fields.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Tool Settings</h3>
                <div className="space-y-3 sm:space-y-4">
                  {tool.fields.map(field => {
                    const renderedField = renderFormField(field);
                    return renderedField;
                  })}
                </div>
              </div>
            )}

            {/* Custom Filename Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Output Settings</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Filename (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter custom filename (without extension)"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Leave empty to use auto-generated filename
                  </p>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed text-sm sm:text-base lg:text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Process ${tool.name}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericToolPage;
