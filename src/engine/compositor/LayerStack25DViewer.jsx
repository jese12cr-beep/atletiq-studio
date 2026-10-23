import React, { useEffect, useRef, useState } from 'react';
import { drawPresetCrest } from './uvCanvasRenderer';

/**
 * ATLETIQ Engine v3.0 — Motor 2.5D "Faux-3D" de Capas Alpha Apiladas (Inspirado en Nike By You)
 *
 * Pre-genera y almacena en caché máscaras alpha independientes + pases AO (multiply)
 * y Specular (screen) para 3 ángulos discretos (0°, 45°, 180°).
 * Al cambiar un color, tiñe la máscara con `source-in` en < 2 ms sin redibujar geometría pesada.
 */

const ANGLES = [
  { id: 0, label: '0° Frente' },
  { id: 45, label: '45° Tres Cuartos' },
  { id: 180, label: '180° Reverso' },
];

const maskBankCache = new Map();

function buildLayerCanvas(w = 720, h = 720) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function getAccessoryLayerBank(accessoryType, angleDeg) {
  const key = `${accessoryType}_${angleDeg}`;
  if (maskBankCache.has(key)) return maskBankCache.get(key);

  const S = 720;
  const shadow = buildLayerCanvas(S, S);
  const maskPrimary = buildLayerCanvas(S, S);
  const maskSecondary = buildLayerCanvas(S, S);
  const maskAccents = buildLayerCanvas(S, S);
  const aoPass = buildLayerCanvas(S, S);
  const specPass = buildLayerCanvas(S, S);

  const sCtx = shadow.getContext('2d');
  const pCtx = maskPrimary.getContext('2d');
  const secCtx = maskSecondary.getContext('2d');
  const aCtx = maskAccents.getContext('2d');
  const aoCtx = aoPass.getContext('2d');
  const spCtx = specPass.getContext('2d');

  // Sombra de suelo de estudio
  const floorGrad = sCtx.createRadialGradient(360, 610, 12, 360, 610, 220);
  floorGrad.addColorStop(0, 'rgba(0,0,0,0.62)');
  floorGrad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.fillStyle = floorGrad;
  sCtx.save();
  sCtx.translate(360, 610);
  sCtx.scale(1, 0.16);
  sCtx.beginPath();
  sCtx.arc(0, 0, 210, 0, Math.PI * 2);
  sCtx.fill();
  sCtx.restore();

  const shiftX = angleDeg === 45 ? 34 : 0;

  if (accessoryType === 'cap') {
    // Corona estructurada 6 paneles
    pCtx.fillStyle = '#ffffff';
    pCtx.beginPath();
    pCtx.moveTo(155 - shiftX * 0.3, 430);
    pCtx.bezierCurveTo(155, 195, 565, 195, 565 - shiftX * 0.2, 430);
    pCtx.closePath();
    pCtx.fill();

    // Visera / Brim (Secundario)
    secCtx.fillStyle = '#ffffff';
    if (angleDeg !== 180) {
      secCtx.beginPath();
      secCtx.moveTo(125 + shiftX * 0.2, 422);
      secCtx.bezierCurveTo(210, 392, 530 + shiftX, 392, 605 + shiftX * 0.7, 432);
      secCtx.bezierCurveTo(620 + shiftX * 0.6, 495, 495 + shiftX, 535, 360 + shiftX * 0.8, 535);
      secCtx.bezierCurveTo(205, 535, 108, 488, 125 + shiftX * 0.2, 422);
      secCtx.closePath();
      secCtx.fill();
    } else {
      // Cierre trasero snapback en 180°
      secCtx.beginPath();
      secCtx.roundRect(275, 402, 170, 30, 12);
      secCtx.fill();
    }

    // Botón superior + ojales bordados (Acentos)
    aCtx.fillStyle = '#ffffff';
    aCtx.beginPath();
    aCtx.arc(360 - shiftX * 0.15, 248, 16, 0, Math.PI * 2);
    aCtx.arc(285, 305, 7, 0, Math.PI * 2);
    aCtx.arc(435, 305, 7, 0, Math.PI * 2);
    aCtx.fill();

    // Pase AO Multiply (costuras de paneles y volumen esférico)
    aoCtx.fillStyle = '#ffffff';
    aoCtx.fillRect(0, 0, S, S);
    const domeShade = aoCtx.createLinearGradient(145, 220, 585, 520);
    domeShade.addColorStop(0, '#d4d4d8');
    domeShade.addColorStop(0.35, '#ffffff');
    domeShade.addColorStop(0.75, '#d4d4d8');
    domeShade.addColorStop(1, '#71717a');
    aoCtx.fillStyle = domeShade;
    aoCtx.fillRect(100, 190, 540, 370);

    aoCtx.strokeStyle = 'rgba(0,0,0,0.35)';
    aoCtx.lineWidth = 3;
    aoCtx.beginPath();
    aoCtx.moveTo(360 - shiftX * 0.15, 250);
    aoCtx.lineTo(360 + shiftX * 0.2, 425);
    aoCtx.stroke();

    // Pase Specular Screen (pespuntes de visera y luz cenital)
    spCtx.strokeStyle = 'rgba(255,255,255,0.45)';
    spCtx.setLineDash([6, 6]);
    spCtx.lineWidth = 2;
    if (angleDeg !== 180) {
      spCtx.beginPath();
      spCtx.quadraticCurveTo(360 + shiftX * 0.6, 488, 565 + shiftX * 0.4, 444);
      spCtx.stroke();
    }
  } else if (accessoryType === 'bottle') {
    // Cuerpo de acero inoxidable aislado al vacío
    pCtx.fillStyle = '#ffffff';
    pCtx.beginPath();
    pCtx.roundRect(235, 195, 250, 395, 42);
    pCtx.fill();

    // Tapa técnica con asa deportiva
    secCtx.fillStyle = '#ffffff';
    secCtx.beginPath();
    secCtx.roundRect(280, 115, 160, 82, 16);
    secCtx.fill();

    // Banda de agarre de silicona + anillo metálico
    aCtx.fillStyle = '#ffffff';
    aCtx.fillRect(235, 260, 250, 38);
    aCtx.lineWidth = 12;
    aCtx.strokeStyle = '#ffffff';
    aCtx.beginPath();
    aCtx.arc(360 + shiftX * 0.4, 110, 38, Math.PI, 0);
    aCtx.stroke();

    // Cilindro metálico AO
    aoCtx.fillStyle = '#ffffff';
    aoCtx.fillRect(0, 0, S, S);
    const cylGrad = aoCtx.createLinearGradient(235, 0, 485, 0);
    cylGrad.addColorStop(0, '#64748b');
    cylGrad.addColorStop(0.24, '#ffffff');
    cylGrad.addColorStop(0.55, '#e2e8f0');
    cylGrad.addColorStop(0.85, '#94a3b8');
    cylGrad.addColorStop(1, '#475569');
    aoCtx.fillStyle = cylGrad;
    aoCtx.fillRect(230, 110, 260, 490);

    // Reflejo anisotrópico vertical (Screen)
    const specGrad = spCtx.createLinearGradient(275, 195, 325, 195);
    specGrad.addColorStop(0, 'rgba(255,255,255,0)');
    specGrad.addColorStop(0.5, 'rgba(255,255,255,0.52)');
    specGrad.addColorStop(1, 'rgba(255,255,255,0)');
    spCtx.fillStyle = specGrad;
    spCtx.fillRect(270, 200, 60, 380);
  } else {
    // Espinilleras Carbon Shield Pro
    pCtx.fillStyle = '#ffffff';
    pCtx.beginPath();
    pCtx.moveTo(235 - shiftX * 0.2, 145);
    pCtx.quadraticCurveTo(360, 118, 485 - shiftX * 0.1, 145);
    pCtx.bezierCurveTo(525, 285, 490, 485, 425, 575);
    pCtx.quadraticCurveTo(360, 598, 295, 575);
    pCtx.bezierCurveTo(230, 485, 195, 285, 235 - shiftX * 0.2, 145);
    pCtx.closePath();
    pCtx.fill();

    // Acolchado EVA interior / Borde protector
    secCtx.strokeStyle = '#ffffff';
    secCtx.lineWidth = 20;
    secCtx.stroke(new Path2D('M 235 145 Q 360 118 485 145 C 525 285 490 485 425 575 Q 360 598 295 575 C 230 485 195 285 235 145 Z'));

    // Líneas dinámicas de impacto
    aCtx.fillStyle = '#ffffff';
    aCtx.fillRect(245, 215, 230, 12);
    aCtx.fillRect(275, 520, 170, 10);

    aoCtx.fillStyle = '#ffffff';
    aoCtx.fillRect(0, 0, S, S);
    const guardGrad = aoCtx.createLinearGradient(200, 140, 520, 560);
    guardGrad.addColorStop(0, '#cbd5e1');
    guardGrad.addColorStop(0.35, '#ffffff');
    guardGrad.addColorStop(1, '#475569');
    aoCtx.fillStyle = guardGrad;
    aoCtx.fillRect(180, 110, 360, 500);

    // Barniz brillante tipo carbono
    const gloss = spCtx.createLinearGradient(230, 140, 410, 480);
    gloss.addColorStop(0, 'rgba(255,255,255,0.42)');
    gloss.addColorStop(0.45, 'rgba(255,255,255,0.06)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    spCtx.fillStyle = gloss;
    spCtx.fillRect(210, 130, 260, 440);
  }

  const bank = { shadow, maskPrimary, maskSecondary, maskAccents, aoPass, specPass };
  maskBankCache.set(key, bank);
  return bank;
}

function drawTintedMask(targetCtx, maskCanvas, hexColor, tempCanvas) {
  const tCtx = tempCanvas.getContext('2d');
  tCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
  tCtx.globalCompositeOperation = 'source-over';
  tCtx.drawImage(maskCanvas, 0, 0);
  tCtx.globalCompositeOperation = 'source-in';
  tCtx.fillStyle = hexColor;
  tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  targetCtx.drawImage(tempCanvas, 0, 0);
}

export default function LayerStack25DViewer({
  accessoryType = 'cap',
  design,
  activePlayer,
  artworkRegistry,
  canvasSnapshotRef,
}) {
  const [angleIdx, setAngleIdx] = useState(0);
  const canvasRef = useRef(null);
  const tintBufferRef = useRef(null);
  const dragStartXRef = useRef(null);

  const currentAngle = ANGLES[angleIdx].id;

  useEffect(() => {
    if (!tintBufferRef.current) {
      tintBufferRef.current = buildLayerCanvas(720, 720);
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 720;
    canvas.height = 720;
    if (canvasSnapshotRef) canvasSnapshotRef.current = canvas;

    const ctx = canvas.getContext('2d');
    const bank = getAccessoryLayerBank(accessoryType, currentAngle);
    const tintBuf = tintBufferRef.current;

    ctx.clearRect(0, 0, 720, 720);

    // Z-0: Sombra de suelo
    ctx.drawImage(bank.shadow, 0, 0);

    // Creamos un buffer aislado del objeto para que multiply/screen sólo afecten la silueta del producto
    const objCanvas = buildLayerCanvas(720, 720);
    const oCtx = objCanvas.getContext('2d');

    // Z-1..3: Tintado instantáneo GPU de máscaras (`source-in`)
    drawTintedMask(oCtx, bank.maskPrimary, design.colorZones.primary?.hex || '#1d4ed8', tintBuf);
    drawTintedMask(oCtx, bank.maskSecondary, design.colorZones.secondary?.hex || '#0f172a', tintBuf);
    drawTintedMask(oCtx, bank.maskAccents, design.colorZones.accents?.hex || '#facc15', tintBuf);

    // Z-4: Proyección de Escudo / Grabado Láser / Dorsal con perspectiva del ángulo
    oCtx.save();
    const skewX = currentAngle === 45 ? 0.14 : 0;
    const posX = currentAngle === 45 ? 382 : 360;
    const posY = accessoryType === 'cap' ? 345 : accessoryType === 'bottle' ? 415 : 345;
    oCtx.translate(posX, posY);
    oCtx.transform(currentAngle === 45 ? 0.88 : 1, skewX, 0, 1, 0, 0);

    if (currentAngle !== 180) {
      const crestDecal = (design.decals || [])[0];
      if (crestDecal?.type === 'UPLOADED_RASTER' || crestDecal?.type === 'UPLOADED_VECTOR') {
        const art = artworkRegistry[crestDecal.artworkId];
        if (art?.imageElement) {
          oCtx.drawImage(art.imageElement, -55, -55, 110, 110);
        }
      } else {
        drawPresetCrest(oCtx, crestDecal?.presetId || 'royal_shield', 96, 104, design.colorZones);
      }

      if (accessoryType !== 'cap' && activePlayer?.name) {
        oCtx.font = "900 34px 'Bebas Neue', sans-serif";
        oCtx.textAlign = 'center';
        oCtx.fillStyle = design.variableSlots?.playerNameBack?.fillHex || '#ffffff';
        oCtx.fillText(`${activePlayer.name} #${activePlayer.number || '10'}`, 0, 92);
      }
    } else if (activePlayer?.number) {
      oCtx.font = "900 48px 'Bebas Neue', sans-serif";
      oCtx.textAlign = 'center';
      oCtx.fillStyle = design.colorZones.accents?.hex || '#facc15';
      oCtx.fillText(`#${activePlayer.number}`, 0, 10);
    }
    oCtx.restore();

    // Z-5: Pase Ambient Occlusion (`multiply` recortado a la máscara del objeto)
    oCtx.save();
    oCtx.globalCompositeOperation = 'source-atop';
    const aoComposite = buildLayerCanvas(720, 720);
    const aoCompCtx = aoComposite.getContext('2d');
    aoCompCtx.drawImage(objCanvas, 0, 0);
    aoCompCtx.globalCompositeOperation = 'multiply';
    aoCompCtx.drawImage(bank.aoPass, 0, 0);
    oCtx.clearRect(0, 0, 720, 720);
    oCtx.globalCompositeOperation = 'source-over';
    oCtx.drawImage(aoComposite, 0, 0);
    oCtx.restore();

    // Z-6: Pase Specular Highlights (`screen`)
    oCtx.save();
    oCtx.globalCompositeOperation = 'source-atop';
    oCtx.globalAlpha = 0.85;
    oCtx.drawImage(bank.specPass, 0, 0);
    oCtx.restore();

    ctx.drawImage(objCanvas, 0, 0);
  }, [accessoryType, currentAngle, design, activePlayer, artworkRegistry]);

  return (
    <div
      onPointerDown={(e) => {
        dragStartXRef.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (dragStartXRef.current === null) return;
        const delta = e.clientX - dragStartXRef.current;
        if (Math.abs(delta) > 55) {
          setAngleIdx((prev) => (delta > 0 ? (prev + 1) % ANGLES.length : (prev - 1 + ANGLES.length) % ANGLES.length));
          dragStartXRef.current = e.clientX;
        }
      }}
      onPointerUp={() => {
        dragStartXRef.current = null;
      }}
      className="w-full h-full flex flex-col items-center justify-center select-none cursor-ew-resize"
    >
      <canvas ref={canvasRef} className="w-full max-w-[460px] h-auto" />

      <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl mt-1">
        {ANGLES.map((ang, i) => (
          <button
            key={ang.id}
            type="button"
            onClick={() => setAngleIdx(i)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              angleIdx === i ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {ang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
