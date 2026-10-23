/**
 * ATLETIQ Engine v4.0 — Geometría Multi-Pieza Exacta (`parts.json`), `sperrbezirke` y `SnapLines` (Owayo v6 1:1)
 *
 * Soporta todas las piezas imprimibles de cada prenda:
 *  - Fútbol / E-Sports (`204m_Basic_KA`): `front`, `back`, `left_arm`, `right_arm`, `collar`
 *  - Baloncesto (`222m-Hero`): `front`, `back`
 */

export const GARMENT_REFERENCE_MM = {
  width: 519.25,
  height: 774.83,
};

export const SPERRBEZIRK_BOTTOM_HEM_MM = 50;

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
      snapYRange: [0.0274, 0.7774],
      safeMarginMm: { left: 75, right: 75, top: 120, bottom: 65 },
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
      snapYRange: [0.0268, 0.9508],
      safeMarginMm: { left: 95, right: 95, top: 85, bottom: 70 },
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
      snapCenterU: 0.445, // Eje central exterior de manga según getSnapLines.php
      snapYRange: [0.0842, 0.9722],
      safeMarginMm: { left: 115, right: 145, top: 35, bottom: 52 },
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
      snapCenterU: 0.555, // Eje central exterior simétrico de manga derecha
      snapYRange: [0.0842, 0.9722],
      safeMarginMm: { left: 145, right: 115, top: 35, bottom: 52 },
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
      snapYRange: [0.0, 1.0],
      safeMarginMm: { left: 120, right: 120, top: 6, bottom: 8 },
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
      snapYRange: [0.0348, 0.7524],
      safeMarginMm: { left: 135, right: 135, top: 185, bottom: 65 },
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
      snapYRange: [0.0329, 0.9382],
      safeMarginMm: { left: 75, right: 75, top: 110, bottom: 65 },
    },
  },
};

export function resolveMirlKeyForProduct(productModelId = 'futbol_jersey_pro_vneck') {
  if (productModelId === 'basketball_b6_hero') return 'basketball_b6_hero';
  return 'football_f3_ka';
}

export function getDroppablePanelsForProduct(productModelId = 'futbol_jersey_pro_vneck') {
  const key = resolveMirlKeyForProduct(productModelId);
  return Object.values(MODEL_PARTS_CATALOG[key]);
}

export function getPartSpec(productModelId = 'futbol_jersey_pro_vneck', panel = 'front') {
  const key = resolveMirlKeyForProduct(productModelId);
  const table = MODEL_PARTS_CATALOG[key];
  return table[panel] || table.front;
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
    default:
      return null;
  }
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

const SNAP_THRESHOLD_MM = 7.5;

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
 * Evalúa posición, SnapLines magnéticos por pieza (`Front`, `Back`, `LeftArm`, `RightArm`, `Collar`)
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

  const snapCenterX = spec.widthMm * spec.snapCenterU;
  const chestLineY = spec.heightMm * 0.255;
  const sponsorLineY = spec.heightMm * 0.385;

  const snapGuides = {
    verticalCenter: false,
    horizontalChest: false,
    horizontalSponsor: false,
    snapCenterX,
    chestLineY,
    sponsorLineY,
  };

  if (enableMagneticSnap) {
    if (Math.abs(cx - snapCenterX) <= SNAP_THRESHOLD_MM) {
      cx = snapCenterX;
      snapGuides.verticalCenter = true;
    }
    if (decal.panel === 'front' && Math.abs(cy - chestLineY) <= SNAP_THRESHOLD_MM) {
      cy = chestLineY;
      snapGuides.horizontalChest = true;
    } else if (decal.panel === 'front' && Math.abs(cy - sponsorLineY) <= SNAP_THRESHOLD_MM) {
      cy = sponsorLineY;
      snapGuides.horizontalSponsor = true;
    } else if ((decal.panel === 'left_arm' || decal.panel === 'right_arm') && Math.abs(cy - spec.heightMm * 0.56) <= SNAP_THRESHOLD_MM) {
      cy = spec.heightMm * 0.56;
      snapGuides.horizontalChest = true;
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
    x: safeMinCx <= safeMaxCx ? Math.max(safeMinCx, Math.min(cx, safeMaxCx)) : snapCenterX,
    y: safeMinCy <= safeMaxCy ? Math.max(safeMinCy, Math.min(cy, safeMaxCy)) : (minY + maxY) / 2,
  };

  // En modo ALL_OVER o SOFT_WARN se permite cubrir todo el patrón de corte completo (sangrado total de sublimación)
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
