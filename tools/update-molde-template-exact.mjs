import fs from 'fs';

const rawSvg = fs.readFileSync('C:/Users/crja_/Downloads/MOLDE CAMISA.svg', 'utf8');

// Extract style
const styleMatch = rawSvg.match(/<style>([\s\S]*?)<\/style>/);
const originalStyle = styleMatch ? styleMatch[1] : '';

// Extract BACKGROUND inner
const bgMatch = rawSvg.match(/<g\s+id="BACKGROUND"[^>]*>([\s\S]*?)<\/g>\s*<g\s+id="DESIGN"/);
const bgContent = bgMatch ? bgMatch[1] : '';

// Extract exact paths from DESIGN group
const designGroupMatch = rawSvg.match(/<g\s+id="DESIGN"[^>]*>([\s\S]*?)<\/g>\s*<\/svg>/);
const paths = [...designGroupMatch[1].matchAll(/<path\s+([^>]+)>/g)].map(m => m[1]);

const pathDs = paths.map(p => {
  const m = p.match(/d="([^"]+)"/);
  return m ? m[1] : '';
});

// Paths in order: 0: Frente, 1: Trasero, 2: Manga Derecha, 3: Manga Izquierda
console.log('Path 0 (Frente):', pathDs[0].slice(0, 50));
console.log('Path 1 (Trasero):', pathDs[1].slice(0, 50));
console.log('Path 2 (Manga Der):', pathDs[2].slice(0, 50));
console.log('Path 3 (Manga Izq):', pathDs[3].slice(0, 50));

const fileContent = `// Plantilla extraída directamente de C:\\Users\\crja_\\Downloads\\MOLDE CAMISA.svg (Talla M 1:1)
export const MOLDE_CAMISA_STYLE = ${JSON.stringify(originalStyle)};

export const MOLDE_CAMISA_BACKGROUND_INNER = ${JSON.stringify(bgContent)};

export const MOLDE_PATHS = {
  FRENTE: ${JSON.stringify(pathDs[0])},
  TRASERO: ${JSON.stringify(pathDs[1])},
  MANGA_DERECHA: ${JSON.stringify(pathDs[2])},
  MANGA_IZQUIERDA: ${JSON.stringify(pathDs[3])},
};
`;

fs.writeFileSync('C:/Users/crja_/.gemini/antigravity/scratch/sport-custom-studio/src/engine/compositor/moldeCamisaTemplate.js', fileContent);
console.log('Updated moldeCamisaTemplate.js with 100% genuine paths from Downloads/MOLDE CAMISA.svg');
