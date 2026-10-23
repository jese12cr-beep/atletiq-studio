import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Award, Truck, CheckCircle2 } from 'lucide-react';

export default function Hero({ onStartDesigning }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="text-center max-w-4xl mx-auto relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 text-xs font-semibold mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Sublimación Textil HD • Telas CoolDry™ • Sin Mínimo de Pedido</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase leading-[1.08] mb-6">
          Tu Armadura Deportiva. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
            Diseñada en Vivo
          </span>, Fabricada Pro.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Personaliza camisetas de fútbol, baloncesto, sudaderas y equipamiento completo para tu club, empresa o grupo de amigos con previsualización en tiempo real.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStartDesigning}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base uppercase tracking-wider shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <span>Diseñar Camiseta Ahora</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <a
            href="#product-catalog"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-base border border-slate-700/80 transition-all flex items-center justify-center gap-2"
          >
            Ver Catálogo de Artículos
          </a>
        </div>

        {/* Key Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 text-left">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Calidad Pro</h4>
              <p className="text-[11px] text-slate-400">Microfibra transpirable 160g</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-blue-400/10 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Entrega Ágil</h4>
              <p className="text-[11px] text-slate-400">3 a 5 días de confección</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Precios Mayoristas</h4>
              <p className="text-[11px] text-slate-400">Hasta 35% de ahorro en clubes</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-10 h-10 rounded-xl bg-purple-400/10 text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">Shopify Ready</h4>
              <p className="text-[11px] text-slate-400">Propiedades de línea directas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
