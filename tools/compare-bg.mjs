import fs from 'fs';
import { MOLDE_CAMISA_BACKGROUND_INNER, MOLDE_PATHS } from '../src/engine/compositor/moldeCamisaTemplate.js';

const rawSvg = fs.readFileSync('C:/Users/crja_/Downloads/MOLDE CAMISA.svg', 'utf8');
const designMatch = rawSvg.match(/<g\s+id="DESIGN">([\s\S]*?)<\/g>\s*<\/svg>/);
const designContent = designMatch[1];

// Extract all tags in DESIGN
const paths = [...designContent.matchAll(/<path[^>]+d="([^"]+)"/g)].map(m => m[1]);
const rects = [...designContent.matchAll(/<rect[^>]+>/g)].map(m => m[0]);

console.log('Paths count:', paths.length);
console.log('Rects count:', rects.length);

console.log('Path 0 (Frente) matches?', paths[0] === MOLDE_PATHS.FRENTE);
console.log('Path 1 (Trasero) matches?', paths[1] === MOLDE_PATHS.TRASERO);
console.log('Path 2 (Manga Der) matches?', paths[2] === MOLDE_PATHS.MANGA_DERECHA);
console.log('Path 3 (Manga Izq) matches?', paths[3] === MOLDE_PATHS.MANGA_IZQUIERDA);
console.log('Rect 0 in raw:', rects[0]);
