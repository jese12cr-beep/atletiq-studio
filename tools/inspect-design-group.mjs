import fs from 'fs';

const svg = fs.readFileSync('C:/Users/crja_/Downloads/MOLDE CAMISA.svg', 'utf8');

// Find all elements inside <g id="DESIGN">
const designGroupMatch = svg.match(/<g\s+id="DESIGN"[^>]*>([\s\S]*?)<\/g>\s*<\/svg>/);
if (designGroupMatch) {
  console.log('Found DESIGN group! Content length:', designGroupMatch[1].length);
  // Match all top-level children or paths in DESIGN group
  const paths = [...designGroupMatch[1].matchAll(/<path\s+([^>]+)>/g)].map(m => m[1]);
  console.log('Paths in DESIGN group:', paths.length);
  paths.forEach((p, idx) => {
    const classMatch = p.match(/class="([^"]+)"/);
    const dMatch = p.match(/d="([^"]+)"/);
    console.log(`Path ${idx}: class=${classMatch ? classMatch[1] : ''}, dStart=${dMatch ? dMatch[1].slice(0, 80) : ''}`);
    // Compute exact bounding box of absolute Move/Line commands in this d
    const d = dMatch[1];
    // Simple coordinate extractor
    const coords = [];
    const re = /([0-9.]+),([0-9.]+)/g;
    let match;
    while ((match = re.exec(d)) !== null) {
      coords.push([parseFloat(match[1]), parseFloat(match[2])]);
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    coords.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
    console.log(`  bounds: x=[${minX.toFixed(1)}, ${maxX.toFixed(1)}] (w=${(maxX-minX).toFixed(1)}), y=[${minY.toFixed(1)}, ${maxY.toFixed(1)}] (h=${(maxY-minY).toFixed(1)})`);
  });
} else {
  console.log('DESIGN group not found');
}
