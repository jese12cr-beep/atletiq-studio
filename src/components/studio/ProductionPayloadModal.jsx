import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Download, Copy, Check, Scissors, ShoppingBag, Database } from 'lucide-react';
import {
  generateSublimationCutSheetSVG,
  buildShopifyAndManufacturingBundle,
} from '../../engine/exporter/printReadyBuilder';

export default function ProductionPayloadModal({
  isOpen,
  onClose,
  design,
  product,
  roster,
  onConfirmAddToCart,
}) {
  const dialogRef = useRef(null);
  const [tab, setTab] = useState('cutsheet'); // 'cutsheet' | 'shopify' | 'owayo_json'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }

    const handleBackdrop = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!inside) onClose();
    };

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleBackdrop);
    }
    return () => dialog.removeEventListener('click', handleBackdrop);
  }, [isOpen, onClose]);

  const cutSheetSvg = useMemo(
    () => (isOpen ? generateSublimationCutSheetSVG(design, product, roster) : ''),
    [isOpen, design, product, roster]
  );

  const bundle = useMemo(
    () => (isOpen ? buildShopifyAndManufacturingBundle(design, product, roster) : null),
    [isOpen, design, product, roster]
  );

  const handleDownloadSvg = () => {
    const blob = new Blob([cutSheetSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${design.designId}_MOLDE_PLOTTER_300DPI.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = (obj) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!bundle) return null;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="prod-modal-title"
      className="p-0 rounded-3xl bg-slate-900 text-slate-100 border border-slate-700/80 max-w-5xl w-full backdrop:bg-slate-950/85 backdrop:backdrop-blur-sm shadow-2xl m-auto"
    >
      <div className="p-5 sm:p-7 flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-widest block">
              Pipeline Print-Ready Zakeke + Roster Owayo
            </span>
            <h2 id="prod-modal-title" className="text-xl sm:text-2xl font-black text-white">
              Inspector de Manufactura & Puente Shopify ({design.designId})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de Pestañas */}
        <div className="flex flex-wrap gap-2 py-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setTab('cutsheet')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              tab === 'cutsheet' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-300'
            }`}
          >
            <Scissors className="w-4 h-4" />
            1. Pliego de Corte Sublimación (SVG 1:1 + Sangrado 15mm)
          </button>

          <button
            type="button"
            onClick={() => setTab('shopify')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              tab === 'shopify' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-300'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            2. Payload Shopify `/cart/add.js` (Sin Base64)
          </button>

          <button
            type="button"
            onClick={() => setTab('owayo_json')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
              tab === 'owayo_json' ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-300'
            }`}
          >
            <Database className="w-4 h-4" />
            3. Documento Maestro `Single-Design-ID`
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto my-4">
          {tab === 'cutsheet' && (
            <div className="space-y-3">
              <div className="w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                <div
                  className="w-full [&>svg]:w-full [&>svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: cutSheetSvg }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Línea blanca continua = corte láser • Línea magenta punteada = sangrado +15 mm para costura overlock.
                </span>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Descargar Pliego Vectorial (.SVG)
                </button>
              </div>
            </div>
          )}

          {tab === 'shopify' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => handleCopyJson(bundle.shopifyCartAddPayload)}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar Payload'}
              </button>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                {JSON.stringify(bundle.shopifyCartAddPayload, null, 2)}
              </pre>
            </div>
          )}

          {tab === 'owayo_json' && (
            <div className="relative">
              <button
                type="button"
                onClick={() => handleCopyJson({ masterDesign: bundle.masterDesignRecord, roster })}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar JSON Maestro'}
              </button>
              <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto">
                {JSON.stringify({ masterDesign: bundle.masterDesignRecord, roster }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs text-slate-400 block">
              {bundle.pricing.totalUnits} unidades • {bundle.pricing.tier.label}
            </span>
            <span className="text-2xl font-black text-white">
              ${bundle.pricing.totalOrderPrice.toFixed(2)} USD{' '}
              <span className="text-xs font-normal text-amber-400">
                (${bundle.pricing.unitPrice.toFixed(2)} c/u)
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onConfirmAddToCart(bundle);
              onClose();
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Confirmar y Enviar Lote al Carrito
          </button>
        </div>
      </div>
    </dialog>
  );
}
