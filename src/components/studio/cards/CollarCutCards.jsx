import React from 'react';
import { Check, Shirt, Sparkles, User } from 'lucide-react';

const COLLAR_STYLES = [
  {
    id: 'round',
    name: 'Cuello Redondo Clásico',
    description: 'Ribete tubular de punto elástico. Ajuste ergonómico universal.',
    icon: (
      <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 14 C16 26, 32 26, 36 14" strokeLinecap="round" />
        <path d="M6 18 L12 14 L36 14 L42 18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'v_neck',
    name: 'Cuello en V Atlético',
    description: 'Corte angular dinámico con solape frontal. Mayor ventilación.',
    icon: (
      <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 14 L24 28 L36 14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 18 L12 14 L36 14 L42 18" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'polo',
    name: 'Cuello Polo Élite',
    description: 'Solapas estructuradas con tapeta de botones y presencia ejecutiva.',
    icon: (
      <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M14 14 L21 24 L24 16 L27 24 L34 14" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 24 L24 34" strokeLinecap="round" />
        <circle cx="24" cy="28" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
];

const CUT_STYLES = [
  { id: 'MEN_PRO_SLIM', name: 'Hombre Slim Pro', tag: 'Ajuste atlético ceñido al cuerpo' },
  { id: 'MEN_CLASSIC', name: 'Hombre Clásico', tag: 'Corte estándar cómodo y holgado' },
  { id: 'WOMEN_FIT', name: 'Mujer Entallado', tag: 'Silueta femenina anatómica' },
  { id: 'YOUTH_KIDS', name: 'Infantil / Juvenil', tag: 'Patronaje para categorías inferiores' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

export default function CollarCutCards({
  activeCollar = 'round',
  onChangeCollar,
  activeCut = 'MEN_PRO_SLIM',
  onChangeCut,
  activeSize = 'L',
  onChangeSize,
}) {
  return (
    <div className="space-y-6">
      {/* 1. Recuadros de Tipo de Cuello */}
      <div className="space-y-3">
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Shirt className="w-4 h-4 text-emerald-400" />
            <span>Recuadros de Tipo de Cuello</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Selecciona la confección del cuello para el render 3D y molde 2D
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COLLAR_STYLES.map((c) => {
            const isSelected = activeCollar === c.id;
            return (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => onChangeCollar(c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChangeCollar(c.id);
                  }
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-3 text-left ${
                  isSelected
                    ? 'border-emerald-500 bg-slate-800/95 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    {c.icon}
                  </div>
                  {isSelected && (
                    <div className="bg-emerald-500 text-slate-950 p-1 rounded-full shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {c.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Recuadros de Patrón de Corte */}
      <div className="space-y-3">
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Patrón de Corte & Sastrería</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Ajuste morfológico para el patronaje textil
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {CUT_STYLES.map((cut) => {
            const isSelected = activeCut === cut.id;
            return (
              <div
                key={cut.id}
                role="button"
                tabIndex={0}
                onClick={() => onChangeCut(cut.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChangeCut(cut.id);
                  }
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                  isSelected
                    ? 'border-emerald-500 bg-slate-800/90 shadow-md shadow-emerald-500/15 ring-1 ring-emerald-500/40'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{cut.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {cut.tag}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selector de Talla de Muestra */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-white uppercase tracking-wider">
          Talla de Muestra para Visualización
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {SIZES.map((s) => {
            const isSelected = activeSize === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChangeSize(s)}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
