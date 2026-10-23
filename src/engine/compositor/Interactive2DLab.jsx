import React, { useEffect, useRef, useState } from 'react';
import { Move, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { renderGarmentPanel, PANEL_PX } from './uvCanvasRenderer';
import { GARMENT_REFERENCE_MM, evaluateDecalPlacement } from '../core/boundingBoxMath';
import { calculateEffectiveDpi } from '../core/dpiValidator';
import { getFabricPBRMaps } from './fabricTexturesPBR';

/**
 * ATLETIQ Engine v3.0 — Laboratorio de Precisión 2D con Gizmos y Bounding Boxes (Estilo CustomInk)
 *
 * Implementa manipulación directa con Pointer Capture + soporte de teclado (flechas)
 * siguiendo las directrices de accesibilidad e interacción táctil.
 */
export default function Interactive2DLab({
  design,
  panel = 'front',
  activePlayer,
  artworkRegistry,
  selectedDecalId,
  onSelectDecal,
  onUpdateDecal,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const handleRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0, isDragging: false });
  const [snapGuides, setSnapGuides] = useState({
    verticalCenter: false,
    horizontalChest: false,
    horizontalSponsor: false,
  });

  const panelDecals = (design.decals || []).filter((d) => d.panel === panel);
  const activeDecal = panelDecals.find((d) => d.id === selectedDecalId) || panelDecals[0] || null;

  // Renderizado del molde 2D con máscara de silueta + micro-malla Dry-Fit + guías de área segura
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = PANEL_PX;
    canvas.height = PANEL_PX;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, PANEL_PX, PANEL_PX);

    ctx.save();
    // Silueta limpia de camiseta técnica (recorte de molde)
    ctx.beginPath();
    ctx.moveTo(310, 82);
    if (panel === 'front' && design.collarStyle === 'v-neck') {
      ctx.lineTo(512, 188);
      ctx.lineTo(714, 82);
    } else {
      ctx.quadraticCurveTo(512, panel === 'front' ? 168 : 116, 714, 82);
    }
    ctx.lineTo(955, 228);
    ctx.lineTo(868, 392);
    ctx.lineTo(768, 342);
    ctx.lineTo(782, 938);
    ctx.quadraticCurveTo(512, 968, 242, 938);
    ctx.lineTo(256, 342);
    ctx.lineTo(156, 392);
    ctx.lineTo(69, 228);
    ctx.closePath();
    ctx.clip();

    renderGarmentPanel(ctx, design, panel, activePlayer, artworkRegistry, {
      showGuides: true,
      selectedDecalId: activeDecal?.id,
      snapGuides,
    });

    // Pintar mangas en los extremos del molde 2D
    ctx.fillStyle = design.colorZones.sleeves?.hex || '#0f172a';
    ctx.beginPath();
    ctx.moveTo(310, 82);
    ctx.lineTo(69, 228);
    ctx.lineTo(156, 392);
    ctx.lineTo(256, 342);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(714, 82);
    ctx.lineTo(955, 228);
    ctx.lineTo(868, 392);
    ctx.lineTo(768, 342);
    ctx.closePath();
    ctx.fill();

    // Superponer micro-textura física Dry-Fit en modo multiply sutil
    const pbr = getFabricPBRMaps(design.fabricWeaveId, 42);
    const pattern = ctx.createPattern(pbr.weaveCanvas, 'repeat');
    if (pattern) {
      ctx.save();
      ctx.scale(0.18, 0.18);
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, PANEL_PX * 6, PANEL_PX * 6);
      ctx.restore();
    }

    // Sombreado lateral volumétrico 2D
    const shade = ctx.createLinearGradient(180, 0, 844, 0);
    shade.addColorStop(0, 'rgba(0,0,0,0.28)');
    shade.addColorStop(0.2, 'rgba(0,0,0,0.02)');
    shade.addColorStop(0.5, 'rgba(255,255,255,0.06)');
    shade.addColorStop(0.8, 'rgba(0,0,0,0.03)');
    shade.addColorStop(1, 'rgba(0,0,0,0.28)');
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, PANEL_PX, PANEL_PX);

    ctx.restore();

    // Cuello ribeteado encima
    ctx.save();
    ctx.strokeStyle = design.colorZones.collar?.hex || '#ffffff';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(316, 86);
    if (panel === 'front' && design.collarStyle === 'v-neck') {
      ctx.lineTo(512, 186);
      ctx.lineTo(708, 86);
    } else {
      ctx.quadraticCurveTo(512, panel === 'front' ? 164 : 114, 708, 86);
    }
    ctx.stroke();
    ctx.restore();
  }, [design, panel, activePlayer, artworkRegistry, activeDecal?.id, snapGuides]);

  // Helper unificado de movimiento con clamping / snapping (puntero + teclado)
  const commitDecalMoveMm = (rawXmm, rawYmm) => {
    if (!activeDecal) return;
    const candidate = {
      ...activeDecal,
      centerMm: { x: rawXmm, y: rawYmm },
    };
    const evaluated = evaluateDecalPlacement(candidate, null, true);
    setSnapGuides(evaluated.snapGuides);

    const finalCenter =
      design.bleedEnforcement === 'HARD_CLAMP'
        ? evaluated.clampedSafeCenterMm
        : evaluated.snappedCenterMm;

    onUpdateDecal(activeDecal.id, {
      centerMm: {
        x: Math.round(finalCenter.x * 10) / 10,
        y: Math.round(finalCenter.y * 10) / 10,
      },
    });
  };

  // Drag con Pointer Capture en el manejador dedicado
  const handlePointerDown = (e) => {
    if (e.button !== 0 || !activeDecal || !containerRef.current || !handleRef.current) return;
    const boxRect = containerRef.current.getBoundingClientRect();
    const currentLeftPx = (activeDecal.centerMm.x / GARMENT_REFERENCE_MM.width) * boxRect.width;
    const currentTopPx = (activeDecal.centerMm.y / GARMENT_REFERENCE_MM.height) * boxRect.height;

    dragOffsetRef.current = {
      x: e.clientX - (boxRect.left + currentLeftPx),
      y: e.clientY - (boxRect.top + currentTopPx),
      isDragging: true,
    };
    handleRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!handleRef.current?.hasPointerCapture(e.pointerId) || !containerRef.current || !activeDecal) return;
    const boxRect = containerRef.current.getBoundingClientRect();
    const localX = e.clientX - boxRect.left - dragOffsetRef.current.x;
    const localY = e.clientY - boxRect.top - dragOffsetRef.current.y;

    const xMm = (localX / boxRect.width) * GARMENT_REFERENCE_MM.width;
    const yMm = (localY / boxRect.height) * GARMENT_REFERENCE_MM.height;
    commitDecalMoveMm(xMm, yMm);
  };

  const handleLostPointerCapture = () => {
    dragOffsetRef.current.isDragging = false;
    setSnapGuides({ verticalCenter: false, horizontalChest: false, horizontalSponsor: false });
  };

  // Movimiento accesible con teclas de dirección (Shift = paso fino de 1 mm, normal = 5 mm)
  const handleKeyDown = (e) => {
    if (!activeDecal) return;
    const stepMm = e.shiftKey ? 1 : 5;
    let dx = 0;
    let dy = 0;
    if (e.key === 'ArrowLeft') dx = -stepMm;
    else if (e.key === 'ArrowRight') dx = stepMm;
    else if (e.key === 'ArrowUp') dy = -stepMm;
    else if (e.key === 'ArrowDown') dy = stepMm;
    else return;

    e.preventDefault();
    commitDecalMoveMm(activeDecal.centerMm.x + dx, activeDecal.centerMm.y + dy);
  };

  const placementAudit = activeDecal ? evaluateDecalPlacement(activeDecal, null, false) : null;
  const dpiAudit = activeDecal
    ? calculateEffectiveDpi(
        activeDecal.widthPx || 1200,
        activeDecal.sizeMm.width,
        activeDecal.scale ?? 1,
        activeDecal.isVector
      )
    : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      {/* Contenedor cuadrado proporcional 1:1 del molde */}
      <div
        ref={containerRef}
        className="relative w-full max-w-[490px] aspect-square mx-auto select-none"
      >
        <canvas
          ref={canvasRef}
          onClick={(e) => {
            if (!containerRef.current) return;
            const r = containerRef.current.getBoundingClientRect();
            const xMm = ((e.clientX - r.left) / r.width) * GARMENT_REFERENCE_MM.width;
            const yMm = ((e.clientY - r.top) / r.height) * GARMENT_REFERENCE_MM.height;
            const clicked = panelDecals.find((d) => {
              const hw = (d.sizeMm.width * (d.scale ?? 1)) / 2 + 12;
              const hh = (d.sizeMm.height * (d.scale ?? 1)) / 2 + 12;
              return Math.abs(xMm - d.centerMm.x) <= hw && Math.abs(yMm - d.centerMm.y) <= hh;
            });
            if (clicked) onSelectDecal(clicked.id);
          }}
          className="w-full h-full drop-shadow-[0_18px_35px_rgba(0,0,0,0.65)]"
        />

        {/* Gizmo Flotante con Handle Dedicado sobre el Decal Seleccionado */}
        {activeDecal && (
          <div
            style={{
              left: `${(activeDecal.centerMm.x / GARMENT_REFERENCE_MM.width) * 100}%`,
              top: `${(activeDecal.centerMm.y / GARMENT_REFERENCE_MM.height) * 100}%`,
              width: `${((activeDecal.sizeMm.width * (activeDecal.scale ?? 1)) / GARMENT_REFERENCE_MM.width) * 100}%`,
              height: `${((activeDecal.sizeMm.height * (activeDecal.scale ?? 1)) / GARMENT_REFERENCE_MM.height) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${activeDecal.rotationDeg || 0}deg)`,
            }}
            className={`absolute pointer-events-none border-2 rounded ${
              placementAudit?.isOutOfSafeZone
                ? 'border-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.35)]'
                : 'border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.25)]'
            }`}
          >
            {/* Manejador dedicado de arrastre accesible con Pointer Capture + Flechas */}
            <button
              ref={handleRef}
              type="button"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onLostPointerCapture={handleLostPointerCapture}
              onKeyDown={handleKeyDown}
              aria-label={`Mover ${activeDecal.label}. Usa arrastrar o las flechas del teclado para posicionar`}
              className="decal-drag-handle pointer-events-auto absolute -top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-lg flex items-center gap-1 focus:outline-2 focus:outline-sky-400"
            >
              <Move className="w-3 h-3" />
              <span>MOVER</span>
            </button>
          </div>
        )}
      </div>

      {/* Telemetría en vivo de Bounding Box + DPI (Estilo CustomInk) */}
      {activeDecal && placementAudit && dpiAudit && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300">
            Pos: {activeDecal.centerMm.x}×{activeDecal.centerMm.y} mm • Tam:{' '}
            {Math.round(activeDecal.sizeMm.width * (activeDecal.scale ?? 1))}×
            {Math.round(activeDecal.sizeMm.height * (activeDecal.scale ?? 1))} mm
          </span>

          <span
            className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 ${
              placementAudit.isOutOfSafeZone
                ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                : 'text-sky-300 border-sky-500/30 bg-sky-500/10'
            }`}
          >
            {placementAudit.isOutOfSafeZone ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                Desborde: +{placementAudit.maxOverflowMm} mm fuera de costura segura
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dentro de Área Imprimible
              </>
            )}
          </span>

          <span className={`px-2.5 py-1 rounded-lg border font-bold ${dpiAudit.colorClass}`}>
            {dpiAudit.label}
          </span>
        </div>
      )}
    </div>
  );
}
