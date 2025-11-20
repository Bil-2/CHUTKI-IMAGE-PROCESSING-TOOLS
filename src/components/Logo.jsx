import React from 'react';

const Logo = ({ className = "w-full h-full" }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="chutki-gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
          <stop offset="50%" stopColor="#764ba2" stopOpacity="1" />
          <stop offset="100%" stopColor="#f093fb" stopOpacity="1" />
        </linearGradient>
        
        <linearGradient id="chutki-gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f093fb" stopOpacity="1" />
          <stop offset="50%" stopColor="#f5576c" stopOpacity="1" />
          <stop offset="100%" stopColor="#667eea" stopOpacity="1" />
        </linearGradient>
        
        <filter id="chutki-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <circle cx="100" cy="100" r="95" fill="url(#chutki-gradient1)" opacity="0.1"/>
      
      <rect x="45" y="55" width="80" height="80" rx="12" 
            stroke="url(#chutki-gradient1)" strokeWidth="6" fill="none" opacity="0.4"/>
      
      <rect x="75" y="65" width="80" height="80" rx="12" 
            stroke="url(#chutki-gradient2)" strokeWidth="6" fill="none" filter="url(#chutki-glow)"/>
      
      <path d="M 155 60 L 158 67 L 165 70 L 158 73 L 155 80 L 152 73 L 145 70 L 152 67 Z" 
            fill="url(#chutki-gradient1)" opacity="0.9"/>
      
      <path d="M 50 135 L 53 142 L 60 145 L 53 148 L 50 155 L 47 148 L 40 145 L 47 142 Z" 
            fill="url(#chutki-gradient2)" opacity="0.9"/>
      
      <path d="M 100 85 L 102 90 L 107 92 L 102 94 L 100 99 L 98 94 L 93 92 L 98 90 Z" 
            fill="#ffffff" opacity="0.8"/>
      
      <path d="M 85 115 L 95 100 L 105 110 L 115 95 L 125 110 L 125 125 L 85 125 Z" 
            fill="url(#chutki-gradient1)" opacity="0.5"/>
      
      <circle cx="145" cy="85" r="8" fill="url(#chutki-gradient2)" opacity="0.6"/>
    </svg>
  );
};

export default Logo;