import React from 'react';

export default function Footer({ onOpenShopifyGuide }) {
  return (
    <footer className="w-full bg-white border-t border-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Brand info */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-black text-white text-base italic">
              AQ
            </div>
            <span className="font-extrabold text-lg text-slate-900">
              ATLETIQ™ STUDIO // LAB
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
            Fabricación e indumentaria deportiva personalizada para clubes profesionales, filiales y ligas deportivas.
          </p>
          <div className="text-xs font-mono text-sky-600 font-bold uppercase tracking-wider">
            [ Homologado oficialmente RFEF / FEB / FIBA ]
          </div>
        </div>

        {/* Muestras y contacto */}
        <div className="md:col-span-4 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Muestras Textiles para Clubes
          </span>
          <p className="text-xs text-slate-500">
            Registra el correo de tu club o entidad para recibir muestras físicas y catálogo técnico.
          </p>
          <div className="flex items-center mt-2 max-w-sm">
            <input
              type="email"
              placeholder="Email de tu club o entidad..."
              className="bg-slate-50 border border-slate-300 text-xs text-slate-800 px-3.5 py-2.5 rounded-l-xl placeholder-slate-400 focus:outline-none focus:border-sky-500 w-full"
            />
            <button
              onClick={() => alert('Entidad registrada para muestras técnicas.')}
              className="bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-r-xl hover:bg-sky-700 transition-colors uppercase shrink-0 cursor-pointer"
            >
              Pedir
            </button>
          </div>
        </div>

        {/* Guías y Enlaces */}
        <div className="md:col-span-3 flex flex-col gap-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-900 mb-1">
            Información & Comercio
          </span>
          <button
            onClick={onOpenShopifyGuide}
            className="text-left text-sky-600 hover:underline font-semibold cursor-pointer"
          >
            - Guía de Integración Shopify
          </button>
          <span className="text-slate-500">- Lavado Técnico a 60°C</span>
          <span className="text-slate-500">- Normativas de Dorsales FIFA/FIBA</span>
          <span className="text-slate-500">- Tabla Oficial de Medidas</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© 2026 ATLETIQ SPORTS. Todos los derechos reservados.</p>
        <div className="flex flex-wrap gap-4">
          <span className="font-semibold text-slate-700">México &amp; USA // CDMX • Monterrey • Guadalajara • Los Ángeles • Miami</span>
          <span>Garantía Oficial de Competición</span>
        </div>
      </div>
    </footer>
  );
}
