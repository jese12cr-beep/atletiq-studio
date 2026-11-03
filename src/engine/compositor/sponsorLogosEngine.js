/**
 * ATLETIQ Engine — Official Sponsor Logos Vector Engine
 * Renderiza los logotipos publicitarios oficiales en alta definición vectorial
 * tanto para los clubes de la Liga MX como para los clubes de la UEFA Champions League.
 * 
 * Coordenadas milimétricas exactas centradas en (0, 0), escalables sin pérdida.
 */

import { resolveAssetUrl } from '../../utils/assetUrl';

// Cache global de logotipos publicitarios en alta resolución
const SPONSOR_IMAGE_CACHE = {};
const TINT_CANVAS_CACHE = new Map();

function getTintedSponsorDrawable(img, tintHex) {
  if (!tintHex || typeof document === 'undefined') return img;
  const cleanTint = tintHex.toLowerCase().trim();
  const key = `${img.src}|${cleanTint}`;
  if (TINT_CANVAS_CACHE.has(key)) return TINT_CANVAS_CACHE.get(key);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 1200;
  canvas.height = img.naturalHeight || 400;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = cleanTint;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  TINT_CANVAS_CACHE.set(key, canvas);
  return canvas;
}

export function getOrLoadSponsorImage(sponsorId, tintHex = null) {
  if (typeof window === 'undefined') return null;
  if (!sponsorId) return null;

  const cleanId = String(sponsorId).toLowerCase().trim();
  const needsTint = Boolean(tintHex);
  const cacheKey = `${cleanId}_${needsTint ? 'tinted' : 'color'}`;

  if (SPONSOR_IMAGE_CACHE[cacheKey]) return SPONSOR_IMAGE_CACHE[cacheKey];

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.dataset.loaded = 'false';
  img.onload = () => {
    img.dataset.loaded = 'true';
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('atletiq:sponsor-loaded', { detail: { sponsorId: cleanId } }));
    }
  };
  img.onerror = () => {
    img.dataset.failed = 'true';
  };

  const filename = needsTint ? `${cleanId}_white.png` : `${cleanId}.png`;
  img.src = resolveAssetUrl(`assets/sponsors/${filename}`);
  SPONSOR_IMAGE_CACHE[cacheKey] = img;
  return img;
}

export function preloadSponsorLogo(sponsorId, tintHex = null) {
  return new Promise((resolve) => {
    const img = getOrLoadSponsorImage(sponsorId, tintHex);
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

export function drawSponsorLogoMm(ctx, sponsorId, wMm, hMm, tintHex = null) {
  if (!ctx || !sponsorId) return;

  const halfW = wMm / 2;
  const halfH = hMm / 2;

  ctx.save();

  // 1. Intentar renderizar el logotipo oficial en alta resolución si está cargado
  const sponsorImg = getOrLoadSponsorImage(sponsorId, tintHex);
  if (sponsorImg && sponsorImg.dataset?.loaded === 'true') {
    const drawable = tintHex ? getTintedSponsorDrawable(sponsorImg, tintHex) : sponsorImg;
    const imgW = sponsorImg.naturalWidth || 1200;
    const imgH = sponsorImg.naturalHeight || 400;
    const imgAspect = imgW / imgH;
    const boxAspect = wMm / hMm;
    let drawW = wMm;
    let drawH = hMm;
    if (imgAspect > boxAspect) {
      drawW = wMm;
      drawH = wMm / imgAspect;
    } else {
      drawH = hMm;
      drawW = hMm * imgAspect;
    }
    ctx.drawImage(drawable, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
    return;
  }

  switch (sponsorId.toLowerCase()) {
    // =========================================================================
    // LIGA MX: CALIENTE.MX (América, Chivas, Atlas, Puebla, Xolos, Querétaro, Mazatlán)
    // =========================================================================
    case 'caliente':
    case 'caliente_mx': {
      const textColor = tintHex || '#C8102E';
      const mxColor = tintHex ? tintHex : '#111827';

      // 1. Balón de fuego / Flama estilizada a la izquierda
      const ballRadius = Math.min(wMm * 0.14, hMm * 0.42);
      const ballCenterX = -halfW + ballRadius + 6;
      const ballCenterY = 0;

      // Círculo base de la llama
      ctx.beginPath();
      ctx.arc(ballCenterX, ballCenterY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = textColor;
      ctx.fill();

      // Flamas dinámicas saliendo hacia la izquierda/arriba
      ctx.beginPath();
      ctx.moveTo(ballCenterX - ballRadius * 0.4, ballCenterY - ballRadius * 0.9);
      ctx.quadraticCurveTo(ballCenterX - ballRadius * 1.5, ballCenterY - ballRadius * 1.2, ballCenterX - ballRadius * 0.8, ballCenterY);
      ctx.quadraticCurveTo(ballCenterX - ballRadius * 1.3, ballCenterY + ballRadius * 0.8, ballCenterX, ballCenterY + ballRadius);
      ctx.fillStyle = textColor;
      ctx.fill();

      // Detalles gajos del balón en blanco
      ctx.beginPath();
      ctx.arc(ballCenterX, ballCenterY, ballRadius * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 2. Tipografía cursiva "Caliente"
      ctx.fillStyle = textColor;
      ctx.font = `italic 900 ${Math.min(hMm * 0.62, wMm * 0.22)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Caliente', ballCenterX + ballRadius + 8, -hMm * 0.05);

      // 3. ".mx" en pastilla o texto bold
      const fontSize = Math.min(hMm * 0.38, wMm * 0.14);
      ctx.fillStyle = mxColor;
      ctx.font = `italic 900 ${fontSize}px 'Arial Black', sans-serif`;
      ctx.fillText('.mx', halfW - wMm * 0.22, hMm * 0.08);
      break;
    }

    // =========================================================================
    // LIGA MX: CEMENTO CRUZ AZUL (Cruz Azul)
    // =========================================================================
    case 'cruz_azul':
    case 'cemento_cruz_azul': {
      const boxSize = Math.min(hMm * 0.88, wMm * 0.32);
      const boxX = -halfW + boxSize / 2 + 10;

      // Cuadrado con borde azul marino y fondo rojo
      ctx.fillStyle = '#00509D';
      ctx.fillRect(boxX - boxSize / 2 - 2, -boxSize / 2 - 2, boxSize + 4, boxSize + 4);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(boxX - boxSize / 2, -boxSize / 2, boxSize, boxSize);

      ctx.fillStyle = '#C8102E';
      ctx.fillRect(boxX - boxSize * 0.44, -boxSize * 0.44, boxSize * 0.88, boxSize * 0.88);

      // Cruz blanca/azul en el centro
      const crossW = boxSize * 0.32;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(boxX - crossW / 2, -boxSize * 0.36, crossW, boxSize * 0.72);
      ctx.fillRect(boxX - boxSize * 0.36, -crossW / 2, boxSize * 0.72, crossW);

      ctx.fillStyle = '#00509D';
      const innerCrossW = crossW * 0.65;
      ctx.fillRect(boxX - innerCrossW / 2, -boxSize * 0.3, innerCrossW, boxSize * 0.6);
      ctx.fillRect(boxX - boxSize * 0.3, -innerCrossW / 2, boxSize * 0.6, innerCrossW);

      // Texto "CEMENTO CRUZ AZUL"
      const textColor = tintHex || '#00509D';
      ctx.fillStyle = textColor;
      ctx.font = `900 ${Math.min(hMm * 0.36, 18)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('CEMENTO', boxX + boxSize / 2 + 12, -hMm * 0.22);
      ctx.fillText('CRUZ AZUL', boxX + boxSize / 2 + 12, hMm * 0.22);
      break;
    }

    // =========================================================================
    // LIGA MX: DHL (Pumas UNAM)
    // =========================================================================
    case 'dhl': {
      // Pastilla amarilla de velocidad
      ctx.fillStyle = '#FFCC00';
      ctx.fillRect(-halfW * 0.88, -halfH * 0.75, wMm * 0.88, hMm * 0.75);

      // Líneas rojas aerodinámicas en la base
      ctx.fillStyle = '#D40511';
      ctx.fillRect(-halfW * 0.88, halfH * 0.55, wMm * 0.88, 3.5);
      ctx.fillRect(-halfW * 0.88, halfH * 0.7, wMm * 0.88, 2);

      // Letras rojas inclinadas "DHL"
      ctx.fillStyle = '#D40511';
      ctx.font = `italic 900 ${Math.min(hMm * 0.68, wMm * 0.36)}px 'Impact', 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DHL', 0, -hMm * 0.05);
      break;
    }

    // =========================================================================
    // LIGA MX: CEMEX (Tigres UANL)
    // =========================================================================
    case 'cemex': {
      const textColor = tintHex || '#FFFFFF';
      // Bloques rojo y azul inclinados
      ctx.fillStyle = '#D40511';
      ctx.beginPath();
      ctx.moveTo(-wMm * 0.42, -hMm * 0.35);
      ctx.lineTo(-wMm * 0.26, -hMm * 0.35);
      ctx.lineTo(-wMm * 0.34, hMm * 0.35);
      ctx.lineTo(-wMm * 0.5, hMm * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#003DA5';
      ctx.beginPath();
      ctx.moveTo(-wMm * 0.23, -hMm * 0.35);
      ctx.lineTo(-wMm * 0.07, -hMm * 0.35);
      ctx.lineTo(-wMm * 0.15, hMm * 0.35);
      ctx.lineTo(-wMm * 0.31, hMm * 0.35);
      ctx.closePath();
      ctx.fill();

      // Texto CEMEX
      ctx.fillStyle = textColor;
      ctx.font = `900 ${Math.min(hMm * 0.62, wMm * 0.22)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('CEMEX', 0, 0);
      break;
    }

    // =========================================================================
    // LIGA MX: CODERE (Monterrey Rayados)
    // =========================================================================
    case 'codere': {
      const mainColor = tintHex || '#00C379';
      ctx.fillStyle = mainColor;
      ctx.font = `900 ${Math.min(hMm * 0.65, wMm * 0.26)}px 'Montserrat', 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '1.5px';
      ctx.fillText('codere', 0, -hMm * 0.05);

      // Arco curvo verde inferior
      ctx.beginPath();
      ctx.arc(0, hMm * 0.32, wMm * 0.32, Math.PI * 0.85, Math.PI * 0.15, true);
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 3.5;
      ctx.stroke();
      break;
    }

    // =========================================================================
    // LIGA MX: ROSHFRANS (Toluca)
    // =========================================================================
    case 'roshfrans': {
      const mainColor = tintHex || '#C8102E';
      // Óvalo base
      ctx.beginPath();
      ctx.ellipse(0, 0, halfW * 0.92, halfH * 0.72, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = mainColor;
      ctx.stroke();

      // Texto "ROSHFRANS" en cursiva roja
      ctx.fillStyle = mainColor;
      ctx.font = `italic 900 ${Math.min(hMm * 0.52, wMm * 0.18)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ROSHFRANS', 0, 0);
      break;
    }

    // =========================================================================
    // LIGA MX: SORIANA (Santos Laguna)
    // =========================================================================
    case 'soriana': {
      const mainColor = tintHex || '#C8102E';
      // Corazón de Soriana a la izquierda
      const heartX = -halfW * 0.58;
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.moveTo(heartX, -hMm * 0.15);
      ctx.bezierCurveTo(heartX - 12, -hMm * 0.45, heartX - 25, -hMm * 0.05, heartX, hMm * 0.35);
      ctx.bezierCurveTo(heartX + 25, -hMm * 0.05, heartX + 12, -hMm * 0.45, heartX, -hMm * 0.15);
      ctx.fill();

      // Texto Soriana
      ctx.fillStyle = mainColor;
      ctx.font = `900 ${Math.min(hMm * 0.6, wMm * 0.22)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Soriana', heartX + 22, 0);
      break;
    }

    // =========================================================================
    // LIGA MX: TELCEL (León, Pachuca)
    // =========================================================================
    case 'telcel': {
      const mainColor = tintHex || '#002B7F';
      // Logo telcel minúscula con arco
      ctx.fillStyle = mainColor;
      ctx.font = `900 ${Math.min(hMm * 0.68, wMm * 0.26)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('telcel', 0, 0);
      break;
    }

    // =========================================================================
    // LIGA MX: CEMENTOS FORTALEZA (León, Pachuca)
    // =========================================================================
    case 'fortaleza':
    case 'cementos_fortaleza': {
      const mainColor = tintHex || '#C8102E';
      // Escudo con castillo / fortaleza
      ctx.fillStyle = '#002B7F';
      ctx.fillRect(-halfW * 0.85, -halfH * 0.65, wMm * 0.85, hMm * 0.65);

      ctx.fillStyle = mainColor;
      ctx.fillRect(-halfW * 0.85, halfH * 0.05, wMm * 0.85, hMm * 0.45);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `900 ${Math.min(hMm * 0.4, wMm * 0.15)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CEMENTOS', 0, -hMm * 0.32);
      ctx.fillText('FORTALEZA', 0, hMm * 0.26);
      break;
    }

    // =========================================================================
    // LIGA MX: ROLCAR (Necaxa)
    // =========================================================================
    case 'rolcar': {
      const mainColor = tintHex || '#C8102E';
      ctx.fillStyle = mainColor;
      ctx.font = `italic 900 ${Math.min(hMm * 0.72, wMm * 0.28)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ROLCAR', 0, 0);
      break;
    }

    // =========================================================================
    // LIGA MX: PEDIGREE (Querétaro)
    // =========================================================================
    case 'pedigree': {
      // Cartela amarilla con texto azul
      ctx.beginPath();
      ctx.roundRect(-halfW * 0.85, -halfH * 0.7, wMm * 0.85, hMm * 0.7, 12);
      ctx.fillStyle = '#FFC72C';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#D40511';
      ctx.stroke();

      ctx.fillStyle = '#002B7F';
      ctx.font = `italic 900 ${Math.min(hMm * 0.52, wMm * 0.2)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Pedigree', 0, 0);
      break;
    }

    // =========================================================================
    // LIGA MX: CANEL'S (Atlético de San Luis)
    // =========================================================================
    case 'canels': {
      // Óvalo rojo Canel's
      ctx.beginPath();
      ctx.ellipse(0, 0, halfW * 0.88, halfH * 0.68, -0.05, 0, Math.PI * 2);
      ctx.fillStyle = '#C8102E';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `italic 900 ${Math.min(hMm * 0.54, wMm * 0.2)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText("Canel's", 0, 0);
      break;
    }

    // =========================================================================
    // LIGA MX: BETCRIS (FC Juárez)
    // =========================================================================
    case 'betcris': {
      const textColor = tintHex || '#FFFFFF';
      ctx.fillStyle = textColor;
      ctx.font = `900 ${Math.min(hMm * 0.68, wMm * 0.26)}px 'Montserrat', 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('betcris', 0, 0);
      break;
    }

    // =========================================================================
    // UCL: EMIRATES FLY BETTER (Real Madrid, Arsenal, AC Milan)
    // =========================================================================
    case 'fly_emirates':
    case 'emirates': {
      const textColor = tintHex || '#FFFFFF';
      ctx.fillStyle = textColor;
      // 1. "Emirates" en tipografía serifa estilizada
      ctx.font = `bold ${Math.min(hMm * 0.48, wMm * 0.17)}px 'Georgia', 'Times New Roman', serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '1px';
      ctx.fillText('Emirates', 0, -hMm * 0.26);

      // 2. "FLY BETTER" en sans-serif extendida
      ctx.font = `900 ${Math.min(hMm * 0.32, wMm * 0.12)}px 'Arial Black', sans-serif`;
      ctx.letterSpacing = '3px';
      ctx.fillText('FLY BETTER', 0, hMm * 0.28);
      break;
    }

    // =========================================================================
    // UCL: SPOTIFY (FC Barcelona)
    // =========================================================================
    case 'spotify': {
      const textColor = tintHex || '#C5A059'; // Dorado en local, blanco/rojo en visita
      const circleR = Math.min(wMm * 0.12, hMm * 0.36);
      const circleX = -halfW * 0.55;

      // Círculo Spotify
      ctx.beginPath();
      ctx.arc(circleX, 0, circleR, 0, Math.PI * 2);
      ctx.fillStyle = textColor;
      ctx.fill();

      // Tres ondas sonoras recortadas en el interior
      ctx.strokeStyle = '#0B1B3D'; // o fondo
      ctx.lineWidth = circleR * 0.18;
      ctx.lineCap = 'round';
      [-circleR * 0.42, 0, circleR * 0.42].forEach((offsetY, idx) => {
        const spread = circleR * (0.45 + idx * 0.18);
        ctx.beginPath();
        ctx.arc(circleX, offsetY + circleR * 0.8, spread, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
      });

      // Texto "Spotify"
      ctx.fillStyle = textColor;
      ctx.font = `900 ${Math.min(hMm * 0.58, wMm * 0.22)}px 'Montserrat', 'Arial Black', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Spotify', circleX + circleR + 10, 0);
      break;
    }

    // =========================================================================
    // UCL: ETIHAD AIRWAYS (Manchester City)
    // =========================================================================
    case 'etihad':
    case 'etihad_airways': {
      const textColor = tintHex || '#001A49';
      ctx.fillStyle = textColor;
      // Árabe decorativo superior
      ctx.font = `bold ${Math.min(hMm * 0.26, 12)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px';
      ctx.fillText('الاتحاد', 0, -hMm * 0.35);

      // ETIHAD
      ctx.font = `900 ${Math.min(hMm * 0.48, wMm * 0.18)}px 'Arial Black', sans-serif`;
      ctx.letterSpacing = '4px';
      ctx.fillText('ETIHAD', 0, 0);

      // AIRWAYS
      ctx.font = `bold ${Math.min(hMm * 0.22, 11)}px 'Arial Black', sans-serif`;
      ctx.letterSpacing = '6px';
      ctx.fillText('AIRWAYS', 0, hMm * 0.36);
      break;
    }

    // =========================================================================
    // UCL: TELEKOM · T ··· (Bayern Múnich)
    // =========================================================================
    case 'telekom':
    case 't_mobile': {
      const textColor = tintHex || '#FFFFFF';
      ctx.fillStyle = textColor;
      // Cuatro puntos Telekom y la gran 'T' central
      const dotSize = Math.min(wMm * 0.05, hMm * 0.18);
      const tHeight = Math.min(hMm * 0.82, wMm * 0.35);

      // Punto izquierdo
      ctx.fillRect(-halfW * 0.6, -dotSize / 2, dotSize, dotSize);

      // Gran T central
      ctx.font = `900 ${tHeight}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('T', 0, 0);

      // Tres puntos derechos
      const rightStart = halfW * 0.28;
      for (let p = 0; p < 3; p++) {
        ctx.fillRect(rightStart + p * (dotSize * 1.6), -dotSize / 2, dotSize, dotSize);
      }
      break;
    }

    // =========================================================================
    // UCL: QATAR AIRWAYS (Paris Saint-Germain)
    // =========================================================================
    case 'qatar':
    case 'qatar_airways': {
      const textColor = tintHex || '#FFFFFF';
      ctx.fillStyle = textColor;
      // QATAR
      ctx.font = `900 ${Math.min(hMm * 0.52, wMm * 0.22)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '3px';
      ctx.fillText('QATAR', 0, -hMm * 0.22);

      // AIRWAYS
      ctx.font = `bold ${Math.min(hMm * 0.28, wMm * 0.12)}px 'Arial Black', sans-serif`;
      ctx.letterSpacing = '5px';
      ctx.fillText('AIRWAYS', 0, hMm * 0.28);
      break;
    }

    // =========================================================================
    // UCL: STANDARD CHARTERED (Liverpool FC)
    // =========================================================================
    case 'standard_chartered': {
      const textColor = tintHex || '#FFFFFF';
      // Logo lazo doble a la izquierda
      const logoX = -halfW * 0.65;
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(logoX - 12, -hMm * 0.25);
      ctx.bezierCurveTo(logoX + 16, -hMm * 0.3, logoX - 16, hMm * 0.3, logoX + 12, hMm * 0.25);
      ctx.stroke();

      // Texto de dos líneas
      ctx.fillStyle = textColor;
      ctx.font = `900 ${Math.min(hMm * 0.38, 16)}px 'Montserrat', 'Arial Black', sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('Standard', logoX + 22, -hMm * 0.2);
      ctx.fillText('Chartered', logoX + 22, hMm * 0.2);
      break;
    }

    // =========================================================================
    // UCL: BETSSON SPORT (Inter de Milán)
    // =========================================================================
    case 'betsson':
    case 'betsson_sport': {
      const textColor = tintHex || '#FFFFFF';
      ctx.fillStyle = textColor;
      ctx.font = `900 ${Math.min(hMm * 0.58, wMm * 0.22)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('betsson.sport', 0, 0);
      break;
    }

    // =========================================================================
    // UCL: JEEP (Juventus)
    // =========================================================================
    case 'jeep': {
      const textColor = tintHex || '#000000';
      ctx.fillStyle = textColor;
      ctx.font = `900 ${Math.min(hMm * 0.78, wMm * 0.32)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px';
      ctx.fillText('Jeep', 0, 0);
      break;
    }

    // =========================================================================
    // UCL: 1&1 (Borussia Dortmund)
    // =========================================================================
    case '1and1':
    case 'one_and_one': {
      // Recuadro blanco con esquinas redondeadas
      const boxW = Math.min(wMm * 0.55, 130);
      const boxH = Math.min(hMm * 0.85, 75);
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 10);
      ctx.fill();

      // Texto "1&1" en azul marino oscuro / negro
      ctx.fillStyle = '#002B7F';
      ctx.font = `900 ${boxH * 0.65}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1&1', 0, 0);
      break;
    }

    // =========================================================================
    // UCL: RIYADH AIR (Atlético de Madrid)
    // =========================================================================
    case 'riyadh_air': {
      const textColor = tintHex || '#001A49';
      ctx.fillStyle = textColor;
      // Logo estilizado de pluma / ala a la izquierda
      ctx.font = `bold ${Math.min(hMm * 0.52, wMm * 0.2)}px 'Montserrat', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '3px';
      ctx.fillText('RIYADH AIR', 0, 0);
      break;
    }

    default: {
      const textColor = tintHex || '#FFFFFF';
      ctx.fillStyle = textColor;
      ctx.font = `900 ${Math.min(hMm * 0.55, 24)}px 'Arial Black', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sponsorId.toUpperCase(), 0, 0);
      break;
    }
  }

  ctx.restore();
}
