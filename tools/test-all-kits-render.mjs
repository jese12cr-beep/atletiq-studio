import { generateProductionMoldSvgString } from '../src/engine/compositor/moldFlatteningEngine.js';
import { MEXICO_PRO_KITS } from '../src/data/mexicoKitsData.js';

console.log('Testing 2D rendering for all 36 Liga MX kits...');

let passed = 0;
let issues = [];

for (const kit of MEXICO_PRO_KITS) {
  try {
    const activePlayer = {
      name: kit.sampleName || 'JUGADOR',
      number: kit.sampleNumber || '10',
      size: 'M'
    };
    const testDesign = {
      mexicoKitId: kit.id,
      mexicoBaseClubId: kit.baseClubId,
      clubAlias: kit.clubAlias,
      colorZones: kit.colorZones,
      patternId: kit.patternId,
      decals: kit.decals || [],
      variableSlots: {
        playerNameBack: { enabled: true },
        playerNumberBack: { enabled: true },
        playerNumberFront: { enabled: false },
      }
    };
    const svg = generateProductionMoldSvgString(testDesign, activePlayer, {
      showCutLines: true,
      showLabels: true,
    });

    const hasFront = svg.includes('id="PIECE_FRENTE"');
    const hasBack = svg.includes('id="PIECE_TRASERO"');
    const hasNeck = svg.includes('id="PIECE_CUELLO"');
    const hasLeftSleeve = svg.includes('id="PIECE_MANGA_IZQUIERDA"');
    const hasRightSleeve = svg.includes('id="PIECE_MANGA_DERECHA"');
    const hasPlayerName = svg.includes(activePlayer.name);
    const hasNumber = svg.includes(activePlayer.number);

    if (hasFront && hasBack && hasNeck && hasLeftSleeve && hasRightSleeve && hasPlayerName && hasNumber) {
      passed++;
    } else {
      issues.push({ id: kit.id, name: kit.name, hasFront, hasBack, hasPlayerName, hasNumber });
    }
  } catch (err) {
    issues.push({ id: kit.id, error: err.message });
  }
}

console.log(`Passed: ${passed} / ${MEXICO_PRO_KITS.length}`);
if (issues.length > 0) {
  console.log('Issues found:', issues);
}
