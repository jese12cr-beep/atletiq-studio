/**
 * ATLETIQ Engine v3.1 — Geometría de Áreas Imprimibles, `sperrbezirke` y `SnapLines` (CustomInk + REA Owayo v6)
 *
 * Trabaja en milímetros físicos reales sobre un molde de referencia de 500 x 600 mm (Talla L)
 * y aplica las reglas reales extraídas de `parts.json`, `sperrbezirke.json` (`VonUntenCm: 5.00`)
 * y `getSnapLines.php` del motor Owayo v6.
 */

export const GARMENT_REFERENCE_MM = {
  width: 500,
  height: 600,
};

/**
 * Regla Owayo `sperrbezirke.json`: `{"Front": {"VonUntenCm": 5.00}, "Back": {"VonUntenCm": 5.00}}`
 * Los 50 mm inferiores del faldón están reservados al dobladillo de máquina recubridora.
 */
export const SPERRBEZIRK_BOTTOM_HEM_MM = 50;

/**
 * Métricas reales extraídas de `parts.json` y `getSnapLines.php` (`222m-Hero`):
 * `partStauchungsFaktor = hoehenfaktor / (groesseY / groesseX)`
 */
export const OWAYO_PART_METRICS = {
  front: {
    partName: 'Front',
    groesseX: 2048,
    groesseY: 2048,
    breiteCM: 63.2338,
    hoeheCM: 85.8962,
    hoehenfaktor: 1.35839,
    patternAnker: { x: 0.5, y: 0.26535 },
    snapLineX: 0.5,
    snapYRange: [0.03476, 0.75241],
  },
  back: {
    partName: 'Back',
    groesseX: 2048,
    groesseY: 2048,
    breiteCM: 44.461,
    hoeheCM: 79.8984,
    hoehenfaktor: 1.79704,
    patternAnker: { x: 0.5, y: 0.09113 },
    snapLineX: 0.5,
    snapYRange: [0.03285, 0.93817],
  },
};

export const SAFE_PRINT_ZONES = {
  front_chest_full: {
    id: 'front_chest_full',
    panel: 'front',
    label: 'Frente Imprimible Completo',
    xMm: 130,
    yMm: 130,
    widthMm: 240,
    heightMm: 310,
  },
  left_chest_crest: {
    id: 'left_chest_crest',
    panel: 'front',
    label: 'Escudo Pecho Izquierdo',
    xMm: 272,
    yMm: 142,
    widthMm: 82,
    heightMm: 82,
  },
  right_chest_logo: {
    id: 'right_chest_logo',
    panel: 'front',
    label: 'Logo Marca Pecho Derecho',
    xMm: 146,
    yMm: 142,
    widthMm: 82,
    heightMm: 82,
  },
  back_full: {
    id: 'back_full',
    panel: 'back',
    label: 'Espalda Segura Reglamentaria',
    xMm: 125,
    yMm: 115,
    widthMm: 250,
    heightMm: 345,
  },
};

const SNAP_THRESHOLD_MM = 6.5;

/**
 * Calcula los semi-anchos (Ex, Ey) de la caja envolvente alineada a los ejes (AABB)
 * producida por un rectángulo orientado (OBB) de tamaño (widthMm * scale, heightMm * scale)
 * rotado `rotationDeg` grados.
 */
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
 * Evalúa la posición de un decal respecto a su SafePrintZone y al `sperrbezirk` inferior de 50 mm (Owayo):
 *  1. Imanes inteligentes al eje central `x = 0.50` (`getSnapLines.php`) y líneas de pecho/sponsor.
 *  2. Detección matemática de desborde (`SafePrintZone` + `sperrbezirke` de dobladillo `VonUntenCm: 5.00`).
 *  3. Coordenadas restringidas (clamped) tanto a la zona segura como al lienzo total.
 */
export function evaluateDecalPlacement(decal, zoneOverride = null, enableMagneticSnap = true) {
  const zone =
    zoneOverride ||
    SAFE_PRINT_ZONES[decal.safeZoneId] ||
    (decal.panel === 'back' ? SAFE_PRINT_ZONES.back_full : SAFE_PRINT_ZONES.front_chest_full);

  const { halfWidthMm, halfHeightMm } = computeOBBEnvelope(
    decal.sizeMm.width,
    decal.sizeMm.height,
    decal.scale ?? 1,
    decal.rotationDeg ?? 0
  );

  let cx = decal.centerMm.x;
  let cy = decal.centerMm.y;

  const garmentCenterX = GARMENT_REFERENCE_MM.width / 2; // 250 mm -> x = 0.50 en getSnapLines.php
  const chestLineY = 183;
  const sponsorLineY = 278;

  const snapGuides = {
    verticalCenter: false,
    horizontalChest: false,
    horizontalSponsor: false,
  };

  if (enableMagneticSnap) {
    if (Math.abs(cx - garmentCenterX) <= SNAP_THRESHOLD_MM) {
      cx = garmentCenterX;
      snapGuides.verticalCenter = true;
    }
    if (decal.panel === 'front' && Math.abs(cy - chestLineY) <= SNAP_THRESHOLD_MM) {
      cy = chestLineY;
      snapGuides.horizontalChest = true;
    } else if (decal.panel === 'front' && Math.abs(cy - sponsorLineY) <= SNAP_THRESHOLD_MM) {
      cy = sponsorLineY;
      snapGuides.horizontalSponsor = true;
    }
  }

  // Límites de la zona segura de impresión (CustomInk)
  const minX = zone.xMm;
  const maxX = zone.xMm + zone.widthMm;
  const minY = zone.yMm;
  const maxY = zone.yMm + zone.heightMm;

  const overflowLeft = Math.max(0, minX - (cx - halfWidthMm));
  const overflowRight = Math.max(0, cx + halfWidthMm - maxX);
  const overflowTop = Math.max(0, minY - (cy - halfHeightMm));
  const overflowBottom = Math.max(0, cy + halfHeightMm - maxY);

  // Regla Owayo `sperrbezirke.json` (`VonUntenCm: 5.00` = 50 mm desde el borde inferior del molde de 600 mm)
  const sperrbezirkTopY = GARMENT_REFERENCE_MM.height - SPERRBEZIRK_BOTTOM_HEM_MM; // 550 mm
  const sperrbezirkPenetrationMm = Math.max(0, cy + halfHeightMm - sperrbezirkTopY);
  const inBottomHemSperrbezirk = sperrbezirkPenetrationMm > 0.5;

  const isOutOfSafeZone =
    overflowLeft > 0.5 ||
    overflowRight > 0.5 ||
    overflowTop > 0.5 ||
    overflowBottom > 0.5 ||
    inBottomHemSperrbezirk;

  // Coordenada restringida estrictamente dentro de la SafePrintZone
  const safeMinCx = minX + halfWidthMm;
  const safeMaxCx = maxX - halfWidthMm;
  const safeMinCy = minY + halfHeightMm;
  const safeMaxCy = Math.min(maxY, sperrbezirkTopY) - halfHeightMm;

  const clampedSafeCenterMm = {
    x: safeMinCx <= safeMaxCx ? Math.max(safeMinCx, Math.min(cx, safeMaxCx)) : (minX + maxX) / 2,
    y: safeMinCy <= safeMaxCy ? Math.max(safeMinCy, Math.min(cy, safeMaxCy)) : (minY + maxY) / 2,
  };

  // Coordenada alcanzable dentro de la pieza física respetando el bloqueo de costura `sperrbezirk` de 50 mm
  const canvasMargin = 35;
  const maxReachableY = Math.max(canvasMargin + halfHeightMm, sperrbezirkTopY - halfHeightMm);
  const reachableCenterMm = {
    x: Math.max(canvasMargin, Math.min(cx, GARMENT_REFERENCE_MM.width - canvasMargin)),
    y: Math.max(canvasMargin, Math.min(cy, maxReachableY)),
  };

  return {
    zone,
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

/**
 * Regla Owayo: Factor de compresión horizontal automática (`scaleX`) para apellidos largos
 * sin reducir la altura reglamentaria del texto.
 */
export function computeAutoCondenseScaleX(text = '', maxWidthMm = 240, capHeightMm = 48, charAspect = 0.62) {
  if (!text) return 1;
  const estimatedNaturalWidthMm = text.length * capHeightMm * charAspect;
  if (estimatedNaturalWidthMm <= maxWidthMm) return 1;
  return Math.max(0.48, +(maxWidthMm / estimatedNaturalWidthMm).toFixed(3));
}
