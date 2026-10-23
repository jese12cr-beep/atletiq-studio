import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Move,
  RotateCw,
  Maximize2,
  X,
  Copy,
  Pin,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  Scan,
} from 'lucide-react';
import {
  loadFishDesignMasks,
  resolveActiveFishDesignMeta,
  composeGarmentPartCanvas,
} from './fishPartCompositor';
import {
  loadMirlModelTemplate,
  getMirlPartPatternMask2D,
} from '../viewer3d/mirlModelLoader';
import { ENGINE_PRODUCTS } from '../core/designStore';
import {
  getPartSpec,
  getDroppablePanelsForProduct,
  evaluateDecalPlacement,
  snapRotationAngle,
} from '../core/boundingBoxMath';
import { calculateEffectiveDpi } from '../core/dpiValidator';

const PANEL_TO_PARTNAME = {
  front: 'Front',
  back: 'Back',
  left_arm: 'LeftArm',
  right_arm: 'RightArm',
  right_leg: 'RightLeg',
  left_leg: 'LeftLeg',
  collar: 'Collar',
};

/**
 * Renderiza una pieza del patrón sobre un `<canvas>` recortada exactamente a la silueta anatómica real
 * extraída de los triángulos UV del archivo `.mirl`, añadiendo línea blanca de corte láser y sangrado +15 mm.
 */
function renderAnatomicalPatternToCanvas({
  outCanvas,
  partName,
  panelId,
  design,
  activePlayer,
  artworkRegistry,
  fishMasks,
  mirlTemplate,
  overlayOptions,
}) {
  if (!outCanvas) return null;

  const isWideStrip = partName === 'Collar';
  const isSleeve = partName === 'LeftArm' || partName === 'RightArm';
  const W = 1024;
  const H = isWideStrip ? 220 : isSleeve ? 560 : 1024;

  if (outCanvas.width !== W) outCanvas.width = W;
  if (outCanvas.height !== H) outCanvas.height = H;

  const ctx = outCanvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // 1. Componer el arte completo de la pieza en un buffer temporal
  const rawCanvas = document.createElement('canvas');
  rawCanvas.width = W;
  rawCanvas.height = H;
  composeGarmentPartCanvas(
    rawCanvas,
    partName,
    design,
    activePlayer,
    artworkRegistry,
    fishMasks,
    overlayOptions
  );

  // 2. Obtener la máscara anatómica real del modelo `.mirl`
  const patternMask = mirlTemplate ? getMirlPartPatternMask2D(mirlTemplate, partName, W, H) : null;

  if (!patternMask) {
    ctx.drawImage(rawCanvas, 0, 0, W, H);
    return { width: W, height: H, uvBounds: { minU: 0, maxU: 1, minV: 0, maxV: 1 } };
  }

  // Recortar el arte exactamente con la silueta de costura real (`destination-in`)
  const rCtx = rawCanvas.getContext('2d');
  rCtx.save();
  rCtx.globalCompositeOperation = 'destination-in';
  rCtx.drawImage(patternMask.maskCanvas, 0, 0, W, H);
  rCtx.restore();

  // 3. Dibujar margen exterior de sangrado (+15 mm overlock) punteado en magenta técnico
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(244, 114, 182, 0.65)';
  ctx.lineWidth = Math.max(8, Math.round(W * 0.016));
  ctx.setLineDash([12, 8]);
  ctx.stroke(patternMask.boundaryPath);
  ctx.restore();

  // 4. Sombra suave sobre la mesa de corte y estampado real de la pieza recortada
  ctx.save();
  ctx.shadowColor = 'rgba(2, 6, 23, 0.82)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.drawImage(rawCanvas, 0, 0, W, H);
  ctx.restore();

  // 5. Ejes sutiles de simetría / planchado (centro pecho, muslo frontal, costura lateral) recortados dentro del molde
  const spec = getPartSpec(design.productModelId, panelId);
  if (Array.isArray(spec.snapAxesU)) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    for (const axisU of spec.snapAxesU) {
      const x = axisU * W;
      ctx.beginPath();
      ctx.moveTo(x, patternMask.uvBounds.minV * H);
      ctx.lineTo(x, patternMask.uvBounds.maxV * H);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Contorno nítido de corte láser (línea continua blanca interior)
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.92)';
  ctx.lineWidth = 2.2;
  ctx.stroke(patternMask.boundaryPath);
  ctx.restore();

  return { width: W, height: H, uvBounds: patternMask.uvBounds };
}

function MiniPieceCard({
  panelMeta,
  isSelected,
  design,
  activePlayer,
  artworkRegistry,
  fishMasks,
  mirlTemplate,
  onSelect,
}) {
  const miniCanvasRef = useRef(null);
  const partName = PANEL_TO_PARTNAME[panelMeta.panelId] || 'Front';

  useEffect(() => {
    if (!miniCanvasRef.current) return;
    renderAnatomicalPatternToCanvas({
      outCanvas: miniCanvasRef.current,
      partName,
      panelId: panelMeta.panelId,
      design,
      activePlayer,
      artworkRegistry,
      fishMasks,
      mirlTemplate,
      overlayOptions: null,
    });
  }, [design, activePlayer, artworkRegistry, fishMasks, mirlTemplate, panelMeta.panelId, partName]);

  return (
    <button
      type="button"
      onClick={() => onSelect(panelMeta.panelId)}
      className={`group flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-left ${
        isSelected
          ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_0_2px_rgba(251,191,36,0.2)]'
          : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
      }`}
    >
      <div className="w-full flex items-center justify-between text-[11px] mb-1.5">
        <span className="font-bold text-slate-100 group-hover:text-amber-300">{panelMeta.label}</span>
        <span className="font-mono text-[10px] text-slate-400">
          {(panelMeta.widthMm / 10).toFixed(0)}×{(panelMeta.heightMm / 10).toFixed(0)} cm
        </span>
      </div>
      <div className="w-full h-44 flex items-center justify-center checkered-preview rounded-xl p-2 overflow-hidden">
        <canvas
          ref={miniCanvasRef}
          style={{ aspectRatio: `${panelMeta.widthMm} / ${panelMeta.heightMm}` }}
          className="max-h-full max-w-full w-auto h-auto object-contain"
        />
      </div>
      <span className="mt-1.5 text-[10px] font-semibold text-amber-400/90">
        Clic para abrir molde 1:1 →
      </span>
    </button>
  );
}

export default function Interactive2DLab({
  design,
  panel = 'front',
  onChangePanel,
  activePlayer,
  artworkRegistry,
  selectedDecalId,
  selectedSlotKey,
  onSelectDecal,
  onSelectSlot,
  onUpdateDecal,
  onUpdateSlot,
  onDeleteDecal,
  onMirrorDecal,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const gizmoActionRef = useRef(null);
  const [fishMasks, setFishMasks] = useState(null);
  const [mirlTemplate, setMirlTemplate] = useState(null);
  const [viewLayout, setViewLayout] = useState('single'); // 'single' | 'all_pieces'
  const [snapGuides, setSnapGuides] = useState({
    verticalCenter: false,
    horizontalChest: false,
    horizontalSponsor: false,
  });

  const currentProduct =
    ENGINE_PRODUCTS.find((p) => p.id === design.productModelId) || ENGINE_PRODUCTS[0];
  const droppablePanels = useMemo(
    () => getDroppablePanelsForProduct(design.productModelId),
    [design.productModelId]
  );

  const safePanel = droppablePanels.some((p) => p.panelId === panel)
    ? panel
    : droppablePanels[0]?.panelId || 'front';

  const spec = getPartSpec(design.productModelId, safePanel);
  const partName = PANEL_TO_PARTNAME[safePanel] || 'Front';
  const panelDecals = (design.decals || []).filter((d) => (d.panel || 'front') === safePanel);
  const activeDecal =
    (selectedDecalId && panelDecals.find((d) => d.id === selectedDecalId)) || null;

  // Resolver si hay un Slot Variable seleccionado en esta pieza
  const activeSlotInfo = useMemo(() => {
    if (!selectedSlotKey || !design.variableSlots?.[selectedSlotKey]) return null;
    const slot = design.variableSlots[selectedSlotKey];
    if (!slot.enabled) return null;
    const slotPanel =
      selectedSlotKey === 'playerNameBack' || selectedSlotKey === 'playerNumberBack'
        ? 'back'
        : selectedSlotKey === 'playerNumberFront'
        ? 'front'
        : slot.panel || 'front';
    if (slotPanel !== safePanel) return null;

    const widthMm =
      selectedSlotKey === 'playerNameBack'
        ? slot.maxWidthMm || 260
        : (slot.heightMm || 68) * 0.95;
    const heightMm =
      selectedSlotKey === 'playerNameBack'
        ? (slot.capHeightMm || 52) * 1.2
        : (slot.heightMm || 68) * 1.0;

    return {
      key: selectedSlotKey,
      slot,
      widthMm,
      heightMm,
      label:
        selectedSlotKey === 'playerNameBack'
          ? 'Nombre Espalda'
          : selectedSlotKey === 'playerNumberBack'
          ? 'Dorsal Trasero'
          : 'Número Variable',
    };
  }, [selectedSlotKey, design.variableSlots, safePanel]);

  // Cargar geometría `.mirl` para extraer la silueta anatómica real 2D
  useEffect(() => {
    let cancelled = false;
    const mirlUrl = currentProduct.mirlUrl || '/models/football_f3_ka.mirl';
    loadMirlModelTemplate(mirlUrl)
      .then((tpl) => {
        if (!cancelled) setMirlTemplate(tpl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currentProduct.mirlUrl]);

  // Cargar máscaras `.fish` del diseño activo
  useEffect(() => {
    let cancelled = false;
    const activeFish = resolveActiveFishDesignMeta(design);
    if (!activeFish?.fileUrl) {
      setFishMasks(null);
      return;
    }
    loadFishDesignMasks(activeFish.fileUrl)
      .then((m) => {
        if (!cancelled) setFishMasks(m);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [design.productModelId, design.patternId]);

  // Renderizar pieza anatómica principal
  useEffect(() => {
    if (viewLayout !== 'single' || !canvasRef.current) return;
    renderAnatomicalPatternToCanvas({
      outCanvas: canvasRef.current,
      partName,
      panelId: safePanel,
      design,
      activePlayer,
      artworkRegistry,
      fishMasks,
      mirlTemplate,
      overlayOptions: {
        showGuides: Boolean(
          snapGuides.verticalCenter || snapGuides.horizontalChest || snapGuides.horizontalSponsor
        ),
        showSelectionBox: false,
        panel: safePanel,
        selectedDecalId: activeDecal?.id,
        selectedSlotKey: activeSlotInfo?.key,
        snapGuides,
      },
    });
  }, [
    viewLayout,
    design,
    safePanel,
    partName,
    activePlayer,
    artworkRegistry,
    fishMasks,
    mirlTemplate,
    activeDecal?.id,
    activeSlotInfo?.key,
    snapGuides,
  ]);

  const commitDecalMoveMm = (decalObj, rawXmm, rawYmm, recordHistory = false) => {
    const candidate = {
      ...decalObj,
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

    onUpdateDecal?.(
      decalObj.id,
      {
        centerMm: {
          x: Math.round(finalCenter.x * 10) / 10,
          y: Math.round(finalCenter.y * 10) / 10,
        },
      },
      recordHistory
    );
  };

  // Manejadores unificados del Gizmo Owayo en 2D (`move` | `scale` | `rotate`)
  const startGizmoInteraction = (e, mode) => {
    e.stopPropagation();
    if (e.button !== 0 || !containerRef.current) return;

    const targetIsSlot = Boolean(!activeDecal && activeSlotInfo);
    if (targetIsSlot && activeSlotInfo.slot.pinned) return;
    if (!targetIsSlot && (!activeDecal || activeDecal.pinned)) return;

    const boxRect = containerRef.current.getBoundingClientRect();
    const centerMm = targetIsSlot ? activeSlotInfo.slot.centerMm : activeDecal.centerMm;
    const centerPxX = boxRect.left + (centerMm.x / spec.widthMm) * boxRect.width;
    const centerPxY = boxRect.top + (centerMm.y / spec.heightMm) * boxRect.height;

    const startDist = Math.max(12, Math.hypot(e.clientX - centerPxX, e.clientY - centerPxY));
    const startAngleRad = Math.atan2(e.clientY - centerPxY, e.clientX - centerPxX);

    gizmoActionRef.current = {
      pointerId: e.pointerId,
      mode,
      targetIsSlot,
      centerPxX,
      centerPxY,
      offsetPxX: e.clientX - centerPxX,
      offsetPxY: e.clientY - centerPxY,
      startDist,
      startScale: targetIsSlot ? 1 : activeDecal.scale ?? 1,
      startSlotHeight: targetIsSlot
        ? activeSlotInfo.key === 'playerNameBack'
          ? activeSlotInfo.slot.capHeightMm || 52
          : activeSlotInfo.slot.heightMm || 68
        : 0,
      startAngleRad,
      startRotationDeg: targetIsSlot ? 0 : activeDecal.rotationDeg || 0,
      moved: false,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleGizmoPointerMove = (e) => {
    const act = gizmoActionRef.current;
    if (!act || !e.currentTarget.hasPointerCapture(e.pointerId) || !containerRef.current) return;
    act.moved = true;

    const boxRect = containerRef.current.getBoundingClientRect();

    if (act.mode === 'move') {
      const localX = e.clientX - boxRect.left - act.offsetPxX;
      const localY = e.clientY - boxRect.top - act.offsetPxY;
      const xMm = (localX / boxRect.width) * spec.widthMm;
      const yMm = (localY / boxRect.height) * spec.heightMm;

      if (act.targetIsSlot && activeSlotInfo) {
        const clampedX = Math.max(20, Math.min(spec.widthMm - 20, xMm));
        const clampedY = Math.max(20, Math.min(spec.heightMm - spec.sperrbezirkMm - 10, yMm));
        const axisMm = spec.snapCenterU * spec.widthMm;
        const snapVert = Math.abs(clampedX - axisMm) <= 10;
        setSnapGuides({
          verticalCenter: snapVert,
          snapCenterX: axisMm,
          horizontalChest: false,
          horizontalSponsor: false,
        });
        onUpdateSlot?.(
          activeSlotInfo.key,
          {
            ...activeSlotInfo.slot,
            centerMm: {
              x: Math.round((snapVert ? axisMm : clampedX) * 10) / 10,
              y: Math.round(clampedY * 10) / 10,
            },
          },
          false
        );
      } else if (activeDecal) {
        commitDecalMoveMm(activeDecal, xMm, yMm, false);
      }
    } else if (act.mode === 'scale') {
      const curDist = Math.max(8, Math.hypot(e.clientX - act.centerPxX, e.clientY - act.centerPxY));
      const ratio = curDist / act.startDist;
      if (act.targetIsSlot && activeSlotInfo) {
        const nextH = Math.round(Math.max(22, Math.min(290, act.startSlotHeight * ratio)));
        const field = activeSlotInfo.key === 'playerNameBack' ? 'capHeightMm' : 'heightMm';
        onUpdateSlot?.(activeSlotInfo.key, { ...activeSlotInfo.slot, [field]: nextH }, false);
      } else if (activeDecal) {
        const nextScale = Math.max(0.18, Math.min(3.6, +(act.startScale * ratio).toFixed(2)));
        onUpdateDecal?.(activeDecal.id, { scale: nextScale }, false);
      }
    } else if (act.mode === 'rotate' && activeDecal) {
      const curAngleRad = Math.atan2(e.clientY - act.centerPxY, e.clientX - act.centerPxX);
      const deltaDeg = ((curAngleRad - act.startAngleRad) * 180) / Math.PI;
      let rawDeg = act.startRotationDeg + deltaDeg;
      while (rawDeg > 180) rawDeg -= 360;
      while (rawDeg < -180) rawDeg += 360;
      const snappedDeg = snapRotationAngle(Math.round(rawDeg), 5);
      onUpdateDecal?.(activeDecal.id, { rotationDeg: snappedDeg }, false);
    }
  };

  const endGizmoInteraction = () => {
    const act = gizmoActionRef.current;
    gizmoActionRef.current = null;
    setSnapGuides({ verticalCenter: false, horizontalChest: false, horizontalSponsor: false });
    if (act?.moved) {
      if (act.targetIsSlot && activeSlotInfo) {
        onUpdateSlot?.(activeSlotInfo.key, { ...activeSlotInfo.slot }, true);
      } else if (activeDecal) {
        onUpdateDecal?.(activeDecal.id, {}, true);
      }
    }
  };

  const handleCanvasClickSelect = (e) => {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const xMm = ((e.clientX - r.left) / r.width) * spec.widthMm;
    const yMm = ((e.clientY - r.top) / r.height) * spec.heightMm;

    const clickedDecal = panelDecals
      .slice()
      .sort((a, b) => (b.zIndex ?? 10) - (a.zIndex ?? 10))
      .find((d) => {
        const hw = (d.sizeMm.width * (d.scale ?? 1)) / 2 + 12;
        const hh = (d.sizeMm.height * (d.scale ?? 1)) / 2 + 12;
        return Math.abs(xMm - d.centerMm.x) <= hw && Math.abs(yMm - d.centerMm.y) <= hh;
      });

    if (clickedDecal) {
      onSelectDecal?.(clickedDecal.id);
      return;
    }

    // Revisar si hizo clic en un Slot Variable en este molde
    const slots = design.variableSlots || {};
    const slotChecks = [];
    if (safePanel === 'back') {
      if (slots.playerNameBack?.enabled) {
        slotChecks.push({ key: 'playerNameBack', slot: slots.playerNameBack, hw: 130, hh: 36 });
      }
      if (slots.playerNumberBack?.enabled) {
        const h = slots.playerNumberBack.heightMm || 220;
        slotChecks.push({ key: 'playerNumberBack', slot: slots.playerNumberBack, hw: h * 0.45, hh: h * 0.48 });
      }
    } else if (safePanel === 'front' && slots.playerNumberFront?.enabled) {
      slotChecks.push({ key: 'playerNumberFront', slot: slots.playerNumberFront, hw: 36, hh: 36 });
    } else if (slots.playerNumberSleeve?.enabled && slots.playerNumberSleeve.panel === safePanel) {
      slotChecks.push({ key: 'playerNumberSleeve', slot: slots.playerNumberSleeve, hw: 34, hh: 34 });
    } else if (slots.playerNumberShorts?.enabled && slots.playerNumberShorts.panel === safePanel) {
      slotChecks.push({ key: 'playerNumberShorts', slot: slots.playerNumberShorts, hw: 44, hh: 44 });
    }

    const clickedSlot = slotChecks.find(
      (c) => Math.abs(xMm - c.slot.centerMm.x) <= c.hw && Math.abs(yMm - c.slot.centerMm.y) <= c.hh
    );
    if (clickedSlot) {
      onSelectSlot?.(clickedSlot.key);
    }
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

  const gizmoTarget = activeDecal
    ? {
        isSlot: false,
        id: activeDecal.id,
        label: activeDecal.label,
        pinned: Boolean(activeDecal.pinned),
        centerMm: activeDecal.centerMm,
        widthMm: activeDecal.sizeMm.width * (activeDecal.scale ?? 1),
        heightMm: activeDecal.sizeMm.height * (activeDecal.scale ?? 1),
        rotationDeg: activeDecal.rotationDeg || 0,
      }
    : activeSlotInfo
    ? {
        isSlot: true,
        id: activeSlotInfo.key,
        label: activeSlotInfo.label,
        pinned: Boolean(activeSlotInfo.slot.pinned),
        centerMm: activeSlotInfo.slot.centerMm,
        widthMm: activeSlotInfo.widthMm,
        heightMm: activeSlotInfo.heightMm,
        rotationDeg: 0,
      }
    : null;

  // Regla superior en centímetros cada 10 cm
  const cmTicksX = useMemo(() => {
    const totalCm = Math.round(spec.widthMm / 10);
    const ticks = [];
    for (let cm = 0; cm <= totalCm; cm += 10) {
      ticks.push(cm);
    }
    return ticks;
  }, [spec.widthMm]);

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* Barra superior de Patronaje 2D: Selector de Piezas Anatómicas + Conmutador Pieza / Mesa Completa */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1">
          {droppablePanels.map((p) => (
            <button
              key={p.panelId}
              type="button"
              onClick={() => {
                onChangePanel?.(p.panelId);
                setViewLayout('single');
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors border ${
                viewLayout === 'single' && safePanel === p.panelId
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-600'
              }`}
            >
              {p.shortLabel}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setViewLayout('single')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
              viewLayout === 'single' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            Pieza 1:1
          </button>
          <button
            type="button"
            onClick={() => setViewLayout('all_pieces')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 ${
              viewLayout === 'all_pieces' ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Mesa de Corte ({droppablePanels.length} piezas)
          </button>
        </div>
      </div>

      {/* Área central: Mesa Completa vs Molde Anatómico Interactivo 1:1 */}
      {viewLayout === 'all_pieces' ? (
        <div className="flex-1 overflow-y-auto py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {droppablePanels.map((p) => (
              <MiniPieceCard
                key={p.panelId}
                panelMeta={p}
                isSelected={safePanel === p.panelId}
                design={design}
                activePlayer={activePlayer}
                artworkRegistry={artworkRegistry}
                fishMasks={fishMasks}
                mirlTemplate={mirlTemplate}
                onSelect={(nextPanel) => {
                  onChangePanel?.(nextPanel);
                  setViewLayout('single');
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          {/* Regla milimétrica superior del patrón */}
          <div className="w-full max-w-[540px] flex justify-between px-2 mb-1 text-[9px] font-mono text-slate-500">
            {cmTicksX.map((cm) => (
              <span key={cm}>{cm}cm</span>
            ))}
          </div>

          <div
            ref={containerRef}
            style={{ aspectRatio: `${spec.widthMm} / ${spec.heightMm}` }}
            className="relative max-h-[60vh] max-w-[92%] w-auto h-full mx-auto rounded-2xl checkered-preview border border-slate-700/80 shadow-[0_22px_50px_rgba(0,0,0,0.75)] p-1.5"
          >
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClickSelect}
              className="w-full h-full block cursor-crosshair"
            />

            {/* Gizmo Owayo de 4 Esquinas (Mover, Escalar ⤡, Rotar ↻, Espejar ⧉, Eliminar ×) */}
            {gizmoTarget && (
              <div
                style={{
                  left: `${(gizmoTarget.centerMm.x / spec.widthMm) * 100}%`,
                  top: `${(gizmoTarget.centerMm.y / spec.heightMm) * 100}%`,
                  width: `${Math.max(7, (gizmoTarget.widthMm / spec.widthMm) * 100)}%`,
                  height: `${Math.max(7, (gizmoTarget.heightMm / spec.heightMm) * 100)}%`,
                  transform: `translate(-50%, -50%) rotate(${gizmoTarget.rotationDeg}deg)`,
                }}
                className={`absolute border-2 rounded-md ${
                  placementAudit?.isOutOfSafeZone
                    ? 'border-rose-500 shadow-[0_0_0_2px_rgba(244,63,94,0.35)]'
                    : gizmoTarget.pinned
                    ? 'border-sky-400 border-dashed'
                    : 'border-emerald-400 shadow-[0_0_0_2px_rgba(74,222,128,0.25)]'
                }`}
              >
                {/* Área central de arrastre (`Mover`) */}
                <button
                  type="button"
                  onPointerDown={(e) => startGizmoInteraction(e, 'move')}
                  onPointerMove={handleGizmoPointerMove}
                  onPointerUp={endGizmoInteraction}
                  onLostPointerCapture={endGizmoInteraction}
                  aria-label={`Mover ${gizmoTarget.label}`}
                  className={`decal-drag-handle absolute inset-0 w-full h-full bg-transparent ${
                    gizmoTarget.pinned ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                  }`}
                />

                {/* Etiqueta superior */}
                <div className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-950/95 border border-emerald-400/60 text-emerald-300 text-[9px] font-bold flex items-center gap-1 whitespace-nowrap shadow">
                  {gizmoTarget.pinned ? <Pin className="w-2.5 h-2.5 text-sky-300" /> : <Move className="w-2.5 h-2.5" />}
                  <span>{gizmoTarget.label}</span>
                </div>

                {/* Esquina Superior Izquierda: Eliminar (solo decals no fijados) */}
                {!gizmoTarget.isSlot && !gizmoTarget.pinned && onDeleteDecal && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDecal(gizmoTarget.id);
                    }}
                    title="Eliminar objeto"
                    className="pointer-events-auto absolute -top-3 -left-3 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-400 text-white shadow-lg flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Esquina Superior Derecha: Rotar ↻ (con imán a 0° / ±90° / ±180°) */}
                {!gizmoTarget.isSlot && !gizmoTarget.pinned && (
                  <button
                    type="button"
                    onPointerDown={(e) => startGizmoInteraction(e, 'rotate')}
                    onPointerMove={handleGizmoPointerMove}
                    onPointerUp={endGizmoInteraction}
                    onLostPointerCapture={endGizmoInteraction}
                    title="Arrastrar para rotar (imán en 0°/90°/180°)"
                    className="decal-drag-handle pointer-events-auto absolute -top-3 -right-3 w-6 h-6 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg flex items-center justify-center cursor-alias"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Esquina Inferior Izquierda: Duplicar / Espejar a pieza opuesta */}
                {!gizmoTarget.isSlot && onMirrorDecal && activeDecal && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMirrorDecal(activeDecal);
                    }}
                    title="Espejar / Clonar en pieza simétrica"
                    className="pointer-events-auto absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-lg flex items-center justify-center"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}

                {/* Esquina Inferior Derecha: Escalar proporcionalmente ⤡ */}
                {!gizmoTarget.pinned && (
                  <button
                    type="button"
                    onPointerDown={(e) => startGizmoInteraction(e, 'scale')}
                    onPointerMove={handleGizmoPointerMove}
                    onPointerUp={endGizmoInteraction}
                    onLostPointerCapture={endGizmoInteraction}
                    title="Arrastrar para escalar tamaño"
                    className="decal-drag-handle pointer-events-auto absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-lg flex items-center justify-center cursor-nwse-resize"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Barra inferior de Telemetría Física de Patronaje y DPI */}
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-[11px]">
        <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-slate-300">
          Molde Anatómico <strong className="text-amber-300">{spec.label}</strong> ({(spec.widthMm / 10).toFixed(1)}×
          {(spec.heightMm / 10).toFixed(1)} cm • Línea blanca = corte • Magenta = +15 mm costura)
        </span>

        {activeDecal && placementAudit && dpiAudit && (
          <>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 font-mono text-slate-300">
              {((activeDecal.sizeMm.width * (activeDecal.scale ?? 1)) / 10).toFixed(1)}×
              {((activeDecal.sizeMm.height * (activeDecal.scale ?? 1)) / 10).toFixed(1)} cm •{' '}
              {activeDecal.rotationDeg || 0}°
            </span>

            <span
              className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 ${
                placementAudit.isOutOfSafeZone
                  ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                  : 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
              }`}
            >
              {placementAudit.isOutOfSafeZone ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  En zona de dobladillo (+{placementAudit.maxOverflowMm} mm)
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Costura Segura OK
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
