import React, { useEffect, useRef } from 'react';
import { X, Printer, CheckCircle2, Shield, Calendar, FileText } from 'lucide-react';

export default function OrderQuoteModal({
  isOpen,
  onClose,
  items
}) {
  const dialogRef = useRef(null);

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

  const totalAmount = items.reduce((acc, item) => acc + parseFloat(item.totalPrice), 0).toFixed(2);
  const totalUnits = items.reduce((acc, item) => acc + (item.roster?.length || 1), 0);
  const quoteNumber = `QT-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="quote-modal-title"
      className="p-0 rounded-3xl bg-white text-slate-900 border border-slate-200 max-w-3xl w-full backdrop:bg-slate-950/40 backdrop:backdrop-blur-xs shadow-2xl m-auto"
    >
      <div className="p-6 sm:p-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="quote-modal-title" className="text-xl sm:text-2xl font-black text-slate-900">
                Ficha Técnica &amp; Cotización Formal
              </h2>
              <p className="text-xs text-slate-500">
                Documento oficial de especificaciones listo para taller de confección y aprobación de presupuesto.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Document Sheet Preview */}
        <div className="overflow-y-auto flex-1 pr-1 my-5 space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs">
          {/* Header Info */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <span className="text-lg font-black text-slate-900 tracking-wider">
                ATLETIQ <span className="text-sky-600">PRO</span> STUDIO
              </span>
              <p className="text-slate-600 text-[11px] mt-0.5">Taller de Sublimación &amp; Confección Deportiva</p>
              <p className="text-slate-500 text-[10px]">contacto@atletiqpro.com • Tel: +52 (55) 4160-8800 / +1 (800) 555-0199</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-sky-600 font-bold block">{quoteNumber}</span>
              <span className="text-slate-500 text-[11px]">{currentDate}</span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Vigencia: 15 días
              </span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-3">Detalle de Artículos y Personalización</h4>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <strong className="text-slate-900 text-xs">{item.product.name}</strong>
                      <p className="text-slate-500 text-[11px]">{item.product.description}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${item.totalPrice} USD</span>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">COLOR BASE:</span>
                      <span className="font-mono font-semibold">{item.design.baseColor}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">COLOR MANGAS:</span>
                      <span className="font-mono font-semibold">{item.design.sleeveColor}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">PATRÓN TEXTIL:</span>
                      <span className="font-semibold">{item.design.pattern}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-semibold">CANTIDAD:</span>
                      <span className="font-bold text-sky-600">{item.roster?.length || 1} uds</span>
                    </div>
                  </div>

                  {/* Roster table preview if exists */}
                  {item.roster && item.roster.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block mb-1">
                        Listado de Jugadores / Dorsales:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {item.roster.map((player) => (
                          <span
                            key={player.id}
                            className="bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200 font-mono text-slate-800"
                          >
                            #{player.number} {player.name || 'JUGADOR'} ({player.size})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <div>
              <span className="text-slate-500 text-[11px] block">Condición de pago: 50% anticipo, 50% previo a despacho.</span>
              <span className="text-emerald-600 text-[10px] font-semibold">Garantía de confección 100% libre de defectos.</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 text-[11px] block">Total de Artículos: {totalUnits} unidades</span>
              <span className="text-2xl font-black text-slate-900">${totalAmount} USD</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-sky-600" />
            Imprimir / Guardar en PDF
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-sky-600/20"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </dialog>
  );
}
