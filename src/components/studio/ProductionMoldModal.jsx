import React, { useState, useMemo, useRef } from 'react';
import {
  generateProductionMoldSvgString,
  downloadProductionMoldSvg,
  MOLD_CONSTANTS,
} from '../../engine/compositor/moldFlatteningEngine';

/**
 * ATLETIQ — ProductionMoldModal
 * Modal de visualización y exportación de la Plantilla de Confección Textil (Escala 1:1).
 * Muestra el pliego completo de corte físico (Frente, Espalda, Tira de Cuello y Mangas)
 * con los logotipos subidos por el usuario, dorsales y diseño 3D proyectados con precisión industrial.
 */
export default function ProductionMoldModal({
  isOpen,
  onClose,
  design,
  roster = [],
  artworkRegistry = {},
}) {
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);
  const [showCutLines, setShowCutLines] = useState(true);
  const [showRegistrationMarks, setShowRegistrationMarks] = useState(true);
  const [showProductionLabels, setShowProductionLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const containerRef = useRef(null);

  const activePlayer = useMemo(() => {
    if (roster && roster.length > 0 && roster[selectedPlayerIdx]) {
      return roster[selectedPlayerIdx];
    }
    return {
      name: design?.sampleName || 'MARTÍN',
      number: design?.sampleNumber || 21,
      size: 'M',
    };
  }, [roster, selectedPlayerIdx, design]);

  // Generar marcado SVG reactivo con decals y logos embebidos en base64
  const svgMarkup = useMemo(() => {
    if (!isOpen || !design) return '';
    return generateProductionMoldSvgString(design, activePlayer, {
      showCutLines,
      showRegistrationMarks,
      showProductionLabels,
      artworkRegistry,
    });
  }, [isOpen, design, activePlayer, showCutLines, showRegistrationMarks, showProductionLabels, artworkRegistry]);

  // Marcado limpio para el DOM de React (sin declaración XML para evitar advertencias del parser HTML5)
  const cleanDomSvgMarkup = useMemo(() => {
    if (!svgMarkup) return '';
    return svgMarkup.replace(/^<\?xml[^>]*\?>\s*/i, '');
  }, [svgMarkup]);

  if (!isOpen) return null;

  // Descarga directa SVG 1:1
  const handleDownloadSvg = () => {
    downloadProductionMoldSvg(design, activePlayer, null, {
      showCutLines,
      showRegistrationMarks,
      showProductionLabels,
      artworkRegistry,
    });
  };

  // Descarga como imagen PNG de alta resolución mediante Canvas
  const handleDownloadPng = async () => {
    setIsExporting(true);
    try {
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 3543;
        canvas.height = 3401;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);

        const a = document.createElement('a');
        const safeName = (design?.clubAlias || design?.mexicoKitId || 'PLANTILLA').toLowerCase().replace(/\s+/g, '_');
        const playerName = (activePlayer?.name || 'custom').toLowerCase().replace(/\s+/g, '_');
        a.download = `PLANTILLA_CONFECCION_300DPI_${safeName}_${playerName}.png`;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URLObj.revokeObjectURL(blobURL);
        setIsExporting(false);
      };
      image.onerror = () => {
        setIsExporting(false);
      };
      image.src = blobURL;
    } catch {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-7xl h-[94vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* ==================== HEADER ==================== */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
              📐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Plantilla de Confección Textil
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Previsualización • Escala 1:1
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                  Talla M (1250 mm × 1200 mm)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Previsualización técnica de los moldes físicos de corte y confección textil (Frente, Espalda, Tira de Cuello y Mangas).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-lg font-bold"
              title="Cerrar ventana"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ==================== BARRA DE CONTROL & OPCIONES ==================== */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Selector de Jugador del Roster */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Jugador del Equipo:</span>
            {roster && roster.length > 0 ? (
              <select
                value={selectedPlayerIdx}
                onChange={(e) => setSelectedPlayerIdx(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
              >
                {roster.map((player, idx) => (
                  <option key={idx} value={idx}>
                    #{player.number || '00'} {player.name || 'JUGADOR'} ({player.size || 'M'})
                  </option>
                ))}
              </select>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-bold text-slate-800">
                #{activePlayer.number} {activePlayer.name} (Talla {activePlayer.size})
              </span>
            )}
          </div>

          {/* Filtros y Capas Técnicas */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium hover:text-slate-950">
              <input
                type="checkbox"
                checked={showCutLines}
                onChange={(e) => setShowCutLines(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Líneas de Corte & Costura</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium hover:text-slate-950">
              <input
                type="checkbox"
                checked={showRegistrationMarks}
                onChange={(e) => setShowRegistrationMarks(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Cruces de Registro & CMYK</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium hover:text-slate-950">
              <input
                type="checkbox"
                checked={showProductionLabels}
                onChange={(e) => setShowProductionLabels(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Etiquetas de Pieza</span>
            </label>
          </div>

          {/* Controles de Zoom */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(0.4, +(z - 0.15).toFixed(2)))}
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
              title="Alejar"
            >
              −
            </button>
            <span className="px-2 text-slate-600 font-mono font-bold text-[11px]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(2.5, +(z + 0.15).toFixed(2)))}
              className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg font-bold"
              title="Acercar"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-slate-500 hover:text-slate-900 rounded-lg text-[10px] font-bold"
              title="Restablecer"
            >
              Ajustar
            </button>
          </div>
        </div>

        {/* ==================== VIEWPORT DE LA PLANTILLA 2D ==================== */}
        <div
          ref={containerRef}
          className="flex-1 min-h-0 bg-slate-200/80 overflow-auto p-3 sm:p-5 flex relative select-none"
        >
          <div
            className="m-auto transition-transform duration-150 origin-center bg-white shadow-2xl rounded-2xl border border-slate-300 p-2 sm:p-4 flex items-center justify-center max-h-full max-w-full aspect-[3543.31/3401.57]"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div
              className="w-full h-full flex items-center justify-center select-none [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:object-contain"
              dangerouslySetInnerHTML={{ __html: cleanDomSvgMarkup }}
            />
          </div>
        </div>

        {/* ==================== FOOTER & ACCIONES DE DESCARGA ==================== */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Patrón listo para RIP de impresión textil • Sangrado perimetral de 10 mm incluido en cada pieza
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Botón Descargar PNG Alta Resolución */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-102 flex items-center justify-center gap-1.5"
            >
              <span>🖼️</span>
              <span>{isExporting ? 'Procesando...' : 'Descargar Imagen 300 DPI'}</span>
            </button>

            {/* Botón Principal: Descargar SVG 1:1 Vectorial */}
            <button
              type="button"
              id="btn-download-mold-svg"
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all cursor-pointer shadow-md hover:scale-102 flex items-center justify-center gap-2"
            >
              <span>⬇</span>
              <span>Descargar Plantilla SVG 1:1 (Plotter / Illustrator)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
