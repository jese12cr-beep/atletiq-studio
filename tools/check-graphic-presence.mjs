import fs from 'fs';
import path from 'path';

const dir = 'public/assets/patterns/all_models_2d';
const files = fs.readdirSync(dir).filter(f => f.startsWith('mx_') && f.endsWith('.svg'));

console.log(`Checking Front Graphic presence in 36 Liga MX kits...\n`);

const emptyFrontGraphics = [];
const filledFrontGraphics = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  // Match inside PIECE_FRENTE between <!-- Patrón Gráfico Oficial --> and <!-- Logotipos y Escudos Proyectados -->
  const match = content.match(/<!-- Patrón Gráfico Oficial -->([\s\S]*?)<!-- Logotipos y Escudos Proyectados -->/);
  const graphicInner = match ? match[1].trim() : '';
  if (!graphicInner) {
    emptyFrontGraphics.push(file);
  } else {
    filledFrontGraphics.push({ file, len: graphicInner.length });
  }
}

console.log(`Filled Front Graphics: ${filledFrontGraphics.length} / ${files.length}`);
console.log(`Empty Front Graphics: ${emptyFrontGraphics.length} / ${files.length}`);
if (emptyFrontGraphics.length > 0) {
  console.log(`\nKits with empty front graphics:`);
  emptyFrontGraphics.forEach(f => console.log(' -', f));
}
