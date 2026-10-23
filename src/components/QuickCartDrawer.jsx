import React, { useEffect } from 'react';
import { X, Plus, Minus, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';

export default function QuickCartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemove,
  onProceedToCheckout,
}) {
  // Fecha ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalCount = items.reduce((a, b) => a + b.qty, 0);
  const freeShippingThreshold = 120;
  const remaining = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label="Sacola de compras Gralha Brewing"
      className={`fixed inset-0 z-50 flex justify-end transition-all duration-500 ease-in-out ${
        isOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop com escurecimento e desfoque (backdrop-blur) suaves */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#111315]/75 backdrop-blur-md transition-opacity duration-500 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Side Drawer com deslizamento suave em cubic-bezier */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 w-full max-w-md bg-[#111315] border-l border-[#F4F1EA]/15 h-full flex flex-col justify-between p-7 sm:p-9 shadow-[-24px_0_60px_rgba(0,0,0,0.75)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Section: Header & Free Shipping Progress */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between pb-6 border-b border-[#F4F1EA]/12">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[#D88128]" />
              <div>
                <span className="font-serif italic text-sm text-[#D88128] block leading-none">
                  Cadeia Fria 2°C • Curitiba
                </span>
                <h2 className="font-display text-sm uppercase tracking-[0.22em] text-[#F4F1EA] mt-1">
                  Sua Sacola ({totalCount})
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar sacola"
              className="p-2 border border-transparent hover:border-[#F4F1EA]/20 text-[#8E969F] hover:text-[#F4F1EA] transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de Progresso de Frete Express Grátis */}
          <div className="py-4 border-b border-[#F4F1EA]/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              {remaining === 0 ? (
                <span className="text-[#749B6C] font-medium">
                  ✓ Frete Express Grátis liberado para Curitiba (até 2h)
                </span>
              ) : (
                <span className="text-[#C8C3B8]">
                  Faltam{' '}
                  <strong className="text-[#D88128] font-medium">
                    R$ {remaining.toFixed(2).replace('.', ',')}
                  </strong>{' '}
                  para Frete Express Grátis em Curitiba
                </span>
              )}
            </div>
            <div className="w-full h-1 bg-[#171A1D] overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className={`h-full transition-all duration-500 ease-in-out ${
                  remaining === 0 ? 'bg-[#749B6C]' : 'bg-[#D88128]'
                }`}
              />
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="divide-y divide-[#F4F1EA]/10 overflow-y-auto flex-1 pr-1 my-2">
            {items.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <ShoppingBag className="w-8 h-8 text-[#8E969F]/40 mx-auto stroke-[1.25]" />
                <p className="font-serif text-xl text-[#F4F1EA]">
                  Sua sacola está vazia.
                </p>
                <p className="text-xs text-[#8E969F] max-w-xs mx-auto leading-relaxed">
                  Explore nossas Pilsens não filtradas, IPAs frescas e caixas fechadas de degustação.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="py-5 flex items-center justify-between gap-4 group transition-colors duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-18 shrink-0 bg-[#171A1D] border border-[#F4F1EA]/12 overflow-hidden">
                      <img
                        src={item.image || '/logos/voo-rasante.jpg'}
                        onError={(e) => {
                          e.currentTarget.src = '/logos/voo-rasante.jpg';
                        }}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-serif italic text-xs text-[#D88128] truncate">
                        {item.style}
                      </p>
                      <h4 className="font-serif text-base text-[#F4F1EA] truncate">
                        {item.name}
                      </h4>
                      <span className="text-xs text-[#C8C3B8] block mt-0.5">
                        R$ {item.price.toFixed(2).replace('.', ',')} / un.
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemove(item.id)}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-[#8E969F] hover:text-[#D88128] mt-1.5 transition-colors duration-300"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center border border-[#F4F1EA]/20 bg-[#171A1D]/60 shrink-0">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      aria-label="Diminuir quantidade"
                      className="p-2 text-[#F4F1EA] hover:bg-[#D88128] hover:text-[#111315] transition-colors duration-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-medium text-[#F4F1EA]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      aria-label="Aumentar quantidade"
                      className="p-2 text-[#F4F1EA] hover:bg-[#D88128] hover:text-[#111315] transition-colors duration-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className="pt-6 border-t border-[#F4F1EA]/15 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8E969F]">
              Subtotal
            </span>
            <span className="font-serif text-2xl text-[#F4F1EA]">
              R$ {subtotal.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div className="flex items-baseline justify-between text-xs text-[#D88128]">
            <span>No PIX (5% de desconto imediato)</span>
            <span className="font-medium">
              R$ {(subtotal * 0.95).toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              onClose();
              if (onProceedToCheckout) onProceedToCheckout();
            }}
            className="btn-craft-b-dark w-full !py-4 disabled:opacity-30 disabled:pointer-events-none"
          >
            <span>Finalizar Pedido Refrigerado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </div>
  );
}
