import React, { useState } from 'react';
import { Sparkles, Star, ArrowRight, Clock, ShieldCheck, Check } from 'lucide-react';
import { PRODUCTS_CATALOG, SPORTS_CATEGORIES } from '../data/mockData';

export default function ProductCatalog({ onSelectProduct }) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? PRODUCTS_CATALOG
    : PRODUCTS_CATALOG.filter(p => p.category === activeCategory);

  return (
    <section id="product-catalog" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <span className="text-amber-400 font-mono text-xs font-bold tracking-widest uppercase block mb-1">
            Catálogo Oficial
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Artículos Deportivos Personalizables
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Prendas y accesorios de grado profesional listos para estampar con sublimación HD, bordado o grabado láser.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {SPORTS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between hover:shadow-2xl hover:shadow-amber-500/5"
          >
            {/* Image & Badge */}
            <div className="relative aspect-video overflow-hidden bg-slate-950">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-amber-400 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                {product.badge}
              </span>

              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-amber-400 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold text-white">{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount})</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {product.description}
                </p>

                {/* Customizable tags */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {product.customizableParts.map((part, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                    >
                      ✓ {part}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Action Row */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Desde</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">${product.basePrice.toFixed(2)}</span>
                    <span className="text-xs text-slate-400">USD</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectProduct(product);
                    const studioEl = document.getElementById('customizer-studio');
                    studioEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-amber-400/10 group-hover:shadow-amber-400/30"
                >
                  <span>Personalizar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
