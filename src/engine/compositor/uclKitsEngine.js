/**
 * ATLETIQ Engine — UEFA Champions League Realistic Kits Vector Engine
 * 
 * Renderizado vectorial de alta fidelidad para los 12 clubes gigantes de la UEFA Champions League:
 * Real Madrid, Barcelona, Manchester City, Bayern Múnich, Paris Saint-Germain, Arsenal,
 * Liverpool, Inter de Milán, Juventus, Borussia Dortmund, Atlético de Madrid y AC Milan.
 * 
 * Recrea con exactitud matemática las franjas icónicas, hechter, mitades 50/50, escudos y detalles.
 */

import { resolveAssetUrl } from '../../utils/assetUrl';

// Cache global de logotipos oficiales en alta resolución de UEFA Champions League
const UCL_CREST_CACHE = {};

export function getOrLoadUclCrestImage(clubId) {
  if (typeof window === 'undefined') return null;
  if (!clubId) return null;

  const key = String(clubId).toLowerCase().trim();
  if (UCL_CREST_CACHE[key]) return UCL_CREST_CACHE[key];

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.dataset.loaded = 'false';
  img.onload = () => {
    img.dataset.loaded = 'true';
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atletiq:crest-loaded', { detail: { clubId: key, type: 'ucl' } }));
    }
  };
  img.onerror = () => {
    img.dataset.failed = 'true';
  };

  const filename = key.startsWith('ucl_') ? `${key}.png` : `ucl_${key}.png`;
  img.src = resolveAssetUrl(`assets/presets/ucl/${filename}`);
  UCL_CREST_CACHE[key] = img;
  return img;
}

export function preloadUclCrest(clubId) {
  return new Promise((resolve) => {
    const img = getOrLoadUclCrestImage(clubId);
    if (!img) return resolve(null);
    if (img.dataset?.loaded === 'true' || (img.complete && img.naturalWidth > 0)) {
      img.dataset.loaded = 'true';
      return resolve(img);
    }
    img.addEventListener('load', () => {
      img.dataset.loaded = 'true';
      resolve(img);
    }, { once: true });
    img.addEventListener('error', () => resolve(null), { once: true });
  });
}


export function drawUclGraphicMm(ctx, graphicId, wMm, hMm, design) {
  if (!ctx || !graphicId) return;

  const halfW = wMm / 2;
  const halfH = hMm / 2;

  ctx.save();

  switch (graphicId.toLowerCase()) {
    // =========================================================================
    // REAL MADRID: Textura sutil y ribetes en hombros / cuello
    // =========================================================================
    case 'ucl_real_madrid_stripes': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#ff6600' || design.colorZones?.primary?.hex?.toLowerCase() === '#ff7700';
      const stripeColor = isAway ? '#001A49' : '#0B1B3D';
      const gold = '#C5A059';

      // Tres finas líneas de hombro
      [-halfW * 0.42, 0, halfW * 0.42].forEach((x) => {
        ctx.fillStyle = isAway ? '#FFFFFF' : gold;
        ctx.fillRect(x - 1, -halfH, 2, 45);
      });
      break;
    }

    // =========================================================================
    // FC BARCELONA: 125 Años — División 50/50 Blaugrana
    // =========================================================================
    case 'ucl_barcelona_halves': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#111111' || design.colorZones?.primary?.hex?.toLowerCase() === '#000000';
      if (isAway) {
        // Visitante negro con degradado lateral blaugrana
        const gradL = ctx.createLinearGradient(-halfW, 0, -halfW * 0.6, 0);
        gradL.addColorStop(0, '#004D98');
        gradL.addColorStop(1, 'transparent');
        ctx.fillStyle = gradL;
        ctx.fillRect(-halfW, -halfH, halfW * 0.4, hMm);

        const gradR = ctx.createLinearGradient(halfW, 0, halfW * 0.6, 0);
        gradR.addColorStop(0, '#A50044');
        gradR.addColorStop(1, 'transparent');
        ctx.fillStyle = gradR;
        ctx.fillRect(halfW * 0.6, -halfH, halfW * 0.4, hMm);
      } else {
        // Mitad izquierda Azul, mitad derecha Grana
        ctx.fillStyle = '#004D98'; // Azul
        ctx.fillRect(-halfW, -halfH, halfW, hMm);

        ctx.fillStyle = '#A50044'; // Grana
        ctx.fillRect(0, -halfH, halfW, hMm);

        // Fina costura central dorada conmemorativa 125 años
        ctx.fillStyle = '#EDBB00';
        ctx.fillRect(-1, -halfH, 2, hMm);
      }
      break;
    }

    // =========================================================================
    // MANCHESTER CITY: Celeste puro con sutil detalle / Visitante Rayas Neón 1999
    // =========================================================================
    case 'ucl_man_city_stripes': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#001a49' || design.colorZones?.primary?.hex?.toLowerCase() === '#eef942';
      if (isAway) {
        // Franjas verticales amarillo neón y azul marino
        const stripeCount = 7;
        const sw = wMm / stripeCount;
        for (let i = 0; i < stripeCount; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#EEF942' : '#001A49';
          ctx.fillRect(-halfW + i * sw, -halfH, sw + 0.5, hMm);
        }
      } else {
        // Cuello con ribetes grafiti 0161
        ctx.fillStyle = '#001A49';
        ctx.fillRect(-halfW * 0.45, -halfH, wMm * 0.45, 12);
      }
      break;
    }

    // =========================================================================
    // BAYERN MÚNICH: Triple tono de rojo en franjas verticales
    // =========================================================================
    case 'ucl_bayern_stripes': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#111111' || design.colorZones?.primary?.hex?.toLowerCase() === '#000000';
      if (isAway) {
        // Gráficos turquesa/bronce estatua Bavaria
        ctx.fillStyle = '#00A896';
        ctx.fillRect(-halfW, -halfH * 0.2, wMm, 14);
      } else {
        const colors = ['#DC052D', '#8B0000', '#550000'];
        const count = 9;
        const sw = wMm / count;
        for (let i = 0; i < count; i++) {
          ctx.fillStyle = colors[i % 3];
          ctx.fillRect(-halfW + i * sw, -halfH, sw + 0.5, hMm);
        }
      }
      break;
    }

    // =========================================================================
    // PARIS SAINT-GERMAIN: Franja vertical central "Hechter"
    // =========================================================================
    case 'ucl_psg_hechter': {
      const isAway = design.colorZones?.primary?.hex?.toLowerCase() === '#ffffff';
      const red = '#DA291C';
      const white = isAway ? '#001C44' : '#FFFFFF';
      const hechterW = wMm * 0.28;

      // Franja roja central
      ctx.fillStyle = red;
      ctx.fillRect(-hechterW / 2, -halfH, hechterW, hMm);

      // Filetes blancos laterales
      const borderW = 5;
      ctx.fillStyle = white;
      ctx.fillRect(-hechterW / 2 - borderW, -halfH, borderW, hMm);
      ctx.fillRect(hechterW / 2, -halfH, borderW, hMm);
      break;
    }

    // =========================================================================
    // ARSENAL FC: Pecho rojo con mangas y costados blancos
    // =========================================================================
    case 'ucl_arsenal_cannon': {
      const red = '#DB0007';
      const white = '#FFFFFF';
      const navy = '#023474';

      // Cuerpo rojo ya está en el fondo, agregamos paneles blancos laterales
      ctx.fillStyle = white;
      ctx.fillRect(-halfW, -halfH, wMm * 0.12, hMm);
      ctx.fillRect(halfW - wMm * 0.12, -halfH, wMm * 0.12, hMm);

      // Filetes finos en azul marino
      ctx.fillStyle = navy;
      ctx.fillRect(-halfW + wMm * 0.12, -halfH, 3.5, hMm);
      ctx.fillRect(halfW - wMm * 0.12 - 3.5, -halfH, 3.5, hMm);
      break;
    }

    // =========================================================================
    // LIVERPOOL FC: Rojo profundo con pinstripes amarillos en V
    // =========================================================================
    case 'ucl_liverpool_pinstripes': {
      const gold = '#F6EB61';
      ctx.strokeStyle = gold;
      ctx.lineWidth = 1.6;
      ctx.globalAlpha = 0.85;

      const pCount = 7;
      const step = wMm / pCount;
      for (let i = 1; i < pCount; i++) {
        const x = -halfW + i * step;
        ctx.beginPath();
        ctx.moveTo(x, -halfH);
        ctx.lineTo(x, hMm * 0.45);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
      break;
    }

    // =========================================================================
    // INTER DE MILÁN: Franjas Nerazzurri Azul y Negro
    // =========================================================================
    case 'ucl_inter_stripes': {
      const blue = '#0057B8';
      const black = '#000000';
      const count = 9;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? blue : black;
        ctx.fillRect(-halfW + i * sw, -halfH, sw + 0.5, hMm);
      }
      break;
    }

    // =========================================================================
    // JUVENTUS: Franjas Bianconeri Blanco y Negro
    // =========================================================================
    case 'ucl_juventus_stripes': {
      const black = '#000000';
      const white = '#FFFFFF';
      const count = 7;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? white : black;
        ctx.fillRect(-halfW + i * sw, -halfH, sw + 0.5, hMm);
      }
      break;
    }

    // =========================================================================
    // BORUSSIA DORTMUND: Cyber Yellow con bloques negros retro
    // =========================================================================
    case 'ucl_dortmund_blocks': {
      const black = '#000000';
      // Franjas verticales negras solo en la mitad superior
      [-wMm * 0.32, -wMm * 0.11, wMm * 0.11, wMm * 0.32].forEach((x) => {
        ctx.fillStyle = black;
        ctx.fillRect(x - 14, -halfH, 28, hMm * 0.5);
      });
      break;
    }

    // =========================================================================
    // ATLÉTICO DE MADRID: Rayas Rojiblancas con degradado central
    // =========================================================================
    case 'ucl_atletico_stripes': {
      const red = '#CB3524';
      const white = '#FFFFFF';
      const count = 7;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? red : white;
        ctx.fillRect(-halfW + i * sw, -halfH, sw + 0.5, hMm);
      }
      break;
    }

    // =========================================================================
    // AC MILAN: Franjas Rossoneri Rojas y Negras
    // =========================================================================
    case 'ucl_milan_stripes': {
      const red = '#FB090B';
      const black = '#000000';
      const count = 9;
      const sw = wMm / count;
      for (let i = 0; i < count; i++) {
        ctx.fillStyle = i % 2 === 0 ? red : black;
        ctx.fillRect(-halfW + i * sw, -halfH, sw + 0.5, hMm);
      }
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Dibuja los 12 Escudos Oficiales Vectoriales de los Clubes de la Champions League
 */
export function drawUclCrestMm(ctx, clubId, wMm, hMm, design) {
  if (!ctx || !clubId) return;

  const r = Math.min(wMm, hMm) / 2;
  ctx.save();

  // 1. Intentar renderizar el logotipo oficial en alta resolución si está cargado
  const crestImg = getOrLoadUclCrestImage(clubId);
  if (crestImg && crestImg.dataset?.loaded === 'true') {
    ctx.drawImage(crestImg, -wMm / 2, -hMm / 2, wMm, hMm);
    ctx.restore();
    return;
  }

  switch (clubId.toLowerCase()) {
    // 1. REAL MADRID
    case 'ucl_real_madrid': {
      // Corona dorada arriba
      ctx.fillStyle = '#C5A059';
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.55);
      ctx.lineTo(-r * 0.65, -r * 0.95);
      ctx.lineTo(-r * 0.22, -r * 0.72);
      ctx.lineTo(0, -r * 1.05);
      ctx.lineTo(r * 0.22, -r * 0.72);
      ctx.lineTo(r * 0.65, -r * 0.95);
      ctx.lineTo(r * 0.5, -r * 0.55);
      ctx.closePath();
      ctx.fill();

      // Círculo del escudo
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.82, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = r * 0.1;
      ctx.strokeStyle = '#C5A059';
      ctx.stroke();

      // Banda diagonal morada/azul
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.78, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#5A3D8A';
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.8);
      ctx.lineTo(r * 0.8, r * 0.8);
      ctx.lineTo(r * 0.8, r * 0.4);
      ctx.lineTo(-r * 0.4, -r * 0.8);
      ctx.closePath();
      ctx.fill();

      // Monograma MCF en dorado
      ctx.fillStyle = '#C5A059';
      ctx.font = `900 ${r * 0.75}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, r * 0.1);
      ctx.restore();
      break;
    }

    // 2. FC BARCELONA
    case 'ucl_barcelona': {
      // Escudo con forma de olla
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, -r * 0.7);
      ctx.lineTo(r * 0.8, -r * 0.7);
      ctx.lineTo(r * 0.8, 0);
      ctx.quadraticCurveTo(r * 0.5, r * 0.8, 0, r * 0.98);
      ctx.quadraticCurveTo(-r * 0.5, r * 0.8, -r * 0.8, 0);
      ctx.closePath();
      ctx.fillStyle = '#EDBB00';
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      ctx.save();
      ctx.clip();
      // Superior izquierda: Cruz de San Jorge
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-r * 0.8, -r * 0.7, r * 0.8, r * 0.7);
      ctx.fillStyle = '#A50044';
      ctx.fillRect(-r * 0.5, -r * 0.7, r * 0.2, r * 0.7);
      ctx.fillRect(-r * 0.8, -r * 0.45, r * 0.8, r * 0.2);

      // Superior derecha: Senyera cuatribarrada
      ctx.fillStyle = '#EDBB00';
      ctx.fillRect(0, -r * 0.7, r * 0.8, r * 0.7);
      ctx.fillStyle = '#A50044';
      [0.15, 0.45, 0.75].forEach((x) => {
        ctx.fillRect(r * x - r * 0.08, -r * 0.7, r * 0.1, r * 0.7);
      });

      // Franja central negra con iniciales
      ctx.fillStyle = '#000000';
      ctx.fillRect(-r * 0.8, -r * 0.08, r * 1.6, r * 0.22);
      ctx.fillStyle = '#EDBB00';
      ctx.font = `900 ${r * 0.16}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FCB', 0, r * 0.03);

      // Inferior: Blaugrana y balón
      ctx.fillStyle = '#004D98';
      ctx.fillRect(-r * 0.8, r * 0.14, r * 1.6, r * 0.86);
      ctx.fillStyle = '#A50044';
      [-0.4, 0, 0.4].forEach((x) => {
        ctx.fillRect(r * x - r * 0.1, r * 0.14, r * 0.2, r * 0.86);
      });

      // Balón dorado en la base
      ctx.beginPath();
      ctx.arc(0, r * 0.55, r * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = '#EDBB00';
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      break;
    }

    // 3. MANCHESTER CITY
    case 'ucl_man_city': {
      // Escudo redondo moderno
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = r * 0.12;
      ctx.strokeStyle = '#001A49';
      ctx.stroke();

      // Círculo central celeste
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
      ctx.fillStyle = '#6CABDD';
      ctx.fill();

      // Barco de Manchester dorado
      ctx.fillStyle = '#FFC72C';
      ctx.beginPath();
      ctx.moveTo(-r * 0.35, -r * 0.1);
      ctx.lineTo(r * 0.35, -r * 0.1);
      ctx.lineTo(r * 0.25, -r * 0.38);
      ctx.lineTo(-r * 0.25, -r * 0.38);
      ctx.closePath();
      ctx.fill();

      // Rosa roja de Lancashire
      ctx.beginPath();
      ctx.arc(0, r * 0.28, r * 0.18, 0, Math.PI * 2);
      ctx.fillStyle = '#DA291C';
      ctx.fill();
      break;
    }

    // 4. BAYERN MÚNICH
    case 'ucl_bayern': {
      // Anillo exterior rojo
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
      ctx.fillStyle = '#DC052D';
      ctx.fill();
      ctx.lineWidth = r * 0.06;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Centro con rombos bávaros
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      ctx.fillStyle = '#0066B2';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = r * 0.04;
      ctx.stroke();

      // Rombos blancos
      ctx.save();
      ctx.clip();
      ctx.fillStyle = '#FFFFFF';
      for (let y = -r; y < r; y += r * 0.25) {
        for (let x = -r; x < r; x += r * 0.4) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + r * 0.2, y + r * 0.12);
          ctx.lineTo(x, y + r * 0.24);
          ctx.lineTo(x - r * 0.2, y + r * 0.12);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.restore();
      break;
    }

    // 5. PARIS SAINT-GERMAIN
    case 'ucl_psg': {
      // Círculo exterior azul marino
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
      ctx.fillStyle = '#001C44';
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Torre Eiffel roja estilizada
      ctx.fillStyle = '#DA291C';
      ctx.beginPath();
      ctx.moveTo(-r * 0.35, r * 0.65);
      ctx.lineTo(-r * 0.08, -r * 0.55);
      ctx.lineTo(r * 0.08, -r * 0.55);
      ctx.lineTo(r * 0.35, r * 0.65);
      ctx.lineTo(r * 0.15, r * 0.65);
      ctx.lineTo(0, r * 0.05);
      ctx.lineTo(-r * 0.15, r * 0.65);
      ctx.closePath();
      ctx.fill();

      // Flor de lis dorada
      ctx.fillStyle = '#C5A059';
      ctx.beginPath();
      ctx.arc(0, r * 0.38, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    // 6. ARSENAL FC
    case 'ucl_arsenal': {
      // Escudo rojo heráldico con cañón dorado
      ctx.beginPath();
      ctx.moveTo(-r * 0.75, -r * 0.85);
      ctx.lineTo(r * 0.75, -r * 0.85);
      ctx.lineTo(r * 0.75, r * 0.25);
      ctx.quadraticCurveTo(r * 0.4, r * 0.85, 0, r * 0.98);
      ctx.quadraticCurveTo(-r * 0.4, r * 0.85, -r * 0.75, r * 0.25);
      ctx.closePath();
      ctx.fillStyle = '#DB0007';
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#C5A059';
      ctx.stroke();

      // Cañón de artillería dorado apuntando a la derecha
      ctx.fillStyle = '#C5A059';
      // Rueda
      ctx.beginPath();
      ctx.arc(-r * 0.15, r * 0.18, r * 0.24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#023474';
      ctx.beginPath();
      ctx.arc(-r * 0.15, r * 0.18, r * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Cañón tubo
      ctx.fillStyle = '#C5A059';
      ctx.beginPath();
      ctx.moveTo(-r * 0.38, r * 0.12);
      ctx.lineTo(r * 0.52, -r * 0.18);
      ctx.lineTo(r * 0.54, -r * 0.06);
      ctx.lineTo(-r * 0.35, r * 0.25);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // 7. LIVERPOOL FC
    case 'ucl_liverpool': {
      // Escudo con Liverbird mítico
      ctx.fillStyle = '#C8102E';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#F6EB61';
      ctx.stroke();

      // Ave Liverbird en dorado
      ctx.fillStyle = '#F6EB61';
      ctx.beginPath();
      ctx.moveTo(-r * 0.12, r * 0.45);
      ctx.lineTo(r * 0.18, r * 0.45);
      ctx.lineTo(r * 0.24, -r * 0.15);
      ctx.lineTo(r * 0.35, -r * 0.35);
      ctx.lineTo(r * 0.15, -r * 0.25);
      ctx.lineTo(0, -r * 0.55);
      ctx.lineTo(-r * 0.15, -r * 0.25);
      ctx.lineTo(-r * 0.35, -r * 0.1);
      ctx.closePath();
      ctx.fill();
      break;
    }

    // 8. INTER DE MILÁN
    case 'ucl_inter': {
      // Círculo moderno con dos estrellas doradas arriba
      ctx.fillStyle = '#FFC72C';
      // 2 Estrellas doradas (20 Scudettos)
      [-r * 0.32, r * 0.32].forEach((sx) => {
        ctx.beginPath();
        ctx.arc(sx, -r * 0.82, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Círculo exterior azul y negro
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = '#0057B8';
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Monograma I M en blanco
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${r * 0.72}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('IM', 0, r * 0.1);
      break;
    }

    // 9. JUVENTUS
    case 'ucl_juventus': {
      // Escudo con las dos 'J' icónicas en blanco y negro
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = `900 ${r * 1.1}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('J', 0, 0);
      break;
    }

    // 10. BORUSSIA DORTMUND
    case 'ucl_dortmund': {
      // Círculo amarillo con 'BVB 09'
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      ctx.fillStyle = '#FDE100';
      ctx.fill();
      ctx.lineWidth = r * 0.1;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = `900 ${r * 0.44}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BVB', 0, -r * 0.12);
      ctx.font = `900 ${r * 0.34}px 'Arial Black', sans-serif`;
      ctx.fillText('09', 0, r * 0.32);
      break;
    }

    // 11. ATLÉTICO DE MADRID
    case 'ucl_atletico': {
      // Escudo heráldico con oso y madroño y rayas
      ctx.beginPath();
      ctx.moveTo(-r * 0.75, -r * 0.85);
      ctx.lineTo(r * 0.75, -r * 0.85);
      ctx.lineTo(r * 0.75, r * 0.2);
      ctx.quadraticCurveTo(r * 0.4, r * 0.8, 0, r * 0.98);
      ctx.quadraticCurveTo(-r * 0.4, r * 0.8, -r * 0.75, r * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#001A49';
      ctx.stroke();

      ctx.save();
      ctx.clip();
      // Superior: azul con estrellas
      ctx.fillStyle = '#001A49';
      ctx.fillRect(-r * 0.75, -r * 0.85, r * 1.5, r * 0.55);

      // Inferior: rayas rojiblancas
      const sw = (r * 1.5) / 5;
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#CB3524' : '#FFFFFF';
        ctx.fillRect(-r * 0.75 + i * sw, -r * 0.3, sw, r * 1.3);
      }
      ctx.restore();
      break;
    }

    // 12. AC MILAN
    case 'ucl_milan': {
      // Óvalo dividido: mitad derecha rayas rojas/negras, mitad izquierda cruz roja de San Ambrosio
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.75, r * 0.94, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = r * 0.08;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      ctx.save();
      ctx.clip();
      // Mitad izquierda: Cruz roja
      ctx.fillStyle = '#FB090B';
      ctx.fillRect(-r * 0.48, -r * 0.1, r * 0.48, r * 0.2);
      ctx.fillRect(-r * 0.32, -r * 0.8, r * 0.18, r * 1.6);

      // Mitad derecha: Rayas rojas y negras
      const sw = (r * 0.75) / 3;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#000000' : '#FB090B';
        ctx.fillRect(i * sw, -r * 0.94, sw, r * 1.88);
      }
      ctx.restore();
      break;
    }

    default:
      break;
  }

  ctx.restore();
}
