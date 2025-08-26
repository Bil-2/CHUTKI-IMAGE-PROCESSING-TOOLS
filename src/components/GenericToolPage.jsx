import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toolsConfig } from "../toolsConfig";

const GenericToolPage = () => {
  const { toolName } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  // Find the tool configuration
  const tool = Object.values(toolsConfig)
    .flat()
    .find(t => t.route === `/tools/${toolName}`);

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
      console.log(`Updated ${field}:`, value); // Debug log
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

      console.log("Sending form data:", Object.fromEntries(formDataToSend.entries()));

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
          a.download = `processed-${Date.now()}.pdf`;
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
          a.download = `processed-${Date.now()}.jpg`;
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
      prompt: { type: "text", placeholder: "Describe this image", label: "AI Prompt" },
      pageSize: { type: "select", options: ["A4", "A3", "Letter", "Legal"], label: "Page Size" },
      margin: { type: "number", placeholder: "20", label: "Margin", defaultValue: "20" },
      gridSize: { type: "select", options: ["2x2", "3x3", "4x4"], label: "Grid Size" },
      joinDirection: { type: "select", options: ["horizontal", "vertical"], label: "Join Direction" },
      spacing: { type: "number", placeholder: "0", label: "Spacing", defaultValue: "0" },
      rows: { type: "number", placeholder: "2", label: "Rows", defaultValue: "2" },
      cols: { type: "number", placeholder: "2", label: "Columns", defaultValue: "2" },
      aspect: { type: "select", options: ["1:1", "4:5"], label: "Aspect Ratio" },
      position: { type: "select", options: ["bottomRight", "center", "topLeft"], label: "Position" },
      opacity: { type: "number", placeholder: "0.7", label: "Opacity", defaultValue: "0.7", min: "0", max: "1", step: "0.1" },
      maintain: { type: "select", options: ["true", "false"], label: "Maintain Aspect Ratio" },
      enhance: { type: "select", options: ["true", "false"], label: "Enhance Quality" },
      quantity: { type: "number", placeholder: "4", label: "Number of Copies", defaultValue: "4" },
      border: { type: "select", options: ["none", "thin", "thick"], label: "Border Style" },
      intensity: { type: "number", placeholder: "10", label: "Effect Intensity", defaultValue: "10" },
      gender: { type: "select", options: ["male", "female", "random"], label: "Gender" },
      age: { type: "select", options: ["young", "adult", "senior"], label: "Age Group" },
      style: { type: "select", options: ["realistic", "artistic", "cartoon"], label: "Style" }
    };

    const config = fieldConfig[field];
    if (!config) return null;

    return (
      <div key={field} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {config.label}
        </label>
        {config.type === "select" ? (
          <select
            value={formData[field] ?? config.defaultValue ?? ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {tool.name}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {tool.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image Upload and Preview */}
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
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!preview ? (
                <div>
                  <div className="text-6xl mb-4">📷</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select Or Drag & Drop Image Here
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Supports JPG, PNG, WEBP, HEIC formats
                  </p>
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Select Image
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
                    }}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            {/* Preview Section */}
            {preview && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Image Preview</h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>File: {selectedFile?.name}</span>
                  <span>Size: {(selectedFile?.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            )}

            {/* Results */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{result}</p>
              </div>
            )}
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Settings Panel */}
            {tool.fields && tool.fields.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Tool Settings</h3>
                <div className="space-y-4">
                  {console.log("Tool fields:", tool.fields)}
                  {console.log("Form data:", formData)}
                  {tool.fields.map(field => {
                    console.log(`Rendering field: ${field}`);
                    return renderFormField(field);
                  })}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={!selectedFile || loading}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${!selectedFile || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
                }`}
              whileHover={!loading && selectedFile ? { scale: 1.02 } : {}}
              whileTap={!loading && selectedFile ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Process ${tool.name}`
              )}
            </motion.button>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Upload a clear, high-quality image</li>
                <li>• Adjust settings according to your needs</li>
                <li>• Click process to generate your result</li>
                <li>• Your processed file will be downloaded automatically</li>
              </ul>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <button
                onClick={() => navigate("/")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                ← Back to Tools
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenericToolPage;
