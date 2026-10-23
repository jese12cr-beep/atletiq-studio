import React, { useEffect, useRef, useState } from 'react';
import { Move, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  loadFishDesignMasks,
  resolveActiveFishDesignMeta,
  composeGarmentPartCanvas,
} from './fishPartCompositor';
import { getPartSpec, evaluateDecalPlacement } from '../core/boundingBoxMath';
import { calculateEffectiveDpi } from '../core/dpiValidator';

const PANEL_TO_PARTNAME = {
  front: 'Front',
  back: 'Back',
  left_arm: 'LeftArm',
  right_arm: 'RightArm',
  collar: 'Collar',
};

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
  const fishMasksRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0, isDragging: false });
  const [fishTick, setFishTick] = useState(0);
  const [snapGuides, setSnapGuides] = useState({
    verticalCenter: false,
    horizontalChest: false,
    horizontalSponsor: false,
  });

  const spec = getPartSpec(design.productModelId, panel);
  const partName = PANEL_TO_PARTNAME[panel] || 'Front';
  const panelDecals = (design.decals || []).filter((d) => (d.panel || 'front') === panel);
  const activeDecal = panelDecals.find((d) => d.id === selectedDecalId) || panelDecals[0] || null;

  useEffect(() => {
    let cancelled = false;
    const activeFish = resolveActiveFishDesignMeta(design);
    if (!activeFish?.fileUrl) return;
    loadFishDesignMasks(activeFish.fileUrl)
      .then((m) => {
        if (!cancelled) {
          fishMasksRef.current = m;
          setFishTick((n) => n + 1);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [design.productModelId, design.patternId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    composeGarmentPartCanvas(
      canvas,
      partName,
      design,
      activePlayer,
      artworkRegistry,
      fishMasksRef.current,
      {
        showGuides: true,
        showSelectionBox: false,
        panel,
        selectedDecalId: activeDecal?.id,
        snapGuides,
      }
    );
  }, [design, panel, partName, activePlayer, artworkRegistry, activeDecal?.id, snapGuides, fishTick]);

  const commitDecalMoveMm = (rawXmm, rawYmm) => {
    if (!activeDecal) return;
    const candidate = {
      ...activeDecal,
      centerMm: { x: rawXmm, y: rawYmm },
    };
    const evaluated = evaluateDecalPlacement(
      candidate,
      design.productModelId,
      true,
      design.bleedEnforcement || 'SOFT_WARN'
    );
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

  const handlePointerDown = (e) => {
    if (e.button !== 0 || !activeDecal || !containerRef.current || !handleRef.current) return;
    const boxRect = containerRef.current.getBoundingClientRect();
    const currentLeftPx = (activeDecal.centerMm.x / spec.widthMm) * boxRect.width;
    const currentTopPx = (activeDecal.centerMm.y / spec.heightMm) * boxRect.height;

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

    const xMm = (localX / boxRect.width) * spec.widthMm;
    const yMm = (localY / boxRect.height) * spec.heightMm;
    commitDecalMoveMm(xMm, yMm);
  };

  const handleLostPointerCapture = () => {
    dragOffsetRef.current.isDragging = false;
    setSnapGuides({ verticalCenter: false, horizontalChest: false, horizontalSponsor: false });
  };

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

  const placementAudit = activeDecal
    ? evaluateDecalPlacement(
        activeDecal,
        design.productModelId,
        false,
        design.bleedEnforcement || 'SOFT_WARN'
      )
    : null;
  const dpiAudit = activeDecal
    ? calculateEffectiveDpi(
        activeDecal.widthPx || 1600,
        activeDecal.sizeMm.width,
        activeDecal.scale ?? 1,
        activeDecal.isVector
      )
    : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3">
      {/* Molde plano real con relación de aspecto física exacta (breiteCM : hoeheCM) */}
      <div
        ref={containerRef}
        style={{ aspectRatio: `${spec.widthMm} / ${spec.heightMm}` }}
        className="relative max-h-[68vh] max-w-[92%] w-auto h-full mx-auto select-none rounded-xl overflow-hidden border border-slate-700/80 shadow-[0_20px_45px_rgba(0,0,0,0.7)] bg-slate-900"
      >
        <canvas
          ref={canvasRef}
          onClick={(e) => {
            if (!containerRef.current) return;
            const r = containerRef.current.getBoundingClientRect();
            const xMm = ((e.clientX - r.left) / r.width) * spec.widthMm;
            const yMm = ((e.clientY - r.top) / r.height) * spec.heightMm;
            const clicked = panelDecals
              .slice()
              .reverse()
              .find((d) => {
                const hw = (d.sizeMm.width * (d.scale ?? 1)) / 2 + 12;
                const hh = (d.sizeMm.height * (d.scale ?? 1)) / 2 + 12;
                return Math.abs(xMm - d.centerMm.x) <= hw && Math.abs(yMm - d.centerMm.y) <= hh;
              });
            if (clicked) onSelectDecal(clicked.id);
          }}
          className="w-full h-full block"
        />

        {/* Gizmo de Bounding Box + Handle */}
        {activeDecal && (
          <div
            style={{
              left: `${(activeDecal.centerMm.x / spec.widthMm) * 100}%`,
              top: `${(activeDecal.centerMm.y / spec.heightMm) * 100}%`,
              width: `${((activeDecal.sizeMm.width * (activeDecal.scale ?? 1)) / spec.widthMm) * 100}%`,
              height: `${((activeDecal.sizeMm.height * (activeDecal.scale ?? 1)) / spec.heightMm) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${activeDecal.rotationDeg || 0}deg)`,
            }}
            className={`absolute pointer-events-none border-2 rounded ${
              placementAudit?.isOutOfSafeZone
                ? 'border-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.35)]'
                : 'border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.25)]'
            }`}
          >
            <button
              ref={handleRef}
              type="button"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onLostPointerCapture={handleLostPointerCapture}
              onKeyDown={handleKeyDown}
              aria-label={`Mover ${activeDecal.label}. Arrastra o usa flechas del teclado`}
              className="decal-drag-handle pointer-events-auto absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-lg flex items-center gap-1 whitespace-nowrap focus:outline-2 focus:outline-sky-400"
            >
              <Move className="w-3 h-3" />
              <span>MOVER</span>
            </button>
          </div>
        )}
      </div>

      {/* Telemetría física del molde y DPI */}
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-[11px]">
        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300">
          Pieza <strong className="text-sky-300">{spec.label}</strong> ({(spec.widthMm / 10).toFixed(1)}×
          {(spec.heightMm / 10).toFixed(1)} cm)
        </span>

        {activeDecal && placementAudit && dpiAudit && (
          <>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300">
              Pos: {(activeDecal.centerMm.x / 10).toFixed(1)},{(activeDecal.centerMm.y / 10).toFixed(1)} cm • Tam:{' '}
              {((activeDecal.sizeMm.width * (activeDecal.scale ?? 1)) / 10).toFixed(1)}×
              {((activeDecal.sizeMm.height * (activeDecal.scale ?? 1)) / 10).toFixed(1)} cm
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
                  Fuera de área segura (+{placementAudit.maxOverflowMm} mm)
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {design.bleedEnforcement === 'ALL_OVER' ? 'Modo Sangrado Total (All-Over)' : 'Dentro de Costura Segura'}
                </>
              )}
            </span>

            <span className={`px-2.5 py-1 rounded-lg border font-bold ${dpiAudit.colorClass}`}>
              {dpiAudit.label}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
