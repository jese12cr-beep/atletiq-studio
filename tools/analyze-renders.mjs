import fs from 'fs';
import path from 'path';

const dir = 'public/assets/patterns/all_models_2d';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

console.log(`Analyzing ${files.length} rendered SVG files in ${dir}...\n`);

let missingGraphics = [];
let missingCrests = [];
let validCount = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const hasFront = content.includes('id="PIECE_FRENTE"');
  const hasBack = content.includes('id="PIECE_TRASERO"');
  const hasLeftSleeve = content.includes('id="PIECE_MANGA_IZQUIERDA"');
  const hasRightSleeve = content.includes('id="PIECE_MANGA_DERECHA"');
  const hasBackground = content.includes('id="BACKGROUND"');
  const hasCrest = content.includes('id="crest_');
  const isComplete = hasFront && hasBack && hasLeftSleeve && hasRightSleeve && hasBackground && content.endsWith('</svg>');

  if (!isComplete) {
    console.error(`ERROR: ${file} is incomplete!`);
  } else {
    validCount++;
  }

  // Check if Liga MX kits have authentic crest
  if (file.startsWith('mx_') && !hasCrest) {
    missingCrests.push(file);
  }
}

console.log(`Results:`);
console.log(`- 100% Valid Complete Mold Files: ${validCount} / ${files.length}`);
console.log(`- Missing Crests in Liga MX: ${missingCrests.length}`);
if (missingCrests.length > 0) {
  console.log(`  List:`, missingCrests);
}
