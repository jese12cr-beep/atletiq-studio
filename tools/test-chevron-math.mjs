import fs from 'fs';

function generateAmericaChevron(frenteCenterX) {
  const vApexX = frenteCenterX;
  const vApexY = 1820;
  const vLeftWingX = 180;
  const vLeftWingY = 1380;
  const vRightWingX = 1715;
  const vRightWingY = 1380;

  const navy = '#0B1B3D';
  const red = '#C8102E';
  const blue = '#003DA5';
  const yellow = '#FFF0B5';

  const yokePath = `M170,1010 L1725,1010 L${vRightWingX},${vRightWingY} L${vApexX},${vApexY} L${vLeftWingX},${vLeftWingY} Z`;

  // Number of triangle feathers along each wing
  const count = 9;
  let tRow1 = '';
  let tRow2 = '';

  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const t1 = (i + 1) / count;

    // Left wing points (sloping downwards to the apex)
    const lx0 = vLeftWingX + t0 * (vApexX - vLeftWingX);
    const ly0 = vLeftWingY + t0 * (vApexY - vLeftWingY);
    const lx1 = vLeftWingX + t1 * (vApexX - vLeftWingX);
    const ly1 = vLeftWingY + t1 * (vApexY - vLeftWingY);
    const lmidX = (lx0 + lx1) / 2;
    const lmidY = (ly0 + ly1) / 2;

    // Right wing points (sloping upwards from the apex)
    const rx0 = vApexX + t0 * (vRightWingX - vApexX);
    const ry0 = vApexY - t0 * (vApexY - vRightWingY);
    const rx1 = vApexX + t1 * (vRightWingX - vApexX);
    const ry1 = vApexY - t1 * (vApexY - vRightWingY);
    const rmidX = (rx0 + rx1) / 2;
    const rmidY = (ry0 + ry1) / 2;

    // Row 1: Red triangles pointing down (tip = mid + 75)
    tRow1 += `<polygon points="${lx0.toFixed(1)},${ly0.toFixed(1)} ${lx1.toFixed(1)},${ly1.toFixed(1)} ${lmidX.toFixed(1)},${(lmidY + 75).toFixed(1)}" fill="${red}" />`;
    tRow1 += `<polygon points="${rx0.toFixed(1)},${ry0.toFixed(1)} ${rx1.toFixed(1)},${ry1.toFixed(1)} ${rmidX.toFixed(1)},${(rmidY + 75).toFixed(1)}" fill="${red}" />`;

    // Row 2: Blue triangles pointing down (shifted down by 45, tip = mid + 120)
    tRow2 += `<polygon points="${lx0.toFixed(1)},${(ly0 + 45).toFixed(1)} ${lx1.toFixed(1)},${(ly1 + 45).toFixed(1)} ${lmidX.toFixed(1)},${(lmidY + 120).toFixed(1)}" fill="${blue}" />`;
    tRow2 += `<polygon points="${rx0.toFixed(1)},${(ry0 + 45).toFixed(1)} ${rx1.toFixed(1)},${(ry1 + 45).toFixed(1)} ${rmidX.toFixed(1)},${(rmidY + 120).toFixed(1)}" fill="${blue}" />`;
  }

  // Apex Diamond at the center tip
  const apexDiamond = `
    <polygon points="${vApexX},${vApexY + 45} ${vApexX + 55},${vApexY + 130} ${vApexX},${vApexY + 215} ${vApexX - 55},${vApexY + 130}" fill="${red}" />
    <polygon points="${vApexX},${vApexY + 65} ${vApexX + 38},${vApexY + 130} ${vApexX},${vApexY + 195} ${vApexX - 38},${vApexY + 130}" fill="${blue}" />
  `;

  return `
    <path d="${yokePath}" fill="${navy}" />
    ${tRow1}
    ${tRow2}
    ${apexDiamond}
  `;
}

console.log('America chevron generator ready');
