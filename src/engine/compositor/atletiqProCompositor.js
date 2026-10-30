/**
 * ATLETIQ PRO — Compositor Gráfico de Alta Fidelidad Textil 2048x2048
 *
 * Genera el mapa difuso en tiempo real para el modelo 3D `jersey_pro_781001.glb`
 * aplicando patrones vectoriales, colores por zona, serigrafía deportiva de dorsales,
 * tipografías atléticas, escudos y patrocinadores en coordenadas fijas de anclaje.
 */

import { ATLETIQ_TEXTURE_SIZE, ATLETIQ_PRO_ANCHORS } from '../../data/atletiqProAnchors';
import { resolveAssetUrl } from '../../utils/assetUrl';

const svgCache = new Map();

export async function fetchPatternSvg(svgPath) {
  const resolved = resolveAssetUrl(svgPath);
  if (svgCache.has(resolved)) return svgCache.get(resolved);

  try {
    const res = await fetch(resolved);
    let text = await res.text();
    // Limpieza de cualquier marca externa residual
    text = text
      .replace(/spized/gi, 'atletiq')
      .replace(/tboxlabs/gi, 'atletiq');
    svgCache.set(resolved, text);
    return text;
  } catch (err) {
    console.error(`[ATLETIQ Compositor] Error cargando patrón SVG ${svgPath}:`, err);
    return null;
  }
}

/**
 * Modifica los colores del SVG inyectando una regla de estilos CSS prioritaria
 */
export function colorizeSvg(svgText, colorZoneMap = {}) {
  let styleRules = '';
  for (const [zoneId, hex] of Object.entries(colorZoneMap)) {
    if (!hex) continue;
    styleRules += `
      #${zoneId}, [id="${zoneId}"], .${zoneId}, #${zoneId} path, #${zoneId} polygon {
        fill: ${hex} !important;
      }
    `;
  }

  // Si el SVG ya tiene <style>, insertamos dentro, sino creamos un bloque <style> justo después de <svg...>
  const styleBlock = `<style type="text/css">${styleRules}</style>`;
  if (svgText.includes('</svg>')) {
    const insertIdx = svgText.indexOf('>') + 1;
    return svgText.slice(0, insertIdx) + styleBlock + svgText.slice(insertIdx);
  }
  return svgText;
}

/**
 * Carga una imagen HTML a partir de una URL o Data URL
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Renderiza el lienzo 2048x2048 completo
 */
export async function composeProGarmentTexture({
  patternSvgPath = '/assets/patterns/atletiq_pro_01.svg',
  colorZoneMap = {},
  playerName = 'ATLETIQ',
  playerNumber = '10',
  frontNumberActive = false,
  fontFamily = 'Impact, sans-serif',
  numberFillColor = '#FFFFFF',
  numberOutlineColor = '#0F172A',
  numberShadowColor = '#000000',
  nameFillColor = '#FFFFFF',
  nameOutlineColor = '#0F172A',
  nameCurveAngle = 0,
  crestImage = null,
  sponsorImage = null,
  sponsorText = '',
  brandLogoColor = '#FFFFFF',
  targetCanvas = null,
}) {
  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = ATLETIQ_TEXTURE_SIZE;
  canvas.height = ATLETIQ_TEXTURE_SIZE;
  const ctx = canvas.getContext('2d');

  // 1. Fondo base deportivo
  ctx.fillStyle = colorZoneMap['c1'] || '#085dbf';
  ctx.fillRect(0, 0, ATLETIQ_TEXTURE_SIZE, ATLETIQ_TEXTURE_SIZE);

  // 2. Cargar y dibujar el patrón SVG coloreado
  const rawSvg = await fetchPatternSvg(patternSvgPath);
  if (rawSvg) {
    const colorizedSvg = colorizeSvg(rawSvg, colorZoneMap);
    const blob = new Blob([colorizedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    try {
      const patternImg = await loadImage(blobUrl);
      ctx.drawImage(patternImg, 0, 0, ATLETIQ_TEXTURE_SIZE, ATLETIQ_TEXTURE_SIZE);
    } catch (e) {
      console.warn('[ATLETIQ Compositor] No se pudo renderizar patrón SVG en canvas:', e);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }

  // 3. Marca ATLETIQ Pecho Derecho
  drawBrandLogo(ctx, ATLETIQ_PRO_ANCHORS.brandLogoFrontRight, brandLogoColor);

  // 4. Escudo Pecho Izquierdo
  if (crestImage) {
    drawCrest(ctx, ATLETIQ_PRO_ANCHORS.crestFrontLeft, crestImage);
  } else {
    drawDefaultCrestBadge(ctx, ATLETIQ_PRO_ANCHORS.crestFrontLeft, colorZoneMap['c6'] || '#FACC15');
  }

  // 5. Patrocinador Frontal (Imagen o Texto)
  if (sponsorImage) {
    drawSponsorImage(ctx, ATLETIQ_PRO_ANCHORS.sponsorMain, sponsorImage);
  } else if (sponsorText) {
    drawSponsorText(ctx, ATLETIQ_PRO_ANCHORS.sponsorMain, sponsorText, nameFillColor, nameOutlineColor);
  }

  // 6. Número Frontal (si está activo)
  if (frontNumberActive && playerNumber) {
    drawFrontNumber(ctx, ATLETIQ_PRO_ANCHORS.numberFront, playerNumber, fontFamily, numberFillColor, numberOutlineColor);
  }

  // 7. Nombre de Jugador en Espalda
  if (playerName) {
    drawPlayerName(
      ctx,
      ATLETIQ_PRO_ANCHORS.playerNameBack,
      playerName,
      fontFamily,
      nameFillColor,
      nameOutlineColor,
      nameCurveAngle
    );
  }

  // 8. Dorsal Principal en Espalda
  if (playerNumber) {
    drawBackNumber(
      ctx,
      ATLETIQ_PRO_ANCHORS.numberBack,
      playerNumber,
      fontFamily,
      numberFillColor,
      numberOutlineColor,
      numberShadowColor
    );
  }

  return canvas;
}

function drawBrandLogo(ctx, anchor, color = '#FFFFFF') {
  ctx.save();
  const cx = anchor.x;
  const cy = anchor.y;

  ctx.fillStyle = color;
  ctx.font = '900 24px "Montserrat", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '3px';

  // Símbolo vectorial de alas atléticas ATLETIQ
  ctx.beginPath();
  ctx.moveTo(cx - 32, cy - 14);
  ctx.lineTo(cx, cy - 28);
  ctx.lineTo(cx + 32, cy - 14);
  ctx.lineTo(cx + 18, cy - 10);
  ctx.lineTo(cx, cy - 20);
  ctx.lineTo(cx - 18, cy - 10);
  ctx.closePath();
  ctx.fill();

  ctx.fillText('ATLETIQ', cx, cy + 12);
  ctx.restore();
}

function drawDefaultCrestBadge(ctx, anchor, accentColor = '#FACC15') {
  ctx.save();
  const cx = anchor.x;
  const cy = anchor.y;

  // Escudo heráldico atlético moderno
  ctx.beginPath();
  ctx.moveTo(cx, cy - 45);
  ctx.lineTo(cx + 38, cy - 28);
  ctx.lineTo(cx + 38, cy + 15);
  ctx.bezierCurveTo(cx + 38, cy + 42, cx, cy + 52, cx, cy + 52);
  ctx.bezierCurveTo(cx, cy + 52, cx - 38, cy + 42, cx - 38, cy + 15);
  ctx.lineTo(cx - 38, cy - 28);
  ctx.closePath();

  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = accentColor;
  ctx.stroke();

  // Estrella de campeonato
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', cx, cy - 2);

  ctx.font = '800 12px "Montserrat", sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PRO', cx, cy + 26);

  ctx.restore();
}

function drawCrest(ctx, anchor, imgOrUrl) {
  if (typeof imgOrUrl === 'string') {
    loadImage(imgOrUrl).then((img) => {
      ctx.save();
      const x = anchor.x - anchor.width / 2;
      const y = anchor.y - anchor.height / 2;
      ctx.drawImage(img, x, y, anchor.width, anchor.height);
      ctx.restore();
    }).catch(() => {});
    return;
  }
  ctx.save();
  const x = anchor.x - anchor.width / 2;
  const y = anchor.y - anchor.height / 2;
  ctx.drawImage(imgOrUrl, x, y, anchor.width, anchor.height);
  ctx.restore();
}

function drawSponsorText(ctx, anchor, text, fillColor, strokeColor) {
  ctx.save();
  ctx.font = '900 56px "Montserrat", "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Borde
  ctx.lineWidth = 8;
  ctx.strokeStyle = strokeColor;
  ctx.lineJoin = 'round';
  ctx.strokeText(text.toUpperCase(), anchor.x, anchor.y);

  // Relleno
  ctx.fillStyle = fillColor;
  ctx.fillText(text.toUpperCase(), anchor.x, anchor.y);
  ctx.restore();
}

function drawSponsorImage(ctx, anchor, img) {
  ctx.save();
  const w = anchor.width;
  const h = anchor.height;
  ctx.drawImage(img, anchor.x - w / 2, anchor.y - h / 2, w, h);
  ctx.restore();
}

function drawFrontNumber(ctx, anchor, number, fontFamily, fill, stroke) {
  ctx.save();
  ctx.font = `bold 64px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.lineWidth = 8;
  ctx.strokeStyle = stroke;
  ctx.lineJoin = 'round';
  ctx.strokeText(number, anchor.x, anchor.y);

  ctx.fillStyle = fill;
  ctx.fillText(number, anchor.x, anchor.y);
  ctx.restore();
}

function drawPlayerName(ctx, anchor, name, fontFamily, fill, stroke, curveAngle = 0) {
  ctx.save();
  const cleanName = (name || '').toUpperCase();
  ctx.font = `bold 44px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (!curveAngle || Math.abs(curveAngle) < 2) {
    // Texto recto
    ctx.lineWidth = 6;
    ctx.strokeStyle = stroke;
    ctx.lineJoin = 'round';
    ctx.strokeText(cleanName, anchor.x, anchor.y);

    ctx.fillStyle = fill;
    ctx.fillText(cleanName, anchor.x, anchor.y);
  } else {
    // Texto con arco deportivo (curvatura)
    const radius = 600 / (Math.abs(curveAngle) / 20);
    const totalAngle = (cleanName.length * 28) / radius;
    const startAngle = -Math.PI / 2 - (totalAngle / 2) * (curveAngle > 0 ? 1 : -1);
    const centerY = curveAngle > 0 ? anchor.y + radius : anchor.y - radius;

    for (let i = 0; i < cleanName.length; i++) {
      const char = cleanName[i];
      const charAngle = startAngle + (i / (cleanName.length - 1 || 1)) * totalAngle * (curveAngle > 0 ? 1 : -1);
      const cx = anchor.x + radius * Math.cos(charAngle);
      const cy = centerY + radius * Math.sin(charAngle);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(charAngle + Math.PI / 2);

      ctx.lineWidth = 6;
      ctx.strokeStyle = stroke;
      ctx.strokeText(char, 0, 0);

      ctx.fillStyle = fill;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawBackNumber(ctx, anchor, number, fontFamily, fill, stroke, shadow) {
  ctx.save();
  ctx.font = `900 240px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cx = anchor.x;
  const cy = anchor.y;

  // 1. Sombra / Relieve 3D de competición
  if (shadow && shadow !== 'transparent') {
    ctx.lineWidth = 26;
    ctx.strokeStyle = shadow;
    ctx.lineJoin = 'miter';
    ctx.strokeText(number, cx + 8, cy + 8);
  }

  // 2. Borde exterior de alto contraste
  if (stroke && stroke !== 'transparent') {
    ctx.lineWidth = 18;
    ctx.strokeStyle = stroke;
    ctx.lineJoin = 'round';
    ctx.strokeText(number, cx, cy);
  }

  // 3. Relleno principal
  ctx.fillStyle = fill;
  ctx.fillText(number, cx, cy);

  ctx.restore();
}
