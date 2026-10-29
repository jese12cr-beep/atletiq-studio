import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  Truck,
  CheckCircle2,
  RotateCw,
  Layers,
  ChevronRight,
  Users,
  Palette,
  PackageCheck
} from 'lucide-react';

const FEATURED_HERO_GARMENTS = [
  {
    id: 'futbol_jersey_pro_vneck',
    sport: 'Fútbol',
    tabLabel: '⚽ Fútbol',
    name: 'Camiseta Fútbol F3 Matchday',
    subtitle: 'Corte Anatómico • Cuello en V Reforzado',
    fabric: 'Tejido TS-Tex™ Ultra-Dry 145g',
    cutCode: 'Corte 204m',
    price: '$34.00 USD',
    colors: ['#00875a', '#ffffff', '#101820', '#facc15'],
    image: './assets/stitch/ghost_mannequin.png',
  },
  {
    id: 'basketball_b6_hero',
    sport: 'Baloncesto',
    tabLabel: '🏀 Baloncesto',
    name: 'Camiseta Basket B6 Hero',
    subtitle: 'Corte Atlético • Sisa Americana Pro',
    fabric: 'Micromesh K-Tex 2™ 155g',
    cutCode: 'Corte 222m',
    price: '$32.50 USD',
    colors: ['#c8102e', '#101820', '#ffd700', '#ffffff'],
    image: './assets/stitch/basketball_arena.png',
  },
  {
    id: 'jacket_softshell_601m_men',
    sport: 'Chaquetas',
    tabLabel: '🧥 Chaquetas & Abrigos',
    name: 'Chaqueta Softshell J5 Pro',
    subtitle: 'Cortavientos Térmico • Cremallera Completa',
    fabric: 'Softshell 3-Capas Polar 290g',
    cutCode: 'Corte 601m',
    price: '$58.00 USD',
    colors: ['#0f172a', '#0284c7', '#ffffff', '#e11d48'],
    image: './assets/stitch/football_celebration.png',
  },
];

export default function Hero({ onStartDesigning }) {
  const [selectedSportIndex, setSelectedSportIndex] = useState(0);
  const currentGarment = FEATURED_HERO_GARMENTS[selectedSportIndex];

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Sutil halo de luz de fondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-slate-200/50 blur-[140px] rounded-full pointer-events-none" />

      {/* 1. SECCIÓN PRINCIPAL HERO: ESTRUCTURA PROFESIONAL ESTILO OWAYO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
        
        {/* Columna Izquierda: Mensaje Central & Deportes */}
        <div className="lg:col-span-7 text-left space-y-6">
          {/* Badge sutil */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold tracking-wide">
            <Award className="w-4 h-4 text-sky-600 shrink-0" />
            <span className="uppercase tracking-wider">FABRICACIÓN DEPORTIVA PROFESIONAL PARA CLUBES</span>
          </div>

          {/* Titular Principal Limpio */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
            Ropa deportiva personalizada <br className="hidden sm:inline" />
            para tu club o equipo.
          </h1>

          {/* Subtítulo enfocado en ventajas reales para el club */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
            En <strong>ATLETIQ</strong> confeccionamos equipaciones deportivas de alto rendimiento con patronaje anatómico independiente para <strong>Caballero</strong> y <strong>Dama</strong>. Todos los escudos, patrocinadores, nombres y dorsales están incluidos en el precio.
          </p>

          {/* Selector de Deporte Owayo */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Selecciona tu disciplina:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {FEATURED_HERO_GARMENTS.map((g, idx) => {
                const isSelected = selectedSportIndex === idx;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedSportIndex(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{g.tabLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => onStartDesigning?.(currentGarment.id)}
              className="px-7 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm uppercase tracking-wider shadow-md transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Palette className="w-5 h-5 text-sky-400" />
              <span>Configurar Modelo</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#tallas-muestras"
              className="px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <PackageCheck className="w-4 h-4 text-slate-600" />
              <span>Solicitar Muestras Gratuitas</span>
            </a>
          </div>

          {/* Sellos de Confianza Owayo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 text-xs font-semibold text-slate-600 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sin pedido mínimo (desde 1 ud.)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Entrega en 10-12 días</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Muestrario de tallas sin coste</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Vitrina Visual Elegante */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl bg-white border border-slate-200 shadow-xl overflow-hidden p-5 sm:p-6 transition-all">
            
            {/* Cabecera de vitrina */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {currentGarment.sport} Competición
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                {currentGarment.cutCode}
              </span>
            </div>

            {/* Escenario Visual de Prenda */}
            <div className="relative my-4 aspect-4/3 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-100 flex items-center justify-center overflow-hidden group">
              <img
                src={currentGarment.image}
                alt={currentGarment.name}
                className="max-h-[88%] max-w-[88%] object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-105"
              />

              {/* Insignia de patronaje */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 border border-slate-200 text-[10px] font-bold text-slate-800 shadow-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                <span>Patronaje ♂ y ♀</span>
              </div>

              {/* Vista 360 */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[10px] font-mono font-bold shadow-xs flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-sky-400" />
                <span>360° Interactivo</span>
              </div>
            </div>

            {/* Ficha técnica y precio */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {currentGarment.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {currentGarment.fabric} • {currentGarment.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-bold mr-1">Paleta:</span>
                  {currentGarment.colors.map((hex, i) => (
                    <span
                      key={i}
                      style={{ backgroundColor: hex }}
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-xs inline-block"
                    />
                  ))}
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Tarifa base</span>
                  <span className="text-sm font-black text-slate-900">{currentGarment.price}</span>
                </div>
              </div>

              {/* Botón de personalización limpio */}
              <button
                type="button"
                onClick={() => onStartDesigning?.(currentGarment.id)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
              >
                <span>Personalizar este modelo</span>
                <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 2. LOS 4 PILARES DE SERVICIO OWAYO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12 mt-12 border-t border-slate-200 text-left relative z-10">
        
        {/* Pilar 1 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <Palette className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase">Diseño 100% Libre</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Personaliza colores, patrocinadores, escudos y tipografías en tiempo real. Todos los logos están incluidos en el precio.
          </p>
        </div>

        {/* Pilar 2 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase">Patronaje ♂ y ♀</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Moldes ergonómicos de corte independiente para caballero y dama, asegurando ajuste anatómico en cada talla.
          </p>
        </div>

        {/* Pilar 3 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase">Sublimación TS-Tex™</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Pigmentos integrados térmicamente en la fibra técnica que nunca se agrietan, conservando la máxima transpirabilidad.
          </p>
        </div>

        {/* Pilar 4 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <PackageCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase">Sin Pedido Mínimo</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Pide desde 1 unidad para reposiciones individuales o equipa a todo tu club con hasta -25% de descuento por volumen.
          </p>
        </div>

      </div>
    </section>
  );
}
