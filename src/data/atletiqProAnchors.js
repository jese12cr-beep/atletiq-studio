/**
 * ATLETIQ PRO — Coordenadas de Anclaje Textil y Serigrafía en Mapa 2048x2048
 *
 * Mapeo micrométrico exacto para el modelo 3D de alta definición `jersey_pro_781001.glb`:
 * Frente centrado en X ≈ 664, Espalda centrada en X ≈ 1617,
 * Manga Derecha en X ≈ 182, Manga Izquierda en X ≈ 1145.
 */

export const ATLETIQ_TEXTURE_SIZE = 2048;

export const ATLETIQ_PRO_ANCHORS = {
  // Pecho y Torso Frontal
  crestFrontLeft: {
    id: 'crestFrontLeft',
    name: 'Escudo Pecho Izquierdo (Corazón)',
    x: 776,
    y: 638,
    width: 130,
    height: 130,
    zone: 'front',
  },
  brandLogoFrontRight: {
    id: 'brandLogoFrontRight',
    name: 'Marca ATLETIQ Pecho Derecho',
    x: 552,
    y: 638,
    width: 120,
    height: 120,
    zone: 'front',
  },
  numberFront: {
    id: 'numberFront',
    name: 'Número Pecho (Frontal)',
    x: 664,
    y: 638,
    width: 120,
    height: 120,
    zone: 'front',
  },
  sponsorMain: {
    id: 'sponsorMain',
    name: 'Patrocinador Principal Pecho',
    x: 664,
    y: 810,
    width: 360,
    height: 140,
    zone: 'front',
  },
  sponsorSecondary: {
    id: 'sponsorSecondary',
    name: 'Patrocinador Inferior Frontal',
    x: 664,
    y: 955,
    width: 320,
    height: 100,
    zone: 'front',
  },

  // Espalda
  playerNameBack: {
    id: 'playerNameBack',
    name: 'Nombre de Jugador (Espalda Superior)',
    x: 1617,
    y: 575,
    width: 300,
    height: 70,
    zone: 'back',
  },
  numberBack: {
    id: 'numberBack',
    name: 'Dorsal Espalda (Número Principal)',
    x: 1617,
    y: 778,
    width: 360,
    height: 320,
    zone: 'back',
  },
  sponsorBackLower: {
    id: 'sponsorBackLower',
    name: 'Patrocinador Espalda Baja',
    x: 1617,
    y: 995,
    width: 340,
    height: 90,
    zone: 'back',
  },
  clubNameTop: {
    id: 'clubNameTop',
    name: 'Leyenda / Club Superior Trasero',
    x: 1617,
    y: 496,
    width: 220,
    height: 40,
    zone: 'back',
  },

  // Mangas
  badgeLeftSleeve: {
    id: 'badgeLeftSleeve',
    name: 'Parche Manga Izquierda (Competición)',
    x: 1145,
    y: 352,
    width: 120,
    height: 120,
    rotation: 270,
    zone: 'leftSleeve',
  },
  badgeRightSleeve: {
    id: 'badgeRightSleeve',
    name: 'Parche Manga Derecha (Liga MX)',
    x: 182,
    y: 352,
    width: 120,
    height: 120,
    rotation: 90,
    zone: 'rightSleeve',
  },
};
