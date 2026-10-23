import React, { useEffect, useRef } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, FileText, CheckCircle2, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onOpenQuoteModal
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
  const totalQuantity = items.reduce((acc, item) => acc + (item.roster?.length || 1), 0);

  const handleCheckoutSim = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    alert(`🎉 ¡Simulación de Pedido Completada!\n\nSe han registrado ${totalQuantity} artículos por $${totalAmount} USD.\nLos datos están formateados para sincronizarse directamente con el checkout de Shopify.`);
  };

  const handleCopyShopifyPayload = () => {
    const shopifyPayload = items.map(item => ({
      variant_id: item.product.id,
      quantity: item.roster?.length || 1,
      properties: {
        _product_type: item.product.type,
        _base_color: item.design.baseColor,
        _sleeve_color: item.design.sleeveColor,
        _collar_color: item.design.collarColor,
        _pattern: item.design.pattern,
        _font_style: item.design.fontStyle,
        _player_name: item.design.playerName,
        _player_number: item.design.playerNumber,
        _sponsor: item.design.sponsorText,
        _roster_data: item.roster ? JSON.stringify(item.roster) : 'Individual'
      }
    }));

    navigator.clipboard.writeText(JSON.stringify(shopifyPayload, null, 2));
    alert("¡Payload JSON para Shopify copiado al portapapeles!");
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="cart-title"
      className="p-0 m-0 ml-auto mr-0 h-full max-h-screen w-full sm:max-w-md bg-slate-950 text-slate-100 border-l border-slate-800 backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm shadow-2xl flex flex-col"
    >
      <div className="p-6 flex flex-col h-full justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 id="cart-title" className="text-xl font-black text-white">
                Tu Carrito ({totalQuantity})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="overflow-y-auto max-h-[calc(100vh-320px)] my-4 space-y-3 pr-1">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">Tu carrito está vacío</p>
                <p className="text-xs text-slate-500 mt-1">
                  Personaliza una camiseta o selecciona un artículo para comenzar.
                </p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.cartId || index}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 relative flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{item.roster?.length ? `${item.roster.length} unidades` : '1 unidad'}</span>
                        <span>•</span>
                        <span className="font-mono text-amber-400">${item.unitPrice} c/u</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.cartId)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Specifications Pills */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px] text-slate-300">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.design.baseColor }} />
                      Color: {item.design.baseColor}
                    </span>
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      #{item.design.playerNumber || '10'} {item.design.playerName || 'PRO'}
                    </span>
                    {item.design.sponsorText && (
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Sponsor: {item.design.sponsorText}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 font-bold">
                    <span className="text-slate-400">Subtotal</span>
                    <span className="text-white text-sm">${item.totalPrice} USD</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Checkout Actions */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-400">Total a Pagar</span>
              <div className="text-right">
                <span className="text-2xl font-black text-white">${totalAmount} USD</span>
                <span className="text-[11px] text-emerald-400 block font-semibold">Envío asegurado incluido</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutSim}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Continuar al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenQuoteModal}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Cotización PDF
              </button>

              <button
                onClick={handleCopyShopifyPayload}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-300 transition-all flex items-center justify-center gap-1.5"
                title="Copiar datos estructurados para Shopify Line Items"
              >
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                Payload Shopify
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
