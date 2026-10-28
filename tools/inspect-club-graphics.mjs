import { generateProductionMoldSvgString } from '../src/engine/compositor/moldFlatteningEngine.js';
import { MEXICO_PRO_KITS } from '../src/data/mexicoKitsData.js';

console.log('Inspecting front graphic for each club...');

const clubsInspected = new Set();
for (const kit of MEXICO_PRO_KITS) {
  if (clubsInspected.has(kit.baseClubId)) continue;
  clubsInspected.add(kit.baseClubId);

  const testDesign = {
    mexicoKitId: kit.id,
    mexicoBaseClubId: kit.baseClubId,
    clubAlias: kit.clubAlias,
    colorZones: kit.colorZones,
    patternId: kit.patternId,
    decals: kit.decals || [],
  };
  const svg = generateProductionMoldSvgString(testDesign, { name: kit.sampleName, number: kit.sampleNumber });
  
  // Extract content of clip-frente
  const frontMatch = svg.match(/<g id="PIECE_FRENTE">[\s\S]*?<g clip-path="url\(#clip-frente\)">([\s\S]*?)<\/g>/);
  const frontContent = frontMatch ? frontMatch[1].trim() : 'NOT FOUND';
  
  // Count elements
  const rects = (frontContent.match(/<rect/g) || []).length;
  const paths = (frontContent.match(/<path/g) || []).length;
  const polygons = (frontContent.match(/<polygon/g) || []).length;
  const texts = (frontContent.match(/<text/g) || []).length;
  const lines = (frontContent.match(/<line/g) || []).length;
  const images = (frontContent.match(/<image/g) || []).length;

  console.log(`Club [${kit.baseClubId}] (${kit.clubAlias}): rects=${rects}, paths=${paths}, polygons=${polygons}, texts=${texts}, lines=${lines}, images=${images}`);
}
