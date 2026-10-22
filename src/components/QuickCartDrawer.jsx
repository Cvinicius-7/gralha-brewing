import React from 'react';
import { X, Plus, Minus, ArrowRight } from 'lucide-react';

export default function QuickCartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  onProceedToCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const freeShippingThreshold = 120;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-[#121518]/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#121518] border-l border-white/15 h-full flex flex-col justify-between p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#F4F1EA]">
              Sua Sacola ({items.reduce((a, b) => a + b.qty, 0)})
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-[#8E969F] hover:text-[#F4F1EA] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Minimalist Free Shipping Notice */}
          <div className="py-4 border-b border-white/10 font-mono text-[11px] text-[#8E969F]">
            {remaining === 0 ? (
              <span className="text-[#D88128]">
                ✓ Frete Express Grátis liberado para Curitiba
              </span>
            ) : (
              <span>
                Adicione R$ {remaining.toFixed(2).replace('.', ',')} para Frete Grátis em Curitiba
              </span>
            )}
          </div>

          {/* Items List */}
          <div className="divide-y divide-white/10 max-h-[58vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-serif text-lg text-[#F4F1EA] mb-1">
                  Sua sacola está vazia.
                </p>
                <p className="text-xs text-[#8E969F]">
                  Selecione nossas Pilsens, IPAs e caixas no catálogo.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="py-5 flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-serif text-base text-[#F4F1EA]">
                      {item.name}
                    </h4>
                    <span className="font-mono text-[11px] text-[#8E969F] block mt-0.5">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8E969F] hover:text-[#D88128] mt-2 inline-block"
                    >
                      Remover
                    </button>
                  </div>

                  <div className="flex items-center border border-white/20">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      className="p-2 text-[#F4F1EA] hover:bg-white/10"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-mono text-xs text-[#F4F1EA]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      className="p-2 text-[#F4F1EA] hover:bg-white/10"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/10 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#8E969F]">
              Subtotal
            </span>
            <span className="font-serif text-2xl text-[#F4F1EA]">
              R$ {subtotal.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono text-[11px] text-[#D88128]">
            <span>No PIX (5% de desconto)</span>
            <span>R$ {(subtotal * 0.95).toFixed(2).replace('.', ',')}</span>
          </div>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              onClose();
              if (onProceedToCheckout) onProceedToCheckout();
            }}
            className="w-full py-4 px-6 bg-[#F4F1EA] text-[#121518] font-mono text-xs uppercase tracking-[0.18em] hover:bg-[#D88128] transition-colors flex items-center justify-between disabled:opacity-30"
          >
            <span>Finalizar Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
