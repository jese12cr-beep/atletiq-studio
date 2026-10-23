/**
 * ATLETIQ Engine v3.0 — Compositor UV Vectorial + Escudos + Slots Variables (Kit Builder + Owayo + CustomInk)
 *
 * Pinta un Atlas UV de 2048 x 1024 px:
 *   - Mitad izquierda [0..1024, 0..1024]: Panel Delantero (500 x 600 mm)
 *   - Mitad derecha   [1024..2048, 0..1024]: Panel Trasero (500 x 600 mm)
 *
 * También permite renderizar guías de Bounding Boxes (CustomInk) para el modo de edición 2D preciso.
 */

import {
  GARMENT_REFERENCE_MM,
  SAFE_PRINT_ZONES,
  computeAutoCondenseScaleX,
  evaluateDecalPlacement,
} from '../core/boundingBoxMath';

export const UV_ATLAS_WIDTH = 2048;
export const UV_ATLAS_HEIGHT = 1024;
export const PANEL_PX = 1024;

export function mmToPanelPx(xMm, yMm) {
  return {
    x: (xMm / GARMENT_REFERENCE_MM.width) * PANEL_PX,
    y: (yMm / GARMENT_REFERENCE_MM.height) * PANEL_PX,
  };
}

export function panelPxToMm(pxX, pxY) {
  return {
    x: (pxX / PANEL_PX) * GARMENT_REFERENCE_MM.width,
    y: (pxY / PANEL_PX) * GARMENT_REFERENCE_MM.height,
  };
}

/**
 * Dibuja escudos vectoriales predefinidos limpios en alta resolución.
 */
export function drawPresetCrest(ctx, presetId, w, h, colors) {
  const hw = w / 2;
  const hh = h / 2;
  ctx.save();

  if (presetId === 'eagle_crest') {
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(hw, hh), 0, Math.PI * 2);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.lineWidth = Math.max(2, w * 0.06);
    ctx.strokeStyle = colors.accents?.hex || '#facc15';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-hw * 0.65, -hh * 0.18);
    ctx.quadraticCurveTo(0, -hh * 0.65, hw * 0.65, -hh * 0.18);
    ctx.quadraticCurveTo(hw * 0.3, hh * 0.35, 0, hh * 0.72);
    ctx.quadraticCurveTo(-hw * 0.3, hh * 0.35, -hw * 0.65, -hh * 0.18);
    ctx.fill();
  } else if (presetId === 'bolt_pro') {
    ctx.beginPath();
    ctx.moveTo(hw * 0.15, -hh * 0.9);
    ctx.lineTo(-hw * 0.65, hh * 0.08);
    ctx.lineTo(-hw * 0.05, hh * 0.08);
    ctx.lineTo(-hw * 0.25, hh * 0.9);
    ctx.lineTo(hw * 0.65, -hh * 0.1);
    ctx.lineTo(hw * 0.05, -hh * 0.1);
    ctx.closePath();
    ctx.fillStyle = colors.accents?.hex || '#facc15';
    ctx.fill();
    ctx.lineWidth = Math.max(2, w * 0.05);
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();
  } else if (presetId === 'lion_gold') {
    ctx.beginPath();
    ctx.roundRect(-hw * 0.85, -hh * 0.9, w * 0.85, h * 0.9, w * 0.22);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = Math.max(2, w * 0.06);
    ctx.strokeStyle = '#facc15';
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = `900 ${Math.round(h * 0.42)}px 'Bebas Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PRO', 0, hh * 0.06);
  } else {
    // Escudo Real Clásico ('royal_shield')
    ctx.beginPath();
    ctx.moveTo(0, -hh * 0.92);
    ctx.lineTo(hw * 0.85, -hh * 0.56);
    ctx.lineTo(hw * 0.85, hh * 0.14);
    ctx.bezierCurveTo(hw * 0.85, hh * 0.58, 0, hh * 0.94, 0, hh * 0.94);
    ctx.bezierCurveTo(0, hh * 0.94, -hw * 0.85, hh * 0.58, -hw * 0.85, hh * 0.14);
    ctx.lineTo(-hw * 0.85, -hh * 0.56);
    ctx.closePath();
    ctx.fillStyle = colors.accents?.hex || '#facc15';
    ctx.fill();
    ctx.lineWidth = Math.max(2, w * 0.05);
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.save();
    ctx.scale(0.78, 0.78);
    ctx.fillStyle = colors.primary?.hex || '#1d4ed8';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = `900 ${Math.round(h * 0.34)}px 'Bebas Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FC', 0, hh * 0.05);
  }

  ctx.restore();
}

/**
 * Pinta el patrón vectorial de sublimación sobre un panel (1024x1024).
 */
function renderVectorSublimationPattern(ctx, patternId, colorZones, panel = 'front') {
  const cPrimary = colorZones.primary?.hex || '#1d4ed8';
  const cSecondary = colorZones.secondary?.hex || '#0f172a';
  const cAccent = colorZones.accents?.hex || '#facc15';

  ctx.fillStyle = cPrimary;
  ctx.fillRect(0, 0, PANEL_PX, PANEL_PX);

  if (patternId === 'classic_stripes') {
    const stripeCount = 9;
    const sw = PANEL_PX / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      if (i % 2 === 1) {
        ctx.fillStyle = cSecondary;
        ctx.fillRect(i * sw, 0, sw, PANEL_PX);
        ctx.fillStyle = cAccent;
        ctx.fillRect(i * sw - 2, 0, 4, PANEL_PX);
      }
    }
  } else if (patternId === 'chest_band') {
    ctx.fillStyle = cSecondary;
    ctx.fillRect(0, PANEL_PX * 0.35, PANEL_PX, PANEL_PX * 0.2);
    ctx.fillStyle = cAccent;
    ctx.fillRect(0, PANEL_PX * 0.34, PANEL_PX, PANEL_PX * 0.015);
    ctx.fillRect(0, PANEL_PX * 0.55, PANEL_PX, PANEL_PX * 0.015);
  } else if (patternId === 'diagonal_sash') {
    ctx.save();
    ctx.translate(PANEL_PX / 2, PANEL_PX / 2);
    ctx.rotate(panel === 'front' ? -Math.PI / 4 : Math.PI / 4);
    ctx.fillStyle = cSecondary;
    ctx.fillRect(-PANEL_PX, -85, PANEL_PX * 2, 170);
    ctx.fillStyle = cAccent;
    ctx.fillRect(-PANEL_PX, -97, PANEL_PX * 2, 12);
    ctx.fillRect(-PANEL_PX, 85, PANEL_PX * 2, 12);
    ctx.restore();
  } else if (patternId === 'cyber_gradient') {
    const grad = ctx.createLinearGradient(0, PANEL_PX * 0.12, 0, PANEL_PX * 0.92);
    grad.addColorStop(0, cPrimary);
    grad.addColorStop(0.55, cSecondary);
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, PANEL_PX, PANEL_PX);

    // Puntos halftone geométricos
    ctx.fillStyle = cAccent;
    for (let y = 260; y < 860; y += 28) {
      const radius = Math.max(1.5, ((y - 240) / 620) * 8.5);
      for (let x = 140; x < PANEL_PX - 140; x += 28) {
        ctx.globalAlpha = 0.24;
        ctx.beginPath();
        ctx.arc(x + ((y / 28) % 2) * 14, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  } else if (patternId === 'chevron_v') {
    for (let k = 0; k < 2; k++) {
      const yOff = 290 + k * 95;
      ctx.beginPath();
      ctx.moveTo(0, yOff - 90);
      ctx.lineTo(PANEL_PX / 2, yOff + 75);
      ctx.lineTo(PANEL_PX, yOff - 90);
      ctx.lineTo(PANEL_PX, yOff - 30);
      ctx.lineTo(PANEL_PX / 2, yOff + 135);
      ctx.lineTo(0, yOff - 30);
      ctx.closePath();
      ctx.fillStyle = k === 0 ? cSecondary : cAccent;
      ctx.fill();
    }
  } else if (patternId === 'half_split') {
    ctx.fillStyle = cSecondary;
    ctx.fillRect(PANEL_PX / 2, 0, PANEL_PX / 2, PANEL_PX);
    ctx.fillStyle = cAccent;
    ctx.fillRect(PANEL_PX / 2 - 5, 0, 10, PANEL_PX);
  } else if (patternId === 'hex_matrix') {
    ctx.strokeStyle = cAccent;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.24;
    const r = 34;
    const dx = r * 1.5;
    const dy = r * Math.sqrt(3);
    for (let gx = 0; gx < PANEL_PX + dx; gx += dx) {
      for (let gy = 0; gy < PANEL_PX + dy; gy += dy) {
        const cy = gy + (Math.round(gx / dx) % 2 === 1 ? dy / 2 : 0);
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const ang = (Math.PI / 3) * s;
          const px = gx + r * Math.cos(ang);
          const py = cy + r * Math.sin(ang);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Costuras laterales transpirables y dobladillo inferior
  ctx.fillStyle = colorZones.sleeves?.hex || cSecondary;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(0, 0, PANEL_PX * 0.12, PANEL_PX);
  ctx.fillRect(PANEL_PX * 0.88, 0, PANEL_PX * 0.12, PANEL_PX);
  ctx.globalAlpha = 1;

  // Ribete inferior de cintura
  ctx.fillStyle = cAccent;
  ctx.fillRect(0, PANEL_PX * 0.905, PANEL_PX, 18);
}

/**
 * Renderiza un panel completo (frente o espalda) sobre el contexto indicado.
 */
export function renderGarmentPanel(
  ctx,
  design,
  panel = 'front',
  activePlayer = { name: 'RODRÍGUEZ', number: '10' },
  artworkRegistry = {},
  interactiveOpts = { showGuides: false, selectedDecalId: null }
) {
  renderVectorSublimationPattern(ctx, design.patternId, design.colorZones, panel);

  // 1. Pintar Decals (Logos subidos, escudos y patrocinadores)
  const panelDecals = (design.decals || []).filter((d) => d.panel === panel);

  for (const decal of panelDecals) {
    const evalResult = evaluateDecalPlacement(decal, null, false);
    const { x: cx, y: cy } = mmToPanelPx(decal.centerMm.x, decal.centerMm.y);
    const wPx = (decal.sizeMm.width / GARMENT_REFERENCE_MM.width) * PANEL_PX * (decal.scale ?? 1);
    const hPx = (decal.sizeMm.height / GARMENT_REFERENCE_MM.height) * PANEL_PX * (decal.scale ?? 1);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((decal.rotationDeg || 0) * Math.PI) / 180);

    if (decal.type === 'PRESET_CREST') {
      drawPresetCrest(ctx, decal.presetId, wPx, hPx, design.colorZones);
    } else if (decal.type === 'UPLOADED_RASTER' || decal.type === 'UPLOADED_VECTOR') {
      const art = artworkRegistry[decal.artworkId];
      if (art?.imageElement) {
        ctx.drawImage(art.imageElement, -wPx / 2, -hPx / 2, wPx, hPx);
      }
    } else if (decal.type === 'STATIC_TEXT' && decal.text) {
      const fontSize = Math.round(hPx * 0.82);
      ctx.font = `900 ${fontSize}px ${decal.fontFamily || "'Chakra Petch', sans-serif"}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(3, fontSize * 0.14);
      ctx.strokeStyle = decal.outlineHex || '#0f172a';
      ctx.strokeText(decal.text.toUpperCase(), 0, 0);
      ctx.fillStyle = decal.fillHex || '#ffffff';
      ctx.fillText(decal.text.toUpperCase(), 0, 0);
    }

    // Si en modo interactivo se sale de la SafePrintZone, resaltar borde de alerta (CustomInk style)
    if (interactiveOpts.showGuides && evalResult.isOutOfSafeZone) {
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 4;
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(-wPx / 2 - 4, -hPx / 2 - 4, wPx + 8, hPx + 8);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
      ctx.fillRect(-wPx / 2, -hPx / 2, wPx, hPx);
    }

    ctx.restore();
  }

  // 2. Pintar Variable Slots (Estilo Owayo: Nombres auto-condensados y Dorsales reglamentarios)
  const slots = design.variableSlots || {};

  if (panel === 'front' && slots.playerNumberFront?.enabled && activePlayer?.number) {
    const slot = slots.playerNumberFront;
    const { x, y } = mmToPanelPx(slot.centerMm.x, slot.centerMm.y);
    const fontPx = Math.round((slot.heightMm / GARMENT_REFERENCE_MM.height) * PANEL_PX);
    ctx.save();
    ctx.font = `900 ${fontPx}px ${slot.fontFamily || "'Bebas Neue', sans-serif"}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(4, fontPx * 0.14);
    ctx.strokeStyle = slot.outlineHex || '#0f172a';
    ctx.strokeText(activePlayer.number, x, y);
    ctx.fillStyle = slot.fillHex || '#facc15';
    ctx.fillText(activePlayer.number, x, y);
    ctx.restore();
  }

  if (panel === 'back') {
    // Nombre de Jugador con Auto-Condense horizontal Owayo
    if (slots.playerNameBack?.enabled && activePlayer?.name) {
      const slot = slots.playerNameBack;
      const { x, y } = mmToPanelPx(slot.centerMm.x, slot.centerMm.y);
      const fontPx = Math.round((slot.capHeightMm / GARMENT_REFERENCE_MM.height) * PANEL_PX);
      const condenseX = slot.autoCondense
        ? computeAutoCondenseScaleX(activePlayer.name, slot.maxWidthMm, slot.capHeightMm)
        : 1;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(condenseX, 1);
      ctx.font = `900 ${fontPx}px ${slot.fontFamily || "'Bebas Neue', sans-serif"}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(5, fontPx * 0.16);
      ctx.strokeStyle = slot.outlineHex || '#0f172a';
      ctx.strokeText(activePlayer.name.toUpperCase(), 0, 0);
      ctx.fillStyle = slot.fillHex || '#ffffff';
      ctx.fillText(activePlayer.name.toUpperCase(), 0, 0);
      ctx.restore();
    }

    // Dorsal Gigante Trasero con triple capa deportiva
    if (slots.playerNumberBack?.enabled && activePlayer?.number) {
      const slot = slots.playerNumberBack;
      const { x, y } = mmToPanelPx(slot.centerMm.x, slot.centerMm.y);
      const fontPx = Math.round((slot.heightMm / GARMENT_REFERENCE_MM.height) * PANEL_PX);

      ctx.save();
      ctx.font = `900 ${fontPx}px ${slot.fontFamily || "'Bebas Neue', sans-serif"}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';

      // Sombra proyectada sutil
      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.fillText(activePlayer.number, x + 5, y + 7);

      // Borde exterior grueso
      ctx.lineWidth = Math.max(10, fontPx * 0.1);
      ctx.strokeStyle = slot.outlineHex || '#0f172a';
      ctx.strokeText(activePlayer.number, x, y);

      // Relleno principal
      ctx.fillStyle = slot.fillHex || '#ffffff';
      ctx.fillText(activePlayer.number, x, y);

      // Filete interior fino de contraste
      ctx.lineWidth = Math.max(2.5, fontPx * 0.018);
      ctx.strokeStyle = design.colorZones.accents?.hex || '#facc15';
      ctx.strokeText(activePlayer.number, x, y);
      ctx.restore();
    }
  }

  // 3. Guías de Área Imprimible Segura e Imanes (sólo en modo editor 2D CustomInk)
  if (interactiveOpts.showGuides) {
    const activeDecal = panelDecals.find((d) => d.id === interactiveOpts.selectedDecalId);
    const zone = activeDecal
      ? SAFE_PRINT_ZONES[activeDecal.safeZoneId] ||
        (panel === 'back' ? SAFE_PRINT_ZONES.back_full : SAFE_PRINT_ZONES.front_chest_full)
      : panel === 'back'
      ? SAFE_PRINT_ZONES.back_full
      : SAFE_PRINT_ZONES.front_chest_full;

    const topLeft = mmToPanelPx(zone.xMm, zone.yMm);
    const dims = mmToPanelPx(zone.widthMm, zone.heightMm);

    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(topLeft.x, topLeft.y, dims.x, dims.y);

    // Etiqueta técnica de la SafePrintZone
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(topLeft.x, topLeft.y - 26, 290, 24);
    ctx.fillStyle = '#38bdf8';
    ctx.font = "700 13px 'Outfit', sans-serif";
    ctx.fillText(`${zone.label} (${zone.widthMm}×${zone.heightMm} mm)`, topLeft.x + 8, topLeft.y - 10);

    // Guías magnéticas activas
    if (interactiveOpts.snapGuides?.verticalCenter) {
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PANEL_PX / 2, topLeft.y - 15);
      ctx.lineTo(PANEL_PX / 2, topLeft.y + dims.y + 15);
      ctx.stroke();
    }
    if (interactiveOpts.snapGuides?.horizontalChest || interactiveOpts.snapGuides?.horizontalSponsor) {
      const guideMmY = interactiveOpts.snapGuides.horizontalChest ? 183 : 275;
      const { y: gy } = mmToPanelPx(0, guideMmY);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(topLeft.x - 15, gy);
      ctx.lineTo(topLeft.x + dims.x + 15, gy);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * Compila el Atlas UV completo (2048x1024) listo para alimentar `THREE.CanvasTexture`.
 */
export function renderFullUVAtlas(canvas, design, activePlayer, artworkRegistry = {}) {
  if (canvas.width !== UV_ATLAS_WIDTH || canvas.height !== UV_ATLAS_HEIGHT) {
    canvas.width = UV_ATLAS_WIDTH;
    canvas.height = UV_ATLAS_HEIGHT;
  }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, UV_ATLAS_WIDTH, UV_ATLAS_HEIGHT);

  // Mitad Izquierda: Frente (0..1024)
  ctx.save();
  renderGarmentPanel(ctx, design, 'front', activePlayer, artworkRegistry, { showGuides: false });
  ctx.restore();

  // Mitad Derecha: Espalda (1024..2048)
  ctx.save();
  ctx.translate(PANEL_PX, 0);
  renderGarmentPanel(ctx, design, 'back', activePlayer, artworkRegistry, { showGuides: false });
  ctx.restore();
}
