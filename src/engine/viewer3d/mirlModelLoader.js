/**
 * ATLETIQ Engine v5.0 — Decodificador Binario Nativo `.mirl` v1.1 + Extractor 2D de Patronaje Sastre Real
 *
 * Carga y descomprime en GPU los 4 escaneos textiles reales de alta densidad:
 *  - `football_f3_ka.mirl`: 38,319 vértices / 74,898 triángulos (Camiseta Fútbol F3 Basic)
 *  - `football_shorts_fp3.mirl`: 9,045 vértices / 17,476 triángulos (Short Fútbol FP3 Basic)
 *  - `basketball_b6_hero.mirl`: 31,204 vértices / 60,593 triángulos (Camiseta Baloncesto B6 Hero)
 *  - `basketball_shorts_bp6.mirl`: 55,791 vértices / 110,341 triángulos (Short Baloncesto BP6 Hero)
 *
 * Además extrae directamente desde la topología UV de cada pieza la silueta exacta de sastrería 2D
 * (`silhouetteCanvas`) y las aristas reales de costura/corte (`boundaryPath`) para el Laboratorio de Moldes 2D.
 */

import * as THREE from 'three';
import { mapMeshPartNameToPanel } from '../core/boundingBoxMath';

const parsedMirlCache = new Map();
const patternMask2DCache = new Map();

async function gunzipIfNeeded(arrayBuffer) {
  const head = new Uint8Array(arrayBuffer, 0, Math.min(2, arrayBuffer.byteLength));
  if (head.length >= 2 && head[0] === 0x1f && head[1] === 0x8b) {
    if (typeof DecompressionStream !== 'undefined') {
      const ds = new DecompressionStream('gzip');
      const stream = new Blob([arrayBuffer]).stream().pipeThrough(ds);
      const outBuf = await new Response(stream).arrayBuffer();
      return new Uint8Array(outBuf);
    }
  }
  return new Uint8Array(arrayBuffer);
}

function parseMirlBytes(bytes, mirlUrl = '') {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let idx = 0;

  const readByte = () => bytes[idx++];
  const readWord = () => {
    const v = view.getUint16(idx, true);
    idx += 2;
    return v;
  };
  const readInt = () => {
    const v = view.getUint32(idx, true);
    idx += 4;
    return v;
  };
  const readFloat = () => {
    const f = view.getFloat32(idx, true);
    idx += 4;
    return parseFloat(f.toFixed(3));
  };
  const readString = () => {
    const len = readInt();
    let s = '';
    for (let i = 0; i < len; i++) {
      s += String.fromCharCode(bytes[idx + i]);
    }
    idx += len;
    return s;
  };

  const version = readString();
  if (!version.startsWith('v1.1')) {
    throw new Error(`Formato .mirl no soportado: ${version}`);
  }
  const uvAsFloat = version.endsWith('_UVsAsFloat');

  const rawParts = [];
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let totalVertices = 0;
  let totalFaces = 0;

  while (idx < bytes.byteLength) {
    const name = readString();
    const anzVertices = readInt();
    const anzFaces = readInt();
    const fx = readFloat();
    const fy = readFloat();
    const fz = readFloat();

    totalVertices += anzVertices;
    totalFaces += anzFaces;

    const positions = new Float32Array(anzVertices * 3);
    for (let i = 0; i < anzVertices; i++) {
      const x = readWord() / fx;
      const z = -readWord() / fy;
      const y = readWord() / fz;
      const p = i * 3;
      positions[p] = x;
      positions[p + 1] = y;
      positions[p + 2] = z;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }

    const IndexArrayType = anzVertices < 65536 ? Uint16Array : Uint32Array;
    const indices = new IndexArrayType(anzFaces * 3);
    for (let f = 0; f < anzFaces; f++) {
      let a, b, c;
      if (anzVertices < 256) {
        a = readByte();
        b = readByte();
        c = readByte();
      } else if (anzVertices < 65536) {
        a = readWord();
        b = readWord();
        c = readWord();
      } else {
        a = readInt();
        b = readInt();
        c = readInt();
      }
      const base = f * 3;
      indices[base] = a;
      indices[base + 1] = b;
      indices[base + 2] = c;
    }

    const uvs = new Float32Array(anzVertices * 2);
    for (let f = 0; f < anzFaces; f++) {
      const base = f * 3;
      for (let k = 0; k < 3; k++) {
        const vi = indices[base + k] * 2;
        uvs[vi] = uvAsFloat ? readFloat() : readWord() / 65535;
        uvs[vi + 1] = uvAsFloat ? readFloat() : readWord() / 65535;
      }
    }

    rawParts.push({ name, anzVertices, anzFaces, positions, indices, uvs });
  }

  // Escala armónica de estudio: mantiene camisetas (~7.5 dm) y shorts (~5.0 dm) encuadrados con presencia heroica
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;
  const spanMax = Math.max(maxX - minX, maxY - minY, 5.4);
  const worldScale = 2.62 / spanMax;

  const geometries = rawParts.map((part) => {
    const pos = part.positions;
    for (let i = 0; i < part.anzVertices; i++) {
      const p = i * 3;
      pos[p] = (pos[p] - cx) * worldScale;
      pos[p + 1] = (pos[p + 1] - cy) * worldScale;
      pos[p + 2] = (pos[p + 2] - cz) * worldScale;
    }

    const geo = new THREE.BufferGeometry();
    geo.setIndex(new THREE.BufferAttribute(part.indices, 1));
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(part.uvs, 2));
    geo.computeVertexNormals();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();

    return {
      name: part.name,
      anzVertices: part.anzVertices,
      anzFaces: part.anzFaces,
      uvs: part.uvs,
      indices: part.indices,
      geometry: geo,
    };
  });

  return {
    mirlUrl,
    version,
    totalVertices,
    totalFaces,
    dimensions: {
      x: (maxX - minX) * worldScale,
      y: (maxY - minY) * worldScale,
      z: (maxZ - minZ) * worldScale,
    },
    parts: geometries,
  };
}

export async function loadMirlModelTemplate(mirlUrl = '/models/football_f3_ka.mirl') {
  if (parsedMirlCache.has(mirlUrl)) {
    return parsedMirlCache.get(mirlUrl);
  }

  const pending = (async () => {
    const resp = await fetch(mirlUrl);
    if (!resp.ok) {
      throw new Error(`No se pudo cargar ${mirlUrl} (${resp.status})`);
    }
    const rawBuf = await resp.arrayBuffer();
    const gunzipped = await gunzipIfNeeded(rawBuf);
    return parseMirlBytes(gunzipped, mirlUrl);
  })();

  parsedMirlCache.set(mirlUrl, pending);
  return pending;
}

/**
 * Extrae y almacena en caché la silueta 2D exacta de patronaje (`silhouetteCanvas`) y las aristas reales
 * de borde de costura (`boundaryPath`) a partir de los triángulos UV del archivo `.mirl`.
 */
export function getMirlPartPatternMask2D(template, partName, width = 768, height = 768) {
  if (!template) return null;
  const cacheKey = `${template.mirlUrl}|${partName}|${width}x${height}`;
  if (patternMask2DCache.has(cacheKey)) {
    return patternMask2DCache.get(cacheKey);
  }

  const part = template.parts.find((p) => p.name === partName);
  if (!part) return null;

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mCtx = maskCanvas.getContext('2d');
  mCtx.fillStyle = '#ffffff';

  const { uvs, indices, anzFaces } = part;

  // 1. Rasterizar por lotes todos los triángulos UV para obtener la máscara exacta sin huecos
  const BATCH = 1500;
  let minU = 1, maxU = 0, minV = 1, maxV = 0;

  for (let start = 0; start < anzFaces; start += BATCH) {
    const end = Math.min(anzFaces, start + BATCH);
    mCtx.beginPath();
    for (let f = start; f < end; f++) {
      const i0 = indices[f * 3] * 2;
      const i1 = indices[f * 3 + 1] * 2;
      const i2 = indices[f * 3 + 2] * 2;

      const u0 = uvs[i0], v0 = 1 - uvs[i0 + 1];
      const u1 = uvs[i1], v1 = 1 - uvs[i1 + 1];
      const u2 = uvs[i2], v2 = 1 - uvs[i2 + 1];

      if (u0 < minU) minU = u0; if (u0 > maxU) maxU = u0;
      if (v0 < minV) minV = v0; if (v0 > maxV) maxV = v0;

      mCtx.moveTo(u0 * width, v0 * height);
      mCtx.lineTo(u1 * width, v1 * height);
      mCtx.lineTo(u2 * width, v2 * height);
      mCtx.closePath();
    }
    mCtx.fill();
    // Sellado sub-píxel de costuras internas entre triángulos UV
    mCtx.lineWidth = 1.25;
    mCtx.strokeStyle = '#ffffff';
    mCtx.stroke();
  }

  // 2. Detectar las aristas exteriores reales de corte (aristas pertenecientes a 1 solo triángulo UV)
  const edgeCounts = new Map();
  const edgeCoords = new Map();
  const q = (val) => Math.round(val * 8192);

  const registerEdge = (uA, vA, uB, vB) => {
    const xA = q(uA), yA = q(vA);
    const xB = q(uB), yB = q(vB);
    if (xA === xB && yA === yB) return;
    const forward = xA < xB || (xA === xB && yA < yB);
    const key = forward ? `${xA},${yA}:${xB},${yB}` : `${xB},${yB}:${xA},${yA}`;
    const c = edgeCounts.get(key) || 0;
    edgeCounts.set(key, c + 1);
    if (c === 0) {
      edgeCoords.set(key, [uA * width, vA * height, uB * width, vB * height]);
    }
  };

  for (let f = 0; f < anzFaces; f++) {
    const i0 = indices[f * 3] * 2;
    const i1 = indices[f * 3 + 1] * 2;
    const i2 = indices[f * 3 + 2] * 2;
    const u0 = uvs[i0], v0 = 1 - uvs[i0 + 1];
    const u1 = uvs[i1], v1 = 1 - uvs[i1 + 1];
    const u2 = uvs[i2], v2 = 1 - uvs[i2 + 1];
    registerEdge(u0, v0, u1, v1);
    registerEdge(u1, v1, u2, v2);
    registerEdge(u2, v2, u0, v0);
  }

  const boundaryPath = new Path2D();
  for (const [key, count] of edgeCounts) {
    if (count === 1) {
      const seg = edgeCoords.get(key);
      boundaryPath.moveTo(seg[0], seg[1]);
      boundaryPath.lineTo(seg[2], seg[3]);
    }
  }

  const result = {
    maskCanvas,
    boundaryPath,
    uvBounds: { minU, maxU, minV, maxV },
    width,
    height,
  };
  patternMask2DCache.set(cacheKey, result);
  return result;
}

/**
 * Construye una textura tejida personalizada ATLETIQ PRO™ para la etiqueta interior de cuello/cintura (`Etikett`).
 */
export function buildNeckLabelCanvasTexture(sizeText = 'L') {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 256;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, 484, 228);

  ctx.fillStyle = '#fbbf24';
  ctx.font = "900 42px 'Chakra Petch', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('ATLETIQ PRO™', 256, 86);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = "700 22px 'Outfit', sans-serif";
  ctx.fillText('SUBLIMATION ENGINEERED', 256, 128);

  ctx.fillStyle = '#ffffff';
  ctx.font = "900 54px 'Bebas Neue', sans-serif";
  ctx.fillText(`SIZE ${sizeText || 'L'}`, 256, 204);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Instancia un `THREE.Group` con todas las piezas del modelo `.mirl` conectadas a sus materiales individuales por pieza.
 */
export function instantiateMirlGarmentGroup(template, partMaterialsMap, neckLabelMat, hemFlagMat) {
  const group = new THREE.Group();
  group.name = 'OwayoMirlGarmentGroup';

  const fallbackMat =
    partMaterialsMap.Front ||
    partMaterialsMap.RightLeg ||
    partMaterialsMap.LeftLeg ||
    partMaterialsMap.Collar;

  for (const part of template.parts) {
    let mat = partMaterialsMap[part.name];
    const panel = mapMeshPartNameToPanel(part.name);
    let isDroppable = Boolean(panel);

    if (part.name === 'Etikett') {
      mat = neckLabelMat;
      isDroppable = false;
    } else if (part.name === 'EtikettFahne') {
      mat = hemFlagMat;
      isDroppable = false;
    } else if (!mat) {
      mat = fallbackMat;
    }

    const mesh = new THREE.Mesh(part.geometry, mat);
    mesh.name = part.name;
    mesh.castShadow = part.name !== 'Etikett';
    mesh.receiveShadow = true;
    mesh.userData = {
      partName: part.name,
      panel,
      isDroppable,
      vertices: part.anzVertices,
      faces: part.anzFaces,
    };
    group.add(mesh);
  }

  return group;
}
