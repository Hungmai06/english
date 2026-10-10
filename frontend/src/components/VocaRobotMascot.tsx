'use client';

import React from 'react';

interface VocaRobotMascotProps {
  className?: string;
  size?: number;
  expression?: 'happy' | 'wink';
}

export const VocaRobotMascot: React.FC<VocaRobotMascotProps> = ({
  className = '',
  size = 100,
  expression = 'happy',
}) => {
  return (
    <div
      className={`relative inline-block select-none ${className}`}
      style={{ width: size, height: size * 1.05 }}
    >
      <svg
        viewBox="0 0 120 126"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-md"
      >
        {/* Soft Ground Shadow */}
        <ellipse cx="60" cy="120" rx="30" ry="5" fill="#0F172A" opacity="0.18" />

        {/* Floating Animation */}
        <g className="animate-bounce" style={{ animationDuration: '2.8s' }}>
          
          {/* Cyber Antennas / Horns */}
          {/* Left Antenna */}
          <path
            d="M24 40 L12 18 C11 16 14 13 17 15 L34 32 Z"
            fill="url(#blueGradBody)"
            stroke="#0052CC"
            strokeWidth="1.5"
          />
          <path d="M22 30 L16 19" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />

          {/* Right Antenna */}
          <path
            d="M96 40 L108 18 C109 16 106 13 103 15 L86 32 Z"
            fill="url(#blueGradBody)"
            stroke="#0052CC"
            strokeWidth="1.5"
          />
          <path d="M98 30 L104 19" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />

          {/* Arms */}
          {/* Left Arm resting */}
          <path
            d="M36 84 C28 88 26 96 32 102 C36 106 42 98 40 90 Z"
            fill="url(#blueGradBody)"
            stroke="#0052CC"
            strokeWidth="1.5"
          />
          {/* Right Arm waving */}
          <path
            d="M84 84 C94 82 102 75 99 68 C96 62 88 72 82 82 Z"
            fill="url(#blueGradBody)"
            stroke="#0052CC"
            strokeWidth="1.5"
          />

          {/* Robot Body */}
          <path
            d="M38 82 C38 78 47 74 60 74 C73 74 82 78 82 82 L78 104 C78 109 70 112 60 112 C50 112 42 109 42 104 Z"
            fill="url(#blueGradBody)"
            stroke="#0047BA"
            strokeWidth="2"
          />

          {/* Chest Glowing Core (Cyan Power Light with pulse) */}
          <circle cx="60" cy="94" r="8" fill="#00E5FF" opacity="0.3" className="animate-ping" style={{ animationDuration: '2s' }} />
          <circle cx="60" cy="94" r="6" fill="#00E5FF" />
          <circle cx="60" cy="94" r="3" fill="#FFFFFF" />

          {/* Robot Head Main Helmet Shell */}
          <rect
            x="24"
            y="24"
            width="72"
            height="58"
            rx="24"
            fill="url(#blueGradHead)"
            stroke="#0047BA"
            strokeWidth="2.5"
          />

          {/* Head Top Curved Highlight */}
          <path
            d="M36 28 C48 26 72 26 84 28"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Visor Display Screen (Dark Charcoal Glass) */}
          <rect
            x="32"
            y="33"
            width="56"
            height="40"
            rx="16"
            fill="#0B132B"
            stroke="#1E293B"
            strokeWidth="1.5"
          />

          {/* Visor Top Glass Sheen */}
          <path
            d="M38 38 L68 38 C64 45 44 45 38 38 Z"
            fill="#FFFFFF"
            opacity="0.12"
          />

          {/* Visor LED Face Expression */}
          {expression === 'happy' && (
            <g>
              {/* Left Eye LED (Chevron >) */}
              <path
                d="M44 47 L50 53 L44 59"
                stroke="#00F0FF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Right Eye LED (Chevron <) */}
              <path
                d="M76 47 L70 53 L76 59"
                stroke="#00F0FF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Cute Curved Smile (◡) */}
              <path
                d="M55 58 C57 62 63 62 65 58"
                stroke="#00F0FF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Pink Cheek Blush Dots */}
              <circle cx="41" cy="62" r="2.5" fill="#FF4D6D" opacity="0.9" />
              <circle cx="79" cy="62" r="2.5" fill="#FF4D6D" opacity="0.9" />
            </g>
          )}

          {expression === 'wink' && (
            <g>
              {/* Left Eye Wink Line */}
              <line x1="43" y1="53" x2="51" y2="53" stroke="#00F0FF" strokeWidth="3" strokeLinecap="round" />
              {/* Right Eye Open */}
              <circle cx="73" cy="53" r="4" fill="#00F0FF" />
              {/* Smile */}
              <path
                d="M55 58 C57 62 63 62 65 58"
                stroke="#00F0FF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="41" cy="62" r="2.5" fill="#FF4D6D" opacity="0.9" />
              <circle cx="79" cy="62" r="2.5" fill="#FF4D6D" opacity="0.9" />
            </g>
          )}

        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="blueGradHead" x1="24" y1="24" x2="96" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E60E8" />
            <stop offset="0.65" stopColor="#0B48C4" />
            <stop offset="1" stopColor="#063294" />
          </linearGradient>
          <linearGradient id="blueGradBody" x1="38" y1="74" x2="82" y2="112" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1251D4" />
            <stop offset="1" stopColor="#062E8A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
