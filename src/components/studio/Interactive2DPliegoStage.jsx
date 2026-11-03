import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Scissors, 
  Download, 
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { 
  generateProductionMoldSvgString, 
  composeDirect3DTextures, 
  composeDirect3DTexturesAsync 
} from '../../engine/compositor/moldFlatteningEngine';
import { generateGarmentTailoringSvgString } from '../../engine/compositor/tailoringPliegosRegistry';

export default function Interactive2DPliegoStage({
  design,
  activePlayer,
  artworkRegistry = {},
  onOpenProductionModal,
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const productModelId = design?.productModelId || 'futbol_jersey_pro_vneck';

  // Texturas 3D en alta resolución sincronizadas en tiempo real sobre las piezas de patronaje
  const [directTextures, setDirectTextures] = useState(() => {
    return composeDirect3DTextures(design, activePlayer, artworkRegistry);
  });

  useEffect(() => {
    let isCancelled = false;

    // 1. Renderizado directo síncrono ultra-rápido (usa caché de máscaras y canvas en caliente)
    const syncTex = composeDirect3DTextures(design, activePlayer, artworkRegistry);
    if (syncTex) {
      setDirectTextures(syncTex);
    }

    // 2. Renderizado asíncrono para precargar mapas de bits .fish, escudos y patrocinadores
    composeDirect3DTexturesAsync(design, activePlayer, artworkRegistry)
      .then((asyncTex) => {
        if (!isCancelled && asyncTex) {
          setDirectTextures(asyncTex);
        }
      })
      .catch((err) => {
        console.warn('[Interactive2DPliegoStage] async direct texture update warning:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [design, activePlayer, artworkRegistry, productModelId]);

  // Generar SVG enriquecido en tiempo real del pliego de confección
  const svgContent = useMemo(() => {
    let raw = '';
    if (productModelId === 'futbol_jersey_pro_vneck') {
      raw = generateProductionMoldSvgString(design, activePlayer, {
        directTextures,
        artworkRegistry,
        showCutLines: true,
        showLabels: true,
      });
    } else {
      raw = generateGarmentTailoringSvgString(productModelId, design, activePlayer, {
        directTextures,
        artworkRegistry,
      });
    }
    return raw ? raw.replace(/^<\?xml[^>]*\?>\s*/i, '') : '';
  }, [productModelId, design, activePlayer, artworkRegistry, directTextures]);

  const handleZoomIn = () => setScale((s) => Math.min(s * 1.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s / 1.25, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Soporte de rueda de ratón para zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((s) => Math.max(0.4, Math.min(5, s * delta)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      className="relative w-full h-full bg-[#0d131f] select-none overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center protected-graphics"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(13, 19, 31, 1) 100%),
          linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px',
      }}
    >
      {/* Badge Superior: Modo Plantilla 2D */}
      <div className="pointer-events-none absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-black text-white">
          <Scissors className="w-3.5 h-3.5 text-emerald-400" />
          <span>PLIEGO 2D CONFECCIÓN TEXTIL (1:1 RIP)</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold border border-emerald-400/30">
            En Vivo
          </span>
        </div>
      </div>

      {/* Contenedor del SVG con Pan y Zoom */}
      <div 
        className="w-full h-full flex items-center justify-center p-4 transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div 
          className="relative w-auto h-full max-h-[88%] aspect-[3543/3401] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-300 pointer-events-auto"
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }}
        >
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
          {/* Capa de protección invisible: anula click derecho sobre imágenes internas */}
          <div 
            className="absolute inset-0 z-10 select-none cursor-grab active:cursor-grabbing"
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
            onDragStart={(e) => {
              e.preventDefault();
              return false;
            }}
          />
        </div>
      </div>

      {/* Barra de Controles Inferior Izquierda */}
      <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-xl text-white">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Acercar (Zoom In)"
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Alejar (Zoom Out)"
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleReset}
          title="Restablecer Encuadre"
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <div className="px-2 text-[11px] font-bold text-slate-400">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Botón Inferior Derecho: Abrir Modal de Especificaciones Técnicas */}
      <div className="pointer-events-auto absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenProductionModal}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer transition-colors"
        >
          <Scissors className="w-4 h-4" />
          <span>Ficha Técnica y Descarga 1:1</span>
        </button>
      </div>
    </div>
  );
}
