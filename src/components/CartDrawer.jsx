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
      className="p-0 m-0 ml-auto mr-0 h-full max-h-screen w-full sm:max-w-md bg-white text-slate-900 border-l border-slate-200 backdrop:bg-slate-950/40 backdrop:backdrop-blur-xs shadow-2xl flex flex-col"
    >
      <div className="p-6 flex flex-col h-full justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-600" />
              <h2 id="cart-title" className="text-xl font-black text-slate-900">
                Tu Carrito ({totalQuantity})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="overflow-y-auto max-h-[calc(100vh-320px)] my-4 space-y-3 pr-1">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">Tu carrito está vacío</p>
                <p className="text-xs text-slate-500 mt-1">
                  Personaliza una camiseta o selecciona un artículo para comenzar.
                </p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.cartId || index}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                        <span>{item.roster?.length ? `${item.roster.length} unidades` : '1 unidad'}</span>
                        <span>•</span>
                        <span className="font-bold text-sky-600">${item.unitPrice} c/u</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.cartId)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Specifications Pills */}
                  <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-2 text-[11px] text-slate-600">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1.5 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.design.baseColor }} />
                      Color: {item.design.baseColor}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono font-medium">
                      #{item.design.playerNumber || '10'} {item.design.playerName || 'PRO'}
                    </span>
                    {item.design.sponsorText && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                        Sponsor: {item.design.sponsorText}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200 font-bold">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="text-slate-900 text-sm font-black">${item.totalPrice} USD</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Checkout Actions */}
        {items.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-slate-600">Total a Pagar</span>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">${totalAmount} USD</span>
                <span className="text-[11px] text-emerald-600 block font-semibold">Envío asegurado incluido</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutSim}
              className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar al Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenQuoteModal}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                Cotización PDF
              </button>

              <button
                onClick={handleCopyShopifyPayload}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Copiar datos estructurados para Shopify Line Items"
              >
                <Copy className="w-3.5 h-3.5 text-blue-600" />
                Payload Shopify
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
