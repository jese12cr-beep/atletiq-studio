import fs from 'fs';
import path from 'path';
import { generateProductionMoldSvgString } from '../src/engine/compositor/moldFlatteningEngine.js';
import { MEXICO_PRO_KITS } from '../src/data/mexicoKitsData.js';
import { ENGINE_PRODUCTS, createDefaultDesignForProduct } from '../src/engine/core/designStore.js';

const outDir = 'public/assets/patterns/all_models_2d';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('--- 1. RENDERING 36 LIGA MX KITS ---');
const kitResults = [];
for (const kit of MEXICO_PRO_KITS) {
  const activePlayer = {
    name: kit.sampleName || 'JUGADOR',
    number: kit.sampleNumber || '10',
    size: 'M'
  };
  const design = {
    mexicoKitId: kit.id,
    mexicoBaseClubId: kit.baseClubId,
    clubAlias: kit.clubAlias,
    colorZones: kit.colorZones,
    patternId: kit.patternId,
    decals: kit.decals || [],
    variableSlots: {
      playerNameBack: { enabled: true },
      playerNumberBack: { enabled: true },
      playerNumberFront: { enabled: false },
    }
  };

  const svg = generateProductionMoldSvgString(design, activePlayer, {
    showCutLines: true,
    showLabels: true,
  });

  const filename = `${kit.id}_2d_pliego.svg`;
  fs.writeFileSync(path.join(outDir, filename), svg);
  kitResults.push({ id: kit.id, name: kit.name, file: filename, bytes: svg.length });
}
console.log(`Rendered ${kitResults.length} Liga MX kits.`);

console.log('--- 2. RENDERING 8 STANDARD PATTERNS ---');
const standardPatterns = [
  'classic_stripes',
  'chest_band',
  'diagonal_sash',
  'cyber_gradient',
  'chevron_v',
  'half_split',
  'hex_matrix',
  'solid'
];
const patResults = [];
for (const pat of standardPatterns) {
  const design = {
    productModelId: 'futbol_jersey_pro_vneck',
    patternId: pat,
    clubAlias: `Patrón ${pat}`,
    colorZones: {
      primary: { hex: '#1D4ED8' },
      secondary: { hex: '#0F172A' },
      accents: { hex: '#FACC15' },
      collar: { hex: '#0F172A' },
      sleeves: { hex: '#1D4ED8' },
    },
    decals: [],
    variableSlots: {
      playerNameBack: { enabled: true },
      playerNumberBack: { enabled: true },
      playerNumberFront: { enabled: false },
    }
  };
  const svg = generateProductionMoldSvgString(design, { name: 'MODELO', number: '7', size: 'M' }, {
    showCutLines: true,
    showLabels: true,
  });
  const filename = `standard_${pat}_2d_pliego.svg`;
  fs.writeFileSync(path.join(outDir, filename), svg);
  patResults.push({ id: `standard_${pat}`, name: pat, file: filename, bytes: svg.length });
}
console.log(`Rendered ${patResults.length} standard patterns.`);

console.log('--- 3. RENDERING ALL BASE PRODUCTS FROM DESIGNSTORE ---');
const prodResults = [];
for (const prod of ENGINE_PRODUCTS) {
  const defaultDesign = createDefaultDesignForProduct(prod.id);
  const activePlayer = { name: 'ATLETIQ', number: '26', size: 'M' };
  const svg = generateProductionMoldSvgString(defaultDesign, activePlayer, {
    showCutLines: true,
    showLabels: true,
  });
  const filename = `product_${prod.id}_2d_pliego.svg`;
  fs.writeFileSync(path.join(outDir, filename), svg);
  prodResults.push({ id: prod.id, name: prod.name, file: filename, bytes: svg.length });
}
console.log(`Rendered ${prodResults.length} base product models.`);

console.log(`\n========================================================`);
console.log(`TOTAL RENDERED MODELS: ${kitResults.length + patResults.length + prodResults.length}`);
console.log(`========================================================`);
