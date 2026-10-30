/**
 * ATLETIQ Engine — Liga MX Realistic Kits Vector Engine
 *
 * Renderizado vectorial de alta fidelidad para los 18 clubes de la Primera División de México.
 * Recrea con exactitud matemática las geometrías icónicas (chevron azteca de América,
 * puma felino gigante de la UNAM, franja horizontal de Tigres, franja diagonal de Puebla,
 * división 50/50 de Atlas, barras y escudos auténticos), omitiendo al 100% marcas
 * comerciales registradas (Nike/Adidas/Puma) y patrocinadores para venta legal en Shopify.
 */

import { resolveAssetUrl } from '../../utils/assetUrl';

// Cache global de logotipos en alta resolución de Liga MX y Selecciones
const CREST_IMAGES_CACHE = {};

function getOrLoadCrestImage(clubId) {
  if (typeof window === 'undefined') return null;
  if (!clubId) return null;

  const key = String(clubId).toLowerCase().trim();
  if (CREST_IMAGES_CACHE[key]) return CREST_IMAGES_CACHE[key];

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.dataset.loaded = 'false';
  img.onload = () => {
    img.dataset.loaded = 'true';
  };
  img.onerror = () => {
    img.dataset.failed = 'true';
  };

  const filename = key.startsWith('mx_') ? `${key}.png` : `mx_${key}.png`;
  img.src = resolveAssetUrl(`assets/presets/ligamx/${filename}`);
  CREST_IMAGES_CACHE[key] = img;
  return img;
}

// Utilidad para aclarar/oscurecer colores hexadecimales
function adjustColor(hex, amount) {
  const clean = String(hex).replace('#', '');
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((parseInt(clean.slice(0, 2), 16) || 0) + amount);
  const g = clamp((parseInt(clean.slice(2, 4), 16) || 0) + amount);
  const b = clamp((parseInt(clean.slice(4, 6), 16) || 0) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function drawLigaMxGraphicMm(ctx, graphicId, wMm, hMm, design) {
  const halfW = wMm / 2;
  const halfH = hMm / 2;

  ctx.save();

  switch (graphicId) {
    // -------------------------------------------------------------
    // CLUB AMÉRICA: V Azteca Plumaje de Águila (Icono 90s/Actual)
    // -------------------------------------------------------------
    case 'mx_america_aztec_chevron': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#0b1b3d' || design.colorZones?.primary?.hex?.toLowerCase() === '#0a1a3a';
      const navy = isAway ? '#FFF0B5' : (design.colorZones?.secondary?.hex || '#0A1A3A');
      const red = '#C8102E';
      const blue = isAway ? '#C8102E' : '#003DA5';
      const yellow = isAway ? '#0A1A3A' : '#FFF0B5';
      const gold = '#F5A800';

      // 1. Hombrera superior en Azul Marino hasta el vértice V
      ctx.beginPath();
      ctx.moveTo(-halfW, -halfH);
      ctx.lineTo(halfW, -halfH);
      ctx.lineTo(halfW, -halfH * 0.15);
      ctx.lineTo(0, halfH * 0.45);
      ctx.lineTo(-halfW, -halfH * 0.15);
      ctx.closePath();
      ctx.fillStyle = navy;
      ctx.fill();

      // 2. Hilera 1 de Triángulos Aztecas (Rojo Carmesí)
      const count = 9;
      for (let i = 0; i < count; i++) {
        const t0 = i / count;
        const t1 = (i + 1) / count;

        // Brazo izquierdo (de -halfW a 0)
        const lx0 = -halfW + t0 * halfW;
        const ly0 = -halfH * 0.15 + t0 * (halfH * 0.6);
        const lx1 = -halfW + t1 * halfW;
        const ly1 = -halfH * 0.15 + t1 * (halfH * 0.6);
        const lmidX = (lx0 + lx1) / 2;
        const lmidY = (ly0 + ly1) / 2 + 22;

        ctx.beginPath();
        ctx.moveTo(lx0, ly0);
        ctx.lineTo(lx1, ly1);
        ctx.lineTo(lmidX, lmidY);
        ctx.closePath();
        ctx.fillStyle = red;
        ctx.fill();

        // Brazo derecho (de 0 a halfW)
        const rx0 = t0 * halfW;
        const ry0 = halfH * 0.45 - t0 * (halfH * 0.6);
        const rx1 = t1 * halfW;
        const ry1 = halfH * 0.45 - t1 * (halfH * 0.6);
        const rmidX = (rx0 + rx1) / 2;
        const rmidY = (ry0 + ry1) / 2 + 22;

        ctx.beginPath();
        ctx.moveTo(rx0, ry0);
        ctx.lineTo(rx1, ry1);
        ctx.lineTo(rmidX, rmidY);
        ctx.closePath();
        ctx.fillStyle = red;
        ctx.fill();
      }

      // 3. Hilera 2 de Triángulos Aztecas (Azul Rey)
      for (let i = 0; i < count; i++) {
        const t0 = i / count;
        const t1 = (i + 1) / count;

        const lx0 = -halfW + t0 * halfW;
        const ly0 = -halfH * 0.15 + t0 * (halfH * 0.6) + 12;
        const lx1 = -halfW + t1 * halfW;
        const ly1 = -halfH * 0.15 + t1 * (halfH * 0.6) + 12;
        const lmidX = (lx0 + lx1) / 2;
        const lmidY = (ly0 + ly1) / 2 + 18;

        ctx.beginPath();
        ctx.moveTo(lx0, ly0);
        ctx.lineTo(lx1, ly1);
        ctx.lineTo(lmidX, lmidY);
        ctx.closePath();
        ctx.fillStyle = blue;
        ctx.fill();

        const rx0 = t0 * halfW;
        const ry0 = halfH * 0.45 - t0 * (halfH * 0.6) + 12;
        const rx1 = t1 * halfW;
        const ry1 = halfH * 0.45 - t1 * (halfH * 0.6) + 12;
        const rmidX = (rx0 + rx1) / 2;
        const rmidY = (ry0 + ry1) / 2 + 18;

        ctx.beginPath();
        ctx.moveTo(rx0, ry0);
        ctx.lineTo(rx1, ry1);
        ctx.lineTo(rmidX, rmidY);
        ctx.closePath();
        ctx.fillStyle = blue;
        ctx.fill();
      }

      // 4. Hilera 3 de Rombitos / Dientes Dorados en el borde interior
      for (let i = 0; i < count; i++) {
        const t0 = (i + 0.5) / count;
        const lx = -halfW + t0 * halfW;
        const ly = -halfH * 0.15 + t0 * (halfH * 0.6) + 24;
        const rx = t0 * halfW;
        const ry = halfH * 0.45 - t0 * (halfH * 0.6) + 24;

        [lx, rx].forEach((cx, idx) => {
          const cy = idx === 0 ? ly : ry;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 6);
          ctx.lineTo(cx + 6, cy);
          ctx.lineTo(cx, cy + 6);
          ctx.lineTo(cx - 6, cy);
          ctx.closePath();
          ctx.fillStyle = gold;
          ctx.fill();
        });
      }

      // Rombo central en la punta del pecho
      ctx.beginPath();
      ctx.moveTo(0, halfH * 0.45 + 14);
      ctx.lineTo(16, halfH * 0.45 + 32);
      ctx.lineTo(0, halfH * 0.45 + 50);
      ctx.lineTo(-16, halfH * 0.45 + 32);
      ctx.closePath();
      ctx.fillStyle = red;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = gold;
      ctx.stroke();
      break;
    }

    // -------------------------------------------------------------
    // PUMAS UNAM: Silueta Gigante de la Cabeza Felina en Oro
    // -------------------------------------------------------------
    case 'mx_pumas_giant_feline': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#c5a059';
      const gold = isAway ? '#0B1B3D' : (design.colorZones?.secondary?.hex || '#C5A059');
      const goldLight = isAway ? '#1E293B' : '#E2C889';
      const goldDark = isAway ? '#050B14' : '#967431';
      const navy = isAway ? '#C5A059' : (design.colorZones?.primary?.hex || '#0B1B3D');

      // El contorno redondeado del puma es una cabeza felina estilizada inscrita en un triángulo
      const scale = Math.min(wMm, hMm) / 300;

      ctx.beginPath();
      // Vértice superior oreja izquierda
      ctx.moveTo(-70 * scale, -115 * scale);
      // Arco superior entre orejas
      ctx.bezierCurveTo(-35 * scale, -95 * scale, 35 * scale, -95 * scale, 70 * scale, -115 * scale);
      // Oreja derecha exterior
      ctx.bezierCurveTo(115 * scale, -100 * scale, 125 * scale, -50 * scale, 115 * scale, 0);
      // Quijada derecha
      ctx.bezierCurveTo(105 * scale, 55 * scale, 55 * scale, 110 * scale, 0, 125 * scale);
      // Quijada izquierda
      ctx.bezierCurveTo(-55 * scale, 110 * scale, -105 * scale, 55 * scale, -115 * scale, 0);
      // Oreja izquierda exterior
      ctx.bezierCurveTo(-125 * scale, -50 * scale, -115 * scale, -100 * scale, -70 * scale, -115 * scale);
      ctx.closePath();

      // Relleno dorado
      ctx.fillStyle = gold;
      ctx.fill();

      // Borde doble con brillo metálico
      ctx.lineWidth = 6 * scale;
      ctx.strokeStyle = goldLight;
      ctx.stroke();

      // Ojos/cejas felinas caladas en azul marino universitario
      // Ojo izquierdo
      ctx.beginPath();
      ctx.moveTo(-52 * scale, -42 * scale);
      ctx.lineTo(-24 * scale, -22 * scale);
      ctx.lineTo(-50 * scale, -10 * scale);
      ctx.closePath();
      ctx.fillStyle = navy;
      ctx.fill();

      // Ojo derecho
      ctx.beginPath();
      ctx.moveTo(52 * scale, -42 * scale);
      ctx.lineTo(24 * scale, -22 * scale);
      ctx.lineTo(50 * scale, -10 * scale);
      ctx.closePath();
      ctx.fillStyle = navy;
      ctx.fill();

      // Nariz triangular estilizada
      ctx.beginPath();
      ctx.moveTo(0, -6 * scale);
      ctx.lineTo(22 * scale, 24 * scale);
      ctx.lineTo(0, 48 * scale);
      ctx.lineTo(-22 * scale, 24 * scale);
      ctx.closePath();
      ctx.fillStyle = navy;
      ctx.fill();

      // Hendiduras de los bigotes/mandíbula
      ctx.beginPath();
      ctx.moveTo(-60 * scale, 18 * scale);
      ctx.lineTo(-28 * scale, 35 * scale);
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = navy;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(60 * scale, 18 * scale);
      ctx.lineTo(28 * scale, 35 * scale);
      ctx.lineWidth = 4 * scale;
      ctx.strokeStyle = navy;
      ctx.stroke();
      break;
    }

    // -------------------------------------------------------------
    // TIGRES UANL: Franja Horizontal Pecho Azul Rey con Vivos Blancos
    // -------------------------------------------------------------
    case 'mx_tigres_chest_bar': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#0033a0';
      const blue = isAway ? '#FFC72C' : (design.colorZones?.secondary?.hex || '#0033A0');
      const gold = isAway ? '#0033A0' : (design.colorZones?.primary?.hex || '#FFC72C');
      const white = '#FFFFFF';

      // Banda horizontal completa
      ctx.fillStyle = blue;
      ctx.fillRect(-halfW, -halfH, wMm, hMm);

      // Ribete superior blanco con pinstripe dorado
      ctx.fillStyle = white;
      ctx.fillRect(-halfW, -halfH, wMm, 4.5);
      ctx.fillStyle = gold;
      ctx.fillRect(-halfW, -halfH + 4.5, wMm, 2.5);

      // Ribete inferior blanco con pinstripe dorado
      ctx.fillStyle = gold;
      ctx.fillRect(-halfW, halfH - 7, wMm, 2.5);
      ctx.fillStyle = white;
      ctx.fillRect(-halfW, halfH - 4.5, wMm, 4.5);

      // Tipografía central estilizada "TIGRES" en bloques dorados
      ctx.fillStyle = gold;
      ctx.font = `900 ${hMm * 0.44}px 'Chakra Petch', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '6px';
      ctx.fillText('T I G R E S', 0, 1);

      // Marcas de garras en los extremos (3 rasguños estilizados a cada lado)
      [-halfW * 0.72, halfW * 0.72].forEach((sideX) => {
        ctx.save();
        ctx.translate(sideX, 0);
        [-12, 0, 12].forEach((offsetY, idx) => {
          ctx.beginPath();
          ctx.moveTo(-18 + idx * 4, offsetY - 10);
          ctx.lineTo(18 - idx * 4, offsetY + 10);
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = gold;
          ctx.stroke();
        });
        ctx.restore();
      });
      break;
    }

    // -------------------------------------------------------------
    // PUEBLA: La Franja Diagonal Real Azul Cobalto
    // -------------------------------------------------------------
    case 'mx_puebla_franja_sash': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#003da5';
      const sashBlue = isAway ? '#FFFFFF' : (design.colorZones?.secondary?.hex || '#003DA5');
      const sashLight = isAway ? '#E2E8F0' : '#1E5BBF';
      const white = isAway ? '#003DA5' : '#FFFFFF';

      ctx.save();
      // Rotar -32 grados para el ángulo diagonal perfecto del hombro derecho a la cadera izquierda
      ctx.rotate((-32 * Math.PI) / 180);

      const sashWidth = 118; // mm
      const sashLen = Math.hypot(wMm, hMm) * 1.4;

      // Franja principal azul
      ctx.fillStyle = sashBlue;
      ctx.fillRect(-sashLen / 2, -sashWidth / 2, sashLen, sashWidth);

      // Filetes blancos en los bordes de la franja
      ctx.fillStyle = white;
      ctx.fillRect(-sashLen / 2, -sashWidth / 2, sashLen, 4.5);
      ctx.fillRect(-sashLen / 2, sashWidth / 2 - 4.5, sashLen, 4.5);

      // Marca de agua geométrica interna (rombitos repetidos a lo largo de la franja)
      ctx.fillStyle = sashLight;
      for (let x = -sashLen / 2 + 30; x < sashLen / 2; x += 44) {
        ctx.beginPath();
        ctx.moveTo(x, -sashWidth * 0.28);
        ctx.lineTo(x + 14, 0);
        ctx.lineTo(x, sashWidth * 0.28);
        ctx.lineTo(x - 14, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      break;
    }

    // -------------------------------------------------------------
    // ATLAS FC: División 50/50 Roja y Negra
    // -------------------------------------------------------------
    case 'mx_atlas_half_split': {
      const red = '#BA0C2F';
      const black = '#0A0A0A';

      // Mitad derecha roja
      ctx.fillStyle = red;
      ctx.fillRect(-halfW, -halfH, halfW, hMm);

      // Mitad izquierda negra
      ctx.fillStyle = black;
      ctx.fillRect(0, -halfH, halfW, hMm);

      // Línea divisoria central con textura sutil
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(-1.5, -halfH, 3, hMm);
      break;
    }

    // -------------------------------------------------------------
    // FC JUÁREZ: "X" Gigante Geométrica Verde Neón / Rojo / Negro
    // -------------------------------------------------------------
    case 'mx_juarez_x_slash': {
      const red = '#C8102E';
      const black = '#111111';
      const neon = '#7ED957';

      const strokeW = 48; // mm

      // Brazo 1 de la X (negro con filete neón)
      ctx.save();
      ctx.rotate((38 * Math.PI) / 180);
      ctx.fillStyle = black;
      ctx.fillRect(-wMm, -strokeW / 2, wMm * 2, strokeW);
      ctx.fillStyle = neon;
      ctx.fillRect(-wMm, -strokeW / 2, wMm * 2, 4);
      ctx.fillRect(-wMm, strokeW / 2 - 4, wMm * 2, 4);
      ctx.restore();

      // Brazo 2 de la X (rojo con filete neón)
      ctx.save();
      ctx.rotate((-38 * Math.PI) / 180);
      ctx.fillStyle = red;
      ctx.fillRect(-wMm, -strokeW / 2, wMm * 2, strokeW);
      ctx.fillStyle = neon;
      ctx.fillRect(-wMm, -strokeW / 2, wMm * 2, 4);
      ctx.fillRect(-wMm, strokeW / 2 - 4, wMm * 2, 4);
      ctx.restore();
      break;
    }

    // -------------------------------------------------------------
    // TOLUCA: Llamas Geométricas Sublimadas
    // -------------------------------------------------------------
    case 'mx_toluca_demon_flame': {
      const darkRed = '#8B0000';
      ctx.fillStyle = darkRed;
      ctx.globalAlpha = 0.35;

      for (let y = -halfH; y < halfH; y += 40) {
        ctx.beginPath();
        ctx.moveTo(-halfW, y);
        for (let x = -halfW; x <= halfW; x += 30) {
          ctx.lineTo(x + 15, y - 24);
          ctx.lineTo(x + 30, y);
        }
        ctx.lineTo(halfW, y + 20);
        ctx.lineTo(-halfW, y + 20);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    // -------------------------------------------------------------
    // TIJUANA XOLOS: Zarpazo / Rayas de Garras Rojas y Negras
    // -------------------------------------------------------------
    case 'mx_xolos_claws': {
      const red = '#C8102E';
      const black = '#111111';

      ctx.fillStyle = red;
      ctx.beginPath();
      ctx.moveTo(-halfW, halfH * 0.2);
      ctx.lineTo(-halfW * 0.3, -halfH * 0.4);
      ctx.lineTo(0, -halfH * 0.2);
      ctx.lineTo(halfW * 0.4, -halfH * 0.5);
      ctx.lineTo(halfW, halfH * 0.3);
      ctx.lineTo(halfW, halfH);
      ctx.lineTo(-halfW, halfH);
      ctx.closePath();
      ctx.fill();

      // Garras rasgadas
      [-60, 0, 60].forEach((ox) => {
        ctx.beginPath();
        ctx.moveTo(ox - 10, -halfH * 0.1);
        ctx.lineTo(ox + 8, halfH * 0.35);
        ctx.lineTo(ox + 2, halfH * 0.35);
        ctx.lineTo(ox - 16, -halfH * 0.1);
        ctx.closePath();
        ctx.fillStyle = black;
        ctx.fill();
      });
      break;
    }

    // -------------------------------------------------------------
    // CHIVAS: 5 Franjas Verticales Rojas y 4 Blancas
    // -------------------------------------------------------------
    case 'mx_chivas_stripes': {
      const red = '#C8102E';
      const white = '#FFFFFF';
      const stripeCount = 9;
      const stripeW = wMm / stripeCount;

      for (let i = 0; i < stripeCount; i++) {
        const x = -halfW + i * stripeW;
        ctx.fillStyle = i % 2 === 0 ? red : white;
        ctx.fillRect(x, -halfH, stripeW + 0.5, hMm);
      }
      break;
    }

    // -------------------------------------------------------------
    // RAYADOS: Franjas Verticales Azul Marino y Blanco
    // -------------------------------------------------------------
    case 'mx_rayados_stripes': {
      const navy = '#001A49';
      const white = '#FFFFFF';
      // Fondo blanco
      ctx.fillStyle = white;
      ctx.fillRect(-halfW, -halfH, wMm, hMm);

      // 3 franjas anchas azul marino (central y dos laterales)
      const barW = wMm * 0.16;
      [-wMm * 0.32, 0, wMm * 0.32].forEach((cx) => {
        ctx.fillStyle = navy;
        ctx.fillRect(cx - barW / 2, -halfH, barW, hMm);
      });
      break;
    }

    // -------------------------------------------------------------
    // SANTOS LAGUNA: Franjas Horizontales Verdes y Blancas
    // -------------------------------------------------------------
    case 'mx_santos_hoops': {
      const green = '#007A33';
      const white = '#FFFFFF';
      const hoopCount = 7;
      const hoopH = hMm / hoopCount;

      for (let i = 0; i < hoopCount; i++) {
        const y = -halfH + i * hoopH;
        ctx.fillStyle = i % 2 === 0 ? green : white;
        ctx.fillRect(-halfW, y, wMm, hoopH + 0.5);
      }
      break;
    }

    // -------------------------------------------------------------
    // PACHUCA: Franjas Verticales Azul Marino y Blanco Plata
    // -------------------------------------------------------------
    case 'mx_pachuca_stripes': {
      const navy = '#0B1B3D';
      const silver = '#FFFFFF';
      const count = 7;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        const x = -halfW + i * sw;
        ctx.fillStyle = i % 2 === 0 ? navy : silver;
        ctx.fillRect(x, -halfH, sw + 0.5, hMm);
      }
      break;
    }

    // -------------------------------------------------------------
    // NECAXA: Franjas Rojas y Blancas con Rayos
    // -------------------------------------------------------------
    case 'mx_necaxa_stripes': {
      const red = '#C8102E';
      const white = '#FFFFFF';
      const count = 7;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        const x = -halfW + i * sw;
        ctx.fillStyle = i % 2 === 0 ? red : white;
        ctx.fillRect(x, -halfH, sw + 0.5, hMm);
      }

      // Rayo zig-zag sutil en el pecho
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.6, -halfH * 0.2);
      ctx.lineTo(-halfW * 0.1, -halfH * 0.05);
      ctx.lineTo(-halfW * 0.3, 0);
      ctx.lineTo(halfW * 0.2, halfH * 0.3);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#FFC72C';
      ctx.stroke();
      break;
    }

    // -------------------------------------------------------------
    // QUERÉTARO: Franjas Azul y Negro con Filetes Blancos
    // -------------------------------------------------------------
    case 'mx_queretaro_stripes': {
      const blue = '#003DA5';
      const black = '#0A0A0A';
      const white = '#FFFFFF';
      const count = 6;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        const x = -halfW + i * sw;
        ctx.fillStyle = i % 2 === 0 ? blue : black;
        ctx.fillRect(x, -halfH, sw, hMm);
        ctx.fillStyle = white;
        ctx.fillRect(x, -halfH, 2.5, hMm);
      }
      break;
    }

    // -------------------------------------------------------------
    // SAN LUIS: Franjas Rojiblancas con Remates Azules
    // -------------------------------------------------------------
    case 'mx_san_luis_stripes': {
      const red = '#C8102E';
      const white = '#FFFFFF';
      const count = 7;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        const x = -halfW + i * sw;
        ctx.fillStyle = i % 2 === 0 ? red : white;
        ctx.fillRect(x, -halfH, sw + 0.5, hMm);
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Dibuja los 18 Escudos / Crests Oficiales de los Clubes de la Liga MX en coordenadas físicas milimétricas.
 * Son réplicas heráldicas 100% vectoriales, limpias y libres de logotipos de terceros fabricantes.
 */
export function drawLigaMxCrestMm(ctx, clubId, wMm, hMm, design) {
  const r = Math.min(wMm, hMm) / 2;
  ctx.save();

  // 1. Intentar renderizar el logotipo oficial en alta resolución si está cargado
  const crestImg = getOrLoadCrestImage(clubId);
  if (crestImg && crestImg.dataset?.loaded === 'true') {
    ctx.drawImage(crestImg, -wMm / 2, -hMm / 2, wMm, hMm);
    ctx.restore();
    return;
  }

  switch (clubId) {
    // 1. AMÉRICA
    case 'mx_america': {
      // Círculo exterior amarillo crema con ribete azul marino
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF0B5';
      ctx.fill();
      ctx.lineWidth = r * 0.14;
      ctx.strokeStyle = '#0B1B3D';
      ctx.stroke();

      // Silueta simplificada del continente americano en azul marino
      ctx.fillStyle = '#003DA5';
      ctx.beginPath();
      // Norteamérica
      ctx.moveTo(-r * 0.24, -r * 0.55);
      ctx.lineTo(r * 0.14, -r * 0.52);
      ctx.lineTo(r * 0.22, -r * 0.2);
      ctx.lineTo(0, -r * 0.05);
      // Centroamérica
      ctx.lineTo(-r * 0.04, r * 0.08);
      // Sudamérica
      ctx.lineTo(r * 0.28, r * 0.22);
      ctx.lineTo(r * 0.18, r * 0.6);
      ctx.lineTo(0, r * 0.72);
      ctx.lineTo(-r * 0.14, r * 0.3);
      ctx.closePath();
      ctx.fill();

      // Iniciales entrelazadas "C A" en rojo carmesí
      ctx.fillStyle = '#C8102E';
      ctx.font = `900 ${r * 0.64}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CA', 0, 1);
      break;
    }

    // 2. CHIVAS GUADALAJARA
    case 'mx_chivas': {
      // Escudo con corona y rayas rojiblancas
      // Corona superior
      ctx.fillStyle = '#FFC72C';
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.62);
      ctx.lineTo(-r * 0.65, -r * 0.9);
      ctx.lineTo(-r * 0.2, -r * 0.75);
      ctx.lineTo(0, -r * 0.95);
      ctx.lineTo(r * 0.2, -r * 0.75);
      ctx.lineTo(r * 0.65, -r * 0.9);
      ctx.lineTo(r * 0.5, -r * 0.62);
      ctx.closePath();
      ctx.fill();

      // Escudo principal
      ctx.beginPath();
      ctx.moveTo(-r * 0.75, -r * 0.6);
      ctx.lineTo(r * 0.75, -r * 0.6);
      ctx.lineTo(r * 0.75, r * 0.2);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.75, r * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = r * 0.1;
      ctx.strokeStyle = '#0B1B3D';
      ctx.stroke();

      // Rayas rojas verticales (5 rayas)
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#C8102E';
      const stripeW = (r * 1.5) / 5;
      [-2, 0, 2].forEach((idx) => {
        ctx.fillRect(idx * stripeW - stripeW / 2, -r * 0.6, stripeW, r * 1.6);
      });
      ctx.restore();

      // 12 Estrellas miniatura doradas en arco inferior
      ctx.fillStyle = '#FFC72C';
      for (let s = 0; s < 7; s++) {
        const ang = (Math.PI / 8) * (s + 0.5) + Math.PI / 8;
        const sx = Math.cos(ang) * (r * 0.82);
        const sy = Math.sin(ang) * (r * 0.82);
        ctx.beginPath();
        ctx.arc(sx, sy, r * 0.055, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    // 3. CRUZ AZUL
    case 'mx_cruz_azul': {
      // Círculo exterior azul y blanco
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
      ctx.fillStyle = '#00509D';
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Aro blanco interno
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.76, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Cuadrado rojo central
      const sq = r * 0.75;
      ctx.fillStyle = '#C8102E';
      ctx.fillRect(-sq / 2, -sq / 2, sq, sq);

      // Cruz blanca/azul en el centro del cuadrado
      const cw = sq * 0.28;
      ctx.fillStyle = '#00509D';
      ctx.fillRect(-cw / 2, -sq * 0.42, cw, sq * 0.84);
      ctx.fillRect(-sq * 0.42, -cw / 2, sq * 0.84, cw);
      break;
    }

    // 4. PUMAS UNAM
    case 'mx_pumas': {
      // Triángulo UNAM azul marino con ribete dorado
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.92);
      ctx.lineTo(r * 0.88, r * 0.72);
      ctx.lineTo(-r * 0.88, r * 0.72);
      ctx.closePath();
      ctx.fillStyle = '#0B1B3D';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#C5A059';
      ctx.stroke();

      // Miniatura del Puma dorado al centro
      ctx.beginPath();
      ctx.moveTo(-r * 0.32, -r * 0.35);
      ctx.bezierCurveTo(-r * 0.15, -r * 0.28, r * 0.15, -r * 0.28, r * 0.32, -r * 0.35);
      ctx.bezierCurveTo(r * 0.5, -r * 0.25, r * 0.48, 0, r * 0.38, r * 0.22);
      ctx.bezierCurveTo(r * 0.25, r * 0.44, 0, r * 0.52, 0, r * 0.52);
      ctx.bezierCurveTo(0, r * 0.52, -r * 0.25, r * 0.44, -r * 0.38, r * 0.22);
      ctx.bezierCurveTo(-r * 0.48, 0, -r * 0.5, -r * 0.25, -r * 0.32, -r * 0.35);
      ctx.closePath();
      ctx.fillStyle = '#C5A059';
      ctx.fill();
      break;
    }

    // 5. TIGRES UANL
    case 'mx_tigres': {
      // Escudo azul y oro
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.2);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#0033A0';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#FFC72C';
      ctx.stroke();

      // Letra "U" y Tigre estilizado en oro
      ctx.fillStyle = '#FFC72C';
      ctx.font = `900 ${r * 0.88}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('U', 0, 4);
      break;
    }

    // 6. RAYADOS DE MONTERREY
    case 'mx_rayados': {
      // Escudo con rayas azules y blancas, y la "M"
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.25);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.25);
      ctx.closePath();
      ctx.fillStyle = '#001A49';
      ctx.fill();
      ctx.lineWidth = r * 0.1;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Rayas blancas verticales
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-r * 0.5, -r, r * 0.24, r * 2);
      ctx.fillRect(r * 0.26, -r, r * 0.24, r * 2);
      ctx.restore();

      // Letra "M" estilizada en el centro
      ctx.fillStyle = '#001A49';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = r * 0.08;
      ctx.font = `900 ${r * 0.8}px 'Chakra Petch', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText('M', 0, 2);
      ctx.fillText('M', 0, 2);
      break;
    }

    // 7. ATLAS FC
    case 'mx_atlas': {
      // Escudo dividido 50/50 rojo y negro con la "A" gótica
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.25);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.25);
      ctx.closePath();
      ctx.save();
      ctx.clip();

      // Mitad derecha roja, mitad izquierda negra
      ctx.fillStyle = '#BA0C2F';
      ctx.fillRect(-r, -r, r, r * 2);
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, -r, r, r * 2);
      ctx.restore();

      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Letra "A" blanca estilizada
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${r * 0.92}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('A', 0, 4);

      // 3 Estrellas superiores
      ctx.fillStyle = '#FFC72C';
      [-r * 0.38, 0, r * 0.38].forEach((sx) => {
        ctx.beginPath();
        ctx.arc(sx, -r * 0.9, r * 0.065, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    // 8. PUEBLA
    case 'mx_puebla': {
      // Escudo del ángel y catedral de Puebla
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#003DA5';
      ctx.stroke();

      // Franja diagonal en el escudo
      ctx.save();
      ctx.clip();
      ctx.rotate((-32 * Math.PI) / 180);
      ctx.fillStyle = '#003DA5';
      ctx.fillRect(-r * 1.5, -r * 0.35, r * 3, r * 0.7);
      ctx.restore();

      // Alas del Ángel doradas
      ctx.fillStyle = '#FFC72C';
      ctx.font = `900 ${r * 0.65}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PUE', 0, 2);
      break;
    }

    // 9. SANTOS LAGUNA
    case 'mx_santos': {
      // Escudo con corona y balón
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.78, 0, Math.PI * 2);
      ctx.fillStyle = '#007A33';
      ctx.fill();
      ctx.lineWidth = r * 0.1;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Rayas blancas horizontales
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-r, -r * 0.2, r * 2, r * 0.22);
      ctx.fillRect(-r, r * 0.25, r * 2, r * 0.22);
      ctx.restore();

      // Corona dorada arriba
      ctx.fillStyle = '#FFC72C';
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, -r * 0.58);
      ctx.lineTo(-r * 0.6, -r * 0.88);
      ctx.lineTo(-r * 0.2, -r * 0.75);
      ctx.lineTo(0, -r * 0.95);
      ctx.lineTo(r * 0.2, -r * 0.75);
      ctx.lineTo(r * 0.6, -r * 0.88);
      ctx.lineTo(r * 0.45, -r * 0.58);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // 10. TOLUCA
    case 'mx_toluca': {
      // Escudo ovalado rojo con monograma CDT
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.78, r * 0.92, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#C8102E';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Monograma blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${r * 0.65}px 'Chakra Petch', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CDT', 0, 2);
      break;
    }

    // 11. CLUB LEÓN
    case 'mx_leon': {
      // Escudo verde esmeralda con león rampante
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.25);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.25);
      ctx.closePath();
      ctx.fillStyle = '#006341';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#FFC72C';
      ctx.stroke();

      // Silueta león / letras LEÓN
      ctx.fillStyle = '#FFC72C';
      ctx.font = `900 ${r * 0.62}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LEÓN', 0, 2);
      break;
    }

    // 12. PACHUCA
    case 'mx_pachuca': {
      // Escudo con rayas azul marino y plata
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.25);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.25);
      ctx.closePath();
      ctx.fillStyle = '#0B1B3D';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#D1D5DB';
      ctx.stroke();

      // Rayas verticales plateadas
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#FFFFFF';
      [-0.45, 0.15].forEach((pos) => {
        ctx.fillRect(r * pos, -r, r * 0.28, r * 2);
      });
      ctx.restore();

      ctx.fillStyle = '#FFC72C';
      ctx.font = `900 ${r * 0.55}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TUZOS', 0, 2);
      break;
    }

    // 13. NECAXA
    case 'mx_necaxa': {
      // Escudo de rayas rojas con rayos
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.25);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.25);
      ctx.closePath();
      ctx.fillStyle = '#C8102E';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Letra "N" con rayo
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${r * 0.85}px 'Chakra Petch', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('N', 0, 2);
      break;
    }

    // 14. QUERÉTARO
    case 'mx_queretaro': {
      // Escudo azul y negro
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.25);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.25);
      ctx.closePath();
      ctx.fillStyle = '#003DA5';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${r * 0.58}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('GALLOS', 0, 2);
      break;
    }

    // 15. ATLÉTICO DE SAN LUIS
    case 'mx_san_luis': {
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.25);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.25);
      ctx.closePath();
      ctx.fillStyle = '#C8102E';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#003DA5';
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${r * 0.65}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ADSL', 0, 2);
      break;
    }

    // 16. TIJUANA XOLOS
    case 'mx_xolos': {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      ctx.fillStyle = '#C8102E';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#0A0A0A';
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${r * 0.58}px 'Chakra Petch', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('XOLOS', 0, 2);
      break;
    }

    // 17. FC JUÁREZ
    case 'mx_juarez': {
      ctx.beginPath();
      ctx.moveTo(-r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, -r * 0.75);
      ctx.lineTo(r * 0.78, r * 0.25);
      ctx.quadraticCurveTo(r * 0.45, r * 0.72, 0, r * 0.95);
      ctx.quadraticCurveTo(-r * 0.45, r * 0.72, -r * 0.78, r * 0.25);
      ctx.closePath();
      ctx.fillStyle = '#7ED957';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#C8102E';
      ctx.stroke();

      ctx.fillStyle = '#0A0A0A';
      ctx.font = `900 ${r * 0.54}px 'Chakra Petch', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BRAVOS', 0, 2);
      break;
    }

    // 18. MAZATLÁN FC
    case 'mx_mazatlan': {
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      ctx.fillStyle = '#4B0082';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#00F5D4';
      ctx.stroke();

      ctx.fillStyle = '#00F5D4';
      ctx.font = `900 ${r * 0.54}px 'Bebas Neue', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('MZT', 0, 2);
      break;
    }

    // -------------------------------------------------------------
    // CHIVAS: 5 Franjas Verticales Rojas y 4 Blancas
    // -------------------------------------------------------------
    case 'mx_chivas_stripes': {
      const red = '#C8102E';
      const white = '#FFFFFF';
      const stripeCount = 9;
      const stripeW = wMm / stripeCount;

      for (let i = 0; i < stripeCount; i++) {
        const x = -halfW + i * stripeW;
        ctx.fillStyle = i % 2 === 0 ? red : white;
        ctx.fillRect(x, -halfH, stripeW + 0.5, hMm);
      }
      break;
    }

    // -------------------------------------------------------------
    // RAYADOS: Franjas Verticales Azul Marino y Blanco
    // -------------------------------------------------------------
    case 'mx_rayados_stripes': {
      const navy = '#001A49';
      const white = '#FFFFFF';
      // Fondo blanco
      ctx.fillStyle = white;
      ctx.fillRect(-halfW, -halfH, wMm, hMm);

      // 3 franjas anchas azul marino (central y dos laterales)
      const barW = wMm * 0.16;
      [-wMm * 0.32, 0, wMm * 0.32].forEach((cx) => {
        ctx.fillStyle = navy;
        ctx.fillRect(cx - barW / 2, -halfH, barW, hMm);
      });
      break;
    }

    // -------------------------------------------------------------
    // SANTOS LAGUNA: Franjas Horizontales Verdes y Blancas
    // -------------------------------------------------------------
    case 'mx_santos_hoops': {
      const green = '#007A33';
      const white = '#FFFFFF';
      const hoopCount = 7;
      const hoopH = hMm / hoopCount;

      for (let i = 0; i < hoopCount; i++) {
        const y = -halfH + i * hoopH;
        ctx.fillStyle = i % 2 === 0 ? green : white;
        ctx.fillRect(-halfW, y, wMm, hoopH + 0.5);
      }
      break;
    }

    // -------------------------------------------------------------
    // PACHUCA: Franjas Verticales Azul Marino y Blanco Plata
    // -------------------------------------------------------------
    case 'mx_pachuca_stripes': {
      const navy = '#0B1B3D';
      const silver = '#FFFFFF';
      const count = 7;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        const x = -halfW + i * sw;
        ctx.fillStyle = i % 2 === 0 ? navy : silver;
        ctx.fillRect(x, -halfH, sw + 0.5, hMm);
      }
      break;
    }

    // -------------------------------------------------------------
    // NECAXA: Franjas Rojas y Blancas con Rayos
    // -------------------------------------------------------------
    case 'mx_necaxa_stripes': {
      const red = '#C8102E';
      const white = '#FFFFFF';
      const count = 7;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        const x = -halfW + i * sw;
        ctx.fillStyle = i % 2 === 0 ? red : white;
        ctx.fillRect(x, -halfH, sw + 0.5, hMm);
      }

      // Rayo zig-zag sutil en el pecho
      ctx.beginPath();
      ctx.moveTo(-halfW * 0.6, -halfH * 0.2);
      ctx.lineTo(-halfW * 0.1, -halfH * 0.05);
      ctx.lineTo(-halfW * 0.3, 0);
      ctx.lineTo(halfW * 0.2, halfH * 0.3);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#FFC72C';
      ctx.stroke();
      break;
    }

    // -------------------------------------------------------------
    // QUERÉTARO: Franjas Azul y Negro con Filetes Blancos
    // -------------------------------------------------------------
    case 'mx_queretaro_stripes': {
      const blue = '#003DA5';
      const black = '#0A0A0A';
      const white = '#FFFFFF';
      const count = 6;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        const x = -halfW + i * sw;
        ctx.fillStyle = i % 2 === 0 ? blue : black;
        ctx.fillRect(x, -halfH, sw, hMm);
        ctx.fillStyle = white;
        ctx.fillRect(x, -halfH, 2.5, hMm);
      }
      break;
    }

    // -------------------------------------------------------------
    // SAN LUIS: Franjas Rojiblancas con Remates Azules
    // -------------------------------------------------------------
    case 'mx_san_luis_stripes': {
      const red = '#C8102E';
      const white = '#FFFFFF';
      const count = 7;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        const x = -halfW + i * sw;
        ctx.fillStyle = i % 2 === 0 ? red : white;
        ctx.fillRect(x, -halfH, sw + 0.5, hMm);
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
}
