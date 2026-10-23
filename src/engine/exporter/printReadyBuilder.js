/**
 * ATLETIQ Engine v3.0 — Exportador Print-Ready de Moldes de Sublimación + Puente Shopify (Estilo Zakeke)
 *
 * 1. Genera un molde vectorial SVG real de corte y confección (860 x 620 mm) con:
 *    - Marcas ópticas de registro para cortadora láser (⊕).
 *    - Contorno de corte continuo + línea magenta punteada de sangrado (+15 mm bleed).
 *    - Piezas separadas: Delantero, Espalda, Manga Izquierda, Manga Derecha y Cuello.
 *    - Leyenda técnica Pantone PMS y matriz resumida del Roster vinculada al `designId`.
 * 2. Construye el payload exacto para `POST /cart/add.js` de Shopify agrupando tallas sin Base64.
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
  const cSleeves = design.colorZones.sleeves?.hex || '#0f172a';
  const cCollar = design.colorZones.collar?.hex || '#ffffff';
  const cAccents = design.colorZones.accents?.hex || '#facc15';

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

  <!-- Pliego Técnico Taller RIP 300 DPI -->
  <rect width="880" height="620" fill="#090d16"/>
  <rect x="14" y="14" width="852" height="592" fill="none" stroke="#334155" stroke-width="1"/>

  <!-- Marcas Ópticas de Registro Láser (Crop Marks) -->
  <g stroke="#e2e8f0" stroke-width="1.5" fill="none">
    <circle cx="32" cy="32" r="7"/><line x1="21" y1="32" x2="43" y2="32"/><line x1="32" y1="21" x2="32" y2="43"/>
    <circle cx="848" cy="32" r="7"/><line x1="837" y1="32" x2="859" y2="32"/><line x1="848" y1="21" x2="848" y2="43"/>
    <circle cx="32" cy="588" r="7"/><line x1="21" y1="588" x2="43" y2="588"/><line x1="32" y1="577" x2="32" y2="599"/>
    <circle cx="848" cy="588" r="7"/><line x1="837" y1="588" x2="859" y2="588"/><line x1="848" y1="577" x2="848" y2="599"/>
  </g>

  <!-- Cabecera de Orden de Manufactura -->
  <text x="55" y="38" font-family="sans-serif" font-weight="bold" font-size="14" fill="#f8fafc">
    ATLETIQ RIP PRINT-READY CUT SHEET (ESCALA 1:1 • SANGRADO +15mm • 300 DPI)
  </text>
  <text x="55" y="55" font-family="monospace" font-size="11" fill="#facc15">
    DESIGN_ID: ${escapeXml(design.designId)} | MODELO: ${escapeXml(product.id)} | TEJIDO: ${escapeXml(
    design.fabricWeaveId
  )} | MUESTRA: TALLA ${escapeXml(samplePlayer.size)}
  </text>

  <!-- PIEZA 1: MOLDE DELANTERO (FRONT PANEL) -->
  <g transform="translate(55, 85)">
    <!-- Línea de Sangrado +15mm (Bleed) -->
    <path d="M 35 0 L 195 0 L 230 65 L 222 465 L 8 465 L 0 65 Z" fill="url(#sublimation-stripes)" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="6 4"/>
    <!-- Línea Real de Corte de Costura -->
    <path d="M 48 15 L 182 15 L 214 72 L 207 450 L 23 450 L 16 72 Z" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="23" y="438" width="184" height="12" fill="${cAccents}"/>
    <text x="115" y="210" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="18" fill="#ffffff" stroke="#0f172a" stroke-width="1">${escapeXml(
      sponsorText
    )}</text>
    <text x="115" y="485" text-anchor="middle" font-family="monospace" font-size="11" fill="#94a3b8">PIEZA 01: DELANTERO (CON SANGRADO 15mm)</text>
  </g>

  <!-- PIEZA 2: MOLDE ESPALDA (BACK PANEL + VARIABLE SLOTS) -->
  <g transform="translate(315, 85)">
    <path d="M 35 0 L 195 0 L 230 65 L 222 465 L 8 465 L 0 65 Z" fill="url(#sublimation-stripes)" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="6 4"/>
    <path d="M 48 15 L 182 15 L 214 72 L 207 450 L 23 450 L 16 72 Z" fill="none" stroke="#ffffff" stroke-width="1.5"/>
    <rect x="23" y="438" width="184" height="12" fill="${cAccents}"/>
    <text x="115" y="135" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="24" fill="${
      design.variableSlots?.playerNameBack?.fillHex || '#ffffff'
    }" stroke="#0f172a" stroke-width="1.5">${escapeXml(samplePlayer.name)}</text>
    <text x="115" y="275" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="108" fill="${
      design.variableSlots?.playerNumberBack?.fillHex || '#ffffff'
    }" stroke="#0f172a" stroke-width="4">${escapeXml(samplePlayer.number)}</text>
    <text x="115" y="485" text-anchor="middle" font-family="monospace" font-size="11" fill="#94a3b8">PIEZA 02: ESPALDA (SLOT DINÁMICO)</text>
  </g>

  <!-- PIEZA 3 & 4: MANGAS IZQUIERDA Y DERECHA + TIRA DE CUELLO -->
  <g transform="translate(585, 85)">
    <path d="M 20 5 L 115 5 L 132 105 L 3 105 Z" fill="${cSleeves}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="5 3"/>
    <rect x="6" y="92" width="123" height="10" fill="${cAccents}"/>
    <text x="68" y="122" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">MANGA IZQ.</text>

    <g transform="translate(145, 0)">
      <path d="M 20 5 L 115 5 L 132 105 L 3 105 Z" fill="${cSleeves}" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="5 3"/>
      <rect x="6" y="92" width="123" height="10" fill="${cAccents}"/>
      <text x="68" y="122" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">MANGA DER.</text>
    </g>

    <!-- Tira de Cuello -->
    <rect x="5" y="140" width="268" height="28" fill="${cCollar}" stroke="#ec4899" stroke-width="1.2" stroke-dasharray="4 3"/>
    <text x="138" y="182" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">PIEZA 05: RIBETE CUELLO (${escapeXml(
      design.collarStyle.toUpperCase()
    )})</text>
  </g>

  <!-- Especificación de Tintas Pantone Textil -->
  <g transform="translate(585, 290)">
    <text x="0" y="0" font-family="sans-serif" font-weight="bold" font-size="11" fill="#facc15">PERFIL CROMÁTICO PANTONE / HEX:</text>
    <rect x="0" y="10" width="14" height="14" fill="${cPrimary}"/><text x="20" y="21" font-family="monospace" font-size="10" fill="#e2e8f0">Base: ${cPrimary} (${escapeXml(
    design.colorZones.primary?.pantone || 'Custom'
  )})</text>
    <rect x="0" y="28" width="14" height="14" fill="${cSecondary}"/><text x="20" y="39" font-family="monospace" font-size="10" fill="#e2e8f0">Sec:  ${cSecondary} (${escapeXml(
    design.colorZones.secondary?.pantone || 'Custom'
  )})</text>
    <rect x="0" y="46" width="14" height="14" fill="${cAccents}"/><text x="20" y="57" font-family="monospace" font-size="10" fill="#e2e8f0">Trim: ${cAccents} (${escapeXml(
    design.colorZones.accents?.pantone || 'Custom'
  )})</text>
  </g>

  <!-- Matriz Relacional de Roster Inyectada -->
  <text x="585" y="365" font-family="sans-serif" font-weight="bold" font-size="11" fill="#38bdf8">
    COLA DE LOTE ROSTER (${roster.reduce((a, b) => a + (Number(b.qty) || 1), 0)} PRENDAS BAJO MISMO DESIGN_ID):
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

  // Agrupar filas del roster por variante de talla para `/cart/add.js` (estilo Zakeke + Owayo)
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
      _atletiq_engine: '3.0.0',
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
    masterDesignRecord: {
      designId: design.designId,
      productModelId: product.id,
      patternId: design.patternId,
      fabricWeaveId: design.fabricWeaveId,
      collarStyle: design.collarStyle,
      colorZones: design.colorZones,
      decals: (design.decals || []).map(({ id, type, label, panel, safeZoneId, centerMm, sizeMm, scale, rotationDeg, artworkId, presetId, text }) => ({
        id,
        type,
        label,
        panel,
        safeZoneId,
        centerMm,
        sizeMm,
        scale,
        rotationDeg,
        artworkId: artworkId || null,
        presetId: presetId || null,
        text: text || null,
      })),
      variableSlots: design.variableSlots,
    },
  };
}
