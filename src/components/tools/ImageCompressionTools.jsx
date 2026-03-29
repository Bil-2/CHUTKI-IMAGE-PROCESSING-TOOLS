// src/components/tools/ImageCompressionTools.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { compressionToolsConfig } from "../../data/compressionToolsConfig";
import {
  LuMinimize2, LuZap, LuArrowLeft, LuSearch, LuX, LuPackage
} from "react-icons/lu";
import Footer from "../Footer";

const getToolIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes("mb")) return <LuPackage className="w-8 h-8 text-white" />;
  if (n.includes("kb") || n.includes("convert")) return <LuZap className="w-8 h-8 text-white" />;
  return <LuMinimize2 className="w-8 h-8 text-white" />;
};

const ImageCompressionTools = () => {
  const [search, setSearch] = useState("");

  const filtered = compressionToolsConfig.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-300 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <Link to="/image-tools" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors">
            <LuArrowLeft className="w-4 h-4" /> Back to All Tools
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <LuMinimize2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Image Compression Tools
              </h1>
              <p className="text-white/80 text-base sm:text-lg mt-1">
                {compressionToolsConfig.length} tools — compress to exact KB/MB targets
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mt-8">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search compression tools..."
              className="w-full pl-12 pr-10 py-3.5 bg-white/15 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm sm:text-base"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
                <LuX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {search && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "<span className="font-semibold text-emerald-600">{search}</span>"
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <LuSearch className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No tools found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try different keywords</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5">
            {filtered.map((tool, i) => (
              <Link
                key={i}
                to={tool.route}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 overflow-hidden flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/10 dark:to-teal-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="relative flex flex-col items-center text-center flex-1">
                  <div className="relative mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      {getToolIcon(tool.name)}
                    </div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 opacity-0 group-hover:opacity-60 group-hover:scale-125 transition-all duration-500" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-2 px-1">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 px-1 flex-1">
                    {tool.description}
                  </p>
                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-center gap-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Open Tool
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ImageCompressionTools;
