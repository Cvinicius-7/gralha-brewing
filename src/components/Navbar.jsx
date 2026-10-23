import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';

export default function Navbar({
  activePage,
  onNavigate,
  cartCount = 0,
  onOpenCart,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bagPulse, setBagPulse] = useState(false);
  const prevCountRef = useRef(cartCount);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Micro-interação suave no ícone da sacola ao adicionar item
  useEffect(() => {
    if (cartCount > prevCountRef.current) {
      setBagPulse(true);
      const timer = setTimeout(() => setBagPulse(false), 550);
      prevCountRef.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartCount;
  }, [cartCount]);

  // Links concisos de 1 palavra inspirados em SEACLUB (Banner.jpg) e KAELON (transferir 5.jpg)
  const navLinks = [
    { label: 'História', href: '#sobre', page: 'brand' },
    { label: 'Cervejas', href: '#cervejas', page: 'brand' },
    { label: 'Packs', href: '#packs', page: 'brand' },
    { label: 'Processo', href: '#processo', page: 'brand' },
    { label: 'Contato', href: '#contato', page: 'brand' },
  ];

  const handleLinkClick = (e, link) => {
    if (link.page !== activePage) {
      e.preventDefault();
      onNavigate(link.page);
      setTimeout(() => {
        const el = document.querySelector(link.href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 60);
    }
    setMobileMenuOpen(false);
  };

  const handleOpenCatalog = () => {
    onNavigate('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`${
        activePage === 'brand' ? 'fixed top-0 inset-x-0' : 'sticky top-0'
      } z-40 bg-[#111315]/95 backdrop-blur-md border-b border-[#F4F1EA]/10 transition-all duration-500 ${
        scrolled ? 'py-3 shadow-[0_14px_34px_rgba(0,0,0,0.55)]' : 'py-4'
      }`}
    >
      {/* Container Full-Bleed com Grid de 12 Colunas para Distanciamento Amplo entre Logo, Menu Central e Ações */}
      <div className="w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 xl:px-20 grid grid-cols-12 items-center">
        {/* Zona Esquerda (3 cols): Logo Oficial Isolada na Extremidade Esquerda */}
        <div className="col-span-6 lg:col-span-3 flex items-center justify-start">
          <a
            href="#inicio"
            onClick={(e) => {
              if (activePage !== 'brand') {
                e.preventDefault();
                onNavigate('brand');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-3 group focus:outline-none"
          >
            <img
              src="/logos/selo-completo-transparente.png"
              alt="Gralha Brewing Co."
              className="w-10 h-10 object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <span className="font-display font-bold text-xs sm:text-sm tracking-[0.28em] uppercase text-[#F4F1EA]">
              Gralha
            </span>
          </a>
        </div>

        {/* Zona Central (6 cols): Menu Arquitetônico Verdadeiramente Centralizado e Distante da Logo */}
        <nav className="hidden lg:flex lg:col-span-6 items-center justify-center gap-9 xl:gap-12">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link)}
              className="relative py-1 text-[11px] uppercase tracking-[0.24em] text-[#F4F1EA]/75 hover:text-[#F4F1EA] transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-0 after:h-[1px] after:bg-[#D88128] hover:after:w-full after:transition-all after:duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zona Direita (3 cols): Link Editorial "Book a table" (SEACLUB) + Ícone Minimalista de Sacola (KAELON) */}
        <div className="hidden md:flex col-span-6 lg:col-span-3 items-center justify-end gap-8">
          <button
            type="button"
            onClick={handleOpenCatalog}
            className={`group relative pb-1.5 text-xs tracking-[0.14em] transition-colors duration-300 ${
              activePage === 'catalog'
                ? 'text-[#D88128]'
                : 'text-[#D88128] hover:text-[#F4F1EA]'
            }`}
          >
            <span className="font-serif italic text-sm tracking-wide">
              Nossa Loja
            </span>
            <span className="absolute right-0 bottom-0 w-10 h-[1px] bg-[#D88128] group-hover:w-full transition-all duration-300" />
          </button>

          {/* Ícone Minimalista de Sacola com Badge Circular (Estilo KAELON) */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Abrir sacola de compras"
            className={`relative p-2 text-[#F4F1EA]/85 hover:text-[#D88128] transition-all duration-300 ${
              bagPulse ? 'animate-bag-lift text-[#D88128]' : ''
            }`}
          >
            <ShoppingBag className="w-[19px] h-[19px] stroke-[1.6]" />
            <span
              className={`absolute -top-0.5 -right-1 min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                bagPulse
                  ? 'bg-[#D88128] text-[#111315] scale-125 shadow-[0_0_14px_rgba(216,129,40,0.75)]'
                  : cartCount > 0
                  ? 'bg-[#D88128] text-[#111315]'
                  : 'bg-[#F4F1EA]/90 text-[#111315]'
              }`}
            >
              {cartCount}
            </span>
          </button>
        </div>

        {/* Controles Mobile */}
        <div className="col-span-6 flex items-center justify-end gap-4 md:hidden">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Abrir sacola"
            className={`relative p-2 text-[#F4F1EA] ${
              bagPulse ? 'animate-bag-lift text-[#D88128]' : ''
            }`}
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
            <span className="absolute -top-0.5 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-[#D88128] text-[#111315] text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#F4F1EA] p-1.5"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown com Transição de Altura Fluida */}
      <div
        className={`lg:hidden accordion-shell ${
          mobileMenuOpen ? 'is-open' : ''
        }`}
      >
        <div className="accordion-inner">
          <div className="bg-[#111315] border-t border-[#F4F1EA]/10 px-6 sm:px-10 py-7 space-y-4 mt-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="block text-xs uppercase tracking-[0.22em] text-[#F4F1EA]/85 hover:text-[#D88128] transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              onClick={handleOpenCatalog}
              className="pt-2 text-sm font-serif italic text-[#D88128] block"
            >
              Nossa Loja Completa →
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
