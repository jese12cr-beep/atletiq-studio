/**
 * ATLETIQ Engine — Generador y Previsualización de Plantilla de Confección Textil (Grado Industrial)
 *
 * Proyecta con precisión milimétrica 1:1 cualquier diseño 3D personalizado (18 Clubes de Liga MX Local/Visita,
 * logotipos PNG subidos por el usuario, dorsales y patrocinadores) sobre los 5 moldes físicos de patronaje
 * extraídos directamente de MOLDE CAMISA.svg (Talla M).
 *
 * Dimensiones físicas del pliego: 1250 mm x 1200 mm (viewBox="0 0 3543.31 3401.57")
 * Factor de conversión: 1 mm = 2.83464567 pt (72 pt/in / 25.4 mm/in)
 */

import {
  MOLDE_CAMISA_STYLE,
  MOLDE_CAMISA_BACKGROUND_INNER,
  MOLDE_PATHS,
} from './moldeCamisaTemplate.js';

export const MOLD_CONSTANTS = {
  VIEWBOX: '0 0 3543.31 3401.57',
  WIDTH_PT: 3543.31,
  HEIGHT_PT: 3401.57,
  WIDTH_MM: 1250,
  HEIGHT_MM: 1200,
  PT_PER_MM: 2.83464567,

  PIECES: {
    FRONT: {
      id: 'front',
      name: 'Delantero / Frente',
      tag: '[ 1. DELANTERO / FRENTE • TALLA M ]',
      pathD: MOLDE_PATHS.FRENTE,
      bounds: { x: 199.7, y: 1039.13, width: 1497.68, height: 2165.95 },
      centerX: 948.54,
      centerY: 2122.1,
      crestX: 1163.54,
      crestY: 1545,
      crestRadius: 110,
      frontNumX: 730,
      frontNumY: 1630,
    },
    BACK: {
      id: 'back',
      name: 'Trasero / Espalda',
      tag: '[ 2. TRASERO / ESPALDA • TALLA M ]',
      pathD: MOLDE_PATHS.TRASERO,
      bounds: { x: 1845.85, y: 1015.82, width: 1497.76, height: 2189.41 },
      centerX: 2594.73,
      centerY: 2110.53,
      nameY: 1530,
      numberY: 2050,
    },
    COLLAR: {
      id: 'collar',
      name: 'Tira de Cuello (Ribete)',
      tag: '[ 3. TIRA DE CUELLO • TALLA M ]',
      bounds: { x: 1699.46, y: 196.34, width: 144.35, height: 1397.62 },
      centerX: 1771.64,
      centerY: 895.15,
    },
    LEFT_SLEEVE: {
      id: 'left_sleeve',
      name: 'Manga Izquierda',
      tag: '[ 4. MANGA IZQUIERDA • TALLA M ]',
      pathD: MOLDE_PATHS.MANGA_IZQUIERDA,
      bounds: { x: 310.11, y: 196.34, width: 1276.86, height: 686.33 },
      centerX: 948.54,
      centerY: 539.51,
      cuffY: 800,
    },
    RIGHT_SLEEVE: {
      id: 'right_sleeve',
      name: 'Manga Derecha',
      tag: '[ 5. MANGA DERECHA • TALLA M ]',
      pathD: MOLDE_PATHS.MANGA_DERECHA,
      bounds: { x: 1956.3, y: 196.34, width: 1276.86, height: 686.33 },
      centerX: 2594.73,
      centerY: 539.51,
      cuffY: 800,
    },
  },
};

/**
 * Resuelve y extrae el data URL (base64) de cualquier logotipo subido.
 */
export function getDecalImageDataUrl(decal, artworkRegistry = {}) {
  if (!decal) return '';
  const art = artworkRegistry?.[decal.artworkId];

  // 1. DataUrl directo en el asset
  if (art?.dataUrl && art.dataUrl.startsWith('data:')) {
    return art.dataUrl;
  }

  // 2. DataUrl directo en el decal
  if (decal.dataUrl && decal.dataUrl.startsWith('data:')) {
    return decal.dataUrl;
  }

  // 3. Origen SVG
  if (art?.svgSource) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(art.svgSource)}`;
  }

  // 4. PreviewUrl ya formateado en base64
  if (art?.previewUrl && art.previewUrl.startsWith('data:')) {
    return art.previewUrl;
  }
  if (decal.previewUrl && decal.previewUrl.startsWith('data:')) {
    return decal.previewUrl;
  }
  if (decal.url && decal.url.startsWith('data:')) {
    return decal.url;
  }

  // 5. Extracción desde imagen viva en el DOM (canvas toDataURL)
  if (typeof document !== 'undefined' && art?.imageElement) {
    try {
      const img = art.imageElement;
      const w = img.naturalWidth || img.width || 800;
      const h = img.naturalHeight || img.height || 800;
      if (w > 0 && h > 0) {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dUrl = c.toDataURL('image/png');
        art.dataUrl = dUrl;
        return dUrl;
      }
    } catch {
      // Ignorar
    }
  }

  // 6. Fallback a URL
  return art?.previewUrl || decal.previewUrl || decal.url || '';
}

/**
 * Genera el arte vectorial de un escudo de club en coordenadas de plantilla.
 */
export function renderClubCrestSvg(clubId, cx, cy, r, design) {
  const primaryColor = design?.colorZones?.primary?.hex || '#FFF0B5';
  const secondaryColor = design?.colorZones?.secondary?.hex || '#0A1A3A';
  const accentsColor = design?.colorZones?.accents?.hex || '#FFC72C';

  // 1. AMÉRICA
  if (clubId === 'mx_america') {
    return `
      <g id="crest_america" transform="translate(${cx}, ${cy})">
        <circle cx="0" cy="0" r="${r}" fill="#FFF0B5" stroke="#0B1B3D" stroke-width="${r * 0.14}" />
        <path d="M${-r * 0.24},${-r * 0.55} L${r * 0.14},${-r * 0.52} L${r * 0.22},${-r * 0.2} L0,${-r * 0.05} L${-r * 0.04},${r * 0.08} L${r * 0.28},${r * 0.22} L${r * 0.18},${r * 0.6} L0,${r * 0.72} L${-r * 0.14},${r * 0.3} Z" fill="#003DA5" />
        <text x="0" y="${r * 0.14}" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="${r * 0.75}" fill="#C8102E">CA</text>
      </g>
    `;
  }

  // 2. TIGRES UANL
  if (clubId === 'mx_tigres') {
    const s = r / 55;
    return `
      <g id="crest_tigres" transform="translate(${cx}, ${cy}) scale(${s})">
        <!-- Escudo azul marino con ribete oro -->
        <path d="M-45,-48 L45,-48 L45,15 C45,45 0,58 0,58 C0,58 -45,45 -45,15 Z" fill="#0033A0" stroke="#FFC72C" stroke-width="7" stroke-linejoin="round" />
        <!-- Barra superior TIGRES -->
        <rect x="-38" y="-42" width="76" height="15" fill="#FFC72C" rx="2" />
        <text x="0" y="-32" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="11" fill="#0033A0" letter-spacing="1">TIGRES</text>
        <!-- U emblemática -->
        <text x="0" y="8" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="36" fill="#FFC72C">U</text>
        <text x="0" y="32" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" letter-spacing="2">UANL</text>
      </g>
    `;
  }

  // 3. CHIVAS DE GUADALAJARA
  if (clubId === 'mx_chivas') {
    return `
      <g id="crest_chivas" transform="translate(${cx}, ${cy})">
        <path d="M0,${-r} L${r * 0.9},${-r * 0.5} L${r * 0.9},${r * 0.2} C${r * 0.9},${r * 0.7} 0,${r * 1.05} 0,${r * 1.05} C0,${r * 1.05} ${-r * 0.9},${r * 0.7} ${-r * 0.9},${r * 0.2} L${-r * 0.9},${-r * 0.5} Z" fill="#C8102E" stroke="#0B1B3D" stroke-width="${r * 0.12}" />
        <rect x="${-r * 0.4}" y="${-r * 0.3}" width="${r * 0.25}" height="${r * 0.9}" fill="#FFFFFF" />
        <rect x="${r * 0.15}" y="${-r * 0.3}" width="${r * 0.25}" height="${r * 0.9}" fill="#FFFFFF" />
        <path d="M0,${-r} L${r * 0.85},${-r * 0.5} L${-r * 0.85},${-r * 0.5} Z" fill="#003DA5" />
        <circle cx="0" cy="${-r * 0.58}" r="${r * 0.16}" fill="#FFC72C" />
      </g>
    `;
  }

  // 4. PUMAS UNAM
  if (clubId === 'mx_pumas') {
    return `
      <g id="crest_pumas" transform="translate(${cx}, ${cy})">
        <polygon points="0,${-r * 0.95} ${r * 0.9},${r * 0.7} ${-r * 0.9},${r * 0.7}" fill="#0A1A3A" stroke="#C89A3C" stroke-width="${r * 0.14}" stroke-linejoin="round" />
        <polygon points="0,${-r * 0.5} ${r * 0.5},${r * 0.4} ${-r * 0.5},${r * 0.4}" fill="#C89A3C" />
      </g>
    `;
  }

  // 5. CRUZ AZUL
  if (clubId === 'mx_cruz_azul') {
    return `
      <g id="crest_cruz_azul" transform="translate(${cx}, ${cy})">
        <circle cx="0" cy="0" r="${r * 0.92}" fill="#0033A0" stroke="#C8102E" stroke-width="${r * 0.12}" />
        <circle cx="0" cy="0" r="${r * 0.72}" fill="#FFFFFF" />
        <rect x="${-r * 0.42}" y="${-r * 0.14}" width="${r * 0.84}" height="${r * 0.28}" fill="#C8102E" />
        <rect x="${-r * 0.14}" y="${-r * 0.42}" width="${r * 0.28}" height="${r * 0.84}" fill="#C8102E" />
      </g>
    `;
  }

  // 6. RAYADOS DE MONTERREY
  if (clubId === 'mx_rayados') {
    return `
      <g id="crest_rayados" transform="translate(${cx}, ${cy})">
        <path d="M${-r * 0.8},${-r * 0.85} L${r * 0.8},${-r * 0.85} L${r * 0.8},${r * 0.2} C${r * 0.8},${r * 0.7} 0,${r} 0,${r} C0,${r} ${-r * 0.8},${r * 0.7} ${-r * 0.8},${r * 0.2} Z" fill="#001A49" stroke="#FFFFFF" stroke-width="${r * 0.1}" />
        <rect x="${-r * 0.5}" y="${-r * 0.35}" width="${r * 0.22}" height="${r * 0.8}" fill="#FFFFFF" />
        <rect x="${r * 0.28}" y="${-r * 0.35}" width="${r * 0.22}" height="${r * 0.8}" fill="#FFFFFF" />
        <text x="0" y="${-r * 0.42}" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="${r * 0.4}" fill="#FFFFFF">M</text>
      </g>
    `;
  }

  // 7. ATLAS FC
  if (clubId === 'mx_atlas') {
    return `
      <g id="crest_atlas" transform="translate(${cx}, ${cy})">
        <path d="M${-r * 0.8},${-r * 0.85} L${r * 0.8},${-r * 0.85} L${r * 0.8},${r * 0.2} C${r * 0.8},${r * 0.7} 0,${r} 0,${r} C0,${r} ${-r * 0.8},${r * 0.7} ${-r * 0.8},${r * 0.2} Z" fill="#C8102E" stroke="#FFFFFF" stroke-width="${r * 0.08}" />
        <path d="M0,${-r * 0.85} L${r * 0.8},${-r * 0.85} L${r * 0.8},${r * 0.2} C${r * 0.8},${r * 0.7} 0,${r} 0,${r} Z" fill="#000000" />
        <text x="0" y="${r * 0.05}" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', sans-serif" font-weight="900" font-size="${r * 0.7}" fill="#FFFFFF">A</text>
      </g>
    `;
  }

  // 8. ESCUDO GENÉRICO DEPORTIVO
  return `
    <g id="crest_custom_${clubId || 'generic'}" transform="translate(${cx}, ${cy})">
      <circle cx="0" cy="0" r="${r}" fill="${secondaryColor}" stroke="${accentsColor}" stroke-width="${r * 0.12}" />
      <text x="0" y="${r * 0.04}" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="${r * 0.6}" fill="#FFFFFF">MX</text>
    </g>
  `;
}

/**
 * Renderiza cualquier decal colocado en 3D (PNG subido, escudo, texto o marca) sobre la pieza 2D.
 */
export function renderDecalToSvg(decal, panelBounds, artworkRegistry, design) {
  if (!decal) return '';

  const refW = 519.25;
  const refH = 774.83;
  const u = (decal.centerMm?.x ?? (refW / 2)) / refW;
  const v = (decal.centerMm?.y ?? (refH / 3)) / refH;

  const scaleX = panelBounds.width / refW;
  const scaleY = panelBounds.height / refH;

  const cx = panelBounds.x + u * panelBounds.width;
  const cy = panelBounds.y + v * panelBounds.height;

  const w = (decal.sizeMm?.width ?? 70) * (decal.scale ?? 1) * scaleX;
  const h = (decal.sizeMm?.height ?? 70) * (decal.scale ?? 1) * scaleY;
  const rot = decal.rotationDeg || 0;
  const opacity = decal.opacity ?? 1;

  const sx = decal.flipX ? -1 : 1;
  const sy = decal.flipY ? -1 : 1;

  // 1. LOGOTIPOS RASTER / VECTOR SUBIDOS (PNG / SVG / JPG)
  if (decal.type === 'UPLOADED_RASTER' || decal.type === 'UPLOADED_VECTOR' || decal.artworkId) {
    const imageSrc = getDecalImageDataUrl(decal, artworkRegistry);
    if (imageSrc) {
      return `
        <g id="decal_${decal.id || 'custom'}" transform="translate(${cx}, ${cy}) rotate(${rot}) scale(${sx}, ${sy})" opacity="${opacity}">
          <image href="${imageSrc}" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" />
        </g>
      `;
    }
  }

  // 2. TEXTOS FIJOS / PATROCINADORES EN TEXTO
  if (decal.type === 'STATIC_TEXT' && decal.text) {
    const fontSize = h * 0.85;
    const fontFam = decal.fontFamily || "'Arial Black', Impact, sans-serif";
    const fill = decal.fillHex || '#ffffff';
    const stroke = decal.outlineHex || '#0b1b3d';
    return `
      <g id="text_${decal.id}" transform="translate(${cx}, ${cy}) rotate(${rot}) scale(${sx}, ${sy})" opacity="${opacity}">
        <text x="0" y="0" text-anchor="middle" dominant-baseline="middle" font-family="${fontFam}" font-size="${fontSize}" font-weight="900" fill="${fill}" stroke="${stroke}" stroke-width="${fontSize * 0.12}" paint-order="stroke fill">${decal.text.toUpperCase()}</text>
      </g>
    `;
  }

  // 3. ESCUDO DE CLUB O PRESET CREST
  if (decal.type === 'LIGAMX_CREST' || decal.type === 'PRESET_CREST' || decal.clubId || decal.presetId) {
    const club = decal.clubId || decal.presetId || design?.mexicoBaseClubId || '';
    return renderClubCrestSvg(club, cx, cy, Math.min(w, h) / 2, design);
  }

  return '';
}

/**
 * Genera el arte vectorial base de los patrones de Liga MX.
 */
function generateFrontAndBackGraphics(design, frenteCenterX, traseroCenterX, isAway) {
  let graphicId = null;

  (design?.decals || []).forEach((d) => {
    if (d.type === 'LIGAMX_GRAPHIC') graphicId = d.graphicId;
  });

  if (!graphicId && design?.mexicoKitId) {
    const k = design.mexicoKitId.toLowerCase();
    if (k.includes('america')) graphicId = 'mx_america_aztec_chevron';
    else if (k.includes('chivas')) graphicId = 'mx_chivas_stripes';
    else if (k.includes('pumas')) graphicId = 'mx_pumas_puma_face';
    else if (k.includes('tigres')) graphicId = 'mx_tigres_chest_bar';
    else if (k.includes('cruz_azul')) graphicId = 'mx_cruz_azul_front';
    else if (k.includes('monterrey')) graphicId = 'mx_monterrey_stripes';
    else if (k.includes('atlas')) graphicId = 'mx_atlas_50_50';
    else if (k.includes('puebla')) graphicId = 'mx_puebla_sash';
    else if (k.includes('santos')) graphicId = 'mx_santos_hoops';
    else if (k.includes('toluca')) graphicId = 'mx_toluca_front';
    else if (k.includes('leon')) graphicId = 'mx_leon_front';
    else if (k.includes('pachuca')) graphicId = 'mx_pachuca_stripes';
    else if (k.includes('tijuana')) graphicId = 'mx_tijuana_xolos';
    else if (k.includes('necaxa')) graphicId = 'mx_necaxa_stripes';
    else if (k.includes('juarez')) graphicId = 'mx_juarez_front';
    else if (k.includes('mazatlan')) graphicId = 'mx_mazatlan_front';
    else if (k.includes('queretaro')) graphicId = 'mx_queretaro_stripes';
    else if (k.includes('san_luis')) graphicId = 'mx_atletico_san_luis_stripes';
  }

  const primaryColor = design?.colorZones?.primary?.hex || '#FFF0B5';
  const secondaryColor = design?.colorZones?.secondary?.hex || '#0A1A3A';

  let frontGraphicSvg = '';
  let backGraphicSvg = '';

  // 1. AMÉRICA
  if (graphicId === 'mx_america_aztec_chevron') {
    const vApexX = frenteCenterX;
    const vApexY = 1860;
    const vLeftWingX = 180;
    const vLeftWingY = 1460;
    const vRightWingX = 1715;
    const vRightWingY = 1460;

    const yokeColor = isAway ? '#FFF0B5' : secondaryColor;
    const redColor = '#C8102E';
    const blueColor = isAway ? '#C8102E' : '#003DA5';
    const yellowColor = isAway ? '#0A1A3A' : '#F5A800';

    const yokePath = `M170,1010 L1725,1010 L${vRightWingX},${vRightWingY} L${vApexX},${vApexY} L${vLeftWingX},${vLeftWingY} Z`;

    const count = 9;
    let tRow1 = '';
    let tRow2 = '';
    let tRow3 = '';

    for (let i = 0; i < count; i++) {
      const t0 = i / count;
      const t1 = (i + 1) / count;

      const lx0 = vLeftWingX + t0 * (vApexX - vLeftWingX);
      const ly0 = vLeftWingY + t0 * (vApexY - vLeftWingY);
      const lx1 = vLeftWingX + t1 * (vApexX - vLeftWingX);
      const ly1 = vLeftWingY + t1 * (vApexY - vLeftWingY);
      const lmidX = (lx0 + lx1) / 2;

      const rx0 = vApexX + t0 * (vRightWingX - vApexX);
      const ry0 = vApexY - t0 * (vApexY - vRightWingY);
      const rx1 = vApexX + t1 * (vRightWingX - vApexX);
      const ry1 = vApexY - t1 * (vApexY - vRightWingY);
      const rmidX = (rx0 + rx1) / 2;

      const r1H = 55;
      tRow1 += `<polygon points="${lx0.toFixed(1)},${ly0.toFixed(1)} ${lx1.toFixed(1)},${ly1.toFixed(1)} ${lmidX.toFixed(1)},${(ly0 + r1H).toFixed(1)}" fill="${redColor}" />`;
      tRow1 += `<polygon points="${rx0.toFixed(1)},${ry0.toFixed(1)} ${rx1.toFixed(1)},${ry1.toFixed(1)} ${rmidX.toFixed(1)},${(ry0 + r1H).toFixed(1)}" fill="${redColor}" />`;

      const r2H = 110;
      tRow2 += `<polygon points="${lx0.toFixed(1)},${(ly0 + 40).toFixed(1)} ${lx1.toFixed(1)},${(ly1 + 40).toFixed(1)} ${lmidX.toFixed(1)},${(ly0 + r2H).toFixed(1)}" fill="${blueColor}" />`;
      tRow2 += `<polygon points="${rx0.toFixed(1)},${(ry0 + 40).toFixed(1)} ${rx1.toFixed(1)},${(ry1 + 40).toFixed(1)} ${rmidX.toFixed(1)},${(ry0 + r2H).toFixed(1)}" fill="${blueColor}" />`;

      const r3H = 160;
      tRow3 += `<polygon points="${lx0.toFixed(1)},${(ly0 + 85).toFixed(1)} ${lx1.toFixed(1)},${(ly1 + 85).toFixed(1)} ${lmidX.toFixed(1)},${(ly0 + r3H).toFixed(1)}" fill="${yellowColor}" />`;
      tRow3 += `<polygon points="${rx0.toFixed(1)},${(ry0 + 85).toFixed(1)} ${rx1.toFixed(1)},${(ry1 + 85).toFixed(1)} ${rmidX.toFixed(1)},${(ry0 + r3H).toFixed(1)}" fill="${yellowColor}" />`;
    }

    const apexDiamond = `
      <polygon points="${vApexX},${vApexY + 80} ${vApexX + 45},${vApexY + 150} ${vApexX},${vApexY + 220} ${vApexX - 45},${vApexY + 150}" fill="${redColor}" />
      <polygon points="${vApexX},${vApexY + 95} ${vApexX + 32},${vApexY + 150} ${vApexX},${vApexY + 205} ${vApexX - 32},${vApexY + 150}" fill="${blueColor}" />
    `;

    frontGraphicSvg = `
      <path d="${yokePath}" fill="${yokeColor}" />
      ${tRow1}
      ${tRow2}
      ${tRow3}
      ${apexDiamond}
    `;

    backGraphicSvg = `
      <rect x="1815" y="985" width="1560" height="420" fill="${yokeColor}" />
      <line x1="1815" y1="1405" x2="3375" y2="1405" stroke="${redColor}" stroke-width="14" />
      <line x1="1815" y1="1425" x2="3375" y2="1425" stroke="${blueColor}" stroke-width="12" />
    `;
  } else if (graphicId === 'mx_chivas_stripes' || graphicId === 'mx_monterrey_stripes' || graphicId === 'mx_pachuca_stripes') {
    const isChivas = graphicId === 'mx_chivas_stripes';
    const numStripes = isChivas ? 9 : 7;
    const stripeW = 1500 / numStripes;
    const colA = isChivas ? '#C8102E' : '#0B1B3D';
    const colB = '#FFFFFF';
    let sFront = '';
    let sBack = '';

    for (let i = 0; i < numStripes; i++) {
      const col = i % 2 === 0 ? colA : colB;
      sFront += `<rect x="${190 + i * stripeW}" y="1010" width="${stripeW + 1}" height="2225" fill="${col}" />`;
      sBack += `<rect x="${1840 + i * stripeW}" y="985" width="${stripeW + 1}" height="2250" fill="${col}" />`;
    }

    frontGraphicSvg = `
      ${sFront}
      <rect x="170" y="1010" width="1560" height="380" fill="#0B1B3D" />
    `;
    backGraphicSvg = `
      ${sBack}
      <rect x="1815" y="985" width="1560" height="380" fill="#0B1B3D" />
    `;
  } else if (graphicId === 'mx_pumas_puma_face') {
    const pumaColor = isAway ? '#0A1A3A' : '#C89A3C';
    const px = frenteCenterX;
    const py = 2050;
    const scale = 2.4;
    frontGraphicSvg = `
      <g transform="translate(${px}, ${py}) scale(${scale})">
        <path d="M0,-160 C75,-160 145,-120 180,-50 C195,-20 205,25 205,75 C205,140 160,195 90,215 C45,225 -45,225 -90,215 C-160,195 -205,140 -205,75 C-205,25 -195,-20 -180,-50 C-145,-120 -75,-160 0,-160 Z" fill="${pumaColor}" />
        <path d="M0,-115 C52,-115 102,-85 125,-35 C135,-15 142,18 142,55 C142,100 110,140 60,155 C30,162 -30,162 -60,155 C-110,140 -142,100 -142,55 C-142,18 -135,-15 -125,-35 C-102,-85 -52,-115 0,-115 Z" fill="${primaryColor}" />
        <polygon points="0,20 -38,70 38,70" fill="${pumaColor}" />
        <polygon points="0,-45 -48,-10 48,-10" fill="${pumaColor}" />
      </g>
    `;
  } else if (graphicId === 'mx_tigres_chest_bar') {
    // Barra de pecho universitaria UANL
    frontGraphicSvg = `
      <rect x="170" y="1720" width="1560" height="230" fill="#003DA5" />
      <rect x="170" y="1710" width="1560" height="12" fill="#FFFFFF" />
      <rect x="170" y="1950" width="1560" height="12" fill="#FFFFFF" />
      <text x="${frenteCenterX}" y="1845" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="115" letter-spacing="18" fill="#FDB913">TIGRES</text>
    `;
  } else if (graphicId === 'mx_atlas_50_50') {
    frontGraphicSvg = `<rect x="${frenteCenterX}" y="1010" width="800" height="2225" fill="#000000" />`;
    backGraphicSvg = `<rect x="${traseroCenterX}" y="985" width="800" height="2250" fill="#000000" />`;
  } else if (graphicId === 'mx_puebla_sash') {
    frontGraphicSvg = `
      <polygon points="1200,1010 1600,1010 400,3205 180,3205" fill="#003DA5" />
      <polygon points="1180,1010 1200,1010 180,3205 160,3205" fill="#C89A3C" />
      <polygon points="1600,1010 1620,1010 420,3205 400,3205" fill="#C89A3C" />
    `;
  } else if (graphicId === 'mx_santos_hoops') {
    let hoops = '';
    for (let y = 1100; y < 3100; y += 220) {
      hoops += `<rect x="170" y="${y}" width="1560" height="110" fill="#00843D" />`;
    }
    frontGraphicSvg = hoops;
  }

  return { frontGraphicSvg, backGraphicSvg };
}

/**
 * Genera la cadena completa SVG de la Plantilla de Producción Textil 1:1.
 */
export function generateProductionMoldSvgString(design, activePlayer = {}, options = {}) {
  const {
    showCutLines = true,
    showLabels = true,
    artworkRegistry = {},
  } = options;

  const frenteCenterX = MOLD_CONSTANTS.PIECES.FRONT.centerX;
  const traseroCenterX = MOLD_CONSTANTS.PIECES.BACK.centerX;

  const isAway =
    design?.mexicoKitId?.includes('away') ||
    design?.colorZones?.primary?.hex?.toLowerCase() === '#0b1b3d' ||
    design?.colorZones?.primary?.hex?.toLowerCase() === '#0a1a3a';

  const primaryColor = design?.colorZones?.primary?.hex || '#FFF0B5';
  const secondaryColor = design?.colorZones?.secondary?.hex || '#0A1A3A';
  const sleevesColor = design?.colorZones?.sleeves?.hex || primaryColor;
  const collarColor = design?.colorZones?.collar?.hex || secondaryColor;

  const playerName = (activePlayer?.name || design?.sampleName || 'VALVERDE').toUpperCase();
  const playerNumber = String(activePlayer?.number || design?.sampleNumber || '10');

  // Configuración de slots variables (respetando estado 3D)
  const slots = design?.variableSlots || {};
  const frontNumberEnabled = Boolean(slots.playerNumberFront?.enabled);
  const backNameEnabled = slots.playerNameBack?.enabled !== false;
  const backNumberEnabled = slots.playerNumberBack?.enabled !== false;

  const { frontGraphicSvg, backGraphicSvg } = generateFrontAndBackGraphics(
    design,
    frenteCenterX,
    traseroCenterX,
    isAway
  );

  // -------------------------------------------------------------
  // PROYECCIÓN DE DECALS Y LOGOS SOBRE CADA PIEZA
  // -------------------------------------------------------------
  const frenteBounds = MOLD_CONSTANTS.PIECES.FRONT.bounds;
  const traseroBounds = MOLD_CONSTANTS.PIECES.BACK.bounds;
  const leftSleeveBounds = MOLD_CONSTANTS.PIECES.LEFT_SLEEVE.bounds;
  const rightSleeveBounds = MOLD_CONSTANTS.PIECES.RIGHT_SLEEVE.bounds;

  const allDecals = design?.decals || [];

  // Front Decals
  const frontDecals = allDecals.filter((d) => d.panel === 'front' && d.type !== 'LIGAMX_GRAPHIC');
  let frontDecalsSvg = frontDecals
    .map((d) => renderDecalToSvg(d, frenteBounds, artworkRegistry, design))
    .join('\n');

  // Fallback de escudo si no hay decal en el pecho pero sí un club seleccionado
  const hasCrestDecal = frontDecals.some(
    (d) => d.type === 'LIGAMX_CREST' || d.type === 'PRESET_CREST' || d.type === 'UPLOADED_RASTER' || d.type === 'UPLOADED_VECTOR'
  );
  if (!hasCrestDecal && design?.mexicoBaseClubId) {
    frontDecalsSvg += '\n' + renderClubCrestSvg(
      design.mexicoBaseClubId,
      MOLD_CONSTANTS.PIECES.FRONT.crestX,
      MOLD_CONSTANTS.PIECES.FRONT.crestY,
      MOLD_CONSTANTS.PIECES.FRONT.crestRadius,
      design
    );
  }

  // Back Decals
  const backDecals = allDecals.filter((d) => d.panel === 'back');
  const backDecalsSvg = backDecals
    .map((d) => renderDecalToSvg(d, traseroBounds, artworkRegistry, design))
    .join('\n');

  // Sleeve Decals
  const leftSleeveDecals = allDecals.filter((d) => d.panel === 'left_sleeve');
  const leftSleeveDecalsSvg = leftSleeveDecals
    .map((d) => renderDecalToSvg(d, leftSleeveBounds, artworkRegistry, design))
    .join('\n');

  const rightSleeveDecals = allDecals.filter((d) => d.panel === 'right_sleeve');
  const rightSleeveDecalsSvg = rightSleeveDecals
    .map((d) => renderDecalToSvg(d, rightSleeveBounds, artworkRegistry, design))
    .join('\n');

  // Dorsal de pecho (solo si está activo en 3D)
  let frontNumSvg = '';
  if (frontNumberEnabled && playerNumber) {
    const fnX = MOLD_CONSTANTS.PIECES.FRONT.frontNumX;
    const fnY = MOLD_CONSTANTS.PIECES.FRONT.frontNumY;
    frontNumSvg = `
      <text x="${fnX}" y="${fnY}" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="130" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="12" paint-order="stroke fill">${playerNumber}</text>
    `;
  }

  // Nombre y Dorsal de Espalda
  let backNameSvg = '';
  if (backNameEnabled && playerName) {
    const ny = MOLD_CONSTANTS.PIECES.BACK.nameY;
    backNameSvg = `
      <text x="${traseroCenterX}" y="${ny}" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="145" letter-spacing="6" fill="${secondaryColor}" stroke="#ffffff" stroke-width="14" paint-order="stroke fill">${playerName}</text>
    `;
  }

  let backNumberSvg = '';
  if (backNumberEnabled && playerNumber) {
    const numY = MOLD_CONSTANTS.PIECES.BACK.numberY;
    backNumberSvg = `
      <text x="${traseroCenterX}" y="${numY}" text-anchor="middle" dominant-baseline="middle" font-family="'Arial Black', Impact, sans-serif" font-weight="900" font-size="620" fill="${secondaryColor}" stroke="#ffffff" stroke-width="32" paint-order="stroke fill">${playerNumber}</text>
    `;
  }

  // Ribete de mangas
  const sleeveTrimHeight = 85;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="100%" height="100%" viewBox="${MOLD_CONSTANTS.VIEWBOX}" preserveAspectRatio="xMidYMid meet">
  <!-- Generator: ATLETIQ Industrial Sublimation Engine (Adobe Illustrator 1:1) -->
  <defs>
    <style><![CDATA[
      ${MOLDE_CAMISA_STYLE}
      .cut-line { stroke: #010101; stroke-width: 2.2; fill: none; stroke-miterlimit: 10; }
      .piece-tag { font-family: 'Arial Black', sans-serif; font-size: 20px; font-weight: 900; letter-spacing: 2px; fill: #475569; }
    ]]></style>
    <clipPath id="clip-frente">
      <path d="${MOLDE_PATHS.FRENTE}" />
    </clipPath>
    <clipPath id="clip-trasero">
      <path d="${MOLDE_PATHS.TRASERO}" />
    </clipPath>
    <clipPath id="clip-manga-der">
      <path d="${MOLDE_PATHS.MANGA_DERECHA}" />
    </clipPath>
    <clipPath id="clip-manga-izq">
      <path d="${MOLDE_PATHS.MANGA_IZQUIERDA}" />
    </clipPath>
  </defs>

  <!-- 1. CAPA MASTER DE PATRONAJE (FONDO ORIGINAL ADOBE ILLUSTRATOR) -->
  <g id="BACKGROUND">
    ${MOLDE_CAMISA_BACKGROUND_INNER}
  </g>

  <!-- 2. CAPA DE PRODUCCIÓN TEXTIL 1:1 (DISEÑO Y PIEZAS APLANADAS) -->
  <g id="DESIGN">
    <!-- ==================== PIEZA 1: DELANTERO / FRENTE ==================== -->
    <g id="PIECE_FRENTE">
      <g clip-path="url(#clip-frente)">
        <!-- Fondo Base con Sangrado 10mm -->
        <rect x="170" y="1010" width="1560" height="2225" fill="${primaryColor}" />
        <!-- Patrón Gráfico Oficial -->
        ${frontGraphicSvg}
        <!-- Logotipos y Escudos Proyectados -->
        ${frontDecalsSvg}
        <!-- Dorsal Pecho (solo si está activo en 3D) -->
        ${frontNumSvg}
      </g>

      <!-- Trazo de Corte Físico (Línea de confección) -->
      ${showCutLines ? `<path class="cut-line" d="${MOLDE_PATHS.FRENTE}" />` : ''}

      <!-- Identificación de Pieza -->
      ${showLabels ? `<text x="${frenteCenterX}" y="3255" text-anchor="middle" class="piece-tag">${MOLD_CONSTANTS.PIECES.FRONT.tag}</text>` : ''}
    </g>

    <!-- ==================== PIEZA 2: TRASERO / ESPALDA ==================== -->
    <g id="PIECE_TRASERO">
      <g clip-path="url(#clip-trasero)">
        <!-- Fondo Base con Sangrado 10mm -->
        <rect x="1815" y="985" width="1560" height="2250" fill="${primaryColor}" />
        <!-- Yugo Posterior Superior -->
        ${backGraphicSvg}
        <!-- Decals Posteriores (Patrocinadores espalda) -->
        ${backDecalsSvg}
        <!-- Nombre de Jugador -->
        ${backNameSvg}
        <!-- Dorsal de Jugador Atlético (250 mm) -->
        ${backNumberSvg}
      </g>

      <!-- Trazo de Corte Físico -->
      ${showCutLines ? `<path class="cut-line" d="${MOLDE_PATHS.TRASERO}" />` : ''}

      <!-- Identificación de Pieza -->
      ${showLabels ? `<text x="${traseroCenterX}" y="3255" text-anchor="middle" class="piece-tag">${MOLD_CONSTANTS.PIECES.BACK.tag}</text>` : ''}
    </g>

    <!-- ==================== PIEZA 3: TIRA DE CUELLO (ORIGINAL MOLDE CAMISA.SVG) ==================== -->
    <g id="PIECE_CUELLO">
      <rect class="cut-line" x="1072.82" y="822.98" width="1397.62" height="144.35" transform="translate(2666.7948 -876.4772) rotate(90)" fill="${collarColor}" stroke="#010101" stroke-width="2.2" />
      ${showLabels ? `<text x="1771" y="900" transform="rotate(-90 1771 900)" text-anchor="middle" class="piece-tag">${MOLD_CONSTANTS.PIECES.COLLAR.tag}</text>` : ''}
    </g>

    <!-- ==================== PIEZA 4: MANGA IZQUIERDA ==================== -->
    <g id="PIECE_MANGA_IZQUIERDA">
      <g clip-path="url(#clip-manga-izq)">
        <!-- Fondo Manga con Sangrado -->
        <rect x="280" y="165" width="1335" height="745" fill="${sleevesColor}" />
        <!-- Ribete de Puño -->
        <rect x="280" y="${882.7 - sleeveTrimHeight}" width="1335" height="${sleeveTrimHeight + 20}" fill="${secondaryColor}" />
        <!-- Decals Manga Izquierda -->
        ${leftSleeveDecalsSvg}
      </g>

      <!-- Trazo de Corte Físico -->
      ${showCutLines ? `<path class="cut-line" d="${MOLDE_PATHS.MANGA_IZQUIERDA}" />` : ''}

      <!-- Identificación -->
      ${showLabels ? `<text x="${frenteCenterX}" y="920" text-anchor="middle" class="piece-tag">${MOLD_CONSTANTS.PIECES.LEFT_SLEEVE.tag}</text>` : ''}
    </g>

    <!-- ==================== PIEZA 5: MANGA DERECHA ==================== -->
    <g id="PIECE_MANGA_DERECHA">
      <g clip-path="url(#clip-manga-der)">
        <!-- Fondo Manga con Sangrado -->
        <rect x="1925" y="165" width="1335" height="745" fill="${sleevesColor}" />
        <!-- Ribete de Puño -->
        <rect x="1925" y="${882.7 - sleeveTrimHeight}" width="1335" height="${sleeveTrimHeight + 20}" fill="${secondaryColor}" />
        <!-- Decals Manga Derecha -->
        ${rightSleeveDecalsSvg}
      </g>

      <!-- Trazo de Corte Físico -->
      ${showCutLines ? `<path class="cut-line" d="${MOLDE_PATHS.MANGA_DERECHA}" />` : ''}

      <!-- Identificación -->
      ${showLabels ? `<text x="${traseroCenterX}" y="920" text-anchor="middle" class="piece-tag">${MOLD_CONSTANTS.PIECES.RIGHT_SLEEVE.tag}</text>` : ''}
    </g>
  </g>
</svg>`;
}

/**
 * Descarga el archivo SVG de la plantilla de confección textil 1:1.
 */
export function downloadProductionMoldSvg(design, activePlayer, filename, options = {}) {
  const svgStr = generateProductionMoldSvgString(design, activePlayer, options);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = (design?.clubAlias || design?.mexicoKitId || 'PLANTILLA').replace(/\s+/g, '_').toUpperCase();
  a.download = filename || `${safeName}_PLANTILLA_CONFECCION_TALLA_M_1A1.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
