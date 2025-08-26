import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import ImageTools from "./components/ImageTools";
import ChutkiAssistant from "./components/ChutkiAssistant";
import Footer from "./components/Footer";
import GenericToolPage from "./components/GenericToolPage";
import AuthSuccess from "./components/AuthSuccess";

// Import individual tool components
import PassportPhotoTool from "./components/tools/PassportPhotoTool";
import ResizePixelTool from "./components/tools/ResizePixelTool";
import CompressImageTool from "./components/tools/CompressImageTool";
import RotateImageTool from "./components/tools/RotateImageTool";
import FlipImageTool from "./components/tools/FlipImageTool";
import HeicToJpgTool from "./components/tools/HeicToJpgTool";

// Main App Content Component
function AppContent() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleNavigation = (item) => {
    toggleMenu();

    // Navigation mapping for menu items to tool routes
    const navigationMap = {
      "Home": "/",
      "Merge PDF's": "/tools/image-to-pdf",
      "Resize Image Pixel": "/tools/resize-pixel",
      "Passport Size Photo": "/tools/passport-photo",
      "Increase Image Size In KB": "/tools/increase-size-kb",
      "Remove Image Background": "/tools/remove-background",
      "Convert DPI (200,300,600)": "/tools/convert-dpi",
      "PDF To Images": "/tools/pdf-to-jpg",
      "Convert Image": "/tools/heic-to-jpg",
      "Compress Image": "/tools/compress-50kb",
      "Compress PDF": "/tools/compress-50kb", // Using image compression for now
      "Crop Image": "/tools/circle-crop"
    };

    const route = navigationMap[item];
    if (route) {
      navigate(route);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If not authenticated, show only login/register routes
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen transition-colors duration-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/success" element={<AuthSuccess />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

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
            <button
              key={idx}
              onClick={() => handleNavigation(item)}
              className="hover:text-purple-300 text-left"
            >
              | {item}
            </button>
          ))}
        </nav>
      </div>

      {/* ========= ROUTES ========= */}
      <Routes>
        {/* Home Page */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />

        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Individual Tool Routes */}
        <Route path="/tools/passport-photo" element={
          <ProtectedRoute>
            <PassportPhotoTool />
          </ProtectedRoute>
        } />
        <Route path="/tools/resize-pixel" element={
          <ProtectedRoute>
            <ResizePixelTool />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-50kb" element={
          <ProtectedRoute>
            <CompressImageTool />
          </ProtectedRoute>
        } />
        <Route path="/tools/rotate" element={
          <ProtectedRoute>
            <RotateImageTool />
          </ProtectedRoute>
        } />
        <Route path="/tools/flip" element={
          <ProtectedRoute>
            <FlipImageTool />
          </ProtectedRoute>
        } />
        <Route path="/tools/heic-to-jpg" element={
          <ProtectedRoute>
            <HeicToJpgTool />
          </ProtectedRoute>
        } />

        {/* More individual tool routes */}
        <Route path="/tools/reduce-size-kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/increase-size-kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/remove-background" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/convert-dpi" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/pdf-to-jpg" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/image-to-pdf" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/circle-crop" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/grayscale" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/watermark" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/resize-cm" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/resize-mm" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/resize-inches" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/webp-to-jpg" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/jpeg-to-png" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/png-to-jpeg" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/jpg-to-text" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-5kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-10kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-15kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-20kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-25kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-30kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-40kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-100kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-150kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-200kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-300kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-500kb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-1mb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />
        <Route path="/tools/compress-2mb" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />

        {/* Fallback for any other tool routes */}
        <Route path="/tools/:toolName" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
