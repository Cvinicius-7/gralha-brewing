import React, { useState } from 'react';
import {
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function Footer({ onResetAgeGate, onNavigate }) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleAnchorNav = (page, selector) => {
    onNavigate(page);
    setTimeout(() => {
      if (selector) {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 60);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
    }, 300);
  };

  return (
    <footer className="bg-[#111315] text-[#C8C3B8] border-t border-[#F4F1EA]/12">
      {/* Top Architectural Newsletter & Private Batch Banner */}
      <div className="bg-[#132C3C]/35 border-b border-[#F4F1EA]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-2">
              <p className="font-serif italic text-base text-[#D88128]">
                Clube do Tanque • Envase sob Demanda
              </p>
              <h3 className="font-serif text-2xl sm:text-4xl text-[#F4F1EA] leading-tight">
                Receba avisos de lotes frescos e brassagens sazonais em Curitiba.
              </h3>
            </div>

            <div className="lg:col-span-6">
              {newsletterSubscribed ? (
                <div className="p-5 bg-[#111315]/90 border border-[#749B6C]/50 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#749B6C] shrink-0" />
                    <div>
                      <p className="font-serif text-lg text-[#F4F1EA]">
                        Inscrição confirmada no Clube do Tanque!
                      </p>
                      <p className="text-xs text-[#C8C3B8]">
                        Você receberá em primeira mão o calendário das próximas brassagens.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNewsletterSubscribed(false)}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#D88128] hover:underline shrink-0"
                  >
                    Novo e-mail
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  <div className="relative flex-1">
                    <label htmlFor="footer-newsletter" className="sr-only">
                      Seu melhor e-mail
                    </label>
                    <input
                      id="footer-newsletter"
                      type="email"
                      required
                      maxLength={120}
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Seu melhor e-mail para alertas de lote..."
                      className="w-full bg-[#111315] border border-[#F4F1EA]/25 px-5 py-3.5 text-sm text-[#F4F1EA] placeholder-[#8E969F]/70 focus:outline-none focus:border-[#D88128] transition-colors duration-300"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-craft-b-dark !py-3.5 !px-7 shrink-0"
                  >
                    <span>Assinar Lista</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
              <p className="text-[11px] text-[#8E969F] mt-2.5">
                Sem spam. Apenas alertas de envase fresco (2°C) e pré-venda de barris em Curitiba.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer Structure */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-10 pb-16 border-b border-[#F4F1EA]/10">
          {/* Coluna 1: Identidade da Marca, Logo Oficial & Redes Sociais (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <button
              type="button"
              onClick={() => handleAnchorNav('brand', '#inicio')}
              className="flex items-center gap-4 group text-left focus:outline-none"
            >
              <img
                src="/logos/selo-completo-transparente.png"
                alt="Selo Oficial Gralha Brewing Co."
                className="w-14 h-14 object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div>
                <span className="font-display font-bold text-base uppercase tracking-[0.22em] text-[#F4F1EA] block">
                  Gralha Brewing Co.
                </span>
                <span className="font-serif italic text-sm text-[#D88128] block">
                  Curitiba, Paraná • Est. 2024
                </span>
              </div>
            </button>

            <p className="text-xs sm:text-sm text-[#C8C3B8]/85 leading-relaxed font-light max-w-sm">
              Cervejaria artesanal independente nascida em Curitiba. Dedicada às Pilsens não filtradas de maturação lenta e às IPAs frescas sob cadeia fria ininterrupta a 2°C.
            </p>

            {/* Ícones Minimalistas para Redes Sociais */}
            <div className="pt-2">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#8E969F] block mb-3">
                Acompanhe as Brassagens
              </span>
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href="#contato"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorNav('brand', '#contato');
                  }}
                  aria-label="Instagram Gralha Brewing"
                  className="w-10 h-10 border border-[#F4F1EA]/20 flex items-center justify-center text-[#F4F1EA] hover:border-[#D88128] hover:bg-[#D88128] hover:text-[#111315] transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                {/* WhatsApp Direto */}
                <a
                  href="#contato"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorNav('brand', '#contato');
                  }}
                  aria-label="WhatsApp Gralha Brewing"
                  className="w-10 h-10 border border-[#F4F1EA]/20 flex items-center justify-center text-[#F4F1EA] hover:border-[#D88128] hover:bg-[#D88128] hover:text-[#111315] transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                  </svg>
                </a>

                {/* Untappd / Confraria */}
                <a
                  href="#cervejas"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAnchorNav('brand', '#cervejas');
                  }}
                  aria-label="Catálogo Untappd Gralha Brewing"
                  className="w-10 h-10 border border-[#F4F1EA]/20 flex items-center justify-center text-[#F4F1EA] hover:border-[#D88128] hover:bg-[#D88128] hover:text-[#111315] transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 11h1a3 3 0 0 1 0 6h-1" />
                    <path d="M9 12v6" />
                    <path d="M13 12v6" />
                    <path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 3 11 3s2 .5 3 .5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z" />
                    <path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
                  </svg>
                </a>

                {/* E-mail Comercial */}
                <a
                  href="mailto:contato@gralhabrewing.com.br"
                  aria-label="E-mail Gralha Brewing"
                  className="w-10 h-10 border border-[#F4F1EA]/20 flex items-center justify-center text-[#F4F1EA] hover:border-[#D88128] hover:bg-[#D88128] hover:text-[#111315] transition-all duration-300"
                >
                  <Mail className="w-4 h-4 stroke-[1.6]" />
                </a>
              </div>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos de Navegação (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#F4F1EA] font-medium">
              Navegação
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('brand', '#inicio')}
                  className="text-[#C8C3B8] hover:text-[#D88128] transition-colors duration-300"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('brand', '#sobre')}
                  className="text-[#C8C3B8] hover:text-[#D88128] transition-colors duration-300"
                >
                  Sobre Nós &amp; Origem
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('brand', '#cervejas')}
                  className="text-[#C8C3B8] hover:text-[#D88128] transition-colors duration-300"
                >
                  Linha de Cervejas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('brand', '#packs')}
                  className="text-[#C8C3B8] hover:text-[#D88128] transition-colors duration-300"
                >
                  Packs &amp; Caixas Fechadas
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('brand', '#processo')}
                  className="text-[#C8C3B8] hover:text-[#D88128] transition-colors duration-300"
                >
                  Cadeia Fria 2°C
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('catalog', null)}
                  className="text-[#D88128] font-serif italic text-sm hover:text-[#F4F1EA] transition-colors duration-300"
                >
                  Loja Online Completa →
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Rótulos de Linha & Estilos (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#F4F1EA] font-medium">
              Rótulos de Linha
            </h4>
            <ul className="space-y-3 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('catalog', null)}
                  className="group flex items-baseline justify-between w-full text-left hover:text-[#F4F1EA] transition-colors"
                >
                  <span className="group-hover:text-[#D88128] transition-colors">
                    Voo Rasante Pilsen
                  </span>
                  <span className="text-[10px] text-[#8E969F]">4.8% • 28 IBU</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('catalog', null)}
                  className="group flex items-baseline justify-between w-full text-left hover:text-[#F4F1EA] transition-colors"
                >
                  <span className="group-hover:text-[#D88128] transition-colors">
                    Gralha Azul West Coast IPA
                  </span>
                  <span className="text-[10px] text-[#8E969F]">6.6% • 62 IBU</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('catalog', null)}
                  className="group flex items-baseline justify-between w-full text-left hover:text-[#F4F1EA] transition-colors"
                >
                  <span className="group-hover:text-[#D88128] transition-colors">
                    Copa das Araucárias NEIPA
                  </span>
                  <span className="text-[10px] text-[#8E969F]">6.8% • 42 IBU</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('catalog', null)}
                  className="group flex items-baseline justify-between w-full text-left hover:text-[#F4F1EA] transition-colors"
                >
                  <span className="group-hover:text-[#D88128] transition-colors">
                    Neblina da Serra Hop Lager
                  </span>
                  <span className="text-[10px] text-[#8E969F]">5.1% • 24 IBU</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('catalog', null)}
                  className="group flex items-baseline justify-between w-full text-left hover:text-[#F4F1EA] transition-colors"
                >
                  <span className="group-hover:text-[#D88128] transition-colors">
                    Brisa do Parque Session IPA
                  </span>
                  <span className="text-[10px] text-[#8E969F]">4.5% • 35 IBU</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorNav('catalog', null)}
                  className="group flex items-baseline justify-between w-full text-left hover:text-[#F4F1EA] transition-colors"
                >
                  <span className="group-hover:text-[#D88128] transition-colors">
                    Noite Fria Dry Stout
                  </span>
                  <span className="text-[10px] text-[#8E969F]">4.6% • 32 IBU</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Contato, Expedição Refrigerada & Segurança (3 cols) */}
          <div className="lg:col-span-3 space-y-5">
            <h4 className="text-xs uppercase tracking-[0.22em] text-[#F4F1EA] font-medium">
              Expedição &amp; Contato
            </h4>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D88128] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F4F1EA] font-medium block">
                    Curitiba — Paraná, Brasil
                  </span>
                  <span className="text-[#8E969F] text-[11px]">
                    Câmara Fria Local (2°C) • Delivery Express em até 2h
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D88128] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F4F1EA] font-medium block">
                    Horário de Atendimento
                  </span>
                  <span className="text-[#8E969F] text-[11px]">
                    Ter a Sáb: 10h às 21h • Dom: 10h às 16h
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#D88128] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#F4F1EA] font-medium block">
                    (41) 99840-2024
                  </span>
                  <span className="text-[#8E969F] text-[11px]">
                    contato@gralhabrewing.com.br
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F4F1EA]/10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#749B6C]">
                <ShieldCheck className="w-3.5 h-3.5" />
                Checkout Seguro PIX &amp; Cartão
              </span>
              <button
                type="button"
                onClick={onResetAgeGate}
                className="text-[10px] uppercase tracking-[0.16em] text-[#D88128] hover:underline"
              >
                Verificação +18
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Responsible Drinking Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#8E969F]">
          <p>
            © {new Date().getFullYear()} Gralha Brewing Co. Todos os direitos reservados • Curitiba — PR.
          </p>
          <p className="uppercase tracking-[0.18em] text-[10px] text-[#C8C3B8]/80">
            Beba com sabedoria • Venda proibida para menores de 18 anos
          </p>
        </div>
      </div>
    </footer>
  );
}
