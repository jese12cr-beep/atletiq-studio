import React from 'react';
import { Palette, Users, Truck, CheckCircle2, Sparkles, PackageCheck, ArrowRight } from 'lucide-react';

export default function HowItWorks({ onOpenStudio, onOpenQuote }) {
  const steps = [
    {
      number: '01',
      icon: Palette,
      title: 'Elige y Diseña tu Prenda',
      desc: 'Selecciona tu deporte, corte anatómico (Caballero o Dama) y personaliza libremente colores, patrones y franjas con visualización interactiva.',
      highlight: 'Todos los patrones y combinaciones incluidos',
    },
    {
      number: '02',
      icon: Users,
      title: 'Plantilla y Logos Ilimitados',
      desc: 'Sube los escudos de tu club, patrocinadores ilimitados y la lista de dorsales y nombres de los jugadores. Sin sobrecostes por logo.',
      highlight: 'Sublimación integral 100% todo incluido',
    },
    {
      number: '03',
      icon: Truck,
      title: 'Confección y Entrega en 10-12 Días',
      desc: 'Imprimimos y cosemos tus prendas con tejidos técnicos de alta resistencia. Enviamos directamente a la sede de tu club o domicilio.',
      highlight: 'Garantía oficial y reposiciones desde 1 ud.',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sky-600 font-mono text-xs font-bold tracking-widest uppercase block mb-2">
          Proceso Simple &amp; Transparente
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          ¿Cómo Funciona el Pedido para Equipos?
        </h2>
        <p className="text-slate-600 text-sm mt-3">
          De tu idea inicial a la cancha en 3 pasos sencillos. Sin intermediarios, sin tarifas ocultas por logos y con calidad garantizada.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-3xl font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-800 flex items-center justify-center border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{step.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ventajas Owayo Style Callout: Neutral, Elegante y Claro */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-sky-700 text-xs font-bold uppercase tracking-wider">
            <PackageCheck className="w-4 h-4" />
            <span>Servicio Exclusivo para Clubes y Academias</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-slate-900">
            ¿Equipas a más de un equipo o a todo un club deportivo?
          </h4>
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl">
            Aprovecha nuestros descuentos por volumen de hasta el 25%, solicita un muestrario de tallas sin coste para tu directiva y guarda los patrones para futuras temporadas.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenStudio}
            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span>Configurar Prenda</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
