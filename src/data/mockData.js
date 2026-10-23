export const SPORTS_CATEGORIES = [
  { id: 'all', name: 'Todos los Artículos' },
  { id: 'futbol', name: 'Fútbol & Fútbol Sala' },
  { id: 'basket', name: 'Baloncesto' },
  { id: 'running', name: 'Running & Training' },
  { id: 'accesorios', name: 'Accesorios & Equipo' },
];

export const COLOR_PALETTES = [
  { name: 'Azul Real', hex: '#1d4ed8', text: '#ffffff' },
  { name: 'Rojo Carmesí', hex: '#dc2626', text: '#ffffff' },
  { name: 'Negro Carbón', hex: '#0f172a', text: '#ffffff' },
  { name: 'Blanco Puro', hex: '#ffffff', text: '#0f172a' },
  { name: 'Oro / Amarillo', hex: '#facc15', text: '#0f172a' },
  { name: 'Verde Bosque', hex: '#15803d', text: '#ffffff' },
  { name: 'Verde Neón', hex: '#22c55e', text: '#0f172a' },
  { name: 'Naranja Fuego', hex: '#ea580c', text: '#ffffff' },
  { name: 'Morado Real', hex: '#7e22ce', text: '#ffffff' },
  { name: 'Cian Cibernético', hex: '#06b6d4', text: '#0f172a' },
  { name: 'Gris Grafito', hex: '#475569', text: '#ffffff' },
  { name: 'Rosa Flúor', hex: '#ec4899', text: '#ffffff' },
];

export const PATTERNS = [
  { id: 'solid', name: 'Liso Pro', desc: 'Clásico sin textura' },
  { id: 'stripes-vertical', name: 'Rayas Verticales', desc: 'Estilo clásico fútbol' },
  { id: 'stripes-horizontal', name: 'Banda en Pecho', desc: 'Franja horizontal icónica' },
  { id: 'geometric-fade', name: 'Degradado Cyber', desc: 'Efecto moderno digital' },
  { id: 'diagonal-speed', name: 'Rayas de Velocidad', desc: 'Líneas aerodinámicas' },
  { id: 'honeycomb', name: 'Hexágonos Tech', desc: 'Patrón de panal deportivo' },
  { id: 'sash', name: 'Banda Diagonal', desc: 'Cinta cruzada tradicional' },
];

export const FONTS = [
  { id: 'font-bebas', name: 'Varsity Pro', fontClass: 'font-bebas', letterSpacing: '0.05em' },
  { id: 'font-teko', name: 'Athletic Slim', fontClass: 'font-teko', letterSpacing: '0.08em' },
  { id: 'font-chakra', name: 'Cyber Sport', fontClass: 'font-chakra', letterSpacing: '0.02em' },
  { id: 'sans-serif', name: 'Modern Block', fontClass: 'font-sans font-black', letterSpacing: '0.1em' },
];

export const PRESET_BADGES = [
  {
    id: 'fc-shield',
    name: 'Escudo Real',
    svg: `<svg viewBox="0 0 100 100" fill="currentColor"><path d="M50 5 L85 20 L85 55 C85 75 50 95 50 95 C50 95 15 75 15 55 L15 20 Z" fill="#facc15" stroke="#0f172a" stroke-width="4"/><path d="M50 15 L75 27 L75 52 C75 68 50 82 50 82 C50 82 25 68 25 52 L25 27 Z" fill="#1e3a8a"/><polygon points="50,25 57,40 73,42 61,54 65,70 50,61 35,70 39,54 27,42 43,40" fill="#facc15"/></svg>`
  },
  {
    id: 'eagle-sport',
    name: 'Águila Veloz',
    svg: `<svg viewBox="0 0 100 100" fill="currentColor"><circle cx="50" cy="50" r="45" fill="#dc2626" stroke="#ffffff" stroke-width="4"/><path d="M20 40 Q50 20 80 40 Q65 60 50 85 Q35 60 20 40 Z" fill="#ffffff"/><circle cx="50" cy="45" r="10" fill="#facc15"/></svg>`
  },
  {
    id: 'lion-crest',
    name: 'León Guerrero',
    svg: `<svg viewBox="0 0 100 100" fill="currentColor"><rect x="15" y="10" width="70" height="80" rx="20" fill="#0f172a" stroke="#facc15" stroke-width="4"/><path d="M50 25 L65 55 L35 55 Z" fill="#dc2626"/><circle cx="50" cy="68" r="8" fill="#facc15"/></svg>`
  },
  {
    id: 'lightning-fc',
    name: 'Rayo Eléctrico',
    svg: `<svg viewBox="0 0 100 100" fill="currentColor"><polygon points="55,10 25,50 48,50 40,90 75,45 52,45" fill="#facc15" stroke="#0f172a" stroke-width="3"/></svg>`
  }
];

export const PRODUCTS_CATALOG = [
  {
    id: 'jersey-pro-futbol',
    name: 'Camiseta de Fútbol Pro Elite',
    category: 'futbol',
    type: 'jersey',
    basePrice: 32.99,
    image: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80',
    description: 'Confección en poliéster microperforado CoolDry™ de 155g con tecnología de sublimación total y tacto sedoso.',
    badge: 'Más Vendido',
    customizableParts: ['Cuerpo', 'Mangas', 'Cuello', 'Dorsal', 'Escudo', 'Patrocinador', 'Patrones'],
    rating: 4.9,
    reviewsCount: 142,
    leadTime: '3-5 días hábiles'
  },
  {
    id: 'jersey-basketball-slam',
    name: 'Jersey Baloncesto Slam Pro',
    category: 'basket',
    type: 'basket',
    basePrice: 29.99,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
    description: 'Tejido mesh abierto transpirable de alta resistencia con refuerzo de doble costura en sisas y cuello.',
    badge: 'Popular Equipos',
    customizableParts: ['Cuerpo', 'Ribetes', 'Dorsal Frontal y Trasero', 'Nombre', 'Logo'],
    rating: 4.8,
    reviewsCount: 88,
    leadTime: '3-5 días hábiles'
  },
  {
    id: 'hoodie-performance',
    name: 'Sudadera / Hoodie WarmUp Club',
    category: 'running',
    type: 'hoodie',
    basePrice: 48.00,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    description: 'Algodón afelpado con mezcla de poliéster técnico, bolsillo canguro y capucha con cordón ajustable reforzado.',
    badge: 'Ideal Temporada Fría',
    customizableParts: ['Cuerpo', 'Capucha', 'Logo Pecho', 'Espalda Gigante'],
    rating: 4.9,
    reviewsCount: 64,
    leadTime: '4-6 días hábiles'
  },
  {
    id: 'gorra-snapback-club',
    name: 'Gorra Técnica Snapback Pro',
    category: 'accesorios',
    type: 'cap',
    basePrice: 19.99,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
    description: 'Gorra estructurada de 6 paneles con visera plana o curva, banda interior absorbente y bordado frontal 3D.',
    badge: 'Bordado HD',
    customizableParts: ['Corona', 'Visera', 'Logo Bordado Frontal', 'Texto Trasero'],
    rating: 4.7,
    reviewsCount: 95,
    leadTime: '2-4 días hábiles'
  },
  {
    id: 'termo-deportivo-acero',
    name: 'Botella Térmica Inox 750ml',
    category: 'accesorios',
    type: 'bottle',
    basePrice: 16.50,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    description: 'Acero inoxidable de doble pared aislada al vacío. Mantiene bebidas frías 24h. Grabado láser de nombre y escudo.',
    badge: 'Grabado Láser',
    customizableParts: ['Color Frasco', 'Nombre de Jugador', 'Escudo del Club', 'Dorsal'],
    rating: 4.9,
    reviewsCount: 112,
    leadTime: '2-3 días hábiles'
  },
  {
    id: 'espinilleras-carbon-custom',
    name: 'Espinilleras de Impacto Shield',
    category: 'futbol',
    type: 'shinguards',
    basePrice: 24.99,
    image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=600&q=80',
    description: 'Carcasa de polímero ultraligero con acolchado EVA amortiguador. Sublimación fotográfica personalizada de alta resolución.',
    badge: '100% Personalizable',
    customizableParts: ['Foto / Diseño', 'Nombre', 'Dorsal', 'Banderas'],
    rating: 4.8,
    reviewsCount: 79,
    leadTime: '3-4 días hábiles'
  }
];

export const BULK_DISCOUNT_TIERS = [
  { min: 1, max: 5, discountPct: 0, label: 'Unidad suelta (1 - 5 uds)' },
  { min: 6, max: 11, discountPct: 15, label: 'Equipo pequeño (6 - 11 uds) -15%' },
  { min: 12, max: 24, discountPct: 25, label: 'Equipo completo (12 - 24 uds) -25%' },
  { min: 25, max: 999, discountPct: 35, label: 'Club / Torneo (+25 uds) -35%' }
];
