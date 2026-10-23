/**
 * ATLETIQ Engine v4.0 — Exportador Print-Ready de Moldes de Sublimación + Roster Relacional Owayo (`einzelexemplare`) + Puente Shopify
 *
 * 1. Genera un molde vectorial SVG real de corte y confección (880 x 620 mm) adaptado al patronaje `.mirl`/`.fish` activo
 *    (`204m_Basic_KA` de fútbol/e-sports con 5 piezas o `222m-Hero` de baloncesto con ribetes de sisa de 48 mm).
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
  const isBasketball = product?.garmentShape === 'basketball_tank';

  const samplePlayer = roster[0] || { name: 'RODRÍGUEZ', number: '10', size: 'L', cut: 'MEN_PRO_SLIM' };
  const sponsorText =
    (design.decals || []).find((d) => d.type === 'STATIC_TEXT')?.text || 'ATLETIQ PRO';

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

  const armPiecesXml = isBasketball
    ? `
    <!-- PIEZAS 03 & 04: RIBETES DE SISA BALONCESTO 48mm (AERMELBAND LINKS / RECHTS) -->
    <rect x="5" y="12" width="268" height="24" fill="${cAccents}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="138" y="50" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">PIEZA 03: AERMELBAND LINKS (110×4.8cm • R-TEX 3)</text>
    <rect x="5" y="68" width="268" height="24" fill="${cAccents}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="138" y="106" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">PIEZA 04: AERMELBAND RECHTS (110×4.8cm • R-TEX 3)</text>
  `
    : `
    <!-- PIEZAS 03 & 04: MANGAS IZQUIERDA Y DERECHA -->
    <path d="M 20 5 L 115 5 L 132 105 L 3 105 Z" fill="${cSleeves}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="5 3"/>
    <rect x="6" y="92" width="123" height="10" fill="${cAccents}"/>
    <text x="68" y="122" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">MANGA IZQ.</text>

    <g transform="translate(145, 0)">
      <path d="M 20 5 L 115 5 L 132 105 L 3 105 Z" fill="${cSleeves}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="5 3"/>
      <rect x="6" y="92" width="123" height="10" fill="${cAccents}"/>
      <text x="68" y="122" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">MANGA DER.</text>
    </g>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 620" width="880mm" height="620mm">
  <defs>
    <pattern id="sublimation-stripes" width="32" height="100" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="16" height="100" fill="${cPrimary}"/>
      <rect x="16" y="0" width="16" height="100" fill="${
        design.patternId === 'classic_stripes' ? cSecondary : cPrimary
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
    ATLETIQ RIP PRINT-READY CUT SHEET (ESCALA 1:1 • SANGRADO +15mm • SPERRBEZIRK 50mm)
  </text>
  <text x="55" y="55" font-family="monospace" font-size="11" fill="#facc15">
    DESIGN_ID: ${escapeXml(design.designId)} | MODELO: ${escapeXml(product.id)} | TEJIDO: ${escapeXml(
    design.fabricWeaveId
  )} | MUESTRA: TALLA ${escapeXml(samplePlayer.size)}
  </text>

  <!-- PIEZA 01: MOLDE DELANTERO (FRONT PANEL) -->
  <g transform="translate(55, 85)">
    <path d="M 35 0 L 195 0 L 230 65 L 222 465 L 8 465 L 0 65 Z" fill="url(#sublimation-stripes)" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="6 4"/>
    <path d="M 48 15 L 182 15 L 214 72 L 207 450 L 23 450 L 16 72 Z" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="23" y="418" width="184" height="32" fill="rgba(244,63,94,0.22)" stroke="#fb7185" stroke-dasharray="4 3"/>
    <text x="115" y="210" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="18" fill="#ffffff" stroke="#0f172a" stroke-width="1">${escapeXml(
      sponsorText
    )}</text>
    <text x="115" y="485" text-anchor="middle" font-family="monospace" font-size="11" fill="#94a3b8">PIEZA 01: FRONT (SPERRBEZIRK 5.0cm)</text>
  </g>

  <!-- PIEZA 02: MOLDE ESPALDA (BACK PANEL + VARIABLE SLOTS) -->
  <g transform="translate(315, 85)">
    <path d="M 35 0 L 195 0 L 230 65 L 222 465 L 8 465 L 0 65 Z" fill="url(#sublimation-stripes)" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="6 4"/>
    <path d="M 48 15 L 182 15 L 214 72 L 207 450 L 23 450 L 16 72 Z" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="23" y="418" width="184" height="32" fill="rgba(244,63,94,0.22)" stroke="#fb7185" stroke-dasharray="4 3"/>
    <text x="115" y="135" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="24" fill="${
      design.variableSlots?.playerNameBack?.fillHex || '#ffffff'
    }" stroke="#0f172a" stroke-width="1.5">${escapeXml(samplePlayer.name)}</text>
    <text x="115" y="275" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="108" fill="${
      design.variableSlots?.playerNumberBack?.fillHex || '#ffffff'
    }" stroke="#0f172a" stroke-width="4">${escapeXml(samplePlayer.number)}</text>
    <text x="115" y="485" text-anchor="middle" font-family="monospace" font-size="11" fill="#94a3b8">PIEZA 02: BACK (SLOT UUID)</text>
  </g>

  <!-- PIEZAS 03, 04 & 05: MANGAS/SISAS + KRAGENEINFASS -->
  <g transform="translate(585, 85)">
    ${armPiecesXml}

    <!-- Pieza 05: Krageneinfass -->
    <rect x="5" y="140" width="268" height="28" fill="${cCollar}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="138" y="182" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">PIEZA 05: KRAGENEINFASS (${escapeXml(
      design.collarStyle.toUpperCase()
    )} • 110×4.8cm)</text>
  </g>

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

  // Estructura relacional exacta `einzelexemplare` decodificada de Owayo v6 (`loadEinzelexemplare`)
  const owayoEinzelexemplare = roster.map((row) => ({
    size: row.size,
    cut: row.cut,
    amount: Number(row.qty) || 1,
    texts: [
      {
        isFixed: false,
        value: row.name || '',
        textObjectUUID: uuidNameBack,
        masterID: null,
      },
      {
        isFixed: false,
        value: String(row.number || ''),
        textObjectUUID: uuidNumBack,
        masterID: null,
      },
      {
        isFixed: false,
        value: String(row.number || ''),
        textObjectUUID: uuidNumFront,
        masterID: uuidNumBack, // Clon vinculado automáticamente al dorsal trasero
      },
      ...(design.variableSlots?.playerNumberSleeve?.enabled
        ? [
            {
              isFixed: false,
              value: String(row.number || ''),
              textObjectUUID: uuidNumSleeve,
              masterID: uuidNumBack, // Clon vinculado a mangas
            },
          ]
        : []),
    ],
  }));

  // Agrupar filas del roster por variante de talla para `/cart/add.js` de Shopify
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
      _atletiq_engine: '4.0.0',
      _atletiq_preview_front: previewWebpUrl || `https://cdn.atletiq.pro/previews/${design.designId}_front.webp`,
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
      engineVersion: '4.0.0',
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
          safeZoneId,
          centerMm,
          sizeMm,
          scale,
          rotationDeg,
          opacity,
          flipX,
          flipY,
          removeWhiteBg,
          whiteBgTolerance,
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
          safeZoneId: safeZoneId || null,
          centerMm,
          sizeMm,
          scale,
          rotationDeg,
          opacity: opacity ?? 1,
          flipX: Boolean(flipX),
          flipY: Boolean(flipY),
          removeWhiteBg: Boolean(removeWhiteBg),
          whiteBgTolerance: whiteBgTolerance ?? 242,
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
