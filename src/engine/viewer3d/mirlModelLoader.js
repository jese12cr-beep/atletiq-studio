/**
 * ATLETIQ Engine v4.0 — Decodificador Binario Nativo `.mirl` v1.1 (Owayo 3D Exact Mesh Loader)
 *
 * Carga y descomprime en GPU los escaneos textiles reales de alta densidad:
 *  - `football_f3_ka.mirl`: 38,319 vértices / 74,898 triángulos (7 piezas: Front, Back, LeftArm, RightArm, Collar, Etikett, EtikettFahne)
 *  - `basketball_b6_hero.mirl`: 31,204 vértices / 60,593 triángulos (7 piezas: Front, Back, Krageneinfass, Aermelbandlinks, Aermelbandrechts, Etikett, EtikettFahne)
 */

import * as THREE from 'three';
import { mapMeshPartNameToPanel } from '../core/boundingBoxMath';

const MIRL_WORLD_SCALE = 0.345;
const parsedMirlCache = new Map();

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

function parseMirlBytes(bytes) {
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

  // Centrar el grupo completo sobre el origen (moveObjectGroupOverOrigin) y escalar a unidades de estudio Three.js
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const cz = (minZ + maxZ) / 2;

  const geometries = rawParts.map((part) => {
    const pos = part.positions;
    for (let i = 0; i < part.anzVertices; i++) {
      const p = i * 3;
      pos[p] = (pos[p] - cx) * MIRL_WORLD_SCALE;
      pos[p + 1] = (pos[p + 1] - cy) * MIRL_WORLD_SCALE;
      pos[p + 2] = (pos[p + 2] - cz) * MIRL_WORLD_SCALE;
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
      geometry: geo,
    };
  });

  return {
    version,
    totalVertices,
    totalFaces,
    dimensions: {
      x: (maxX - minX) * MIRL_WORLD_SCALE,
      y: (maxY - minY) * MIRL_WORLD_SCALE,
      z: (maxZ - minZ) * MIRL_WORLD_SCALE,
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
    return parseMirlBytes(gunzipped);
  })();

  parsedMirlCache.set(mirlUrl, pending);
  return pending;
}

/**
 * Construye una textura tejida personalizada ATLETIQ PRO™ para la etiqueta interior de cuello (`Etikett`).
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
      mat = partMaterialsMap.Collar || partMaterialsMap.Front;
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
