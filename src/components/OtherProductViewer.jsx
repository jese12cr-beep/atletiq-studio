import React from 'react';

export default function OtherProductViewer({ productType, design, view = 'front' }) {
  const {
    baseColor = '#1e293b',
    detailColor = '#facc15',
    textColor = '#ffffff',
    textOutlineColor = '#0f172a',
    playerName = 'TEAM',
    playerNumber = '07',
    badgeImage = null,
    badgeSvg = null
  } = design;

  if (productType === 'cap') {
    return (
      <div className="relative flex items-center justify-center p-4">
        <svg viewBox="0 0 400 350" className="w-full max-h-[420px] drop-shadow-2xl">
          <defs>
            <linearGradient id="cap-shade" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {/* Shadow */}
          <ellipse cx="200" cy="300" rx="140" ry="14" fill="#000000" opacity="0.4" filter="blur(6px)" />
          
          {/* Crown (Body of cap) */}
          <path
            d="M 100 240 C 100 120, 300 120, 300 240 Z"
            fill={baseColor}
            stroke="#0a0a0a"
            strokeWidth="2"
          />
          {/* Crown Panels / Seams */}
          <path d="M 200 130 L 200 240" stroke="#000000" strokeWidth="1.5" opacity="0.4" />
          <path d="M 200 130 Q 150 170 115 235" stroke="#000000" strokeWidth="1.5" opacity="0.4" />
          <path d="M 200 130 Q 250 170 285 235" stroke="#000000" strokeWidth="1.5" opacity="0.4" />

          {/* Crown Top Button */}
          <circle cx="200" cy="130" r="10" fill={detailColor} stroke="#000000" strokeWidth="1.5" />

          {/* Visor / Brim */}
          <path
            d="M 80 235 C 100 215, 300 215, 320 235 C 330 265, 290 285, 200 285 C 110 285, 70 265, 80 235 Z"
            fill={detailColor}
            stroke="#0a0a0a"
            strokeWidth="2"
          />
          {/* Visor Stitching lines */}
          <path d="M 105 242 Q 200 260 295 242" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <path d="M 120 252 Q 200 270 280 252" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

          {/* Cap Lighting overlay */}
          <path d="M 100 240 C 100 120, 300 120, 300 240 Z" fill="url(#cap-shade)" pointerEvents="none" />

          {/* Custom Embroidery Logo or Number */}
          <g transform="translate(200, 195)">
            {badgeImage ? (
              <image href={badgeImage} x="-30" y="-30" width="60" height="60" preserveAspectRatio="xMidYMid meet" />
            ) : (
              <text
                x="0"
                y="10"
                textAnchor="middle"
                fill={textColor}
                stroke={textOutlineColor}
                strokeWidth="2"
                fontSize="38"
                fontWeight="900"
                fontFamily="'Bebas Neue', sans-serif"
                letterSpacing="2"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
              >
                {playerName.substring(0, 4).toUpperCase()}
              </text>
            )}
          </g>
        </svg>
      </div>
    );
  }

  if (productType === 'bottle') {
    return (
      <div className="relative flex items-center justify-center p-4">
        <svg viewBox="0 0 300 500" className="w-full max-h-[460px] drop-shadow-2xl">
          <defs>
            <linearGradient id="metal-gloss" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
              <stop offset="25%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="75%" stopColor="#000000" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="150" cy="460" rx="65" ry="12" fill="#000000" opacity="0.5" filter="blur(6px)" />

          {/* Cap & Loop */}
          <path d="M 125 70 C 125 50, 175 50, 175 70 L 175 95 L 125 95 Z" fill="#0f172a" stroke="#334155" strokeWidth="2" />
          <path d="M 135 50 C 135 30, 165 30, 165 50" fill="none" stroke={detailColor} strokeWidth="6" strokeLinecap="round" />

          {/* Neck */}
          <rect x="120" y="95" width="60" height="25" fill="#334155" rx="3" />

          {/* Bottle Main Cylinder */}
          <rect x="95" y="120" width="110" height="320" rx="20" fill={baseColor} stroke="#0f172a" strokeWidth="2" />

          {/* Metallic Sheen Overlay */}
          <rect x="95" y="120" width="110" height="320" rx="20" fill="url(#metal-gloss)" pointerEvents="none" />

          {/* Accent Rubber Grip Band */}
          <rect x="95" y="210" width="110" height="30" fill={detailColor} opacity="0.9" />

          {/* Laser Etched Customization */}
          <g transform="translate(150, 310)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill={textColor}
              fontSize="28"
              fontWeight="900"
              fontFamily="'Chakra Petch', sans-serif"
              letterSpacing="2"
            >
              {playerName.toUpperCase()}
            </text>
            <text
              x="0"
              y="55"
              textAnchor="middle"
              fill={textColor}
              stroke={detailColor}
              strokeWidth="1.5"
              fontSize="52"
              fontWeight="900"
              fontFamily="'Bebas Neue', sans-serif"
            >
              #{playerNumber}
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (productType === 'shinguards') {
    return (
      <div className="relative flex items-center justify-center p-4">
        <svg viewBox="0 0 350 450" className="w-full max-h-[440px] drop-shadow-2xl">
          <defs>
            <linearGradient id="carbon-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="40%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </linearGradient>
            <pattern id="carbon-fiber" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="3" height="3" fill="#1e293b" />
              <rect x="3" width="3" height="3" fill="#0f172a" />
              <rect y="3" width="3" height="3" fill="#0f172a" />
              <rect x="3" y="3" width="3" height="3" fill="#1e293b" />
            </pattern>
          </defs>

          {/* Shadow */}
          <ellipse cx="175" cy="420" rx="90" ry="14" fill="#000000" opacity="0.45" filter="blur(6px)" />

          {/* Guard Shell */}
          <path
            d="M 110 50 C 140 40, 210 40, 240 50 C 265 140, 240 330, 195 400 C 175 410, 175 410, 155 400 C 110 330, 85 140, 110 50 Z"
            fill={baseColor}
            stroke="#0f172a"
            strokeWidth="3"
          />
          {/* Carbon Texture Overlay */}
          <path
            d="M 110 50 C 140 40, 210 40, 240 50 C 265 140, 240 330, 195 400 C 175 410, 175 410, 155 400 C 110 330, 85 140, 110 50 Z"
            fill="url(#carbon-fiber)"
            opacity="0.35"
          />

          {/* Guard Border Trim */}
          <path
            d="M 110 50 C 140 40, 210 40, 240 50 C 265 140, 240 330, 195 400 C 175 410, 175 410, 155 400 C 110 330, 85 140, 110 50 Z"
            fill="none"
            stroke={detailColor}
            strokeWidth="3.5"
          />

          {/* Gloss Light */}
          <path
            d="M 110 50 C 140 40, 210 40, 240 50 C 265 140, 240 330, 195 400 C 175 410, 175 410, 155 400 C 110 330, 85 140, 110 50 Z"
            fill="url(#carbon-gloss)"
            pointerEvents="none"
          />

          {/* Shield Badge or Player Details */}
          <g transform="translate(175, 170)">
            {badgeImage ? (
              <image href={badgeImage} x="-40" y="-40" width="80" height="80" preserveAspectRatio="xMidYMid meet" />
            ) : (
              <circle cx="0" cy="0" r="38" fill={detailColor} opacity="0.9" />
            )}
          </g>

          <g transform="translate(175, 270)">
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill={textColor}
              stroke={textOutlineColor}
              strokeWidth="2"
              fontSize="28"
              fontWeight="900"
              fontFamily="'Bebas Neue', sans-serif"
              letterSpacing="2"
            >
              {playerName.toUpperCase()}
            </text>
            <text
              x="0"
              y="60"
              textAnchor="middle"
              fill={textColor}
              stroke={textOutlineColor}
              strokeWidth="4"
              fontSize="68"
              fontWeight="900"
              fontFamily="'Bebas Neue', sans-serif"
            >
              {playerNumber}
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // Fallback default
  return null;
}
