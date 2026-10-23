/**
 * ATLETIQ Engine v5.0 — Exportador Print-Ready de Moldes Anatómicos de Sublimación + Roster Relacional Owayo (`einzelexemplare`) + Puente Shopify
 *
 * 1. Genera un molde vectorial SVG real de corte y confección (880 × 620 mm) adaptado al patronaje `.mirl`/`.fish` activo:
 *    - Camiseta de Fútbol (`204m_Basic_KA`), Short de Fútbol (`303m_Basic`),
 *    - Camiseta de Baloncesto (`222m-Hero`) y Short de Baloncesto (`313m-ENB`).
 * 2. Construye el payload relacional exacto `einzelexemplare` decodificado de Owayo v6 (`textObjectUUID` + `masterID`).
 * 3. Construye el payload `POST /cart/add.js` de Shopify agrupando tallas sin Base64.
 */

import { VOLUME_TIERS } from '../core/designStore';

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateSublimationCutSheetSVG(design, product, roster = []) {
  const cPrimary = design.colorZones.primary?.hex || '#1d4ed8';
  const cSecondary = design.colorZones.secondary?.hex || '#0f172a';
  const cAccents = design.colorZones.accents?.hex || '#facc15';
  const cQuaternary = design.colorZones.quaternary?.hex || '#ffffff';
  const cSleeves = design.colorZones.sleeves?.hex || cSecondary;
  const cCollar = design.colorZones.collar?.hex || '#ffffff';

  const isBasketballTank = product?.garmentShape === 'basketball_tank';
  const isShorts =
    product?.garmentShape === 'football_shorts' || product?.garmentShape === 'basketball_shorts';

  const samplePlayer = roster[0] || {
    name: 'RODRÍGUEZ',
    number: '10',
    size: 'L',
    cut: 'MEN_PRO_SLIM',
  };
  const sponsorText =
    (design.decals || []).find((d) => d.type === 'STATIC_TEXT')?.text || '';

  const rosterRowsXml = roster
    .slice(0, 12)
    .map(
      (r, idx) =>
        `<text x="585" y="${382 + idx * 16}" font-family="monospace" font-size="10" fill="#cbd5e1">#${escapeXml(
          String(idx + 1).padStart(2, '0')
        )} | ${escapeXml(r.cut)} | Talla ${escapeXml(r.size)} x${r.qty} | #${escapeXml(r.number)} ${escapeXml(
          r.name
        )}</text>`
    )
    .join('\n');

  let mainPatternsXml = '';

  if (isShorts) {
    const legNumHex = design.variableSlots?.playerNumberShorts?.fillHex || '#ffffff';
    mainPatternsXml = `
  <!-- PIEZA 01: PIERNA DERECHA ENVOLVENTE (RIGHT LEG) -->
  <g transform="translate(55, 85)">
    <path d="M 18 0 L 222 0 L 238 145 L 220 445 L 22 445 L 2 165 Z" fill="url(#sublimation-stripes)" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="6 4"/>
    <path d="M 30 14 L 210 14 L 224 145 L 208 430 L 34 430 L 16 165 Z" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="34" y="398" width="174" height="32" fill="rgba(244,63,94,0.22)" stroke="#fb7185" stroke-dasharray="4 3"/>
    <rect x="34" y="382" width="174" height="14" fill="${cAccents}" opacity="0.85"/>
    ${
      design.variableSlots?.playerNumberShorts?.enabled &&
      design.variableSlots?.playerNumberShorts?.panel === 'right_leg'
        ? `<text x="166" y="345" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="44" fill="${legNumHex}" stroke="#0f172a" stroke-width="2">${escapeXml(
            samplePlayer.number
          )}</text>`
        : ''
    }
    <text x="120" y="472" text-anchor="middle" font-family="monospace" font-size="11" fill="#94a3b8">PIEZA 01: RIGHT LEG (${escapeXml(
      product.owayoCutCode || 'SHORTS'
    )})</text>
  </g>

  <!-- PIEZA 02: PIERNA IZQUIERDA ENVOLVENTE (LEFT LEG) -->
  <g transform="translate(315, 85)">
    <path d="M 18 0 L 222 0 L 238 165 L 218 445 L 20 445 L 2 145 Z" fill="url(#sublimation-stripes)" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="6 4"/>
    <path d="M 30 14 L 210 14 L 224 165 L 206 430 L 32 430 L 16 145 Z" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="32" y="398" width="174" height="32" fill="rgba(244,63,94,0.22)" stroke="#fb7185" stroke-dasharray="4 3"/>
    <rect x="32" y="382" width="174" height="14" fill="${cAccents}" opacity="0.85"/>
    ${
      design.variableSlots?.playerNumberShorts?.enabled &&
      design.variableSlots?.playerNumberShorts?.panel === 'left_leg'
        ? `<text x="74" y="345" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="44" fill="${legNumHex}" stroke="#0f172a" stroke-width="2">${escapeXml(
            samplePlayer.number
          )}</text>`
        : ''
    }
    <text x="120" y="472" text-anchor="middle" font-family="monospace" font-size="11" fill="#94a3b8">PIEZA 02: LEFT LEG (DOBLADILLO 3.5cm)</text>
  </g>

  <!-- PIEZA 03: PRETINA ELÁSTICA + CORDÓN INTERIOR -->
  <g transform="translate(585, 85)">
    <rect x="5" y="15" width="268" height="44" fill="${cSecondary}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 3"/>
    <line x1="12" y1="37" x2="266" y2="37" stroke="${cAccents}" stroke-width="2" stroke-dasharray="5 3"/>
    <text x="138" y="76" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">PIEZA 03: PRETINA ELÁSTICA CON CORDÓN</text>
    <rect x="5" y="102" width="120" height="52" fill="#0f172a" stroke="#fbbf24" stroke-width="1.2"/>
    <text x="65" y="132" text-anchor="middle" font-family="monospace" font-size="9" fill="#fbbf24">ETIKETT TALLA ${escapeXml(
      samplePlayer.size
    )}</text>
  </g>`;
  } else {
    const frontPathOuter = isBasketballTank
      ? 'M 58 0 L 82 0 Q 115 58 148 0 L 172 0 Q 176 92 224 132 L 220 465 L 10 465 L 6 132 Q 54 92 58 0 Z'
      : 'M 35 0 L 92 0 L 115 36 L 138 0 L 195 0 L 230 65 L 222 465 L 8 465 L 0 65 Z';
    const frontPathInner = isBasketballTank
      ? 'M 66 12 L 80 12 Q 115 68 150 12 L 164 12 Q 168 98 210 138 L 206 450 L 24 450 L 20 138 Q 62 98 66 12 Z'
      : 'M 48 15 L 90 15 L 115 48 L 140 15 L 182 15 L 214 72 L 207 450 L 23 450 L 16 72 Z';
    const backPathOuter = isBasketballTank
      ? 'M 62 0 L 86 0 Q 115 24 144 0 L 168 0 Q 174 96 224 132 L 220 465 L 10 465 L 6 132 Q 56 96 62 0 Z'
      : 'M 35 0 L 195 0 L 230 65 L 222 465 L 8 465 L 0 65 Z';
    const backPathInner = isBasketballTank
      ? 'M 70 12 L 86 12 Q 115 34 144 12 L 160 12 Q 166 102 210 138 L 206 450 L 24 450 L 20 138 Q 64 102 70 12 Z'
      : 'M 48 15 L 182 15 L 214 72 L 207 450 L 23 450 L 16 72 Z';

    const armPiecesXml = isBasketballTank
      ? `
    <rect x="5" y="12" width="268" height="24" fill="${cSleeves}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="138" y="50" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">PIEZA 03: AERMELBAND LINKS (110×4.8cm • R-TEX 3)</text>
    <rect x="5" y="68" width="268" height="24" fill="${cSleeves}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="138" y="106" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">PIEZA 04: AERMELBAND RECHTS (110×4.8cm • R-TEX 3)</text>
  `
      : `
    <path d="M 22 8 Q 68 -4 114 8 L 132 105 L 4 105 Z" fill="${cSleeves}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="5 3"/>
    <rect x="7" y="92" width="122" height="10" fill="${cAccents}"/>
    <text x="68" y="122" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">MANGA IZQ.</text>

    <g transform="translate(145, 0)">
      <path d="M 22 8 Q 68 -4 114 8 L 132 105 L 4 105 Z" fill="${cSleeves}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="5 3"/>
      <rect x="7" y="92" width="122" height="10" fill="${cAccents}"/>
      <text x="68" y="122" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">MANGA DER.</text>
    </g>
  `;

    mainPatternsXml = `
  <!-- PIEZA 01: MOLDE DELANTERO ANATÓMICO (FRONT PANEL) -->
  <g transform="translate(55, 85)">
    <path d="${frontPathOuter}" fill="url(#sublimation-stripes)" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="6 4"/>
    <path d="${frontPathInner}" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="24" y="418" width="182" height="32" fill="rgba(244,63,94,0.22)" stroke="#fb7185" stroke-dasharray="4 3"/>
    ${
      sponsorText
        ? `<text x="115" y="210" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="18" fill="#ffffff" stroke="#0f172a" stroke-width="1">${escapeXml(
            sponsorText
          )}</text>`
        : ''
    }
    ${
      design.variableSlots?.playerNumberFront?.enabled
        ? `<text x="115" y="268" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="42" fill="${
            design.variableSlots?.playerNumberFront?.fillHex || '#ffffff'
          }" stroke="#0f172a" stroke-width="2">${escapeXml(samplePlayer.number)}</text>`
        : ''
    }
    <text x="115" y="485" text-anchor="middle" font-family="monospace" font-size="11" fill="#94a3b8">PIEZA 01: FRONT (${escapeXml(
      product.owayoCutCode || 'JERSEY'
    )})</text>
  </g>

  <!-- PIEZA 02: MOLDE ESPALDA ANATÓMICO (BACK PANEL + VARIABLE SLOTS) -->
  <g transform="translate(315, 85)">
    <path d="${backPathOuter}" fill="url(#sublimation-stripes)" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="6 4"/>
    <path d="${backPathInner}" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="24" y="418" width="182" height="32" fill="rgba(244,63,94,0.22)" stroke="#fb7185" stroke-dasharray="4 3"/>
    <text x="115" y="138" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="24" fill="${
      design.variableSlots?.playerNameBack?.fillHex || '#ffffff'
    }" stroke="#0f172a" stroke-width="1.5">${escapeXml(samplePlayer.name)}</text>
    <text x="115" y="275" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="104" fill="${
      design.variableSlots?.playerNumberBack?.fillHex || '#ffffff'
    }" stroke="#0f172a" stroke-width="4">${escapeXml(samplePlayer.number)}</text>
    <text x="115" y="485" text-anchor="middle" font-family="monospace" font-size="11" fill="#94a3b8">PIEZA 02: BACK (SLOT UUID)</text>
  </g>

  <!-- PIEZAS 03, 04 & 05: MANGAS/SISAS + KRAGENEINFASS -->
  <g transform="translate(585, 85)">
    ${armPiecesXml}
    <rect x="5" y="140" width="268" height="28" fill="${cCollar}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="138" y="182" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">PIEZA 05: KRAGENEINFASS (${escapeXml(
      (design.collarStyle || 'vneck').toUpperCase()
    )} • 110×4.8cm)</text>
  </g>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 620" width="880mm" height="620mm">
  <defs>
    <pattern id="sublimation-stripes" width="36" height="100" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="24" height="100" fill="${cPrimary}"/>
      <rect x="24" y="0" width="12" height="100" fill="${
        design.patternId === 'pure' ? cPrimary : cSecondary
      }"/>
    </pattern>
  </defs>

  <rect width="880" height="620" fill="#090d16"/>
  <rect x="14" y="14" width="852" height="592" fill="none" stroke="#334155" stroke-width="1"/>

  <!-- Marcas Ópticas de Registro Láser (Crop Marks) -->
  <g stroke="#e2e8f0" stroke-width="1.5" fill="none">
    <circle cx="32" cy="32" r="7"/><line x1="21" y1="32" x2="43" y2="32"/><line x1="32" y1="21" x2="32" y2="43"/>
    <circle cx="848" cy="32" r="7"/><line x1="837" y1="32" x2="859" y2="32"/><line x1="848" y1="21" x2="848" y2="43"/>
    <circle cx="32" cy="588" r="7"/><line x1="21" y1="588" x2="43" y2="588"/><line x1="32" y1="577" x2="32" y2="599"/>
    <circle cx="848" cy="588" r="7"/><line x1="837" y1="588" x2="859" y2="588"/><line x1="848" y1="577" x2="848" y2="599"/>
  </g>

  <text x="55" y="38" font-family="sans-serif" font-weight="bold" font-size="14" fill="#f8fafc">
    ATLETIQ RIP PRINT-READY CUT SHEET v5.0 (ESCALA 1:1 • SANGRADO +15mm • PATRÓN ANATÓMICO)
  </text>
  <text x="55" y="55" font-family="monospace" font-size="11" fill="#facc15">
    DESIGN_ID: ${escapeXml(design.designId)} | MODELO: ${escapeXml(
    product.owayoCutCode || product.id
  )} | DISEÑO: ${escapeXml(design.patternId)} | TALLA MUESTRA: ${escapeXml(samplePlayer.size)}
  </text>

  ${mainPatternsXml}

  <g transform="translate(585, 282)">
    <text x="0" y="0" font-family="sans-serif" font-weight="bold" font-size="11" fill="#facc15">PERFIL CROMÁTICO CM5 / PANTONE:</text>
    <rect x="0" y="8" width="13" height="13" fill="${cPrimary}"/><text x="18" y="18" font-family="monospace" font-size="9.5" fill="#e2e8f0">Code A: ${cPrimary} (${escapeXml(
    design.colorZones.primary?.pantone || 'Custom'
  )})</text>
    <rect x="0" y="24" width="13" height="13" fill="${cSecondary}"/><text x="18" y="34" font-family="monospace" font-size="9.5" fill="#e2e8f0">Code B: ${cSecondary} (${escapeXml(
    design.colorZones.secondary?.pantone || 'Custom'
  )})</text>
    <rect x="0" y="40" width="13" height="13" fill="${cAccents}"/><text x="18" y="50" font-family="monospace" font-size="9.5" fill="#e2e8f0">Code C: ${cAccents} (${escapeXml(
    design.colorZones.accents?.pantone || 'Custom'
  )})</text>
    <rect x="0" y="56" width="13" height="13" fill="${cQuaternary}"/><text x="18" y="66" font-family="monospace" font-size="9.5" fill="#e2e8f0">Code D: ${cQuaternary} (${escapeXml(
    design.colorZones.quaternary?.pantone || 'Custom'
  )})</text>
  </g>

  <text x="585" y="365" font-family="sans-serif" font-weight="bold" font-size="11" fill="#38bdf8">
    EINZELEXEMPLARE ROSTER (${roster.reduce((a, b) => a + (Number(b.qty) || 1), 0)} PRENDAS BAJO MISMO DESIGN_ID):
  </text>
  ${rosterRowsXml}
</svg>`;
}

export function buildShopifyAndManufacturingBundle(design, product, roster = [], previewWebpUrl = '') {
  const totalUnits = roster.reduce((sum, r) => sum + (Number(r.qty) || 1), 0);
  const tier =
    VOLUME_TIERS.find((t) => totalUnits >= t.min && totalUnits <= t.max) || VOLUME_TIERS[0];
  const unitPrice = +(product.basePrice * (1 - tier.discountPct / 100)).toFixed(2);
  const totalOrderPrice = +(unitPrice * totalUnits).toFixed(2);

  const uuidNameBack = design.variableSlots?.playerNameBack?.textObjectUUID || 'uuid-slot-name-back';
  const uuidNumBack = design.variableSlots?.playerNumberBack?.textObjectUUID || 'uuid-slot-num-back';
  const uuidNumFront = design.variableSlots?.playerNumberFront?.textObjectUUID || 'uuid-slot-num-front';
  const uuidNumSleeve = design.variableSlots?.playerNumberSleeve?.textObjectUUID || 'uuid-slot-num-sleeve';
  const uuidNumShorts = design.variableSlots?.playerNumberShorts?.textObjectUUID || 'uuid-slot-num-shorts';

  const owayoEinzelexemplare = roster.map((row) => {
    const texts = [];
    if (design.variableSlots?.playerNameBack?.enabled) {
      texts.push({
        isFixed: false,
        value: row.name || '',
        textObjectUUID: uuidNameBack,
        masterID: null,
      });
    }
    if (design.variableSlots?.playerNumberBack?.enabled) {
      texts.push({
        isFixed: false,
        value: String(row.number || ''),
        textObjectUUID: uuidNumBack,
        masterID: null,
      });
    }
    if (design.variableSlots?.playerNumberFront?.enabled) {
      texts.push({
        isFixed: false,
        value: String(row.number || ''),
        textObjectUUID: uuidNumFront,
        masterID: uuidNumBack,
      });
    }
    if (design.variableSlots?.playerNumberSleeve?.enabled) {
      texts.push({
        isFixed: false,
        value: String(row.number || ''),
        textObjectUUID: uuidNumSleeve,
        masterID: uuidNumBack,
      });
    }
    if (design.variableSlots?.playerNumberShorts?.enabled) {
      texts.push({
        isFixed: false,
        value: String(row.number || ''),
        textObjectUUID: uuidNumShorts,
        masterID: null,
      });
    }
    return {
      size: row.size,
      cut: row.cut,
      amount: Number(row.qty) || 1,
      texts,
    };
  });

  const groupedBySize = new Map();
  roster.forEach((row, idx) => {
    const key = `${row.cut}_${row.size}`;
    if (!groupedBySize.has(key)) {
      groupedBySize.set(key, {
        variantId: product.shopifyVariantBase + idx,
        cut: row.cut,
        size: row.size,
        quantity: 0,
        players: [],
      });
    }
    const g = groupedBySize.get(key);
    g.quantity += Number(row.qty) || 1;
    g.players.push({
      name: row.name,
      num: row.number,
      qty: Number(row.qty) || 1,
    });
  });

  const shopifyItems = Array.from(groupedBySize.values()).map((group) => ({
    id: group.variantId,
    quantity: group.quantity,
    properties: {
      Diseño: `${product.name} (${design.designId})`,
      Corte_y_Talla: `${group.cut} — Talla ${group.size}`,
      Jugadores: group.players.map((p) => `${p.name || 'S/N'} (#${p.num || '-'})`).join(', '),
      _atletiq_design_id: design.designId,
      _atletiq_engine: '5.0.0',
      _atletiq_preview_front:
        previewWebpUrl || `https://cdn.atletiq.pro/previews/${design.designId}_front.webp`,
      _atletiq_tier_code: tier.code,
      _atletiq_roster_slice: JSON.stringify(group.players),
      _print_ready_manifest: `https://api.atletiq.pro/v1/rip/${design.designId}/cut-sheet.svg`,
    },
  }));

  return {
    pricing: {
      totalUnits,
      tier,
      unitPrice,
      totalOrderPrice,
    },
    shopifyCartAddPayload: {
      items: shopifyItems,
    },
    owayoEinzelexemplarePayload: {
      saveID: design.designId,
      model: product.owayoCutCode || product.id,
      design: design.patternId,
      einzelexemplare: owayoEinzelexemplare,
    },
    masterDesignRecord: {
      designId: design.designId,
      engineVersion: '5.0.0',
      productModelId: product.id,
      patternId: design.patternId,
      surfacePatternId: design.surfacePatternId || 'none',
      surfacePatternOpacity: design.surfacePatternOpacity ?? 0.16,
      fabricWeaveId: design.fabricWeaveId,
      collarStyle: design.collarStyle,
      autoContrastHF: design.autoContrastHF !== false,
      bleedEnforcement: design.bleedEnforcement || 'SOFT_WARN',
      colorZones: design.colorZones,
      decals: (design.decals || []).map(
        ({
          id,
          type,
          label,
          panel,
          clampToZone,
          pinned,
          safeZoneId,
          centerMm,
          sizeMm,
          scale,
          rotationDeg,
          opacity,
          flipX,
          flipY,
          removeWhiteBg,
          whiteThreshold,
          invertImage,
          tintHex,
          archDeg,
          fontFamily,
          fillHex,
          strokeHex,
          strokeWidthMm,
          artworkId,
          presetId,
          text,
        }) => ({
          id,
          type,
          label,
          panel,
          clampToZone: clampToZone || 'ALL',
          pinned: Boolean(pinned),
          safeZoneId: safeZoneId || null,
          centerMm,
          sizeMm,
          scale,
          rotationDeg,
          opacity: opacity ?? 1,
          flipX: Boolean(flipX),
          flipY: Boolean(flipY),
          removeWhiteBg: Boolean(removeWhiteBg),
          whiteThreshold: whiteThreshold ?? 238,
          invertImage: Boolean(invertImage),
          tintHex: tintHex || '',
          archDeg: archDeg ?? 0,
          fontFamily: fontFamily || null,
          fillHex: fillHex || null,
          strokeHex: strokeHex || null,
          strokeWidthMm: strokeWidthMm ?? 0,
          artworkId: artworkId || null,
          presetId: presetId || null,
          text: text || null,
        })
      ),
      variableSlots: design.variableSlots,
    },
  };
}
