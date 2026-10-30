import React from 'react';
import { Type, Hash, Sparkles, Sliders, Check } from 'lucide-react';

const ATHLETIC_FONTS = [
  {
    id: 'Impact, sans-serif',
    name: 'Aurora BdCn Sport',
    preview: '10 ATLETIQ',
    fontStyle: 'Impact, sans-serif',
    tag: 'Condensada Pro',
  },
  {
    id: '"Arial Black", sans-serif',
    name: 'SuperMolot Pro',
    preview: '10 ATLETIQ',
    fontStyle: '"Arial Black", sans-serif',
    tag: 'Potencia & Impacto',
  },
  {
    id: '"Trebuchet MS", sans-serif',
    name: 'Tekno Geometric',
    preview: '10 ATLETIQ',
    fontStyle: '"Trebuchet MS", sans-serif',
    tag: 'Líneas Angulares',
  },
  {
    id: '"Courier New", monospace',
    name: 'Varsity Collegiate',
    preview: '10 ATLETIQ',
    fontStyle: 'monospace',
    tag: 'Clásico Universitario',
  },
];

const COLOR_PRESETS = [
  '#FFFFFF',
  '#0F172A',
  '#FACC15',
  '#DC2626',
  '#085DBF',
  '#16A34A',
  '#EA580C',
  '#FFFDD0',
];

export default function TypographyDorsalCard({
  playerNumber = '10',
  onChangeNumber,
  playerName = 'ATLETIQ',
  onChangeName,
  frontNumberActive = false,
  onToggleFrontNumber,
  fontFamily = 'Impact, sans-serif',
  onChangeFont,
  numberFillColor = '#FFFFFF',
  onChangeNumberFill,
  numberOutlineColor = '#0F172A',
  onChangeNumberOutline,
  numberShadowColor = '#000000',
  onChangeNumberShadow,
  nameFillColor = '#FFFFFF',
  onChangeNameFill,
  nameOutlineColor = '#0F172A',
  onChangeNameOutline,
  nameCurveAngle = 0,
  onChangeNameCurve,
}) {
  return (
    <div className="space-y-6">
      {/* 1. Recuadro de Dorsal Principal (Número) */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Recuadro de Dorsal Atlético
              </div>
              <p className="text-[11px] text-slate-400">
                Número principal de espalda y pecho
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700/60">
            <input
              type="checkbox"
              checked={frontNumberActive}
              onChange={(e) => onToggleFrontNumber(e.target.checked)}
              className="rounded text-emerald-500 focus:ring-emerald-500 bg-slate-900 border-slate-700"
            />
            <span className="text-[11px]">Número Frontal</span>
          </label>
        </div>

        {/* Input de Número y Vista Previa Rápida */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Dígito del Dorsal
            </label>
            <input
              type="text"
              maxLength={3}
              value={playerNumber}
              onChange={(e) => onChangeNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-black text-center text-xl tracking-wider focus:border-emerald-500 focus:outline-none"
              placeholder="10"
            />
          </div>

          {/* Tarjeta de Vista Previa del Dorsal con Capas de Color */}
          <div className="w-24 h-16 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center overflow-hidden">
            <span
              style={{
                fontFamily,
                color: numberFillColor,
                WebkitTextStroke: `2px ${numberOutlineColor}`,
                textShadow: numberShadowColor !== 'transparent' ? `2px 2px 0px ${numberShadowColor}` : 'none',
              }}
              className="text-3xl font-black select-none"
            >
              {playerNumber || '10'}
            </span>
          </div>
        </div>

        {/* Triple Capa de Color del Dorsal */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
          {/* Capa 1: Relleno */}
          <div className="space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">1. Relleno</span>
            <div className="flex items-center justify-center">
              <label className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md cursor-pointer flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: numberFillColor }}>
                <input
                  type="color"
                  value={numberFillColor}
                  onChange={(e) => onChangeNumberFill(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Capa 2: Borde Exterior */}
          <div className="space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">2. Borde</span>
            <div className="flex items-center justify-center">
              <label className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md cursor-pointer flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: numberOutlineColor }}>
                <input
                  type="color"
                  value={numberOutlineColor}
                  onChange={(e) => onChangeNumberOutline(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          {/* Capa 3: Sombra 3D */}
          <div className="space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase">3. Sombra 3D</span>
            <div className="flex items-center justify-center">
              <label className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md cursor-pointer flex items-center justify-center hover:scale-110 transition-transform" style={{ backgroundColor: numberShadowColor }}>
                <input
                  type="color"
                  value={numberShadowColor}
                  onChange={(e) => onChangeNumberShadow(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Recuadro de Nombre de Jugador */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Recuadro de Nombre de Jugador
            </div>
            <p className="text-[11px] text-slate-400">
              Serigrafía superior en la espalda
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Nombre o Apellido
            </label>
            <input
              type="text"
              maxLength={16}
              value={playerName}
              onChange={(e) => onChangeName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold uppercase text-sm focus:border-emerald-500 focus:outline-none"
              placeholder="HERNÁNDEZ"
            />
          </div>

          {/* Curvatura de Texto en Arco */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Arco de Curvatura</span>
              <span className="font-mono text-emerald-400">{nameCurveAngle}°</span>
            </div>
            <input
              type="range"
              min={-30}
              max={30}
              step={5}
              value={nameCurveAngle}
              onChange={(e) => onChangeNameCurve(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Colores de Nombre (Relleno y Borde) */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Relleno:</span>
              <label className="w-6 h-6 rounded-full border border-white/20 cursor-pointer" style={{ backgroundColor: nameFillColor }}>
                <input
                  type="color"
                  value={nameFillColor}
                  onChange={(e) => onChangeNameFill(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Borde:</span>
              <label className="w-6 h-6 rounded-full border border-white/20 cursor-pointer" style={{ backgroundColor: nameOutlineColor }}>
                <input
                  type="color"
                  value={nameOutlineColor}
                  onChange={(e) => onChangeNameOutline(e.target.value)}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recuadros de Tipografías Deportivas */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-white uppercase tracking-wider">
          Selección de Tipografía Oficial
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {ATHLETIC_FONTS.map((font) => {
            const isSelected = fontFamily === font.id;
            return (
              <div
                key={font.id}
                role="button"
                tabIndex={0}
                onClick={() => onChangeFont(font.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChangeFont(font.id);
                  }
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${
                  isSelected
                    ? 'border-emerald-500 bg-slate-800/90 shadow-md ring-1 ring-emerald-500/40'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">{font.tag}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div
                  className="text-base font-black text-white tracking-wider my-0.5"
                  style={{ fontFamily: font.fontStyle }}
                >
                  {font.preview}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {font.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
