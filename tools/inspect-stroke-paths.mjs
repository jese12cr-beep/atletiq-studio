import fs from 'fs';

const svg = fs.readFileSync('C:/Users/crja_/Downloads/MOLDE CAMISA.svg', 'utf8');

// Print every path with its class, id, and first 100 chars of d
const pathMatches = [...svg.matchAll(/<path\s+([^>]+)>/g)].map(m => m[1]);
console.log('Total paths:', pathMatches.length);

pathMatches.forEach((p, idx) => {
  const classMatch = p.match(/class="([^"]+)"/);
  const idMatch = p.match(/id="([^"]+)"/);
  const dMatch = p.match(/d="([^"]+)"/);
  const d = dMatch ? dMatch[1] : '';
  const cls = classMatch ? classMatch[1] : '';
  const id = idMatch ? idMatch[1] : '';
  if (cls === 'st1' || cls === 'st3' || cls === 'st2') {
    console.log(`Path ${idx}: cls=${cls}, id=${id}, dLength=${d.length}, dStart=${d.slice(0, 70)}, dEnd=${d.slice(-40)}`);
  }
});
