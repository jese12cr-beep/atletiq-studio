import React from 'react';
import { ShieldCheck, Award, Star } from 'lucide-react';

export default function AthleteProof() {
  return (
    <section id="club-proof" className="bg-slate-100/70 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div>
            <span className="text-sky-600 font-mono text-xs font-bold tracking-widest uppercase block mb-1">
              Confianza de Clubes Federados
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Testimonios de Equipos en Competición
            </h2>
          </div>
          <p className="text-slate-600 text-sm max-w-md">
            Más de 340 clubes y academias compiten semanalmente con indumentaria diseñada en nuestro estudio 3D.
          </p>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-slate-700 text-sm italic leading-relaxed">
              "Equipamos a las 4 divisiones del club. La nitidez de los escudos tras 30 lavados a alta temperatura y la resistencia a los agarrones es insuperable."
            </p>
            <div className="pt-3 border-t border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 block">MARCOS E. // DIRECTOR DEPORTIVO</span>
              <span className="text-xs text-sky-600 font-semibold">AETHEN FC</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-slate-700 text-sm italic leading-relaxed">
              "El tejido micromesh de baloncesto no retiene nada de sudor en las prórrogas. Los números y dorsales térmicos no se despegan ni se cuartean."
            </p>
            <div className="pt-3 border-t border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 block">CARLOS D. // CAPITÁN</span>
              <span className="text-xs text-sky-600 font-semibold">BROOKLYN STORM BC</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between gap-4">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-slate-700 text-sm italic leading-relaxed">
              "Cumplieron la entrega en exactamente 9 días laborales antes del playoff. El diseñador 3D nos evitó cualquier error en los nombres y números de las jugadoras."
            </p>
            <div className="pt-3 border-t border-slate-100">
              <span className="font-extrabold text-xs text-slate-900 block">LAURA M. // ENTRENADORA</span>
              <span className="text-xs text-sky-600 font-semibold">OMEGA SPORTS ACADEMY</span>
            </div>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900">
                Garantía Kickoff 100% // Entrega antes de tu Partido
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Si tu pedido de equipación de club no llega antes del plazo acordado, te reembolsamos el 50% de la orden.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-4 py-2 rounded-xl border border-sky-200 shrink-0">
            Homologación Oficial FIFA / FIBA
          </span>
        </div>
      </div>
    </section>
  );
}
