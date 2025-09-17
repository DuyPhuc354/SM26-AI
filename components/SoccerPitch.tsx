import React from 'react';

export const SoccerPitch: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-green-800 border-4 border-gray-400/50 rounded-md overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 680 1050"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="680" height="1050" fill="transparent" />

        {/* --- Field Markings --- */}
        <g stroke="#FFF" strokeWidth="5" strokeOpacity="0.6">
          {/* Center Line */}
          <line x1="0" y1="525" x2="680" y2="525" />
          {/* Center Circle */}
          <circle cx="340" cy="525" r="91.5" fill="none" />
          {/* Center Spot */}
          <circle cx="340" cy="525" r="5" fill="#FFF" stroke="none" />

          {/* Top Penalty Area */}
          <rect x="138.5" y="0" width="403" height="165" fill="none" />
          {/* Top Goal Area */}
          <rect x="248.5" y="0" width="183" height="55" fill="none" />
          {/* Top Penalty Spot */}
          <circle cx="340" cy="110" r="5" fill="#FFF" stroke="none" />
          {/* Top Arc */}
          <path d="M 248.5 165 A 91.5 91.5 0 0 1 431.5 165" fill="none" />

          {/* Bottom Penalty Area */}
          <rect x="138.5" y="885" width="403" height="165" fill="none" />
          {/* Bottom Goal Area */}
          <rect x="248.5" y="995" width="183" height="55" fill="none" />
          {/* Bottom Penalty Spot */}
          <circle cx="340" cy="940" r="5" fill="#FFF" stroke="none" />
          {/* Bottom Arc */}
          <path d="M 248.5 885 A 91.5 91.5 0 0 0 431.5 885" fill="none" />
        </g>
      </svg>
    </div>
  );
};