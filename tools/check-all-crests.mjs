import fs from 'fs';

const content = fs.readFileSync('src/engine/compositor/ligaMxKitsEngine.js', 'utf8');
const crestStart = content.indexOf('export function drawLigaMxCrestMm');
const crestEnd = content.indexOf('export function', crestStart + 100);
const crestSection = content.substring(crestStart, crestEnd !== -1 ? crestEnd : content.length);
const cases = [...crestSection.matchAll(/case\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
console.log('Total crest cases in drawLigaMxCrestMm:', cases.length);
cases.forEach(c => console.log(' -', c));
