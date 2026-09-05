'use client'

import { useState } from 'react'

export default function BrandLogo() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative w-10 h-10 cursor-pointer transition-transform duration-300 hover:scale-110"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main SVG Logo Orb - Premium Monochrome */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Greyscale radial gradient for orb */}
          <radialGradient id="monoOrbGradient" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#d1d5db" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#4b5563" stopOpacity="0.05" />
          </radialGradient>

          {/* Subtle shadow gradient */}
          <radialGradient id="shadowGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
          </radialGradient>

          {/* Soft glow filter */}
          <filter id="monoGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Outer soft glow filter */}
          <filter id="monoSoftGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Animation styles */}
          <style>{`
            @keyframes gentlePulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }

            @keyframes floatStar1 { 
              0%, 100% { transform: translate(0, 0); opacity: 0.6; } 
              50% { transform: translate(2px, -2px); opacity: 0.9; } 
            }
            @keyframes floatStar2 { 
              0%, 100% { transform: translate(0, 0); opacity: 0.5; } 
              50% { transform: translate(-2px, 1.5px); opacity: 0.8; } 
            }
            @keyframes floatStar3 { 
              0%, 100% { transform: translate(0, 0); opacity: 0.4; } 
              50% { transform: translate(1.5px, 2px); opacity: 0.7; } 
            }

            .star1 { animation: floatStar1 3s ease-in-out infinite; }
            .star2 { animation: floatStar2 3.5s ease-in-out infinite; }
            .star3 { animation: floatStar3 4s ease-in-out infinite; }

            .pulse-ring {
              animation: gentlePulse 3s ease-in-out infinite;
            }
          `}</style>
        </defs>

        {/* Outer shadow drop */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="url(#shadowGradient)"
          opacity="0.4"
        />

        {/* Outer soft glow halo (very subtle) */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="#ffffff"
          strokeWidth="0.8"
          opacity="0.1"
          filter="url(#monoSoftGlow)"
        />

        {/* Main glassmorphic orb circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="url(#monoOrbGradient)"
          stroke="#d1d5db"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Inner circle rim (subtle grey) */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="0.8"
          opacity="0.25"
        />

        {/* Pulsing outer ring accent */}
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="0.6"
          opacity="0.2"
          className="pulse-ring"
        />

        {/* Bright center highlight for 3D effect */}
        <circle
          cx="38"
          cy="33"
          r="10"
          fill="#ffffff"
          opacity="0.25"
          filter="url(#monoGlow)"
        />

        {/* V Letter - Main stroke (white) */}
        <polyline
          points="35,30 50,60 65,30"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#monoGlow)"
        />

        {/* V Letter - Outer subtle glow */}
        <polyline
          points="35,30 50,60 65,30"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.12"
          filter="url(#monoGlow)"
        />

        {/* Tiny white stars around the logo */}
        <g className="star1">
          <circle cx="25" cy="28" r="0.9" fill="#ffffff" opacity="0.8" />
        </g>
        <g className="star2">
          <circle cx="75" cy="30" r="0.7" fill="#ffffff" opacity="0.7" />
        </g>
        <g className="star3">
          <circle cx="78" cy="52" r="0.6" fill="#ffffff" opacity="0.6" />
        </g>
        <g className="star1">
          <circle cx="22" cy="55" r="0.8" fill="#ffffff" opacity="0.5" />
        </g>

        {/* Hover effect ring - visible based on state */}
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1"
          opacity={isHovered ? 0.4 : 0.15}
          filter="url(#monoSoftGlow)"
          style={{ 
            animation: isHovered ? 'gentlePulse 1.5s ease-in-out infinite' : 'none',
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      </svg>
    </div>
  )
}
