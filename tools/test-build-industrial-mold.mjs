import fs from 'fs';
import { MOLDE_CAMISA_STYLE, MOLDE_CAMISA_BACKGROUND_INNER, MOLDE_PATHS } from '../src/engine/compositor/moldeCamisaTemplate.js';

function buildIndustrialMoldSvg({
  clubId = 'mx_america',
  graphicId = 'mx_america_aztec_chevron',
  primaryColor = '#FFF0B5',
  secondaryColor = '#0A1A3A',
  accentsColor = '#F5A800',
  sleevesColor = '#FFF0B5',
  collarColor = '#0A1A3A',
  playerName = 'VALVERDE',
  playerNumber = '10',
  frontNumberEnabled = false,
  showCutLines = true,
  showSeamLines = true,
  showLabels = true,
}) {
  // Frente geometry: width 1497.7 pt, height 2166.7 pt. Bounds: [199.7, 1039.1] to [1697.4, 3205.8]
  const frenteCenterX = 948.55;
  const frenteTopY = 1039.1;
  const frenteBottomY = 3205.8;

  // Trasero geometry: width 1497.8 pt, height 2189.4 pt. Bounds: [1845.8, 1015.8] to [3343.6, 3205.2]
  const traseroCenterX = 2594.7;
  const traseroTopY = 1015.8;
  const traseroBottomY = 3205.2;

  // Generate Aztec Chevron for Club America
  let frontGraphicSvg = '';
  if (graphicId === 'mx_america_aztec_chevron') {
    // Top navy yoke down to chest V
    const vApexX = frenteCenterX;
    const vApexY = 1860;
    const vLeftWingX = 180;
    const vLeftWingY = 1460;
    const vRightWingX = 1715;
    const vRightWingY = 1460;

    // Chevron Yoke
    const yokePath = `M170,1010 L1725,1010 L${vRightWingX},${vRightWingY} L${vApexX},${vApexY} L${vLeftWingX},${vLeftWingY} Z`;

    // Geometric triangles along the V
    const count = 9;
    let trianglesRow1 = ''; // Red
    let trianglesRow2 = ''; // Blue
    let trianglesRow3 = ''; // Yellow

    for (let i = 0; i < count; i++) {
      const t0 = i / count;
      const t1 = (i + 1) / count;

      // Left wing (from vLeftWing to vApex)
      const lx0 = vLeftWingX + t0 * (vApexX - vLeftWingX);
      const ly0 = vLeftWingY + t0 * (vApexY - vLeftWingY);
      const lx1 = vLeftWingX + t1 * (vApexX - vLeftWingX);
      const ly1 = vLeftWingY + t1 * (vApexY - vLeftWingY);
      const lmidX = (lx0 + lx1) / 2;

      // Right wing (from vApex to vRightWing)
      const rx0 = vApexX + t0 * (vRightWingX - vApexX);
      const ry0 = vApexY - t0 * (vApexY - vRightWingY);
      const rx1 = vApexX + t1 * (vRightWingX - vApexX);
      const ry1 = vApexY - t1 * (vApexY - vRightWingY);
      const rmidX = (rx0 + rx1) / 2;

      // Row 1 (Carmine Red #C8102E)
      const r1Height = 55;
      trianglesRow1 += `<polygon points="${lx0.toFixed(1)},${ly0.toFixed(1)} ${lx1.toFixed(1)},${ly1.toFixed(1)} ${lmidX.toFixed(1)},${(ly0 + r1Height).toFixed(1)}" fill="#C8102E" />`;
      trianglesRow1 += `<polygon points="${rx0.toFixed(1)},${ry0.toFixed(1)} ${rx1.toFixed(1)},${ry1.toFixed(1)} ${rmidX.toFixed(1)},${(ry0 + r1Height).toFixed(1)}" fill="#C8102E" />`;

      // Row 2 (Royal Blue #003DA5)
      const r2Offset = 28;
      const r2Height = 50;
      trianglesRow2 += `<polygon points="${lx0.toFixed(1)},${(ly0 + r2Offset).toFixed(1)} ${lx1.toFixed(1)},${(ly1 + r2Offset).toFixed(1)} ${lmidX.toFixed(1)},${(ly0 + r2Offset + r2Height).toFixed(1)}" fill="#003DA5" />`;
      trianglesRow2 += `<polygon points="${rx0.toFixed(1)},${(ry0 + r2Offset).toFixed(1)} ${rx1.toFixed(1)},${(ry1 + r2Offset).toFixed(1)} ${rmidX.toFixed(1)},${(ry0 + r2Offset + r2Height).toFixed(1)}" fill="#003DA5" />`;

      // Row 3 (Yellow / Gold #F5A800)
      const r3Offset = 52;
      const r3Height = 44;
      trianglesRow3 += `<polygon points="${lx0.toFixed(1)},${(ly0 + r3Offset).toFixed(1)} ${lx1.toFixed(1)},${(ly1 + r3Offset).toFixed(1)} ${lmidX.toFixed(1)},${(ly0 + r3Offset + r3Height).toFixed(1)}" fill="#F5A800" />`;
      trianglesRow3 += `<polygon points="${rx0.toFixed(1)},${(ry0 + r3Offset).toFixed(1)} ${rx1.toFixed(1)},${(ry1 + r3Offset).toFixed(1)} ${rmidX.toFixed(1)},${(ry0 + r3Offset + r3Height).toFixed(1)}" fill="#F5A800" />`;
    }

    // Apex diamond
    const diamondSvg = `
      <polygon points="${vApexX},${vApexY + 45} ${vApexX + 50},${vApexY + 115} ${vApexX},${vApexY + 185} ${vApexX - 50},${vApexY + 115}" fill="#C8102E" />
      <polygon points="${vApexX},${vApexY + 65} ${vApexX + 32},${vApexY + 115} ${vApexX},${vApexY + 165} ${vApexX - 32},${vApexY + 115}" fill="#F5A800" />
    `;

    frontGraphicSvg = `
      <!-- Navy Upper Yoke -->
      <path d="${yokePath}" fill="${secondaryColor}" />
      <!-- Triangles Rows -->
      <g id="aztec_triangles_r1">${trianglesRow1}</g>
      <g id="aztec_triangles_r2">${trianglesRow2}</g>
      <g id="aztec_triangles_r3">${trianglesRow3}</g>
      <!-- Apex Diamond -->
      ${diamondSvg}
    `;
  }

  // Club America Crest (Left Chest)
  let crestSvg = '';
  if (clubId === 'mx_america') {
    const crestX = 690;
    const crestY = 1630;
    const r = 115;
    crestSvg = `
      <g id="crest_america" transform="translate(${crestX}, ${crestY})">
        <!-- Outer circle yellow cream with navy border -->
        <circle cx="0" cy="0" r="${r}" fill="#FFF0B5" stroke="#0B1B3D" stroke-width="${r * 0.14}" />
        <!-- Continent silhouette in blue -->
        <path d="M${-r * 0.24},${-r * 0.55} L${r * 0.14},${-r * 0.52} L${r * 0.22},${-r * 0.2} L0,${-r * 0.05} L${-r * 0.04},${r * 0.08} L${r * 0.28},${r * 0.22} L${r * 0.18},${r * 0.6} L0,${r * 0.72} L${-r * 0.14},${r * 0.3} Z" fill="#003DA5" />
        <!-- Interlocking CA letters in red -->
        <text x="0" y="${r * 0.12}" text-anchor="middle" dominant-baseline="middle" font-family="'Bebas Neue', Impact, sans-serif" font-weight="900" font-size="${r * 0.85}" fill="#C8102E">CA</text>
      </g>
    `;
  }

  // Front number (ONLY IF ENABLED)
  let frontNumSvg = '';
  if (frontNumberEnabled && playerNumber) {
    frontNumSvg = `
      <text x="1210" y="1630" text-anchor="middle" dominant-baseline="middle" font-family="'Bebas Neue', Impact, sans-serif" font-weight="900" font-size="140" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="12" paint-order="stroke fill">${playerNumber}</text>
    `;
  }

  // Back Yoke (matching front navy shoulder area)
  let backGraphicSvg = `
    <!-- Navy Upper Back Yoke -->
    <rect x="1815" y="985" width="1555" height="420" fill="${secondaryColor}" />
  `;

  // Back Player Name (arched)
  const nameY = 1530;
  let backNameSvg = `
    <text x="${traseroCenterX}" y="${nameY}" text-anchor="middle" dominant-baseline="middle" font-family="'Bebas Neue', Impact, sans-serif" font-weight="900" font-size="155" letter-spacing="4" fill="${secondaryColor}" stroke="#ffffff" stroke-width="10" paint-order="stroke fill">${playerName.toUpperCase()}</text>
  `;

  // Back Player Number (large 250mm athletic)
  const numberY = 2050;
  let backNumberSvg = `
    <text x="${traseroCenterX}" y="${numberY}" text-anchor="middle" dominant-baseline="middle" font-family="'Bebas Neue', Impact, sans-serif" font-weight="900" font-size="680" fill="${secondaryColor}" stroke="#ffffff" stroke-width="36" paint-order="stroke fill">${playerNumber}</text>
  `;

  // Sleeves trims
  const sleeveTrimHeight = 85;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 3543.31 3401.57">
  <!-- Generator: ATLETIQ Industrial Sublimation Engine v5.0 -->
  <defs>
    <style><![CDATA[
      ${MOLDE_CAMISA_STYLE}
      .cut-line { stroke: #010101; stroke-width: 2.2; fill: none; stroke-miterlimit: 10; }
      .seam-line { stroke: #dc2626; stroke-width: 1.5; stroke-dasharray: 12,8; fill: none; }
      .piece-tag { font-family: 'Arial Black', sans-serif; font-size: 20px; font-weight: 900; letter-spacing: 2px; fill: #475569; }
    ]]></style>
    <clipPath id="clip-frente">
      <path d="${MOLDE_PATHS.FRENTE}" />
    </clipPath>
    <clipPath id="clip-trasero">
      <path d="${MOLDE_PATHS.TRASERO}" />
    </clipPath>
    <clipPath id="clip-manga-der">
      <path d="${MOLDE_PATHS.MANGA_DERECHA}" />
    </clipPath>
    <clipPath id="clip-manga-izq">
      <path d="${MOLDE_PATHS.MANGA_IZQUIERDA}" />
    </clipPath>
  </defs>

  <!-- 1. CAPA MASTER DE PATRONAJE (FONDO ORIGINAL ADOBE ILLUSTRATOR) -->
  <g id="BACKGROUND">
    ${MOLDE_CAMISA_BACKGROUND_INNER}
  </g>

  <!-- 2. CAPA DE PRODUCCIÓN TEXTIL 1:1 (DISEÑO 3D APLANADO) -->
  <g id="DESIGN">
    <!-- ==================== PIEZA 1: DELANTERO / FRENTE ==================== -->
    <g id="PIECE_FRENTE">
      <!-- Arte Sublimado Sangrado (10 mm) bajo ClipPath -->
      <g clip-path="url(#clip-frente)">
        <!-- Fondo Base de Tela -->
        <rect x="170" y="1010" width="1555" height="2225" fill="${primaryColor}" />
        <!-- Patrón Gráfico Oficial -->
        ${frontGraphicSvg}
        <!-- Escudo Heráldico en Pecho Izquierdo -->
        ${crestSvg}
        <!-- Dorsal Pecho (solo si está activo en 3D) -->
        ${frontNumSvg}
      </g>

      <!-- Trazo de Corte Físico (Línea de confección) -->
      ${showCutLines ? `<path class="cut-line" d="${MOLDE_PATHS.FRENTE}" />` : ''}

      <!-- Margen de Costura 10 mm (Sangrado) -->
      ${showSeamLines ? `<path class="seam-line" d="${MOLDE_PATHS.FRENTE}" transform="translate(948.55, 2122.45) scale(0.978) translate(-948.55, -2122.45)" />` : ''}

      <!-- Identificación de Pieza -->
      ${showLabels ? `<text x="${frenteCenterX}" y="3255" text-anchor="middle" class="piece-tag">[ 1. DELANTERO / FRENTE • TALLA M ]</text>` : ''}
    </g>

    <!-- ==================== PIEZA 2: TRASERO / ESPALDA ==================== -->
    <g id="PIECE_TRASERO">
      <!-- Arte Sublimado Sangrado (10 mm) bajo ClipPath -->
      <g clip-path="url(#clip-trasero)">
        <!-- Fondo Base de Tela -->
        <rect x="1815" y="985" width="1555" height="2250" fill="${primaryColor}" />
        <!-- Yugo Posterior Superior -->
        ${backGraphicSvg}
        <!-- Nombre de Jugador en Bebas Neue -->
        ${backNameSvg}
        <!-- Dorsal de Jugador Atlético (250 mm) -->
        ${backNumberSvg}
      </g>

      <!-- Trazo de Corte Físico -->
      ${showCutLines ? `<path class="cut-line" d="${MOLDE_PATHS.TRASERO}" />` : ''}

      <!-- Margen de Costura 10 mm -->
      ${showSeamLines ? `<path class="seam-line" d="${MOLDE_PATHS.TRASERO}" transform="translate(2594.7, 2110.5) scale(0.978) translate(-2594.7, -2110.5)" />` : ''}

      <!-- Identificación de Pieza -->
      ${showLabels ? `<text x="${traseroCenterX}" y="3255" text-anchor="middle" class="piece-tag">[ 2. TRASERO / ESPALDA • TALLA M ]</text>` : ''}
    </g>

    <!-- ==================== PIEZA 3: MANGA IZQUIERDA ==================== -->
    <g id="PIECE_MANGA_IZQUIERDA">
      <g clip-path="url(#clip-manga-izq)">
        <!-- Fondo Manga -->
        <rect x="280" y="160" width="1335" height="750" fill="${sleevesColor}" />
        <!-- Ribete de Puño -->
        <rect x="280" y="${882.7 - sleeveTrimHeight}" width="1335" height="${sleeveTrimHeight + 20}" fill="${secondaryColor}" />
      </g>

      <!-- Trazo de Corte Físico -->
      ${showCutLines ? `<path class="cut-line" d="${MOLDE_PATHS.MANGA_IZQUIERDA}" />` : ''}

      <!-- Margen de Costura -->
      ${showSeamLines ? `<path class="seam-line" d="${MOLDE_PATHS.MANGA_IZQUIERDA}" transform="translate(948.55, 537.75) scale(0.965) translate(-948.55, -537.75)" />` : ''}

      <!-- Identificación -->
      ${showLabels ? `<text x="948.55" y="920" text-anchor="middle" class="piece-tag">[ 3. MANGA IZQUIERDA • TALLA M ]</text>` : ''}
    </g>

    <!-- ==================== PIEZA 4: MANGA DERECHA ==================== -->
    <g id="PIECE_MANGA_DERECHA">
      <g clip-path="url(#clip-manga-der)">
        <!-- Fondo Manga -->
        <rect x="1925" y="160" width="1335" height="750" fill="${sleevesColor}" />
        <!-- Ribete de Puño -->
        <rect x="1925" y="${882.7 - sleeveTrimHeight}" width="1335" height="${sleeveTrimHeight + 20}" fill="${secondaryColor}" />
      </g>

      <!-- Trazo de Corte Físico -->
      ${showCutLines ? `<path class="cut-line" d="${MOLDE_PATHS.MANGA_DERECHA}" />` : ''}

      <!-- Margen de Costura -->
      ${showSeamLines ? `<path class="seam-line" d="${MOLDE_PATHS.MANGA_DERECHA}" transform="translate(2594.75, 537.75) scale(0.965) translate(-2594.75, -537.75)" />` : ''}

      <!-- Identificación -->
      ${showLabels ? `<text x="2594.75" y="920" text-anchor="middle" class="piece-tag">[ 4. MANGA DERECHA • TALLA M ]</text>` : ''}
    </g>
  </g>
</svg>`;
}

const svgOut = buildIndustrialMoldSvg({});
fs.writeFileSync('C:/Users/crja_/.gemini/antigravity/brain/cf8e5362-56e5-4493-872a-e49bda63f632/molde_industrial_america_test.svg', svgOut);
console.log('Generated test SVG, size:', svgOut.length);
