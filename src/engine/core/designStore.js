/**
 * ATLETIQ Engine v5.0 — Catálogo 3D Exacto de 4 Moldes `.mirl` + 52 Plantillas `.fish` (Fútbol & Baloncesto: Camisetas + Shorts),
 * Sistema Cromático de 167 Colores Pantone® / CM5, Fuentes Atléticas y Estado Multi-Prenda (Kit Sincronizable)
 */

import {
  PANTONE_CM5_PALETTE,
  FOOTBALL_FISH_DESIGNS,
  FOOTBALL_SHORTS_FISH_DESIGNS,
  BASKETBALL_FISH_DESIGNS,
  BASKETBALL_SHORTS_FISH_DESIGNS,
  BASKETBALL_WOMEN_FISH_DESIGNS,
  BASKETBALL_SHORTS_WOMEN_FISH_DESIGNS,
  JACKET_MEN_FISH_DESIGNS,
  JACKET_WOMEN_FISH_DESIGNS,
} from './palette152';

export {
  PANTONE_CM5_PALETTE,
  FOOTBALL_FISH_DESIGNS,
  FOOTBALL_SHORTS_FISH_DESIGNS,
  BASKETBALL_FISH_DESIGNS,
  BASKETBALL_SHORTS_FISH_DESIGNS,
  BASKETBALL_WOMEN_FISH_DESIGNS,
  BASKETBALL_SHORTS_WOMEN_FISH_DESIGNS,
  JACKET_MEN_FISH_DESIGNS,
  JACKET_WOMEN_FISH_DESIGNS,
};

export const ENGINE_PRODUCTS = [
  {
    id: 'futbol_jersey_pro_vneck',
    name: 'Camiseta Fútbol F3 Basic',
    shortName: 'Camiseta Fútbol',
    sport: 'Fútbol',
    gender: 'men',
    garmentCategory: 'jersey',
    pairedProductId: 'football_shorts_fp3',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'jersey_short',
    mirlUrl: '/models/football_f3_ka.mirl',
    mirlKey: 'football_f3_ka',
    owayoCutCode: '204m_Basic_KA',
    defaultFabricId: 'ts_tex_football',
    defaultDesignId: 'tackle',
    basePrice: 34.0,
    shopifyVariantBase: 44901234567001,
    badge: '38,319 Vértices • 16 Diseños .fish',
  },
  {
    id: 'football_shorts_fp3',
    name: 'Short Fútbol FP3 Basic',
    shortName: 'Short Fútbol',
    sport: 'Fútbol',
    gender: 'men',
    garmentCategory: 'shorts',
    pairedProductId: 'futbol_jersey_pro_vneck',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'football_shorts',
    mirlUrl: '/models/football_shorts_fp3.mirl',
    mirlKey: 'football_shorts_fp3',
    owayoCutCode: '303m_Basic',
    defaultFabricId: 'sr_tex_shorts',
    defaultDesignId: 'city',
    basePrice: 22.0,
    shopifyVariantBase: 44901234567101,
    badge: '9,045 Vértices • 10 Diseños .fish',
  },
  {
    id: 'basketball_b6_hero',
    name: 'Camiseta Basket B6 Hero',
    shortName: 'Camiseta Basket',
    sport: 'Baloncesto',
    gender: 'men',
    garmentCategory: 'jersey',
    pairedProductId: 'basketball_shorts_bp6',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'basketball_tank',
    mirlUrl: '/models/basketball_b6_hero.mirl',
    mirlKey: 'basketball_b6_hero',
    owayoCutCode: '222m-Hero',
    defaultFabricId: 'cooldry_hex',
    defaultDesignId: 'legend',
    basePrice: 32.5,
    shopifyVariantBase: 44901234567007,
    badge: '31,204 Vértices • 20 Diseños .fish',
  },
  {
    id: 'basketball_shorts_bp6',
    name: 'Short Basket BP6 Hero',
    shortName: 'Short Basket',
    sport: 'Baloncesto',
    gender: 'men',
    garmentCategory: 'shorts',
    pairedProductId: 'basketball_b6_hero',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'basketball_shorts',
    mirlUrl: '/models/basketball_shorts_bp6.mirl',
    mirlKey: 'basketball_shorts_bp6',
    owayoCutCode: '313m-ENB',
    defaultFabricId: 'cooldry_hex',
    defaultDesignId: 'legend',
    basePrice: 26.5,
    shopifyVariantBase: 44901234567201,
    badge: '55,791 Vértices • 6 Diseños .fish',
  },
  {
    id: 'basketball_b7w_epic_women',
    name: 'Camiseta Basket B7W Epic Dama',
    shortName: 'Camiseta Dama B7W',
    sport: 'Baloncesto',
    gender: 'women',
    garmentCategory: 'jersey',
    pairedProductId: 'basketball_shorts_bp7w_women',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'basketball_tank',
    mirlUrl: '/models/basketball_b7w_epic_women.mirl',
    mirlKey: 'basketball_b7w_epic_women',
    owayoCutCode: '222w-Epic',
    defaultFabricId: 'cooldry_hex',
    defaultDesignId: 'legend',
    basePrice: 33.5,
    shopifyVariantBase: 44901234567301,
    badge: '94,947 Vértices • Corte Mujer Dama • 10 Diseños .fish',
  },
  {
    id: 'basketball_shorts_bp7w_women',
    name: 'Short Basket BP7W Epic Dama',
    shortName: 'Short Dama BP7W',
    sport: 'Baloncesto',
    gender: 'women',
    garmentCategory: 'shorts',
    pairedProductId: 'basketball_b7w_epic_women',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'basketball_shorts',
    mirlUrl: '/models/basketball_shorts_bp7w_women.mirl',
    mirlKey: 'basketball_shorts_bp7w_women',
    owayoCutCode: '313w-STS',
    defaultFabricId: 'cooldry_hex',
    defaultDesignId: 'pure',
    basePrice: 27.5,
    shopifyVariantBase: 44901234567401,
    badge: '66,282 Vértices • Corte Mujer Dama • 9 Diseños .fish',
  },
  {
    id: 'jacket_softshell_601m_men',
    name: 'Chaqueta Softshell J5 Pro Caballero',
    shortName: 'Chaqueta J5 Hombre',
    sport: 'Chaquetas',
    gender: 'men',
    garmentCategory: 'jacket',
    pairedProductId: 'jacket_softshell_601w_women',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'jacket_zipper',
    mirlUrl: '/models/jacket_softshell_601m_men.mirl',
    mirlKey: 'jacket_softshell_601m_men',
    owayoCutCode: 'CUT_601M',
    defaultFabricId: 'k_tex_wind',
    defaultDesignId: 'velo',
    basePrice: 68.0,
    shopifyVariantBase: 44901234567501,
    badge: '31,753 Vértices • Cremallera Frontal • 12 Diseños .fish',
  },
  {
    id: 'jacket_softshell_601w_women',
    name: 'Chaqueta Softshell J5W Pro Dama',
    shortName: 'Chaqueta J5W Dama',
    sport: 'Chaquetas',
    gender: 'women',
    garmentCategory: 'jacket',
    pairedProductId: 'jacket_softshell_601m_men',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'jacket_zipper',
    mirlUrl: '/models/jacket_softshell_601w_women.mirl',
    mirlKey: 'jacket_softshell_601w_women',
    owayoCutCode: 'CUT_601W',
    defaultFabricId: 'k_tex_wind',
    defaultDesignId: 'peloton',
    basePrice: 68.0,
    shopifyVariantBase: 44901234567601,
    badge: '20,529 Vértices • Corte Entallado Mujer • 9 Diseños .fish',
  },
  {
    id: 'esports_pro_jersey',
    name: 'Jersey E-Sports Pro Arena',
    shortName: 'Jersey E-Sports',
    sport: 'E-Sports',
    gender: 'men',
    garmentCategory: 'jersey',
    pairedProductId: 'football_shorts_fp3',
    renderMode: 'WEBGL_3D_PBR',
    garmentShape: 'jersey_crew',
    mirlUrl: '/models/football_f3_ka.mirl',
    mirlKey: 'football_f3_ka',
    owayoCutCode: '204m_Basic_KA',
    defaultFabricId: 'ts_tex_football',
    defaultDesignId: 'gladiator',
    basePrice: 36.0,
    shopifyVariantBase: 44901234567003,
    badge: '38,319 Vértices • Sublimación Full',
  },
  {
    id: 'cap_snapback_6panel',
    name: 'Gorra Snapback 6-Panel Club',
    shortName: 'Gorra Club',
    sport: 'Accesorios',
    garmentCategory: 'accessory',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'cap',
    basePrice: 21.0,
    shopifyVariantBase: 44901234567004,
    badge: 'Motor 2.5D Capas',
  },
  {
    id: 'bottle_inox_laser_750',
    name: 'Termo Inox 750ml Grabado Láser',
    shortName: 'Termo 750ml',
    sport: 'Accesorios',
    garmentCategory: 'accessory',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'bottle',
    basePrice: 18.5,
    shopifyVariantBase: 44901234567005,
    badge: 'Motor 2.5D Capas',
  },
  {
    id: 'shinguards_carbon_pro',
    name: 'Espinilleras Carbon Shield Pro',
    shortName: 'Espinilleras',
    sport: 'Accesorios',
    garmentCategory: 'accessory',
    renderMode: 'FAUX_3D_LAYERED_WEBP',
    accessoryType: 'shinguards',
    basePrice: 25.0,
    shopifyVariantBase: 44901234567006,
    badge: 'Motor 2.5D Capas',
  },
];

export function getDesignsForProduct(productModelId = 'futbol_jersey_pro_vneck') {
  switch (productModelId) {
    case 'basketball_b6_hero':
      return BASKETBALL_FISH_DESIGNS;
    case 'basketball_shorts_bp6':
      return BASKETBALL_SHORTS_FISH_DESIGNS;
    case 'basketball_b7w_epic_women':
      return BASKETBALL_WOMEN_FISH_DESIGNS;
    case 'basketball_shorts_bp7w_women':
      return BASKETBALL_SHORTS_WOMEN_FISH_DESIGNS;
    case 'jacket_softshell_601m_men':
      return JACKET_MEN_FISH_DESIGNS;
    case 'jacket_softshell_601w_women':
      return JACKET_WOMEN_FISH_DESIGNS;
    case 'football_shorts_fp3':
      return FOOTBALL_SHORTS_FISH_DESIGNS;
    default:
      return FOOTBALL_FISH_DESIGNS;
  }
}

export const TEXTILE_COLORS = PANTONE_CM5_PALETTE;

export const VECTOR_PATTERNS = FOOTBALL_FISH_DESIGNS.map((d) => ({
  id: d.id,
  name: d.name,
  subtitle: `Zonas ${d.baseColors.join('+')} • HD`,
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
  { id: 'league_patch', name: 'Parche Oficial Liga', category: 'Parches' },
  { id: 'three_stars', name: '3 Estrellas Campeón', category: 'Insignias' },
  { id: 'esports_bolt', name: 'Rayo Pro Arena', category: 'E-Sports' },
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
    desc: 'Tejido técnico transpirable de camiseta F3 Basic (scaleStoff 0.50×0.60)',
  },
  {
    id: 'cooldry_hex',
    name: 'K-Tex 2™ Basket Micromesh 155g',
    bumpUrl: '/fabrics/k-tex2.png',
    uvRepeat: 44,
    normalScale: 0.42,
    bumpScale: -0.0075,
    roughness: 0.56,
    desc: 'Malla abierta de alto flujo de aire para camisetas B6 Hero y shorts BP6 Hero',
  },
  {
    id: 'sr_tex_shorts',
    name: 'SR-Tex™ Anti-Fricción Shorts 160g',
    bumpUrl: '/fabrics/sr-tex.png',
    uvRepeat: 38,
    normalScale: 0.38,
    bumpScale: -0.004,
    roughness: 0.50,
    desc: 'Poliéster elástico resistente al deslizamiento extraído de pantalones FP3 Basic',
  },
  {
    id: 'pique_heavy',
    name: 'R-Tex 3™ Ribete & Piqué 210g',
    bumpUrl: '/fabrics/bandstoff-rtex3.png',
    uvRepeat: 34,
    normalScale: 0.52,
    bumpScale: -0.009,
    roughness: 0.65,
    desc: 'Trama acanalada elástica para cuellos, sisas de 48mm y refuerzos',
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

export const COLOR_HARMONY_SUGGESTIONS = [
  {
    name: 'Azul Real & Oro',
    zones: {
      primary: { hex: '#0033a0', pantone: 'PMS 286 C', code: 'Royal 4', owayoCode: 'A' },
      secondary: { hex: '#0c2340', pantone: 'PMS 289 C', code: 'Navy 5', owayoCode: 'B' },
      accents: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'C' },
      quaternary: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'D' },
      collar: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'K' },
      sleeves: { hex: '#0c2340', pantone: 'PMS 289 C', code: 'Navy 5', owayoCode: 'SLL/SLR' },
    },
  },
  {
    name: 'Carmesí & Ónix',
    zones: {
      primary: { hex: '#c8102e', pantone: 'PMS 186 C', code: 'Red 4', owayoCode: 'A' },
      secondary: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'B' },
      accents: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'C' },
      quaternary: { hex: '#ffc72c', pantone: 'PMS 135 C', code: 'Gold 3', owayoCode: 'D' },
      collar: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'K' },
      sleeves: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'SLL/SLR' },
    },
  },
  {
    name: 'Menta Pro & Carbón',
    zones: {
      primary: { hex: '#00bfb3', pantone: 'PMS 3262 C', code: 'Mint 3', owayoCode: 'A' },
      secondary: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'B' },
      accents: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'C' },
      quaternary: { hex: '#5bd1c5', pantone: 'PMS 3252 C', code: 'Mint 2', owayoCode: 'D' },
      collar: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'K' },
      sleeves: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'SLL/SLR' },
    },
  },
  {
    name: 'Lakers Púrpura & Oro',
    zones: {
      primary: { hex: '#330072', pantone: 'PMS 2685 C', code: 'Purple 5', owayoCode: 'A' },
      secondary: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'B' },
      accents: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'C' },
      quaternary: { hex: '#753bbd', pantone: 'PMS 266 C', code: 'Violet 4', owayoCode: 'D' },
      collar: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'K' },
      sleeves: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'SLL/SLR' },
    },
  },
  {
    name: 'Blanco Real & Marino',
    zones: {
      primary: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'A' },
      secondary: { hex: '#0c2340', pantone: 'PMS 289 C', code: 'Navy 5', owayoCode: 'B' },
      accents: { hex: '#00a3e0', pantone: 'PMS 299 C', code: 'Cyan 3', owayoCode: 'C' },
      quaternary: { hex: '#b9975b', pantone: 'PMS 465 C', code: 'Gold 4', owayoCode: 'D' },
      collar: { hex: '#0c2340', pantone: 'PMS 289 C', code: 'Navy 5', owayoCode: 'K' },
      sleeves: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'SLL/SLR' },
    },
  },
  {
    name: 'Verde Neón & Antracita',
    zones: {
      primary: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'A' },
      secondary: { hex: '#44d62c', pantone: 'PMS 802 C (Flúor)', code: 'Neon Green', owayoCode: 'B' },
      accents: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'C' },
      quaternary: { hex: '#53565a', pantone: 'PMS Cool Gray 11 C', code: 'Grey 4', owayoCode: 'D' },
      collar: { hex: '#44d62c', pantone: 'PMS 802 C (Flúor)', code: 'Neon Green', owayoCode: 'K' },
      sleeves: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'SLL/SLR' },
    },
  },
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

export function createDefaultDesignForProduct(productModelId = 'futbol_jersey_pro_vneck', inheritedColorZones = null) {
  const prod = ENGINE_PRODUCTS.find((p) => p.id === productModelId) || ENGINE_PRODUCTS[0];
  const isBasketJersey = productModelId === 'basketball_b6_hero';
  const isBasketShorts = productModelId === 'basketball_shorts_bp6';
  const isFootballShorts = productModelId === 'football_shorts_fp3';
  const isShorts = isBasketShorts || isFootballShorts;

  const baseColors = inheritedColorZones
    ? structuredClone(inheritedColorZones)
    : isBasketJersey || isBasketShorts
    ? {
        primary: { hex: '#c8102e', pantone: 'PMS 186 C', code: 'Red 4', owayoCode: 'A' },
        secondary: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'B' },
        accents: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'C' },
        quaternary: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'D' },
        collar: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'K' },
        sleeves: { hex: '#101820', pantone: 'PMS Black 6 C', code: 'Black 5', owayoCode: 'SLL/SLR' },
      }
    : {
        primary: { hex: '#0033a0', pantone: 'PMS 286 C', code: 'Royal 4', owayoCode: 'A' },
        secondary: { hex: '#0c2340', pantone: 'PMS 289 C', code: 'Navy 5', owayoCode: 'B' },
        accents: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'C' },
        quaternary: { hex: '#ffffff', pantone: 'PMS Bright White', code: 'White 1', owayoCode: 'D' },
        collar: { hex: '#ffcd00', pantone: 'PMS 116 C', code: 'Yellow 4', owayoCode: 'K' },
        sleeves: { hex: '#0c2340', pantone: 'PMS 289 C', code: 'Navy 5', owayoCode: 'SLL/SLR' },
      };

  let decals = [];
  if (isFootballShorts) {
    decals = [
      {
        id: 'decal_short_crest',
        type: 'PRESET_CREST',
        presetId: 'royal_shield',
        label: 'Escudo Muslo Izq.',
        panel: 'left_leg',
        centerMm: { x: 201, y: 425 },
        sizeMm: { width: 62, height: 68 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        clampToZone: 'ALL',
        pinned: false,
        flipX: false,
        flipY: false,
        removeWhiteBg: false,
        tintHex: '',
        zIndex: 10,
        isVector: true,
        widthPx: 3200,
      },
    ];
  } else if (isBasketShorts) {
    decals = [
      {
        id: 'decal_bshort_crest',
        type: 'PRESET_CREST',
        presetId: 'eagle_hex',
        label: 'Emblema Lateral Der.',
        panel: 'right_leg',
        centerMm: { x: 432, y: 410 },
        sizeMm: { width: 78, height: 78 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        clampToZone: 'ALL',
        pinned: false,
        flipX: false,
        flipY: false,
        removeWhiteBg: false,
        tintHex: '',
        zIndex: 10,
        isVector: true,
        widthPx: 3200,
      },
    ];
  } else if (isBasketJersey) {
    decals = [
      {
        id: 'decal_bball_team',
        type: 'STATIC_TEXT',
        text: 'BULLS PRO',
        isFixed: true,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#101820',
        outlineWidthMm: 3.0,
        archDeg: 38,
        letterSpacingMm: 1.5,
        label: 'Nombre Equipo Pecho',
        panel: 'front',
        centerMm: { x: 316.2, y: 270 },
        sizeMm: { width: 250, height: 64 },
        scale: 1,
        rotationDeg: 0,
        opacity: 1,
        blendMode: 'source-over',
        clampToZone: 'ALL',
        pinned: false,
        zIndex: 20,
        isVector: true,
        widthPx: 3200,
      },
    ];
  } else {
    decals = [
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
        clampToZone: 'ALL',
        pinned: false,
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
        isFixed: true,
        fontFamily: "'Chakra Petch', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#0c2340',
        outlineWidthMm: 2.2,
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
        clampToZone: 'ALL',
        pinned: false,
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
        clampToZone: 'ALL',
        pinned: false,
        flipX: false,
        flipY: false,
        removeWhiteBg: false,
        tintHex: '',
        zIndex: 15,
        isVector: true,
        widthPx: 3200,
      },
    ];
  }

  return {
    designId: generateDesignId(),
    engineVersion: '5.0.0',
    productModelId: prod.id,
    collarStyle: 'v-neck',
    patternId: prod.defaultDesignId || 'pure',
    surfacePatternId: 'none',
    surfacePatternOpacity: 0.16,
    fabricWeaveId: prod.defaultFabricId || 'ts_tex_football',
    bleedEnforcement: 'SOFT_WARN',
    autoContrastHF: true,
    colorZones: baseColors,
    decals,
    variableSlots: {
      playerNameBack: {
        textObjectUUID: 'uuid-slot-name-back',
        masterID: null,
        enabled: !isShorts,
        panel: 'back',
        centerMm: { x: isBasketJersey ? 222.3 : 316.6, y: isBasketJersey ? 185 : 158 },
        maxWidthMm: isBasketJersey ? 250 : 295,
        capHeightMm: isBasketJersey ? 50 : 52,
        archDeg: isBasketJersey ? 18 : 0,
        autoCondense: true,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#101820',
        outlineWidthMm: 3.0,
      },
      playerNumberBack: {
        textObjectUUID: 'uuid-slot-num-back',
        masterID: null,
        enabled: !isShorts,
        panel: 'back',
        centerMm: { x: isBasketJersey ? 222.3 : 316.6, y: isBasketJersey ? 360 : 332 },
        heightMm: isBasketJersey ? 215 : 225,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#101820',
        inlineHex: '#ffcd00',
        outlineWidthMm: 4.8,
      },
      playerNumberFront: {
        textObjectUUID: 'uuid-slot-num-front',
        masterID: 'uuid-slot-num-back',
        enabled: !isShorts,
        panel: 'front',
        centerMm: { x: isBasketJersey ? 316.2 : 185, y: isBasketJersey ? 410 : 188 },
        heightMm: isBasketJersey ? 135 : 48,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: isBasketJersey ? '#ffffff' : '#ffcd00',
        outlineHex: '#101820',
        outlineWidthMm: isBasketJersey ? 3.8 : 2.2,
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
        outlineHex: '#101820',
      },
      playerNumberShorts: {
        textObjectUUID: 'uuid-slot-num-shorts',
        masterID: 'uuid-slot-num-back',
        enabled: isShorts,
        panel: 'right_leg',
        centerMm: { x: isBasketShorts ? 611 : 599, y: isBasketShorts ? 425 : 430 },
        heightMm: 68,
        fontFamily: "'Bebas Neue', sans-serif",
        fillHex: '#ffffff',
        outlineHex: '#101820',
        outlineWidthMm: 2.8,
      },
    },
  };
}

export function createInitialMasterDesign() {
  return createDefaultDesignForProduct('futbol_jersey_pro_vneck');
}

export const INITIAL_TEAM_ROSTER = [
  { id: 'r1', cut: 'MEN_PRO_SLIM', size: 'L', qty: 1, name: 'RODRÍGUEZ', number: '10', role: 'Capitán' },
  { id: 'r2', cut: 'MEN_PRO_SLIM', size: 'M', qty: 1, name: 'FERNÁNDEZ-GARCÍA', number: '7', role: 'Titular (Nombre Largo)' },
  { id: 'r3', cut: 'WOMEN_FIT', size: 'S', qty: 1, name: 'VALERIA M.', number: '9', role: 'Titular' },
  { id: 'r4', cut: 'MEN_CLASSIC', size: 'XL', qty: 1, name: 'SANTOS', number: '1', role: 'Portero / Pivot' },
  { id: 'r5', cut: 'YOUTH_KIDS', size: '152', qty: 2, name: 'MATEO', number: '14', role: 'Cantera' },
  { id: 'r6', cut: 'MEN_PRO_SLIM', size: 'L', qty: 1, name: 'JORDAN', number: '23', role: 'Escolta' },
];
