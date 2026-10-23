import React from 'react';

export default function JerseyViewer({
  design,
  view = 'front', // 'front' | 'back'
  className = '',
  isRealisticLighting = true,
  scale = 1
}) {
  const {
    baseColor = '#1d4ed8',
    sleeveColor = '#0f172a',
    collarColor = '#ffffff',
    detailColor = '#facc15',
    pattern = 'solid',
    fontStyle = 'font-bebas',
    textColor = '#ffffff',
    textOutlineColor = '#0f172a',
    playerName = 'RODRÍGUEZ',
    playerNumber = '10',
    sponsorText = 'FLY FLY EMIRATES',
    hasSponsor = true,
    badgeSvg = null,
    badgeImage = null,
    collarType = 'v-neck', // 'v-neck' | 'round'
    fit = 'modern'
  } = design;

  // Render pattern inside SVG defs
  const renderPatternDefs = () => {
    switch (pattern) {
      case 'stripes-vertical':
        return (
          <pattern id="pattern-stripes-v" width="40" height="100" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="20" height="100" fill={baseColor} />
            <rect x="20" y="0" width="20" height="100" fill={detailColor} opacity="0.9" />
          </pattern>
        );
      case 'stripes-horizontal':
        return (
          <linearGradient id="pattern-hoop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="35%" stopColor={baseColor} />
            <stop offset="35.1%" stopColor={detailColor} />
            <stop offset="55%" stopColor={detailColor} />
            <stop offset="55.1%" stopColor={baseColor} />
            <stop offset="100%" stopColor={baseColor} />
          </linearGradient>
        );
      case 'geometric-fade':
        return (
          <linearGradient id="pattern-cyber-fade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="50%" stopColor={detailColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={sleeveColor} />
          </linearGradient>
        );
      case 'diagonal-speed':
        return (
          <pattern id="pattern-diagonal" width="30" height="30" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="30" stroke={detailColor} strokeWidth="6" opacity="0.75" />
          </pattern>
        );
      case 'honeycomb':
        return (
          <pattern id="pattern-hex" width="24" height="40" patternUnits="userSpaceOnUse">
            <path d="M12 0 L24 7 L24 21 L12 28 L0 21 L0 7 Z M12 28 L24 35 L24 49 L12 56 L0 49 L0 35 Z" fill="none" stroke={detailColor} strokeWidth="1.2" opacity="0.4" />
          </pattern>
        );
      case 'sash':
        return (
          <linearGradient id="pattern-sash" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={baseColor} />
            <stop offset="38%" stopColor={baseColor} />
            <stop offset="38.5%" stopColor={detailColor} />
            <stop offset="52%" stopColor={detailColor} />
            <stop offset="52.5%" stopColor={baseColor} />
            <stop offset="100%" stopColor={baseColor} />
          </linearGradient>
        );
      default:
        return null;
    }
  };

  const getBodyFill = () => {
    if (pattern === 'stripes-vertical') return 'url(#pattern-stripes-v)';
    if (pattern === 'stripes-horizontal') return 'url(#pattern-hoop)';
    if (pattern === 'geometric-fade') return 'url(#pattern-cyber-fade)';
    if (pattern === 'sash') return 'url(#pattern-sash)';
    return baseColor;
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 500 550"
        className="w-full h-auto max-h-[500px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
        style={{ transform: `scale(${scale})`, transition: 'all 0.3s ease' }}
      >
        <defs>
          {renderPatternDefs()}

          {/* Shading filter for realistic jersey fabric */}
          <linearGradient id="jersey-shadow-l" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="20%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="85%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>

          <linearGradient id="sleeve-shadow-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="sleeve-shadow-right" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </linearGradient>

          {/* Fabric texture subtle overlay */}
          <pattern id="fabric-mesh" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.65" fill="#000000" opacity="0.12" />
          </pattern>
        </defs>

        {/* ================= BACKGROUND SHADOW ================= */}
        <ellipse cx="250" cy="510" rx="170" ry="16" fill="#000000" opacity="0.45" filter="blur(8px)" />

        {/* ================= LEFT SLEEVE ================= */}
        <g id="left-sleeve">
          <path
            d="M 175 90 L 60 170 C 50 185, 45 200, 52 215 L 105 245 C 115 240, 125 220, 132 205 L 160 190 Z"
            fill={sleeveColor}
            stroke="#0a0a0a"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Sleeve cuff detail */}
          <path
            d="M 52 215 L 105 245 L 115 233 L 62 203 Z"
            fill={detailColor}
            opacity="0.95"
          />
          {/* Sleeve lighting */}
          {isRealisticLighting && (
            <path
              d="M 175 90 L 60 170 C 50 185, 45 200, 52 215 L 105 245 C 115 240, 125 220, 132 205 L 160 190 Z"
              fill="url(#sleeve-shadow-left)"
              pointerEvents="none"
            />
          )}
        </g>

        {/* ================= RIGHT SLEEVE ================= */}
        <g id="right-sleeve">
          <path
            d="M 325 90 L 440 170 C 450 185, 455 200, 448 215 L 395 245 C 385 240, 375 220, 368 205 L 340 190 Z"
            fill={sleeveColor}
            stroke="#0a0a0a"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Right sleeve cuff detail */}
          <path
            d="M 448 215 L 395 245 L 385 233 L 438 203 Z"
            fill={detailColor}
            opacity="0.95"
          />
          {/* Sleeve lighting */}
          {isRealisticLighting && (
            <path
              d="M 325 90 L 440 170 C 450 185, 455 200, 448 215 L 395 245 C 385 240, 375 220, 368 205 L 340 190 Z"
              fill="url(#sleeve-shadow-right)"
              pointerEvents="none"
            />
          )}
        </g>

        {/* ================= MAIN TORSO BODY ================= */}
        <g id="torso">
          {/* Torso contour */}
          <path
            d="M 175 90 L 140 190 L 150 470 C 150 475, 200 485, 250 485 C 300 485, 350 475, 350 470 L 360 190 L 325 90 Z"
            fill={getBodyFill()}
            stroke="#0a0a0a"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Secondary pattern overlay for diagonal or honeycomb */}
          {(pattern === 'diagonal-speed' || pattern === 'honeycomb') && (
            <path
              d="M 175 90 L 140 190 L 150 470 C 150 475, 200 485, 250 485 C 300 485, 350 475, 350 470 L 360 190 L 325 90 Z"
              fill={pattern === 'diagonal-speed' ? 'url(#pattern-diagonal)' : 'url(#pattern-hex)'}
              pointerEvents="none"
            />
          )}

          {/* Side breathable ventilation panels */}
          <path
            d="M 140 190 L 150 470 L 165 470 L 155 195 Z"
            fill={sleeveColor}
            opacity="0.9"
          />
          <path
            d="M 360 190 L 350 470 L 335 470 L 345 195 Z"
            fill={sleeveColor}
            opacity="0.9"
          />

          {/* Bottom Hem Trim */}
          <path
            d="M 150 460 C 200 472, 300 472, 350 460 L 350 470 C 300 485, 200 485, 150 470 Z"
            fill={detailColor}
            opacity="0.9"
          />

          {/* Fabric mesh texture overlay */}
          <path
            d="M 175 90 L 140 190 L 150 470 C 150 475, 200 485, 250 485 C 300 485, 350 475, 350 470 L 360 190 L 325 90 Z"
            fill="url(#fabric-mesh)"
            pointerEvents="none"
          />

          {/* Torso Realism Shader / Folds & Highlights */}
          {isRealisticLighting && (
            <path
              d="M 175 90 L 140 190 L 150 470 C 150 475, 200 485, 250 485 C 300 485, 350 475, 350 470 L 360 190 L 325 90 Z"
              fill="url(#jersey-shadow-l)"
              pointerEvents="none"
              style={{ mixBlendMode: 'multiply' }}
            />
          )}
        </g>

        {/* ================= COLLAR ================= */}
        <g id="collar">
          {view === 'front' ? (
            collarType === 'v-neck' ? (
              // Front V-Neck
              <>
                <path
                  d="M 195 85 Q 250 95 305 85 L 295 105 Q 250 115 205 105 Z"
                  fill="#111827"
                  opacity="0.7"
                />
                <path
                  d="M 195 85 L 250 160 L 305 85 L 285 85 L 250 135 L 215 85 Z"
                  fill={collarColor}
                  stroke="#0a0a0a"
                  strokeWidth="1.2"
                />
                <polygon points="250,135 240,150 260,150" fill={detailColor} />
              </>
            ) : (
              // Front Round Neck
              <>
                <path
                  d="M 195 85 Q 250 100 305 85 Q 250 150 195 85 Z"
                  fill="#111827"
                  opacity="0.8"
                />
                <path
                  d="M 195 85 Q 250 145 305 85 L 290 85 Q 250 128 210 85 Z"
                  fill={collarColor}
                  stroke="#0a0a0a"
                  strokeWidth="1.2"
                />
              </>
            )
          ) : (
            // Back Collar
            <path
              d="M 195 85 Q 250 100 305 85 L 300 95 Q 250 108 200 95 Z"
              fill={collarColor}
              stroke="#0a0a0a"
              strokeWidth="1.2"
            />
          )}
        </g>

        {/* ================= DYNAMIC GRAPHICS (FRONT OR BACK) ================= */}
        {view === 'front' ? (
          <g id="front-graphics">
            {/* Front Chest Brand / Manufacturer Logo (Left chest / Right chest) */}
            <g transform="translate(300, 160) scale(0.35)">
              <path d="M 0 20 Q 30 5 60 0 Q 30 25 10 35 Z" fill={detailColor} />
            </g>

            {/* Club Crest / Shield (Left Chest area) */}
            <g transform="translate(180, 150) scale(0.65)">
              {badgeImage ? (
                <image
                  href={badgeImage}
                  x="0"
                  y="0"
                  width="65"
                  height="65"
                  preserveAspectRatio="xMidYMid meet"
                />
              ) : badgeSvg ? (
                <g dangerouslySetInnerHTML={{ __html: badgeSvg }} />
              ) : (
                // Default crest
                <g>
                  <path d="M25 5 L55 18 L55 45 C55 60 25 75 25 75 C25 75 -5 60 -5 45 L-5 18 Z" fill={detailColor} stroke="#0f172a" strokeWidth="2.5" />
                  <path d="M25 12 L47 22 L47 43 C47 54 25 65 25 65 C25 65 3 54 3 43 L3 22 Z" fill={baseColor} />
                  <text x="25" y="44" textAnchor="middle" fill={textColor} fontSize="18" fontWeight="bold" fontFamily="sans-serif">FC</text>
                </g>
              )}
            </g>

            {/* Front Player Small Number (Optional modern touch) */}
            <text
              x="250"
              y="200"
              textAnchor="middle"
              className={fontStyle}
              fill={textColor}
              stroke={textOutlineColor}
              strokeWidth="1.5"
              fontSize="24"
              letterSpacing="2"
              style={{ fontWeight: 800 }}
            >
              {playerNumber}
            </text>

            {/* Front Sponsor Text / Logo */}
            {hasSponsor && sponsorText && (
              <g transform="translate(250, 290)">
                <rect
                  x="-105"
                  y="-22"
                  width="210"
                  height="44"
                  rx="6"
                  fill="rgba(0,0,0,0.25)"
                  stroke={detailColor}
                  strokeWidth="1"
                  strokeDasharray="4 2"
                  opacity="0.3"
                />
                <text
                  x="0"
                  y="8"
                  textAnchor="middle"
                  fill={textColor}
                  stroke={textOutlineColor}
                  strokeWidth="0.8"
                  fontSize="22"
                  fontFamily="'Chakra Petch', sans-serif"
                  fontWeight="900"
                  letterSpacing="3"
                >
                  {sponsorText.toUpperCase()}
                </text>
              </g>
            )}

            {/* Official Pro Seal Badge on Bottom Right */}
            <g transform="translate(315, 435) scale(0.6)">
              <circle cx="20" cy="20" r="18" fill="#1e293b" stroke={detailColor} strokeWidth="2" />
              <text x="20" y="24" textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="bold" fontFamily="sans-serif">PRO</text>
            </g>
          </g>
        ) : (
          <g id="back-graphics">
            {/* Small Club Name or Flag on Upper Back Neck */}
            <g transform="translate(250, 125)">
              <rect x="-24" y="-8" width="48" height="14" rx="3" fill={detailColor} opacity="0.9" />
              <text x="0" y="3" textAnchor="middle" fill="#0f172a" fontSize="8" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">
                ATLETIQ
              </text>
            </g>

            {/* Player Name */}
            <g transform="translate(250, 185)">
              <text
                x="0"
                y="0"
                textAnchor="middle"
                className={fontStyle}
                fill={textColor}
                stroke={textOutlineColor}
                strokeWidth="2.5"
                fontSize="42"
                letterSpacing="4"
                style={{
                  fontWeight: 900,
                  paintOrder: 'stroke fill',
                  filter: 'drop-shadow(0px 3px 5px rgba(0,0,0,0.5))'
                }}
              >
                {playerName.toUpperCase() || 'TU NOMBRE'}
              </text>
            </g>

            {/* Giant Dorsal Number */}
            <g transform="translate(250, 320)">
              {/* Drop shadow outline */}
              <text
                x="3"
                y="13"
                textAnchor="middle"
                className={fontStyle}
                fill="#000000"
                opacity="0.35"
                fontSize="145"
                style={{ fontWeight: 900 }}
              >
                {playerNumber || '10'}
              </text>

              {/* Number Stroke Outline & Fill */}
              <text
                x="0"
                y="10"
                textAnchor="middle"
                className={fontStyle}
                fill={textColor}
                stroke={textOutlineColor}
                strokeWidth="7"
                strokeLinejoin="round"
                fontSize="145"
                style={{
                  fontWeight: 900,
                  paintOrder: 'stroke fill'
                }}
              >
                {playerNumber || '10'}
              </text>

              {/* Number inner contrast line for authentic sports typography */}
              <text
                x="0"
                y="10"
                textAnchor="middle"
                className={fontStyle}
                fill="none"
                stroke={detailColor}
                strokeWidth="1.5"
                fontSize="145"
                opacity="0.8"
                style={{ fontWeight: 900 }}
              >
                {playerNumber || '10'}
              </text>
            </g>

            {/* Lower Back Sub-Sponsor or League hashtag */}
            <g transform="translate(250, 420)">
              <text
                x="0"
                y="0"
                textAnchor="middle"
                fill={detailColor}
                fontSize="12"
                fontWeight="700"
                fontFamily="sans-serif"
                letterSpacing="3"
                opacity="0.9"
              >
                #UNSTOPPABLE
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
