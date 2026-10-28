import React from 'react';
import { ShoppingBag, Box, ShieldCheck, Zap } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenStudio,
  onOpenShopifyGuide,
}) {
  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Alert (México & USA Focus) */}
      <div className="bg-slate-900 text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
        <span>Envíos a todo México y Estados Unidos • Fabricación Deportiva Pro • Descuentos para Clubes hasta -25% • Entrega rápida en 10-12 días</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 flex items-center justify-center font-black text-white text-xl italic tracking-tighter shadow-md shadow-sky-600/20">
            AQ
          </div>
          <a href="#" className="flex flex-col">
            <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
              ATLETIQ <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">PRO 3D</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              Custom Sports Atelier
            </span>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-medium text-xs sm:text-sm text-slate-700">
          <a href="#drops-catalog" className="hover:text-sky-600 transition-colors">
            Catálogo
          </a>
          <a href="#como-funciona" className="hover:text-sky-600 transition-colors">
            Cómo Funciona
          </a>
          <a href="#tallas-muestras" className="hover:text-sky-600 transition-colors">
            Tallas &amp; Muestras
          </a>
          <a href="#faq" className="hover:text-sky-600 transition-colors">
            Preguntas Frecuentes
          </a>
          <button
            onClick={onOpenStudio}
            className="text-sky-600 hover:text-sky-700 font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
            Configurador 3D
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-600/20 hover:shadow-lg hover:shadow-sky-600/30 cursor-pointer"
          >
            <Box className="w-4 h-4" />
            <span>CONFIGURADOR 3D</span>
          </button>

          {/* Cart button */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
            title="Ver Cesta"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-sky-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
