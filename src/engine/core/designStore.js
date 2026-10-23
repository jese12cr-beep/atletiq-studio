/**
 * ATLETIQ Engine v4.0 — Catálogo 3D Exacto (`.mirl` + `.fish` Owayo v6),
 * Sistema Cromático de 167 Colores Pantone® / CM5, Fuentes Atléticas y Estado Maestro Multi-Pieza
 */

import {
  PANTONE_CM5_PALETTE,
  FOOTBALL_FISH_DESIGNS,
  BASKETBALL_FISH_DESIGNS,
} from './palette152';

export { PANTONE_CM5_PALETTE, FOOTBALL_FISH_DESIGNS, BASKETBALL_FISH_DESIGNS };

export const ENGINE_PRODUCTS = [
  {
    id: 'futbol_jersey_pro_vneck',
    name: 'Camiseta Fútbol F3 Pro (204m-KA)',
    sport: 'Fútbol',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'jersey_short',
    mirlUrl: '/models/football_f3_ka.mirl',
    mirlKey: 'football_f3_ka',
    owayoCutCode: '204m_Basic_KA',
    basePrice: 34.0,
    shopifyVariantBase: 44901234567001,
    badge: 'Malla Real 38,319 Verts • 15 Diseños',
  },
  {
    id: 'basketball_b6_hero',
    name: 'Camiseta Basket B6 Hero (222m)',
    sport: 'Baloncesto',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'basketball_tank',
    mirlUrl: '/models/basketball_b6_hero.mirl',
    mirlKey: 'basketball_b6_hero',
    owayoCutCode: '222m-Hero',
    basePrice: 32.5,
    shopifyVariantBase: 44901234567007,
    badge: 'Malla Real 31,204 Verts • 9 Diseños',
  },
  {
    id: 'esports_pro_jersey',
    name: 'Jersey E-Sports Pro Arena (KA)',
    sport: 'E-Sports',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'jersey_crew',
    mirlUrl: '/models/football_f3_ka.mirl',
    mirlKey: 'football_f3_ka',
    owayoCutCode: '204m_Basic_KA',
    basePrice: 36.0,
    shopifyVariantBase: 44901234567003,
    badge: 'Malla Real 38,319 Verts • Sublimación Full',
  },
  {
    id: 'cycling_aero_maillot',
    name: 'Jersey Entrenamiento / Club Pro (KA)',
    sport: 'Multideporte',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'cycling_aero',
    mirlUrl: '/models/football_f3_ka.mirl',
    mirlKey: 'football_f3_ka',
    owayoCutCode: '204m_Basic_KA',
    basePrice: 38.0,
    shopifyVariantBase: 44901234567002,
    badge: 'Malla Real 38,319 Verts • TS-Tex',
  },
  {
    id: 'cap_snapback_6panel',
    name: 'Gorra Snapback 6-Panel Club',
    sport: 'Accesorios',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'cap',
    basePrice: 21.0,
    shopifyVariantBase: 44901234567004,
    badge: 'Motor 2.5D Capas',
  },
  {
    id: 'bottle_inox_laser_750',
    name: 'Termo Inox 750ml Grabado Láser',
    sport: 'Accesorios',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'bottle',
    basePrice: 18.5,
    shopifyVariantBase: 44901234567005,
    badge: 'Motor 2.5D Capas',
  },
  {
    id: 'shinguards_carbon_pro',
    name: 'Espinilleras Carbon Shield Pro',
    sport: 'Fútbol',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'shinguards',
    basePrice: 25.0,
    shopifyVariantBase: 44901234567006,
    badge: 'Motor 2.5D Capas',
  },
];

export function getDesignsForProduct(productModelId = 'futbol_jersey_pro_vneck') {
  if (productModelId === 'basketball_b6_hero') {
    return BASKETBALL_FISH_DESIGNS;
  }
  return FOOTBALL_FISH_DESIGNS;
}

// Selección rápida de colores destacados + acceso total a PANTONE_CM5_PALETTE (167 tonos)
export const TEXTILE_COLORS = PANTONE_CM5_PALETTE;

export const VECTOR_PATTERNS = FOOTBALL_FISH_DESIGNS.map((d) => ({
  id: d.id,
  name: d.name,
  subtitle: `Zonas ${d.baseColors.join('+')} • 5 Piezas HD`,
}));

export const ZONE_SURFACE_PATTERNS = [
  { id: 'none', name: 'Liso Limpio', desc: 'Color Pantone sólido puro' },
  { id: 'hex_carbon', name: 'Panal Hexagonal', desc: 'Micro-malla geométrica e-sports/fútbol' },
  { id: 'speed_lines', name: 'Líneas Velocidad', desc: 'Trama diagonal aerodinámica' },
  { id: 'halftone_dots', name: 'Degradado Halftone', desc: 'Puntos progresivos de competición' },
  { id: 'micro_chevrons', name: 'Espiga Jacquard', desc: 'Textura tejida en V tipo estadio' },
  { id: 'diag_pinstripes', name: 'Filetes Finos', desc: 'Rayado sutil a 45° tono sobre tono' },
];

export const VECTOR_CREST_PRESETS = [
  { id: 'royal_shield', name: 'Escudo Club Pro', category: 'Escudos' },
  { id: 'eagle_hex', name: 'Emblema Hexagonal', category: 'Escudos' },
  { id: 'circle_badge', name: 'Sello Redondo FC', category: 'Escudos' },
  { id: 'league_patch', name: 'Parche Oficial Manga', category: 'Mangas' },
  { id: 'three_stars', name: '3 Estrellas Campeón', category: 'Insignias' },
  { id: 'esports_bolt', name: 'Rayo Pro Gaming', category: 'E-Sports' },
  { id: 'crown_crest', name: 'Corona Real Oro', category: 'Insignias' },
  { id: 'wing_emblem', name: 'Alas Velocidad', category: 'Sponsor' },
];

export const FABRIC_WEAVES = [
  {
    id: 'ts_tex_football',
    name: 'TS-Tex™ Fútbol Ultra-Dry 145g',
    bumpUrl: '/fabrics/ts-tex.png',
    uvRepeat: 48,
    normalScale: 0.34,
    bumpScale: -0.004,
    roughness: 0.52,
    desc: 'Tejido oficial Owayo TS-Tex extraído de camisetas F3 (scaleStoff 0.50×0.60)',
  },
  {
    id: 'cooldry_hex',
    name: 'K-Tex 2™ Micromesh 155g',
    bumpUrl: '/fabrics/k-tex2.png',
    uvRepeat: 44,
    normalScale: 0.42,
    bumpScale: -0.0075,
    roughness: 0.56,
    desc: 'Malla transpirable oficial Owayo K-Tex 2 (scaleStoff 0.35×0.50)',
  },
  {
    id: 'pique_heavy',
    name: 'R-Tex 3™ Ribete & Piqué 210g',
    bumpUrl: '/fabrics/bandstoff-rtex3.png',
    uvRepeat: 34,
    normalScale: 0.52,
    bumpScale: -0.009,
    roughness: 0.65,
    desc: 'Trama acanalada de alta resistencia para cuellos, puños y contacto',
  },
];

export const SPORT_FONTS = [
  { id: 'F-101', label: 'Varsity Premier (Bebas)', family: "'Bebas Neue', sans-serif" },
  { id: 'F-102', label: 'Athletic Tall (Teko)', family: "'Teko', sans-serif" },
  { id: 'F-103', label: 'Cyber Strike (Chakra)', family: "'Chakra Petch', sans-serif" },
  { id: 'F-104', label: 'Stadium Block (Anton)', family: "'Anton', sans-serif" },
  { id: 'F-105', label: 'Bundesliga Cond (Oswald)', family: "'Oswald', sans-serif" },
  { id: 'F-106', label: 'Motorsports Pro (Russo)', family: "'Russo One', sans-serif" },
  { id: 'F-107', label: 'Tactical Stencil (Black Ops)', family: "'Black Ops One', sans-serif" },
  { id: 'F-108', label: 'Heavy Impact (Archivo)', family: "'Archivo Black', sans-serif" },
  { id: 'F-109', label: 'Arena Tech (Play)', family: "'Play', sans-serif" },
  { id: 'F-110', label: 'Pro Sans Clean (Outfit)', family: "'Outfit', sans-serif" },
];

export const VOLUME_TIERS = [
  { min: 1, max: 5, discountPct: 0, code: 'INDIVIDUAL', label: '1–5 uds (Precio Base)' },
  { min: 6, max: 11, discountPct: 15, code: 'TEAM_S', label: '6–11 uds (-15% Equipo)' },
  { min: 12, max: 24, discountPct: 25, code: 'TEAM_FULL', label: '12–24 uds (-25% Plantilla)' },
  { min: 25, max: 9999, discountPct: 35, code: 'CLUB_PRO', label: '25+ uds (-35% Club Oficial)' },
];

export function computeOwayoAutoContrastHex(masterHex = '#1d4ed8') {
  const clean = String(masterHex).replace('#', '');
  if (clean.length !== 6) return '#ffffff';
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.36 ? '#101820' : '#ffffff';
}

export function generateDesignId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return `des_${token}`;
}

export function createInitialMasterDesign() {
  return {
    designId: generateDesignId(),
    engineVersion: '4.0.0',
    productModelId: 'futbol_jersey_pro_vneck',
    collarStyle: 'v-neck',
    patternId: 'tackle', // Diseño oficial .fish de 5 piezas (Front, Back, LeftArm, RightArm, Collar)
    surfacePatternId: 'none', // Textura opcional sublimada sobre Zona A
    surfacePatternOpacity: 0.16,
    fabricWeaveId: 'ts_tex_football',
    bleedEnforcement: 'SOFT_WARN', // 'SOFT_WARN' | 'HARD_CLAMP' | 'ALL_OVER'
    autoContrastHF: true,
    colorZones: {
      primary: { hex: '#0033a0', pantone: 'PMS 286 C', code: 'Royal 4', owayoCode: 'A' },
      secondary: { hex: '#0c2340', pantone: 'PMS 289 C', code: 'Navy 5', owayoCode: 'B' },
      accents: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'C' },
      quaternary: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'D' },
      collar: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'K' },
      sleeves: { hex: '#0c2340', pantone: 'PMS 289 C', code: 'Navy 5', owayoCode: 'SLL/SLR' },
    },
    decals: [
      {
        id: 'decal_club_crest',
        type: 'PRESET_CREST',
        presetId: 'royal_shield',
        label: 'Escudo del Club',
        panel: 'front',
        centerMm: { x: 334, y: 185 },
        sizeMm: { width: 68, height: 74 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        flipX: false,
        flipY: false,
        removeWhiteBg: false,
        tintHex: '',
        zIndex: 10,
        isVector: true,
        widthPx: 3200,
      },
      {
        id: 'decal_main_sponsor',
        type: 'STATIC_TEXT',
        text: 'ATLETIQ AIRWAYS',
        fontFamily: "'Chakra Petch', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#0c2340',
        outlineWidthMm: 2.2,
        outline2Hex: '',
        archDeg: 0,
        letterSpacingMm: 1.2,
        label: 'Sponsor Pecho',
        panel: 'front',
        centerMm: { x: 259.6, y: 298 },
        sizeMm: { width: 230, height: 42 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        zIndex: 20,
        isVector: true,
        widthPx: 3200,
      },
      {
        id: 'decal_sleeve_patch',
        type: 'PRESET_CREST',
        presetId: 'league_patch',
        label: 'Parche Liga (Manga Izq.)',
        panel: 'left_arm',
        centerMm: { x: 225, y: 162 },
        sizeMm: { width: 68, height: 68 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        flipX: false,
        flipY: false,
        removeWhiteBg: false,
        tintHex: '',
        zIndex: 15,
        isVector: true,
        widthPx: 3200,
      },
    ],
    variableSlots: {
      playerNameBack: {
        textObjectUUID: 'uuid-slot-name-back',
        masterID: null,
        enabled: true,
        panel: 'back',
        centerMm: { x: 316.6, y: 158 },
        maxWidthMm: 295,
        capHeightMm: 52,
        archDeg: 0,
        autoCondense: true,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#0c2340',
        outlineWidthMm: 3.0,
      },
      playerNumberBack: {
        textObjectUUID: 'uuid-slot-num-back',
        masterID: null,
        enabled: true,
        panel: 'back',
        centerMm: { x: 316.6, y: 332 },
        heightMm: 225,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#0c2340',
        inlineHex: '#ffcd00',
        outlineWidthMm: 4.8,
      },
      playerNumberFront: {
        textObjectUUID: 'uuid-slot-num-front',
        masterID: 'uuid-slot-num-back',
        enabled: true,
        panel: 'front',
        centerMm: { x: 185, y: 188 },
        heightMm: 48,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#ffcd00',
        outlineHex: '#0c2340',
      },
      playerNumberSleeve: {
        textObjectUUID: 'uuid-slot-num-sleeve',
        masterID: 'uuid-slot-num-back',
        enabled: false,
        panel: 'right_arm',
        centerMm: { x: 280.6, y: 164 },
        heightMm: 44,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#0c2340',
      },
    },
  };
}

export const INITIAL_TEAM_ROSTER = [
  { id: 'r1', cut: 'MEN_PRO_SLIM', size: 'L', qty: 1, name: 'RODRÍGUEZ', number: '10', role: 'Capitán' },
  { id: 'r2', cut: 'MEN_PRO_SLIM', size: 'M', qty: 1, name: 'FERNÁNDEZ-GARCÍA', number: '7', role: 'Extremo (Prueba Nombre Largo)' },
  { id: 'r3', cut: 'WOMEN_FIT', size: 'S', qty: 1, name: 'VALERIA M.', number: '9', role: 'Delantera' },
  { id: 'r4', cut: 'MEN_CLASSIC', size: 'XL', qty: 1, name: 'SANTOS', number: '1', role: 'Portero' },
  { id: 'r5', cut: 'YOUTH_KIDS', size: '152', qty: 2, name: 'MATEO', number: '14', role: 'Cantera' },
  { id: 'r6', cut: 'MEN_PRO_SLIM', size: 'L', qty: 1, name: 'K. MBAPPÉ', number: '11', role: 'Delantero' },
];
