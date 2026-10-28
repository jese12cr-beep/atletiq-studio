import fs from 'fs';

// Let's inspect generateFrontAndBackGraphics in moldFlatteningEngine.js
const content = fs.readFileSync('src/engine/compositor/moldFlatteningEngine.js', 'utf8');
const start = content.indexOf('function generateFrontAndBackGraphics');
const end = content.indexOf('export function generateProductionMoldSvgString', start);
console.log('generateFrontAndBackGraphics lines:', content.substring(start, end).split('\n').length);
