import React, { useState, useEffect, useRef } from 'react';
import { X, Code, Check, Copy, ArrowRight, Layers, FileCode, CheckCircle2 } from 'lucide-react';

export default function ShopifyIntegrationGuide({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('liquid'); // 'liquid' | 'lineitems' | 'headless'

  // Modern-web-guidance dialog lifecycle & fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }

    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isDialogContent) {
        onClose();
      }
    };

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [isOpen, onClose]);

  const liquidSnippet = `{% comment %}
  Section: sections/sports-customizer.liquid
  Compatible with Shopify Online Store 2.0 (Dawn, Sense, Craft, etc.)
{% endcomment %}

<div class="sports-customizer-container page-width" id="atletiq-studio-wrapper">
  <!-- React App Root Container -->
  <div id="root" data-product-id="{{ product.id }}" data-product-title="{{ product.title }}"></div>
</div>

<script>
  window.ShopifyCustomizerConfig = {
    productId: {{ product.id | json }},
    productVariantId: {{ product.selected_or_first_available_variant.id | json }},
    currency: {{ cart.currency.iso_code | json }},
    storeDomain: {{ shop.permanent_domain | json }}
  };

  // Function to dispatch item to native Shopify AJAX Cart (/cart/add.js)
  window.addToShopifyCart = async function(customData) {
    const payload = {
      items: [{
        id: window.ShopifyCustomizerConfig.productVariantId,
        quantity: customData.quantity || 1,
        properties: {
          'Dorsal / Número': customData.number,
          'Nombre Jugador': customData.name,
          'Color Base': customData.baseColor,
          'Color Mangas': customData.sleeveColor,
          'Patrón': customData.pattern,
          'Patrocinador': customData.sponsor,
          '_Roster_Equipos': JSON.stringify(customData.roster || []),
          '_Preview_SVG': customData.previewSvgUrl
        }
      }]
    };

    const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      // Trigger theme drawer update
      document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));
      window.location.href = '/cart';
    }
  };
</script>

{% schema %}
{
  "name": "Estudio Personalizador",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Título de la sección",
      "default": "Diseña tu Camiseta en Vivo"
    }
  ],
  "presets": [
    {
      "name": "Estudio Deportivo Personalizable"
    }
  ]
}
{% endschema %}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="shopify-guide-title"
      className="p-0 rounded-3xl bg-slate-900 text-slate-100 border border-slate-700/80 max-w-4xl w-full backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm shadow-2xl m-auto"
    >
      <div className="p-6 sm:p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shopify-guide-title" className="text-xl sm:text-2xl font-black text-white">
                Guía de Integración para Shopify
              </h2>
              <p className="text-xs text-slate-400">
                Estrategia y código listo para presentar y conectar esta aplicación en la tienda del cliente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 my-4 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('liquid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'liquid'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Sección Liquid (Dawn / OS 2.0)
          </button>
          <button
            onClick={() => setActiveTab('lineitems')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'lineitems'
                ? 'bg-amber-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Line Item Properties (Pedidos en Admin)
          </button>
        </div>

        {/* Tab Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4 max-h-[500px]">
          {activeTab === 'liquid' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ¿Cómo funciona la integración en Shopify?
                </h4>
                <p>
                  Esta página independiente está construida como un componente modular. Al integrarla en Shopify:
                </p>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-slate-400">
                  <li>Se copia el archivo compilado (<code className="text-amber-300">customizer.js</code>) a los Assets del tema Shopify.</li>
                  <li>Se crea una sección Liquid llamada <code className="text-amber-300">sections/sports-customizer.liquid</code> (código abajo).</li>
                  <li>El cliente o administrador puede arrastrar el personalizador desde el Editor de Temas de Shopify a cualquier producto o página.</li>
                </ol>
              </div>

              {/* Code Snippet Box */}
              <div className="relative">
                <button
                  onClick={() => handleCopy(liquidSnippet)}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 z-10 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? '¡Copiado!' : 'Copiar Código Liquid'}
                </button>
                <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-normal">
                  {liquidSnippet}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'lineitems' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-white text-sm mb-2">
                  ¿Cómo verá el cliente los pedidos en su panel de Shopify?
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Gracias al estándar de <strong>Line Item Properties</strong> de Shopify, no se requieren aplicaciones de pago mensuales de terceros. Cada pedido almacena los detalles de personalización directamente en la orden:
                </p>

                <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                  <p className="text-amber-400 font-bold">// Ejemplo de Pedido en Shopify Admin:</p>
                  <p><strong>Producto:</strong> Camiseta de Fútbol Pro Elite</p>
                  <p><strong>Cantidad:</strong> 15 unidades</p>
                  <p><strong>Dorsal / Número:</strong> 10</p>
                  <p><strong>Nombre Jugador:</strong> RODRÍGUEZ</p>
                  <p><strong>Color Base:</strong> #1d4ed8 (Azul Real)</p>
                  <p><strong>Color Mangas:</strong> #0f172a (Negro Carbón)</p>
                  <p><strong>Patrón:</strong> Rayas Verticales</p>
                  <p><strong>Sponsor:</strong> FLY EMIRATES</p>
                  <p><strong>Roster Jugadores:</strong> 15 tallas y dorsales detallados</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h5 className="font-bold text-white mb-1">Sin Costos de Apps</h5>
                  <p className="text-slate-400 text-[11px]">No pagas $30-50/mes por plugins de personalización lentos.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h5 className="font-bold text-white mb-1">Cero Ralentización</h5>
                  <p className="text-slate-400 text-[11px]">Carga ultra rápida en móviles con renderizado SVG nativo.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <h5 className="font-bold text-white mb-1">Ficha de Taller</h5>
                  <p className="text-slate-400 text-[11px]">Envía directamente los datos al taller de confección y sublimado.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black uppercase tracking-wider transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </dialog>
  );
}
