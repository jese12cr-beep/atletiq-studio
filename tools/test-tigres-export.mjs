import fs from 'fs';
import { generateProductionMoldSvgString } from '../src/engine/compositor/moldFlatteningEngine.js';
import { MEXICO_PRO_KITS } from '../src/data/mexicoKitsData.js';

// 1. Get Tigres Home kit
const tigresKit = MEXICO_PRO_KITS.find(k => k.id === 'mx_tigres_home');

// 2. Create sample mock uploaded PNG logo (1x1 transparent/colored png in base64)
const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const mockArtworkId = 'art_tigres_shield_png';
const mockArtworkRegistry = {
  [mockArtworkId]: {
    artworkId: mockArtworkId,
    fileName: 'tigres_shield.png',
    dataUrl: samplePngBase64,
    previewUrl: samplePngBase64,
  }
};

// 3. User design with uploaded logo on the chest
const testDesign = {
  mexicoKitId: tigresKit.id,
  mexicoBaseClubId: tigresKit.baseClubId,
  clubAlias: tigresKit.clubAlias,
  colorZones: tigresKit.colorZones,
  decals: [
    ...tigresKit.decals,
    {
      id: 'decal_user_uploaded_tigres_logo',
      type: 'UPLOADED_RASTER',
      artworkId: mockArtworkId,
      label: 'Escudo Tigres PNG Subido',
      panel: 'front',
      centerMm: { x: 334, y: 185 }, // Wearer left chest
      sizeMm: { width: 65, height: 75 },
      scale: 1,
      rotationDeg: 0,
      opacity: 1,
    }
  ],
  variableSlots: {
    playerNameBack: { enabled: true },
    playerNumberBack: { enabled: true },
    playerNumberFront: { enabled: false }, // soccer kits: false
  }
};

const activePlayer = {
  name: 'JORDAN',
  number: '23',
  size: 'L'
};

const svg = generateProductionMoldSvgString(testDesign, activePlayer, {
  showCutLines: true,
  showLabels: true,
  artworkRegistry: mockArtworkRegistry,
});

console.log('SVG total length:', svg.length);
console.log('Has PIECE_FRENTE:', svg.includes('id="PIECE_FRENTE"'));
console.log('Has PIECE_TRASERO:', svg.includes('id="PIECE_TRASERO"'));
console.log('Has PIECE_CUELLO:', svg.includes('id="PIECE_CUELLO"'));
console.log('Has PIECE_MANGA_IZQUIERDA:', svg.includes('id="PIECE_MANGA_IZQUIERDA"'));
console.log('Has PIECE_MANGA_DERECHA:', svg.includes('id="PIECE_MANGA_DERECHA"'));
console.log('Has uploaded image tag (xlink + href):', svg.includes('<image xlink:href=') && svg.includes('href='));
console.log('Has player JORDAN:', svg.includes('JORDAN'));
console.log('Has number 23:', svg.includes('23'));
console.log('Has responsive 100% width:', svg.includes('width="100%" height="100%"'));

// Write to artifact directory and public for visual verification
fs.writeFileSync('C:\\Users\\crja_\\.gemini\\antigravity\\brain\\cf8e5362-56e5-4493-872a-e49bda63f632\\plantilla_produccion_tigres_perfect.svg', svg);
fs.writeFileSync('public\\assets\\patterns\\plantilla_produccion_tigres_perfect.svg', svg);
console.log('Written to plantilla_produccion_tigres_perfect.svg successfully!');
