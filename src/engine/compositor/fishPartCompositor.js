/**
 * ATLETIQ Engine v4.0 — Compositor Multi-Pieza `.fish` + Motor Vectorial/Raster PNG & SVG Isométrico (Owayo v6 1:1)
 *
 * Renderiza cada pieza independiente del patrón (`Front`, `Back`, `LeftArm`, `RightArm`, `Collar`, `Krageneinfass`, `Aermelband*`)
 * combinando:
 *  1. Máscaras indexadas reales `.fish` recoloreadas por LUT de 32 bits en < 1.2 ms (167 colores Pantone/CM5).
 *  2. Texturas geométricas opcionales sublimadas sobre Zona A.
 *  3. Archivos PNG y SVG ilimitados con compensación isométrica exacta (`hoehenfaktor` de `parts.json`),
 *     quita-fondo blanco, tinte Pantone monocromo, opacidad marca de agua (`wasserzeichen`), modos de fusión y volteo.
 *  4. Textos libres rectos o arqueados (`archDeg`) + Slots relacionales del Roster (`einzelexemplare`).
 */

import { getPartSpec, resolveMirlKeyForProduct, computeAutoCondenseScaleX } from '../core/boundingBoxMath';
import { getDesignsForProduct } from '../core/designStore';
import { getFilteredArtworkDrawable } from '../core/dpiValidator';
import { drawLigaMxGraphicMm, drawLigaMxCrestMm } from './ligaMxKitsEngine';
import { resolveAssetUrl } from '../../utils/assetUrl';

// Caché de máscaras decodificadas `.fish`: key = `${fishUrl}` -> Promise<Map<partName, { width, height, zones: Uint8Array }>>
export const decodedFishCache = new Map();
export const resolvedFishMasksCache = new Map();

// Caché de capas base recoloreadas por pieza: key = `${mirlKey}|${partName}` -> { keySignature, canvas }
const baseLayerCanvasCache = new Map();

function hexToAbgr32(hex = '#0033a0') {
  const clean = String(hex).replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  // Little-endian RGBA -> 0xAABBGGRR
  return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

function shiftHexBrightness(hex = '#0033a0', delta = 18) {
  const clean = String(hex).replace('#', '');
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((parseInt(clean.slice(0, 2), 16) || 0) + delta);
  const g = clamp((parseInt(clean.slice(2, 4), 16) || 0) + delta);
  const b = clamp((parseInt(clean.slice(4, 6), 16) || 0) + delta);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function targetResolutionForPart(partName, nativeW = 0, nativeH = 0) {
  if (nativeW > 0 && nativeH > 0) {
    const maxDim = Math.max(nativeW, nativeH);
    if (maxDim > 2048) {
      const scale = 2048 / maxDim;
      return [Math.round(nativeW * scale), Math.round(nativeH * scale)];
    }
    return [nativeW, nativeH];
  }
  if (
    partName === 'Front' ||
    partName === 'Back' ||
    partName === 'FrontLeftPart' ||
    partName === 'FrontRightPart' ||
    partName === 'LeftLeg' ||
    partName === 'RightLeg' ||
    partName === 'LinkesBeinvorne' ||
    partName === 'RechtesBeinvorne' ||
    partName === 'LinkesBeinhinten' ||
    partName === 'RechtesBeinhinten'
  ) {
    return [2048, 2048];
  }
  if (partName === 'LeftArm' || partName === 'RightArm') return [1024, 1024];
  if (partName.includes('Seitenteil') || partName.includes('Seitenstreifen') || partName.includes('Unterarm')) {
    return [512, 1536];
  }
  if (partName.includes('Collar') || partName.includes('Krageneinfass')) {
    return [1024, 256];
  }
  if (partName.includes('Aermelband')) {
    return [1024, 128];
  }
  return [512, 512];
}

// Caché de máscaras binarias por zona para `clampToZone` (`Mostrar solo` de Owayo)
const zoneClipCanvasCache = new Map();
let sharedDecalScratchCanvas = null;

function getZoneClipMaskCanvas(fishUrl, partName, maskEntry, zoneLetter) {
  if (!maskEntry?.zones || !zoneLetter || zoneLetter === 'ALL') return null;
  const key = `${fishUrl || 'solid'}|${partName}|${zoneLetter}`;
  if (zoneClipCanvasCache.has(key)) return zoneClipCanvasCache.get(key);

  const { width, height, zones } = maskEntry;
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(width, height);
  const out32 = new Uint32Array(img.data.buffer);

  const matchCodes =
    zoneLetter === 'A'
      ? [1, 44, 50]
      : zoneLetter === 'B'
      ? [2, 45, 53]
      : zoneLetter === 'C'
      ? [3, 5, 51]
      : zoneLetter === 'D'
      ? [4, 52]
      : [];

  for (let i = 0; i < zones.length; i++) {
    if (matchCodes.includes(zones[i])) {
      out32[i] = 0xffffffff;
    }
  }
  ctx.putImageData(img, 0, 0);
  zoneClipCanvasCache.set(key, c);
  return c;
}

/**
 * Desempaqueta un archivo `.fish` (ZIP Store `method=0`) en el navegador y extrae los índices de zona `0..255` por pieza.
 */
export async function loadFishDesignMasks(fishUrl) {
  if (!fishUrl) {
    return new Map();
  }
  const resolvedUrl = resolveAssetUrl(fishUrl);
  if (decodedFishCache.has(fishUrl)) {
    return decodedFishCache.get(fishUrl);
  }
  if (decodedFishCache.has(resolvedUrl)) {
    return decodedFishCache.get(resolvedUrl);
  }

  const pending = (async () => {
    const resp = await fetch(resolvedUrl);
    if (!resp.ok) throw new Error(`Error cargando diseño ${resolvedUrl}: ${resp.status}`);
    const arrayBuffer = await resp.arrayBuffer();
    const view = new DataView(arrayBuffer);
    const bytes = new Uint8Array(arrayBuffer);

    let offset = 0;
    const partMap = new Map();
    const decoder = new TextDecoder('utf-8');

    while (offset + 30 <= bytes.byteLength) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) break;
      const compSize = view.getUint32(offset + 18, true);
      const nameLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);
      const rawName = decoder.decode(bytes.subarray(offset + 30, offset + 30 + nameLen));
      const dataStart = offset + 30 + nameLen + extraLen;
      const pngSlice = bytes.subarray(dataStart, dataStart + compSize);
      offset = dataStart + compSize;

      if (!rawName.toLowerCase().endsWith('.png')) continue;
      const partName = rawName.replace(/\.png$/i, '');

      const blob = new Blob([pngSlice], { type: 'image/png' });
      let drawable;
      if (typeof createImageBitmap !== 'undefined') {
        try {
          drawable = await createImageBitmap(blob, {
            colorSpaceConversion: 'none',
            premultiplyAlpha: 'none',
          });
        } catch {
          drawable = await createImageBitmap(blob);
        }
      } else {
        const url = URL.createObjectURL(blob);
        drawable = await new Promise((res, rej) => {
          const im = new Image();
          im.onload = () => res(im);
          im.onerror = rej;
          im.src = url;
        });
        URL.revokeObjectURL(url);
      }

      const [targetW, targetH] = targetResolutionForPart(partName, drawable.width, drawable.height);

      const tmpCanvas = document.createElement('canvas');
      tmpCanvas.width = targetW;
      tmpCanvas.height = targetH;
      const tCtx = tmpCanvas.getContext('2d', { willReadFrequently: true });
      tCtx.imageSmoothingEnabled = false;
      tCtx.drawImage(drawable, 0, 0, targetW, targetH);
      if (drawable.close) drawable.close();

      const rgba = tCtx.getImageData(0, 0, targetW, targetH).data;
      const total = targetW * targetH;
      const zones = new Uint8Array(total);
      for (let i = 0; i < total; i++) {
        zones[i] = rgba[i * 4];
      }

      // Sangrado de borde UV (2 pasadas) sobre padding 255 para evitar halos blancos en costuras 3D con mipmaps
      for (let pass = 0; pass < 2; pass++) {
        for (let y = 0; y < targetH; y++) {
          const row = y * targetW;
          for (let x = 0; x < targetW; x++) {
            const idx = row + x;
            if (zones[idx] === 255) {
              if (x > 0 && zones[idx - 1] < 255) zones[idx] = zones[idx - 1];
              else if (x + 1 < targetW && zones[idx + 1] < 255) zones[idx] = zones[idx + 1];
              else if (y > 0 && zones[idx - targetW] < 255) zones[idx] = zones[idx - targetW];
              else if (y + 1 < targetH && zones[idx + targetW] < 255) zones[idx] = zones[idx + targetW];
            }
          }
        }
      }

      partMap.set(partName, { width: targetW, height: targetH, zones });
    }

    resolvedFishMasksCache.set(fishUrl, partMap);
    resolvedFishMasksCache.set(resolvedUrl, partMap);
    return partMap;
  })();

  decodedFishCache.set(fishUrl, pending);
  decodedFishCache.set(resolvedUrl, pending);
  return pending;
}

export function resolveActiveFishDesignMeta(design) {
  const catalog = getDesignsForProduct(design.productModelId);
  return catalog.find((d) => d.id === design.patternId) || catalog[0];
}

function buildZoneColorLUT32(colorZones = {}) {
  const cA = colorZones.primary?.hex || '#0033a0';
  const cB = colorZones.secondary?.hex || '#0c2340';
  const cC = colorZones.accents?.hex || '#ffcd00';
  const cD = colorZones.quaternary?.hex || cC;
  const cK = colorZones.collar?.hex || cC;
  const cSL = colorZones.sleeves?.hex || cK;
  const cHighA = shiftHexBrightness(cA, 22);
  const cHighB = shiftHexBrightness(cB, 22);

  const lut = new Uint32Array(256);
  const abgrA = hexToAbgr32(cA);
  lut.fill(abgrA);

  lut[1] = abgrA; // A: Color principal
  lut[50] = hexToAbgr32(cC); // A_O
  lut[2] = hexToAbgr32(cB); // B: Segundo color
  lut[51] = hexToAbgr32(cC); // B_O -> Alias C en Owayo
  lut[3] = hexToAbgr32(cC); // C: Tercer color
  lut[52] = hexToAbgr32(cD); // C_O -> Alias D
  lut[4] = hexToAbgr32(cD); // D: Cuarto color
  lut[53] = hexToAbgr32(cB); // D_O
  lut[5] = hexToAbgr32(cC); // E
  lut[6] = hexToAbgr32(cK); // K: Cuello
  lut[39] = hexToAbgr32(cSL); // SLL: Ribete sisa izq.
  lut[40] = hexToAbgr32(cSL); // SLR: Ribete sisa der.
  lut[44] = hexToAbgr32(cHighA); // High-1
  lut[45] = hexToAbgr32(cHighB); // High-2
  lut[46] = hexToAbgr32(cHighA); // High-3
  lut[255] = abgrA;
  return lut;
}

function drawSurfacePatternOverlay(ctx, w, h, patternId, opacity = 0.16) {
  if (!patternId || patternId === 'none') return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#000000';

  if (patternId === 'hex_carbon') {
    const step = 36;
    ctx.lineWidth = 2;
    for (let y = 0; y < h + step; y += step) {
      const offset = ((y / step) | 0) % 2 === 0 ? 0 : step * 0.5;
      for (let x = -step; x < w + step; x += step) {
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const ang = (Math.PI / 3) * k + Math.PI / 6;
          const px = x + offset + Math.cos(ang) * (step * 0.48);
          const py = y + Math.sin(ang) * (step * 0.48);
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (patternId === 'speed_lines') {
    ctx.lineWidth = 3;
    for (let i = -h; i < w + h; i += 22) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - h * 0.55, h);
      ctx.stroke();
    }
  } else if (patternId === 'halftone_dots') {
    ctx.fillStyle = '#ffffff';
    for (let y = 16; y < h; y += 26) {
      const r = Math.max(1.5, ((h - y) / h) * 8.5);
      for (let x = 16; x < w; x += 26) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (patternId === 'micro_chevrons') {
    ctx.lineWidth = 2.5;
    for (let y = 0; y < h + 32; y += 28) {
      ctx.beginPath();
      for (let x = 0; x <= w; x += 48) {
        ctx.lineTo(x, y);
        ctx.lineTo(x + 24, y + 14);
      }
      ctx.stroke();
    }
  } else if (patternId === 'diag_pinstripes') {
    ctx.lineWidth = 1.6;
    for (let i = -h; i < w + h; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function getOrRenderBasePartCanvas(mirlKey, partName, maskEntry, design) {
  const cacheSlotKey = `${mirlKey}|${partName}`;
  const zonesSig = JSON.stringify(design.colorZones);
  const hasMask = Boolean(maskEntry?.zones);
  const maskSig = hasMask ? `mask_${maskEntry.width}x${maskEntry.height}` : 'no_mask';
  const sig = `${design.productModelId}|${design.patternId}|${zonesSig}|${design.surfacePatternId || 'none'}|${design.surfacePatternOpacity || 0.16}|${maskSig}`;

  let slot = baseLayerCanvasCache.get(cacheSlotKey);
  const [fallbackW, fallbackH] = targetResolutionForPart(partName);
  const w = maskEntry?.width || fallbackW;
  const h = maskEntry?.height || fallbackH;

  if (
    slot &&
    slot.keySignature === sig &&
    slot.hasMask === hasMask &&
    slot.canvas.width === w &&
    slot.canvas.height === h
  ) {
    return slot.canvas;
  }

  const canvas = slot?.canvas || document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  if (maskEntry?.zones) {
    const lut32 = buildZoneColorLUT32(design.colorZones);
    const imgData = ctx.createImageData(w, h);
    const out32 = new Uint32Array(imgData.data.buffer);
    const zones = maskEntry.zones;
    for (let i = 0, len = zones.length; i < len; i++) {
      out32[i] = lut32[zones[i]];
    }
    ctx.putImageData(imgData, 0, 0);
  } else {
    // Fallback sólido inmediato mientras termina la descarga asíncrona de .fish (<15ms)
    const isZipper =
      partName === 'RV' ||
      partName === 'RVPL' ||
      partName === 'RVPR' ||
      partName === 'Toothmesh' ||
      partName === 'Toothmesh_BG' ||
      partName === 'GU';
    const isTrim =
      partName === 'Collar' ||
      partName === 'Krageneinfass' ||
      partName === 'CollarOutside' ||
      partName === 'CollarInside';
    const isArmBand =
      partName === 'Aermelbandlinks' ||
      partName === 'Aermelbandrechts' ||
      partName.includes('Unterarm');
    const isSidePanel =
      partName.includes('Seitenteil') ||
      partName.includes('Seitenstreifen');

    ctx.fillStyle = isZipper
      ? (design.colorZones.accents?.hex || '#1f2937')
      : isTrim
      ? (design.colorZones.collar?.hex || '#ffcd00')
      : isArmBand
      ? (design.colorZones.sleeves?.hex || '#0c2340')
      : isSidePanel
      ? (design.colorZones.secondary?.hex || '#0c2340')
      : (design.colorZones.primary?.hex || '#0033a0');
    ctx.fillRect(0, 0, w, h);
  }

  if (
    partName === 'Front' ||
    partName === 'Back' ||
    partName === 'FrontLeftPart' ||
    partName === 'FrontRightPart' ||
    partName === 'LeftArm' ||
    partName === 'RightArm' ||
    partName === 'LeftLeg' ||
    partName === 'RightLeg' ||
    partName === 'LinkesBeinvorne' ||
    partName === 'RechtesBeinvorne' ||
    partName === 'LinkesBeinhinten' ||
    partName === 'RechtesBeinhinten'
  ) {
    drawSurfacePatternOverlay(ctx, w, h, design.surfacePatternId, design.surfacePatternOpacity ?? 0.16);
  }

  baseLayerCanvasCache.set(cacheSlotKey, { keySignature: sig, hasMask, canvas });
  return canvas;
}

/**
 * Dibuja los 8 escudos e insignias vectoriales integrados en coordenadas físicas milimétricas `[-w/2..w/2, -h/2..h/2]`.
 */
function drawPresetVectorCrestMm(ctx, presetId, wMm, hMm, design, tintHex = '') {
  const cMain = tintHex || design.colorZones.accents?.hex || '#ffcd00';
  const cDark = tintHex ? shiftHexBrightness(tintHex, -60) : design.colorZones.secondary?.hex || '#0c2340';
  const cLight = tintHex || '#ffffff';
  const r = Math.min(wMm, hMm) / 2;

  ctx.save();
  if (presetId?.startsWith('mx_')) {
    drawLigaMxCrestMm(ctx, presetId, wMm, hMm, design);
    ctx.restore();
    return;
  }
  if (presetId === 'eagle_hex') {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const x = Math.cos(a) * (wMm * 0.48);
      const y = Math.sin(a) * (hMm * 0.48);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = cDark;
    ctx.fill();
    ctx.lineWidth = r * 0.12;
    ctx.strokeStyle = cMain;
    ctx.stroke();

    ctx.fillStyle = cMain;
    ctx.font = `900 ${r * 0.62}px 'Chakra Petch', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PRO', 0, 1);
  } else if (presetId === 'circle_badge' || presetId === 'league_patch') {
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = cDark;
    ctx.fill();
    ctx.lineWidth = r * 0.12;
    ctx.strokeStyle = cMain;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
    ctx.lineWidth = r * 0.04;
    ctx.strokeStyle = cLight;
    ctx.stroke();

    ctx.fillStyle = cLight;
    ctx.font = `900 ${r * 0.48}px 'Bebas Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(presetId === 'league_patch' ? 'LIGA PRO' : 'CLUB FC', 0, 1);
  } else if (presetId === 'three_stars') {
    ctx.fillStyle = cMain;
    const positions = [-wMm * 0.32, 0, wMm * 0.32];
    positions.forEach((cx, idx) => {
      const cy = idx === 1 ? -hMm * 0.12 : hMm * 0.06;
      const sr = r * 0.42;
      ctx.beginPath();
      for (let p = 0; p < 10; p++) {
        const rad = p % 2 === 0 ? sr : sr * 0.42;
        const ang = (Math.PI / 5) * p - Math.PI / 2;
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad;
        if (p === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
    });
  } else if (presetId === 'esports_bolt') {
    ctx.beginPath();
    ctx.moveTo(wMm * 0.08, -hMm * 0.48);
    ctx.lineTo(-wMm * 0.34, hMm * 0.04);
    ctx.lineTo(-wMm * 0.02, hMm * 0.04);
    ctx.lineTo(-wMm * 0.14, hMm * 0.48);
    ctx.lineTo(wMm * 0.34, -hMm * 0.06);
    ctx.lineTo(wMm * 0.04, -hMm * 0.06);
    ctx.closePath();
    ctx.fillStyle = cMain;
    ctx.fill();
    ctx.lineWidth = r * 0.09;
    ctx.strokeStyle = cDark;
    ctx.stroke();
  } else if (presetId === 'crown_crest') {
    ctx.beginPath();
    ctx.moveTo(-wMm * 0.42, hMm * 0.3);
    ctx.lineTo(-wMm * 0.46, -hMm * 0.22);
    ctx.lineTo(-wMm * 0.18, hMm * 0.04);
    ctx.lineTo(0, -hMm * 0.34);
    ctx.lineTo(wMm * 0.18, hMm * 0.04);
    ctx.lineTo(wMm * 0.46, -hMm * 0.22);
    ctx.lineTo(wMm * 0.42, hMm * 0.3);
    ctx.closePath();
    ctx.fillStyle = cMain;
    ctx.fill();
    ctx.lineWidth = r * 0.08;
    ctx.strokeStyle = cDark;
    ctx.stroke();
  } else if (presetId === 'wing_emblem') {
    ctx.fillStyle = cMain;
    ctx.beginPath();
    ctx.moveTo(0, hMm * 0.15);
    ctx.lineTo(-wMm * 0.48, -hMm * 0.28);
    ctx.lineTo(-wMm * 0.32, hMm * 0.25);
    ctx.lineTo(0, hMm * 0.36);
    ctx.lineTo(wMm * 0.32, hMm * 0.25);
    ctx.lineTo(wMm * 0.48, -hMm * 0.28);
    ctx.closePath();
    ctx.fill();
  } else {
    // Escudo Real Clásico ('royal_shield')
    ctx.beginPath();
    ctx.moveTo(0, -hMm * 0.48);
    ctx.lineTo(wMm * 0.45, -hMm * 0.32);
    ctx.lineTo(wMm * 0.38, hMm * 0.14);
    ctx.quadraticCurveTo(wMm * 0.22, hMm * 0.38, 0, hMm * 0.48);
    ctx.quadraticCurveTo(-wMm * 0.22, hMm * 0.38, -wMm * 0.38, hMm * 0.14);
    ctx.lineTo(-wMm * 0.45, -hMm * 0.32);
    ctx.closePath();
    ctx.fillStyle = cDark;
    ctx.fill();
    ctx.lineWidth = r * 0.12;
    ctx.strokeStyle = cMain;
    ctx.stroke();

    ctx.fillStyle = cMain;
    ctx.font = `900 ${r * 0.56}px 'Bebas Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ATQ', 0, 2);
  }
  ctx.restore();
}

/**
 * Dibuja texto recto o arqueado (`archDeg` -180..+180) en espacio milimétrico isométrico con doble contorno.
 */
function drawStyledTextMm(ctx, {
  text = '',
  fontFamily = "'Bebas Neue', sans-serif",
  fontSizeMm = 42,
  fillHex = '#ffffff',
  outlineHex = '#0c2340',
  outlineWidthMm = 2.4,
  outline2Hex = '',
  archDeg = 0,
  scaleX = 1,
  letterSpacingMm = 0,
}) {
  if (!text) return;
  ctx.save();
  ctx.font = `900 ${fontSizeMm}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  const paintGlyph = (str, x, y) => {
    if (outline2Hex) {
      ctx.lineWidth = outlineWidthMm * 2.1;
      ctx.strokeStyle = outline2Hex;
      ctx.strokeText(str, x, y);
    }
    if (outlineHex && outlineWidthMm > 0) {
      ctx.lineWidth = outlineWidthMm;
      ctx.strokeStyle = outlineHex;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = fillHex;
    ctx.fillText(str, x, y);
  };

  if (Math.abs(archDeg) < 2 || text.length < 2) {
    ctx.scale(scaleX, 1);
    if (letterSpacingMm > 0.1 && text.length > 1) {
      const chars = Array.from(text);
      const widths = chars.map((ch) => ctx.measureText(ch).width);
      const totalW = widths.reduce((a, b) => a + b, 0) + letterSpacingMm * (chars.length - 1);
      let cursor = -totalW / 2;
      chars.forEach((ch, idx) => {
        const cw = widths[idx];
        paintGlyph(ch, cursor + cw / 2, 0);
        cursor += cw + letterSpacingMm;
      });
    } else {
      paintGlyph(text, 0, 0);
    }
    ctx.restore();
    return;
  }

  // Arco circular real carácter por carácter (estilo dorsal curvo americano / europeo)
  const chars = Array.from(text);
  const widths = chars.map((ch) => ctx.measureText(ch).width * scaleX + letterSpacingMm);
  const arcLenMm = Math.max(20, widths.reduce((a, b) => a + b, 0));
  const totalAngleRad = (archDeg * Math.PI) / 180;
  const radiusMm = arcLenMm / Math.abs(totalAngleRad);
  const downward = archDeg > 0; // +archDeg = arco clásico convexo superior

  let angleCursor = -totalAngleRad / 2;
  chars.forEach((ch, idx) => {
    const charW = widths[idx];
    const halfStep = ((charW / 2) / arcLenMm) * totalAngleRad;
    const theta = angleCursor + halfStep;
    ctx.save();
    if (downward) {
      ctx.translate(0, radiusMm);
      ctx.rotate(theta);
      ctx.translate(0, -radiusMm);
    } else {
      ctx.translate(0, -radiusMm);
      ctx.rotate(-theta);
      ctx.translate(0, radiusMm);
    }
    ctx.scale(scaleX, 1);
    paintGlyph(ch, 0, 0);
    ctx.restore();
    angleCursor += (charW / arcLenMm) * totalAngleRad;
  });

  ctx.restore();
}

/**
 * Compone una pieza individual (`Front`, `Back`, `LeftArm`, `RightArm`, `Collar`, `Krageneinfass`, `Aermelband*`)
 * sobre el `targetCanvas` indicado.
 */
export function composeGarmentPartCanvas(
  targetCanvas,
  partName,
  design,
  activePlayer,
  artworkRegistry = {},
  fishMasksMap = null,
  overlayOptions = null
) {
  const mirlKey = resolveMirlKeyForProduct(design.productModelId);
  const activeFishMeta = resolveActiveFishDesignMeta(design);
  const cachedMasks = activeFishMeta?.fileUrl ? resolvedFishMasksCache.get(activeFishMeta.fileUrl) : null;
  const maskEntry = fishMasksMap?.get(partName) || cachedMasks?.get(partName) || null;
  const baseCanvas = getOrRenderBasePartCanvas(mirlKey, partName, maskEntry, design);

  if (targetCanvas.width !== baseCanvas.width || targetCanvas.height !== baseCanvas.height) {
    targetCanvas.width = baseCanvas.width;
    targetCanvas.height = baseCanvas.height;
  }

  const ctx = targetCanvas.getContext('2d');
  const W = targetCanvas.width;
  const H = targetCanvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(baseCanvas, 0, 0);

  // Mapear partName -> panel lógico ('front' | 'back' | 'left_arm' | 'right_arm' | 'collar' | 'left_leg' | 'right_leg' | etc.)
  const panelMap = {
    Front: 'front',
    Back: 'back',
    LeftArm: 'left_arm',
    RightArm: 'right_arm',
    Collar: 'collar',
    CollarOutside: 'collar',
    LeftLeg: 'left_leg',
    RightLeg: 'right_leg',
    Seitenteillinks: 'side_left',
    Seitenteilrechts: 'side_right',
    LinkesBeinvorne: 'left_leg',
    RechtesBeinvorne: 'right_leg',
    Seitenstreifenrechts: 'side_right',
    Seitenstreifenlinks: 'side_left',
    FrontLeftPart: 'front_left',
    FrontRightPart: 'front_right',
  };
  const panel = panelMap[partName];
  if (!panel) return;

  const spec = getPartSpec(design.productModelId, panel);
  const pxPerMmX = W / spec.widthMm;
  const pxPerMmY = H / spec.heightMm;

  // 1. Ordenar y pintar todos los Decals (PNGs, SVGs, Escudos y Textos Libres) asignados a esta pieza por zIndex
  const partDecals = (design.decals || [])
    .filter((d) => {
      const dp = d.panel || 'front';
      if (dp === panel) return true;
      // Normalización de alias para mangas (left_sleeve / left_arm y right_sleeve / right_arm)
      if ((dp === 'left_arm' || dp === 'left_sleeve') && (panel === 'left_arm' || panel === 'left_sleeve')) return true;
      if ((dp === 'right_arm' || dp === 'right_sleeve') && (panel === 'right_arm' || panel === 'right_sleeve')) return true;
      // Compatibilidad si un decal tiene panel 'front' en una chaqueta con 'front_left' o 'front_right'
      if (dp === 'front' && (panel === 'front_left' || panel === 'front_right')) {
        return panel === 'front_left';
      }
      return false;
    })
    .slice()
    .sort((a, b) => (a.zIndex ?? 10) - (b.zIndex ?? 10));

  for (const decal of partDecals) {
    const scale = decal.scale ?? 1;
    const wMm = decal.sizeMm.width * scale;
    const hMm = decal.sizeMm.height * scale;

    const clipZoneMask =
      decal.clampToZone && decal.clampToZone !== 'ALL'
        ? getZoneClipMaskCanvas(activeFishMeta?.fileUrl, partName, maskEntry, decal.clampToZone)
        : null;

    let drawCtx = ctx;
    if (clipZoneMask) {
      if (!sharedDecalScratchCanvas) sharedDecalScratchCanvas = document.createElement('canvas');
      if (sharedDecalScratchCanvas.width !== W || sharedDecalScratchCanvas.height !== H) {
        sharedDecalScratchCanvas.width = W;
        sharedDecalScratchCanvas.height = H;
      }
      drawCtx = sharedDecalScratchCanvas.getContext('2d');
      drawCtx.clearRect(0, 0, W, H);
    }

    drawCtx.save();
    drawCtx.globalAlpha = Math.max(0.03, Math.min(1, decal.opacity ?? 1));
    drawCtx.globalCompositeOperation = clipZoneMask ? 'source-over' : decal.blendMode || 'source-over';
    drawCtx.translate(decal.centerMm.x * pxPerMmX, decal.centerMm.y * pxPerMmY);
    drawCtx.scale(pxPerMmX, pxPerMmY); // Espacio físico 1:1 en milímetros — CERO deformación al rotar en mangas, cuello o piernas
    drawCtx.rotate(((decal.rotationDeg || 0) * Math.PI) / 180);
    drawCtx.scale(decal.flipX ? -1 : 1, decal.flipY ? -1 : 1);

    if (decal.type === 'LIGAMX_GRAPHIC') {
      drawLigaMxGraphicMm(drawCtx, decal.graphicId, wMm, hMm, design);
    } else if (decal.type === 'LIGAMX_CREST') {
      drawLigaMxCrestMm(drawCtx, decal.clubId || decal.presetId, wMm, hMm, design);
    } else if (decal.type === 'PRESET_CREST') {
      drawPresetVectorCrestMm(drawCtx, decal.presetId, wMm, hMm, design, decal.tintHex);
    } else if (decal.type === 'STATIC_TEXT') {
      drawStyledTextMm(drawCtx, {
        text: decal.text || '',
        fontFamily: decal.fontFamily || "'Chakra Petch', sans-serif",
        fontSizeMm: decal.sizeMm.height * scale * 0.86,
        fillHex: decal.fillHex || '#ffffff',
        outlineHex: decal.outlineHex || '',
        outlineWidthMm: decal.outlineWidthMm ?? 2.0,
        outline2Hex: decal.outline2Hex || '',
        archDeg: decal.archDeg || 0,
        letterSpacingMm: decal.letterSpacingMm || 0,
      });
    } else if (decal.artworkId || decal.dataUrl || decal.previewUrl) {
      const asset = artworkRegistry?.[decal.artworkId] || {
        artworkId: decal.artworkId || decal.id,
        dataUrl: decal.dataUrl || '',
        previewUrl: decal.previewUrl || decal.url || '',
        imageElement: decal.imageElement,
      };
      let drawable = getFilteredArtworkDrawable(asset, {
        removeWhiteBg: Boolean(decal.removeWhiteBg),
        whiteThreshold: decal.whiteThreshold ?? 238,
        tintHex: decal.tintHex || '',
        invertImage: Boolean(decal.invertImage),
      });
      if (!drawable && asset.imageElement && asset.imageElement.complete && asset.imageElement.naturalWidth > 0) {
        drawable = asset.imageElement;
      }
      if (drawable) {
        drawCtx.drawImage(drawable, -wMm / 2, -hMm / 2, wMm, hMm);
      }
    }
    drawCtx.restore();

    if (clipZoneMask) {
      drawCtx.save();
      drawCtx.globalCompositeOperation = 'destination-in';
      drawCtx.drawImage(clipZoneMask, 0, 0, W, H);
      drawCtx.restore();

      ctx.save();
      ctx.globalCompositeOperation = decal.blendMode || 'source-over';
      ctx.drawImage(sharedDecalScratchCanvas, 0, 0);
      ctx.restore();
    }

    // Marco sutil en UV cuando este elemento está seleccionado en 3D
    if (overlayOptions?.selectedDecalId === decal.id && overlayOptions?.showSelectionBox) {
      ctx.save();
      ctx.translate(decal.centerMm.x * pxPerMmX, decal.centerMm.y * pxPerMmY);
      ctx.scale(pxPerMmX, pxPerMmY);
      ctx.rotate(((decal.rotationDeg || 0) * Math.PI) / 180);
      ctx.strokeStyle = decal.pinned ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(-wMm / 2 - 3, -hMm / 2 - 3, wMm + 6, hMm + 6);
      ctx.restore();
    }
  }

  // 2. Renderizar Slots Variables del Jugador Activo (`einzelexemplare`)
  const slots = design.variableSlots || {};
  const player = activePlayer || { name: 'RODRÍGUEZ', number: '10' };

  const drawSlotHighlightIfSelected = (slotKey, centerMm, wMm, hMm) => {
    if (overlayOptions?.selectedSlotKey === slotKey && overlayOptions?.showSelectionBox) {
      ctx.save();
      ctx.translate(centerMm.x * pxPerMmX, centerMm.y * pxPerMmY);
      ctx.scale(pxPerMmX, pxPerMmY);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.0;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(-wMm / 2 - 4, -hMm / 2 - 4, wMm + 8, hMm + 8);
      ctx.restore();
    }
  };

  if (panel === 'back') {
    const nameSlot = slots.playerNameBack;
    if (nameSlot?.enabled && player.name) {
      const condenseX = nameSlot.autoCondense
        ? computeAutoCondenseScaleX(player.name, nameSlot.maxWidthMm || 295, nameSlot.capHeightMm || 52)
        : 1;
      ctx.save();
      ctx.translate(nameSlot.centerMm.x * pxPerMmX, nameSlot.centerMm.y * pxPerMmY);
      ctx.scale(pxPerMmX, pxPerMmY);
      drawStyledTextMm(ctx, {
        text: player.name.toUpperCase(),
        fontFamily: nameSlot.fontFamily || "'Bebas Neue', sans-serif",
        fontSizeMm: nameSlot.capHeightMm || 52,
        fillHex: nameSlot.fillHex || '#ffffff',
        outlineHex: nameSlot.outlineHex || '#0c2340',
        outlineWidthMm: nameSlot.outlineWidthMm ?? 3.0,
        archDeg: nameSlot.archDeg || 0,
        scaleX: condenseX,
      });
      ctx.restore();
      drawSlotHighlightIfSelected('playerNameBack', nameSlot.centerMm, nameSlot.maxWidthMm || 260, (nameSlot.capHeightMm || 52) * 1.15);
    }

    const numSlot = slots.playerNumberBack;
    if (numSlot?.enabled && player.number) {
      ctx.save();
      ctx.translate(numSlot.centerMm.x * pxPerMmX, numSlot.centerMm.y * pxPerMmY);
      ctx.scale(pxPerMmX, pxPerMmY);
      drawStyledTextMm(ctx, {
        text: String(player.number),
        fontFamily: numSlot.fontFamily || "'Bebas Neue', sans-serif",
        fontSizeMm: numSlot.heightMm || 225,
        fillHex: numSlot.fillHex || '#ffffff',
        outlineHex: numSlot.outlineHex || '#0c2340',
        outlineWidthMm: numSlot.outlineWidthMm ?? 4.8,
        outline2Hex: numSlot.inlineHex || '',
      });
      ctx.restore();
      drawSlotHighlightIfSelected('playerNumberBack', numSlot.centerMm, (numSlot.heightMm || 225) * 0.85, (numSlot.heightMm || 225) * 0.92);
    }
  }

  if (panel === 'front') {
    const frontNum = slots.playerNumberFront;
    if (frontNum?.enabled && player.number) {
      ctx.save();
      ctx.translate(frontNum.centerMm.x * pxPerMmX, frontNum.centerMm.y * pxPerMmY);
      ctx.scale(pxPerMmX, pxPerMmY);
      drawStyledTextMm(ctx, {
        text: String(player.number),
        fontFamily: frontNum.fontFamily || "'Bebas Neue', sans-serif",
        fontSizeMm: frontNum.heightMm || 48,
        fillHex: frontNum.fillHex || '#ffcd00',
        outlineHex: frontNum.outlineHex || '#0c2340',
        outlineWidthMm: frontNum.outlineWidthMm ?? 2.2,
      });
      ctx.restore();
      drawSlotHighlightIfSelected('playerNumberFront', frontNum.centerMm, (frontNum.heightMm || 48) * 1.1, (frontNum.heightMm || 48) * 1.0);
    }
  }

  if (slots.playerNumberSleeve?.enabled && slots.playerNumberSleeve.panel === panel && player.number) {
    const slvNum = slots.playerNumberSleeve;
    ctx.save();
    ctx.translate(slvNum.centerMm.x * pxPerMmX, slvNum.centerMm.y * pxPerMmY);
    ctx.scale(pxPerMmX, pxPerMmY);
    drawStyledTextMm(ctx, {
      text: String(player.number),
      fontFamily: slvNum.fontFamily || "'Bebas Neue', sans-serif",
      fontSizeMm: slvNum.heightMm || 44,
      fillHex: slvNum.fillHex || '#ffffff',
      outlineHex: slvNum.outlineHex || '#0c2340',
      outlineWidthMm: 2.0,
    });
    ctx.restore();
    drawSlotHighlightIfSelected('playerNumberSleeve', slvNum.centerMm, (slvNum.heightMm || 44) * 1.1, (slvNum.heightMm || 44) * 1.0);
  }

  if (slots.playerNumberShorts?.enabled && slots.playerNumberShorts.panel === panel && player.number) {
    const shNum = slots.playerNumberShorts;
    ctx.save();
    ctx.translate(shNum.centerMm.x * pxPerMmX, shNum.centerMm.y * pxPerMmY);
    ctx.scale(pxPerMmX, pxPerMmY);
    drawStyledTextMm(ctx, {
      text: String(player.number),
      fontFamily: shNum.fontFamily || "'Bebas Neue', sans-serif",
      fontSizeMm: shNum.heightMm || 68,
      fillHex: shNum.fillHex || '#ffffff',
      outlineHex: shNum.outlineHex || '#101820',
      outlineWidthMm: shNum.outlineWidthMm ?? 2.8,
    });
    ctx.restore();
    drawSlotHighlightIfSelected('playerNumberShorts', shNum.centerMm, (shNum.heightMm || 68) * 1.1, (shNum.heightMm || 68) * 1.0);
  }

  // 3. Guías Magnéticas Owayo (`SnapLines` verde neón `#4ade80` + `sperrbezirk`) activas durante el arrastre
  if (overlayOptions?.showGuides && overlayOptions?.panel === panel) {
    ctx.save();
    if (design.bleedEnforcement !== 'ALL_OVER') {
      const sperrTopPx = (spec.heightMm - spec.sperrbezirkMm) * pxPerMmY;
      ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
      ctx.fillRect(0, sperrTopPx, W, H - sperrTopPx);
      ctx.strokeStyle = 'rgba(251, 113, 133, 0.9)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, sperrTopPx);
      ctx.lineTo(W, sperrTopPx);
      ctx.stroke();
    }

    if (overlayOptions.snapGuides?.verticalCenter) {
      const snapX = (overlayOptions.snapGuides.snapCenterX ?? spec.snapCenterU * spec.widthMm) * pxPerMmX;
      ctx.strokeStyle = '#4ade80'; // HELPER_COLOR: lightgreen exacto de Owayo viewer-CmBNa226.js
      ctx.lineWidth = 3.5;
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(snapX, 0);
      ctx.lineTo(snapX, H);
      ctx.stroke();
    }
    if (overlayOptions.snapGuides?.horizontalChest || overlayOptions.snapGuides?.horizontalSponsor) {
      const lineMm = overlayOptions.snapGuides.horizontalChest
        ? overlayOptions.snapGuides.chestLineY || spec.heightMm * 0.255
        : overlayOptions.snapGuides.sponsorLineY || spec.heightMm * 0.385;
      const snapY = lineMm * pxPerMmY;
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(0, snapY);
      ctx.lineTo(W, snapY);
      ctx.stroke();
    }
    ctx.restore();
  }
}
