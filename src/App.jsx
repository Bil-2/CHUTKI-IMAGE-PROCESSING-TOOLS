import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import ImageTools from "./components/ImageTools";
import ChutkiAssistant from "./components/ChutkiAssistant";
import Footer from "./components/Footer";
import ImageConversionTools from "./components/ImageConversionTools";
import ToolPage from "./components/ToolPage";
import PassportPhotoMaker from "./components/PassportPhotoMaker";
import GenericToolPage from "./components/GenericToolPage";
import OAuthSuccess from "./OAuthSuccess";
import Login from "./Login";


function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tokenChecked, setTokenChecked] = useState(false);

  // ✅ Token handling
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Don't redirect if we're on oauth-success route
    if (location.pathname === "/oauth-success") {
      setTokenChecked(true);
      return;
    }

    if (!token) {
      navigate("/login", { replace: true });
    }
    setTokenChecked(true);
  }, [token, navigate, location.pathname]);

  // ✅ Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);
  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (!tokenChecked) return null; // Wait until token check finishes

  return (
    <div className="min-h-screen transition-colors duration-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* ========= HEADER ========= */}
      <header className="relative shadow-lg z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 animate-gradient-move"></div>

        <div className="relative max-w-6xl mx-auto flex justify-between items-center px-3 sm:px-4 py-3 sm:py-4">
          {/* Logo + Name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 backdrop-blur-lg p-1.5 sm:p-2 rounded-full border border-white/20 animate-logo-glow">
              <img
                src="https://img.icons8.com/fluency/96/bot.png"
                alt="Chutki Assistant"
                className="w-8 h-8 sm:w-10 sm:h-10"
              />
            </div>
            <h1 className="text-base sm:text-2xl font-extrabold bg-gradient-to-r from-blue-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent drop-shadow-sm animate-text-shine">
              Chutki Image Tools
            </h1>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-full p-1.5 sm:p-2 bg-white/30 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 hover:scale-110"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"
              title="Logout"
              aria-label="Logout"
            >
              ⏻
            </button>

            <button
              onClick={toggleMenu}
              className="relative flex flex-col justify-center items-center space-y-1 sm:space-y-1.5 p-2 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 group"
              title="Menu"
              aria-label="Open Menu"
            >
              <span className="block w-5 sm:w-6 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-7"></span>
              <span className="block w-5 sm:w-6 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-7"></span>
              <span className="block w-5 sm:w-6 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-7"></span>
            </button>
          </div>
        </div>
      </header>

      {/* ========= FULLSCREEN MENU ========= */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transform transition-transform duration-500 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"
          } overflow-y-auto`}
      >
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 text-white text-2xl sm:text-3xl hover:text-gray-300"
          aria-label="Close Menu"
        >
          ✕
        </button>

        <nav className="mt-16 sm:mt-20 flex flex-col items-start px-5 sm:pl-10 space-y-4 sm:space-y-6 text-white text-sm sm:text-lg font-semibold">
          {[
            "Home",
            "Merge PDF's",
            "Resize Image Pixel",
            "Passport Size Photo",
            "Increase Image Size In KB",
            "Remove Image Background",
            "Convert DPI (200,300,600)",
            "PDF To Images",
            "Convert Image",
            "Compress Image",
            "Compress PDF",
            "Crop Image",
          ].map((item, idx) => (
            <a
              key={idx}
              href="#"
              onClick={() => {
                toggleMenu();
                // Removed navigation to non-existent routes
              }}
              className="hover:text-purple-300"
            >
              | {item}
            </a>
          ))}
        </nav>
      </div>

      {/* ========= ROUTES ========= */}
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* OAuth Success */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />

        {/* Home */}
        <Route
          path="/"
          element={
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
                <div className="max-w-full sm:max-w-md mx-auto flex items-center gap-2 border border-purple-300/60 dark:border-purple-500/50 rounded-full px-2 sm:px-4 py-1 sm:py-1.5">
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-purple-400 dark:placeholder-purple-300 text-xs sm:text-base"
                  />
                </div>
              </section>

              <ImageTools searchQuery={searchQuery} />
              <ChutkiAssistant />
              <Footer />
            </>
          }
        />

        {/* Passport Photo Maker */}
        <Route path="/passport-photo" element={<PassportPhotoMaker />} />

        {/* Removed routes for missing components */}

        {/* Image conversion tools */}
        <Route path="/tools" element={<ImageConversionTools />} />

        {/* Dynamic tool routes */}
        <Route path="/tools/:toolName" element={<GenericToolPage />} />

        {/* Legacy specific routes (can be removed later) */}
        <Route
          path="/tools/heic-to-jpg"
          element={<ToolPage title="HEIC to JPG" apiEndpoint="/api/convert/heic-to-jpg" />}
        />
        <Route
          path="/tools/webp-to-jpg"
          element={<ToolPage title="WEBP to JPG" apiEndpoint="/api/convert/webp-to-jpg" />}
        />
        <Route
          path="/tools/jpeg-to-png"
          element={<ToolPage title="JPEG to PNG" apiEndpoint="/api/convert/jpeg-to-png" />}
        />
        <Route
          path="/tools/png-to-jpeg"
          element={<ToolPage title="PNG to JPEG" apiEndpoint="/api/convert/png-to-jpeg" />}
        />
      </Routes>
    </div>
  );
}

export default App;
