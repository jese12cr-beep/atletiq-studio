import fs from 'fs';
import { MEXICO_PRO_KITS } from '../src/data/mexicoKitsData.js';

console.log('Total Liga MX kits:', MEXICO_PRO_KITS.length);
MEXICO_PRO_KITS.forEach((k, i) => {
  console.log(`${i + 1}. [${k.id}] ${k.name} (${k.clubAlias}) - Edition: ${k.edition}`);
});
