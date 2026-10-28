import fs from 'fs';

const content = fs.readFileSync('src/engine/compositor/ligaMxKitsEngine.js', 'utf8');
const crestStart = content.indexOf('export function drawLigaMxCrestMm');
const lines = content.substring(crestStart).split('\n').slice(200, 450);
lines.forEach((l, i) => console.log(`${i+201}: ${l.substring(0, 100)}`));
