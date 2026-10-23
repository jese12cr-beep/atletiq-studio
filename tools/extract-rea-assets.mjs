/**
 * tools/extract-rea-assets.mjs
 *
 * Extrae desde las capturas HAR (gitignored en `rea-captures/owayo/`):
 *  1. Modelos binarios 3D exactos `.mirl` v1.1 (`football_f3_ka.mirl` 38,319 vértices y `basketball_b6_hero.mirl` 31,204 vértices).
 *  2. Los 15 diseños `.fish` de Fútbol + 9 diseños `.fish` de Baloncesto, limpiando quirúrgicamente por BFS
 *     cualquier índice de marca de fabricante (`190 <= R < 255`: OOF, OOL, OOB, HF, Tec) para dejar moldes 100% white-label.
 *  3. Mapas reales de micro-relieve textil (`ts-tex.png`, `k-tex2.png`, `bandstoff-rtex3.png`).
 *  4. Sistema completo de 167 colores textiles (`152 CM5` + `15 Flúor/Especiales`) con equivalencia Pantone® PMS (`src/engine/core/palette152.js`).
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = 'C:/Users/crja_/.gemini/antigravity/scratch/sport-custom-studio';
const HAR_V2 = path.join(ROOT, 'rea-captures/owayo/www.owayo.es_v2.har');
const HAR_V1 = path.join(ROOT, 'rea-captures/owayo/www.owayo.es.har');

// ---------------- CRC32 & Minimal Clean PNG Codec ----------------
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function makeChunk(typeStr, dataBuf) {
  const out = Buffer.alloc(12 + dataBuf.length);
  out.writeUInt32BE(dataBuf.length, 0);
  out.write(typeStr, 4, 4, 'ascii');
  dataBuf.copy(out, 8);
  const crc = crc32(out.subarray(4, 8 + dataBuf.length));
  out.writeUInt32BE(crc, 8 + dataBuf.length);
  return out;
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * Decodifica un PNG de máscara `.fish`, elimina cualquier píxel con `190 <= R < 255`
 * rellenándolo por BFS con la zona de color adyacente (`R < 190`), y lo re-codifica como PNG Grayscale (colorType=0, 8-bit)
 * ¡reduciendo además su tamaño casi a la tercera parte sin perder ni un bit de índice `0..255`!
 */
function scrubFishMaskPng(pngBuf) {
  let pos = 8;
  let width = 0, height = 0, bitDepth = 8, colorType = 2;
  const idatParts = [];
  while (pos < pngBuf.length) {
    const len = pngBuf.readUInt32BE(pos);
    const type = pngBuf.toString('ascii', pos + 4, pos + 8);
    const chunkData = pngBuf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = chunkData.readUInt32BE(0);
      height = chunkData.readUInt32BE(4);
      bitDepth = chunkData[8];
      colorType = chunkData[9];
    } else if (type === 'IDAT') {
      idatParts.push(chunkData);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }
  if (!width || !height || bitDepth !== 8) return { pngBuf, scrubbedCount: 0 };

  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : 1;
  const raw = zlib.inflateSync(Buffer.concat(idatParts));
  const stride = width * bpp;
  const recon = new Uint8Array(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const rowIn = y * (stride + 1) + 1;
    const rowOut = y * stride;
    const prevOut = (y - 1) * stride;
    for (let i = 0; i < stride; i++) {
      const xByte = raw[rowIn + i];
      const a = i >= bpp ? recon[rowOut + i - bpp] : 0;
      const b = y > 0 ? recon[prevOut + i] : 0;
      const c = y > 0 && i >= bpp ? recon[prevOut + i - bpp] : 0;
      let val = xByte;
      if (filter === 1) val = (xByte + a) & 0xff;
      else if (filter === 2) val = (xByte + b) & 0xff;
      else if (filter === 3) val = (xByte + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) val = (xByte + paethPredictor(a, b, c)) & 0xff;
      recon[rowOut + i] = val;
    }
  }

  // Extraer canal R (índice de zona `ColorCodeNr`)
  const totalPx = width * height;
  const zoneGrid = new Uint8Array(totalPx);
  let watermarkCount = 0;
  for (let p = 0; p < totalPx; p++) {
    const r = recon[p * bpp];
    zoneGrid[p] = r;
    if (r >= 190 && r < 255) watermarkCount++;
  }

  if (watermarkCount > 0) {
    // BFS multi-origen desde los píxeles de borde válidos (`r < 190`) adyacentes a la marca `190..254`
    const queue = new Int32Array(watermarkCount + width * 4);
    let qHead = 0, qTail = 0;
    const dirs = [-1, 1, -width, width];

    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const idx = row + x;
        const z = zoneGrid[idx];
        if (z >= 190 && z < 255) {
          // Revisar si tiene vecino directo `< 190`
          let seedZone = 0;
          if (x > 0 && zoneGrid[idx - 1] < 190) seedZone = zoneGrid[idx - 1];
          else if (x + 1 < width && zoneGrid[idx + 1] < 190) seedZone = zoneGrid[idx + 1];
          else if (y > 0 && zoneGrid[idx - width] < 190) seedZone = zoneGrid[idx - width];
          else if (y + 1 < height && zoneGrid[idx + width] < 190) seedZone = zoneGrid[idx + width];
          if (seedZone > 0) {
            zoneGrid[idx] = seedZone;
            queue[qTail++] = idx;
          }
        }
      }
    }

    while (qHead < qTail) {
      const cur = queue[qHead++];
      const curZone = zoneGrid[cur];
      const cx = cur % width;
      const cy = (cur / width) | 0;
      if (cx > 0) {
        const n = cur - 1;
        if (zoneGrid[n] >= 190 && zoneGrid[n] < 255) { zoneGrid[n] = curZone; queue[qTail++] = n; }
      }
      if (cx + 1 < width) {
        const n = cur + 1;
        if (zoneGrid[n] >= 190 && zoneGrid[n] < 255) { zoneGrid[n] = curZone; queue[qTail++] = n; }
      }
      if (cy > 0) {
        const n = cur - width;
        if (zoneGrid[n] >= 190 && zoneGrid[n] < 255) { zoneGrid[n] = curZone; queue[qTail++] = n; }
      }
      if (cy + 1 < height) {
        const n = cur + width;
        if (zoneGrid[n] >= 190 && zoneGrid[n] < 255) { zoneGrid[n] = curZone; queue[qTail++] = n; }
      }
    }

    // Fallback por seguridad si algún islote estaba aislado en padding 255
    for (let p = 0; p < totalPx; p++) {
      if (zoneGrid[p] >= 190 && zoneGrid[p] < 255) zoneGrid[p] = 1;
    }
  }

  // Re-codificar como PNG RGB (colorType=2, igual que el original pero limpio y con filtro Up/Sub ligero)
  // Usamos RGB (R=G=B=zoneGrid[p]) para que incluso si algún navegador aplica curva gamma sin colorSpaceConversion:'none',
  // R, G y B sean idénticos, o mejor aún: Grayscale (colorType=0) ocupa 3x menos y R=G=B=gray en Canvas 2D!
  const outRaw = Buffer.alloc(height * (width + 1));
  for (let y = 0; y < height; y++) {
    const outRow = y * (width + 1);
    const inRow = y * width;
    outRaw[outRow] = 2; // PNG Filter 2 (Up): ideal para máscaras de bloques verticales/horizontales
    for (let x = 0; x < width; x++) {
      const cur = zoneGrid[inRow + x];
      const up = y > 0 ? zoneGrid[inRow - width + x] : 0;
      outRaw[outRow + 1 + x] = (cur - up) & 0xff;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 0; // Grayscale (R=G=B=zoneIndex)
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(outRaw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const cleanPng = Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
  return { pngBuf: cleanPng, scrubbedCount: watermarkCount };
}

/**
 * Desempaqueta un archivo `.fish` (ZIP Store/Deflate), limpia cada PNG y re-empaqueta un `.fish` limpio (ZIP Store).
 */
function cleanFishArchive(fishBuf, designName) {
  let offset = 0;
  const entries = [];
  let totalScrubbed = 0;

  while (offset + 30 <= fishBuf.length) {
    const sig = fishBuf.readUInt32LE(offset);
    if (sig !== 0x04034b50) break;
    const method = fishBuf.readUInt16LE(offset + 8);
    const compSize = fishBuf.readUInt32LE(offset + 18);
    const nameLen = fishBuf.readUInt16LE(offset + 26);
    const extraLen = fishBuf.readUInt16LE(offset + 28);
    const fileName = fishBuf.toString('utf8', offset + 30, offset + 30 + nameLen);
    const dataStart = offset + 30 + nameLen + extraLen;
    const compData = fishBuf.subarray(dataStart, dataStart + compSize);
    const rawData = method === 8 ? zlib.inflateRawSync(compData) : compData;

    if (fileName.toLowerCase().endsWith('.png') && !fileName.includes('_shadow')) {
      const { pngBuf, scrubbedCount } = scrubFishMaskPng(rawData);
      totalScrubbed += scrubbedCount;
      // Normalizamos el nombre interno a `<Part>.png` (ej. `Front.png`, `LeftArm.png`) para carga directa
      const prefixRegex = new RegExp('^' + designName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '_');
      const partCleanName = fileName.replace(prefixRegex, '');
      entries.push({ name: partCleanName, data: pngBuf });
    }
    offset = dataStart + compSize;
  }

  // Construir ZIP Store (`method=0`) compacto
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, 'utf8');
    const crc = crc32(entry.data);
    const localHdr = Buffer.alloc(30 + nameBuf.length);
    localHdr.writeUInt32LE(0x04034b50, 0);
    localHdr.writeUInt16LE(20, 4);
    localHdr.writeUInt16LE(0, 6);
    localHdr.writeUInt16LE(0, 8); // Store
    localHdr.writeUInt32LE(crc, 14);
    localHdr.writeUInt32LE(entry.data.length, 18);
    localHdr.writeUInt32LE(entry.data.length, 22);
    localHdr.writeUInt16LE(nameBuf.length, 26);
    nameBuf.copy(localHdr, 30);

    const centralHdr = Buffer.alloc(46 + nameBuf.length);
    centralHdr.writeUInt32LE(0x02014b50, 0);
    centralHdr.writeUInt16LE(20, 4);
    centralHdr.writeUInt16LE(20, 6);
    centralHdr.writeUInt32LE(crc, 16);
    centralHdr.writeUInt32LE(entry.data.length, 20);
    centralHdr.writeUInt32LE(entry.data.length, 24);
    centralHdr.writeUInt16LE(nameBuf.length, 28);
    centralHdr.writeUInt32LE(localOffset, 42);
    nameBuf.copy(centralHdr, 46);

    localParts.push(localHdr, entry.data);
    centralParts.push(centralHdr);
    localOffset += localHdr.length + entry.data.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(localOffset, 16);

  return {
    cleanZip: Buffer.concat([...localParts, centralBuf, eocd]),
    parts: entries.map((e) => e.name.replace(/\.png$/i, '')),
    totalScrubbed,
  };
}

function slugifyDesign(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ---------------- Referencia Pantone® Solid Coated para Match Automático ----------------
const PANTONE_REF = [
  ['PMS Bright White', '#ffffff'], ['PMS Black 6 C', '#101820'], ['PMS Cool Gray 2 C', '#d0d0ce'],
  ['PMS Cool Gray 5 C', '#b1b3b3'], ['PMS Cool Gray 8 C', '#888b8d'], ['PMS Cool Gray 11 C', '#53565a'],
  ['PMS 100 C', '#f6eb61'], ['PMS 102 C', '#fce300'], ['PMS 109 C', '#ffd100'], ['PMS 116 C', '#ffcd00'], ['PMS 124 C', '#eaa800'],
  ['PMS 135 C', '#ffc72c'], ['PMS 143 C', '#f1b434'], ['PMS 151 C', '#ff8200'], ['PMS 1655 C', '#fc4c02'], ['PMS 173 C', '#cf4520'],
  ['PMS 178 C', '#ff585d'], ['PMS 185 C', '#e4002b'], ['PMS 186 C', '#c8102e'], ['PMS 187 C', '#a6192e'], ['PMS 188 C', '#76232f'],
  ['PMS 196 C', '#ebc0c6'], ['PMS 204 C', '#e17f93'], ['PMS 213 C', '#e31c79'], ['PMS 219 C', '#da1884'], ['PMS 227 C', '#a70267'],
  ['PMS 2562 C', '#cca1d9'], ['PMS 2582 C', '#9657b6'], ['PMS 266 C', '#753bbd'], ['PMS 2685 C', '#330072'], ['PMS 273 C', '#24135f'],
  ['PMS 2708 C', '#a3c1ad'], ['PMS 278 C', '#8bb8e8'], ['PMS 279 C', '#418fde'], ['PMS 285 C', '#0072ce'], ['PMS 286 C', '#0033a0'],
  ['PMS 288 C', '#002d72'], ['PMS 289 C', '#0c2340'], ['PMS 291 C', '#9bcbeb'], ['PMS 299 C', '#00a3e0'], ['PMS 300 C', '#005eb8'],
  ['PMS 306 C', '#00b5e2'], ['PMS 312 C', '#00a9ce'], ['PMS 3145 C', '#00778b'], ['PMS 3252 C', '#5bd1c5'], ['PMS 3262 C', '#00bfb3'],
  ['PMS 3282 C', '#008675'], ['PMS 340 C', '#00965e'], ['PMS 348 C', '#00843d'], ['PMS 349 C', '#046a38'], ['PMS 356 C', '#007a33'],
  ['PMS 360 C', '#6cc24a'], ['PMS 368 C', '#78be20'], ['PMS 375 C', '#97d700'], ['PMS 382 C', '#c4d600'], ['PMS 389 C', '#d0df00'],
  ['PMS 4515 C', '#b5a886'], ['PMS 465 C', '#b9975b'], ['PMS 468 C', '#ddc9a3'], ['PMS 476 C', '#4e3629'], ['PMS 4625 C', '#4f2c1d'],
  ['PMS 7548 C', '#ffc600'], ['PMS 802 C (Flúor)', '#44d62c'], ['PMS 804 C (Flúor)', '#ff9e1b'], ['PMS 806 C (Flúor)', '#ff0090'],
  ['PMS 809 C (Flúor)', '#dede00'], ['PMS 871 C (Oro)', '#84754e'], ['PMS 877 C (Plata)', '#8a8d8f'],
];

function hexToRgb(hex) {
  const c = hex.replace('#', '');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}
function findClosestPantone(hex, nameHint = '') {
  if (hex.toLowerCase() === '#ffffff') return 'PMS Bright White';
  if (hex.toLowerCase() === '#000000') return 'PMS Black 6 C';
  if (/neon|fluor/i.test(nameHint)) {
    if (/yellow/i.test(nameHint)) return 'PMS 809 C (Flúor)';
    if (/green/i.test(nameHint)) return 'PMS 802 C (Flúor)';
    if (/orange/i.test(nameHint)) return 'PMS 804 C (Flúor)';
    if (/pink|magenta/i.test(nameHint)) return 'PMS 806 C (Flúor)';
  }
  const [r1, g1, b1] = hexToRgb(hex);
  let best = 'PMS Custom C';
  let bestDist = Infinity;
  for (const [code, pHex] of PANTONE_REF) {
    const [r2, g2, b2] = hexToRgb(pHex);
    // Distancia perceptual ponderada redmean
    const rMean = (r1 + r2) / 2;
    const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
    const dist = (2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = code;
    }
  }
  return best;
}

const SPANISH_FAMILY_MAP = {
  White: 'Blanco', Black: 'Negro', Grey: 'Gris', Gray: 'Gris', Anthracite: 'Antracita',
  Yellow: 'Amarillo', Lemon: 'Limón', Gold: 'Oro', Orange: 'Naranja', Apricot: 'Damasco',
  Red: 'Rojo', Crimson: 'Carmesí', Bordeaux: 'Burdeos', Wine: 'Vino', Coral: 'Coral',
  Pink: 'Rosa', Magenta: 'Magenta', Berry: 'Frambuesa', Violet: 'Violeta', Purple: 'Púrpura',
  Lilac: 'Lila', Lavender: 'Lavanda', Navy: 'Marino', Blue: 'Azul', Royal: 'Azul Real',
  Sky: 'Celeste', Ice: 'Hielo', Steel: 'Acero', Cyan: 'Cian', Petrol: 'Petróleo',
  Turquoise: 'Turquesa', Mint: 'Menta', Aqua: 'Agua', Green: 'Verde', Emerald: 'Esmeralda',
  Lime: 'Lima', Olive: 'Oliva', Khaki: 'Caqui', Forest: 'Bosque', Beige: 'Beige',
  Sand: 'Arena', Cream: 'Crema', Brown: 'Marrón', Choco: 'Chocolate', Silver: 'Plata',
  Neon: 'Neón',
};

function translateColorName(enName = '') {
  let out = enName;
  for (const [en, es] of Object.entries(SPANISH_FAMILY_MAP)) {
    out = out.replace(new RegExp(`\\b${en}\\b`, 'gi'), es);
  }
  return out;
}

// ---------------- Ejecución Principal ----------------
console.log('Cargando capturas HAR...');
const harV2 = JSON.parse(fs.readFileSync(HAR_V2, 'utf8'));
const harV1 = JSON.parse(fs.readFileSync(HAR_V1, 'utf8'));

fs.mkdirSync(path.join(ROOT, 'public/models'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'public/designs/football_f3_ka'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'public/designs/basketball_b6_hero'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'public/fabrics'), { recursive: true });

// 1. Extraer modelos .mirl
const mirlFootball = harV2.log.entries.find((e) => e.request.url.endsWith('204m_Basic_KA.mirl'));
const bufFootball = Buffer.from(mirlFootball.response.content.text, mirlFootball.response.content.encoding || 'utf8');
fs.writeFileSync(path.join(ROOT, 'public/models/football_f3_ka.mirl'), bufFootball);
console.log(`✔ Modelo 3D Fútbol extraído: football_f3_ka.mirl (${(bufFootball.length / 1024).toFixed(1)} KB)`);

const mirlBasket = harV1.log.entries.find((e) => e.request.url.endsWith('222m-Hero.mirl'));
const bufBasket = Buffer.from(mirlBasket.response.content.text, mirlBasket.response.content.encoding || 'utf8');
fs.writeFileSync(path.join(ROOT, 'public/models/basketball_b6_hero.mirl'), bufBasket);
console.log(`✔ Modelo 3D Baloncesto extraído: basketball_b6_hero.mirl (${(bufBasket.length / 1024).toFixed(1)} KB)`);

// 2. Extraer y limpiar diseños .fish (Fútbol + Baloncesto)
function extractFishSet(har, prodFolder) {
  const prodEntry = har.log.entries.find((e) => e.request.url.includes('auswahlmodul/produkt.php') && e.response?.content?.text?.startsWith('{'));
  const prodJson = JSON.parse(prodEntry.response.content.text);
  const designMetaMap = new Map((prodJson.Designs || []).map((d) => [d.Design, d]));

  const seen = new Set();
  const catalogDesigns = [];

  for (const e of har.log.entries) {
    if (!e.request.url.endsWith('.fish') || !e.response?.content?.text) continue;
    const rawName = decodeURIComponent(e.request.url.split('/').pop().replace(/\.fish$/i, ''));
    if (seen.has(rawName)) continue;
    seen.add(rawName);

    const slug = slugifyDesign(rawName);
    const rawBuf = Buffer.from(e.response.content.text, e.response.content.encoding || 'utf8');
    const { cleanZip, parts, totalScrubbed } = cleanFishArchive(rawBuf, rawName);

    const outPath = path.join(ROOT, `public/designs/${prodFolder}/${slug}.fish`);
    fs.writeFileSync(outPath, cleanZip);

    const meta = designMetaMap.get(rawName) || {};
    catalogDesigns.push({
      id: slug,
      name: rawName,
      fileUrl: `/designs/${prodFolder}/${slug}.fish`,
      baseColors: meta.baseColors || ['A', 'B', 'C'],
      outlineZones: meta.ColorCodesWithOutline ? meta.ColorCodesWithOutline.split(',').filter(Boolean) : [],
      parts,
      sizeKB: +(cleanZip.length / 1024).toFixed(1),
    });
    console.log(`  ✔ Diseño limpio [${prodFolder}] ${rawName.padEnd(12)} -> ${slug}.fish (${(cleanZip.length / 1024).toFixed(1)} KB, ${totalScrubbed} px marca removidos)`);
  }
  return catalogDesigns;
}

const footballDesigns = extractFishSet(harV2, 'football_f3_ka');
const basketballDesigns = extractFishSet(harV1, 'basketball_b6_hero');

// 3. Extraer bumpMaps textiles reales
function extractFabricBump(har, stoffName, outFile) {
  const entry = har.log.entries.find((e) => e.request.url.toLowerCase().endsWith(stoffName.toLowerCase()) && e.response?.content?.text);
  if (!entry) return;
  const j = JSON.parse(entry.response.content.text);
  if (j.bumpMap) {
    const b64 = j.bumpMap.includes(',') ? j.bumpMap.split(',')[1] : j.bumpMap;
    fs.writeFileSync(path.join(ROOT, 'public/fabrics', outFile), Buffer.from(b64, 'base64'));
    console.log(`✔ Mapa textil extraído: ${outFile} (bumpScale=${j.bumpScale}, scaleStoff=${JSON.stringify(j.scaleStoff)})`);
  }
}
extractFabricBump(harV2, 'ts-tex.json', 'ts-tex.png');
extractFabricBump(harV1, 'k-tex2.json', 'k-tex2.png');
extractFabricBump(harV1, 'bandstoff_r-tex-3_48mm.json', 'bandstoff-rtex3.png');

// 4. Extraer paleta completa CM5 (152 colores) + FB Especiales/Flúor (15 colores) = 167 colores Pantone
const palEntry = harV2.log.entries.find((e) => e.request.url.includes('loadPalettenCluster.php') && e.response?.content?.text);
const palJson = JSON.parse(palEntry.response.content.text);
const cm5Main = palJson['CM5 Bedruckbar']?.['CM5 owayo Farbsystem'] || [];
const cm5Special = palJson['CM5 Bedruckbar']?.['CM5 owayo Farbsystem - FB'] || [];

const formatColorItem = (item, isSpecial = false) => {
  const hex = `#${String(item.RGBHex).padStart(6, '0').toLowerCase()}`;
  const code = item.NameImWeb;
  return {
    code,
    name: translateColorName(code),
    hex,
    pantone: findClosestPantone(hex, code),
    group: Number(item.farbGruppeUndPosition?.farbgruppe ?? item.vector2?.x ?? 0),
    shade: Number(item.farbGruppeUndPosition?.positionInGruppe ?? item.vector2?.y ?? 1),
    isSpecial,
  };
};

const fullPalette = [
  ...cm5Main.map((c) => formatColorItem(c, false)),
  ...cm5Special.map((c) => formatColorItem(c, true)),
];

const paletteModuleCode = `/**
 * AUTO-GENERATED BY tools/extract-rea-assets.mjs
 * Sistema Cromático Oficial de Sublimación Textil CM5 (152 colores en matriz de 5 tonos + 15 Flúor/Especiales)
 * emparejado con equivalencias Pantone® Solid Coated (PMS).
 */

export const PANTONE_CM5_PALETTE = ${JSON.stringify(fullPalette, null, 2)};

export const FOOTBALL_FISH_DESIGNS = ${JSON.stringify(footballDesigns, null, 2)};

export const BASKETBALL_FISH_DESIGNS = ${JSON.stringify(basketballDesigns, null, 2)};
`;

fs.writeFileSync(path.join(ROOT, 'src/engine/core/palette152.js'), paletteModuleCode, 'utf8');
console.log(`✔ Paleta generada en src/engine/core/palette152.js con ${fullPalette.length} colores Pantone/CM5, ${footballDesigns.length} diseños Fútbol y ${basketballDesigns.length} diseños Basket!`);
