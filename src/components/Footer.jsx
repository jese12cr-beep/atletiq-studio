import React from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Globe, Share2 } from 'lucide-react';

export default function Footer({ onOpenShopifyGuide }) {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-lg italic">
              AQ
            </div>
            <span className="text-xl font-black text-white tracking-wider">
              ATLETIQ <span className="text-amber-400">PRO</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Plataforma y taller especializado en equipamiento deportivo personalizado. Diseños únicos, sublimación premium y precios mayoristas para clubes.
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <Globe className="w-4 h-4 text-slate-500" />
            <span className="text-xs">Despachos nacionales e internacionales</span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Explorar</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-semibold">
            <li><a href="#customizer-studio" className="hover:text-amber-400 transition-colors">Estudio 3D en Vivo</a></li>
            <li><a href="#product-catalog" className="hover:text-amber-400 transition-colors">Catálogo de Artículos</a></li>
            <li><a href="#fabric-quality" className="hover:text-amber-400 transition-colors">Telas & Garantía</a></li>
            <li>
              <button onClick={onOpenShopifyGuide} className="hover:text-amber-400 text-left transition-colors">
                Integración Shopify (Liquid / Headless)
              </button>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Deportes</h4>
          <ul className="space-y-2 text-xs text-slate-400 font-semibold">
            <li>Camisetas de Fútbol & Futsal</li>
            <li>Jerseys de Baloncesto</li>
            <li>Sudaderas & Hoodies de Club</li>
            <li>Gorras & Snapbacks Técnicas</li>
            <li>Termos & Botellas Grabadas</li>
            <li>Espinilleras con Foto o Escudo</li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Atención al Cliente</h4>
          <ul className="space-y-3 text-xs text-slate-400 font-medium">
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>pedidos@atletiqpro.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>+1 (555) 928-4820 (WhatsApp Clubes)</span>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Parque Industrial Textil, Módulo 4</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 ATLETIQ PRO™ Custom Sports Studio. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Términos de Confección</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Política de Calidad</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Guía de Tallas</span>
        </div>
      </div>
    </footer>
  );
}
