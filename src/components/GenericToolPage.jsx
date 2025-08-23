import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toolsConfig } from "../toolsConfig";

const GenericToolPage = () => {
  const { toolName } = useParams();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", selectedFile);

      // Add other form fields
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(tool.endpoint, {
        method: tool.method,
        body: formDataToSend,
      });

      if (response.ok) {
        if (tool.name.toLowerCase().includes("pdf")) {
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
        } else if (tool.name.toLowerCase().includes("text") || tool.name.toLowerCase().includes("caption")) {
          // Handle text response
          const data = await response.json();
          setResult(data.text || data.caption || "Processing completed");
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
    if (field === "image") return null; // Skip image field as it's handled separately

   const fieldConfig = {
  width: { type: "number", placeholder: "Width", label: "Width" },
  height: { type: "number", placeholder: "Height", label: "Height" },
  dpi: { type: "number", placeholder: "300", label: "DPI", defaultValue: "300" },
  quality: { type: "number", placeholder: "80", label: "Quality", defaultValue: "80" },
  format: { type: "select", options: ["jpg", "png", "webp"], label: "Output Format" },
  background: { type: "select", options: ["white", "transparent", "black"], label: "Background" },
  size: { type: "select", options: ["35x45", "51x51", "50x70", "custom"], label: "Size" },
  angle: { type: "number", placeholder: "90", label: "Rotation Angle", defaultValue: "90" },
  flipDirection: { type: "select", options: ["horizontal", "vertical"], label: "Flip Direction" },
  text: { type: "text", placeholder: "Enter text", label: "Text to add" },
  x: { type: "number", placeholder: "50", label: "X Position", defaultValue: "50" },
  y: { type: "number", placeholder: "50", label: "Y Position", defaultValue: "50" },
  fontSize: { type: "number", placeholder: "24", label: "Font Size", defaultValue: "24" },
  color: { type: "text", placeholder: "white", label: "Text Color", defaultValue: "white" },
  pixelSize: { type: "number", placeholder: "10", label: "Pixel Size", defaultValue: "10" },
  scale: { type: "number", placeholder: "2", label: "Scale Factor", defaultValue: "2" },
  targetSize: { type: "number", placeholder: "100", label: "Target Size (KB)", defaultValue: "100" },
  maxSize: { type: "number", placeholder: "100", label: "Max Size (KB)", defaultValue: "100" },
  unit: { type: "select", options: ["mm", "cm", "inch", "px"], label: "Unit" },
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
  opacity: { type: "number", placeholder: "0.7", label: "Opacity", defaultValue: "0.7", min: "0", max: "1", step: "0.1" }
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
            value={formData[field] || config.defaultValue || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {config.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            type={config.type}
            placeholder={config.placeholder}
            value={formData[field] || config.defaultValue || ""}
            onChange={(e) => handleInputChange(field, e.target.value)}
            min={config.min}
            max={config.max}
            step={config.step}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {tool.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {tool.description}
          </p>
        </div>

        

        {/* Tool Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Image
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
                >
                  {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                </label>
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>

            {/* Dynamic Form Fields */}
            {tool.fields && tool.fields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tool.fields.map(field => renderFormField(field))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : `Process ${tool.name}`}
            </button>
          </form>
        </div>

        {/* Results */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-800 dark:text-green-200">{result}</p>
          </div>
        )}

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
  );
};

export default GenericToolPage;
