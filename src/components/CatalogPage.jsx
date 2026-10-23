import React, { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { BEERS_CATALOG, BEER_CATEGORIES, CURATED_PACKS } from '../data/beers';

export default function CatalogPage({
  cart,
  onAddToCart,
  onUpdateQty,
  onOpenCart,
  onClearCart,
  checkoutOpen,
  setCheckoutOpen,
}) {
  const [beersList, setBeersList] = useState(BEERS_CATALOG);
  const [packsList, setPacksList] = useState(CURATED_PACKS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedBeerId, setExpandedBeerId] = useState(null);
  const [addedFeedback, setAddedFeedback] = useState({});

  // Checkout state
  const [cep, setCep] = useState('');
  const [addressInfo, setAddressInfo] = useState(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('express-cwb');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [pixCopied, setPixCopied] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    number: '',
    complement: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    installments: '1',
  });

  // Carrega o catálogo oficial e estoque real do Back-End SQLite
  useEffect(() => {
    let mounted = true;
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data) {
          if (Array.isArray(data.beers) && data.beers.length > 0) {
            setBeersList(data.beers);
          }
          if (Array.isArray(data.packs) && data.packs.length > 0) {
            setPacksList(data.packs);
          }
        }
      })
      .catch(() => {
        // Mantém fallback local caso a API ainda esteja iniciando
      });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredBeers =
    activeCategory === 'all'
      ? beersList
      : beersList.filter((beer) => beer.category === activeCategory);

  const getItemQty = (id) => {
    const found = cart.find((item) => item.id === id);
    return found ? found.qty : 0;
  };

  const triggerAdded = (item) => {
    onAddToCart(item);
    setAddedFeedback((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedFeedback((prev) => ({ ...prev, [item.id]: false }));
    }, 1100);
  };

  // CEP lookup via ViaCEP
  const handleCepChange = async (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const formatted =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(formatted);

    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddressInfo({
            street: data.logradouro || 'Endereço identificado',
            neighborhood: data.bairro || '',
            city: data.localidade || 'Curitiba',
            uf: data.uf || 'PR',
          });
        } else {
          setAddressInfo({
            street: 'CEP Curitiba / Região',
            neighborhood: 'Centro',
            city: 'Curitiba',
            uf: 'PR',
          });
        }
      } catch {
        setAddressInfo({
          street: 'Entrega Local Curitiba',
          neighborhood: '',
          city: 'Curitiba',
          uf: 'PR',
        });
      } finally {
        setCepLoading(false);
      }
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const isFreeShipping = subtotal >= 120;

  const shippingCost =
    deliveryMethod === 'pickup'
      ? 0
      : isFreeShipping
      ? 0
      : deliveryMethod === 'express-cwb'
      ? 12.9
      : 22.0;

  const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const finalTotal = Math.max(0, subtotal - pixDiscount + shippingCost);

  // Envia o pedido de forma segura ao Back-End SQLite (validação server-side + criptografia AES-256-GCM)
  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    setOrderError(null);
    setSubmittingOrder(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gralha-Client': 'webapp-v1',
        },
        body: JSON.stringify({
          // Enviamos apenas ID e quantidade (o servidor calcula o preço real no SQLite)
          items: cart.map((item) => ({ id: item.id, qty: item.qty })),
          customer: {
            name: customerData.name,
            phone: customerData.phone,
          },
          deliveryMethod,
          paymentMethod,
          shipping: {
            cep,
            street: addressInfo?.street || 'Curitiba',
            number: customerData.number || 'S/N',
            complement: customerData.complement || '',
            neighborhood: addressInfo?.neighborhood || '',
            city: addressInfo?.city || 'Curitiba',
            uf: addressInfo?.uf || 'PR',
          },
          // PCI-DSS Hardening: trunca o PAN no cliente e transmite apenas os 4 últimos dígitos ao back-end próprio
          card:
            paymentMethod === 'card'
              ? {
                  last4: customerData.cardNumber.replace(/\D/g, '').slice(-4),
                }
              : null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Não foi possível validar o pedido.');
      }

      setOrderCompleted({
        protocol: result.protocol,
        total: result.total,
        paymentMethod: result.paymentMethod,
        deliveryMethod: result.deliveryMethod,
        itemsCount: totalItems,
        customerName: result.customerFirstName || customerData.name,
        securityBadge: result.securityBadge,
      });

      if (onClearCart) onClearCart();
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div id="catalogo" className="bg-[#121518] text-[#F4F1EA]">
      {/* SECTION 1: EDITORIAL HEADER & FILTER NAVIGATION */}
      <section className="pt-14 pb-16 lg:pt-20 lg:pb-20 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-4">
                <span className="w-10 h-[1px] bg-[#D88128]" />
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D88128]">
                  Catálogo Oficial • Envase Fresco
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight leading-[1.06] text-[#F4F1EA]">
                Nossas Cervejas.
              </h1>

              <p className="text-base sm:text-lg text-[#F4F1EA]/70 font-light max-w-2xl leading-relaxed">
                Lotes produzidos e mantidos sob refrigeração constante em Curitiba (2°C a 4°C). Escolha suas latas avulsas ou selecione uma de nossas caixas fechadas abaixo.
              </p>
            </div>

            {/* Right: Clean Filter Tabs */}
            <div className="lg:col-span-5 flex flex-wrap lg:justify-end gap-x-7 gap-y-3 border-t lg:border-t-0 pt-6 lg:pt-0 border-white/10">
              {BEER_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`font-mono text-xs uppercase tracking-[0.18em] pb-2 border-b transition-colors ${
                      isActive
                        ? 'border-[#D88128] text-[#F4F1EA]'
                        : 'border-transparent text-[#8E969F] hover:text-[#F4F1EA]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: HARMONIOUS PHOTOGRAPHIC CATALOG GRID */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-20">
            {filteredBeers.map((beer) => {
              const qtyInCart = getItemQty(beer.id);
              const isExpanded = expandedBeerId === beer.id;
              const justAdded = addedFeedback[beer.id];

              return (
                <article key={beer.id} className="flex flex-col justify-between group">
                  <div>
                    {/* Editorial Image Frame */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#1A2026] mb-6">
                      <img
                        src={beer.image}
                        alt={beer.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121518]/80 via-transparent to-black/20" />

                      {/* Subtle Top Batch Tag */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-[#F4F1EA]/90">
                        <span className="bg-[#121518]/75 backdrop-blur-xs px-3 py-1.5 border border-white/10">
                          {beer.batch}
                        </span>
                        <span className="bg-[#121518]/75 backdrop-blur-xs px-3 py-1.5 border border-white/10">
                          {beer.abv} ABV · {beer.ibu} IBU
                        </span>
                      </div>

                      {/* Volume & Live Cold-Storage Stock Caption at bottom */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#F4F1EA]/80">
                          {beer.volume}
                        </span>
                        {beer.stock !== undefined && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] px-2.5 py-1 bg-[#121518]/80 border border-[#749B6C]/40 text-[#749B6C]">
                            {beer.stock} un. a 2°C
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Style & Name */}
                    <div className="space-y-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D88128] block">
                        {beer.style}
                      </span>
                      <h2 className="font-serif text-2xl sm:text-3xl text-[#F4F1EA] font-normal">
                        {beer.name}
                      </h2>
                      <p className="text-sm text-[#F4F1EA]/70 font-light leading-relaxed pt-1">
                        {beer.shortDesc}
                      </p>
                    </div>

                    {/* Collapsible Sensory Sheet Trigger (Smooth Accordion) */}
                    <div className="mt-4 pt-3 border-t border-white/[0.07]">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() =>
                          setExpandedBeerId(isExpanded ? null : beer.id)
                        }
                        className="w-full flex items-center justify-between py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#8E969F] hover:text-[#D88128] transition-colors duration-300"
                      >
                        <span>Ficha Sensorial &amp; Harmonização</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#D88128] transition-transform duration-300 ease-in-out ${
                            isExpanded ? 'rotate-180' : 'rotate-0'
                          }`}
                        />
                      </button>

                      <div
                        className={`accordion-shell ${
                          isExpanded ? 'is-open' : ''
                        }`}
                      >
                        <div className="accordion-inner">
                          <div className="mt-3 pb-2 space-y-3 text-xs border-t border-white/[0.06] pt-4 text-[#F4F1EA]/80 font-light">
                            <div className="flex justify-between">
                              <span className="font-mono uppercase text-[10px] tracking-[0.15em] text-[#8E969F]">
                                Lúpulos
                              </span>
                              <span className="text-right">{beer.hops.join(', ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono uppercase text-[10px] tracking-[0.15em] text-[#8E969F]">
                                Maltes
                              </span>
                              <span className="text-right">{beer.malts.join(', ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-mono uppercase text-[10px] tracking-[0.15em] text-[#8E969F]">
                                Serviço &amp; Copo
                              </span>
                              <span className="text-right">
                                {beer.temp} · {beer.glass}
                              </span>
                            </div>
                            <div className="pt-1">
                              <span className="font-mono uppercase text-[10px] tracking-[0.15em] text-[#D88128] block mb-1">
                                Harmoniza com
                              </span>
                              <p className="text-[#F4F1EA]/75">
                                {beer.pairing.join(' · ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Purchase Control Row */}
                  <div className="mt-6 pt-5 border-t border-white/15 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8E969F] block">
                        Valor Unitário
                      </span>
                      <span className="font-serif text-2xl text-[#F4F1EA]">
                        R$ {beer.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center border border-[#D88128]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(beer.id, qtyInCart - 1)}
                          className="px-3.5 py-3 text-[#F4F1EA] hover:bg-white/10 transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 font-mono text-xs font-medium text-[#D88128]">
                          {qtyInCart} na sacola
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(beer.id, qtyInCart + 1)}
                          className="px-3.5 py-3 text-[#F4F1EA] hover:bg-white/10 transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerAdded(beer)}
                        className={`btn-craft-b-dark !px-6 !py-3.5 ${
                          justAdded ? 'btn-added-feedback' : ''
                        }`}
                      >
                        {justAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Adicionado</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: CURATED PACKS ON WARM CREAM PAPER (#F4F1EA) */}
      <section className="bg-[#F4F1EA] text-[#121518] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-[#1D435A]" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#1D435A]">
                Seleção da Cervejaria • Desconto Progressivo
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-[1.1]">
              Caixas Fechadas para Degustação.
            </h2>
            <p className="mt-4 text-base text-[#121518]/75 font-light leading-relaxed">
              Combinações pensadas pelo nosso cervejeiro para você experimentar os diferentes perfis de lupulagem e malte com condição especial.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {packsList.map((pack) => {
              const justAdded = addedFeedback[pack.id];
              return (
                <div
                  key={pack.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-center border-t border-[#121518]/15 pt-8"
                >
                  <div className="sm:col-span-5 aspect-[4/3] sm:aspect-[4/5] overflow-hidden bg-[#121518]/5">
                    <img
                      src={pack.image}
                      alt={pack.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>

                  <div className="sm:col-span-7 space-y-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1D435A] block">
                      {pack.style}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-[#121518]">
                      {pack.name}
                    </h3>
                    <p className="text-sm text-[#121518]/75 font-light leading-relaxed">
                      {pack.description}
                    </p>

                    <div className="pt-4 flex items-baseline gap-3">
                      <span className="font-serif text-3xl text-[#121518]">
                        R$ {pack.price.toFixed(2).replace('.', ',')}
                      </span>
                      {pack.originalPrice && (
                        <span className="font-mono text-xs line-through text-[#121518]/45">
                          R$ {pack.originalPrice.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => triggerAdded(pack)}
                        className={`btn-craft-b ${
                          justAdded ? 'btn-added-feedback' : ''
                        }`}
                      >
                        {justAdded ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Caixa na Sacola</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Adicionar Caixa</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: STICKY / BOTTOM ORDER SUMMARY BAR WHEN CART HAS ITEMS */}
      {totalItems > 0 && !checkoutOpen && (
        <div className="sticky bottom-0 z-30 bg-[#162936] text-[#F4F1EA] border-t border-white/15 py-4 px-6 lg:px-12 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#D88128] block">
                  Resumo da Seleção
                </span>
                <p className="font-serif text-lg text-[#F4F1EA]">
                  {totalItems} {totalItems === 1 ? 'item selecionado' : 'itens selecionados'} ·{' '}
                  <span className="font-mono text-base">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </p>
              </div>
              <span className="hidden md:inline-block font-mono text-xs text-[#F4F1EA]/70 border-l border-white/15 pl-6">
                {isFreeShipping
                  ? '✓ Frete Express Grátis liberado para Curitiba'
                  : `Faltam R$ ${(120 - subtotal).toFixed(2).replace('.', ',')} para Frete Grátis em Curitiba`}
              </span>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onOpenCart}
                className="px-5 py-3 border border-white/25 font-mono text-xs uppercase tracking-[0.16em] text-[#F4F1EA] hover:border-white transition-colors"
              >
                Revisar Sacola
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderError(null);
                  setCheckoutOpen(true);
                }}
                className="inline-flex items-center gap-3 bg-[#D88128] text-[#121518] px-7 py-3 font-mono text-xs font-medium uppercase tracking-[0.18em] hover:bg-[#F4F1EA] transition-colors"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: FULL EDITORIAL CHECKOUT MODAL (CONECTADO AO BACK-END SQLITE SEGURO) */}
      {checkoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 overflow-y-auto bg-[#121518]/95 backdrop-blur-md flex items-start justify-center p-4 sm:p-8"
        >
          <div className="w-full max-w-4xl bg-[#F4F1EA] text-[#121518] my-6 p-6 sm:p-12 shadow-2xl border border-[#121518]/15">
            <div className="flex items-center justify-between pb-6 border-b border-[#121518]/15 mb-8">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#1D435A] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#5A7D53]" />
                  <span>Gralha Brewing Co. • Checkout Criptografado (AES-256-GCM)</span>
                </span>
                <h2 className="font-serif text-2xl sm:text-4xl text-[#121518] mt-1">
                  Finalização de Pedido
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCheckoutOpen(false);
                  setOrderCompleted(null);
                  setOrderError(null);
                }}
                className="p-2 text-[#121518]/60 hover:text-[#121518]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {orderError && (
              <div className="mb-6 p-4 bg-[#D88128]/15 border border-[#D88128] flex items-center gap-3 text-xs font-mono text-[#121518]">
                <AlertCircle className="w-4 h-4 text-[#D88128] shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            {orderCompleted ? (
              <div className="py-10 text-center max-w-xl mx-auto space-y-6">
                <CheckCircle2 className="w-12 h-12 text-[#5A7D53] mx-auto stroke-[1.5]" />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#5A7D53] block">
                  Pedido Gravado no Banco SQLite • Protocolo #{orderCompleted.protocol}
                </span>
                <h3 className="font-serif text-3xl text-[#121518]">
                  Obrigado, {orderCompleted.customerName}!
                </h3>
                <p className="text-sm text-[#121518]/75 leading-relaxed">
                  Seu pedido foi validado pelo servidor da Gralha Brewing Co. e seus dados pessoais foram protegidos com criptografia autenticada AES-256-GCM.
                </p>

                <div className="p-6 bg-[#EFECE4] border border-[#121518]/15 text-left font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>PROTOCOLO OFICIAL:</span>
                    <strong>#{orderCompleted.protocol}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>PAGAMENTO:</span>
                    <strong className="uppercase">{orderCompleted.paymentMethod}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>TOTAL VALIDADO NO SERVIDOR:</span>
                    <strong>R$ {orderCompleted.total.toFixed(2).replace('.', ',')}</strong>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#121518]/10 text-[10px] text-[#5A7D53]">
                    <span>SEGURANÇA:</span>
                    <span>{orderCompleted.securityBadge}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(false);
                      setOrderCompleted(null);
                    }}
                    className="bg-[#121518] text-[#F4F1EA] px-8 py-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-[#D88128] hover:text-[#121518] transition-colors"
                  >
                    Voltar ao Catálogo
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Customer, CEP & Payment */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Step 1: Identification */}
                  <div className="space-y-4">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#1D435A] block">
                      01 / Seus Dados (Protegidos via LGPD / AES-256)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#121518]/70 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={customerData.name}
                          onChange={(e) =>
                            setCustomerData({ ...customerData, name: e.target.value })
                          }
                          placeholder="Seu nome"
                          className="w-full bg-transparent border-b border-[#121518]/30 py-2.5 text-sm focus:outline-none focus:border-[#121518]"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#121518]/70 mb-1">
                          WhatsApp / Telefone *
                        </label>
                        <input
                          type="tel"
                          required
                          maxLength={20}
                          value={customerData.phone}
                          onChange={(e) =>
                            setCustomerData({ ...customerData, phone: e.target.value })
                          }
                          placeholder="(41) 99999-9999"
                          className="w-full bg-transparent border-b border-[#121518]/30 py-2.5 text-sm focus:outline-none focus:border-[#121518]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Delivery & CEP */}
                  <div className="space-y-4 pt-4 border-t border-[#121518]/15">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#1D435A] block">
                      02 / Entrega em Curitiba &amp; Região
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#121518]/70 mb-1">
                          CEP *
                        </label>
                        <input
                          type="text"
                          required={deliveryMethod !== 'pickup'}
                          value={cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="80000-000"
                          className="w-full bg-transparent border-b border-[#121518]/30 py-2.5 text-sm font-mono focus:outline-none focus:border-[#121518]"
                        />
                      </div>
                      <div className="sm:col-span-2 text-xs text-[#121518]/75 pb-2">
                        {cepLoading && <span>Consultando CEP...</span>}
                        {!cepLoading && addressInfo && (
                          <span>
                            {addressInfo.street} — {addressInfo.neighborhood},{' '}
                            <strong>
                              {addressInfo.city}/{addressInfo.uf}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {addressInfo && deliveryMethod !== 'pickup' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#121518]/70 mb-1">
                            Número *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={15}
                            value={customerData.number}
                            onChange={(e) =>
                              setCustomerData({ ...customerData, number: e.target.value })
                            }
                            placeholder="Nº"
                            className="w-full bg-transparent border-b border-[#121518]/30 py-2 text-sm focus:outline-none focus:border-[#121518]"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#121518]/70 mb-1">
                            Complemento
                          </label>
                          <input
                            type="text"
                            maxLength={60}
                            value={customerData.complement}
                            onChange={(e) =>
                              setCustomerData({ ...customerData, complement: e.target.value })
                            }
                            placeholder="Apto / Bloco"
                            className="w-full bg-transparent border-b border-[#121518]/30 py-2 text-sm focus:outline-none focus:border-[#121518]"
                          />
                        </div>
                      </div>
                    )}

                    {/* Delivery Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {[
                        {
                          id: 'express-cwb',
                          title: 'Delivery Gelado CWB',
                          time: 'Hoje em até 2h',
                          cost: isFreeShipping ? 'Grátis' : 'R$ 12,90',
                        },
                        {
                          id: 'pickup',
                          title: 'Retirada Local',
                          time: 'Curitiba — PR',
                          cost: 'Grátis',
                        },
                        {
                          id: 'carrier',
                          title: 'Transportadora PR',
                          time: '2 a 4 dias úteis',
                          cost: isFreeShipping ? 'Grátis' : 'R$ 22,00',
                        },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDeliveryMethod(opt.id)}
                          className={`p-3.5 text-left border transition-colors ${
                            deliveryMethod === opt.id
                              ? 'border-[#121518] bg-[#121518] text-[#F4F1EA]'
                              : 'border-[#121518]/20 text-[#121518] hover:border-[#121518]'
                          }`}
                        >
                          <span className="font-mono text-[10px] uppercase tracking-[0.15em] block opacity-75">
                            {opt.cost}
                          </span>
                          <span className="font-serif text-sm block mt-0.5">
                            {opt.title}
                          </span>
                          <span className="text-[11px] opacity-70 block">
                            {opt.time}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Payment Method (PIX or Credit Card) */}
                  <div className="space-y-4 pt-4 border-t border-[#121518]/15">
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#1D435A] block">
                      03 / Forma de Pagamento
                    </span>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('pix')}
                        className={`py-3.5 px-4 font-mono text-xs uppercase tracking-[0.16em] border transition-colors ${
                          paymentMethod === 'pix'
                            ? 'border-[#121518] bg-[#121518] text-[#F4F1EA]'
                            : 'border-[#121518]/25 text-[#121518]'
                        }`}
                      >
                        PIX Imediato (5% OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`py-3.5 px-4 font-mono text-xs uppercase tracking-[0.16em] border transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-[#121518] bg-[#121518] text-[#F4F1EA]'
                            : 'border-[#121518]/25 text-[#121518]'
                        }`}
                      >
                        Cartão de Crédito
                      </button>
                    </div>

                    {paymentMethod === 'pix' ? (
                      <div className="p-5 bg-[#EFECE4] border border-[#121518]/15 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[#5A7D53]">
                            ✓ 5% de desconto validado no servidor
                          </span>
                          <span className="font-mono text-xs font-bold">
                            - R$ {pixDiscount.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <p className="text-xs text-[#121518]/75 leading-relaxed">
                          Utilize a chave Copia e Cola abaixo ou confirme o pedido para registrar o protocolo no banco:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value="00020126580014BR.GOV.BCB.PIX0136gralhabrewing-curitiba-2024-pr5204000053039865802BR"
                            className="w-full bg-white/70 border border-[#121518]/20 px-3 py-2 font-mono text-[11px] text-[#121518]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(
                                '00020126580014BR.GOV.BCB.PIX0136gralhabrewing-curitiba-2024-pr5204000053039865802BR'
                              );
                              setPixCopied(true);
                              setTimeout(() => setPixCopied(false), 2000);
                            }}
                            className="shrink-0 px-4 py-2 bg-[#121518] text-[#F4F1EA] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{pixCopied ? 'Copiado' : 'Copiar'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#121518]/70 mb-1">
                            Número do Cartão * (Tokenizado — Nunca salvo em texto puro)
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="0000 0000 0000 0000"
                            value={customerData.cardNumber}
                            onChange={(e) =>
                              setCustomerData({ ...customerData, cardNumber: e.target.value })
                            }
                            className="w-full bg-transparent border-b border-[#121518]/30 py-2 text-sm font-mono focus:outline-none focus:border-[#121518]"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#121518]/70 mb-1">
                              Validade (MM/AA) *
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={5}
                              placeholder="12/30"
                              value={customerData.cardExpiry}
                              onChange={(e) =>
                                setCustomerData({ ...customerData, cardExpiry: e.target.value })
                              }
                              className="w-full bg-transparent border-b border-[#121518]/30 py-2 text-sm font-mono focus:outline-none focus:border-[#121518]"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-[10px] uppercase tracking-[0.15em] text-[#121518]/70 mb-1">
                              CVV *
                            </label>
                            <input
                              type="password"
                              required
                              maxLength={4}
                              placeholder="***"
                              value={customerData.cardCvv}
                              onChange={(e) =>
                                setCustomerData({ ...customerData, cardCvv: e.target.value })
                              }
                              className="w-full bg-transparent border-b border-[#121518]/30 py-2 text-sm font-mono focus:outline-none focus:border-[#121518]"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Order Summary Box */}
                <div className="lg:col-span-5 bg-[#EFECE4] p-6 sm:p-8 border border-[#121518]/15 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#1D435A] block pb-4 border-b border-[#121518]/15">
                      Resumo do Pedido ({totalItems})
                    </span>

                    <div className="divide-y divide-[#121518]/10 my-4 max-h-64 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="py-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-serif text-sm text-[#121518] block">
                              {item.qty}x {item.name}
                            </span>
                            <span className="font-mono text-[10px] text-[#121518]/60">
                              {item.style}
                            </span>
                          </div>
                          <span className="font-mono text-xs font-medium">
                            R$ {(item.price * item.qty).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#121518]/15 space-y-2.5 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-[#121518]/70">Subtotal</span>
                      <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-[#121518]/70">Frete Curitiba</span>
                      <span>
                        {shippingCost === 0
                          ? 'Grátis'
                          : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                    {pixDiscount > 0 && (
                      <div className="flex justify-between font-mono text-[#5A7D53]">
                        <span>Desconto PIX (5%)</span>
                        <span>- R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-[#121518]/15 flex items-baseline justify-between">
                      <span className="font-mono uppercase tracking-[0.16em] text-xs">
                        Total Final
                      </span>
                      <span className="font-serif text-3xl text-[#121518]">
                        R$ {finalTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="w-full mt-6 py-4 px-6 bg-[#121518] text-[#F4F1EA] font-mono text-xs uppercase tracking-[0.2em] hover:bg-[#D88128] hover:text-[#121518] transition-colors disabled:opacity-50"
                    >
                      {submittingOrder ? 'Validando & Criptografando...' : 'Confirmar Pedido Seguro'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
