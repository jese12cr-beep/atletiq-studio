import React from 'react';
import { ShieldCheck, Wind, Droplets, Zap, Sparkles, RefreshCw } from 'lucide-react';

export default function QualityShowcase() {
  const specs = [
    {
      icon: <Wind className="w-6 h-6 text-cyan-400" />,
      title: 'CoolDry™ Microperforado',
      desc: 'Tejido 100% poliéster de 155g con micro poros que facilitan la rápida evaporación del sudor en alta competencia.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: 'Sublimación Digital HD',
      desc: 'Tintas ecológicas japonesas fijadas a 210°C que nunca se agrietan, decoloran ni pierden brillo con los lavados.'
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: 'Costuras Reforzadas 4 Hilos',
      desc: 'Costura plana anti-rozaduras con hilo elástico de alta tenacidad que resiste tirones bruscos de juego.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Protección Solar UV 50+',
      desc: 'Bloquea el 98% de los rayos ultravioleta, ideal para entrenamientos y torneos de fútbol bajo sol intenso.'
    }
  ];

  return (
    <section id="fabric-quality" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-amber-400 font-mono text-xs font-bold tracking-widest uppercase block mb-1">
          Tecnología Textil de Alto Rendimiento
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
          Diseñado para Resistir el Juego Más Exigente
        </h2>
        <p className="text-slate-400 text-sm mt-2">
          Nuestras prendas personalizadas no son camisetas genéricas de algodón; son uniformes de competición confeccionados con estándares profesionales de ligas de primera división.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {specs.map((spec, i) => (
          <div
            key={i}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 shadow-inner">
                {spec.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{spec.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{spec.desc}</p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
              <span>Certificación ISO 9001</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
