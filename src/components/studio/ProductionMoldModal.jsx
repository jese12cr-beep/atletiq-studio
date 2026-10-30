import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  generateProductionMoldSvgString,
  downloadProductionMoldSvg,
  composeDirect3DTextures,
  composeDirect3DTexturesAsync,
  preloadDesignArtworkImages,
  MOLD_CONSTANTS,
} from '../../engine/compositor/moldFlatteningEngine';
import { useAuth } from '../../engine/auth/authManager';
import UserAuthModal from '../auth/UserAuthModal';

/**
 * ATLETIQ — ProductionMoldModal
 * Modal de visualización y exportación de la Plantilla de Confección Textil (Escala 1:1).
 * Muestra el pliego completo de corte físico (Frente, Espalda y Mangas)
 * con los logotipos subidos por el usuario, dorsales y diseño 3D proyectados con precisión industrial.
 */
export default function ProductionMoldModal({
  isOpen,
  onClose,
  design,
  roster = [],
  artworkRegistry = {},
  onProceedToOrder,
}) {
  const [selectedPlayerIdx, setSelectedPlayerIdx] = useState(0);

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

  const [showCutLines, setShowCutLines] = useState(true);
  const [showRegistrationMarks, setShowRegistrationMarks] = useState(true);
  const [showProductionLabels, setShowProductionLabels] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [directTextures, setDirectTextures] = useState(null);

  // Control de autenticación y privilegios de descarga
  const { currentUser, isAdmin, isAuthenticated, setAdminMode } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const pendingActionRef = useRef(null);

  const containerRef = useRef(null);

  // Asegurar que al abrir la plantilla inicie siempre centrada y arriba (todas las piezas visibles)
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
        containerRef.current.scrollLeft = 0;
      }
      // Inicializar de inmediato con texturas sincrónicas desde caché
      const initTex = composeDirect3DTextures(design, activePlayer, artworkRegistry);
      if (initTex) setDirectTextures(initTex);
    } else {
      setDirectTextures(null);
    }
  }, [isOpen, design, activePlayer, artworkRegistry]);

  // Precargar de inmediato todas las imágenes, logos PNG y máscaras de diseño en memoria viva
  useEffect(() => {
    if (!isOpen || !design) return;
    let cancelled = false;

    async function loadTexturesWithLogos() {
      const textures = await composeDirect3DTexturesAsync(design, activePlayer, artworkRegistry);
      if (!cancelled && textures) {
        setDirectTextures(textures);
      }
    }

    loadTexturesWithLogos();
    return () => {
      cancelled = true;
    };
  }, [isOpen, design, activePlayer, artworkRegistry]);

  // Generar marcado SVG reactivo con decals y logos embebidos en base64
  const svgMarkup = useMemo(() => {
    if (!isOpen || !design) return '';
    return generateProductionMoldSvgString(design, activePlayer, {
      showCutLines,
      showRegistrationMarks,
      showProductionLabels,
      artworkRegistry,
      directTextures,
    });
  }, [isOpen, design, activePlayer, showCutLines, showRegistrationMarks, showProductionLabels, artworkRegistry, directTextures]);

  // Marcado limpio para el DOM de React (sin declaración XML para evitar advertencias del parser HTML5)
  const cleanDomSvgMarkup = useMemo(() => {
    if (!svgMarkup) return '';
    return svgMarkup.replace(/^<\?xml[^>]*\?>\s*/i, '');
  }, [svgMarkup]);

  if (!isOpen) return null;

  // Descarga directa SVG 1:1 con logotipos PNG embebidos en base64
  const executeDownloadSvg = async () => {
    const textures = directTextures || (await composeDirect3DTexturesAsync(design, activePlayer, artworkRegistry));
    downloadProductionMoldSvg(design, activePlayer, null, {
      showCutLines,
      showRegistrationMarks,
      showProductionLabels,
      artworkRegistry,
      directTextures: textures,
    });
  };

  const handleDownloadSvg = () => {
    if (!isAuthenticated) {
      pendingActionRef.current = 'svg';
      setIsAuthModalOpen(true);
      return;
    }
    executeDownloadSvg();
  };

  // Descarga como imagen PNG de alta resolución mediante Canvas
  const executeDownloadPng = async () => {
    setIsExporting(true);
    try {
      const textures = directTextures || (await composeDirect3DTexturesAsync(design, activePlayer, artworkRegistry));
      const currentSvg = generateProductionMoldSvgString(design, activePlayer, {
        showCutLines,
        showRegistrationMarks,
        showProductionLabels,
        artworkRegistry,
        directTextures: textures,
      });

      const svgBlob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
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

  const handleDownloadPng = () => {
    if (!isAuthenticated) {
      pendingActionRef.current = 'png';
      setIsAuthModalOpen(true);
      return;
    }
    executeDownloadPng();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-7xl h-[94vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* ==================== HEADER COMPACTO Y RESPONSIVO ==================== */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-base sm:text-xl shrink-0">
              📐
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black tracking-tight text-white uppercase truncate">
                  Plantilla de Confección 2D
                </h3>
                <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Escala 1:1
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold hidden md:inline">
                  Talla M (1250 mm × 1200 mm)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate mt-0.5">
                Moldes industriales de corte y confección textil (Frente, Espalda, Cuello y Mangas).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                <span>🛡️ Admin Master</span>
                <button
                  type="button"
                  onClick={() => setAdminMode(false)}
                  title="Alternar a modo cliente para probar el registro"
                  className="ml-1 text-[9px] underline opacity-70 hover:opacity-100 cursor-pointer"
                >
                  (Probar Cliente)
                </button>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-bold">
                <span>👤 {currentUser?.name || 'Cliente'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  pendingActionRef.current = 'svg';
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                <span>🔒 Cuenta Requerida</span>
              </button>
            )}

            <button
              id="btn-close-production-mold"
              type="button"
              onClick={onClose}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-base sm:text-lg font-bold"
              title="Cerrar ventana"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ==================== BARRA DE CONTROL & OPCIONES ==================== */}
        <div className="px-3 sm:px-6 py-2 sm:py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
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
          className="flex-1 min-h-0 bg-slate-900/95 overflow-auto p-2 sm:p-4 flex items-center justify-center relative select-none"
        >
          <div
            className="m-auto transition-transform duration-150 origin-center bg-white shadow-2xl rounded-2xl border border-slate-300 p-2 sm:p-4 flex items-center justify-center max-h-full max-w-full"
            style={{
              width: zoomLevel === 1 ? '100%' : `${Math.round(zoomLevel * 100)}%`,
              height: '100%',
              maxWidth: zoomLevel === 1 ? '100%' : 'none',
              maxHeight: zoomLevel === 1 ? '100%' : 'none',
              transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
              transformOrigin: 'center center',
            }}
          >
            <div
              className="w-full h-full flex items-center justify-center select-none [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-full [&>svg]:object-contain"
              dangerouslySetInnerHTML={{ __html: cleanDomSvgMarkup }}
            />
          </div>
        </div>

        {/* ==================== FOOTER & ACCIONES DE DESCARGA ==================== */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3.5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 shrink-0">
          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Patrón listo para RIP de impresión textil • Sangrado perimetral de 10 mm incluido en cada pieza
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Botón Descargar PNG Alta Resolución */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>🖼️</span>
              <span>{isExporting ? 'Generando...' : 'Descargar Imagen'}</span>
            </button>

            {/* Botón Principal: Descargar SVG 1:1 Vectorial */}
            <button
              type="button"
              id="btn-download-mold-svg"
              onClick={handleDownloadSvg}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <span>⬇</span>
              <span>Plantilla SVG 1:1</span>
            </button>

            {/* Botón Opcional: Continuar a Pedido */}
            {onProceedToOrder && (
              <button
                type="button"
                id="btn-proceed-from-mold-to-order"
                onClick={onProceedToOrder}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5"
              >
                <span>✓</span>
                <span>Confirmar Equipación</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Registro / Login para Clientes Externos */}
      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          if (pendingActionRef.current === 'svg') executeDownloadSvg();
          else if (pendingActionRef.current === 'png') executeDownloadPng();
          pendingActionRef.current = null;
        }}
        actionLabel="descargar la plantilla técnica de producción"
      />
    </div>
  );
}
