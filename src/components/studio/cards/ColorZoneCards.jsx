import React from 'react';
import { Palette, Pipette, RefreshCw } from 'lucide-react';

const ESSENTIAL_PALETTE = [
  { hex: '#FFFFFF', name: 'Blanco Puro' },
  { hex: '#0F172A', name: 'Negro Noche' },
  { hex: '#085DBF', name: 'Azul Real Pro' },
  { hex: '#072661', name: 'Azul Marino Profundo' },
  { hex: '#0284C7', name: 'Azul Eléctrico' },
  { hex: '#38BDF8', name: 'Celeste Brillante' },
  { hex: '#DC2626', name: 'Rojo Competición' },
  { hex: '#991B1B', name: 'Granate Élite' },
  { hex: '#16A34A', name: 'Verde Césped' },
  { hex: '#064E3B', name: 'Verde Bosque' },
  { hex: '#FACC15', name: 'Oro / Amarillo' },
  { hex: '#FFFDD0', name: 'Crema América' },
  { hex: '#EA580C', name: 'Naranja Flúor' },
  { hex: '#7C3AED', name: 'Morado Real' },
  { hex: '#E11D48', name: 'Fucsia Deportivo' },
  { hex: '#84CC16', name: 'Verde Lima Neón' },
];

const ZONE_LABELS = {
  c1: { label: 'Espalda (Dorsal)', hint: 'Panel trasero completo' },
  c2: { label: 'Frente (Pecho & Torso)', hint: 'Panel delantero principal' },
  c3: { label: 'Manga Izquierda', hint: 'Manga y ribete izquierdo' },
  c4: { label: 'Manga Derecha', hint: 'Manga y ribete derecho' },
  c5: { label: 'Cuello & Ribetes', hint: 'Ribete elástico del cuello' },
  c6: { label: 'Elemento Gráfico 1', hint: 'Franja o textura primaria' },
  c7: { label: 'Elemento Gráfico 2', hint: 'Detalle geométrico secundario' },
  c8: { label: 'Elemento Gráfico 3', hint: 'Acento de contraste' },
  c9: { label: 'Elemento Gráfico 4', hint: 'Línea de velocidad' },
};

export default function ColorZoneCards({
  zones = [],
  colorZoneMap = {},
  onChangeZoneColor,
  onResetZoneColors,
}) {
  return (
    <div className="space-y-4">
      {/* Barra de cabecera con botón de restablecer */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-400" />
            <span>Recuadros de Color por Zonas</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Personaliza cada panel textil de manera individual
          </p>
        </div>

        {onResetZoneColors && (
          <button
            type="button"
            onClick={onResetZoneColors}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Predeterminados</span>
          </button>
        )}
      </div>

      {/* Lista de Recuadros de Personalización por Zona */}
      <div className="space-y-3">
        {zones.map((zone) => {
          const zoneId = zone.id;
          const currentHex = colorZoneMap[zoneId] || zone.defaultHex || '#085DBF';
          const meta = ZONE_LABELS[zoneId] || {
            label: zone.name || `Zona ${zoneId.toUpperCase()}`,
            hint: 'Acento de diseño',
          };

          return (
            <div
              key={zoneId}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 transition-all shadow-sm flex flex-col gap-3"
            >
              {/* Encabezado del Recuadro de Zona */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full border-2 border-white/20 shadow-inner flex-shrink-0"
                    style={{ backgroundColor: currentHex }}
                  />
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {meta.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {currentHex.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Input de color nativo con estilo moderno */}
                <label className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium cursor-pointer hover:bg-slate-700 transition-colors">
                  <Pipette className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">Personalizado</span>
                  <input
                    type="color"
                    value={currentHex}
                    onChange={(e) => onChangeZoneColor(zoneId, e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Muestrario Rápido de 16 Colores Deportivos Populares */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {ESSENTIAL_PALETTE.map((c) => {
                  const isSelected = currentHex.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => onChangeZoneColor(zoneId, c.hex)}
                      className={`w-6 h-6 rounded-full border flex-shrink-0 transition-transform ${
                        isSelected
                          ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-110 border-white'
                          : 'border-slate-700/80 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
