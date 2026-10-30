import React, { useState } from 'react';
import { Sparkles, Check, CheckCircle2, Layers } from 'lucide-react';
import { ATLETIQ_PRO_PATTERNS } from '../../../data/atletiqProPatterns';
import { resolveAssetUrl } from '../../../utils/assetUrl';

const CATEGORIES = ['Todos', 'Moderno', 'Rayas', 'Geométrico', 'Degradado', 'Minimalista'];

export default function PatternCardsGrid({
  activePatternId,
  onSelectPattern,
  colorZoneMap = {},
}) {
  const [selectedCat, setSelectedCat] = useState('Todos');

  const filtered = selectedCat === 'Todos'
    ? ATLETIQ_PRO_PATTERNS
    : ATLETIQ_PRO_PATTERNS.filter((p) => p.category === selectedCat);

  return (
    <div className="space-y-4">
      {/* Selector de Categorías (Pills Deportivos) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedCat === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Recuadros de Personalización de Patrones */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((pattern) => {
          const isActive = activePatternId === pattern.id;

          return (
            <div
              key={pattern.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPattern(pattern)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectPattern(pattern);
                }
              }}
              className={`group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 text-left border ${
                isActive
                  ? 'border-emerald-500 bg-slate-800/90 shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/40'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-800/70 hover:shadow-md'
              }`}
            >
              {/* Badge de Selección Activa */}
              {isActive && (
                <div className="absolute top-2 right-2 z-10 bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Activo</span>
                </div>
              )}

              {/* Categoría Badge */}
              <div className="absolute top-2 left-2 z-10 bg-slate-950/80 backdrop-blur-md text-slate-300 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border border-slate-700/40">
                {pattern.category}
              </div>

              {/* Contenedor de Miniatura Visual */}
              <div className="relative aspect-square w-full bg-gradient-to-b from-slate-950 to-slate-900 p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={resolveAssetUrl(pattern.thumbPath)}
                  alt={pattern.name}
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback visual si la miniatura estuviese cargando
                    e.target.style.display = 'none';
                  }}
                />
              </div>

              {/* Datos del Recuadro */}
              <div className="p-2.5 bg-slate-900/95 flex flex-col gap-1 border-t border-slate-800/60">
                <div className="text-xs font-bold text-white leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                  {pattern.name}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span>{pattern.zones?.length || 4} Zonas</span>
                  </span>

                  {/* Indicador de paleta activa en miniatura */}
                  <div className="flex items-center -space-x-1">
                    {pattern.zones?.slice(0, 3).map((z, idx) => (
                      <span
                        key={idx}
                        className="w-2.5 h-2.5 rounded-full border border-slate-800 shadow-sm"
                        style={{ backgroundColor: colorZoneMap[z.id] || z.defaultHex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
