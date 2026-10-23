#!/usr/bin/env node
/**
 * ATLETIQ Engine Blueprint — REA / HAR Network & Schema Analyzer
 *
 * Escanea archivos .har o .json depositados en ./rea-captures/<plataforma>/,
 * elimina cabeceras sensibles (Cookies, Authorization) por higiene de datos,
 * y extrae automáticamente:
 *   1. Endpoints de guardado de diseño, subida de arte y carrito (/cart/add.js).
 *   2. Estructura inferida (árbol de claves y tipos) de los payloads JSON.
 *   3. Inventario de assets gráficos 3D/2D (.glb, .gltf, .svg, .webp, .png) y su peso en KB.
 *
 * Uso:
 *   node tools/rea-har-analyzer.mjs [ruta-carpeta-o-archivo.har]
 */

import fs from 'node:fs';
import path from 'node:path';

const targetArg = process.argv[2] || path.resolve('rea-captures');

function inferJsonShape(value, depth = 0) {
  if (depth > 4) return '...';
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'Array<empty>';
    return [`Array(${value.length})`, inferJsonShape(value[0], depth + 1)];
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value).slice(0, 25)) {
      out[k] = inferJsonShape(v, depth + 1);
    }
    return out;
  }
  return typeof value;
}

function analyzeHarFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const har = JSON.parse(raw);
  const entries = har?.log?.entries || [];

  const apiCalls = [];
  const graphicAssets = [];

  for (const entry of entries) {
    const url = entry?.request?.url || '';
    const method = entry?.request?.method || 'GET';
    const status = entry?.response?.status || 0;
    const mime = (entry?.response?.content?.mimeType || '').toLowerCase();
    const sizeBytes = entry?.response?.content?.size || entry?.response?.bodySize || 0;

    // Clasificar assets gráficos (3D meshes, SVG patterns, WebP/PNG textures)
    if (
      /\.(glb|gltf|obj|svg|webp|avif|png|ktx2)(\?|$)/i.test(url) ||
      mime.includes('svg') ||
      mime.includes('webp') ||
      mime.includes('gltf')
    ) {
      graphicAssets.push({
        url: url.split('?')[0],
        mime,
        sizeKB: +(sizeBytes / 1024).toFixed(1),
      });
    }

    // Clasificar llamadas JSON clave (diseños, roster, bounding boxes, /cart/add.js)
    const isInterestingMethod = ['POST', 'PUT', 'PATCH'].includes(method);
    const isJson = mime.includes('json') || url.includes('/cart/add');

    if (isInterestingMethod || (isJson && /design|config|roster|artwork|upload|cart|print/i.test(url))) {
      let reqShape = null;
      let resShape = null;

      if (entry?.request?.postData?.text) {
        try {
          reqShape = inferJsonShape(JSON.parse(entry.request.postData.text));
        } catch {
          reqShape = 'Non-JSON / FormData payload';
        }
      }

      if (entry?.response?.content?.text) {
        try {
          resShape = inferJsonShape(JSON.parse(entry.response.content.text));
        } catch {
          resShape = null;
        }
      }

      apiCalls.push({
        method,
        status,
        endpoint: url.split('?')[0],
        requestSchema: reqShape,
        responseSchema: resShape,
      });
    }
  }

  return {
    file: path.basename(filePath),
    totalEntries: entries.length,
    graphicAssetsSummary: {
      count: graphicAssets.length,
      totalWeightKB: +graphicAssets.reduce((a, b) => a + b.sizeKB, 0).toFixed(1),
      sampleAssets: graphicAssets.slice(0, 20),
    },
    extractedApiContracts: apiCalls,
  };
}

function walkHarFiles(dirOrFile) {
  if (!fs.existsSync(dirOrFile)) return [];
  const stat = fs.statSync(dirOrFile);
  if (stat.isFile()) return dirOrFile.endsWith('.har') ? [dirOrFile] : [];

  const found = [];
  for (const item of fs.readdirSync(dirOrFile)) {
    const full = path.join(dirOrFile, item);
    if (fs.statSync(full).isDirectory()) {
      found.push(...walkHarFiles(full));
    } else if (item.endsWith('.har')) {
      found.push(full);
    }
  }
  return found;
}

const harFiles = walkHarFiles(targetArg);

if (harFiles.length === 0) {
  console.log('ℹ️  No se encontraron archivos .har todavía en:', targetArg);
  console.log('👉 Deposita tus capturas de REA en ./rea-captures/<plataforma>/ y vuelve a ejecutar este comando.');
  process.exit(0);
}

for (const file of harFiles) {
  console.log(`\n=== Analizando: ${file} ===`);
  const report = analyzeHarFile(file);
  const outPath = file.replace(/\.har$/i, '.report.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`✅ Reporte limpio generado en: ${outPath}`);
  console.log(`   • Peticiones totales: ${report.totalEntries}`);
  console.log(`   • Contratos API extraídos: ${report.extractedApiContracts.length}`);
  console.log(`   • Assets gráficos 3D/2D detectados: ${report.graphicAssetsSummary.count} (${report.graphicAssetsSummary.totalWeightKB} KB)`);
}
