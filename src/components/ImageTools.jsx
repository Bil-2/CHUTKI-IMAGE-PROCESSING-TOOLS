import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toolsConfig } from "../toolsConfig";

const tools = toolsConfig;

const ImageTools = ({ searchQuery }) => {
  // Privacy notice with smooth fade-out
  const PrivacyNotice = () => {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
      // Start fade-out 0.5s before removal
      const timer = setTimeout(() => {
        setFadeOut(true);
        // After fade transition ends, hide completely
        setTimeout(() => setVisible(false), 400);
      }, 2500); // Show for 3 seconds

      return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
      <div
        className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6 transition-opacity duration-500 ${
          fadeOut ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200"> Privacy Notice</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your images are automatically deleted after 30 minutes. We care about your privacy and security.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const getToolLink = (toolName) => {
    for (const category of Object.values(toolsConfig)) {
      const tool = category.find((t) => t.name === toolName);
      if (tool) return tool.route;
    }
    const toolNameLower = toolName.toLowerCase();
    if (toolNameLower.includes("passport photo maker")) return "/passport-photo";
    if (toolNameLower.includes("heic to jpg")) return "/tools/heic-to-jpg";
    if (toolNameLower.includes("webp to jpg")) return "/tools/webp-to-jpg";
    if (toolNameLower.includes("jpeg to png")) return "/tools/jpeg-to-png";
    if (toolNameLower.includes("png to jpeg")) return "/tools/png-to-jpeg";
    return "/tools";
  };

  const filteredTools = {};
  Object.keys(tools).forEach((category) => {
    const filteredCategory = tools[category].filter((tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredCategory.length > 0) {
      filteredTools[category] = filteredCategory;
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Privacy Notice with fade-out */}
      <PrivacyNotice />

      {Object.keys(filteredTools).map((category) => (
        <div key={category} className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredTools[category].map((tool, index) => (
              <Link
                key={index}
                to={getToolLink(tool.name)}
                className="group bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg font-bold group-hover:scale-110 transition-transform duration-300">
                    {tool.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 truncate">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {tool.description || "Click to use"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(filteredTools).length === 0 && searchQuery && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No tools found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">Try searching for something else</p>
        </div>
      )}
    </div>
  );
};

export default ImageTools;
