import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Layers, 
  Shirt, 
  Scissors, 
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { ENGINE_PRODUCTS } from '../../engine/core/designStore';

// Miniaturas fotorealistas o de alta definición para cada prenda
const PRODUCT_IMAGES = {
  futbol_jersey_pro_vneck: '/assets/catalog/futbol_f3_jersey.jpg',
  futbol_jersey_f3w_women: '/assets/catalog/futbol_f3_jersey.jpg',
  football_shorts_fp3: '/assets/catalog/shorts_fp3_matchday.jpg',
  basketball_b6_hero: '/assets/catalog/basket_b6_men.jpg',
  basketball_b7w_epic_women: '/assets/catalog/basket_b7w_women.jpg',
  basketball_shorts_bp6: '/assets/catalog/shorts_fp3_matchday.jpg',
  basketball_shorts_bp7w_women: '/assets/catalog/shorts_fp3_matchday.jpg',
  jacket_softshell_601m_men: '/assets/catalog/jacket_601m_softshell.jpg',
  jacket_softshell_601w_women: '/assets/catalog/jacket_601w_women.jpg',
};

const SPORT_OPTIONS = [
  { id: 'all', label: 'Todos los Deportes', icon: '🏆' },
  { id: 'Fútbol', label: 'Fútbol ⚽', icon: '⚽' },
  { id: 'Baloncesto', label: 'Baloncesto 🏀', icon: '🏀' },
  { id: 'Chaquetas', label: 'Chaquetas & Abrigos 🧥', icon: '🧥' },
];

const GENDER_OPTIONS = [
  { id: 'all', label: 'Cualquier Género' },
  { id: 'men', label: '♂ Caballero' },
  { id: 'women', label: '♀ Dama' },
];

export default function ProductSelectorModal({
  isOpen,
  onClose,
  onSelectProduct,
  activeProductId,
}) {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');

  const filteredProducts = useMemo(() => {
    return ENGINE_PRODUCTS.filter((prod) => {
      if (selectedSport !== 'all' && prod.sport !== selectedSport) return false;
      if (selectedGender !== 'all' && prod.gender !== selectedGender) return false;
      return true;
    });
  }, [selectedSport, selectedGender]);

  if (!isOpen) return null;

  const handleChoose = (productId) => {
    onSelectProduct(productId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Selector */}
        <div className="shrink-0 px-5 sm:px-8 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-black uppercase tracking-wider mb-1.5 border border-sky-400/30">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Estudio de Personalización 3D & 2D</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Selecciona la Prenda a Personalizar</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Elige el deporte, corte y género para abrir el configurador en la parte superior con modelado 3D y plantillas 2D de confección.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros de Deporte y Género */}
        <div className="shrink-0 px-5 sm:px-8 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Deportes */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {SPORT_OPTIONS.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSelectedSport(sp.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedSport === sp.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>

          {/* Género */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGender(g.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedGender === g.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 bg-slate-100/60">
          {filteredProducts.map((prod) => {
            const isCurrent = activeProductId === prod.id;
            const imgSrc = PRODUCT_IMAGES[prod.id] || '/assets/catalog/futbol_f3_jersey.jpg';
            const isFeminine = prod.gender === 'women';

            return (
              <div
                key={prod.id}
                className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col ${
                  isCurrent
                    ? 'ring-2 ring-emerald-500 border-emerald-400 shadow-md'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                {/* Imagen Preview */}
                <div className="relative aspect-4/3 bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={imgSrc}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />

                  {/* Badges superiores */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
                      {prod.sport}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isFeminine
                          ? 'bg-fuchsia-600/90 text-white'
                          : 'bg-sky-600/90 text-white'
                      }`}
                    >
                      {isFeminine ? '♀ Dama' : '♂ Caballero'}
                    </span>
                  </div>

                  {isCurrent && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>Activa</span>
                    </div>
                  )}

                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-black shadow-xs">
                    ${prod.basePrice.toFixed(2)} USD
                  </div>
                </div>

                {/* Contenido Card */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-sky-700 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Corte oficial <strong className="text-slate-700">{prod.owayoCutCode}</strong> • {prod.badge}
                    </p>

                    {/* Capacidades duales 3D y 2D */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-600">
                      <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        <Shirt className="w-3 h-3" />
                        <span>3D Interactivo PBR</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <Scissors className="w-3 h-3" />
                        <span>Plantilla 2D</span>
                      </span>
                    </div>
                  </div>

                  {/* Botón de Selección */}
                  <button
                    type="button"
                    onClick={() => handleChoose(prod.id)}
                    className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs ${
                      isCurrent
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                        : 'bg-slate-900 hover:bg-sky-600 text-white hover:shadow-sky-200'
                    }`}
                  >
                    <span>{isCurrent ? 'Continuar Editando' : 'Personalizar en 3D & 2D'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="shrink-0 px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Escalado exacto 1:1, compatibilidad con exportación RIP e impresión de sublimación profesional.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}
