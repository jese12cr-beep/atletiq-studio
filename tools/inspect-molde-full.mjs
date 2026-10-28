import fs from 'fs';

const svg = fs.readFileSync('C:/Users/crja_/Downloads/MOLDE CAMISA.svg', 'utf8');

console.log('SVG length:', svg.length);
const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
console.log('viewBox:', viewBoxMatch ? viewBoxMatch[1] : 'none');

// Find all <g id="...">
const gMatches = [...svg.matchAll(/<g\s+([^>]*id="([^"]+)"[^>]*)>/g)].map(m => m[2]);
console.log('Group IDs:', gMatches);

// Find all paths
const paths = [...svg.matchAll(/<path\s+([^>]+)>/g)].map(m => m[1]);
console.log('Total paths:', paths.length);

// Analyze all path attributes
const pathDetails = paths.map((p, idx) => {
  const dMatch = p.match(/d="([^"]+)"/);
  const classMatch = p.match(/class="([^"]+)"/);
  const idMatch = p.match(/id="([^"]+)"/);
  const d = dMatch ? dMatch[1] : '';
  const dLen = d.length;
  // Extract coordinates to compute bounding box
  const coords = [...d.matchAll(/([0-9.]+),([0-9.]+)/g)].map(m => [parseFloat(m[1]), parseFloat(m[2])]);
  let minX = 99999, maxX = -99999, minY = 99999, maxY = -99999;
  coords.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  return {
    idx,
    id: idMatch ? idMatch[1] : null,
    className: classMatch ? classMatch[1] : null,
    dLen,
    bounds: {
      minX: Math.round(minX),
      maxX: Math.round(maxX),
      minY: Math.round(minY),
      maxY: Math.round(maxY),
      width: Math.round(maxX - minX),
      height: Math.round(maxY - minY),
    }
  };
});

// Group large paths (which are likely the garment patterns)
const largePaths = pathDetails.filter(p => p.bounds.width > 200 && p.bounds.height > 200);
console.log('Large paths (probable garment pieces):', JSON.stringify(largePaths, null, 2));

// Small paths / metadata
console.log('Total large paths (>200x200):', largePaths.length);
