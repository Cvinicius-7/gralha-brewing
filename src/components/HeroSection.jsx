import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';

export default function HeroSection({ onGoToCatalog }) {
  return (
    <section
      id="inicio"
      className="relative min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden bg-[#121518]"
    >
      {/* Background Curated Unsplash Photography with Harmonious Gradient Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=2000&q=85"
          alt="Cerveja artesanal sendo servida fresca"
          className="w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121518] via-[#121518]/85 to-[#121518]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121518] via-transparent to-[#121518]/40" />
      </div>

      {/* Main Content Positioned Higher in the Viewport */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-10 sm:pt-14 lg:pt-16 pb-12 flex-grow flex flex-col justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-4 mb-5">
            <span className="w-10 h-[1px] bg-[#D88128]" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#D88128]">
              Cervejaria Independente • Curitiba, PR
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-[64px] font-normal tracking-tight leading-[1.06] text-[#F4F1EA]">
            Da cultura cervejeira de Curitiba para o seu copo.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#F4F1EA]/75 font-light max-w-2xl leading-relaxed">
            Fundada em 2024 a partir de brassagens caseiras em família. Na Gralha Brewing, respeitamos o tempo de maturação, a pureza das Pilsens clássicas e a intensidade aromática das IPAs frescas.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="#cervejaria"
              className="inline-flex items-center gap-3 bg-[#D88128] text-[#121518] px-8 py-4 font-mono text-xs font-medium uppercase tracking-[0.2em] hover:bg-[#F4F1EA] transition-colors"
            >
              <span>Nossa História</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={onGoToCatalog}
              className="inline-flex items-center gap-3 px-8 py-4 border border-[#F4F1EA]/25 text-[#F4F1EA] font-mono text-xs uppercase tracking-[0.2em] hover:border-[#F4F1EA] transition-colors"
            >
              <span>Conhecer os Estilos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Editorial Strip Fully Visible Above the Fold */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D88128] block">
              Origem
            </span>
            <p className="font-serif text-lg text-[#F4F1EA] mt-1">
              Curitiba — Paraná, 2024
            </p>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D88128] block">
              Especialidade
            </span>
            <p className="font-serif text-lg text-[#F4F1EA] mt-1">
              Pilsens Não Filtradas &amp; IPAs
            </p>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#D88128] block">
              Filosofia
            </span>
            <p className="font-serif text-lg text-[#F4F1EA] mt-1">
              Pequenos Lotes &amp; Lúpulo Fresco
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
