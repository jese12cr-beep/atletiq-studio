import { MEXICO_PRO_KITS } from '../src/data/mexicoKitsData.js';

MEXICO_PRO_KITS.forEach(k => {
  const gDecal = (k.decals || []).find(d => d.type === 'LIGAMX_GRAPHIC');
  console.log(`${k.id} (${k.clubAlias}): graphicId=${gDecal ? gDecal.graphicId : 'NONE'}`);
});
