import fs from 'fs';

const content = fs.readFileSync('src/engine/compositor/ligaMxKitsEngine.js', 'utf8');
const crestStart = content.indexOf('export function drawLigaMxCrestMm');
const lines = content.substring(crestStart).split('\n').slice(0, 200);
lines.forEach((l, i) => console.log(`${i+1}: ${l.substring(0, 100)}`));
