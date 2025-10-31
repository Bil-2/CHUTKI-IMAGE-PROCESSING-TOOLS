import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from "./context/AuthContext";
import useSmoothScroll from "./hooks/useSmoothScroll";
import ScrollProgressBar from "./components/shared/ScrollProgressBar";
import ScrollToTop from "./components/shared/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
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
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize dark mode from localStorage or default to false
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout } = useAuth();
  
  // Enable smooth scrolling
  useSmoothScroll();

  // Dark mode toggle with localStorage persistence
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              borderRadius: '20px',
              padding: '20px 24px',
              fontSize: '15px',
              fontWeight: '500',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              minWidth: '300px',
              maxWidth: '400px',
            },
            success: {
              style: {
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#fff',
                borderRadius: '20px',
                padding: '20px 24px',
                fontSize: '15px',
                fontWeight: '500',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3), 0 8px 16px rgba(16, 185, 129, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              },
            },
            error: {
              style: {
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#fff',
                borderRadius: '20px',
                padding: '20px 24px',
                fontSize: '15px',
                fontWeight: '500',
                boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3), 0 8px 16px rgba(239, 68, 68, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)',
              },
            },
          }}
        />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Scroll Progress Bar */}
      <ScrollProgressBar />
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderRadius: '20px',
            padding: '20px 24px',
            fontSize: '15px',
            fontWeight: '500',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            minWidth: '300px',
            maxWidth: '400px',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#fff',
              borderRadius: '20px',
              padding: '20px 24px',
              fontSize: '15px',
              fontWeight: '500',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3), 0 8px 16px rgba(16, 185, 129, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#fff',
              borderRadius: '20px',
              padding: '20px 24px',
              fontSize: '15px',
              fontWeight: '500',
              boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3), 0 8px 16px rgba(239, 68, 68, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)',
            },
          },
        }}
      />

      {/* ========= HEADER ========= */}
      <header className="relative shadow-lg z-50 sticky top-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 animate-gradient-move"></div>

        <div className="relative max-w-7xl mx-auto flex justify-between items-center px-3 sm:px-4 lg:px-6 py-3 sm:py-3 lg:py-4">
          {/* Logo + Name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 backdrop-blur-lg p-1 sm:p-1.5 lg:p-2 rounded-full border border-white/20 animate-logo-glow hover:bg-white/30 transition-all duration-500">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-extrabold bg-gradient-to-r from-blue-200 via-pink-200 to-yellow-200 bg-clip-text text-transparent drop-shadow-sm animate-text-shine">
              Chutki Image Tools
            </h1>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 sm:p-2.5 lg:p-3 bg-white/30 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle Dark Mode"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="group relative rounded-full p-2 sm:p-2.5 lg:p-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/40 hover:to-pink-500/40 backdrop-blur-sm border border-white/20 hover:border-red-300/40 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Logout"
              title="Logout"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>

            {/* Menu Button */}
            <button
              onClick={toggleMenu}
              className="relative flex flex-col justify-center items-center gap-1 sm:gap-1.5 p-2 sm:p-2.5 rounded-md bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 group min-w-[44px] min-h-[44px]"
              title="Menu"
              aria-label="Open Menu"
            >
              <span className="block w-5 sm:w-6 lg:w-7 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6 sm:group-hover:w-7 lg:group-hover:w-8"></span>
              <span className="block w-5 sm:w-6 lg:w-7 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6 sm:group-hover:w-7 lg:group-hover:w-8"></span>
              <span className="block w-5 sm:w-6 lg:w-7 h-0.5 bg-white rounded-full transition-all duration-300 group-hover:w-6 sm:group-hover:w-7 lg:group-hover:w-8"></span>
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
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-white text-xl sm:text-2xl lg:text-3xl hover:text-gray-300 z-10"
          aria-label="Close Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <nav className="mt-12 sm:mt-16 lg:mt-20 flex flex-col items-start px-4 sm:px-6 lg:pl-10 space-y-3 sm:space-y-4 lg:space-y-6 text-white text-sm sm:text-base lg:text-lg font-semibold">
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
              className="hover:text-purple-300 text-left transition-colors duration-200 py-1 px-2 hover:bg-white/10 rounded-md w-full"
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

        {/* Dynamic route for all tools - this will catch any /tools/* path */}
        <Route path="/tools/*" element={
          <ProtectedRoute>
            <GenericToolPage />
          </ProtectedRoute>
        } />

        {/* Image Tools */}
        <Route path="/image-tools" element={
          <ProtectedRoute>
            <ImageTools />
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
        
      {/* Scroll to Top Button */}
      <ScrollToTop />
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
