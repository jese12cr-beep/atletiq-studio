import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: '¿Hay una cantidad mínima de pedido?',
    a: 'No, no tenemos pedido mínimo. Puedes confeccionar desde 1 sola prenda única con tu diseño exclusivo. Además, a partir de 6 unidades para tu equipo o club obtienes descuentos automáticos por volumen de hasta un -25%.',
  },
  {
    q: '¿Qué incluye exactamente el precio que marca el configurador?',
    a: 'El precio es 100% TODO INCLUIDO: incluye la prenda técnica en tejido DryFit, la personalización integral por sublimación a todo color (todos los colores que quieras), nombres de jugadores, dorsales individuales y todos los escudos o logos de patrocinadores que desees añadir en pecho, mangas y espalda. Sin cargos ocultos por cliché o número de colores.',
  },
  {
    q: '¿Cuánto tiempo tarda la fabricación y entrega?',
    a: 'El plazo estándar garantizado es de 10 a 12 días laborables desde la confirmación final de la plantilla de jugadores y tallas. Si tienes un torneo o inicio de liga urgente, disponemos de servicio exprés prioritario.',
  },
  {
    q: 'Si fichamos a nuevos jugadores a mitad de temporada, ¿podemos pedir 1 o 2 camisetas idénticas?',
    a: '¡Sí, por supuesto! Tu diseño, colores y tipografías quedan archivados de por vida en nuestro sistema. Podrás solicitar reposiciones de 1 sola prenda en cualquier momento con la misma calidad y colores exactos.',
  },
  {
    q: '¿Qué formatos de logotipo o escudo acepta el configurador?',
    a: 'Aceptamos archivos vectoriales en SVG, PDF, EPS o AI, así como imágenes en alta resolución PNG (con fondo transparente) o JPG a 300 DPI. Nuestro motor incluye un verificador de DPI que te indicará si la resolución es apta para impresión profesional.',
  },
  {
    q: '¿Cómo se diferencian los cortes de Caballero y Dama?',
    a: 'Nuestros patrones no son camisetas unisex reducidas: las prendas de dama cuentan con un patronaje anatómico propio, con sisa adaptada, caída en cintura ergonómica y cuello más cómodo adaptado a la morfología femenina.',
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-slate-200">
      <div className="text-center mb-12">
        <span className="text-sky-600 font-mono text-xs font-bold tracking-widest uppercase block mb-1">
          Resolvemos tus dudas
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Preguntas Frecuentes de Clubes
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Todo lo que necesitas saber antes de equipar a tu equipo o club deportivo.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all ${
                isOpen
                  ? 'bg-white border-sky-300 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${
                    isOpen ? 'rotate-180 text-sky-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
