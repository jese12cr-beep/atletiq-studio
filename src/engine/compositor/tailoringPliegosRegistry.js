/**
 * ATLETIQ — tailoringPliegosRegistry.js
 * Registro Maestro de Moldes y Pliegos Industriales de Confección 2D (Escala 1:1)
 *
 * Contiene la geometría exacta de corte, costura y sangrado (bleed) para:
 * 1. Camiseta Fútbol F3 Matchday Caballero (`futbol_jersey_pro_vneck`)
 * 2. Playera Fútbol F3W Dama Entallada (`futbol_jersey_f3w_women`)
 * 3. Short Fútbol FP3 Matchday (`football_shorts_fp3`)
 * 4. Camiseta Básquetbol B6 Hero Caballero (`basketball_b6_hero`)
 * 5. Camiseta Básquetbol B7W Epic Dama (`basketball_b7w_epic_women`)
 * 6. Short Básquetbol BP6 Hero Caballero (`basketball_shorts_bp6`)
 * 7. Short Básquetbol BP7W Epic Dama (`basketball_shorts_bp7w_women`)
 * 8. Chaquetas Softshell J5 Pro (`jacket_softshell_601m_men` / `601w`)
 */

import {
  getGarmentGradingData,
  generateDynamicSizeBadgeSvg,
  GRADING_SIZES,
} from './patternGradingEngine';

const MOLD_VIEWBOX = '0 0 4400 3800';

const MOLD_STYLE = `
  .st0 { fill: #333333; }
  .st1 { stroke: #010101; fill: none; stroke-miterlimit: 10; }
  .st2 { fill: none; }
  .st3 { stroke: #1d1d1b; fill: none; stroke-miterlimit: 10; }
  .st4 { fill: #ffed00; }
  .st5 { fill: #009fe3; }
  .st6 { fill: #5e4b14; }
  .st7 { fill: #4d4d4d; }
  .st8 { fill: #e6007e; }
  .st9 { fill: #f6e81d; }
  .st10 { fill: #f6ee8d; }
  .st11 { fill: #616160; }
`;

const MOLD_BACKGROUND_MARKS = `
    <!-- 1. ICONO Y TEXTO: SCALE 1:1 -->
    <g id="MARK_SCALE" transform="translate(120, 360)">
      <g>
        <path class="st0" d="M694.96,3313.86c2.14,1.15,5.5,2.25,8.95,2.25,3.71,0,5.68-1.54,5.68-3.89,0-2.2-1.7-3.49-5.98-5-5.96-2.11-9.85-5.36-9.85-10.57,0-6.09,5.11-10.72,13.51-10.72,4.07,0,7.01.8,9.12,1.79l-1.79,6.48c-1.41-.68-3.98-1.7-7.45-1.7s-5.2,1.63-5.2,3.46c0,2.27,1.98,3.27,6.61,5.02,6.33,2.36,9.26,5.65,9.26,10.69,0,5.97-4.57,11.09-14.4,11.09-4.05,0-8.1-1.11-10.09-2.22L694.96,3313.86Z"/>
        <path class="st0" d="M750.21,3321.22c-1.45.71-4.83,1.54-9.13,1.54-12.37,0-18.75-7.73-18.75-17.91,0-12.18,8.73-18.92,19.51-18.92,4.2,0,7.39.81,8.8,1.58l-1.65,6.38c-1.61-.7-3.9-1.34-6.79-1.34-6.37,0-11.36,3.89-11.36,11.83,0,7.16,4.22,11.66,11.41,11.66,2.48,0,5.15-.49,6.75-1.16L750.21,3321.22Z"/>
        <path class="st0" d="M765.36,3313.03l-2.52,9.17h-8.35l10.9-35.72h10.56l11.12,35.72h-8.7l-2.74-9.17H765.36ZM774.43,3307.01l-2.22-7.59c-.62-2.11-1.25-4.79-1.8-6.88h-.11c-.53,2.1-1.06,4.82-1.64,6.89l-2.13,7.58H774.43Z"/>
        <path class="st0" d="M792.25,3286.48h8.07v28.95h14.22v6.77h-22.29V3286.48Z"/>
        <path class="st0" d="M841.32,3307.09h-13.14v8.49h14.69v6.62h-22.77v-35.72h22.01v6.62h-13.93v7.44h13.14V3307.09Z"/>
        <path class="st0" d="M871.27,3294.93h-.1l-6.55,3.11-1.34-6.04,9.14-4.25h6.65v34.45h-7.8V3294.93Z"/>
        <path class="st0" d="M889.02,3300.82c0-2.82,1.95-4.85,4.74-4.85s4.68,1.98,4.71,4.85c0,2.79-1.87,4.83-4.73,4.83S889.02,3303.61,889.02,3300.82ZM889.02,3317.95c0-2.82,1.95-4.86,4.74-4.86s4.68,1.98,4.71,4.86c0,2.78-1.87,4.83-4.73,4.83S889.02,3320.73,889.02,3317.95Z"/>
        <path class="st0" d="M916.61,3294.93h-.1l-6.55,3.11-1.33-6.04,9.13-4.25h6.65v34.45h-7.8V3294.93Z"/>
      </g>
      <g>
        <path class="st0" d="M642.45,3269.93h-43.53c-8.07,0-14.63,6.57-14.63,14.63v43.53c0,8.07,6.56,14.63,14.63,14.63h43.53c8.06,0,14.62-6.56,14.62-14.63v-43.53C657.07,3276.5,650.51,3269.93,642.45,3269.93ZM651.07,3328.09c0,4.76-3.87,8.63-8.62,8.63h-43.53c-4.76,0-8.63-3.87-8.63-8.63v-43.53c0-4.76,3.87-8.63,8.63-8.63h43.53c4.75,0,8.62,3.87,8.62,8.63V3328.09Z"/>
        <path class="st0" d="M639.65,3285.48h-18.41c-1.65,0-3,1.34-3,3s1.35,3,3,3h11.17l-26.58,26.58v-11.17c0-1.66-1.34-3-3-3s-3,1.34-3,3v18.41c0,1.66,1.35,3,3,3h18.41c1.66,0,3-1.34,3-3s-1.34-3-3-3h-11.16l26.57-26.58v11.17c0,1.66,1.35,3,3,3s3-1.34,3-3v-18.41C642.65,3286.82,641.31,3285.48,639.65,3285.48Z"/>
      </g>
    </g>

    <!-- 2. ICONO Y TEXTO: CMYK COLOR -->
    <g id="MARK_CMYK" transform="translate(500, 360)">
      <g>
        <path class="st0" d="M1696.11,3310.12q-.59,3.02-1.86,5.45t-3.21,4.19-4.47,2.71-5.62.95q-3.45,0-6.44-1.17-3-1.16-5.17-3.5-2.17-2.33-3.42-5.75-1.24-3.41-1.24-7.97,0-4.46,1.14-8.03,1.14-3.58,3.26-6.04,2.12-2.47,5.16-3.79,3.05-1.33,6.81-1.33,3.29,0,5.97.98,2.67.98,4.61,2.71,1.93,1.72,3.07,4.05,1.14,2.33,1.41,4.98h-7.37q-.74-3.02-2.86-4.69-2.12-1.67-4.77-1.67-4.61,0-6.79,3.31-2.17,3.32-2.17,9.09,0,5.89,2.15,9.15,2.14,3.26,6.44,3.26,3.28,0,5.27-1.78,1.99-1.77,2.73-5.11H1696.11Z"/>
        <path class="st0" d="M1726.62,3322.2v-24.12l-6.57,24.12h-7.31l-6.52-24.01v24.01h-6.84v-35.19h10.81l6.36,25.81,6.36-25.81h10.6v35.19H1726.62Z"/>
        <path class="st0" d="M1748.57,3322.2v-13.3l-12.19-21.89h8.59l7.42,14.31,6.84-14.31h8.48l-11.77,21.99v13.2H1748.57Z"/>
      </g>
    </g>
`;

// ============================================================================
// 1. GEOMETRÍAS Y TRAZOS MAESTROS DE PIEZAS POR PRENDA
// ============================================================================

export const TAILORING_GARMENT_SPECS = {
  // --- A. FÚTBOL CABALLERO (F3) ---
  futbol_jersey_pro_vneck: {
    title: 'Camiseta Fútbol F3 Matchday (Caballero)',
    cutCode: '204m_Basic_KA',
    category: 'jersey',
    pieces: [
      { id: 'front', name: 'Delantero / Frente', tag: '[ 1. FRENTE • CABALLERO ]', panel: 'front' },
      { id: 'back', name: 'Trasero / Espalda', tag: '[ 2. ESPALDA • CABALLERO ]', panel: 'back' },
      { id: 'collar', name: 'Tira de Cuello V', tag: '[ 3. CUELLO EN V ]', panel: 'collar' },
      { id: 'left_sleeve', name: 'Manga Izquierda', tag: '[ 4. MANGA IZQUIERDA ]', panel: 'left_sleeve' },
      { id: 'right_sleeve', name: 'Manga Derecha', tag: '[ 5. MANGA DERECHA ]', panel: 'right_sleeve' },
    ],
  },

  // --- B. PLAYERA FÚTBOL DAMA ENTALLADA (F3W) ---
  futbol_jersey_f3w_women: {
    title: 'Playera Fútbol F3W Dama Entallada',
    cutCode: '204w_Basic_KA',
    category: 'jersey',
    pieces: [
      { id: 'front', name: 'Delantero Silueta Princesa', tag: '[ 1. FRENTE ENTALLADO DAMA ]', panel: 'front' },
      { id: 'back', name: 'Trasero Anatómico', tag: '[ 2. ESPALDA ENTALLADA DAMA ]', panel: 'back' },
      { id: 'collar', name: 'Cuello V Femenino', tag: '[ 3. CUELLO EN V DAMA ]', panel: 'collar' },
      { id: 'left_sleeve', name: 'Manga Corta Dama Izq', tag: '[ 4. MANGA CORTA DAMA IZQ ]', panel: 'left_sleeve' },
      { id: 'right_sleeve', name: 'Manga Corta Dama Der', tag: '[ 5. MANGA CORTA DAMA DER ]', panel: 'right_sleeve' },
    ],
  },

  // --- C. SHORT FÚTBOL FP3 MATCHDAY ---
  football_shorts_fp3: {
    title: 'Short Fútbol FP3 Matchday',
    cutCode: '303m_Basic',
    category: 'shorts',
    pieces: [
      { id: 'left_leg', name: 'Pierna Izquierda', tag: '[ 1. PIERNA IZQUIERDA ]', panel: 'left_leg' },
      { id: 'right_leg', name: 'Pierna Derecha', tag: '[ 2. PIERNA DERECHA ]', panel: 'right_leg' },
      { id: 'waistband', name: 'Pretina Elástica', tag: '[ 3. PRETINA CONFECCIÓN ]', panel: 'waistband' },
    ],
  },

  // --- D. CAMISETA BÁSQUETBOL B6 HERO CABALLERO ---
  basketball_b6_hero: {
    title: 'Camiseta Baloncesto B6 Hero (Caballero)',
    cutCode: '222m-Hero',
    category: 'tank',
    pieces: [
      { id: 'front', name: 'Delantero Tank Sisa Americana', tag: '[ 1. FRENTE TANK CABALLERO ]', panel: 'front' },
      { id: 'back', name: 'Espalda Atlética Racerback', tag: '[ 2. ESPALDA TANK CABALLERO ]', panel: 'back' },
      { id: 'collar', name: 'Ribete Escote Cuello', tag: '[ 3. RIBETE CUELLO CANALÉ ]', panel: 'collar' },
      { id: 'left_armhole', name: 'Ribete Sisa Izquierda', tag: '[ 4. RIBETE SISA IZQUIERDA ]', panel: 'left_sleeve' },
      { id: 'right_armhole', name: 'Ribete Sisa Derecha', tag: '[ 5. RIBETE SISA DERECHA ]', panel: 'right_sleeve' },
    ],
  },

  // --- E. CAMISETA BÁSQUETBOL B7W EPIC DAMA ---
  basketball_b7w_epic_women: {
    title: 'Camiseta Baloncesto B7W Epic (Dama)',
    cutCode: '222w-Epic',
    category: 'tank_women',
    pieces: [
      { id: 'front', name: 'Delantero Tank Entallado Dama', tag: '[ 1. FRENTE TANK DAMA ]', panel: 'front' },
      { id: 'back', name: 'Espalda Contorneada Dama', tag: '[ 2. ESPALDA TANK DAMA ]', panel: 'back' },
      { id: 'left_side', name: 'Panel Lateral Ergonómico Izq', tag: '[ 3. PANEL LATERAL IZQ ]', panel: 'left_side' },
      { id: 'right_side', name: 'Panel Lateral Ergonómico Der', tag: '[ 4. PANEL LATERAL DER ]', panel: 'right_side' },
      { id: 'collar', name: 'Ribete Escote Dama', tag: '[ 5. RIBETE CUELLO DAMA ]', panel: 'collar' },
      { id: 'left_armhole', name: 'Ribete Sisa Izquierda', tag: '[ 6. RIBETE SISA IZQ ]', panel: 'left_sleeve' },
      { id: 'right_armhole', name: 'Ribete Sisa Derecha', tag: '[ 7. RIBETE SISA DER ]', panel: 'right_sleeve' },
    ],
  },

  // --- F. SHORT BÁSQUETBOL BP6 HERO CABALLERO ---
  basketball_shorts_bp6: {
    title: 'Short Baloncesto BP6 Hero (Caballero)',
    cutCode: '313m-ENB',
    category: 'shorts_basketball',
    pieces: [
      { id: 'left_leg', name: 'Pierna Izq Amplia con Abertura', tag: '[ 1. PIERNA IZQUIERDA BASKET ]', panel: 'left_leg' },
      { id: 'right_leg', name: 'Pierna Der Amplia con Abertura', tag: '[ 2. PIERNA DERECHA BASKET ]', panel: 'right_leg' },
      { id: 'waistband', name: 'Pretina Ancha para Cordón', tag: '[ 3. PRETINA ANCHA BASKET ]', panel: 'waistband' },
    ],
  },

  // --- G. SHORT BÁSQUETBOL BP7W EPIC DAMA ---
  basketball_shorts_bp7w_women: {
    title: 'Short Baloncesto BP7W Epic (Dama)',
    cutCode: '313w-STS',
    category: 'shorts_basketball_women',
    pieces: [
      { id: 'left_front', name: 'Delantero Izquierdo Dama', tag: '[ 1. DELANTERO IZQ DAMA ]', panel: 'left_front' },
      { id: 'right_front', name: 'Delantero Derecho Dama', tag: '[ 2. DELANTERO DER DAMA ]', panel: 'right_front' },
      { id: 'left_back', name: 'Trasero Izquierdo Dama', tag: '[ 3. TRASERO IZQ DAMA ]', panel: 'left_back' },
      { id: 'right_back', name: 'Trasero Derecho Dama', tag: '[ 4. TRASERO DER DAMA ]', panel: 'right_back' },
      { id: 'left_stripe', name: 'Banda Lateral Izquierda', tag: '[ 5. BANDA LATERAL IZQ ]', panel: 'left_stripe' },
      { id: 'right_stripe', name: 'Banda Lateral Derecha', tag: '[ 6. BANDA LATERAL DER ]', panel: 'right_stripe' },
      { id: 'waistband', name: 'Pretina Anatómica Dama', tag: '[ 7. PRETINA DAMA ]', panel: 'waistband' },
    ],
  },

  // --- H. CHAQUETAS SOFTSHELL 601M & 601W ---
  jacket_softshell_601m_men: {
    title: 'Chaqueta Softshell J5 Pro (Caballero)',
    cutCode: 'CUT_601M',
    category: 'jacket',
    pieces: [
      { id: 'front_left', name: 'Frente Delantero Izquierdo con Cierre', tag: '[ 1. FRENTE IZQ CIERRE ]', panel: 'front_left' },
      { id: 'front_right', name: 'Frente Delantero Derecho con Cierre', tag: '[ 2. FRENTE DER CIERRE ]', panel: 'front_right' },
      { id: 'back', name: 'Trasero Chaqueta Cortaviento', tag: '[ 3. TRASERO SOFTSHELL ]', panel: 'back' },
      { id: 'left_sleeve', name: 'Manga Larga Izquierda', tag: '[ 4. MANGA LARGA IZQ ]', panel: 'left_sleeve' },
      { id: 'right_sleeve', name: 'Manga Larga Derecha', tag: '[ 5. MANGA LARGA DER ]', panel: 'right_sleeve' },
      { id: 'collar_ext', name: 'Cuello Alto Exterior', tag: '[ 6. CUELLO ALTO EXTERIOR ]', panel: 'collar_ext' },
    ],
  },

  jacket_softshell_601w_women: {
    title: 'Chaqueta Softshell J5W Pro (Dama)',
    cutCode: 'CUT_601W',
    category: 'jacket',
    pieces: [
      { id: 'front_left', name: 'Frente Izq Entallado Dama', tag: '[ 1. FRENTE IZQ DAMA ]', panel: 'front_left' },
      { id: 'front_right', name: 'Frente Der Entallado Dama', tag: '[ 2. FRENTE DER DAMA ]', panel: 'front_right' },
      { id: 'back', name: 'Trasero Entallado Dama', tag: '[ 3. TRASERO DAMA ]', panel: 'back' },
      { id: 'left_sleeve', name: 'Manga Larga Dama Izq', tag: '[ 4. MANGA LARGA DAMA IZQ ]', panel: 'left_sleeve' },
      { id: 'right_sleeve', name: 'Manga Larga Dama Der', tag: '[ 5. MANGA LARGA DAMA DER ]', panel: 'right_sleeve' },
      { id: 'collar_ext', name: 'Cuello Alto Dama', tag: '[ 6. CUELLO ALTO DAMA ]', panel: 'collar_ext' },
    ],
  },
};

// ============================================================================
// 2. PATHS VECTORIALES DE CORTE INDUSTRIAL POR PRENDA
// ============================================================================

export const TAILORING_SVG_PATHS = {
  // FÚTBOL CABALLERO
  futbol_jersey_pro_vneck: {
    frente: 'M1696.25,1839.99c-115.97-72.21-137.49-188.38-145.49-315.14-6.82-121.39,16.51-249.79,59.6-363.19l-412.37-122.53c-3.95,79.49-28.89,164.03-73.84,230.11-25.15,36.14-56.09,67-92.41,89.5-50.93,31.55-115.47,31.55-166.39,0-36.32-22.5-67.26-53.36-92.42-89.5-44.94-66.08-69.89-150.62-73.84-230.11l-412.37,122.53c43.09,113.4,66.42,241.8,59.6,363.19-8,126.76-29.51,242.93-145.49,315.14l-1.13,1358.15c237.54,7.64,511.01,6.93,748.84,6.91,237.83.02,511.3.73,748.84-6.91L1696.25,1839.99Z',
    trasero: 'M3342.55,1839.49c-120.49-74.57-145.36-205.39-138.05-337.6,8.42-122,26.92-247.98,57.83-366.38l-402.45-119.69c-32.38,42.84-72.11,90.62-122.03,113.24-42.57,18.25-97.01,28.35-143.12,30.47-46.11-2.12-100.55-12.22-143.11-30.47-49.93-22.62-89.66-70.4-122.03-113.24l-402.45,119.69c30.9,118.4,49.4,244.38,57.82,366.38,7.31,132.21-17.56,263.03-138.04,337.6l-1.07,1358.15,150.24,4.33c152.53,2.95,335.49,2.65,487.7,3.26h221.88c152.11-.61,335.3-.31,487.7-3.26l150.24-4.33L3342.55,1839.49Z',
    manga_izq: 'M1586.97,570.15l-25.72-10.63c-90.79-39.97-162.57-120.95-230.88-190.21-31.3-34.56-70.93-78.58-109.78-104.45-78.16-53.54-178.63-72.06-272.05-67.97-93.42-4.09-193.89,14.43-272.05,67.97-38.84,25.87-78.48,69.89-109.78,104.45-68.31,69.26-140.09,150.24-230.88,190.21l-25.72,10.63c36.15,43.9,58.86,103.48,78.87,156.04,11.56,30.09,24.45,72.15,31.54,103.61l-10.63,52.87h1077.3l-10.63-52.87c7.09-31.46,19.98-73.52,31.54-103.61C1528.11,673.63,1550.83,614.05,1586.97,570.15Z',
    manga_der: 'M3233.16,570.15l-25.72-10.63c-90.79-39.97-162.57-120.95-230.88-190.21-31.3-34.56-70.93-78.58-109.78-104.45-78.16-53.54-178.63-72.06-272.05-67.97-93.42-4.09-193.89,14.43-272.05,67.97-38.84,25.87-78.48,69.89-109.78,104.45-68.31,69.26-140.09,150.24-230.88,190.21l-25.72,10.63c36.15,43.9,58.86,103.48,78.87,156.04,11.56,30.09,24.45,72.15,31.54,103.61l-10.63,52.87h1077.3l-10.63-52.87c7.09-31.46,19.98-73.52,31.54-103.61C3174.3,673.63,3197.02,614.05,3233.16,570.15Z',
    cuello: 'M1700,200 h140 v1400 h-140 Z',
  },

  // PLAYERA FÚTBOL DAMA (Corte Princesa / Reloj de Arena con Sisa y Cuello V Estilizado)
  futbol_jersey_f3w_women: {
    frente: 'M1640,1839.99c-100-60-120-170-130-290-6-115,15-230,55-340l-370-115c-35,70-55,150-70,210-25,35-50,65-85,85-45,30-105,30-150,0-35-20-60-50-85-85-15-60-35-140-70-210l-370,115c40,110,60,225,55,340-10,120-30,230-130,290l10,650c40,80,110,150,180,180,150,30,450,25,600,25s450,5,600-25c70-30,140-100,180-180l10-650Z',
    trasero: 'M3290,1839.49c-110-65-130-190-125-315,7-115,25-235,50-345l-360-110c-30,40-65,85-110,105-40,17-90,26-135,28-45-2-95-11-135-28-45-20-80-65-110-105l-360,110c25,110,43,230,50,345,5,125-15,250-125,315l10,650c40,80,110,150,180,180,150,30,450,25,600,25s450,5,600-25c70-30,140-100,180-180l10-650Z',
    manga_izq: 'M1540,550l-25-10c-80-35-145-105-205-165-28-30-65-70-98-90-70-45-160-65-245-60-85-5-175,15-245,60-33,20-70,60-98,90-60,60-125,130-205,165l-25,10c30,38,50,90,68,135,10,25,20,60,28,88l-8,45h960l-8-45c8-28,18-63,28-88C1490,640,1510,588,1540,550Z',
    manga_der: 'M3190,550l-25-10c-80-35-145-105-205-165-28-30-65-70-98-90-70-45-160-65-245-60-85-5-175,15-245,60-33,20-70,60-98,90-60,60-125,130-205,165l-25,10c30,38,50,90,68,135,10,25,20,60,28,88l-8,45h960l-8-45c8-28,18-63,28-88C3140,640,3160,588,3190,550Z',
    cuello: 'M1700,250 h120 v1300 h-120 Z',
  },

  // SHORT FÚTBOL FP3 MATCHDAY (Delantero y Trasero Anatómico con Tiro Profundo)
  football_shorts_fp3: {
    pierna_izq: 'M250,900 C350,850 650,830 850,830 C1050,830 1350,850 1450,900 L1550,1500 C1570,1950 1520,2400 1480,2850 C1250,2870 950,2880 750,2880 C550,2880 250,2870 180,2850 C210,2350 210,1850 250,900 Z',
    pierna_der: 'M1950,900 C2050,850 2350,830 2550,830 C2750,830 3050,850 3150,900 L3250,1500 C3270,1950 3220,2400 3180,2850 C2950,2870 2650,2880 2450,2880 C2250,2880 1950,2870 1880,2850 C1910,2350 1910,1850 1950,900 Z',
    pretina: 'M250,300 h3000 v350 h-3000 Z',
  },

  // BÁSQUETBOL B6 HERO CABALLERO (Tank Top con Sisa Americana Atlética y Escote Bajo)
  basketball_b6_hero: {
    frente: 'M1680,1800 C1550,1720 1520,1580 1510,1400 C1500,1200 1540,950 1580,750 L1250,650 C1220,780 1150,920 1050,980 C950,1030 850,1030 750,980 C650,920 580,780 550,650 L220,750 C260,950 300,1200 290,1400 C280,1580 250,1720 120,1800 L150,3200 C500,3220 1300,3220 1650,3200 Z',
    trasero: 'M3380,1800 C3250,1720 3220,1580 3210,1400 C3200,1200 3240,950 3280,750 L2950,650 C2900,750 2820,850 2700,890 C2600,920 2500,920 2400,890 C2280,850 2200,750 2150,650 L1820,750 C1860,950 1900,1200 1890,1400 C1880,1580 1850,1720 1720,1800 L1750,3200 C2100,3220 2900,3220 3350,3200 Z',
    ribete_cuello: 'M1680,100 h160 v1500 h-160 Z',
    ribete_sisa_izq: 'M350,150 h120 v450 h-120 Z',
    ribete_sisa_der: 'M2050,150 h120 v450 h-120 Z',
  },

  // BÁSQUETBOL B7W EPIC DAMA (Tank Entallado con Paneles Laterales Curvos)
  basketball_b7w_epic_women: {
    frente: 'M1600,1750 C1500,1650 1480,1500 1470,1350 C1460,1180 1500,980 1530,780 L1240,680 C1200,800 1130,900 1030,960 C930,1010 830,1010 730,960 C630,900 560,800 520,680 L230,780 C260,980 300,1180 290,1350 C280,1500 260,1650 160,1750 L190,2650 C280,2850 480,3100 880,3100 C1280,3100 1480,2850 1570,2650 Z',
    trasero: 'M3300,1750 C3200,1650 3180,1500 3170,1350 C3160,1180 3200,980 3230,780 L2940,680 C2880,780 2800,860 2700,900 C2600,930 2500,930 2400,900 C2300,860 2220,780 2160,680 L1870,780 C1900,980 1940,1180 1930,1350 C1920,1500 1900,1650 1800,1750 L1830,2650 C1920,2850 2120,3100 2520,3100 C2920,3100 3120,2850 3210,2650 Z',
    lateral_izq: 'M300,150 C360,200 370,400 350,600 L320,600 C340,400 330,200 270,150 Z',
    lateral_der: 'M1800,150 C1860,200 1870,400 1850,600 L1820,600 C1840,400 1830,200 1770,150 Z',
    ribete_cuello: 'M1680,120 h140 v1400 h-140 Z',
  },

  // SHORT BÁSQUETBOL BP6 CABALLERO (Pierna Larga Holgada con Abertura Inferior)
  basketball_shorts_bp6: {
    pierna_izq: 'M200,850 C350,800 650,780 850,780 C1050,780 1350,800 1500,850 L1620,1500 C1650,2100 1620,2600 1580,3150 C1300,3180 950,3200 750,3200 C550,3200 200,3180 120,3150 C160,2600 150,2100 200,850 Z',
    pierna_der: 'M1900,850 C2050,800 2350,780 2550,780 C2750,780 3050,800 3200,850 L3320,1500 C3350,2100 3320,2600 3280,3150 C3000,3180 2650,3200 2450,3200 C2250,3200 1900,3180 1820,3150 C1860,2600 1850,2100 1900,850 Z',
    pretina: 'M200,250 h3100 v400 h-3100 Z',
  },

  // SHORT BÁSQUETBOL BP7W DAMA (Corte Anatómico 4 Piezas + Bandas Laterales)
  basketball_shorts_bp7w_women: {
    delantero_izq: 'M250,850 C400,820 650,800 850,800 L950,1500 C980,2000 950,2600 900,3050 C700,3070 450,3080 300,3080 C220,2600 200,2000 250,850 Z',
    delantero_der: 'M1150,850 C1350,800 1600,820 1750,850 C1800,2000 1780,2600 1700,3080 C1550,3080 1300,3070 1100,3050 C1050,2600 1020,2000 1050,1500 Z',
    trasero_izq: 'M1950,850 C2100,820 2350,800 2550,800 L2650,1500 C2680,2000 2650,2600 2600,3050 C2400,3070 2150,3080 2000,3080 C1920,2600 1900,2000 1950,850 Z',
    trasero_der: 'M2850,850 C3050,800 3300,820 3450,850 C3500,2000 3480,2600 3400,3080 C3250,3080 3000,3070 2800,3050 C2750,2600 2720,2000 2750,1500 Z',
    banda_izq: 'M150,200 h70 v500 h-70 Z',
    banda_der: 'M1850,200 h70 v500 h-70 Z',
    pretina: 'M250,250 h3000 v350 h-3000 Z',
  },
};


export const TAILORING_PIECE_BOUNDS = {
  futbol_jersey_pro_vneck: {
    frente: { x: 199.7, y: 1039.1, width: 1497.7, height: 2165.9 },
    trasero: { x: 1845.8, y: 1015.8, width: 1497.8, height: 2189.4 },
    manga_izq: { x: 310.1, y: 196.3, width: 1276.9, height: 686.3 },
    manga_der: { x: 1956.3, y: 196.3, width: 1276.9, height: 686.3 },
    cuello: { x: 1700, y: 200, width: 140, height: 1400 },
  },
  futbol_jersey_f3w_women: {
    frente: { x: 290.0, y: 1095.0, width: 1580.0, height: 1600.3 },
    trasero: { x: 1930.0, y: 1069.5, width: 1580.0, height: 1625.3 },
    manga_izq: { x: 394.0, y: 224.3, width: 1146.0, height: 593.8 },
    manga_der: { x: 2044.0, y: 224.3, width: 1146.0, height: 593.8 },
    cuello: { x: 1700, y: 200, width: 140, height: 1400 },
  },
  football_shorts_fp3: {
    pierna_izq: { x: 178.6, y: 846.1, width: 1464.7, height: 2148.9 },
    pierna_der: { x: 1899.9, y: 846.1, width: 1464.7, height: 2148.9 },
    pretina: { x: 250, y: 250, width: 3000, height: 380 },
  },
  basketball_b6_hero: {
    frente: { x: 202.2, y: 651.9, width: 1492.6, height: 2553.1 },
    trasero: { x: 1848.5, y: 651.9, width: 1492.6, height: 2553.1 },
    cuello: { x: 1700, y: 200, width: 140, height: 1400 },
  },
  basketball_b7w_epic_women: {
    frente: { x: 280.0, y: 720.0, width: 1420.0, height: 2420.0 },
    trasero: { x: 1840.0, y: 720.0, width: 1420.0, height: 2420.0 },
    cuello: { x: 1700, y: 200, width: 140, height: 1400 },
  },
  basketball_shorts_bp6: {
    pierna_izq: { x: 165.0, y: 810.0, width: 1490.0, height: 2210.0 },
    pierna_der: { x: 1885.0, y: 810.0, width: 1490.0, height: 2210.0 },
    pretina: { x: 250, y: 250, width: 3000, height: 380 },
  },
  basketball_shorts_bp7w_women: {
    pierna_izq: { x: 210.0, y: 860.0, width: 1410.0, height: 2090.0 },
    pierna_der: { x: 1920.0, y: 860.0, width: 1410.0, height: 2090.0 },
    pretina: { x: 250, y: 250, width: 3000, height: 380 },
  },
};

// ============================================================================
// 3. GENERADOR DE SVG DEL PLIEGO INDUSTRIAL MULTI-PRENDA
// ============================================================================

export function generateGarmentTailoringSvgString(
  productModelId = 'futbol_jersey_pro_vneck',
  design = {},
  activePlayer = {},
  options = {}
) {
  const spec = TAILORING_GARMENT_SPECS[productModelId] || TAILORING_GARMENT_SPECS.futbol_jersey_pro_vneck;
  const paths = TAILORING_SVG_PATHS[productModelId] || TAILORING_SVG_PATHS.futbol_jersey_pro_vneck;
  const directTextures = options.directTextures || null;

  // Escalado anatómico de patronaje industrial
  const targetSize = options.size || activePlayer?.size || 'M';
  const grading = getGarmentGradingData(productModelId, targetSize);
  const activeSize = grading.size;
  const scaleX = grading.scaleX;
  const scaleY = grading.scaleY;

  const primaryColor = design?.colorZones?.primary?.hex || '#FFF0B5';
  const secondaryColor = design?.colorZones?.secondary?.hex || '#0A1A3A';
  const accentColor = design?.colorZones?.accent?.hex || '#DC2626';
  const collarColor = design?.colorZones?.collar?.hex || secondaryColor;
  const sleevesColor = design?.colorZones?.sleeves?.hex || primaryColor;

  const playerName = (activePlayer?.name || design?.sampleName || 'ATLETIQ').toUpperCase();
  const playerNumber = String(activePlayer?.number || design?.sampleNumber || '10');

  // Si es camiseta, playera o tank
  if (spec.category === 'jersey' || spec.category === 'tank' || spec.category === 'tank_women') {
    const isTank = spec.category.startsWith('tank');
    const fBounds = isTank 
      ? { x: 120, y: 650, width: 1560, height: 2580 }
      : { x: 190, y: 1010, width: 1540, height: 2250 };
    const bBounds = isTank
      ? { x: 1720, y: 650, width: 1660, height: 2580 }
      : { x: 1815, y: 985, width: 1540, height: 2250 };

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" viewBox="${MOLD_VIEWBOX}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <style>
      ${MOLD_STYLE}
      image { pointer-events: none; -webkit-user-drag: none; user-select: none; }
      .cut-line { stroke: #010101; stroke-width: 2.5; fill: none; stroke-miterlimit: 10; }
      .seam-line { stroke: #e11d48; stroke-width: 1.5; stroke-dasharray: 6 4; fill: none; }
      .piece-tag { font-family: 'Arial Black', sans-serif; font-size: 22px; font-weight: 900; letter-spacing: 2px; fill: #334155; }
    </style>
    <clipPath id="clip-frente">
      <path d="${paths.frente}" />
    </clipPath>
    <clipPath id="clip-trasero">
      <path d="${paths.trasero}" />
    </clipPath>
    ${paths.manga_izq ? `<clipPath id="clip-manga-izq"><path d="${paths.manga_izq}" /></clipPath>` : ''}
    ${paths.manga_der ? `<clipPath id="clip-manga-der"><path d="${paths.manga_der}" /></clipPath>` : ''}
  </defs>

  <!-- CAPA MASTER DE PATRONAJE Y MARCAS RIP 1:1 -->
  <g id="BACKGROUND">
    ${MOLD_BACKGROUND_MARKS}
    ${generateDynamicSizeBadgeSvg(activeSize, 4150, 160)}
  </g>

  <!-- CAPA DE PRODUCCIÓN TEXTIL INDUSTRIAL EN VIVO -->
  <g id="DESIGN">
    <!-- PIEZA 1: DELANTERO / FRENTE -->
    <g id="PIECE_FRENTE" transform="translate(1050, 2260) scale(${scaleX}, ${scaleY}) translate(-950, -2120)">
      <g clip-path="url(#clip-frente)">
        ${
          directTextures?.front
            ? `<image href="${directTextures.front}" xlink:href="${directTextures.front}" x="${fBounds.x}" y="${fBounds.y}" width="${fBounds.width}" height="${fBounds.height}" preserveAspectRatio="none" />`
            : `
        <rect x="0" y="0" width="3600" height="3500" fill="${primaryColor}" />
        <!-- Escudo Frontal -->
        <circle cx="1160" cy="1540" r="95" fill="${secondaryColor}" />
        <circle cx="1160" cy="1540" r="85" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="4" />
        <text x="1160" y="1550" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="32" fill="${secondaryColor}">ATLETIQ</text>
        <!-- Dorsal Pecho -->
        <text x="740" y="1620" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="120" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="10" paint-order="stroke fill">${playerNumber}</text>
        `
        }
      </g>
      <path d="${paths.frente}" class="cut-line" />
      <text x="950" y="3280" text-anchor="middle" class="piece-tag">[ 1. FRENTE • ${spec.title.toUpperCase()} • TALLA ${activeSize} ]</text>
    </g>

    <!-- PIEZA 2: TRASERO / ESPALDA -->
    <g id="PIECE_TRASERO" transform="translate(3350, 2260) scale(${scaleX}, ${scaleY}) translate(-2600, -2120)">
      <g clip-path="url(#clip-trasero)">
        ${
          directTextures?.back
            ? `<image href="${directTextures.back}" xlink:href="${directTextures.back}" x="${bBounds.x}" y="${bBounds.y}" width="${bBounds.width}" height="${bBounds.height}" preserveAspectRatio="none" />`
            : `
        <rect x="0" y="0" width="3600" height="3500" fill="${primaryColor}" />
        <!-- Nombre Jugador -->
        <text x="2600" y="1530" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="140" letter-spacing="6" fill="${secondaryColor}" stroke="#ffffff" stroke-width="12" paint-order="stroke fill">${playerName}</text>
        <!-- Dorsal Espalda Gigante -->
        <text x="2600" y="2060" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="620" fill="${secondaryColor}" stroke="#ffffff" stroke-width="30" paint-order="stroke fill">${playerNumber}</text>
        `
        }
      </g>
      <path d="${paths.trasero}" class="cut-line" />
      <text x="2600" y="3280" text-anchor="middle" class="piece-tag">[ 2. ESPALDA • ${spec.title.toUpperCase()} • TALLA ${activeSize} ]</text>
    </g>

    ${
      !isTank && paths.manga_izq
        ? `
    <!-- PIEZA 3: MANGA IZQUIERDA -->
    <g id="PIECE_MANGA_IZQUIERDA" transform="translate(1050, 520) scale(${scaleX}, ${scaleY}) translate(-950, -540)">
      <g clip-path="url(#clip-manga-izq)">
        ${
          directTextures?.left_sleeve
            ? `<image href="${directTextures.left_sleeve}" xlink:href="${directTextures.left_sleeve}" x="${(TAILORING_PIECE_BOUNDS[productModelId]?.manga_izq || { x: 310, y: 196, width: 1277, height: 686 }).x}" y="${(TAILORING_PIECE_BOUNDS[productModelId]?.manga_izq || { x: 310, y: 196, width: 1277, height: 686 }).y}" width="${(TAILORING_PIECE_BOUNDS[productModelId]?.manga_izq || { x: 310, y: 196, width: 1277, height: 686 }).width}" height="${(TAILORING_PIECE_BOUNDS[productModelId]?.manga_izq || { x: 310, y: 196, width: 1277, height: 686 }).height}" preserveAspectRatio="none" />`
            : `
        <rect x="0" y="0" width="1800" height="1000" fill="${sleevesColor}" />
        <rect x="280" y="780" width="1335" height="90" fill="${collarColor}" />
        `
        }
      </g>
      <path d="${paths.manga_izq}" class="cut-line" />
      <text x="950" y="150" text-anchor="middle" class="piece-tag">[ 3. MANGA IZQUIERDA • TALLA ${activeSize} ]</text>
    </g>

    <!-- PIEZA 4: MANGA DERECHA -->
    <g id="PIECE_MANGA_DERECHA" transform="translate(3350, 520) scale(${scaleX}, ${scaleY}) translate(-2600, -540)">
      <g clip-path="url(#clip-manga-der)">
        ${
          directTextures?.right_sleeve
            ? `<image href="${directTextures.right_sleeve}" xlink:href="${directTextures.right_sleeve}" x="${(TAILORING_PIECE_BOUNDS[productModelId]?.manga_der || { x: 1956, y: 196, width: 1277, height: 686 }).x}" y="${(TAILORING_PIECE_BOUNDS[productModelId]?.manga_der || { x: 1956, y: 196, width: 1277, height: 686 }).y}" width="${(TAILORING_PIECE_BOUNDS[productModelId]?.manga_der || { x: 1956, y: 196, width: 1277, height: 686 }).width}" height="${(TAILORING_PIECE_BOUNDS[productModelId]?.manga_der || { x: 1956, y: 196, width: 1277, height: 686 }).height}" preserveAspectRatio="none" />`
            : `
        <rect x="1800" y="0" width="1800" height="1000" fill="${sleevesColor}" />
        <rect x="1925" y="780" width="1335" height="90" fill="${collarColor}" />
        `
        }
      </g>
      <path d="${paths.manga_der}" class="cut-line" />
      <text x="2600" y="150" text-anchor="middle" class="piece-tag">[ 4. MANGA DERECHA • TALLA ${activeSize} ]</text>
    </g>
    `
        : ''
    }

    <!-- PIEZA CUELLO / RIBETES -->
    <g id="PIECE_CUELLO" transform="translate(2200, 950) scale(${scaleX}, ${scaleY}) translate(-1770, -900)">
      <rect x="1700" y="200" width="140" height="1400" fill="${collarColor}" class="cut-line" />
      <text x="1770" y="900" text-anchor="middle" transform="rotate(-90 1770 900)" class="piece-tag">[ CUELLO / RIBETE • TALLA ${activeSize} ]</text>
    </g>
  </g>
</svg>`;
  }

  // Si es short (Fútbol o Básquetbol)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" viewBox="${MOLD_VIEWBOX}" preserveAspectRatio="xMidYMid meet">
  <defs>
    <style>
      ${MOLD_STYLE}
      .cut-line { stroke: #010101; stroke-width: 2.5; fill: none; stroke-miterlimit: 10; }
      .piece-tag { font-family: 'Arial Black', sans-serif; font-size: 22px; font-weight: 900; letter-spacing: 2px; fill: #334155; }
    </style>
    <clipPath id="clip-pierna-izq">
      <path d="${paths.pierna_izq || paths.delantero_izq}" />
    </clipPath>
    <clipPath id="clip-pierna-der">
      <path d="${paths.pierna_der || paths.trasero_der || paths.delantero_der}" />
    </clipPath>
  </defs>

  <g id="BACKGROUND">
    ${MOLD_BACKGROUND_MARKS}
    ${generateDynamicSizeBadgeSvg(activeSize, 4150, 160)}
  </g>

  <g id="DESIGN">
    <!-- PIERNA IZQUIERDA -->
    <g id="PIECE_PIERNA_IZQUIERDA" transform="translate(1100, 2100) scale(${scaleX}, ${scaleY}) translate(-850, -1900)">
      <g clip-path="url(#clip-pierna-izq)">
        ${
          directTextures?.left_leg
            ? `<image href="${directTextures.left_leg}" xlink:href="${directTextures.left_leg}" x="${(TAILORING_PIECE_BOUNDS[productModelId]?.pierna_izq || { x: 178, y: 846, width: 1465, height: 2150 }).x}" y="${(TAILORING_PIECE_BOUNDS[productModelId]?.pierna_izq || { x: 178, y: 846, width: 1465, height: 2150 }).y}" width="${(TAILORING_PIECE_BOUNDS[productModelId]?.pierna_izq || { x: 178, y: 846, width: 1465, height: 2150 }).width}" height="${(TAILORING_PIECE_BOUNDS[productModelId]?.pierna_izq || { x: 178, y: 846, width: 1465, height: 2150 }).height}" preserveAspectRatio="none" />`
            : `
        <path d="${paths.pierna_izq || paths.delantero_izq}" fill="${primaryColor}" />
        <!-- Número Short -->
        <text x="500" y="2600" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="220" fill="${secondaryColor}">${playerNumber}</text>
        `
        }
      </g>
      <path d="${paths.pierna_izq || paths.delantero_izq}" class="cut-line" />
      <text x="850" y="3250" text-anchor="middle" class="piece-tag">[ 1. PIERNA IZQUIERDA • ${spec.title.toUpperCase()} • TALLA ${activeSize} ]</text>
    </g>

    <!-- PIERNA DERECHA -->
    <g id="PIECE_PIERNA_DERECHA" transform="translate(3300, 2100) scale(${scaleX}, ${scaleY}) translate(-2550, -1900)">
      <g clip-path="url(#clip-pierna-der)">
        ${
          directTextures?.right_leg
            ? `<image href="${directTextures.right_leg}" xlink:href="${directTextures.right_leg}" x="${(TAILORING_PIECE_BOUNDS[productModelId]?.pierna_der || { x: 1900, y: 846, width: 1465, height: 2150 }).x}" y="${(TAILORING_PIECE_BOUNDS[productModelId]?.pierna_der || { x: 1900, y: 846, width: 1465, height: 2150 }).y}" width="${(TAILORING_PIECE_BOUNDS[productModelId]?.pierna_der || { x: 1900, y: 846, width: 1465, height: 2150 }).width}" height="${(TAILORING_PIECE_BOUNDS[productModelId]?.pierna_der || { x: 1900, y: 846, width: 1465, height: 2150 }).height}" preserveAspectRatio="none" />`
            : `
        <path d="${paths.pierna_der || paths.trasero_der || paths.delantero_der}" fill="${primaryColor}" />
        <!-- Escudo Short -->
        <circle cx="2800" cy="2550" r="90" fill="${secondaryColor}" />
        <text x="2800" y="2560" text-anchor="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="28" fill="${primaryColor}">ATLETIQ</text>
        `
        }
      </g>
      <path d="${paths.pierna_der || paths.trasero_der || paths.delantero_der}" class="cut-line" />
      <text x="2550" y="3250" text-anchor="middle" class="piece-tag">[ 2. PIERNA DERECHA • ${spec.title.toUpperCase()} • TALLA ${activeSize} ]</text>
    </g>

    <!-- PRETINA -->
    <g id="PIECE_PRETINA" transform="translate(2200, 480) scale(${scaleX}, 1) translate(-1750, -440)">
      <rect x="250" y="250" width="3000" height="380" fill="${secondaryColor}" class="cut-line" />
      <text x="1750" y="450" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="28" fill="#ffffff" letter-spacing="4">[ 3. PRETINA ELÁSTICA CON CORDÓN INTERNO • TALLA ${activeSize} ]</text>
    </g>
  </g>
</svg>`;
}
