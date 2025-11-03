import React from 'react';

const Logo = ({ className = "w-full h-full", alt = "CHUTKI Logo" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={alt}
      style={{ display: 'block' }}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#667eea", stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:"#764ba2", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#f093fb", stopOpacity:1}} />
        </linearGradient>
        
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#f093fb", stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:"#f5576c", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#667eea", stopOpacity:1}} />
        </linearGradient>
        
        {/* Glow Effect */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background Circle */}
      <circle cx="100" cy="100" r="95" fill="url(#gradient1)" opacity="0.1"/>
      
      {/* Main Logo Symbol: Image Transformation Icon */}
      {/* Back Frame (Before) */}
      <rect x="45" y="55" width="80" height="80" rx="12" 
            stroke="url(#gradient1)" strokeWidth="6" fill="none" opacity="0.4"/>
      
      {/* Front Frame (After) */}
      <rect x="75" y="65" width="80" height="80" rx="12" 
            stroke="url(#gradient2)" strokeWidth="6" fill="none" filter="url(#glow)"/>
      
      {/* Sparkle/Magic Elements */}
      {/* Top Right Sparkle */}
      <path d="M 155 60 L 158 67 L 165 70 L 158 73 L 155 80 L 152 73 L 145 70 L 152 67 Z" 
            fill="url(#gradient1)" opacity="0.9"/>
      
      {/* Bottom Left Sparkle */}
      <path d="M 50 135 L 53 142 L 60 145 L 53 148 L 50 155 L 47 148 L 40 145 L 47 142 Z" 
            fill="url(#gradient2)" opacity="0.9"/>
      
      {/* Center Mini Sparkle */}
      <path d="M 100 85 L 102 90 L 107 92 L 102 94 L 100 99 L 98 94 L 93 92 L 98 90 Z" 
            fill="#ffffff" opacity="0.8"/>
      
      {/* Abstract Image Icon Inside Frame */}
      {/* Mountain/Landscape Symbol */}
      <path d="M 85 115 L 95 100 L 105 110 L 115 95 L 125 110 L 125 125 L 85 125 Z" 
            fill="url(#gradient1)" opacity="0.5"/>
      
      {/* Sun/Circle */}
      <circle cx="145" cy="85" r="8" fill="url(#gradient2)" opacity="0.6"/>
    </svg>
  );
};

export default Logo;