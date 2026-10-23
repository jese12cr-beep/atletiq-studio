/**
 * ATLETIQ Engine v3.0 — Validador de DPI Físico, Auto-Recorte Alpha y Proxy de Imagen (Estilo CustomInk)
 *
 * Evita inyectar cadenas Base64 pesadas en el carrito de Shopify:
 *  1. Recorta bordes transparentes sobrantes alrededor del PNG subido.
 *  2. Crea un proxy ligero en memoria (blob: URL / canvas optimizado max 1024px) para 60 FPS.
 *  3. Calcula el DPI real de impresión en función del tamaño en milímetros sobre la prenda.
 */

export function calculateEffectiveDpi(pixelWidth, physicalWidthMm, scale = 1, isVector = false) {
  if (isVector) {
    return {
      dpi: 999,
      level: 'VECTOR',
      label: 'Vector Infinito (Óptimo 300+ DPI)',
      colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    };
  }

  const effectiveWidthInches = Math.max(0.1, (physicalWidthMm * scale) / 25.4);
  const dpi = Math.round(pixelWidth / effectiveWidthInches);

  if (dpi >= 200) {
    return {
      dpi,
      level: 'OPTIMAL',
      label: `${dpi} DPI — Nitidez Profesional`,
      colorClass: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    };
  }
  if (dpi >= 120) {
    return {
      dpi,
      level: 'WARNING',
      label: `${dpi} DPI — Aceptable (No agrandar más)`,
      colorClass: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    };
  }
  return {
    dpi,
    level: 'LOW_RES',
    label: `${dpi} DPI — Baja resolución (Riesgo pixelado)`,
    colorClass: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
  };
}

/**
 * Procesa un archivo subido por el usuario:
 * - Detecta si es SVG vectorial o imagen raster (PNG/JPG/WebP).
 * - Recorta automáticamente el margen transparente vacío (Auto-Trim Alpha Bounding Box).
 * - Devuelve un ObjectURL ligero, dimensiones originales en px y un `artworkId` limpio.
 */
export async function processUploadedArtwork(file) {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const artworkId = `art_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const originalWeightKB = +(file.size / 1024).toFixed(1);

  const rawBlobUrl = URL.createObjectURL(file);

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = rawBlobUrl;
  });

  if (isSvg) {
    const aspect = (img.naturalWidth || 100) / (img.naturalHeight || 100);
    return {
      artworkId,
      fileName: file.name,
      isVector: true,
      originalWeightKB,
      proxyWeightKB: originalWeightKB,
      widthPx: 2400,
      heightPx: Math.round(2400 / aspect),
      aspectRatio: aspect,
      previewUrl: rawBlobUrl,
      imageElement: img,
    };
  }

  // Auto-trim de píxeles transparentes y downscale inteligente para textura GPU (máx 1024px)
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
      if (alpha > 12) {
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

  const maxGpuDim = 1024;
  const downscale = Math.min(1, maxGpuDim / Math.max(trimW, trimH));
  const outW = Math.max(1, Math.round(trimW * downscale));
  const outH = Math.max(1, Math.round(trimH * downscale));

  const outCanvas = document.createElement('canvas');
  outCanvas.width = outW;
  outCanvas.height = outH;
  const outCtx = outCanvas.getContext('2d');
  outCtx.drawImage(scanCanvas, minX, minY, trimW, trimH, 0, 0, outW, outH);

  const proxyBlob = await new Promise((res) => outCanvas.toBlob(res, 'image/webp', 0.9));
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
