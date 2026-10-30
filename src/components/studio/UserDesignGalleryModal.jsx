import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderHeart,
  Plus,
  Play,
  Copy,
  Trash2,
  Download,
  Calendar,
  Sparkles,
  ShoppingBag,
  Layers,
  Search,
  Check,
  ChevronRight,
  Shirt,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  loadUserGallery,
  saveDesignToGallery,
  deleteDesignFromGallery,
  duplicateDesignInGallery,
} from '../../utils/userGalleryStore';

export default function UserDesignGalleryModal({
  isOpen,
  onClose,
  currentDesign,
  currentProduct,
  currentRoster,
  unitPrice,
  totalUnits,
  totalPrice,
  onLoadDesignFromGallery,
  canvasSnapshotRef,
}) {
  const [gallery, setGallery] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(null);

  // Cargar galería al abrir o cuando ocurra un evento
  const refreshGallery = () => {
    setGallery(loadUserGallery());
  };

  useEffect(() => {
    if (isOpen) {
      refreshGallery();
      setCustomNameInput(
        `Mi ${currentProduct?.name || 'Equipación'} - ${new Date().toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
        })}`
      );
    }
  }, [isOpen, currentProduct]);

  useEffect(() => {
    const handleUpdate = () => refreshGallery();
    window.addEventListener('atletiq_gallery_updated', handleUpdate);
    return () => window.removeEventListener('atletiq_gallery_updated', handleUpdate);
  }, []);

  const filteredItems = useMemo(() => {
    return gallery.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchQuery =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [gallery, activeCategory, searchQuery]);

  const handleSaveLiveKit = () => {
    let thumb = null;
    try {
      if (canvasSnapshotRef?.current) {
        thumb = canvasSnapshotRef.current();
      }
    } catch {
      // Ignorar fallback de captura
    }

    const saved = saveDesignToGallery({
      name: customNameInput,
      design: currentDesign,
      productModelId: currentProduct?.id,
      productName: currentProduct?.name,
      category: currentProduct?.category || 'futbol',
      roster: currentRoster,
      unitPrice,
      totalUnits,
      totalPrice,
      thumbnail: thumb,
    });

    if (saved) {
      setIsSavingCurrent(false);
      setSavedSuccessMessage('¡Equipación guardada en tu galería!');
      setTimeout(() => setSavedSuccessMessage(null), 3000);
      refreshGallery();
    }
  };

  const handleDuplicate = (id) => {
    duplicateDesignInGallery(id);
    refreshGallery();
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Deseas eliminar el diseño "${name}" de tu galería?`)) {
      deleteDesignFromGallery(id);
      refreshGallery();
    }
  };

  const handleDownloadPoster = (item) => {
    if (!item.thumbnail) {
      alert('Este diseño no cuenta con captura visual disponible para descarga.');
      return;
    }
    const a = document.createElement('a');
    a.download = `ATLETIQ_${item.name.replace(/\s+/g, '_')}.png`;
    a.href = item.thumbnail;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
        
        {/* ==================== CABECERA ATLETIC DE LA GALERÍA ==================== */}
        <div className="px-4 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <FolderHeart className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white uppercase truncate">
                  Mi Galería de Diseños
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  {gallery.length} {gallery.length === 1 ? 'Guardado' : 'Guardados'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Tus equipaciones personalizadas guardadas con memoria de colores, escudos y tallas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSavingCurrent(true)}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Guardar diseño actual</span>
              <span className="sm:hidden">Guardar</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-lg"
              title="Cerrar galería"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notificación Toast */}
        {savedSuccessMessage && (
          <div className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 animate-fade-in shrink-0">
            <Check className="w-4 h-4" />
            <span>{savedSuccessMessage}</span>
          </div>
        )}

        {/* Formulario desplegable para guardar el diseño activo */}
        {isSavingCurrent && (
          <div className="px-4 sm:px-6 py-3.5 bg-slate-850 border-b border-slate-750 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 animate-fade-in">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Nombre de esta equipación:
              </label>
              <input
                type="text"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
                placeholder="Ej. Kit Titular Torneo 2026..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-2 sm:pt-4">
              <button
                type="button"
                onClick={handleSaveLiveKit}
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar y Guardar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSavingCurrent(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ==================== FILTROS & BUSCADOR ==================== */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'futbol', label: '⚽ Fútbol' },
              { id: 'basket', label: '🏀 Baloncesto' },
              { id: 'chaquetas', label: '🧥 Chaquetas' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en mis diseños..."
              className="w-full sm:w-64 pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500"
            />
          </div>
        </div>

        {/* ==================== GRID DE DISEÑOS GUARDADOS ==================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredItems.length === 0 ? (
            /* Estado Vacío Deportivo */
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600 shadow-inner">
                <Shirt className="w-10 h-10 text-slate-500" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h4 className="text-base font-black text-white uppercase tracking-wide">
                  Tu vestidor está vacío
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Crea tu primera equipación personalizada en el configurador 3D/2D y pulsa «Guardar en Galería» para tenerla siempre a mano.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSavingCurrent(true)}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-sky-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar la prenda actual</span>
              </button>
            </div>
          ) : (
            /* Cuadrícula de Tarjetas de Diseño */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-850 border border-slate-750 overflow-hidden shadow-lg hover:border-slate-650 transition-all flex flex-col group"
                >
                  {/* Escenario de Miniatura */}
                  <div className="relative aspect-4/3 bg-radial from-slate-800 to-slate-900 border-b border-slate-750 flex items-center justify-center p-4 overflow-hidden">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600">
                        <Shirt className="w-8 h-8 text-sky-400" />
                      </div>
                    )}

                    {/* Paleta de Colores en miniatura */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-slate-950/80 backdrop-blur-sm p-1 rounded-lg border border-slate-800">
                      {(item.colorPalette || []).map((hex, i) => (
                        <span
                          key={i}
                          style={{ backgroundColor: hex }}
                          className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block shadow-xs"
                        />
                      ))}
                    </div>

                    {/* Tag de Categoría */}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] font-bold text-slate-300 uppercase">
                      {item.category}
                    </span>
                  </div>

                  {/* Datos del Diseño */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="text-sm font-black text-white leading-tight truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(item.savedAt).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-slate-300">
                          {item.totalUnits} {item.totalUnits === 1 ? 'ud.' : 'uds.'}
                        </span>
                      </div>
                    </div>

                    {/* Acciones del Diseño */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          onLoadDesignFromGallery?.(item);
                          onClose();
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-600/20 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Cargar en 3D / 2D</span>
                      </button>

                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(item.id)}
                          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Duplicar este diseño"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPoster(item)}
                          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Descargar captura del uniforme"
                        >
                          <Download className="w-3 h-3" />
                          <span>Póster</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/40 text-rose-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Eliminar de mi galería"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Borrar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Informativo */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Almacenamiento local persistente • Tus bocetos se conservan en este navegador</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-sky-400 hover:underline font-bold cursor-pointer"
          >
            Volver al Estudio
          </button>
        </div>

      </div>
    </div>
  );
}
