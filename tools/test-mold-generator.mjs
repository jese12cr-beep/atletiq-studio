import fs from 'fs';

// Lee el molde base
const baseSvg = fs.readFileSync('C:\\Users\\crja_\\Downloads\\MOLDE CAMISA.svg', 'utf8');

// Extraer el grupo BACKGROUND (reglas, calibración, escalas) y el grupo DESIGN
const vbMatch = baseSvg.match(/viewBox="([^"]+)"/);
const viewBox = vbMatch ? vbMatch[1] : '0 0 3543.31 3401.57';

console.log('Base SVG loaded successfully. ViewBox:', viewBox);
