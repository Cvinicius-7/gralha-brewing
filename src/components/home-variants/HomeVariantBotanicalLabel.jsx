import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowDown,
  MapPin,
  Clock,
  Phone,
  Send,
  CheckCircle2,
  ChevronDown,
  Plus,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { BEERS_CATALOG, CURATED_PACKS } from '../../data/beers';

export default function HomeVariantBotanicalLabel({
  onGoToCatalog,
  onAddToCart,
  onOpenCart,
}) {
  const [scrollY, setScrollY] = useState(0);
  const [beersList, setBeersList] = useState(BEERS_CATALOG);
  const [packsList, setPacksList] = useState(CURATED_PACKS);
  const [expandedHarmonizacao, setExpandedHarmonizacao] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [contactSent, setContactSent] = useState(false);
  const [contactProtocol, setContactProtocol] = useState(null);
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    subject: 'Visitação & Taproom Curitiba',
    message: '',
  });

  // Sincroniza lote e estoque real do banco SQLite
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
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver para o efeito de revelação suave no scroll
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const heroProgress = Math.min(scrollY / 750, 1);
  const verticalFloat = heroProgress * 24;
  const imageParallax = heroProgress * 56;
  const heroFooterOpacity = Math.max(1 - heroProgress * 1.35, 0.15);

  const toggleHarmonizacao = (id) => {
    setExpandedHarmonizacao((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleQuickAdd = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    }
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 1350);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gralha-Client': 'webapp-v1',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar sua mensagem.');
      }

      setContactProtocol(data.protocol || 'MSG-CWB');
      setContactSent(true);
      setContactForm({
        name: '',
        phone: '',
        subject: 'Visitação & Taproom Curitiba',
        message: '',
      });
    } catch (err) {
      setContactError(err.message);
    } finally {
      setContactSubmitting(false);
    }
  };

  return (
    <div className="bg-[#111315] text-[#F4F1EA] selection:bg-[#D88128] selection:text-[#111315]">
      {/* =====================================================================
          1. HERO SECTION — BIPARTITE TONAL CANVAS (IMAGEM ORIGINAL VOO RASANTE)
          ===================================================================== */}
      <section
        id="inicio"
        className="relative min-h-svh grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
      >
        {/* Left Half: Botanical Paper (#EFECE4) */}
        <div className="lg:col-span-6 bg-[#EFECE4] text-[#111315] px-6 sm:px-12 lg:px-14 pt-28 pb-14 lg:pt-24 lg:pb-16 flex flex-col justify-between relative z-10">
          <div className="max-w-md space-y-3">
            <p className="font-serif italic text-lg text-[#1D435A]">
              Curitiba, Paraná — Safra 2024
            </p>
            <p className="text-sm text-[#111315]/75 leading-relaxed">
              Do papel texturizado do nosso rótulo para o frescor do tanque. Cervejaria independente dedicada às Pilsens não filtradas e IPAs intensas.
            </p>
          </div>

          {/* Left Half of Split Monumental Display Title: GRALHA */}
          <div
            style={{
              transform: `translate3d(0, ${-verticalFloat * 0.45}px, 0)`,
            }}
            className="my-12 lg:my-0 transition-transform duration-200 ease-out will-change-transform"
          >
            <span className="font-display font-extrabold text-[clamp(3.2rem,5.9vw,6.2rem)] leading-[0.9] tracking-[-0.035em] text-[#1D435A] uppercase block">
              GRALHA
            </span>
          </div>

          <div
            style={{
              opacity: heroFooterOpacity,
              transform: `translate3d(0, ${-verticalFloat * 0.25}px, 0)`,
            }}
            className="max-w-sm space-y-5 pt-6 border-t border-[#111315]/15 transition-all duration-200 ease-out"
          >
            <p className="text-xs sm:text-sm text-[#111315]/80 leading-relaxed">
              “Nascida em 2024 nas panelas da família em Curitiba. Cada lata preserva o aroma vivo do lúpulo fresco sem pasteurização.”
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onGoToCatalog}
                className="btn-craft-b"
              >
                <span>Comprar Latas Frescas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href="#sobre"
                className="inline-flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[#1D435A] hover:text-[#111315] transition-colors duration-300"
              >
                <span>Sobre Nós</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Half: Original Voo Rasante Photographic Stage + Centered BREWING */}
        <div className="lg:col-span-6 bg-[#111315] relative min-h-[540px] lg:min-h-full flex flex-col justify-between px-6 sm:px-10 lg:px-10 pt-28 pb-14 lg:pt-24 lg:pb-16 overflow-hidden">
          <img
            src="/logos/voo-rasante.jpg"
            alt="Cerveja artesanal Gralha Brewing Voo Rasante Pilsen"
            fetchPriority="high"
            decoding="async"
            style={{
              transform: `scale(${1.05 + heroProgress * 0.06}) translate3d(0, ${imageParallax}px, 0)`,
            }}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-82 transition-transform duration-200 ease-out will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111315]/75 via-[#111315]/25 to-transparent" />
          {/* Dissolve orgânico e profundo na base da foto para fundir sem corte seco com a continuação */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111315] via-[#111315]/35 to-[#111315]/40" />

          <div className="relative z-10 h-6" />

          {/* Right Half of Split Monumental Display Title: BREWING (Centralizado na coluna direita) */}
          <div
            style={{
              transform: `translate3d(0, ${verticalFloat * 0.45}px, 0)`,
            }}
            className="relative z-10 my-auto w-full flex justify-center text-center transition-transform duration-200 ease-out will-change-transform"
          >
            <span className="font-display font-extrabold text-[clamp(3.1rem,5.6vw,5.85rem)] leading-[0.9] tracking-[-0.035em] text-[#F4F1EA] uppercase block">
              BREWING
            </span>
          </div>

          <div
            style={{
              opacity: heroFooterOpacity,
              transform: `translate3d(0, ${-verticalFloat * 0.25}px, 0)`,
            }}
            className="relative z-10 flex items-end justify-between border-t border-[#F4F1EA]/15 pt-4 text-xs text-[#F4F1EA]/85 transition-all duration-200 ease-out"
          >
            <span>Czech-Style German Pilsner • 473ml</span>
            <span className="text-[#D88128] font-medium">
              4,8% ALC. • 28 IBU
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. SOBRE NÓS — CONTINUIDADE BIPARTIDA FLUIDA (ZERO QUEBRA SECA DA HERO)
          ===================================================================== */}
      <section
        id="sobre"
        className="relative grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
      >
        {/* Left Continuation Column: Warm Botanical Paper (#EFECE4 -> #E6E1D6) */}
        <div className="lg:col-span-6 bg-gradient-to-b from-[#EFECE4] via-[#EFECE4] to-[#E6E1D6] text-[#111315] px-6 sm:px-12 lg:px-14 py-20 lg:py-32 flex flex-col justify-between">
          <div className="mb-12 flex items-center gap-4">
            <span className="w-10 h-px bg-[#D88128]" />
            <span className="font-serif italic text-base text-[#1D435A]">
              01 — A Cervejaria &amp; Nossa Origem
            </span>
          </div>

          <div data-reveal className="scroll-reveal space-y-8 my-auto max-w-xl">
            <p className="font-serif italic text-xl text-[#D88128]">
              Curitiba, Paraná • Fundada em 2024
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#111315] leading-[1.08] tracking-[-0.025em]">
              Nascida entre família, panelas e o frio da serra paranaense.
            </h2>

            <div className="space-y-5 text-sm sm:text-base text-[#111315]/80 leading-relaxed pt-2">
              <p>
                A Gralha Brewing Co. nasceu em 2024 como nascem as cervejarias artesanais autênticas: na garagem de casa em Curitiba, ajustando rampas de mosturação, estudando o perfil mineral da água local e compartilhando cada brassagem entre família e amigos próximos.
              </p>
              <p>
                Batizada em homenagem à Gralha-Azul — guardiã das matas de araucária do Paraná — nossa cervejaria une o rigor técnico das Pilsens tchecas e alemãs não filtradas à intensidade aromática das IPAs contemporâneas em duplo Dry Hopping.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#111315]/15">
              <div>
                <span className="font-serif text-3xl sm:text-4xl text-[#1D435A] block">
                  100% Puro Malte
                </span>
                <span className="text-xs text-[#111315]/70 mt-1.5 block leading-relaxed">
                  Maltes Pilsner, Maris Otter, Vienna e aveia selecionada safra a safra.
                </span>
              </div>
              <div>
                <span className="font-serif text-3xl sm:text-4xl text-[#D88128] block">
                  Zero Atalhos
                </span>
                <span className="text-xs text-[#111315]/70 mt-1.5 block leading-relaxed">
                  Sem enzimas aceleradoras, corantes ou pasteurização térmica.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-12 mt-12 border-t border-[#111315]/12 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#1D435A]">
            <span>Água Tratada Perfil a Perfil</span>
            <span>Lotes Pequenos • CWB</span>
          </div>
        </div>

        {/* Right Continuation Column: Deep Obsidian (#111315 -> #132C3C) with Macro Ingredients */}
        <div className="lg:col-span-6 bg-gradient-to-b from-[#111315] via-[#132C3C]/70 to-[#111315] text-[#F4F1EA] px-6 sm:px-12 lg:px-14 py-20 lg:py-32 flex flex-col justify-between">
          <div
            data-reveal
            style={{ transitionDelay: '120ms' }}
            className="scroll-reveal space-y-10 my-auto"
          >
            <div className="aspect-[4/5] max-w-lg mx-auto overflow-hidden bg-[#171A1D] border border-[#F4F1EA]/12 shadow-[0_28px_70px_rgba(0,0,0,0.65)] relative group">
              <img
                src="/logos/context-lupulo-malte.jpg"
                alt="Cones de lúpulo fresco abertos com lupulina dourada, grãos de malte e pá de brassagem"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-[#111315] via-[#111315]/75 to-transparent">
                <p className="font-serif italic text-xl text-[#F4F1EA]">
                  Lupulina fresca &amp; grãos nobres
                </p>
                <p className="text-xs text-[#C8C3B8] mt-1">
                  Saaz, Hallertau Mittelfrüh, Citra, Mosaic e Galaxy armazenados a vácuo.
                </p>
              </div>
            </div>

            <div className="max-w-lg mx-auto space-y-4 pt-2">
              <p className="font-serif italic text-lg text-[#D88128]">
                O tempo do tanque dita cada lote
              </p>
              <p className="text-sm text-[#C8C3B8] font-light leading-relaxed">
                Cada receita repousa em maturação lenta pelo tempo necessário para arredondar o amargor, decantar naturalmente as leveduras e formar uma espuma densa que protege os aromas voláteis até o último gole.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. LINHA DE CERVEJAS — TODOS OS 6 RÓTULOS COM ACCORDION DE HARMONIZAÇÃO
          ===================================================================== */}
      <section
        id="cervejas"
        className="bg-[#111315] py-24 lg:py-36 border-t border-[#F4F1EA]/10"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            data-reveal
            className="scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
            <div>
              <p className="font-serif italic text-lg text-[#D88128] mb-2">
                02 — Envase Fresco em Lata 473ml
              </p>
              <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-[0.16em] text-[#F4F1EA]">
                Linha de Cervejas
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {onOpenCart && (
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="inline-flex items-center gap-2.5 px-5 py-3 border border-[#F4F1EA]/20 hover:border-[#D88128] text-xs uppercase tracking-[0.18em] text-[#C8C3B8] hover:text-[#F4F1EA] transition-all duration-300"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D88128]" />
                  <span>Ver Sacola</span>
                </button>
              )}
              <button
                type="button"
                onClick={onGoToCatalog}
                className="btn-craft-b-dark"
              >
                <span>Abrir Loja Completa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {beersList.map((beer, idx) => {
              const isExpanded = !!expandedHarmonizacao[beer.id];
              const isAdded = !!addedItems[beer.id];

              return (
                <article
                  key={beer.id}
                  data-reveal
                  style={{ transitionDelay: `${(idx % 3) * 110}ms` }}
                  className="scroll-reveal bg-[#132C3C]/35 border border-[#F4F1EA]/12 p-6 flex flex-col justify-between group hover:border-[#D88128]/60 transition-all duration-500 shadow-[0_22px_55px_rgba(0,0,0,0.5)]"
                >
                  <div>
                    <div className="aspect-[4/5] overflow-hidden bg-[#171A1D] mb-6 relative">
                      <img
                        src={beer.image}
                        onError={(e) => {
                          e.currentTarget.src = '/logos/voo-rasante.jpg';
                        }}
                        alt={beer.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#F4F1EA]">
                        <span className="bg-[#111315]/80 backdrop-blur-xs px-3 py-1 border border-[#F4F1EA]/15">
                          {beer.batch}
                        </span>
                        <span className="bg-[#111315]/80 backdrop-blur-xs px-3 py-1 border border-[#F4F1EA]/15">
                          {beer.abv} ABV • {beer.ibu} IBU
                        </span>
                      </div>
                    </div>

                    <p className="font-serif italic text-sm text-[#D88128]">
                      {beer.style}
                    </p>
                    <h3 className="font-serif text-2xl text-[#F4F1EA] mt-1">
                      {beer.name}
                    </h3>
                    <p className="text-xs text-[#C8C3B8] mt-2.5 leading-relaxed font-light">
                      {beer.shortDesc}
                    </p>

                    {/* Accordion Fluido de Harmonização & Notas Sensoriais */}
                    <div className="mt-5 pt-3 border-t border-[#F4F1EA]/10">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleHarmonizacao(beer.id)}
                        className="w-full flex items-center justify-between py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#C8C3B8] hover:text-[#D88128] transition-colors duration-300"
                      >
                        <span>Harmonização &amp; Ficha</span>
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
                          <div className="pt-3 pb-2 space-y-2.5 text-xs border-t border-[#F4F1EA]/10 mt-2 text-[#C8C3B8] font-light">
                            <div className="flex justify-between gap-4">
                              <span className="uppercase text-[10px] tracking-[0.16em] text-[#8E969F]">
                                Lúpulos
                              </span>
                              <span className="text-right text-[#F4F1EA]">
                                {beer.hops.join(', ')}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="uppercase text-[10px] tracking-[0.16em] text-[#8E969F]">
                                Maltes
                              </span>
                              <span className="text-right text-[#F4F1EA]">
                                {beer.malts.join(', ')}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="uppercase text-[10px] tracking-[0.16em] text-[#8E969F]">
                                Serviço Ideal
                              </span>
                              <span className="text-right text-[#F4F1EA]">
                                {beer.temp} • {beer.glass}
                              </span>
                            </div>
                            <div className="pt-1.5 border-t border-[#F4F1EA]/10">
                              <span className="uppercase text-[10px] tracking-[0.16em] text-[#D88128] block mb-1">
                                Harmoniza com
                              </span>
                              <p className="text-[#F4F1EA]/90 leading-relaxed">
                                {beer.pairing.join(' • ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F4F1EA]/12 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-[#8E969F] block">
                        {beer.volume} • {beer.temp}
                      </span>
                      <span className="font-serif text-2xl text-[#F4F1EA]">
                        R$ {beer.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickAdd(beer)}
                      className={`btn-craft-b-dark !px-5 !py-2.5 ${
                        isAdded ? 'btn-added-feedback' : ''
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Na Sacola</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          3.5. SELEÇÃO DE CERVEJAS (PACKS & KITS DEGUSTAÇÃO — NANO BANANA)
          ===================================================================== */}
      <section
        id="packs"
        className="bg-[#132C3C] py-24 lg:py-32 border-t border-[#F4F1EA]/12"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div
            data-reveal
            className="scroll-reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          >
            <div className="max-w-2xl">
              <p className="font-serif italic text-lg text-[#D88128] mb-2">
                02.B — Seleção do Mestre-Cervejeiro • Condição Especial
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#F4F1EA] leading-[1.08] tracking-[-0.02em]">
                Caixas &amp; Kits para Degustação.
              </h2>
              <p className="text-sm sm:text-base text-[#C8C3B8] mt-3 font-light leading-relaxed">
                Embalagens exclusivas pensadas para presentear ou explorar todos os nossos estilos em casa com desconto progressivo.
              </p>
            </div>

            {onOpenCart && (
              <button
                type="button"
                onClick={onOpenCart}
                className="btn-craft-b-dark self-start md:self-auto"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#D88128]" />
                <span>Abrir Sacola</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {packsList.map((pack, idx) => {
              const isAdded = !!addedItems[pack.id];
              const isExpanded = !!expandedHarmonizacao[pack.id];

              return (
                <article
                  key={pack.id}
                  data-reveal
                  style={{ transitionDelay: `${idx * 140}ms` }}
                  className="scroll-reveal bg-[#111315] border border-[#F4F1EA]/15 p-6 sm:p-8 flex flex-col justify-between group hover:border-[#D88128]/60 transition-all duration-500 shadow-[0_28px_70px_rgba(0,0,0,0.6)]"
                >
                  <div>
                    <div className="aspect-[4/3] overflow-hidden bg-[#171A1D] mb-7 relative">
                      <img
                        src={pack.image}
                        alt={pack.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
                        <span className="bg-[#111315]/85 backdrop-blur-xs px-3.5 py-1.5 border border-[#F4F1EA]/15 text-[#F4F1EA]">
                          {pack.volume}
                        </span>
                        <span className="bg-[#D88128] px-3.5 py-1.5 text-[#111315] font-semibold">
                          Economize 10%
                        </span>
                      </div>
                    </div>

                    <p className="font-serif italic text-base text-[#D88128]">
                      {pack.style}
                    </p>
                    <h3 className="font-serif text-2xl sm:text-3xl text-[#F4F1EA] mt-1">
                      {pack.name}
                    </h3>
                    <p className="text-sm text-[#C8C3B8] mt-3 leading-relaxed font-light">
                      {pack.description}
                    </p>

                    {pack.pairing && (
                      <div className="mt-5 pt-3 border-t border-[#F4F1EA]/10">
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggleHarmonizacao(pack.id)}
                          className="w-full flex items-center justify-between py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#C8C3B8] hover:text-[#D88128] transition-colors duration-300"
                        >
                          <span>Sugestões de Harmonização do Kit</span>
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
                            <div className="pt-3 pb-1 text-xs border-t border-[#F4F1EA]/10 mt-2 text-[#F4F1EA]/90 font-light">
                              <span className="uppercase text-[10px] tracking-[0.16em] text-[#D88128] block mb-1">
                                Ideal para acompanhar
                              </span>
                              <p>{pack.pairing.join(' • ')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-7 pt-5 border-t border-[#F4F1EA]/15 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#749B6C] block">
                        ✓ Frete Express Grátis ou Desconto no Kit
                      </span>
                      <div className="flex items-baseline gap-3 mt-0.5">
                        <span className="font-serif text-3xl text-[#F4F1EA]">
                          R$ {pack.price.toFixed(2).replace('.', ',')}
                        </span>
                        {pack.originalPrice && (
                          <span className="text-xs line-through text-[#8E969F]">
                            R$ {pack.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleQuickAdd(pack)}
                      className={`btn-craft-b-dark ${
                        isAdded ? 'btn-added-feedback' : ''
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Kit na Sacola</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Kit</span>
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. CADEIA FRIA 2°C & SERVIÇO FRESCO (NANO BANANA COLD CHAIN + TAPROOM)
          ===================================================================== */}
      <section
        id="processo"
        className="bg-[#EFECE4] text-[#111315] py-24 lg:py-36 border-t border-[#111315]/10"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div
              data-reveal
              className="scroll-reveal lg:col-span-5 aspect-[4/5] overflow-hidden bg-[#111315] shadow-[0_28px_70px_rgba(17,19,21,0.22)] relative group"
            >
              <img
                src="/logos/hero-cadeia-fria.jpg"
                alt="Cadeia Fria 2°C Gralha Brewing — Voo Rasante Pilsen em câmara refrigerada"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111315]/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-6 right-6 text-[#F4F1EA]">
                <p className="font-serif italic text-xl">
                  Câmara Fria a 2°C em Curitiba
                </p>
                <p className="text-xs text-[#C8C3B8] mt-0.5">
                  Preservação integral dos óleos essenciais do lúpulo desde o envase.
                </p>
              </div>
            </div>

            <div
              data-reveal
              style={{ transitionDelay: '130ms' }}
              className="scroll-reveal lg:col-span-7 space-y-6"
            >
              <p className="font-serif italic text-lg text-[#1D435A]">
                03 — Cadeia Fria &amp; Logística Refrigerada
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#111315] leading-[1.08] tracking-[-0.02em]">
                Do tanque a 2°C para toda Curitiba em até 2 horas.
              </h2>
              <p className="text-sm sm:text-base text-[#111315]/75 leading-relaxed max-w-2xl">
                Uma IPA fresca ou uma Pilsen não filtrada perde seu brilho se viajar em caminhões quentes. Nossas entregas em Curitiba saem diretamente da câmara fria a 2°C para chegar trincando no seu copo.
              </p>

              <div className="space-y-4 pt-4 border-t border-[#111315]/15 text-sm max-w-2xl">
                <div className="flex items-baseline justify-between py-2 border-b border-[#111315]/10">
                  <span className="font-serif text-lg text-[#111315]">
                    Frete Express Grátis (Curitiba)
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-[#1D435A] font-medium">
                    Pedidos acima de R$ 120
                  </span>
                </div>
                <div className="flex items-baseline justify-between py-2 border-b border-[#111315]/10">
                  <span className="font-serif text-lg text-[#111315]">
                    Desconto PIX Imediato
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-[#5A7D53] font-medium">
                    5% OFF Automático
                  </span>
                </div>
                <div className="flex items-baseline justify-between py-2">
                  <span className="font-serif text-lg text-[#111315]">
                    Caixas Degustação (4 e 6 Latas)
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-[#D88128] font-medium">
                    Até 10% OFF
                  </span>
                </div>
              </div>

              {/* Contextual Taproom Pour Banner */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-7 aspect-[16/9] overflow-hidden bg-[#111315] shadow-md">
                  <img
                    src="/logos/context-textura-taproom.jpg"
                    alt="Serviço de chope fresco em taças Teku na Gralha Brewing"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:col-span-5 space-y-4">
                  <p className="text-xs text-[#111315]/75 leading-relaxed">
                    Carbonatação natural, colarinho denso e retenção aromática preservados da torneira à lata.
                  </p>
                  <button
                    type="button"
                    onClick={onGoToCatalog}
                    className="btn-craft-b"
                  >
                    <span>Montar Pedido</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. CONTATO & CONEXÃO DIRETA — CURITIBA, PR
          ===================================================================== */}
      <section
        id="contato"
        className="bg-[#111315] text-[#F4F1EA] py-24 lg:py-36 border-t border-[#F4F1EA]/12"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">
            {/* Left Info Column */}
            <div data-reveal className="scroll-reveal lg:col-span-5 space-y-8">
              <div>
                <p className="font-serif italic text-lg text-[#D88128] mb-2">
                  04 — Fale com a Cervejaria
                </p>
                <h2 className="font-serif text-3xl sm:text-5xl text-[#F4F1EA] leading-[1.1] tracking-[-0.02em]">
                  Contato, Eventos &amp; Barris Sob Encomenda.
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#C8C3B8] font-light leading-relaxed">
                Quer levar os rótulos da Gralha Brewing Co. para o seu bar, restaurante ou evento particular em Curitiba e região? Fale diretamente com a nossa equipe.
              </p>

              <div className="space-y-6 pt-4 border-t border-[#F4F1EA]/12 text-sm">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#D88128] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-lg text-[#F4F1EA]">
                      Curitiba — Paraná
                    </p>
                    <p className="text-xs text-[#8E969F] mt-0.5">
                      Produção Local &amp; Retirada de Pedidos Mediante Agendamento
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-[#D88128] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-lg text-[#F4F1EA]">
                      Horário de Expedição Refrigerada
                    </p>
                    <p className="text-xs text-[#8E969F] mt-0.5">
                      Terça a Sábado: 10h às 21h • Domingo: 10h às 16h
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-[#D88128] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif text-lg text-[#F4F1EA]">
                      Atendimento Direto &amp; Sommelier
                    </p>
                    <p className="text-xs text-[#8E969F] mt-0.5">
                      (41) 99840-2024 • contato@gralhabrewing.com.br
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Architectural Contact Form */}
            <div
              data-reveal
              style={{ transitionDelay: '120ms' }}
              className="scroll-reveal lg:col-span-7 bg-[#132C3C]/30 border border-[#F4F1EA]/15 p-8 sm:p-12 shadow-[0_28px_70px_rgba(0,0,0,0.55)]"
            >
              {contactSent ? (
                <div className="py-12 text-center space-y-5">
                  <CheckCircle2 className="w-12 h-12 text-[#749B6C] mx-auto stroke-[1.5]" />
                  {contactProtocol && (
                    <span className="inline-block font-mono text-xs uppercase tracking-[0.2em] px-3 py-1 border border-[#D88128]/50 bg-[#D88128]/15 text-[#D88128]">
                      Protocolo Criptografado #{contactProtocol}
                    </span>
                  )}
                  <h3 className="font-serif text-3xl text-[#F4F1EA]">
                    Mensagem Recebida pela Cervejaria!
                  </h3>
                  <p className="text-sm text-[#C8C3B8] max-w-md mx-auto leading-relaxed">
                    Agradecemos o contato. Seus dados foram protegidos com criptografia AES-256-GCM e nossa equipe comercial retornará pelo seu WhatsApp em breve.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setContactSent(false)}
                      className="btn-craft-b-dark"
                    >
                      <span>Enviar Nova Mensagem</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  {contactError && (
                    <div className="p-3.5 border border-red-500/40 bg-red-950/30 text-xs text-red-200">
                      {contactError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.2em] text-[#C8C3B8] mb-2">
                        Seu Nome *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={100}
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, name: e.target.value })
                        }
                        placeholder="Nome completo"
                        className="w-full bg-transparent border-b border-[#F4F1EA]/25 py-3 text-sm text-[#F4F1EA] placeholder-[#8E969F]/60 focus:outline-none focus:border-[#D88128] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.2em] text-[#C8C3B8] mb-2">
                        WhatsApp / Telefone *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={20}
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, phone: e.target.value })
                        }
                        placeholder="(41) 99999-9999"
                        className="w-full bg-transparent border-b border-[#F4F1EA]/25 py-3 text-sm text-[#F4F1EA] placeholder-[#8E969F]/60 focus:outline-none focus:border-[#D88128] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-[#C8C3B8] mb-2">
                      Assunto
                    </label>
                    <select
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, subject: e.target.value })
                      }
                      className="w-full bg-[#111315] border border-[#F4F1EA]/20 px-4 py-3 text-sm text-[#F4F1EA] focus:outline-none focus:border-[#D88128] transition-colors"
                    >
                      <option value="Visitação & Taproom Curitiba">
                        Visitação &amp; Degustação em Curitiba
                      </option>
                      <option value="Barris & Chope para Eventos">
                        Reserva de Barris / Chope para Eventos
                      </option>
                      <option value="Parceria Comercial (Bares & Empórios)">
                        Parceria Comercial (Bares, Restaurantes &amp; Empórios)
                      </option>
                      <option value="Dúvidas sobre Pedidos">
                        Dúvidas sobre Pedidos &amp; Entregas
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.2em] text-[#C8C3B8] mb-2">
                      Mensagem *
                    </label>
                    <textarea
                      rows={4}
                      required
                      maxLength={600}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      placeholder="Conte como podemos ajudar..."
                      className="w-full bg-transparent border-b border-[#F4F1EA]/25 py-3 text-sm text-[#F4F1EA] placeholder-[#8E969F]/60 focus:outline-none focus:border-[#D88128] transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <span className="text-xs text-[#8E969F]">
                      Atendimento direto de Curitiba — PR (LGPD AES-256-GCM).
                    </span>
                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className="btn-craft-b-dark"
                    >
                      <span>
                        {contactSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                      </span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
