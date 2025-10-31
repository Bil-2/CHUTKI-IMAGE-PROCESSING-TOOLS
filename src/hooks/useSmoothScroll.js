import { useEffect } from 'react';

/**
 * Custom hook for enhanced smooth scrolling and scroll effects
 * 
 * Features:
 * - Smooth scroll behavior
 * - Parallax effects on scroll
 * - Scroll-to-top on route change
 * - Performance optimized with requestAnimationFrame
 */
const useSmoothScroll = () => {
  useEffect(() => {
    // Enable smooth scrolling globally
    document.documentElement.style.scrollBehavior = 'smooth';

    // Parallax effect for specific elements
    let ticking = false;
    
    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-section');
      
      parallaxElements.forEach((element) => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
      
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Scroll to top on mount (for route changes)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);
};

export default useSmoothScroll;
