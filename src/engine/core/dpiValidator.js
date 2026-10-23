/**
 * ATLETIQ Engine v4.0 — Procesador Avanzado de Archivos PNG / SVG / WebP,
 * Sanitizador SVG Vectorial, Quita-Fondo Blanco Inteligente y Caché de Tinte Pantone
 */

export function calculateEffectiveDpi(pixelWidth, physicalWidthMm, scale = 1, isVector = false) {
  if (isVector) {
    return {
      dpi: 999,
      level: 'VECTOR',
      label: 'SVG Vectorial Infinito (300+ DPI RIP)',
      colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    };
  }

  const effectiveWidthInches = Math.max(0.1, (physicalWidthMm * scale) / 25.4);
  const dpi = Math.round(pixelWidth / effectiveWidthInches);

  if (dpi >= 200) {
    return {
      dpi,
      level: 'OPTIMAL',
      label: `${dpi} DPI — Nitidez Sublimación HD`,
      colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    };
  }
  if (dpi >= 110) {
    return {
      dpi,
      level: 'WARNING',
      label: `${dpi} DPI — Aceptable en Textil`,
      colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    };
  }
  return {
    dpi,
    level: 'LOW_RES',
    label: `${dpi} DPI — Baja resolución (Subir SVG o PNG mayor)`,
    colorClass: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
  };
}

/**
 * Limpia un archivo SVG (elimina <script>, <foreignObject> y atributos on*) y garantiza
 * atributos `width` y `height` explícitos desde `viewBox` para que HTMLCanvasElement.drawImage()
 * nunca falle con SVGs exportados de Illustrator, Inkscape o Figma sin dimensiones fijas.
 */
function normalizeAndSanitizeSvgText(rawSvgText) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvgText, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return { svgText: rawSvgText, width: 1024, height: 1024 };

    // Eliminar nodos potencialmente inseguros
    doc.querySelectorAll('script, foreignObject, iframe, object, embed').forEach((el) => el.remove());
    doc.querySelectorAll('*').forEach((el) => {
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || (name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:'))) {
          el.removeAttribute(attr.name);
        }
      }
    });

    if (!svg.getAttribute('xmlns')) {
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    let vbW = 0;
    let vbH = 0;
    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const nums = viewBox
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (nums.length === 4 && nums[2] > 0 && nums[3] > 0) {
        vbW = nums[2];
        vbH = nums[3];
      }
    }

    const parseDim = (val) => {
      if (!val || String(val).includes('%')) return 0;
      const n = parseFloat(val);
      return Number.isFinite(n) && n > 0 ? n : 0;
    };

    let w = parseDim(svg.getAttribute('width')) || vbW || 1024;
    let h = parseDim(svg.getAttribute('height')) || vbH || 1024;

    if (!viewBox) {
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    }

    // Escalar dimensiones intrínsecas de rasterización en GPU a ~1600px en su lado mayor para máxima nitidez
    const scale = 1600 / Math.max(w, h, 1);
    const renderW = Math.max(64, Math.round(w * scale));
    const renderH = Math.max(64, Math.round(h * scale));
    svg.setAttribute('width', String(renderW));
    svg.setAttribute('height', String(renderH));

    const serializer = new XMLSerializer();
    return {
      svgText: serializer.serializeToString(svg),
      width: renderW,
      height: renderH,
    };
  } catch {
    return { svgText: rawSvgText, width: 1024, height: 1024 };
  }
}

/**
 * Procesa cualquier archivo gráfico subido (`.svg`, `.png`, `.webp`, `.jpg`):
 * - Para SVG: sanitiza, normaliza `viewBox`/dimensiones de alta definición (1600px+) y conserva escalabilidad vectorial.
 * - Para PNG/WebP/JPG: recorta automáticamente márgenes transparentes sobrantes y genera proxy de alta nitidez (hasta 1600px).
 */
export async function processUploadedArtwork(file) {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const artworkId = `art_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const originalWeightKB = +(file.size / 1024).toFixed(1);

  if (isSvg) {
    const rawText = await file.text();
    const { svgText, width, height } = normalizeAndSanitizeSvgText(rawText);
    const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);

    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = blobUrl;
    });

    const aspect = (img.naturalWidth || width) / Math.max(1, img.naturalHeight || height);
    return {
      artworkId,
      fileName: file.name,
      isVector: true,
      originalWeightKB,
      proxyWeightKB: +(svgBlob.size / 1024).toFixed(1),
      widthPx: 3200,
      heightPx: Math.round(3200 / aspect),
      aspectRatio: aspect,
      previewUrl: blobUrl,
      imageElement: img,
      svgSource: svgText,
    };
  }

  const rawBlobUrl = URL.createObjectURL(file);
  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = rawBlobUrl;
  });

  // Auto-trim de píxeles transparentes y proxy GPU de alta resolución (hasta 1600px para impresiones grandes)
  const scanCanvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  scanCanvas.width = w;
  scanCanvas.height = h;
  const ctx = scanCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const { data } = ctx.getImageData(0, 0, w, h);
  let minX = w, minY = h, maxX = 0, maxY = 0;
  let hasOpaque = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const alpha = data[(y * w + x) * 4 + 3];
      if (alpha > 10) {
        hasOpaque = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasOpaque) {
    minX = 0; minY = 0; maxX = w - 1; maxY = h - 1;
  }

  const trimW = Math.max(1, maxX - minX + 1);
  const trimH = Math.max(1, maxY - minY + 1);

  const maxGpuDim = 1600;
  const downscale = Math.min(1, maxGpuDim / Math.max(trimW, trimH));
  const outW = Math.max(1, Math.round(trimW * downscale));
  const outH = Math.max(1, Math.round(trimH * downscale));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d');
  outCtx.drawImage(scanCanvas, minX, minY, trimW, trimH, 0, 0, outW, outH);

  const proxyBlob = await new Promise((res) => outCanvas.toBlob(res, 'image/png'));
  URL.revokeObjectURL(rawBlobUrl);
  const proxyUrl = URL.createObjectURL(proxyBlob);

  const proxyImg = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = proxyUrl;
  });

  return {
    artworkId,
    fileName: file.name,
    isVector: false,
    originalWeightKB,
    proxyWeightKB: +(proxyBlob.size / 1024).toFixed(1),
    widthPx: trimW,
    heightPx: trimH,
    aspectRatio: trimW / trimH,
    previewUrl: proxyUrl,
    imageElement: proxyImg,
  };
}

// Caché en memoria de variantes filtradas (quita-fondo blanco y/o tinte Pantone monocromo)
const filteredVariantCache = new Map();

/**
 * Devuelve un `HTMLCanvasElement` o `HTMLImageElement` listo para `ctx.drawImage()` aplicando:
 *  - `removeWhiteBg`: elimina píxeles blancos/casi blancos con transición suave anti-alias.
 *  - `tintHex`: recolorea la silueta alfa completa al color Pantone seleccionado (ideal para SVGs/logos monocromos).
 *  - `invertImage`: invierte luminancia (modo marca de agua invertida `wasserzeichenInvertImage` de Owayo).
 */
export function getFilteredArtworkDrawable(asset, { removeWhiteBg = false, whiteThreshold = 238, tintHex = '', invertImage = false } = {}) {
  if (!asset?.imageElement) return null;
  if (!removeWhiteBg && !tintHex && !invertImage) {
    return asset.imageElement;
  }

  const key = `${asset.artworkId}|bg:${removeWhiteBg ? whiteThreshold : 0}|tint:${tintHex || 'none'}|inv:${invertImage ? 1 : 0}`;
  if (filteredVariantCache.has(key)) {
    return filteredVariantCache.get(key);
  }

  const src = asset.imageElement;
  const w = Math.min(1600, Math.max(64, src.naturalWidth || src.width || 512));
  const h = Math.min(1600, Math.max(64, src.naturalHeight || src.height || 512));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: removeWhiteBg || invertImage });
  ctx.drawImage(src, 0, 0, w, h);

  if (removeWhiteBg || invertImage) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const softStart = Math.max(150, whiteThreshold - 26);
    const range = Math.max(1, whiteThreshold - softStart);

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      if (a === 0) continue;

      if (removeWhiteBg) {
        const minCh = Math.min(r, g, b);
        if (minCh >= whiteThreshold) {
          a = 0;
        } else if (minCh > softStart) {
          a = Math.round(a * (1 - (minCh - softStart) / range));
        }
      }

      if (invertImage && a > 0) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = a;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  if (tintHex) {
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = tintHex;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  if (filteredVariantCache.size > 80) {
    const firstKey = filteredVariantCache.keys().next().value;
    filteredVariantCache.delete(firstKey);
  }
  filteredVariantCache.set(key, canvas);
  return canvas;
}
