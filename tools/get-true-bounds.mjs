import fs from 'fs';

const svg = fs.readFileSync('C:/Users/crja_/Downloads/MOLDE CAMISA.svg', 'utf8');
const designGroupMatch = svg.match(/<g\s+id="DESIGN"[^>]*>([\s\S]*?)<\/g>\s*<\/svg>/);
const paths = [...designGroupMatch[1].matchAll(/<path\s+([^>]+)>/g)].map(m => m[1]);

function parseSvgPathCommands(d) {
  const commands = [];
  const cmdRegex = /([a-zA-Z])([^a-zA-Z]*)/g;
  let m;
  while ((m = cmdRegex.exec(d)) !== null) {
    const type = m[1];
    const args = m[2].trim().split(/[\s,]+|-/).filter(Boolean).map(Number);
    // Be careful with minus signs when splitting
    // Better parser:
  }
}

// Better parser using standard regex for numbers
function getPathPoints(d) {
  // tokenize
  const tokens = d.match(/([a-zA-Z]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?)/g);
  let curX = 0, curY = 0;
  const points = [];
  let i = 0;
  let curCmd = '';

  while (i < tokens.length) {
    const token = tokens[i];
    if (/^[a-zA-Z]$/.test(token)) {
      curCmd = token;
      i++;
    }

    if (curCmd === 'M') {
      curX = parseFloat(tokens[i++]);
      curY = parseFloat(tokens[i++]);
      points.push([curX, curY]);
      curCmd = 'L'; // subsequent coordinates are implicit LineTo
    } else if (curCmd === 'm') {
      curX += parseFloat(tokens[i++]);
      curY += parseFloat(tokens[i++]);
      points.push([curX, curY]);
      curCmd = 'l';
    } else if (curCmd === 'L') {
      curX = parseFloat(tokens[i++]);
      curY = parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'l') {
      curX += parseFloat(tokens[i++]);
      curY += parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'H') {
      curX = parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'h') {
      curX += parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'V') {
      curY = parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'v') {
      curY += parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'C') {
      const x1 = parseFloat(tokens[i++]), y1 = parseFloat(tokens[i++]);
      const x2 = parseFloat(tokens[i++]), y2 = parseFloat(tokens[i++]);
      curX = parseFloat(tokens[i++]); curY = parseFloat(tokens[i++]);
      points.push([x1, y1], [x2, y2], [curX, curY]);
    } else if (curCmd === 'c') {
      const dx1 = parseFloat(tokens[i++]), dy1 = parseFloat(tokens[i++]);
      const dx2 = parseFloat(tokens[i++]), dy2 = parseFloat(tokens[i++]);
      const dx = parseFloat(tokens[i++]), dy = parseFloat(tokens[i++]);
      points.push([curX + dx1, curY + dy1], [curX + dx2, curY + dy2], [curX + dx, curY + dy]);
      curX += dx;
      curY += dy;
    } else if (curCmd === 'S' || curCmd === 's') {
      const x2 = parseFloat(tokens[i++]), y2 = parseFloat(tokens[i++]);
      const x = parseFloat(tokens[i++]), y = parseFloat(tokens[i++]);
      curX = curCmd === 'S' ? x : curX + x;
      curY = curCmd === 'S' ? y : curY + y;
      points.push([curX, curY]);
    } else if (curCmd === 'Z' || curCmd === 'z') {
      // close path
    } else {
      i++;
    }
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  points.forEach(([x, y]) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

paths.forEach((p, idx) => {
  const d = p.match(/d="([^"]+)"/)[1];
  const b = getPathPoints(d);
  console.log(`True piece ${idx}: bounds: x=[${b.minX.toFixed(1)}, ${b.maxX.toFixed(1)}] (w=${b.width.toFixed(1)} pt, ${(b.width / 2.83465).toFixed(1)} mm), y=[${b.minY.toFixed(1)}, ${b.maxY.toFixed(1)}] (h=${b.height.toFixed(1)} pt, ${(b.height / 2.83465).toFixed(1)} mm)`);
});
