import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toolsConfig } from "../toolsConfig";
import ScrollEffect from "./shared/ScrollEffect";

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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Privacy Notice with fade-out */}
      <ScrollEffect animation="fade-down" duration={600}>
        <PrivacyNotice />
      </ScrollEffect>

      {Object.keys(filteredTools).map((category, categoryIndex) => (
        <ScrollEffect 
          key={category} 
          animation="fade-up" 
          duration={400} 
          delay={Math.min(categoryIndex * 30, 150)}
        >
          <div className="mb-10 sm:mb-14 lg:mb-16">
            {/* Category Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4 mb-2">
                <div className="h-1.5 w-10 sm:w-14 lg:w-16 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white">
                  {category}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-14 sm:ml-18 lg:ml-20">
                {filteredTools[category].length} tool{filteredTools[category].length !== 1 ? 's' : ''} available
              </p>
            </div>

            {/* Tool Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
              {filteredTools[category].map((tool, index) => (
                <ScrollEffect 
                  key={index}
                  animation="zoom-in" 
                  duration={300} 
                  delay={Math.min(index * 15, 100)}
                >
                  <Link
                    to={getToolLink(tool.name)}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-md hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gray-100 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 overflow-hidden h-full flex flex-col"
                  >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    
                    {/* Decorative corner element */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-pink-400/10 dark:from-purple-600/20 dark:to-pink-600/20 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content Container */}
                    <div className="relative flex flex-col items-center text-center flex-1">
                      {/* Icon Container with Badge */}
                      <div className="relative mb-4">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-lg group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                          {tool.name.charAt(0)}
                        </div>
                        {/* Pulse animation ring */}
                        <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 opacity-0 group-hover:opacity-75 group-hover:scale-125 transition-all duration-500"></div>
                      </div>
                      
                      {/* Tool Name */}
                      <div className="flex-1 w-full mb-3">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 leading-snug px-1">
                          {tool.name}
                        </h3>
                      </div>
                      
                      {/* Description */}
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed px-1 min-h-[2.5rem]">
                        {tool.description || "Professional tool for image processing"}
                      </p>
                      
                      {/* Action Button */}
                      <div className="mt-4 w-full">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 text-white rounded-lg text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <span>Open Tool</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                </ScrollEffect>
              ))}
            </div>
          </div>
        </ScrollEffect>
      ))}

      {Object.keys(filteredTools).length === 0 && searchQuery && (
        <ScrollEffect animation="bounce" duration={800}>
          <div className="text-center py-16 sm:py-20">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-purple-500 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              No tools found
            </h3>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6">Try searching with different keywords</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              View All Tools
            </button>
          </div>
        </ScrollEffect>
      )}
    </div>
  );
};

export default ImageTools;
