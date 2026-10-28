/**
 * ATLETIQ Engine v3.1 — Compositor UV Vectorial + `SnapLines` + `sperrbezirke` + `HF` Auto-Contraste
 * (Integra mecánicas decodificadas de Owayo v6 + CustomInk + Kit Builder)
 *
 * Pinta un Atlas UV de 2048 x 1024 px:
 *   - Mitad izquierda [0..1024, 0..1024]: Pieza `Front` (500 x 600 mm)
 *   - Mitad derecha   [1024..2048, 0..1024]: Pieza `Back` (500 x 600 mm)
 */

import {
  GARMENT_REFERENCE_MM,
  SAFE_PRINT_ZONES,
  SPERRBEZIRK_BOTTOM_HEM_MM,
  computeAutoCondenseScaleX,
  evaluateDecalPlacement,
} from '../core/boundingBoxMath';
import { computeOwayoAutoContrastHex } from '../core/designStore';
import { drawLigaMxGraphicMm, drawLigaMxCrestMm } from './ligaMxKitsEngine';

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

  // Paneles laterales respirables en contraste (K-Tex Side Inserts)
  ctx.fillStyle = colorZones.sleeves?.hex || cSecondary;
  ctx.globalAlpha = 0.88;
  ctx.fillRect(0, 0, PANEL_PX * 0.085, PANEL_PX);
  ctx.fillRect(PANEL_PX * 0.915, 0, PANEL_PX * 0.085, PANEL_PX);
  ctx.globalAlpha = 1;

  // Filete técnico sobre costura lateral
  ctx.fillStyle = cAccent;
  ctx.fillRect(PANEL_PX * 0.085 - 3, 0, 5, PANEL_PX);
  ctx.fillRect(PANEL_PX * 0.915 - 2, 0, 5, PANEL_PX);

  // Ribete inferior sobre la línea del dobladillo
  ctx.fillStyle = cAccent;
  ctx.fillRect(0, PANEL_PX * 0.918, PANEL_PX, 12);
}

/**
 * Dibuja el distintivo técnico `HF` con contraste automático Owayo (`ColorCodeAbhaengigkeiten`: "Schwarz-Weiß im Kontrast").
 */
function renderOwayoHFManufacturerMark(ctx, design, panel) {
  const hfHex =
    design.autoContrastHF !== false
      ? computeOwayoAutoContrastHex(design.colorZones.primary?.hex || '#1d4ed8')
      : design.colorZones.accents?.hex || '#facc15';

  ctx.save();
  ctx.fillStyle = hfHex;
  if (panel === 'front') {
    // Marca técnica en pecho derecho superior (código HF en Owayo)
    const { x, y } = mmToPanelPx(188, 146);
    ctx.font = "900 18px 'Chakra Petch', sans-serif";
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.9;
    ctx.fillText('ATLETIQ', x, y);
    ctx.fillRect(x - 24, y + 6, 48, 3);
  } else {
    // Sello técnico K-Tex sobre la línea de faldón trasero (justo encima del sperrbezirk de 50mm)
    const { x, y } = mmToPanelPx(355, 534);
    ctx.font = "700 13px 'Chakra Petch', sans-serif";
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.72;
    ctx.fillText('K-TEX 2 PRO DRY', x, y);
  }
  ctx.restore();
}

/**
 * Dibuja la franja rayada `sperrbezirke` (50 mm inferiores de costura no imprimible).
 */
function renderSperrbezirkBand(ctx, highlightDanger = false) {
  const sperrTopMm = GARMENT_REFERENCE_MM.height - SPERRBEZIRK_BOTTOM_HEM_MM;
  const { y: topPx } = mmToPanelPx(0, sperrTopMm);
  const bandHeight = PANEL_PX - topPx;

  ctx.save();
  ctx.fillStyle = highlightDanger ? 'rgba(244, 63, 94, 0.36)' : 'rgba(15, 23, 42, 0.52)';
  ctx.fillRect(0, topPx, PANEL_PX, bandHeight);

  ctx.strokeStyle = highlightDanger ? '#fb7185' : 'rgba(248, 113, 113, 0.65)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, topPx);
  ctx.lineTo(PANEL_PX, topPx);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = highlightDanger ? '#ffe4e6' : '#fca5a5';
  ctx.font = "700 12px 'Outfit', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('SPERRBEZIRK COSTURA DOBLADILLO (5.0 CM — NO IMPRIMIBLE)', PANEL_PX / 2, topPx + 24);
  ctx.restore();
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
  interactiveOpts = { showGuides: false, selectedDecalId: null, is3DInteractive: false, snapGuides: null }
) {
  renderVectorSublimationPattern(ctx, design.patternId, design.colorZones, panel);
  renderOwayoHFManufacturerMark(ctx, design, panel);

  // 1. Pintar Decals (Logos subidos, escudos y patrocinadores)
  const panelDecals = (design.decals || []).filter((d) => d.panel === panel);

  for (const decal of panelDecals) {
    const evalResult = evaluateDecalPlacement(decal, null, false);
    const { x: cx, y: cy } = mmToPanelPx(decal.centerMm.x, decal.centerMm.y);
    const wPx = (decal.sizeMm.width / GARMENT_REFERENCE_MM.width) * PANEL_PX * (decal.scale ?? 1);
    const hPx = (decal.sizeMm.height / GARMENT_REFERENCE_MM.height) * PANEL_PX * (decal.scale ?? 1);
    const isSelectedHere = interactiveOpts.selectedDecalId === decal.id;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((decal.rotationDeg || 0) * Math.PI) / 180);

    if (decal.type === 'LIGAMX_GRAPHIC') {
      drawLigaMxGraphicMm(ctx, decal.graphicId, wPx, hPx, design);
    } else if (decal.type === 'LIGAMX_CREST') {
      drawLigaMxCrestMm(ctx, decal.clubId || decal.presetId, wPx, hPx, design);
    } else if (decal.type === 'PRESET_CREST') {
      if (decal.presetId?.startsWith('mx_')) {
        drawLigaMxCrestMm(ctx, decal.presetId, wPx, hPx, design);
      } else {
        drawPresetCrest(ctx, decal.presetId, wPx, hPx, design.colorZones);
      }
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

    // Marco interactivo sobre el modelo 3D (estilo `handleAndGuideLayer` de Owayo)
    if (interactiveOpts.is3DInteractive && isSelectedHere) {
      ctx.strokeStyle = evalResult.isOutOfSafeZone ? '#fb7185' : '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 5]);
      ctx.strokeRect(-wPx / 2 - 6, -hPx / 2 - 6, wPx + 12, hPx + 12);
      ctx.setLineDash([]);
      // Esquinas de control visual
      const corners = [
        [-wPx / 2 - 6, -hPx / 2 - 6],
        [wPx / 2 + 6, -hPx / 2 - 6],
        [-wPx / 2 - 6, hPx / 2 + 6],
        [wPx / 2 + 6, hPx / 2 + 6],
      ];
      ctx.fillStyle = '#facc15';
      for (const [kx, ky] of corners) {
        ctx.fillRect(kx - 5, ky - 5, 10, 10);
      }
    }

    // Si en modo interactivo se sale de la SafePrintZone o invade sperrbezirk, resaltar alerta
    if ((interactiveOpts.showGuides || interactiveOpts.is3DInteractive) && evalResult.isOutOfSafeZone) {
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

    if (slots.playerNumberBack?.enabled && activePlayer?.number) {
      const slot = slots.playerNumberBack;
      const { x, y } = mmToPanelPx(slot.centerMm.x, slot.centerMm.y);
      const fontPx = Math.round((slot.heightMm / GARMENT_REFERENCE_MM.height) * PANEL_PX);

      ctx.save();
      ctx.font = `900 ${fontPx}px ${slot.fontFamily || "'Bebas Neue', sans-serif"}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';

      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.fillText(activePlayer.number, x + 5, y + 7);

      ctx.lineWidth = Math.max(10, fontPx * 0.1);
      ctx.strokeStyle = slot.outlineHex || '#0f172a';
      ctx.strokeText(activePlayer.number, x, y);

      ctx.fillStyle = slot.fillHex || '#ffffff';
      ctx.fillText(activePlayer.number, x, y);

      ctx.lineWidth = Math.max(2.5, fontPx * 0.018);
      ctx.strokeStyle = design.colorZones.accents?.hex || '#facc15';
      ctx.strokeText(activePlayer.number, x, y);
      ctx.restore();
    }
  }

  // 3. Guías de Área Imprimible Segura, `sperrbezirke` e Imanes (`getSnapLines.php`)
  if (interactiveOpts.showGuides || interactiveOpts.is3DInteractive) {
    const activeDecal = panelDecals.find((d) => d.id === interactiveOpts.selectedDecalId);
    const activeEval = activeDecal ? evaluateDecalPlacement(activeDecal, null, false) : null;

    if (interactiveOpts.showGuides || activeEval?.inBottomHemSperrbezirk) {
      renderSperrbezirkBand(ctx, Boolean(activeEval?.inBottomHemSperrbezirk));
    }

    if (interactiveOpts.showGuides) {
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

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.fillRect(topLeft.x, topLeft.y - 26, 290, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.font = "700 13px 'Outfit', sans-serif";
      ctx.fillText(`${zone.label} (${zone.widthMm}×${zone.heightMm} mm)`, topLeft.x + 8, topLeft.y - 10);
      ctx.restore();
    }

    // Guías magnéticas activas (`getSnapLines.php` x = 0.50 + líneas de pecho/sponsor)
    if (interactiveOpts.snapGuides) {
      ctx.save();
      if (interactiveOpts.snapGuides.verticalCenter) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(PANEL_PX / 2, PANEL_PX * 0.04);
        ctx.lineTo(PANEL_PX / 2, PANEL_PX * 0.92);
        ctx.stroke();
      }
      if (interactiveOpts.snapGuides.horizontalChest || interactiveOpts.snapGuides.horizontalSponsor) {
        const guideMmY = interactiveOpts.snapGuides.horizontalChest ? 183 : 278;
        const { y: gy } = mmToPanelPx(0, guideMmY);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 5]);
        ctx.beginPath();
        ctx.moveTo(PANEL_PX * 0.14, gy);
        ctx.lineTo(PANEL_PX * 0.86, gy);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

/**
 * Compila el Atlas UV completo (2048x1024) listo para alimentar `THREE.CanvasTexture`.
 * Si `active3DOverlay` está activo durante un arrastre directo en 3D, dibuja las `SnapLines` Owayo sobre la prenda.
 */
export function renderFullUVAtlas(canvas, design, activePlayer, artworkRegistry = {}, active3DOverlay = null) {
  if (canvas.width !== UV_ATLAS_WIDTH || canvas.height !== UV_ATLAS_HEIGHT) {
    canvas.width = UV_ATLAS_WIDTH;
    canvas.height = UV_ATLAS_HEIGHT;
  }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, UV_ATLAS_WIDTH, UV_ATLAS_HEIGHT);

  const frontInteractive =
    active3DOverlay && active3DOverlay.panel === 'front'
      ? {
          showGuides: false,
          is3DInteractive: true,
          selectedDecalId: active3DOverlay.selectedDecalId,
          snapGuides: active3DOverlay.snapGuides,
        }
      : { showGuides: false };

  const backInteractive =
    active3DOverlay && active3DOverlay.panel === 'back'
      ? {
          showGuides: false,
          is3DInteractive: true,
          selectedDecalId: active3DOverlay.selectedDecalId,
          snapGuides: active3DOverlay.snapGuides,
        }
      : { showGuides: false };

  // Mitad Izquierda: Pieza `Front` (0..1024)
  ctx.save();
  renderGarmentPanel(ctx, design, 'front', activePlayer, artworkRegistry, frontInteractive);
  ctx.restore();

  // Mitad Derecha: Pieza `Back` (1024..2048)
  ctx.save();
  ctx.translate(PANEL_PX, 0);
  renderGarmentPanel(ctx, design, 'back', activePlayer, artworkRegistry, backInteractive);
  ctx.restore();
}
