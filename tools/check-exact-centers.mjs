import fs from 'fs';
import { MOLDE_PATHS } from '../src/engine/compositor/moldeCamisaTemplate.js';

// Let's test sampling points on MOLDE_PATHS.TRASERO and MOLDE_PATHS.FRENTE
function getBoundsAndCenter(d) {
  const tokens = d.match(/([a-zA-Z]|[-+]?[0-9]*\.?[0-9]+)/g);
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

    if (curCmd === 'M' || curCmd === 'L') {
      curX = parseFloat(tokens[i++]);
      curY = parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'm' || curCmd === 'l') {
      curX += parseFloat(tokens[i++]);
      curY += parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'C') {
      const x1 = parseFloat(tokens[i++]), y1 = parseFloat(tokens[i++]);
      const x2 = parseFloat(tokens[i++]), y2 = parseFloat(tokens[i++]);
      curX = parseFloat(tokens[i++]); curY = parseFloat(tokens[i++]);
      points.push([curX, curY]);
    } else if (curCmd === 'c') {
      const dx1 = parseFloat(tokens[i++]), dy1 = parseFloat(tokens[i++]);
      const dx2 = parseFloat(tokens[i++]), dy2 = parseFloat(tokens[i++]);
      const dx = parseFloat(tokens[i++]), dy = parseFloat(tokens[i++]);
      curX += dx; curY += dy;
      points.push([curX, curY]);
    } else if (curCmd === 'Z' || curCmd === 'z') {
      //
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

  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX)/2, centerY: (minY + maxY)/2 };
}

console.log('FRENTE bounds:', getBoundsAndCenter(MOLDE_PATHS.FRENTE));
console.log('TRASERO bounds:', getBoundsAndCenter(MOLDE_PATHS.TRASERO));
console.log('MANGA IZQ bounds:', getBoundsAndCenter(MOLDE_PATHS.MANGA_IZQUIERDA));
console.log('MANGA DER bounds:', getBoundsAndCenter(MOLDE_PATHS.MANGA_DERECHA));
