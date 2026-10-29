import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Box,
  Award,
  Sparkles,
  Truck,
  CheckCircle2,
  RotateCw,
  Layers,
  ChevronRight,
  Users
} from 'lucide-react';

const FEATURED_HERO_GARMENTS = [
  {
    id: 'futbol_jersey_pro_vneck',
    sport: 'Fútbol',
    tabLabel: '⚽ Fútbol Matchday',
    name: 'Camiseta Fútbol F3 Basic',
    subtitle: 'Corte Anatómico 204m_KA • Cuello en V',
    badge: '38,319 Vértices CAD • 16 Diseños .fish',
    fabric: 'TS-Tex™ Ultra-Dry 145g',
    cutCode: '204m_KA',
    price: '$34.00 USD',
    colors: ['#00875a', '#ffffff', '#101820', '#facc15'],
    samplePlayer: '#10 VALVERDE (L)',
    image: './assets/stitch/ghost_mannequin.png',
  },
  {
    id: 'basketball_b6_hero',
    sport: 'Baloncesto',
    tabLabel: '🏀 Baloncesto Arena',
    name: 'Camiseta Basket B6 Hero',
    subtitle: 'Corte Atlético 222m-Hero • Sisa Americana',
    badge: '31,204 Vértices CAD • 20 Diseños .fish',
    fabric: 'K-Tex 2™ Micromesh 155g',
    cutCode: '222m-Hero',
    price: '$32.50 USD',
    colors: ['#c8102e', '#101820', '#ffd700', '#ffffff'],
    samplePlayer: '#10 RODRÍGUEZ (L)',
    image: './assets/stitch/basketball_arena.png',
  },
  {
    id: 'jacket_softshell_601m_men',
    sport: 'Chaquetas',
    tabLabel: '🧥 Chaquetas Softshell',
    name: 'Chaqueta Softshell J5 Pro',
    subtitle: 'Corte Cortavientos 601m • Cremallera YKK',
    badge: '28,450 Vértices CAD • 12 Diseños .fish',
    fabric: 'Softshell 3-Capas Polar 290g',
    cutCode: '601m_Softshell',
    price: '$58.00 USD',
    colors: ['#0f172a', '#0284c7', '#ffffff', '#e11d48'],
    samplePlayer: 'CLUB STAFF (XL)',
    image: './assets/stitch/football_celebration.png',
  },
];

export default function Hero({ onStartDesigning }) {
  const [selectedSportIndex, setSelectedSportIndex] = useState(0);
  const currentGarment = FEATURED_HERO_GARMENTS[selectedSportIndex];

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Luces sutiles de fondo para estética de estudio profesional */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[450px] bg-blue-500/8 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-sky-500/8 blur-[120px] rounded-full pointer-events-none" />

      {/* 1. SECCIÓN PRINCIPAL HERO DIVIDIDA (TEXTO & SELECTORES A LA IZQUIERDA + VITRINA VISUAL 3D A LA DERECHA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
        
        {/* Columna Izquierda: Mensaje Central & Despliegue de Deportes Owayo */}
        <div className="lg:col-span-7 text-left space-y-6">
          {/* Badge de calidad superior */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black tracking-wide shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="uppercase tracking-wider">TECNOLOGÍA TEXTIL 3D • FABRICACIÓN A MEDIDA</span>
          </div>

          {/* Titular Moderno Owayo */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight uppercase leading-[1.05]">
            Diseña tu equipación <br className="hidden sm:inline" />
            deportiva.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600">
              Directo en 3D.
            </span>
          </h1>

          {/* Subtítulo explicativo con autoridad */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
            En <strong>ATLETIQ</strong> personalizas al 100% la ropa deportiva de tu equipo o club con patronaje profesional anatómico para <strong>Caballero</strong> y <strong>Dama</strong>. Elige tu disciplina, rota la prenda en 3D y define cada color, patrocinador y dorsal sin pedido mínimo.
          </p>

          {/* Selector de Deporte Rápido tipo Owayo (Píldoras Interactivas) */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Selecciona tu disciplina deportiva:
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
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span>{g.tabLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTAs Principales */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => onStartDesigning?.(currentGarment.id)}
              className="px-7 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Box className="w-5 h-5" />
              <span>Empezar a Diseñar en 3D</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href="#drops-catalog"
              className="px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              Ver Catálogo Completo
            </a>
          </div>

          {/* Sellos de Confianza y Entrega para México & USA */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 text-xs font-semibold text-slate-600 border-t border-slate-200/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Envíos a México y USA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Entrega en 10-12 días</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sin pedido mínimo (desde 1 ud.)</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Vitrina Visual Moderna con Prenda 3D Destacada */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl bg-gradient-to-b from-white to-slate-100 border border-slate-200/90 shadow-xl overflow-hidden p-5 sm:p-6 transition-all">
            
            {/* Cabecera de la vitrina interactiva */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  {currentGarment.sport} CAD 3D
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 font-bold">
                {currentGarment.cutCode}
              </span>
            </div>

            {/* Escenario Visual del Uniforme Deportivo */}
            <div className="relative my-4 aspect-4/3 rounded-2xl bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#f1f5f9_70%,#e2e8f0_100%)] border border-slate-200 flex items-center justify-center overflow-hidden group">
              <img
                src={currentGarment.image}
                alt={currentGarment.name}
                className="max-h-[88%] max-w-[88%] object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
              />

              {/* Insignia flotante de patronaje */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs border border-slate-300 text-[10px] font-black text-slate-800 shadow-xs flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Patronaje ♂ y ♀</span>
              </div>

              {/* Insignia flotante de muestra 3D */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-mono font-bold shadow-xs flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-sky-400" />
                <span>360° Interactivo</span>
              </div>
            </div>

            {/* Datos Técnicos y Paleta Rápida de Muestra */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {currentGarment.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {currentGarment.fabric} • {currentGarment.badge}
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

              {/* Botón de acción directa hacia el modelo específico */}
              <button
                type="button"
                onClick={() => onStartDesigning?.(currentGarment.id)}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
              >
                <span>Personalizar este modelo en 3D</span>
                <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 2. LOS 4 PILARES DE CALIDAD Y SERVICIO (ESTILO OWAYO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12 mt-12 border-t border-slate-200 text-left relative z-10">
        
        {/* Pilar 1 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Box className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase">Configurador 3D Real</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Visualización precisa a 60 FPS con rotación 360°, control de cámaras de detalle y texturas con micro-relieve físico.
          </p>
        </div>

        {/* Pilar 2 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase">Patronaje ♂ y ♀</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Moldes ergonómicos de corte independiente para caballero y dama, asegurando ajuste anatómico en cada talla.
          </p>
        </div>

        {/* Pilar 3 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase">Sublimación TS-Tex™ HD</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Pigmentos fusionados en la fibra a 210°C que nunca se agrietan, manteniendo la máxima transpirabilidad y ligereza.
          </p>
        </div>

        {/* Pilar 4 */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900 uppercase">Sin Pedido Mínimo</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Pide desde 1 unidad para reposiciones individuales o equipa a todo tu club con hasta -25% de descuento por lote.
          </p>
        </div>

      </div>
    </section>
  );
}
