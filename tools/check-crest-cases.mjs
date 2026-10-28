import fs from 'fs';

const content = fs.readFileSync('src/engine/compositor/ligaMxKitsEngine.js', 'utf8');
const crestStart = content.indexOf('export function drawLigaMxCrestMm');
console.log('drawLigaMxCrestMm found at:', crestStart);
if (crestStart !== -1) {
  const crestSnippet = content.substring(crestStart, crestStart + 4000);
  const cases = [...crestSnippet.matchAll(/case\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
  console.log('Crest cases in drawLigaMxCrestMm:', cases);
}
