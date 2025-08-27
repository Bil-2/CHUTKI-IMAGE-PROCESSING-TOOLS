import React, { useState } from "react";
import ImageTools from "./ImageTools";
import ChutkiAssistant from "./ChutkiAssistant";
import Footer from "./Footer";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* ======= INTRO SECTION ======= */}
      <section className="text-center px-3 sm:px-4 py-4 sm:py-6">
        <h2 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white animate-fade-up">
          Chutki Image Tool - Compress & Edit Pictures
        </h2>
        <p className="max-w-2xl mx-auto text-xs sm:text-base text-gray-600 dark:text-gray-300 mt-3 sm:mt-4 leading-relaxed animate-fade-up-delay">
          Chutki Image Tool is a collection of online tools like Image Compressor, Image Resize Tool,
          and Image Conversion Tools (Image to JPG, Image to PNG, etc).
        </p>
      </section>

      {/* Search */}
      <section className="sticky top-0 z-40 bg-gradient-to-r from-white/80 via-purple-50/60 to-white/80 dark:from-gray-900/80 dark:via-purple-900/40 dark:to-gray-900/80 backdrop-blur-md px-2 sm:px-4 py-2 sm:py-3 shadow-lg">
        <div className="max-w-full sm:max-w-md mx-auto relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-full opacity-75 blur-sm animate-pulse"></div>
          <div className="relative flex items-center gap-2 bg-white dark:bg-gray-900 border border-purple-300/60 dark:border-purple-500/50 rounded-full px-2 sm:px-4 py-1 sm:py-1.5">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-purple-400 dark:placeholder-purple-300 text-xs sm:text-base"
            />
          </div>
        </div>
      </section>

      <ImageTools searchQuery={searchQuery} />
      <ChutkiAssistant />
      <Footer />
    </>
  );
}

export default Home;
