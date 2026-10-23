/**
 * ATLETIQ Engine v5.0 — Geometría Multi-Pieza Exacta (`parts.json`), `sperrbezirke` y `SnapLines` (Owayo v6 1:1)
 *
 * Soporta los 4 moldes binarios `.mirl` reales:
 *  - Camiseta Fútbol (`football_f3_ka` / `204m_Basic_KA`): `front`, `back`, `left_arm`, `right_arm`, `collar`
 *  - Short Fútbol (`football_shorts_fp3` / `303m_Basic`): `right_leg`, `left_leg`
 *  - Camiseta Baloncesto (`basketball_b6_hero` / `222m-Hero`): `front`, `back`
 *  - Short Baloncesto (`basketball_shorts_bp6` / `313m-ENB`): `right_leg`, `left_leg`
 */

export const GARMENT_REFERENCE_MM = {
  width: 519.25,
  height: 774.83,
};

export const SPERRBEZIRK_BOTTOM_HEM_MM = 50;

export const ANGLE_SNAP_ANCHORS = [-180, -90, 0, 90, 180, 270, 360];
export const ANGLE_ANCHOR_SNAP_DEG = 8;

export function snapRotationAngle(deg, enableSnap = true) {
  let norm = ((deg % 360) + 360) % 360;
  if (!enableSnap) return Math.round(norm);
  for (const anchor of [0, 90, 180, 270, 360]) {
    if (Math.abs(norm - anchor) <= ANGLE_ANCHOR_SNAP_DEG) {
      return anchor === 360 ? 0 : anchor;
    }
  }
  return Math.round(norm);
}

/**
 * Especificaciones físicas reales extraídas de `parts.json`, `sperrbezirke.json` y `getSnapLines.php`
 */
export const MODEL_PARTS_CATALOG = {
  football_f3_ka: {
    front: {
      panelId: 'front',
      partName: 'Front',
      label: 'Frente / Pecho',
      shortLabel: 'Frente',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 519.25,
      heightMm: 774.83,
      hoehenfaktor: 1.4922,
      sperrbezirkMm: 50,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Centro Pecho' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.34,
      safeMarginMm: { left: 72, right: 72, top: 115, bottom: 60 },
    },
    back: {
      panelId: 'back',
      partName: 'Back',
      label: 'Espalda / Dorsal',
      shortLabel: 'Espalda',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 633.28,
      heightMm: 792.6,
      hoehenfaktor: 1.2516,
      sperrbezirkMm: 60,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Centro Espalda' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.38,
      safeMarginMm: { left: 90, right: 90, top: 82, bottom: 68 },
    },
    left_arm: {
      panelId: 'left_arm',
      partName: 'LeftArm',
      label: 'Manga Izquierda',
      shortLabel: 'Manga Izq.',
      groesseX: 1024,
      groesseY: 512,
      widthMm: 505.69,
      heightMm: 283.5,
      hoehenfaktor: 0.5606,
      sperrbezirkMm: 50,
      snapCenterU: 0.445,
      snapAxesU: [{ u: 0.445, label: 'Eje Exterior Manga Izq.' }],
      defaultPlaceU: 0.445,
      defaultPlaceV: 0.56,
      safeMarginMm: { left: 110, right: 140, top: 32, bottom: 52 },
    },
    right_arm: {
      panelId: 'right_arm',
      partName: 'RightArm',
      label: 'Manga Derecha',
      shortLabel: 'Manga Der.',
      groesseX: 1024,
      groesseY: 512,
      widthMm: 505.69,
      heightMm: 283.49,
      hoehenfaktor: 0.5606,
      sperrbezirkMm: 50,
      snapCenterU: 0.555,
      snapAxesU: [{ u: 0.555, label: 'Eje Exterior Manga Der.' }],
      defaultPlaceU: 0.555,
      defaultPlaceV: 0.56,
      safeMarginMm: { left: 140, right: 110, top: 32, bottom: 52 },
    },
    collar: {
      panelId: 'collar',
      partName: 'Collar',
      label: 'Cuello Exterior',
      shortLabel: 'Cuello',
      groesseX: 1024,
      groesseY: 128,
      widthMm: 571.53,
      heightMm: 50.5,
      hoehenfaktor: 0.08836,
      sperrbezirkMm: 8,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Nuca Central' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.5,
      safeMarginMm: { left: 120, right: 120, top: 6, bottom: 8 },
    },
  },

  football_shorts_fp3: {
    right_leg: {
      panelId: 'right_leg',
      partName: 'RightLeg',
      label: 'Pierna Derecha (Frente & Costado)',
      shortLabel: 'Pierna Der.',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 799.88,
      heightMm: 624.35,
      hoehenfaktor: 0.78056,
      sperrbezirkMm: 45,
      snapCenterU: 0.749, // Muslo frontal derecho exacto de getSnapLines.php
      snapAxesU: [
        { u: 0.749, label: 'Muslo Frontal Der.' },
        { u: 0.298, label: 'Costado Exterior Der.' },
      ],
      defaultPlaceU: 0.749,
      defaultPlaceV: 0.67,
      safeMarginMm: { left: 65, right: 65, top: 80, bottom: 50 },
    },
    left_leg: {
      panelId: 'left_leg',
      partName: 'LeftLeg',
      label: 'Pierna Izquierda (Frente & Costado)',
      shortLabel: 'Pierna Izq.',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 799.88,
      heightMm: 624.35,
      hoehenfaktor: 0.78056,
      sperrbezirkMm: 45,
      snapCenterU: 0.251, // Muslo frontal izquierdo exacto de getSnapLines.php
      snapAxesU: [
        { u: 0.251, label: 'Muslo Frontal Izq.' },
        { u: 0.702, label: 'Costado Exterior Izq.' },
      ],
      defaultPlaceU: 0.251,
      defaultPlaceV: 0.67,
      safeMarginMm: { left: 65, right: 65, top: 80, bottom: 50 },
    },
  },

  basketball_b6_hero: {
    front: {
      panelId: 'front',
      partName: 'Front',
      label: 'Frente / Pecho',
      shortLabel: 'Frente',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 632.34,
      heightMm: 858.96,
      hoehenfaktor: 1.3584,
      sperrbezirkMm: 50,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Centro Pecho' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.36,
      safeMarginMm: { left: 130, right: 130, top: 180, bottom: 60 },
    },
    back: {
      panelId: 'back',
      partName: 'Back',
      label: 'Espalda / Dorsal',
      shortLabel: 'Espalda',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 444.61,
      heightMm: 798.98,
      hoehenfaktor: 1.797,
      sperrbezirkMm: 50,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Centro Espalda' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.36,
      safeMarginMm: { left: 72, right: 72, top: 105, bottom: 60 },
    },
  },

  basketball_b7w_epic_women: {
    front: {
      panelId: 'front',
      partName: 'Front',
      label: 'Frente / Pecho Dama',
      shortLabel: 'Frente Dama',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 534.96,
      heightMm: 801.58,
      hoehenfaktor: 1.4984,
      sperrbezirkMm: 50,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Centro Pecho Dama' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.35,
      safeMarginMm: { left: 70, right: 70, top: 110, bottom: 55 },
    },
    back: {
      panelId: 'back',
      partName: 'Back',
      label: 'Espalda / Dorsal Dama',
      shortLabel: 'Espalda Dama',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 401.33,
      heightMm: 713.29,
      hoehenfaktor: 1.7773,
      sperrbezirkMm: 50,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Centro Espalda Dama' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.36,
      safeMarginMm: { left: 65, right: 65, top: 98, bottom: 55 },
    },
    side_left: {
      panelId: 'side_left',
      partName: 'Seitenteillinks',
      label: 'Costado Izquierdo Dama',
      shortLabel: 'Costado Izq.',
      groesseX: 512,
      groesseY: 1536,
      widthMm: 136.75,
      heightMm: 547.53,
      hoehenfaktor: 4.0038,
      sperrbezirkMm: 35,
      snapCenterU: 0.5,
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.5,
      safeMarginMm: { left: 15, right: 15, top: 40, bottom: 40 },
    },
    side_right: {
      panelId: 'side_right',
      partName: 'Seitenteilrechts',
      label: 'Costado Derecho Dama',
      shortLabel: 'Costado Der.',
      groesseX: 512,
      groesseY: 1536,
      widthMm: 136.75,
      heightMm: 547.53,
      hoehenfaktor: 4.0038,
      sperrbezirkMm: 35,
      snapCenterU: 0.5,
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.5,
      safeMarginMm: { left: 15, right: 15, top: 40, bottom: 40 },
    },
  },

  basketball_shorts_bp7w_women: {
    right_leg: {
      panelId: 'right_leg',
      partName: 'RechtesBeinvorne',
      label: 'Pierna Derecha Dama (Muslo Frontal)',
      shortLabel: 'Pierna Der. Dama',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 331.71,
      heightMm: 549.64,
      hoehenfaktor: 1.657,
      sperrbezirkMm: 45,
      snapCenterU: 0.527,
      snapAxesU: [{ u: 0.527, label: 'Eje Muslo Der.' }],
      defaultPlaceU: 0.527,
      defaultPlaceV: 0.62,
      safeMarginMm: { left: 45, right: 45, top: 60, bottom: 45 },
    },
    left_leg: {
      panelId: 'left_leg',
      partName: 'LinkesBeinvorne',
      label: 'Pierna Izquierda Dama (Muslo Frontal)',
      shortLabel: 'Pierna Izq. Dama',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 331.88,
      heightMm: 549.56,
      hoehenfaktor: 1.656,
      sperrbezirkMm: 45,
      snapCenterU: 0.473,
      snapAxesU: [{ u: 0.473, label: 'Eje Muslo Izq.' }],
      defaultPlaceU: 0.473,
      defaultPlaceV: 0.62,
      safeMarginMm: { left: 45, right: 45, top: 60, bottom: 45 },
    },
    side_right: {
      panelId: 'side_right',
      partName: 'Seitenstreifenrechts',
      label: 'Banda Lateral Derecha Dama',
      shortLabel: 'Banda Der.',
      groesseX: 512,
      groesseY: 1536,
      widthMm: 165.27,
      heightMm: 548.16,
      hoehenfaktor: 3.317,
      sperrbezirkMm: 40,
      snapCenterU: 0.5,
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.65,
      safeMarginMm: { left: 15, right: 15, top: 40, bottom: 40 },
    },
    side_left: {
      panelId: 'side_left',
      partName: 'Seitenstreifenlinks',
      label: 'Banda Lateral Izquierda Dama',
      shortLabel: 'Banda Izq.',
      groesseX: 512,
      groesseY: 1536,
      widthMm: 165.27,
      heightMm: 548.16,
      hoehenfaktor: 3.317,
      sperrbezirkMm: 40,
      snapCenterU: 0.5,
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.65,
      safeMarginMm: { left: 15, right: 15, top: 40, bottom: 40 },
    },
  },

  jacket_softshell_601m_men: {
    front_left: {
      panelId: 'front_left',
      partName: 'FrontLeftPart',
      label: 'Pecho Izquierdo (Escudo)',
      shortLabel: 'Pecho Izq.',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 284.75,
      heightMm: 777.93,
      hoehenfaktor: 2.732,
      sperrbezirkMm: 45,
      snapCenterU: 0.45,
      snapAxesU: [{ u: 0.45, label: 'Eje Pecho Izquierdo' }],
      defaultPlaceU: 0.45,
      defaultPlaceV: 0.32,
      safeMarginMm: { left: 35, right: 25, top: 90, bottom: 50 },
    },
    front_right: {
      panelId: 'front_right',
      partName: 'FrontRightPart',
      label: 'Pecho Derecho (Patrocinador / Logo)',
      shortLabel: 'Pecho Der.',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 284.75,
      heightMm: 777.93,
      hoehenfaktor: 2.732,
      sperrbezirkMm: 45,
      snapCenterU: 0.55,
      snapAxesU: [{ u: 0.55, label: 'Eje Pecho Derecho' }],
      defaultPlaceU: 0.55,
      defaultPlaceV: 0.32,
      safeMarginMm: { left: 25, right: 35, top: 90, bottom: 50 },
    },
    back: {
      panelId: 'back',
      partName: 'Back',
      label: 'Espalda / Dorsal Chaqueta',
      shortLabel: 'Espalda',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 528.88,
      heightMm: 725.80,
      hoehenfaktor: 1.372,
      sperrbezirkMm: 50,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Centro Espalda' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.36,
      safeMarginMm: { left: 75, right: 75, top: 85, bottom: 55 },
    },
    left_arm: {
      panelId: 'left_arm',
      partName: 'LeftArm',
      label: 'Manga Izquierda Chaqueta',
      shortLabel: 'Manga Izq.',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 306.55,
      heightMm: 731.68,
      hoehenfaktor: 2.387,
      sperrbezirkMm: 40,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Eje Manga Izq.' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.45,
      safeMarginMm: { left: 45, right: 45, top: 80, bottom: 45 },
    },
    right_arm: {
      panelId: 'right_arm',
      partName: 'RightArm',
      label: 'Manga Derecha Chaqueta',
      shortLabel: 'Manga Der.',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 306.55,
      heightMm: 731.68,
      hoehenfaktor: 2.387,
      sperrbezirkMm: 40,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Eje Manga Der.' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.45,
      safeMarginMm: { left: 45, right: 45, top: 80, bottom: 45 },
    },
    collar: {
      panelId: 'collar',
      partName: 'CollarOutside',
      label: 'Cuello Alto Chaqueta',
      shortLabel: 'Cuello',
      groesseX: 512,
      groesseY: 1536,
      widthMm: 121.40,
      heightMm: 467.78,
      hoehenfaktor: 3.853,
      sperrbezirkMm: 12,
      snapCenterU: 0.5,
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.5,
      safeMarginMm: { left: 15, right: 15, top: 20, bottom: 20 },
    },
  },

  jacket_softshell_601w_women: {
    front_left: {
      panelId: 'front_left',
      partName: 'FrontLeftPart',
      label: 'Pecho Izquierdo Dama',
      shortLabel: 'Pecho Izq. Dama',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 297.03,
      heightMm: 722.35,
      hoehenfaktor: 2.432,
      sperrbezirkMm: 45,
      snapCenterU: 0.45,
      snapAxesU: [{ u: 0.45, label: 'Eje Pecho Izquierdo Dama' }],
      defaultPlaceU: 0.45,
      defaultPlaceV: 0.32,
      safeMarginMm: { left: 35, right: 25, top: 85, bottom: 50 },
    },
    front_right: {
      panelId: 'front_right',
      partName: 'FrontRightPart',
      label: 'Pecho Derecho Dama',
      shortLabel: 'Pecho Der. Dama',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 297.03,
      heightMm: 722.35,
      hoehenfaktor: 2.432,
      sperrbezirkMm: 45,
      snapCenterU: 0.55,
      snapAxesU: [{ u: 0.55, label: 'Eje Pecho Derecho Dama' }],
      defaultPlaceU: 0.55,
      defaultPlaceV: 0.32,
      safeMarginMm: { left: 25, right: 35, top: 85, bottom: 50 },
    },
    back: {
      panelId: 'back',
      partName: 'Back',
      label: 'Espalda Dama Entallada',
      shortLabel: 'Espalda Dama',
      groesseX: 1536,
      groesseY: 1536,
      widthMm: 462.88,
      heightMm: 669.23,
      hoehenfaktor: 1.446,
      sperrbezirkMm: 50,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Centro Espalda Dama' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.36,
      safeMarginMm: { left: 65, right: 65, top: 80, bottom: 50 },
    },
    left_arm: {
      panelId: 'left_arm',
      partName: 'LeftArm',
      label: 'Manga Izquierda Dama',
      shortLabel: 'Manga Izq. Dama',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 277.78,
      heightMm: 667.63,
      hoehenfaktor: 2.404,
      sperrbezirkMm: 40,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Eje Manga Izq. Dama' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.45,
      safeMarginMm: { left: 40, right: 40, top: 75, bottom: 40 },
    },
    right_arm: {
      panelId: 'right_arm',
      partName: 'RightArm',
      label: 'Manga Derecha Dama',
      shortLabel: 'Manga Der. Dama',
      groesseX: 1024,
      groesseY: 1536,
      widthMm: 277.75,
      heightMm: 667.63,
      hoehenfaktor: 2.404,
      sperrbezirkMm: 40,
      snapCenterU: 0.5,
      snapAxesU: [{ u: 0.5, label: 'Eje Manga Der. Dama' }],
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.45,
      safeMarginMm: { left: 40, right: 40, top: 75, bottom: 40 },
    },
    collar: {
      panelId: 'collar',
      partName: 'CollarOutside',
      label: 'Cuello Alto Dama',
      shortLabel: 'Cuello Dama',
      groesseX: 512,
      groesseY: 1536,
      widthMm: 121.40,
      heightMm: 467.78,
      hoehenfaktor: 3.853,
      sperrbezirkMm: 12,
      snapCenterU: 0.5,
      defaultPlaceU: 0.5,
      defaultPlaceV: 0.5,
      safeMarginMm: { left: 15, right: 15, top: 20, bottom: 20 },
    },
  },
};

export function resolveMirlKeyForProduct(productModelId = 'futbol_jersey_pro_vneck') {
  switch (productModelId) {
    case 'basketball_b6_hero':
      return 'basketball_b6_hero';
    case 'basketball_shorts_bp6':
      return 'basketball_shorts_bp6';
    case 'football_shorts_fp3':
      return 'football_shorts_fp3';
    case 'basketball_b7w_epic_women':
      return 'basketball_b7w_epic_women';
    case 'basketball_shorts_bp7w_women':
      return 'basketball_shorts_bp7w_women';
    case 'jacket_softshell_601m_men':
      return 'jacket_softshell_601m_men';
    case 'jacket_softshell_601w_women':
      return 'jacket_softshell_601w_women';
    default:
      return 'football_f3_ka';
  }
}

export function isShortsProduct(productModelId = '') {
  return (
    productModelId === 'basketball_shorts_bp6' ||
    productModelId === 'football_shorts_fp3' ||
    productModelId === 'basketball_shorts_bp7w_women'
  );
}

export function isJacketProduct(productModelId = '') {
  return (
    productModelId === 'jacket_softshell_601m_men' ||
    productModelId === 'jacket_softshell_601w_women'
  );
}

export function getDroppablePanelsForProduct(productModelId = 'futbol_jersey_pro_vneck') {
  const key = resolveMirlKeyForProduct(productModelId);
  return Object.values(MODEL_PARTS_CATALOG[key]);
}

export function getDefaultPanelForProduct(productModelId = 'futbol_jersey_pro_vneck') {
  const panels = getDroppablePanelsForProduct(productModelId);
  return panels[0]?.panelId || 'front';
}

export function getPartSpec(productModelId = 'futbol_jersey_pro_vneck', panel = 'front') {
  const key = resolveMirlKeyForProduct(productModelId);
  const table = MODEL_PARTS_CATALOG[key];
  return table[panel] || Object.values(table)[0];
}

export function mapMeshPartNameToPanel(partName = '') {
  switch (partName) {
    case 'Front':
      return 'front';
    case 'Back':
      return 'back';
    case 'LeftArm':
      return 'left_arm';
    case 'RightArm':
      return 'right_arm';
    case 'Collar':
      return 'collar';
    case 'LeftLeg':
      return 'left_leg';
    case 'RightLeg':
      return 'right_leg';
    case 'FrontLeftPart':
      return 'front_left';
    case 'FrontRightPart':
      return 'front_right';
    case 'CollarOutside':
      return 'collar';
    case 'Seitenteillinks':
      return 'side_left';
    case 'Seitenteilrechts':
      return 'side_right';
    case 'LinkesBeinvorne':
      return 'left_leg';
    case 'RechtesBeinvorne':
      return 'right_leg';
    case 'Seitenstreifenlinks':
      return 'side_left';
    case 'Seitenstreifenrechts':
      return 'side_right';
    default:
      return null;
  }
}

export function getMirrorSymmetryTarget(productModelId, decal) {
  if (!decal) return null;
  if (decal.panel === 'front_left' || decal.panel === 'front_right') {
    const targetPanel = decal.panel === 'front_left' ? 'front_right' : 'front_left';
    const srcSpec = getPartSpec(productModelId, decal.panel);
    const dstSpec = getPartSpec(productModelId, targetPanel);
    const u = decal.centerMm.x / srcSpec.widthMm;
    return {
      panel: targetPanel,
      label: `${decal.label} (${dstSpec.shortLabel})`,
      centerMm: {
        x: Math.round((1 - u) * dstSpec.widthMm * 10) / 10,
        y: decal.centerMm.y,
      },
    };
  }
  if (decal.panel === 'side_left' || decal.panel === 'side_right') {
    const targetPanel = decal.panel === 'side_left' ? 'side_right' : 'side_left';
    const srcSpec = getPartSpec(productModelId, decal.panel);
    const dstSpec = getPartSpec(productModelId, targetPanel);
    const u = decal.centerMm.x / srcSpec.widthMm;
    return {
      panel: targetPanel,
      label: `${decal.label} (${dstSpec.shortLabel})`,
      centerMm: {
        x: Math.round((1 - u) * dstSpec.widthMm * 10) / 10,
        y: decal.centerMm.y,
      },
    };
  }
  if (decal.panel === 'left_arm' || decal.panel === 'right_arm') {
    const targetPanel = decal.panel === 'left_arm' ? 'right_arm' : 'left_arm';
    const srcSpec = getPartSpec(productModelId, decal.panel);
    const dstSpec = getPartSpec(productModelId, targetPanel);
    const u = decal.centerMm.x / srcSpec.widthMm;
    return {
      panel: targetPanel,
      label: `${decal.label} (${dstSpec.shortLabel})`,
      centerMm: {
        x: Math.round((1 - u) * dstSpec.widthMm * 10) / 10,
        y: decal.centerMm.y,
      },
    };
  }
  if (decal.panel === 'left_leg' || decal.panel === 'right_leg') {
    const targetPanel = decal.panel === 'left_leg' ? 'right_leg' : 'left_leg';
    const srcSpec = getPartSpec(productModelId, decal.panel);
    const dstSpec = getPartSpec(productModelId, targetPanel);
    const u = decal.centerMm.x / srcSpec.widthMm;
    return {
      panel: targetPanel,
      label: `${decal.label} (${dstSpec.shortLabel})`,
      centerMm: {
        x: Math.round((1 - u) * dstSpec.widthMm * 10) / 10,
        y: decal.centerMm.y,
      },
    };
  }
  return null;
}

export const OWAYO_PART_METRICS = MODEL_PARTS_CATALOG.football_f3_ka;

export const SAFE_PRINT_ZONES = {
  front_chest_full: {
    id: 'front_chest_full',
    panel: 'front',
    label: 'Frente Imprimible',
    xMm: 75,
    yMm: 120,
    widthMm: 369,
    heightMm: 585,
  },
  back_full: {
    id: 'back_full',
    panel: 'back',
    label: 'Espalda Imprimible',
    xMm: 95,
    yMm: 85,
    widthMm: 443,
    heightMm: 635,
  },
  left_arm_patch: {
    id: 'left_arm_patch',
    panel: 'left_arm',
    label: 'Manga Izquierda',
    xMm: 115,
    yMm: 35,
    widthMm: 245,
    heightMm: 196,
  },
  right_arm_patch: {
    id: 'right_arm_patch',
    panel: 'right_arm',
    label: 'Manga Derecha',
    xMm: 145,
    yMm: 35,
    widthMm: 245,
    heightMm: 196,
  },
  collar_band: {
    id: 'collar_band',
    panel: 'collar',
    label: 'Banda de Cuello',
    xMm: 120,
    yMm: 6,
    widthMm: 330,
    heightMm: 36,
  },
};

const SNAP_THRESHOLD_MM = 8.5;

export function computeOBBEnvelope(widthMm, heightMm, scale = 1, rotationDeg = 0) {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const w = widthMm * scale;
  const h = heightMm * scale;

  return {
    halfWidthMm: (w * cos + h * sin) / 2,
    halfHeightMm: (w * sin + h * cos) / 2,
  };
}

/**
 * Evalúa posición, SnapLines magnéticos multi-eje (`Front`, `Back`, `LeftArm`, `RightArm`, `Collar`, `LeftLeg`, `RightLeg`)
 * y `sperrbezirke` de dobladillo. Soporta modo libre All-Over (`bleedEnforcement === 'ALL_OVER'`).
 */
export function evaluateDecalPlacement(
  decal,
  productModelId = 'futbol_jersey_pro_vneck',
  enableMagneticSnap = true,
  bleedEnforcement = 'SOFT_WARN'
) {
  const spec = getPartSpec(productModelId || 'futbol_jersey_pro_vneck', decal.panel || 'front');
  const { halfWidthMm, halfHeightMm } = computeOBBEnvelope(
    decal.sizeMm.width,
    decal.sizeMm.height,
    decal.scale ?? 1,
    decal.rotationDeg ?? 0
  );

  let cx = decal.centerMm.x;
  let cy = decal.centerMm.y;

  const axes = (spec.snapAxesU || [{ u: spec.snapCenterU, label: 'Centro' }]).map((a) => ({
    xMm: spec.widthMm * a.u,
    label: a.label,
  }));
  const chestLineY = spec.heightMm * 0.255;
  const sponsorLineY = spec.heightMm * 0.385;
  const thighLineY = spec.heightMm * 0.67;

  const snapGuides = {
    verticalCenter: false,
    horizontalChest: false,
    horizontalSponsor: false,
    snapCenterX: axes[0].xMm,
    activeSnapLabel: '',
    allAxesMm: axes,
    chestLineY,
    sponsorLineY,
  };

  if (enableMagneticSnap) {
    for (const ax of axes) {
      if (Math.abs(cx - ax.xMm) <= SNAP_THRESHOLD_MM) {
        cx = ax.xMm;
        snapGuides.verticalCenter = true;
        snapGuides.snapCenterX = ax.xMm;
        snapGuides.activeSnapLabel = ax.label;
        break;
      }
    }

    if (decal.panel === 'front' && Math.abs(cy - chestLineY) <= SNAP_THRESHOLD_MM) {
      cy = chestLineY;
      snapGuides.horizontalChest = true;
    } else if (decal.panel === 'front' && Math.abs(cy - sponsorLineY) <= SNAP_THRESHOLD_MM) {
      cy = sponsorLineY;
      snapGuides.horizontalSponsor = true;
    } else if (
      (decal.panel === 'left_arm' || decal.panel === 'right_arm') &&
      Math.abs(cy - spec.heightMm * 0.56) <= SNAP_THRESHOLD_MM
    ) {
      cy = spec.heightMm * 0.56;
      snapGuides.horizontalChest = true;
    } else if (
      (decal.panel === 'left_leg' || decal.panel === 'right_leg') &&
      Math.abs(cy - thighLineY) <= SNAP_THRESHOLD_MM
    ) {
      cy = thighLineY;
      snapGuides.horizontalSponsor = true;
      snapGuides.sponsorLineY = thighLineY;
    }
  }

  const minX = spec.safeMarginMm.left;
  const maxX = spec.widthMm - spec.safeMarginMm.right;
  const minY = spec.safeMarginMm.top;
  const maxY = spec.heightMm - spec.safeMarginMm.bottom;

  const overflowLeft = Math.max(0, minX - (cx - halfWidthMm));
  const overflowRight = Math.max(0, cx + halfWidthMm - maxX);
  const overflowTop = Math.max(0, minY - (cy - halfHeightMm));
  const overflowBottom = Math.max(0, cy + halfHeightMm - maxY);

  const sperrbezirkTopY = spec.heightMm - spec.sperrbezirkMm;
  const sperrbezirkPenetrationMm = Math.max(0, cy + halfHeightMm - sperrbezirkTopY);
  const inBottomHemSperrbezirk = sperrbezirkPenetrationMm > 0.5;

  const isOutOfSafeZone =
    bleedEnforcement !== 'ALL_OVER' &&
    (overflowLeft > 0.5 ||
      overflowRight > 0.5 ||
      overflowTop > 0.5 ||
      overflowBottom > 0.5 ||
      inBottomHemSperrbezirk);

  const safeMinCx = minX + halfWidthMm;
  const safeMaxCx = maxX - halfWidthMm;
  const safeMinCy = minY + halfHeightMm;
  const safeMaxCy = Math.min(maxY, sperrbezirkTopY) - halfHeightMm;

  const clampedSafeCenterMm = {
    x: safeMinCx <= safeMaxCx ? Math.max(safeMinCx, Math.min(cx, safeMaxCx)) : axes[0].xMm,
    y: safeMinCy <= safeMaxCy ? Math.max(safeMinCy, Math.min(cy, safeMaxCy)) : (minY + maxY) / 2,
  };

  const reachableCenterMm =
    bleedEnforcement === 'ALL_OVER'
      ? {
          x: Math.max(-spec.widthMm * 0.25, Math.min(cx, spec.widthMm * 1.25)),
          y: Math.max(-spec.heightMm * 0.25, Math.min(cy, spec.heightMm * 1.25)),
        }
      : {
          x: Math.max(8, Math.min(cx, spec.widthMm - 8)),
          y: Math.max(8, Math.min(cy, spec.heightMm - 8)),
        };

  return {
    spec,
    envelope: { halfWidthMm, halfHeightMm },
    snappedCenterMm: reachableCenterMm,
    clampedSafeCenterMm,
    isOutOfSafeZone,
    inBottomHemSperrbezirk,
    sperrbezirkTopY,
    maxOverflowMm: Math.round(
      Math.max(overflowLeft, overflowRight, overflowTop, overflowBottom, sperrbezirkPenetrationMm)
    ),
    snapGuides,
  };
}

export function computeAutoCondenseScaleX(text = '', maxWidthMm = 260, capHeightMm = 48, charAspect = 0.62) {
  if (!text) return 1;
  const estimatedNaturalWidthMm = text.length * capHeightMm * charAspect;
  if (estimatedNaturalWidthMm <= maxWidthMm) return 1;
  return Math.max(0.45, +(maxWidthMm / estimatedNaturalWidthMm).toFixed(3));
}
