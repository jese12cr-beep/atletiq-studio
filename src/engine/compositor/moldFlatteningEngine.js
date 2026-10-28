/**
 * ATLETIQ Engine — Motor de Aplanado 3D a 2D y Generador de Moldes de Confección
 *
 * Mapea y proyecta las personalizaciones 3D (colores, patrones geométricos de Liga MX,
 * cortes CAD, escudos heráldicos, nombres, dorsales y parches) directamente sobre
 * los moldes físicos de patronaje y corte textil basados en MOLDE CAMISA.svg (Talla M, escala 1:1).
 *
 * Dimensiones físicas del pliego: 1250 mm x 1200 mm (viewBox="0 0 3543.31 3401.57")
 * Factor de conversión: 1 mm = 2.83464567 pt (72 pt/in / 25.4 mm/in)
 */

export const MOLD_CONSTANTS = {
  VIEWBOX: '0 0 3543.31 3401.57',
  WIDTH_PT: 3543.31,
  HEIGHT_PT: 3401.57,
  WIDTH_MM: 1250,
  HEIGHT_MM: 1200,
  PT_PER_MM: 2.83464567,

  // Geometría y centros de cada pieza anatómica en el pliego
  PIECES: {
    FRONT: {
      id: 'front',
      name: 'Delantero / Frente',
      tag: 'TALLA M • FRENTE',
      pathD:
        'M1696.25,1839.99c-115.97-72.21-137.49-188.38-145.49-315.14-6.82-121.39,16.51-249.79,59.6-363.19l-412.37-122.53c-3.95,79.49-28.89,164.03-73.84,230.11-25.15,36.14-56.09,67-92.41,89.5-50.93,31.55-115.47,31.55-166.39,0-36.32-22.5-67.26-53.36-92.42-89.5-44.94-66.08-69.89-150.62-73.84-230.11l-412.37,122.53c43.09,113.4,66.42,241.8,59.6,363.19-8,126.76-29.51,242.93-145.49,315.14l-1.13,1358.15c237.54,7.64,511.01,6.93,748.84,6.91,237.83.02,511.3.73,748.84-6.91L1696.25,1839.99Z',
      bounds: { minX: 195.6, maxX: 1696.25, minY: 1039, maxY: 3205 },
      centerX: 945.9,
      centerY: 2122,
      widthMm: 529.4,
      heightMm: 764.1,
      chestY: 1580, // Altura del esternón/pecho para escudo y patrocinador
      crestPos: { x: 670, y: 1620, radius: 46 }, // Escudo lado izquierdo (corazón)
      numberPos: { x: 1220, y: 1620, size: 90 }, // Número chico frente derecho
      centerChestY: 1720,
    },
    BACK: {
      id: 'back',
      name: 'Trasero / Espalda',
      tag: 'TALLA M • ESPALDA',
      pathD:
        'M3342.55,1839.49c-120.49-74.57-145.36-205.39-138.05-337.6,8.42-122,26.92-247.98,57.83-366.38l-402.45-119.69c-32.38,42.84-72.11,90.62-122.03,113.24-42.57,18.25-97.01,28.35-143.12,30.47-46.11-2.12-100.55-12.22-143.11-30.47-49.93-22.62-89.66-70.4-122.03-113.24l-402.45,119.69c30.9,118.4,49.4,244.38,57.82,366.38,7.31,132.21-17.56,263.03-138.04,337.6l-1.07,1358.15,150.24,4.33c152.53,2.95,335.49,2.65,487.7,3.26h221.88c152.11-.61,335.3-.31,487.7-3.26l150.24-4.33L3342.55,1839.49Z',
      bounds: { minX: 1845.3, maxX: 3342.55, minY: 1039, maxY: 3205 },
      centerX: 2593.9,
      centerY: 2122,
      widthMm: 528.2,
      heightMm: 764.1,
      nameY: 1530, // Posición del nombre del jugador en hombros
      numberY: 1980, // Centro del dorsal grande (250 mm)
    },
    LEFT_SLEEVE: {
      id: 'left_sleeve',
      name: 'Manga Izquierda',
      tag: 'TALLA M • MANGA IZQ',
      pathD:
        'M1586.97,570.15l-25.72-10.63c-90.79-39.97-162.57-120.95-230.88-190.21-31.3-34.56-70.93-78.58-109.78-104.45-78.16-53.54-178.63-72.06-272.05-67.97-93.42-4.09-193.89,14.43-272.05,67.97-38.84,25.87-78.48,69.89-109.78,104.45-68.31,69.26-140.09,150.24-230.88,190.21l-25.72,10.63c36.15,43.9,58.86,103.48,78.87,156.04,11.56,30.09,24.45,72.15,31.54,103.61l-10.63,52.87h1077.3l-10.63-52.87c7.09-31.46,19.98-73.52,31.54-103.61C1528.11,673.63,1550.83,614.05,1586.97,570.15Z',
      bounds: { minX: 509.6, maxX: 1587, minY: 185, maxY: 737 },
      centerX: 1048.3,
      centerY: 461,
      hemY: 737,
    },
    RIGHT_SLEEVE: {
      id: 'right_sleeve',
      name: 'Manga Derecha',
      tag: 'TALLA M • MANGA DER',
      pathD:
        'M3233.16,570.15l-25.72-10.63c-90.79-39.97-162.57-120.95-230.88-190.21-31.3-34.56-70.93-78.58-109.78-104.45-78.16-53.54-178.63-72.06-272.05-67.97-93.42-4.09-193.89,14.43-272.05,67.97-38.84,25.87-78.48,69.89-109.78,104.45-68.31,69.26-140.09,150.24-230.88,190.21l-25.72,10.63c36.15,43.9,58.86,103.48,78.87,156.04,11.56,30.09,24.45,72.15,31.54,103.61l-10.63,52.87h1077.3l-10.63-52.87c7.09-31.46,19.98-73.52,31.54-103.61C3174.3,673.63,3197.02,614.05,3233.16,570.15Z',
      bounds: { minX: 2155.8, maxX: 3233.2, minY: 185, maxY: 737 },
      centerX: 2694.5,
      centerY: 461,
      hemY: 737,
    },
    COLLAR: {
      id: 'collar',
      name: 'Cuello / Ribete',
      tag: 'TALLA M • CUELLO',
      // Rectángulo original rotado 90 grados: x: 1700 a 1845, y: 823 a 2220
      bounds: { minX: 1700, maxX: 1845, minY: 823, maxY: 2220 },
      widthPt: 144.35,
      heightPt: 1397.62,
      transform: 'translate(2666.7948 -876.4772) rotate(90)',
    },
  },
};

/**
 * Genera el marcado SVG de patrones gráficos de la Liga MX para incrustar dentro del molde plano.
 */
function generateLigaMxSvgPattern(graphicId, piece, design) {
  const isAway = design.mexicoKitId?.includes('away') || design.colorZones?.primary?.hex?.toLowerCase() === '#0b1b3d';
  const primary = design.colorZones?.primary?.hex || '#ffffff';
  const secondary = design.colorZones?.secondary?.hex || '#0f172a';
  const accents = design.colorZones?.accents?.hex || '#ffcd00';

  const cx = piece.centerX;
  const cy = piece.centerY;
  const b = piece.bounds;
  const w = b.maxX - b.minX;
  const h = b.maxY - b.minY;

  switch (graphicId) {
    case 'mx_america_aztec_chevron': {
      // Chevron Azteca V tricolor gigante centrado en el pecho
      const chevronY = b.minY + 280;
      const vDepth = 480;
      return `
        <!-- Club América Chevron Azteca -->
        <g id="pat-america-chevron">
          <!-- Hombreras Marina -->
          <polygon points="${b.minX - 40},${b.minY - 40} ${b.maxX + 40},${b.minY - 40} ${b.maxX + 40},${chevronY} ${cx},${chevronY + vDepth} ${b.minX - 40},${chevronY}" fill="${secondary}" />
          <!-- Plumas Tricolores en V -->
          <polygon points="${cx},${chevronY + vDepth} ${cx - 140},${chevronY + vDepth - 120} ${cx - 70},${chevronY + vDepth - 60}" fill="${accents}" />
          <polygon points="${cx},${chevronY + vDepth} ${cx + 140},${chevronY + vDepth - 120} ${cx + 70},${chevronY + vDepth - 60}" fill="${accents}" />
          <polygon points="${cx - 140},${chevronY + vDepth - 120} ${cx - 280},${chevronY + vDepth - 240} ${cx - 210},${chevronY + vDepth - 180}" fill="${accents}" />
          <polygon points="${cx + 140},${chevronY + vDepth - 120} ${cx + 280},${chevronY + vDepth - 240} ${cx + 210},${chevronY + vDepth - 180}" fill="${accents}" />
          <polygon points="${cx - 280},${chevronY + vDepth - 240} ${cx - 420},${chevronY + vDepth - 360} ${cx - 350},${chevronY + vDepth - 300}" fill="${accents}" />
          <polygon points="${cx + 280},${chevronY + vDepth - 240} ${cx + 420},${chevronY + vDepth - 360} ${cx + 350},${chevronY + vDepth - 300}" fill="${accents}" />
          <!-- Rombo de remate central -->
          <polygon points="${cx},${chevronY + vDepth + 40} ${cx + 45},${chevronY + vDepth + 105} ${cx},${chevronY + vDepth + 170} ${cx - 45},${chevronY + vDepth + 105}" fill="${accents}" stroke="#FFD100" stroke-width="4" />
        </g>
      `;
    }

    case 'mx_chivas_stripes': {
      // 5 Rayas rojas y 4 blancas tradicionales
      const stripeW = w / 9;
      let stripesSvg = '<g id="pat-chivas-stripes">';
      for (let i = 0; i < 9; i++) {
        const fill = i % 2 === 0 ? secondary : primary;
        const sx = b.minX + i * stripeW;
        stripesSvg += `<rect x="${sx}" y="${b.minY - 30}" width="${stripeW + 2}" height="${h + 60}" fill="${fill}" />`;
      }
      stripesSvg += '</g>';
      return stripesSvg;
    }

    case 'mx_pumas_giant_feline': {
      // Gran silueta felina en pecho
      const pumaSize = 340;
      return `
        <!-- Pumas Cabeza Felina Monumental -->
        <g id="pat-pumas-feline" transform="translate(${cx}, ${piece.chestY + 120}) scale(${pumaSize / 100})">
          <path d="M-40 -40 Q0 -34 40 -40 Q62 -35 62 -10 Q58 35 0 55 Q-58 35 -62 -10 Q-62 -35 -40 -40 Z" fill="${secondary}" stroke="${accents}" stroke-width="4" />
          <!-- Ojos y Nariz -->
          <polygon points="-22,-5 -10,-10 -22,-15" fill="${primary}" />
          <polygon points="22,-5 10,-10 22,-15" fill="${primary}" />
          <polygon points="0,5 8,24 -8,24" fill="${primary}" />
        </g>
      `;
    }

    case 'mx_tigres_chest_bar': {
      // Franja horizontal en pecho
      const barY = piece.chestY + 40;
      return `
        <!-- Tigres Franja Horizontal Pecho -->
        <g id="pat-tigres-bar">
          <rect x="${b.minX - 40}" y="${barY}" width="${w + 80}" height="140" fill="${secondary}" />
          <rect x="${b.minX - 40}" y="${barY}" width="${w + 80}" height="8" fill="#ffffff" />
          <rect x="${b.minX - 40}" y="${barY + 132}" width="${w + 80}" height="8" fill="#ffffff" />
          <text x="${cx}" y="${barY + 95}" font-family="Arial, Helvetica, sans-serif" font-size="78" font-weight="900" fill="${primary}" text-anchor="middle" letter-spacing="8">TIGRES</text>
        </g>
      `;
    }

    case 'mx_puebla_franja_sash': {
      // La legendaria Franja Diagonal a -32°
      return `
        <!-- Puebla Franja Diagonal -->
        <g id="pat-puebla-sash">
          <polygon points="${b.minX + 80},${b.minY} ${b.minX + 380},${b.minY} ${b.maxX},${b.maxY - 400} ${b.maxX - 300},${b.maxY - 400}" fill="${secondary}" />
          <line x1="${b.minX + 80}" y1="${b.minY}" x2="${b.maxX - 300}" y2="${b.maxY - 400}" stroke="#ffffff" stroke-width="8" />
          <line x1="${b.minX + 380}" y1="${b.minY}" x2="${b.maxX}" y2="${b.maxY - 400}" stroke="#ffffff" stroke-width="8" />
        </g>
      `;
    }

    case 'mx_atlas_half_split': {
      // División vertical 50/50 roja y negra
      return `
        <!-- Atlas 50/50 -->
        <g id="pat-atlas-half">
          <rect x="${b.minX - 40}" y="${b.minY - 40}" width="${w / 2 + 40}" height="${h + 80}" fill="${primary}" />
          <rect x="${cx}" y="${b.minY - 40}" width="${w / 2 + 40}" height="${h + 80}" fill="${secondary}" />
          <line x1="${cx}" y1="${b.minY - 40}" x2="${cx}" y2="${b.maxY + 40}" stroke="#ffffff" stroke-width="3" opacity="0.6" />
        </g>
      `;
    }

    default:
      return '';
  }
}

/**
 * Genera el SVG completo 1:1 del molde de corte con todas las piezas y gráficos sublimados proyectados.
 */
export function generateProductionMoldSvgString(design, activePlayer = null, options = {}) {
  const {
    showCutLines = true,
    showSeamAllowance = true,
    showRegistrationMarks = true,
    showProductionLabels = true,
    showBackgroundGuides = true,
  } = options;

  const P = MOLD_CONSTANTS.PIECES;

  const primaryColor = design?.colorZones?.primary?.hex || '#ffffff';
  const secondaryColor = design?.colorZones?.secondary?.hex || '#0f172a';
  const accentsColor = design?.colorZones?.accents?.hex || '#ffcd00';
  const collarColor = design?.colorZones?.collar?.hex || secondaryColor;
  const sleevesColor = design?.colorZones?.sleeves?.hex || primaryColor;

  const playerName = (activePlayer?.name || design?.sampleName || 'MARTÍN').toUpperCase();
  const playerNumber = String(activePlayer?.number || design?.sampleNumber || '21');
  const clubAlias = design?.clubAlias || 'ATLETIQ PRO';

  // Buscar decal del escudo o gráfico especial
  const graphicDecal = design?.decals?.find((d) => d.type === 'LIGAMX_GRAPHIC')?.graphicId;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="${MOLD_CONSTANTS.VIEWBOX}" width="1250mm" height="1200mm">
  <defs>
    <style>
      .cut-line { fill: none; stroke: #111111; stroke-width: 2.2; stroke-dasharray: 8 5; }
      .seam-line { fill: none; stroke: #0088cc; stroke-width: 1.5; stroke-dasharray: 4 4; opacity: 0.7; }
      .label-text { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 20px; font-weight: 800; fill: #334155; }
      .number-stroke { font-family: 'Arial Black', Impact, sans-serif; font-weight: 900; }
    </style>

    <!-- 1. ClipPath de Delantero -->
    <clipPath id="mold-clip-front">
      <path d="${P.FRONT.pathD}" />
    </clipPath>

    <!-- 2. ClipPath de Trasero -->
    <clipPath id="mold-clip-back">
      <path d="${P.BACK.pathD}" />
    </clipPath>

    <!-- 3. ClipPath de Manga Izquierda -->
    <clipPath id="mold-clip-sleeve-left">
      <path d="${P.LEFT_SLEEVE.pathD}" />
    </clipPath>

    <!-- 4. ClipPath de Manga Derecha -->
    <clipPath id="mold-clip-sleeve-right">
      <path d="${P.RIGHT_SLEEVE.pathD}" />
    </clipPath>

    <!-- 5. ClipPath de Cuello -->
    <clipPath id="mold-clip-collar">
      <rect x="${P.COLLAR.bounds.minX}" y="${P.COLLAR.bounds.minY}" width="${P.COLLAR.bounds.maxX - P.COLLAR.bounds.minX}" height="${P.COLLAR.bounds.maxY - P.COLLAR.bounds.minY}" />
    </clipPath>
  </defs>

  <!-- ==================== CAPA 1: FONDO & GUÍAS DE CALIBRACIÓN ==================== -->
  <g id="BACKGROUND_CALIBRATION">
    <!-- Marco de Hoja de Plotter de 1250 x 1200 mm -->
    <rect x="0" y="0" width="${MOLD_CONSTANTS.WIDTH_PT}" height="${MOLD_CONSTANTS.HEIGHT_PT}" fill="#fafafa" stroke="#e2e8f0" stroke-width="2" />

    <!-- Barra de Metadatos de la Orden Superior -->
    <rect x="50" y="30" width="3443" height="50" rx="10" fill="#0f172a" />
    <text x="80" y="62" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="900" fill="#38bdf8" letter-spacing="1.5">
      ATLETIQ SUBLIMATION PRINT ENGINE v5.0 • PLIEGO DE PRODUCCIÓN TEXTIL 1:1 (TALLA M)
    </text>
    <text x="2100" y="62" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="700" fill="#e2e8f0">
      MODELO: <tspan fill="#4ade80">${clubAlias}</tspan> | JUGADOR: <tspan fill="#fde047">${playerName} #${playerNumber}</tspan> | ANCHO PLIEGO: 1250 mm
    </text>

    ${
      showRegistrationMarks
        ? `
      <!-- Cruces de Registro en las 4 esquinas del pliego -->
      <g stroke="#000000" stroke-width="1.5" fill="none">
        <!-- Esquina Superior Izquierda -->
        <circle cx="80" cy="140" r="16" />
        <line x1="50" y1="140" x2="110" y2="140" />
        <line x1="80" y1="110" x2="80" y2="170" />

        <!-- Esquina Superior Derecha -->
        <circle cx="3460" cy="140" r="16" />
        <line x1="3430" y1="140" x2="3490" y2="140" />
        <line x1="3460" y1="110" x2="3460" y2="170" />

        <!-- Esquina Inferior Izquierda -->
        <circle cx="80" cy="3320" r="16" />
        <line x1="50" y1="3320" x2="110" y2="3320" />
        <line x1="80" y1="3290" x2="80" y2="3350" />

        <!-- Esquina Inferior Derecha -->
        <circle cx="3460" cy="3320" r="16" />
        <line x1="3430" y1="3320" x2="3490" y2="3320" />
        <line x1="3460" y1="3290" x2="3460" y2="3350" />
      </g>

      <!-- Barra de Control de Color CMYK en Pie de Página -->
      <g transform="translate(1500, 3280)">
        <rect x="0" y="0" width="80" height="40" fill="#00ffff" stroke="#000" stroke-width="1" />
        <rect x="80" y="0" width="80" height="40" fill="#ff00ff" stroke="#000" stroke-width="1" />
        <rect x="160" y="0" width="80" height="40" fill="#ffff00" stroke="#000" stroke-width="1" />
        <rect x="240" y="0" width="80" height="40" fill="#000000" stroke="#000" stroke-width="1" />
        <text x="340" y="27" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#333">CMYK RIP CONTROL • 100% ESCALA REAL</text>
      </g>
    `
        : ''
    }
  </g>

  <!-- ==================== CAPA 2: GRÁFICOS SUBLIMADOS DENTRO DE CADA PIEZA ==================== -->
  <g id="SUBLIMATION_GRAPHICS">
    <!-- 1. PIEZA DELANTERO (FRENTE) -->
    <g id="PIECE_FRONT">
      <g clip-path="url(#mold-clip-front)">
        <!-- Fondo base con sangrado de 20 mm -->
        <rect x="${P.FRONT.bounds.minX - 60}" y="${P.FRONT.bounds.minY - 60}" width="${P.FRONT.bounds.maxX - P.FRONT.bounds.minX + 120}" height="${P.FRONT.bounds.maxY - P.FRONT.bounds.minY + 120}" fill="${primaryColor}" />

        <!-- Patrón Geométrico Sublimado -->
        ${generateLigaMxSvgPattern(graphicDecal, P.FRONT, design)}

        <!-- Escudo en Pecho Izquierdo -->
        <g id="front-crest" transform="translate(${P.FRONT.crestPos.x}, ${P.FRONT.crestPos.y})">
          <circle cx="0" cy="0" r="${P.FRONT.crestPos.radius}" fill="#ffffff" stroke="${secondaryColor}" stroke-width="6" />
          <circle cx="0" cy="0" r="${P.FRONT.crestPos.radius - 10}" fill="${secondaryColor}" />
          <circle cx="0" cy="0" r="${P.FRONT.crestPos.radius - 24}" fill="${accentsColor}" />
          <text x="0" y="9" font-family="'Arial Black', sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">MX</text>
        </g>

        <!-- Número Chico Frontal Derecho (Opcional) -->
        <text x="${P.FRONT.numberPos.x}" y="${P.FRONT.numberPos.y + 25}" font-family="'Arial Black', Impact, sans-serif" font-size="75" font-weight="900" fill="${secondaryColor}" stroke="#ffffff" stroke-width="5" text-anchor="middle">
          ${playerNumber}
        </text>
      </g>

      <!-- Línea de Costura & Corte del Delantero -->
      ${showCutLines ? `<path d="${P.FRONT.pathD}" class="cut-line" />` : ''}

      <!-- Etiqueta de Confección -->
      ${
        showProductionLabels
          ? `
        <text x="${P.FRONT.centerX}" y="${P.FRONT.bounds.maxY + 45}" class="label-text" text-anchor="middle">
          [ 1. DELANTERO • TALLA M • CORTE ${design.patternId?.toUpperCase() || 'PRO'} ]
        </text>
      `
          : ''
      }
    </g>

    <!-- 2. PIEZA TRASERO (ESPALDA) -->
    <g id="PIECE_BACK">
      <g clip-path="url(#mold-clip-back)">
        <!-- Fondo base con sangrado de 20 mm -->
        <rect x="${P.BACK.bounds.minX - 60}" y="${P.BACK.bounds.minY - 60}" width="${P.BACK.bounds.maxX - P.BACK.bounds.minX + 120}" height="${P.BACK.bounds.maxY - P.BACK.bounds.minY + 120}" fill="${primaryColor}" />

        <!-- Hombreras en Espalda si aplica -->
        ${
          graphicDecal === 'mx_america_aztec_chevron'
            ? `<polygon points="${P.BACK.bounds.minX - 40},${P.BACK.bounds.minY - 40} ${P.BACK.bounds.maxX + 40},${P.BACK.bounds.minY - 40} ${P.BACK.bounds.maxX + 40},${P.BACK.bounds.minY + 280} ${P.BACK.bounds.minX - 40},${P.BACK.bounds.minY + 280}" fill="${secondaryColor}" />`
            : ''
        }

        <!-- Nombre del Jugador (Tipografía Atlética Condensada) -->
        <g id="back-player-name" transform="translate(${P.BACK.centerX}, ${P.BACK.nameY})">
          <text x="0" y="0" font-family="'Arial Black', sans-serif" font-size="82" font-weight="900" fill="${secondaryColor}" stroke="#ffffff" stroke-width="8" paint-order="stroke fill" text-anchor="middle" letter-spacing="5">
            ${playerName}
          </text>
        </g>

        <!-- Dorsal Grande Oficial (250 mm de altura) -->
        <g id="back-player-number" transform="translate(${P.BACK.centerX}, ${P.BACK.numberY})">
          <text x="0" y="80" font-family="'Arial Black', Impact, sans-serif" font-size="360" font-weight="900" fill="${secondaryColor}" stroke="#ffffff" stroke-width="22" paint-order="stroke fill" text-anchor="middle" letter-spacing="8">
            ${playerNumber}
          </text>
        </g>
      </g>

      <!-- Línea de Costura & Corte del Trasero -->
      ${showCutLines ? `<path d="${P.BACK.pathD}" class="cut-line" />` : ''}

      <!-- Etiqueta de Confección -->
      ${
        showProductionLabels
          ? `
        <text x="${P.BACK.centerX}" y="${P.BACK.bounds.maxY + 45}" class="label-text" text-anchor="middle">
          [ 2. TRASERO • TALLA M • #${playerNumber} ${playerName} ]
        </text>
      `
          : ''
      }
    </g>

    <!-- 3. PIEZA MANGA IZQUIERDA -->
    <g id="PIECE_LEFT_SLEEVE">
      <g clip-path="url(#mold-clip-sleeve-left)">
        <!-- Fondo base con sangrado -->
        <rect x="${P.LEFT_SLEEVE.bounds.minX - 60}" y="${P.LEFT_SLEEVE.bounds.minY - 60}" width="${P.LEFT_SLEEVE.bounds.maxX - P.LEFT_SLEEVE.bounds.minX + 120}" height="${P.LEFT_SLEEVE.bounds.maxY - P.LEFT_SLEEVE.bounds.minY + 120}" fill="${sleevesColor}" />

        <!-- Ribete de Puño Inferior (40 mm) -->
        <rect x="${P.LEFT_SLEEVE.bounds.minX - 40}" y="${P.LEFT_SLEEVE.hemY - 90}" width="${P.LEFT_SLEEVE.bounds.maxX - P.LEFT_SLEEVE.bounds.minX + 80}" height="100" fill="${secondaryColor}" />
        <rect x="${P.LEFT_SLEEVE.bounds.minX - 40}" y="${P.LEFT_SLEEVE.hemY - 105}" width="${P.LEFT_SLEEVE.bounds.maxX - P.LEFT_SLEEVE.bounds.minX + 80}" height="15" fill="${accentsColor}" />
      </g>

      ${showCutLines ? `<path d="${P.LEFT_SLEEVE.pathD}" class="cut-line" />` : ''}

      ${
        showProductionLabels
          ? `
        <text x="${P.LEFT_SLEEVE.centerX}" y="${P.LEFT_SLEEVE.bounds.maxY + 45}" class="label-text" text-anchor="middle">
          [ 3. MANGA IZQUIERDA • TALLA M ]
        </text>
      `
          : ''
      }
    </g>

    <!-- 4. PIEZA MANGA DERECHA -->
    <g id="PIECE_RIGHT_SLEEVE">
      <g clip-path="url(#mold-clip-sleeve-right)">
        <!-- Fondo base con sangrado -->
        <rect x="${P.RIGHT_SLEEVE.bounds.minX - 60}" y="${P.RIGHT_SLEEVE.bounds.minY - 60}" width="${P.RIGHT_SLEEVE.bounds.maxX - P.RIGHT_SLEEVE.bounds.minX + 120}" height="${P.RIGHT_SLEEVE.bounds.maxY - P.RIGHT_SLEEVE.bounds.minY + 120}" fill="${sleevesColor}" />

        <!-- Ribete de Puño Inferior (40 mm) -->
        <rect x="${P.RIGHT_SLEEVE.bounds.minX - 40}" y="${P.RIGHT_SLEEVE.hemY - 90}" width="${P.RIGHT_SLEEVE.bounds.maxX - P.RIGHT_SLEEVE.bounds.minX + 80}" height="100" fill="${secondaryColor}" />
        <rect x="${P.RIGHT_SLEEVE.bounds.minX - 40}" y="${P.RIGHT_SLEEVE.hemY - 105}" width="${P.RIGHT_SLEEVE.bounds.maxX - P.RIGHT_SLEEVE.bounds.minX + 80}" height="15" fill="${accentsColor}" />
      </g>

      ${showCutLines ? `<path d="${P.RIGHT_SLEEVE.pathD}" class="cut-line" />` : ''}

      ${
        showProductionLabels
          ? `
        <text x="${P.RIGHT_SLEEVE.centerX}" y="${P.RIGHT_SLEEVE.bounds.maxY + 45}" class="label-text" text-anchor="middle">
          [ 4. MANGA DERECHA • TALLA M ]
        </text>
      `
          : ''
      }
    </g>

    <!-- 5. PIEZA CUELLO / RIBETE -->
    <g id="PIECE_COLLAR">
      <g clip-path="url(#mold-clip-collar)">
        <!-- Fondo del cuello -->
        <rect x="${P.COLLAR.bounds.minX - 30}" y="${P.COLLAR.bounds.minY - 30}" width="${P.COLLAR.bounds.maxX - P.COLLAR.bounds.minX + 60}" height="${P.COLLAR.bounds.maxY - P.COLLAR.bounds.minY + 60}" fill="${collarColor}" />
        <!-- Línea central de acento -->
        <rect x="${P.COLLAR.bounds.minX + 60}" y="${P.COLLAR.bounds.minY - 30}" width="25" height="${P.COLLAR.bounds.maxY - P.COLLAR.bounds.minY + 60}" fill="${accentsColor}" />
      </g>

      ${
        showCutLines
          ? `
        <rect x="${P.COLLAR.bounds.minX}" y="${P.COLLAR.bounds.minY}" width="${P.COLLAR.bounds.maxX - P.COLLAR.bounds.minX}" height="${P.COLLAR.bounds.maxY - P.COLLAR.bounds.minY}" class="cut-line" />
      `
          : ''
      }

      ${
        showProductionLabels
          ? `
        <text x="${(P.COLLAR.bounds.minX + P.COLLAR.bounds.maxX) / 2}" y="${P.COLLAR.bounds.maxY + 45}" class="label-text" text-anchor="middle">
          [ 5. CUELLO ]
        </text>
      `
          : ''
      }
    </g>
  </g>
</svg>`;
}

/**
 * Dispara la descarga del SVG en el navegador.
 */
export function downloadProductionMoldSvg(design, activePlayer = null, filename = null) {
  const svgText = generateProductionMoldSvgString(design, activePlayer);
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (design?.clubAlias || 'atletiq').toLowerCase().replace(/\s+/g, '_');
  const playerName = (activePlayer?.name || design?.sampleName || 'custom').toLowerCase().replace(/\s+/g, '_');
  a.href = url;
  a.download = filename || `MOLDE_CONFECCION_1A1_${safeName}_${playerName}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
