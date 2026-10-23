/**
 * ATLETIQ Engine v3.0 — Generador Procedural de Mapas PBR de Tejidos Deportivos (Inspirado en Kit Builder)
 *
 * Genera mosaicos sin costuras (seamless tiles 256x256) en memoria para:
 *  - Normal Map (relieve tridimensional real de los poros e hilos bajo la luz 3D)
 *  - Roughness / Micro-AO Map (variación microscópica de brillo entre poro e hilo)
 *  - 2D Pattern Tile (para superposición multiply en vistas 2D/2.5D)
 * Peso en red: 0 KB (100% determinista en GPU).
 */

import * as THREE from 'three';

const textureCache = new Map();

export function getFabricPBRMaps(weaveId = 'cooldry_hex', uvRepeat = 42) {
  const cacheKey = `${weaveId}_${uvRepeat}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const size = 256;
  const heightCanvas = document.createElement('canvas');
  heightCanvas.width = size;
  heightCanvas.height = size;
  const hCtx = heightCanvas.getContext('2d', { willReadFrequently: true });

  // Base neutra alta (hilo de poliéster)
  hCtx.fillStyle = '#d8d8d8';
  hCtx.fillRect(0, 0, size, size);

  if (weaveId === 'cooldry_hex') {
    // Malla microperforada hexagonal CoolDry™
    const cols = 8;
    const rows = 8;
    const cellW = size / cols;
    const cellH = size / rows;

    for (let r = -1; r <= rows; r++) {
      for (let c = -1; c <= cols; c++) {
        const cx = c * cellW + (r % 2 === 0 ? 0 : cellW * 0.5);
        const cy = r * cellH;

        // Poro transpirable hundido
        const grad = hCtx.createRadialGradient(cx, cy, 1, cx, cy, cellW * 0.34);
        grad.addColorStop(0, '#282828');
        grad.addColorStop(0.65, '#7a7a7a');
        grad.addColorStop(1, 'rgba(216,216,216,0)');
        hCtx.fillStyle = grad;
        hCtx.beginPath();
        hCtx.arc(cx, cy, cellW * 0.36, 0, Math.PI * 2);
        hCtx.fill();
      }
    }

    // Surcos finos de punto entrelazado
    hCtx.strokeStyle = 'rgba(255,255,255,0.35)';
    hCtx.lineWidth = 1.5;
    for (let x = 0; x < size; x += 8) {
      hCtx.beginPath();
      hCtx.moveTo(x, 0);
      hCtx.lineTo(x, size);
      hCtx.stroke();
    }
  } else if (weaveId === 'interlock_pro') {
    // Punto liso sedoso AeroSilk™ (columnas en V microscópicas)
    for (let y = 0; y < size; y += 8) {
      for (let x = 0; x < size; x += 8) {
        hCtx.strokeStyle = '#969696';
        hCtx.lineWidth = 1.4;
        hCtx.beginPath();
        hCtx.moveTo(x + 1, y);
        hCtx.lineTo(x + 4, y + 6);
        hCtx.lineTo(x + 7, y);
        hCtx.stroke();
      }
    }
  } else {
    // Piqué reforzado tipo Rugby / Polo
    const step = 16;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const offset = (y / step) % 2 === 0 ? 0 : step / 2;
        hCtx.fillStyle = '#555555';
        hCtx.beginPath();
        hCtx.roundRect(x + offset + 3, y + 3, step - 6, step - 6, 3);
        hCtx.fill();
      }
    }
  }

  // Convertir mapa de alturas en Normal Map RGB mediante filtro Sobel
  const src = hCtx.getImageData(0, 0, size, size).data;
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const nCtx = normalCanvas.getContext('2d');
  const normalImg = nCtx.createImageData(size, size);
  const dst = normalImg.data;

  const sampleH = (x, y) => {
    const wx = ((x % size) + size) % size;
    const wy = ((y % size) + size) % size;
    return src[(wy * size + wx) * 4] / 255;
  };

  const strength = 2.4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tl = sampleH(x - 1, y - 1);
      const t = sampleH(x, y - 1);
      const tr = sampleH(x + 1, y - 1);
      const l = sampleH(x - 1, y);
      const r = sampleH(x + 1, y);
      const bl = sampleH(x - 1, y + 1);
      const b = sampleH(x, y + 1);
      const br = sampleH(x + 1, y + 1);

      const dX = tr + 2 * r + br - (tl + 2 * l + bl);
      const dY = bl + 2 * b + br - (tl + 2 * t + tr);
      const dZ = 1.0 / strength;

      const len = Math.hypot(dX, dY, dZ) || 1;
      const idx = (y * size + x) * 4;
      dst[idx] = Math.round(((-dX / len) * 0.5 + 0.5) * 255);
      dst[idx + 1] = Math.round(((-dY / len) * 0.5 + 0.5) * 255);
      dst[idx + 2] = Math.round(((dZ / len) * 0.5 + 0.5) * 255);
      dst[idx + 3] = 255;
    }
  }
  nCtx.putImageData(normalImg, 0, 0);

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(uvRepeat, uvRepeat);

  const bumpWeaveMap = new THREE.CanvasTexture(heightCanvas);
  bumpWeaveMap.wrapS = THREE.RepeatWrapping;
  bumpWeaveMap.wrapT = THREE.RepeatWrapping;
  bumpWeaveMap.repeat.set(uvRepeat, uvRepeat);

  const bundle = {
    normalMap,
    aoWeaveMap: bumpWeaveMap,
    weaveCanvas: heightCanvas,
  };

  textureCache.set(cacheKey, bundle);
  return bundle;
}
