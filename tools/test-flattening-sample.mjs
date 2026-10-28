import fs from 'fs';
import { generateProductionMoldSvgString } from '../src/engine/compositor/moldFlatteningEngine.js';
import { MEXICO_PRO_KITS } from '../src/data/mexicoKitsData.js';

const americaKit = MEXICO_PRO_KITS.find(k => k.id === 'mx_america_home') || MEXICO_PRO_KITS[0];
console.log('Testing with kit:', americaKit.name);

const svgOutput = generateProductionMoldSvgString(americaKit, { name: 'VALVERDE', number: 10 });
console.log('Generated SVG length:', svgOutput.length);

const outPath = 'C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\molde_aplanado_america_sample.svg';
fs.writeFileSync(outPath, svgOutput);
console.log('Saved sample flattened mold to:', outPath);
