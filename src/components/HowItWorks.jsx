import React from 'react';
import { Palette, Users, Truck, CheckCircle2, Sparkles, Shield, ArrowRight } from 'lucide-react';

export default function HowItWorks({ onOpenStudio }) {
  const steps = [
    {
      number: '01',
      icon: Palette,
      title: 'Diseña en 3D en Tiempo Real',
      desc: 'Selecciona tu deporte, corte anatómico (Caballero o Dama) y personaliza los colores por zonas con nuestra paleta oficial de 24 tonos deportivos.',
      highlight: '94 patrones sublimados sin marcas de agua',
    },
    {
      number: '02',
      icon: Users,
      title: 'Plantilla y Personalización Total',
      desc: 'Añade los nombres, dorsales y escudos de cada jugador de tu club. Sin cargos ocultos por añadir patrocinadores o números.',
      highlight: 'Sublimación integral 100% todo incluido',
    },
    {
      number: '03',
      icon: Truck,
      title: 'Fabricación y Entrega en 10 Días',
      desc: 'Confeccionamos tus uniformes con tejidos técnicos DryFit y los enviamos directamente a tu sede o club con garantía de entrega antes de tu partido.',
      highlight: 'Garantía Kickoff antes de tu primera jornada',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-sky-600 font-mono text-xs font-bold tracking-widest uppercase block mb-2">
          Proceso Simple &amp; Transparente
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          ¿Cómo Funciona el Configurador?
        </h2>
        <p className="text-slate-600 text-sm mt-3">
          Desde el primer boceto 3D hasta que tu equipo salta al terreno de juego. Sin intermediarios, sin sorpresas en el precio y con calidad profesional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-3xl font-black text-slate-300 group-hover:text-sky-600 transition-colors">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-all">
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

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-sky-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{step.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ventajas Owayo Style Callout */}
      <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Ventaja Exclusiva AtletiQ</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-black">
            ¿Necesitas equipar a tu equipo para la próxima temporada?
          </h4>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Prueba nuestro configurador 3D libremente. Puedes guardar tus bocetos, compartirlos con la directiva del club y recibir una cotización formal en PDF en minutos.
          </p>
        </div>

        <button
          onClick={onOpenStudio}
          className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-sky-500/20 shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>Abrir Configurador 3D</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
