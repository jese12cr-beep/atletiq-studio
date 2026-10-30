import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/mexicoKitsData.js');
let content = fs.readFileSync(filePath, 'utf-8');

// List of clubs that have continuous patterns on the back
const CONTINUOUS_PATTERN_CLUBS = {
  mx_chivas_home: { graphicId: 'mx_chivas_stripes', label: 'Rayas Rojiblancas Espalda', flipX: false },
  mx_rayados_home: { graphicId: 'mx_rayados_stripes', label: 'Franjas Azul Marino Espalda', flipX: false },
  mx_santos_home: { graphicId: 'mx_santos_hoops', label: 'Franjas Horizontales Espalda', flipX: false },
  mx_pachuca_home: { graphicId: 'mx_pachuca_stripes', label: 'Franjas Tuzos Espalda', flipX: false },
  mx_necaxa_home: { graphicId: 'mx_necaxa_stripes', label: 'Franjas Rayos Espalda', flipX: false },
  mx_queretaro_home: { graphicId: 'mx_queretaro_stripes', label: 'Franjas Gallos Espalda', flipX: false },
  mx_san_luis_home: { graphicId: 'mx_san_luis_stripes', label: 'Franjas Rojiblancas Espalda', flipX: false },
  mx_atlas_home: { graphicId: 'mx_atlas_half_split', label: 'División Rojinegra Espalda', flipX: true },
  mx_puebla_home: { graphicId: 'mx_puebla_franja_sash', label: 'La Franja Diagonal Espalda', flipX: true },
  mx_puebla_away: { graphicId: 'mx_puebla_franja_sash', label: 'La Franja Diagonal Visita Espalda', flipX: true },
  mx_america_home: { graphicId: 'mx_america_aztec_chevron', label: 'Chevron Azteca Espalda', flipX: false, sizeMm: '{ width: 519.25, height: 320 }', centerMm: '{ x: 259.6, y: 220 }' },
  mx_america_away: { graphicId: 'mx_america_aztec_chevron', label: 'Chevron Azteca Visita Espalda', flipX: false, sizeMm: '{ width: 519.25, height: 320 }', centerMm: '{ x: 259.6, y: 220 }' },
};

console.log('Updating mexicoKitsData.js...');

// First ensure pinned: true and locked: true on all existing decals
// Replace 'zIndex: 5,' with 'zIndex: 5,\n        pinned: true,\n        locked: true,'
// Replace 'zIndex: 15,' with 'zIndex: 15,\n        pinned: true,\n        locked: true,'
content = content.replace(/(zIndex:\s*\d+,)(?![\s\S]*?pinned:)/g, '$1\n        pinned: true,\n        locked: true,');

// Clean up any double definitions
content = content.replace(/pinned:\s*true,\s*pinned:\s*true,/g, 'pinned: true,');
content = content.replace(/locked:\s*true,\s*locked:\s*true,/g, 'locked: true,');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Decals pinned/locked updated successfully.');
