import React from 'react';
import { ShoppingBag, Zap, ShieldCheck, Code, Users } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenShopifyGuide,
  onOpenRosterModal
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 text-xs font-black py-1.5 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 fill-current" />
        <span>Descuentos para Equipos y Clubes: Hasta 35% OFF en pedidos superiores a 25 camisetas</span>
        <Zap className="w-3.5 h-3.5 fill-current" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl italic tracking-tighter">
            AQ
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-wider flex items-center gap-1">
              ATLETIQ <span className="text-amber-400 text-sm font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">PRO</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest block uppercase">
              Custom Sports Studio
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold">
          <a href="#customizer-studio" className="text-slate-300 hover:text-amber-400 transition-colors">
            Estudio en Vivo
          </a>
          <a href="#product-catalog" className="text-slate-300 hover:text-amber-400 transition-colors">
            Catálogo
          </a>
          <button
            onClick={onOpenRosterModal}
            className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4 text-amber-400" />
            Roster de Equipos
          </button>
          <a href="#fabric-quality" className="text-slate-300 hover:text-amber-400 transition-colors">
            Telas & Confección
          </a>
          <button
            onClick={onOpenShopifyGuide}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 transition-all"
          >
            <Code className="w-4 h-4" />
            Integración Shopify
          </button>
        </nav>

        {/* Right CTA & Cart Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-extrabold hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
