import React from 'react';
import { ShoppingBag, ArrowRight, Zap, Palette, FolderHeart } from 'lucide-react';

export default function Navbar({
  cartCount,
  onOpenCart,
  onOpenStudio,
  galleryCount = 0,
  onOpenGallery,
}) {
  return (
    <header className="sticky top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Alert (Owayo Style: Delivery & Club Guarantee) */}
      <div className="bg-slate-900 text-white text-[11px] sm:text-xs font-semibold py-1 px-3 sm:px-4 text-center tracking-wide flex items-center justify-center gap-2">
        <Zap className="w-3 h-3 text-amber-400 fill-current shrink-0" />
        <span className="truncate">Envíos a todo México, USA y Latam • Confección Pro • Muestras Gratuitas • Entrega 10-12 días</span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo - Clean & Editorial */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-base sm:text-xl italic tracking-tighter shadow-sm">
            AQ
          </div>
          <a href="#" className="flex flex-col">
            <span className="font-black text-base sm:text-xl text-slate-900 tracking-tight leading-none">
              ATLETIQ
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">
              Sports Atelier
            </span>
          </a>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-7 font-medium text-xs sm:text-sm text-slate-700">
          <a href="#drops-catalog" className="hover:text-sky-600 transition-colors font-bold">
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
            className="text-sky-600 hover:text-sky-700 font-extrabold transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider text-xs"
          >
            Configurador
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Botón Mis Diseños / Galería */}
          {onOpenGallery && (
            <button
              type="button"
              onClick={onOpenGallery}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ver mis diseños guardados"
            >
              <FolderHeart className="w-4 h-4 text-rose-500" />
              <span className="hidden md:inline">Mis Diseños</span>
              {galleryCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {galleryCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
            <span className="hidden xs:inline">Diseñar</span>
            <span className="hidden sm:inline">Equipación</span>
          </button>
        </div>
      </div>
    </header>
  );
}
