import React, { useEffect, useRef, useMemo } from 'react';

/**
 * ScrollEffect Component
 * 
 * A high-performance reusable component that adds scroll animations to its children.
 * Supports multiple animation types with customizable timing and respects accessibility preferences.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be animated
 * @param {string} props.animation - Animation type: 'fade-up', 'fade-down', 'fade-left', 'fade-right', 
 *                                   'zoom-in', 'zoom-out', 'bounce', 'flip', 'rotate', 'slide-scale'
 * @param {number} props.delay - Delay before animation starts (in ms)
 * @param {number} props.duration - Animation duration (in ms)
 * @param {number} props.threshold - Visibility threshold (0-1) for triggering animation
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.easing - Animation easing function (CSS timing function)
 * @param {boolean} props.once - Whether to trigger animation only once
 * @param {boolean} props.respectMotion - Respect prefers-reduced-motion preference (default: true)
 */

// Animation configuration constants (Optimized for faster loading)
const ANIMATION_PRESETS = {
  'fade-up': {
    initial: { transform: 'translateY(20px)', opacity: 0 },
    animate: { transform: 'translateY(0)', opacity: 1 },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  },
  'fade-down': {
    initial: { transform: 'translateY(-20px)', opacity: 0 },
    animate: { transform: 'translateY(0)', opacity: 1 },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  },
  'fade-left': {
    initial: { transform: 'translateX(20px)', opacity: 0 },
    animate: { transform: 'translateX(0)', opacity: 1 },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  },
  'fade-right': {
    initial: { transform: 'translateX(-20px)', opacity: 0 },
    animate: { transform: 'translateX(0)', opacity: 1 },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  },
  'zoom-in': {
    initial: { transform: 'scale(0.95)', opacity: 0 },
    animate: { transform: 'scale(1)', opacity: 1 },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  },
  'zoom-out': {
    initial: { transform: 'scale(1.05)', opacity: 0 },
    animate: { transform: 'scale(1)', opacity: 1 },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  },
  'bounce': {
    initial: { transform: 'translateY(15px)', opacity: 0 },
    animate: { transform: 'translateY(0)', opacity: 1 },
    easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  'flip': {
    initial: { transform: 'rotateX(-45deg)', opacity: 0, transformOrigin: 'top center' },
    animate: { transform: 'rotateX(0deg)', opacity: 1, transformOrigin: 'top center' },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  },
  'rotate': {
    initial: { transform: 'rotate(-90deg) scale(0.9)', opacity: 0 },
    animate: { transform: 'rotate(0deg) scale(1)', opacity: 1 },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  },
  'slide-scale': {
    initial: { transform: 'translateY(25px) scale(0.95)', opacity: 0 },
    animate: { transform: 'translateY(0) scale(1)', opacity: 1 },
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)'
  }
};

/**
 * Helper function to check if user prefers reduced motion
 */
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Helper function to apply styles to an element
 */
const applyStyles = (element, styles, transitionDuration, easing) => {
  if (!element) return;
  
  Object.keys(styles).forEach(key => {
    element.style[key] = styles[key];
  });
  
  if (transitionDuration !== undefined) {
    element.style.transition = `opacity ${transitionDuration}ms ${easing}, transform ${transitionDuration}ms ${easing}`;
  }
};

/**
 * Helper function to get animation preset or default
 */
const getAnimationPreset = (animation) => {
  return ANIMATION_PRESETS[animation] || ANIMATION_PRESETS['fade-up'];
};

const ScrollEffect = ({ 
  children, 
  animation = 'fade-up', 
  delay = 0, 
  duration = 400, 
  threshold = 0.05,
  className = '',
  easing = null,
  once = true,
  respectMotion = true
}) => {
  const elementRef = useRef(null);
  
  // Memoize animation configuration
  const animationConfig = useMemo(() => {
    const preset = getAnimationPreset(animation);
    return {
      ...preset,
      easing: easing || preset.easing
    };
  }, [animation, easing]);

  // Check for reduced motion preference
  const shouldReduceMotion = useMemo(() => {
    return respectMotion && prefersReducedMotion();
  }, [respectMotion]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // If reduced motion is preferred, skip animation
    if (shouldReduceMotion) {
      element.style.opacity = '1';
      element.style.transform = animationConfig.animate.transform;
      return;
    }

    // Set base styles
    element.style.willChange = 'opacity, transform';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';

    // Apply initial styles with transition
    applyStyles(
      element, 
      animationConfig.initial,
      duration,
      animationConfig.easing
    );

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Schedule animation with delay
            const timeoutId = setTimeout(() => {
              applyStyles(
                element,
                animationConfig.animate,
                duration,
                animationConfig.easing
              );
            }, delay);

            // Store timeout ID for cleanup
            element._scrollEffectTimeout = timeoutId;

            // Unobserve after animation if once is true
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once && !shouldReduceMotion) {
            // Reset animation if element leaves viewport and once is false
            applyStyles(
              element,
              animationConfig.initial,
              duration,
              animationConfig.easing
            );
          }
        });
      },
      { threshold, rootMargin: '10px' }
    );

    // Start observing
    observer.observe(element);

    // Cleanup
    return () => {
      // Clear any pending timeouts
      if (element._scrollEffectTimeout) {
        clearTimeout(element._scrollEffectTimeout);
      }
      
      // Unobserve
      if (element) {
        observer.unobserve(element);
      }
      
      // Clean up styles
      element.style.willChange = 'auto';
    };
  }, [animationConfig, delay, duration, threshold, once, shouldReduceMotion]);

  return (
    <div 
      ref={elementRef} 
      className={className}
      aria-label={`Scroll animation: ${animation}`}
    >
      {children}
    </div>
  );
};

export default ScrollEffect;