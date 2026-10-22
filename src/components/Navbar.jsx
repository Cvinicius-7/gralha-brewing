import React, { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';

export default function Navbar({ activePage, onNavigate, cartCount = 0, onOpenCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'A Cervejaria', href: '#cervejaria', page: 'brand' },
    { label: 'Estilos & Filosofia', href: '#filosofia', page: 'brand' },
    { label: 'Processo', href: '#processo', page: 'brand' },
    { label: 'Nossas Cervejas', href: '#catalogo', page: 'catalog' },
  ];

  const handleLinkClick = (e, link) => {
    if (link.page !== activePage) {
      e.preventDefault();
      onNavigate(link.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#121518]/90 backdrop-blur-md border-b border-white/[0.07]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Left: Official Transparent Brand Logo */}
        <a
          href="#inicio"
          onClick={(e) => {
            if (activePage !== 'brand') {
              e.preventDefault();
              onNavigate('brand');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-4 focus:outline-none group"
        >
          <img
            src="/logos/selo-completo-transparente.png"
            alt="Gralha Brewing Co."
            className="w-14 h-14 object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-display font-bold text-base sm:text-lg tracking-[0.14em] uppercase text-[#F4F1EA]">
              Gralha Brewing
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#D88128]">
              Curitiba • Est. 2024
            </span>
          </div>
        </a>

        {/* Right: Clean Editorial Navigation */}
        <nav className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => {
            const isCatalogBtn = link.page === 'catalog';

            if (isCatalogBtn) {
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`px-5 py-2.5 text-xs font-mono uppercase tracking-[0.18em] transition-all border ${
                    activePage === 'catalog'
                      ? 'bg-[#D88128] text-[#121518] border-[#D88128] font-medium'
                      : 'border-[#F4F1EA]/25 text-[#F4F1EA] hover:border-[#D88128] hover:text-[#D88128]'
                  }`}
                >
                  {link.label}
                </button>
              );
            }

            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className="text-xs font-mono uppercase tracking-[0.16em] text-[#F4F1EA]/75 hover:text-[#F4F1EA] transition-colors"
              >
                {link.label}
              </a>
            );
          })}

          {/* Sacola appears ONLY on Page 2 (Catalog), keeping Page 1 100% pure brand */}
          {activePage === 'catalog' && (
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2.5 px-4 py-2.5 border border-[#F4F1EA]/20 hover:border-[#D88128] text-xs font-mono uppercase tracking-[0.16em] text-[#F4F1EA] transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#D88128]" />
              <span>Sacola</span>
              <span className="text-[#D88128] font-medium">({cartCount})</span>
            </button>
          )}
        </nav>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3 md:hidden">
          {activePage === 'catalog' && (
            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-2 px-3 py-2 border border-[#F4F1EA]/20 text-xs font-mono uppercase text-[#F4F1EA]"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#D88128]" />
              <span className="text-[#D88128]">({cartCount})</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#F4F1EA] p-2"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121518] border-t border-white/[0.08] px-6 py-8 space-y-5">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link)}
              className="block font-mono text-xs uppercase tracking-[0.18em] text-[#F4F1EA]/85 hover:text-[#D88128]"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
