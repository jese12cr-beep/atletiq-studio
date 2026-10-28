import React, { useState } from 'react';
import { Box, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

const CATALOG_ITEMS = [
  {
    engineId: 'futbol_jersey_pro_vneck',
    title: 'Camiseta Fútbol F3 Matchday',
    category: 'futbol',
    gender: 'Hombre / Unisex',
    price: '34.00',
    image: '/assets/stitch/ghost_mannequin.png',
    badge: 'Best Seller',
    description: 'Tejido transpirable TS-Tex con cuello en V reforzado y sublimación 100% integral.',
  },
  {
    engineId: 'basketball_b6_hero',
    title: 'Camiseta Baloncesto B6 Hero',
    category: 'basket',
    gender: 'Hombre',
    price: '32.00',
    image: '/assets/stitch/basketball_arena.png',
    badge: 'FIBA Compliant',
    description: 'Micromesh K-Tex antibacteriano, tirantes elásticos y panel de ventilación.',
  },
  {
    engineId: 'basketball_b7w_epic_women',
    title: 'Camiseta Baloncesto B7W Dama',
    category: 'basket',
    gender: 'Mujer (Corte Dama)',
    price: '32.00',
    image: '/assets/stitch/basketball_arena.png',
    badge: 'Corte Femenino',
    description: 'Patrón anatómico entallado femenino con sisa y pecho ergonómico.',
  },
  {
    engineId: 'jacket_softshell_601m_men',
    title: 'Chaqueta Softshell 601M',
    category: 'chaquetas',
    gender: 'Hombre',
    price: '58.00',
    image: '/assets/stitch/football_celebration.png',
    badge: 'Técnico / Viaje',
    description: 'Microfibra cortavientos con cremallera completa termosellada y bolsillos.',
  },
  {
    engineId: 'jacket_softshell_601w_women',
    title: 'Chaqueta Softshell 601W Dama',
    category: 'chaquetas',
    gender: 'Mujer (Corte Dama)',
    price: '58.00',
    image: '/assets/stitch/football_celebration.png',
    badge: 'Corte Femenino',
    description: 'Chaqueta técnica entallada repelente al agua para banquillo y paseo.',
  },
  {
    engineId: 'football_shorts_fp3',
    title: 'Pantalón Corto Fútbol FP3',
    category: 'futbol',
    gender: 'Hombre / Unisex',
    price: '22.00',
    image: '/assets/stitch/ghost_mannequin.png',
    badge: 'A juego con F3',
    description: 'Tejido elástico de alta movilidad con cordón interior y sin costuras laterales molestas.',
  },
];

export default function ProductCatalog({ onSelectProduct, onOpenQuote }) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? CATALOG_ITEMS
    : CATALOG_ITEMS.filter((item) => item.category === filter);

  return (
    <section id="drops-catalog" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-sky-600 font-mono text-xs font-bold tracking-widest uppercase block mb-1">
            Catálogo Oficial de Competición
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Equipaciones Deportivas Personalizables
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Prendas de grado profesional con patronaje oficial para clubes y atletas. Elige una prenda y configúrala en el motor 3D.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'futbol', label: 'Fútbol' },
            { id: 'basket', label: 'Baloncesto' },
            { id: 'chaquetas', label: 'Chaquetas' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === cat.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((item) => (
          <div
            key={item.engineId}
            className="group bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-sky-300 hover:shadow-xl transition-all flex flex-col justify-between"
          >
            {/* Visual Image container */}
            <div className="relative aspect-4/3 overflow-hidden bg-slate-100 flex items-center justify-center p-4">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                {item.badge}
              </span>
              <span className="absolute bottom-4 right-4 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                Desde €{item.price}
              </span>
            </div>

            {/* Content info */}
            <div className="p-6 flex flex-col flex-1 justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block mb-1">
                  {item.gender}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectProduct(item.engineId)}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>Personalizar en 3D</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
