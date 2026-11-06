/**
 * ATLETIQ — patternGradingEngine.js
 * Motor Industrial de Escalado de Patronaje Textil Deportivo (Grading Rules Engine).
 *
 * Basado en estándares internacionales de patronaje industrial (Gerber Accumark / Optitex / Lectra)
 * para ropa deportiva de alto rendimiento y sublimación digital RIP 1:1.
 *
 * Talla Maestra Base: M (100% / Escala 1.000).
 * Rango de Graduación: XS, S, M, L, XL, XXL.
 */

// ============================================================================
// 1. ESPECIFICACIÓN Y TABLAS DE MEDIDAS TÉCNICAS (EN CM DE PRENDA TERMINADA)
// ============================================================================

export const GRADING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const BASE_SIZE = 'M';

export const GARMENT_SIZE_CHARTS = {
  // --- A. CAMISETA FÚTBOL CABALLERO (F3 BASIC / PRO) ---
  futbol_jersey_pro_vneck: {
    title: 'Camiseta Fútbol Caballero',
    category: 'jersey_men',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { chestWidth: 47, chestContour: 94,  totalLength: 68, shoulderWidth: 40.5, sleeveLength: 21.0, scaleX: 0.904, scaleY: 0.944 },
      S:   { chestWidth: 49.5, chestContour: 99, totalLength: 70, shoulderWidth: 42.0, sleeveLength: 22.0, scaleX: 0.952, scaleY: 0.972 },
      M:   { chestWidth: 52, chestContour: 104, totalLength: 72, shoulderWidth: 43.5, sleeveLength: 23.0, scaleX: 1.000, scaleY: 1.000 },
      L:   { chestWidth: 55, chestContour: 110, totalLength: 74, shoulderWidth: 45.0, sleeveLength: 24.0, scaleX: 1.058, scaleY: 1.028 },
      XL:  { chestWidth: 58.5, chestContour: 117, totalLength: 76.5, shoulderWidth: 47.0, sleeveLength: 25.0, scaleX: 1.125, scaleY: 1.063 },
      XXL: { chestWidth: 62.5, chestContour: 125, totalLength: 79, shoulderWidth: 49.0, sleeveLength: 26.0, scaleX: 1.202, scaleY: 1.097 },
    },
  },

  // --- B. PLAYERA FÚTBOL DAMA ENTALLADA (F3W) ---
  futbol_jersey_f3w_women: {
    title: 'Playera Fútbol Dama Entallada',
    category: 'jersey_women',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { chestWidth: 41, waistWidth: 36, hipWidth: 43, totalLength: 61, shoulderWidth: 35.5, sleeveLength: 16.0, scaleX: 0.891, scaleY: 0.938 },
      S:   { chestWidth: 43.5, waistWidth: 38.5, hipWidth: 45.5, totalLength: 63, shoulderWidth: 37.0, sleeveLength: 17.0, scaleX: 0.946, scaleY: 0.969 },
      M:   { chestWidth: 46, waistWidth: 41, hipWidth: 48, totalLength: 65, shoulderWidth: 38.5, sleeveLength: 18.0, scaleX: 1.000, scaleY: 1.000 },
      L:   { chestWidth: 49, waistWidth: 44, hipWidth: 51, totalLength: 67, shoulderWidth: 40.0, sleeveLength: 19.0, scaleX: 1.065, scaleY: 1.031 },
      XL:  { chestWidth: 52.5, waistWidth: 47.5, hipWidth: 54.5, totalLength: 69.5, shoulderWidth: 41.5, sleeveLength: 20.0, scaleX: 1.141, scaleY: 1.069 },
      XXL: { chestWidth: 56.5, waistWidth: 51.5, hipWidth: 58.5, totalLength: 72, shoulderWidth: 43.0, sleeveLength: 21.0, scaleX: 1.228, scaleY: 1.108 },
    },
  },

  // --- C. CAMISETA BÁSQUETBOL CABALLERO (B6 HERO TANK) ---
  basketball_b6_hero: {
    title: 'Camiseta Baloncesto B6 Hero Caballero',
    category: 'tank_men',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { chestWidth: 51, totalLength: 70, shoulderStrap: 8.5, armholeDrop: 27.5, scaleX: 0.895, scaleY: 0.933 },
      S:   { chestWidth: 54, totalLength: 72.5, shoulderStrap: 9.0, armholeDrop: 28.5, scaleX: 0.947, scaleY: 0.967 },
      M:   { chestWidth: 57, totalLength: 75, shoulderStrap: 9.5, armholeDrop: 29.5, scaleX: 1.000, scaleY: 1.000 },
      L:   { chestWidth: 60.5, totalLength: 77.5, shoulderStrap: 10.0, armholeDrop: 30.5, scaleX: 1.061, scaleY: 1.033 },
      XL:  { chestWidth: 64.5, totalLength: 80.5, shoulderStrap: 10.5, armholeDrop: 31.5, scaleX: 1.132, scaleY: 1.073 },
      XXL: { chestWidth: 69, totalLength: 83.5, shoulderStrap: 11.0, armholeDrop: 32.5, scaleX: 1.211, scaleY: 1.113 },
    },
  },

  // --- D. CAMISETA BÁSQUETBOL DAMA (B7W EPIC TANK) ---
  basketball_b7w_epic_women: {
    title: 'Camiseta Baloncesto B7W Epic Dama',
    category: 'tank_women',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { chestWidth: 43, waistWidth: 39, totalLength: 64, armholeDrop: 23.5, scaleX: 0.896, scaleY: 0.941 },
      S:   { chestWidth: 45.5, waistWidth: 41.5, totalLength: 66, armholeDrop: 24.5, scaleX: 0.948, scaleY: 0.971 },
      M:   { chestWidth: 48, waistWidth: 44, totalLength: 68, armholeDrop: 25.5, scaleX: 1.000, scaleY: 1.000 },
      L:   { chestWidth: 51, waistWidth: 47, totalLength: 70, armholeDrop: 26.5, scaleX: 1.063, scaleY: 1.029 },
      XL:  { chestWidth: 54.5, waistWidth: 50.5, totalLength: 72.5, armholeDrop: 27.5, scaleX: 1.135, scaleY: 1.066 },
      XXL: { chestWidth: 58.5, waistWidth: 54.5, totalLength: 75, armholeDrop: 28.5, scaleX: 1.219, scaleY: 1.103 },
    },
  },

  // --- E. SHORT FÚTBOL MATCHDAY (FP3) ---
  football_shorts_fp3: {
    title: 'Short Fútbol FP3 Matchday',
    category: 'shorts_men',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { waistRelaxed: 34, waistStretched: 47, outseamLength: 40.5, inseamLength: 16.5, thighWidth: 32, scaleX: 0.895, scaleY: 0.931 },
      S:   { waistRelaxed: 36, waistStretched: 49.5, outseamLength: 42, inseamLength: 17.5, thighWidth: 33.5, scaleX: 0.947, scaleY: 0.966 },
      M:   { waistRelaxed: 38, waistStretched: 52, outseamLength: 43.5, inseamLength: 18.5, thighWidth: 35, scaleX: 1.000, scaleY: 1.000 },
      L:   { waistRelaxed: 40.5, waistStretched: 55, outseamLength: 45.5, inseamLength: 19.5, thighWidth: 36.5, scaleX: 1.066, scaleY: 1.046 },
      XL:  { waistRelaxed: 43.5, waistStretched: 58.5, outseamLength: 47.5, inseamLength: 20.5, thighWidth: 38.5, scaleX: 1.145, scaleY: 1.092 },
      XXL: { waistRelaxed: 47, waistStretched: 62.5, outseamLength: 49.5, inseamLength: 21.5, thighWidth: 40.5, scaleX: 1.237, scaleY: 1.138 },
    },
  },

  // --- F. SHORT BÁSQUETBOL CABALLERO (BP6 HERO) ---
  basketball_shorts_bp6: {
    title: 'Short Baloncesto BP6 Hero Caballero',
    category: 'shorts_basketball_men',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { waistRelaxed: 35, waistStretched: 49, outseamLength: 50.5, inseamLength: 24.5, thighWidth: 35.5, scaleX: 0.897, scaleY: 0.935 },
      S:   { waistRelaxed: 37.5, waistStretched: 51.5, outseamLength: 52.5, inseamLength: 25.5, thighWidth: 37, scaleX: 0.949, scaleY: 0.972 },
      M:   { waistRelaxed: 39.5, waistStretched: 54, outseamLength: 54, inseamLength: 26.5, thighWidth: 38.5, scaleX: 1.000, scaleY: 1.000 },
      L:   { waistRelaxed: 42, waistStretched: 57, outseamLength: 56, inseamLength: 27.5, thighWidth: 40.5, scaleX: 1.063, scaleY: 1.037 },
      XL:  { waistRelaxed: 45, waistStretched: 60.5, outseamLength: 58, inseamLength: 28.5, thighWidth: 42.5, scaleX: 1.139, scaleY: 1.074 },
      XXL: { waistRelaxed: 48.5, waistStretched: 64.5, outseamLength: 60.5, inseamLength: 29.5, thighWidth: 45, scaleX: 1.228, scaleY: 1.120 },
    },
  },

  // --- G. SHORT BÁSQUETBOL DAMA (BP7W EPIC) ---
  basketball_shorts_bp7w_women: {
    title: 'Short Baloncesto BP7W Epic Dama',
    category: 'shorts_basketball_women',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { waistRelaxed: 32.5, waistStretched: 45, outseamLength: 42.5, inseamLength: 19.5, hipWidth: 47, scaleX: 0.890, scaleY: 0.934 },
      S:   { waistRelaxed: 34.5, waistStretched: 47.5, outseamLength: 44, inseamLength: 20.5, hipWidth: 49.5, scaleX: 0.945, scaleY: 0.967 },
      M:   { waistRelaxed: 36.5, waistStretched: 50, outseamLength: 45.5, inseamLength: 21.5, hipWidth: 52, scaleX: 1.000, scaleY: 1.000 },
      L:   { waistRelaxed: 39, waistStretched: 53, outseamLength: 47, inseamLength: 22.5, hipWidth: 55, scaleX: 1.068, scaleY: 1.033 },
      XL:  { waistRelaxed: 42, waistStretched: 56.5, outseamLength: 49, inseamLength: 23.5, hipWidth: 58.5, scaleX: 1.151, scaleY: 1.077 },
      XXL: { waistRelaxed: 45.5, waistStretched: 60.5, outseamLength: 51, inseamLength: 24.5, hipWidth: 62.5, scaleX: 1.247, scaleY: 1.121 },
    },
  },

  // --- H. CHAQUETAS SOFTSHELL (601M & 601W) ---
  jacket_softshell_601m_men: {
    title: 'Chaqueta Softshell J5 Pro Caballero',
    category: 'jacket_men',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { chestWidth: 51, totalLength: 68, sleeveLength: 64, scaleX: 0.911, scaleY: 0.944 },
      S:   { chestWidth: 53.5, totalLength: 70, sleeveLength: 65.5, scaleX: 0.955, scaleY: 0.972 },
      M:   { chestWidth: 56, totalLength: 72, sleeveLength: 67, scaleX: 1.000, scaleY: 1.000 },
      L:   { chestWidth: 59, totalLength: 74, sleeveLength: 68.5, scaleX: 1.054, scaleY: 1.028 },
      XL:  { chestWidth: 62.5, totalLength: 76.5, sleeveLength: 70, scaleX: 1.116, scaleY: 1.063 },
      XXL: { chestWidth: 66.5, totalLength: 79, sleeveLength: 71.5, scaleX: 1.188, scaleY: 1.097 },
    },
  },

  jacket_softshell_601w_women: {
    title: 'Chaqueta Softshell J5W Pro Dama',
    category: 'jacket_women',
    unit: 'cm',
    baseSize: 'M',
    measurements: {
      XS:  { chestWidth: 46, waistWidth: 41, totalLength: 63, sleeveLength: 60, scaleX: 0.902, scaleY: 0.940 },
      S:   { chestWidth: 48.5, waistWidth: 43.5, totalLength: 65, sleeveLength: 61.5, scaleX: 0.951, scaleY: 0.970 },
      M:   { chestWidth: 51, waistWidth: 46, totalLength: 67, sleeveLength: 63, scaleX: 1.000, scaleY: 1.000 },
      L:   { chestWidth: 54, waistWidth: 49, totalLength: 69, sleeveLength: 64.5, scaleX: 1.059, scaleY: 1.030 },
      XL:  { chestWidth: 57.5, waistWidth: 52.5, totalLength: 71.5, sleeveLength: 66, scaleX: 1.127, scaleY: 1.067 },
      XXL: { chestWidth: 61.5, waistWidth: 56.5, totalLength: 74, sleeveLength: 67.5, scaleX: 1.206, scaleY: 1.104 },
    },
  },
};

// ============================================================================
// 2. OBTENCIÓN DE ESCALAS Y DATOS DE GRADUACIÓN
// ============================================================================

export function getGarmentGradingData(productModelId, size = 'M') {
  const chart = GARMENT_SIZE_CHARTS[productModelId] || GARMENT_SIZE_CHARTS.futbol_jersey_pro_vneck;
  const upperSize = String(size || 'M').toUpperCase();
  const validSize = GRADING_SIZES.includes(upperSize) ? upperSize : 'M';
  const data = chart.measurements[validSize] || chart.measurements.M;

  return {
    productModelId,
    title: chart.title,
    size: validSize,
    baseSize: chart.baseSize,
    scaleX: data.scaleX,
    scaleY: data.scaleY,
    scaleArea: +(data.scaleX * data.scaleY).toFixed(3),
    measurements: data,
    unit: chart.unit,
  };
}

// ============================================================================
// 3. GENERADOR DE SELLO INDUSTRIAL DINÁMICO DE TALLA (SIZE XS/S/M/L/XL/XXL)
// ============================================================================

export function generateDynamicSizeBadgeSvg(size = 'M', x = 3340, y = 160) {
  const upperSize = String(size || 'M').toUpperCase();
  const validSize = GRADING_SIZES.includes(upperSize) ? upperSize : 'M';

  // Sello dorado 5 estrellas con tipografía atlética bold y contraste nítido
  return `
    <g id="MARK_DYNAMIC_SIZE_BADGE" transform="translate(${x - 3340}, ${y - 160})">
      <!-- Texto SIZE -->
      <text x="3340" y="125" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="28" fill="#FACC15" letter-spacing="4">SIZE</text>
      <!-- Letra de Talla Gigante Dinámica -->
      <text x="3340" y="240" text-anchor="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="${validSize.length > 2 ? '78' : '96'}" fill="#EAB308" stroke="#0F172A" stroke-width="4" paint-order="stroke fill">${validSize}</text>
      <!-- 5 Estrellas Doradas de Calidad de Confección -->
      <g fill="#FDE047" stroke="#CA8A04" stroke-width="0.8">
        <polygon points="3282,284 3280,279 3278,284 3273,284 3277,287 3275,292 3280,289 3285,292 3283,287 3287,284" />
        <polygon points="3312,284 3310,279 3308,284 3303,284 3307,287 3305,292 3310,289 3315,292 3313,287 3317,284" />
        <polygon points="3342,284 3340,279 3338,284 3333,284 3337,287 3335,292 3340,289 3345,292 3343,287 3347,284" />
        <polygon points="3372,284 3370,279 3368,284 3363,284 3367,287 3365,292 3370,289 3375,292 3373,287 3377,284" />
        <polygon points="3402,284 3400,279 3398,284 3393,284 3397,287 3395,292 3400,289 3405,292 3403,287 3407,284" />
      </g>
      <!-- Subtítulo de Especificación Técnica -->
      <text x="3340" y="315" text-anchor="middle" font-family="'Arial', sans-serif" font-weight="700" font-size="13" fill="#64748B" letter-spacing="1">PATRÓN INDUSTRIAL ESCALADO 1:1</text>
    </g>
  `;
}

// ============================================================================
// 4. ACTUALIZADOR INTELIGENTE DE ETIQUETAS DE TALLA EN EL PLIEGO SVG
// ============================================================================

/**
 * Reemplaza de forma segura todas las referencias textuales de "TALLA M" en el SVG
 * por la talla activa seleccionada (XS, S, M, L, XL, XXL) e inyecta el sello dinámico.
 */
export function updatePliegoSizeLabels(svgString, targetSize = 'M', productModelId = 'futbol_jersey_pro_vneck') {
  if (!svgString) return '';
  const upperSize = String(targetSize || 'M').toUpperCase();
  const validSize = GRADING_SIZES.includes(upperSize) ? upperSize : 'M';

  let updated = svgString;

  // 1. Reemplazar tags de piezas: `TALLA M` -> `TALLA ${validSize}`
  updated = updated.replace(/•\s*TALLA\s+[A-Z0-9]+/gi, `• TALLA ${validSize}`);
  updated = updated.replace(/·\s*TALLA\s+[A-Z0-9]+/gi, `· TALLA ${validSize}`);
  updated = updated.replace(/TALLA\s+M\s*\]/gi, `TALLA ${validSize} ]`);
  updated = updated.replace(/TALLA\s+MUESTRA:\s*[A-Z0-9]+/gi, `TALLA MUESTRA: ${validSize}`);

  // 2. Reemplazar o actualizar el sello superior SIZE M
  const dynamicBadge = generateDynamicSizeBadgeSvg(validSize);
  if (updated.includes('id="MARK_SIZE_M_PREMIUM"')) {
    updated = updated.replace(
      /<g id="MARK_SIZE_M_PREMIUM">[\s\S]*?<\/g>\s*<\/g>/i,
      `<g id="MARK_SIZE_M_PREMIUM">${dynamicBadge}</g>`
    );
  } else if (updated.includes('id="MARK_DYNAMIC_SIZE_BADGE"')) {
    updated = updated.replace(
      /<g id="MARK_DYNAMIC_SIZE_BADGE"[\s\S]*?<\/g>\s*<\/g>/i,
      dynamicBadge
    );
  }

  return updated;
}
