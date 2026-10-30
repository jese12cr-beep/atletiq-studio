import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Scissors,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  loadFishDesignMasks,
  resolveActiveFishDesignMeta,
  composeGarmentPartCanvas,
} from './fishPartCompositor';
import { getDroppablePanelsForProduct, getPartSpec } from '../core/boundingBoxMath';
import { ENGINE_PRODUCTS } from '../core/designStore';

const PANEL_LABELS = {
  front: 'Frente',
  back: 'Espalda',
  left_arm: 'Manga Izq.',
  right_arm: 'Manga Der.',
  right_leg: 'Pierna Der.',
  left_leg: 'Pierna Izq.',
  collar: 'Cuello',
};

const PANEL_TO_PARTNAME = {
  front: 'Front',
  back: 'Back',
  left_arm: 'LeftArm',
  right_arm: 'RightArm',
  right_leg: 'RightLeg',
  left_leg: 'LeftLeg',
  collar: 'Collar',
};

export default function GarmentCanvas2DStage({
  design,
  activePlayer,
  artworkRegistry = {},
  selectedPanel = 'front',
  onChangePanel,
  onOpenProductionMold,
}) {
  const [currentPanel, setCurrentPanel] = useState(selectedPanel || 'front');
  const [fishMasks, setFishMasks] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const canvasRef = useRef(null);

  const droppablePanels = useMemo(
    () => getDroppablePanelsForProduct(design.productModelId),
    [design.productModelId]
  );

  useEffect(() => {
    if (selectedPanel && droppablePanels.some((p) => p.panelId === selectedPanel)) {
      setCurrentPanel(selectedPanel);
    }
  }, [selectedPanel, droppablePanels]);

  // Cargar máscaras `.fish` reactivamente
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

  // Renderizar la pieza 2D activa en el canvas principal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const spec = getPartSpec(design.productModelId, currentPanel);
    const partName = spec?.partName || PANEL_TO_PARTNAME[currentPanel] || 'Front';

    const isWideStrip = partName === 'Collar';
    const isSleeve = partName === 'LeftArm' || partName === 'RightArm';
    const W = 1024;
    const H = isWideStrip ? 240 : isSleeve ? 600 : 1024;

    if (canvas.width !== W) canvas.width = W;
    if (canvas.height !== H) canvas.height = H;

    composeGarmentPartCanvas(
      canvas,
      partName,
      design,
      activePlayer,
      artworkRegistry,
      fishMasks,
      {
        panel: currentPanel,
        showGuides: false,
        showSelectionBox: false,
      }
    );
  }, [design, currentPanel, activePlayer, artworkRegistry, fishMasks]);

  const handleSelectPanel = (panelId) => {
    setCurrentPanel(panelId);
    onChangePanel?.(panelId);
  };

  return (
    <div className="garment-2d-stage relative w-full h-full min-h-[280px] sm:min-h-[400px] flex flex-col bg-[radial-gradient(circle_at_50%_40%,#1e293b_0%,#0f172a_60%,#020617_100%)] text-white select-none overflow-hidden">
      
      {/* 1. Selector Superior de Piezas 2D */}
      <div className="absolute top-2.5 sm:top-4 left-2 right-2 sm:left-4 sm:right-4 flex items-center justify-between gap-2 z-20 pointer-events-auto">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {droppablePanels.map((p) => {
            const isSelected = currentPanel === p.panelId;
            return (
              <button
                key={p.panelId}
                type="button"
                onClick={() => handleSelectPanel(p.panelId)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20 scale-102'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/80 backdrop-blur-sm'
                }`}
              >
                {PANEL_LABELS[p.panelId] || p.label || p.panelId}
              </button>
            );
          })}
        </div>

        {/* Acceso directo a Plantilla de Confección 2D */}
        {onOpenProductionMold && (
          <button
            type="button"
            id="btn-stage-open-production-mold"
            onClick={onOpenProductionMold}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 border border-emerald-400/40 backdrop-blur-sm transition-all cursor-pointer shrink-0"
            title="Abrir plantilla 1:1 de confección y corte con todas las piezas"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Plantilla 2D</span>
          </button>
        )}
      </div>

      {/* 2. Escenario Central con Lienzo 2D de la Prenda */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
        <div
          className="relative transition-transform duration-200 origin-center flex items-center justify-center max-h-[88%] max-w-[88%]"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Sombra y Relieve Textil de la Pieza */}
          <div className="relative rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-slate-700/60 bg-slate-950/40 backdrop-blur-xs">
            <canvas
              ref={canvasRef}
              className="max-h-[62vh] max-w-[82vw] sm:max-w-[460px] object-contain block"
            />

            {/* Sutil brillo textil superior */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Barra Flotante Inferior de Herramientas de Zoom */}
      <div className="absolute bottom-3 left-3 sm:left-4 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-lg backdrop-blur-sm z-20">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(0.6, +(z - 0.2).toFixed(2)))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Alejar"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="px-1.5 text-[11px] font-mono font-bold text-sky-400 min-w-[38px] text-center">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(2.0, +(z + 0.2).toFixed(2)))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Acercar"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(1)}
          className="px-2 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Restablecer"
        >
          100%
        </button>
      </div>

      {/* Indicador de Modo 2D en esquina inferior derecha */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
        <div className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center gap-1.5 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="uppercase tracking-wider">Render 2D Plano 1024px</span>
        </div>
      </div>

    </div>
  );
}
