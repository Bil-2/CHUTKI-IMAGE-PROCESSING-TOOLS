import React, { useState, useEffect } from 'react';

/**
 * ScrollProgressBar Component
 * Displays a progress bar at the top of the page showing scroll progress
 */
const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;

      setScrollProgress(scrolled);
    };

    // Update on scroll
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // Initial update
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-[9999]">
      <div
        className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      >
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-r from-transparent to-white opacity-30 animate-pulse" />
      </div>
    </div>
  );
};

export default ScrollProgressBar;
