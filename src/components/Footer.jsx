import React from 'react';

export default function Footer({ onResetAgeGate, onNavigate }) {
  return (
    <footer className="bg-[#0D0F12] py-16 text-xs text-[#8E969F] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.08]">
          <div className="md:col-span-6 space-y-3">
            <span className="font-display font-bold text-base uppercase tracking-[0.18em] text-[#F4F1EA] block">
              Gralha Brewing Co.
            </span>
            <p className="text-xs text-[#8E969F] max-w-sm leading-relaxed">
              Cervejaria artesanal independente fundada em Curitiba em 2024. Dedicada às Pilsens clássicas, IPAs frescas e receitas autorais.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 font-mono text-[11px] uppercase tracking-[0.16em]">
            <span className="text-[#F4F1EA] block mb-3">Navegação</span>
            <button
              type="button"
              onClick={() => {
                onNavigate('brand');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="block hover:text-[#F4F1EA] text-left"
            >
              A Marca &amp; História
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate('catalog');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="block hover:text-[#F4F1EA] text-left"
            >
              Nossas Cervejas
            </button>
          </div>

          <div className="md:col-span-3 space-y-2 font-mono text-[11px]">
            <span className="uppercase tracking-[0.16em] text-[#F4F1EA] block mb-3">
              Curitiba — PR
            </span>
            <p>Produção local independente desde 2024.</p>
            <button
              type="button"
              onClick={onResetAgeGate}
              className="pt-2 text-[10px] uppercase tracking-[0.16em] text-[#D88128] hover:underline block"
            >
              Reexibir verificação +18
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em]">
          <span>© {new Date().getFullYear()} Gralha Brewing Co. Curitiba, Brasil.</span>
          <span>Beba com moderação · Proibido para menores de 18 anos</span>
        </div>
      </div>
    </footer>
  );
}
