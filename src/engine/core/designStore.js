/**
 * ATLETIQ Engine v3.1 — Catálogo de Modelos 3D/2.5D, Paletas CM5/Pantone y Estado Maestro (Actualizado con REA Owayo v6)
 */

export const ENGINE_PRODUCTS = [
  {
    id: 'futbol_jersey_pro_vneck',
    name: 'Jersey Fútbol Pro Elite 3D',
    sport: 'Fútbol',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'jersey_short',
    basePrice: 34.0,
    shopifyVariantBase: 44901234567001,
    badge: '7 Piezas 3D + K-Tex',
  },
  {
    id: 'basketball_b6_hero',
    name: 'Camiseta Basket B6 Hero 3D',
    sport: 'Baloncesto',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'basketball_tank',
    owayoCutCode: '222m-Hero',
    basePrice: 32.5,
    shopifyVariantBase: 44901234567007,
    badge: 'REA Owayo 222m-Hero',
  },
  {
    id: 'cycling_aero_maillot',
    name: 'Maillot Ciclismo Aero Pro 3D',
    sport: 'Ciclismo',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'cycling_aero',
    basePrice: 42.0,
    shopifyVariantBase: 44901234567002,
    badge: 'Cremallera + Drop-Tail',
  },
  {
    id: 'esports_pro_jersey',
    name: 'Jersey E-Sports Pro Arena 3D',
    sport: 'E-Sports',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'jersey_crew',
    basePrice: 36.0,
    shopifyVariantBase: 44901234567003,
    badge: 'Sublimación Full HD',
  },
  {
    id: 'cap_snapback_6panel',
    name: 'Gorra Snapback 6-Panel Club',
    sport: 'Accesorios',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'cap',
    basePrice: 21.0,
    shopifyVariantBase: 44901234567004,
    badge: 'Motor 2.5D Capas Nike',
  },
  {
    id: 'bottle_inox_laser_750',
    name: 'Termo Inox 750ml Grabado Láser',
    sport: 'Accesorios',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'bottle',
    basePrice: 18.5,
    shopifyVariantBase: 44901234567005,
    badge: 'Motor 2.5D Capas Nike',
  },
  {
    id: 'shinguards_carbon_pro',
    name: 'Espinilleras Carbon Shield Pro',
    sport: 'Fútbol',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'shinguards',
    basePrice: 25.0,
    shopifyVariantBase: 44901234567006,
    badge: 'Motor 2.5D Capas Nike',
  },
];

export const TEXTILE_COLORS = [
  { name: 'Azul Real', hex: '#1d4ed8', pantone: 'PMS 286 C', contrast: '#ffffff' },
  { name: 'Azul Marino Noche', hex: '#0f172a', pantone: 'PMS 289 C', contrast: '#ffffff' },
  { name: 'Rojo Escarlata (Red 5)', hex: '#dc2626', pantone: 'PMS 186 C', contrast: '#ffffff' },
  { name: 'Blanco Óptico (White 1)', hex: '#f8fafc', pantone: 'PMS Bright White', contrast: '#0f172a' },
  { name: 'Oro Campeón', hex: '#facc15', pantone: 'PMS 116 C', contrast: '#0f172a' },
  { name: 'Verde Esmeralda', hex: '#059669', pantone: 'PMS 340 C', contrast: '#ffffff' },
  { name: 'Menta Pro (Mint 4)', hex: '#14b8a6', pantone: 'PMS 3262 C', contrast: '#0f172a' },
  { name: 'Lima Eléctrico', hex: '#84cc16', pantone: 'PMS 382 C', contrast: '#0f172a' },
  { name: 'Naranja Competición', hex: '#ea580c', pantone: 'PMS 1655 C', contrast: '#ffffff' },
  { name: 'Púrpura Imperial', hex: '#7c3aed', pantone: 'PMS 266 C', contrast: '#ffffff' },
  { name: 'Acero Azul (Steel Blue 4)', hex: '#3b82f6', pantone: 'PMS 279 C', contrast: '#ffffff' },
  { name: 'Gris Titanio', hex: '#475569', pantone: 'PMS 431 C', contrast: '#ffffff' },
];

export const VECTOR_PATTERNS = [
  { id: 'solid_pro', name: 'Pure Liso', subtitle: 'Base limpia de competición' },
  { id: 'classic_stripes', name: 'Triple Bastones', subtitle: 'Franjas verticales con filete' },
  { id: 'chest_band', name: 'Legend Franja', subtitle: 'Banda icónica de pecho' },
  { id: 'diagonal_sash', name: 'Slash Cruzada', subtitle: 'Cinta diagonal hombro-cadera' },
  { id: 'cyber_gradient', name: 'Screen Halftone', subtitle: 'Degradado micro-perforado' },
  { id: 'chevron_v', name: 'Fly Doble V', subtitle: 'Chevron dinámico pectoral' },
  { id: 'half_split', name: 'Buzzer Bicolor', subtitle: 'División simétrica vertical' },
  { id: 'hex_matrix', name: 'Aero Hexagonal', subtitle: 'Trama geométrica de alto flujo' },
];

export const FABRIC_WEAVES = [
  {
    id: 'cooldry_hex',
    name: 'K-Tex 2™ Micromesh 155g',
    uvRepeat: 44,
    normalScale: 0.36,
    bumpScale: -0.0075,
    roughness: 0.56,
    desc: 'Tejido oficial transpirable Owayo K-Tex 2 (scaleStoff 0.35×0.50)',
  },
  {
    id: 'interlock_pro',
    name: 'AeroSilk™ Interlock 140g',
    uvRepeat: 64,
    normalScale: 0.22,
    bumpScale: -0.004,
    roughness: 0.44,
    desc: 'Tejido sedoso aerodinámico con ligero brillo de competición',
  },
  {
    id: 'pique_heavy',
    name: 'R-Tex 3™ Rib & Piqué 210g',
    uvRepeat: 32,
    normalScale: 0.52,
    bumpScale: -0.009,
    roughness: 0.68,
    desc: 'Trama acanalada de alta resistencia al tirón y contacto',
  },
];

export const SPORT_FONTS = [
  { id: 'Varsity', label: 'Varsity Premier', family: "'Bebas Neue', sans-serif" },
  { id: 'Athletic', label: 'Athletic Tall', family: "'Teko', sans-serif" },
  { id: 'Cyber', label: 'Cyber Strike', family: "'Chakra Petch', sans-serif" },
  { id: 'Modern', label: 'Pro Sans Heavy', family: "'Outfit', sans-serif" },
];

export const VOLUME_TIERS = [
  { min: 1, max: 5, discountPct: 0, code: 'INDIVIDUAL', label: '1–5 uds (Precio Base)' },
  { min: 6, max: 11, discountPct: 15, code: 'TEAM_S', label: '6–11 uds (-15% Equipo)' },
  { min: 12, max: 24, discountPct: 25, code: 'TEAM_FULL', label: '12–24 uds (-25% Plantilla)' },
  { min: 25, max: 9999, discountPct: 35, code: 'CLUB_PRO', label: '25+ uds (-35% Club Oficial)' },
];

/**
 * Regla Owayo `ColorCodeAbhaengigkeiten` ("Schwarz-Weiß im Kontrast"):
 * Calcula automáticamente Blanco Óptico o Negro Carbón según la luminancia relativa WCAG del color maestro `A`.
 */
export function computeOwayoAutoContrastHex(masterHex = '#1d4ed8') {
  const clean = String(masterHex).replace('#', '');
  if (clean.length !== 6) return '#f8fafc';
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.36 ? '#0f172a' : '#f8fafc';
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
    engineVersion: '3.1.0',
    productModelId: 'futbol_jersey_pro_vneck',
    collarStyle: 'v-neck', // 'v-neck' | 'crew'
    patternId: 'classic_stripes',
    fabricWeaveId: 'cooldry_hex',
    bleedEnforcement: 'SOFT_WARN', // 'SOFT_WARN' | 'HARD_CLAMP'
    autoContrastHF: true, // ColorCodeAbhaengigkeiten ("Schwarz-Weiß im Kontrast")
    colorZones: {
      primary: { hex: '#1d4ed8', pantone: 'PMS 286 C', owayoCode: 'A' },
      secondary: { hex: '#0f172a', pantone: 'PMS 289 C', owayoCode: 'B' },
      sleeves: { hex: '#0f172a', pantone: 'PMS 289 C', owayoCode: 'SLL/SLR' },
      collar: { hex: '#f8fafc', pantone: 'PMS Bright White', owayoCode: 'K' },
      accents: { hex: '#facc15', pantone: 'PMS 116 C', owayoCode: 'C' },
    },
    decals: [
      {
        id: 'decal_club_crest',
        type: 'PRESET_CREST',
        presetId: 'royal_shield',
        label: 'Escudo del Club',
        panel: 'front',
        safeZoneId: 'front_chest_full',
        centerMm: { x: 306, y: 183 },
        sizeMm: { width: 58, height: 64 },
        scale: 1,
        rotationDeg: 0,
        isVector: true,
        widthPx: 2400,
      },
      {
        id: 'decal_main_sponsor',
        type: 'STATIC_TEXT',
        text: 'ATLETIQ AIRWAYS',
        fontFamily: "'Chakra Petch', sans-serif",
        fillHex: '#f8fafc',
        outlineHex: '#0f172a',
        label: 'Sponsor Frontal',
        panel: 'front',
        safeZoneId: 'front_chest_full',
        centerMm: { x: 250, y: 278 },
        sizeMm: { width: 195, height: 38 },
        scale: 1,
        rotationDeg: 0,
        isVector: true,
        widthPx: 2400,
      },
    ],
    variableSlots: {
      playerNameBack: {
        textObjectUUID: 'uuid-slot-name-back',
        masterID: null,
        enabled: true,
        panel: 'back',
        centerMm: { x: 250, y: 172 },
        maxWidthMm: 225,
        capHeightMm: 42,
        autoCondense: true,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#f8fafc',
        outlineHex: '#0f172a',
        outlineWidthMm: 2.8,
      },
      playerNumberBack: {
        textObjectUUID: 'uuid-slot-num-back',
        masterID: null,
        enabled: true,
        panel: 'back',
        centerMm: { x: 250, y: 305 },
        heightMm: 165,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#f8fafc',
        outlineHex: '#0f172a',
        inlineHex: '#facc15',
        outlineWidthMm: 4.5,
      },
      playerNumberFront: {
        textObjectUUID: 'uuid-slot-num-front',
        masterID: 'uuid-slot-num-back', // Sincronizado como clon maestro Owayo
        enabled: true,
        panel: 'front',
        centerMm: { x: 192, y: 185 },
        heightMm: 38,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#facc15',
        outlineHex: '#0f172a',
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
