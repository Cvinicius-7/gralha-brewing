import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function PhaseOneShowcase({ onGoToCatalog }) {
  return (
    <>
      {/* SECTION 1: OUR STORY (WARM CREAM EDITORIAL SECTION WITH UNSPLASH PHOTOGRAPHY) */}
      <section id="cervejaria" className="bg-[#F4F1EA] text-[#121518] py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left Column: Editorial Photography Composition */}
            <div className="lg:col-span-6 relative">
              <div className="aspect-[4/5] overflow-hidden bg-[#1D435A]/10">
                <img
                  src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=85"
                  alt="Processo artesanal de brassagem e malte"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-[#121518]/55">
                <span>Curitiba, Paraná</span>
                <span>Brassagem Autoral Desde 2024</span>
              </div>
            </div>

            {/* Right Column: Brand Narrative */}
            <div className="lg:col-span-6 space-y-8">
              <div className="inline-flex items-center gap-3">
                <span className="w-8 h-[1px] bg-[#1D435A]" />
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#1D435A]">
                  Nossa Origem • 2024
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-[1.12] text-[#121518]">
                Nascida entre família, panelas e o clima frio de Curitiba.
              </h2>

              <div className="space-y-5 text-base sm:text-lg text-[#121518]/75 font-light leading-relaxed">
                <p>
                  A Gralha Brewing Co. nasceu em 2024 como nascem as melhores cervejarias artesanais: na garagem de casa, testando rampas de mosturação, ajustando perfis de água e compartilhando cada novo lote com os amigos mais próximos.
                </p>
                <p>
                  Batizada em homenagem à Gralha-Azul — ave símbolo do Paraná e guardiã das matas de araucária — nossa marca carrega o orgulho local aliado ao rigor técnico das escolas cervejeiras clássicas e contemporâneas.
                </p>
              </div>

              <div className="pt-8 border-t border-[#121515]/15 grid grid-cols-2 gap-8">
                <div>
                  <span className="font-serif text-3xl sm:text-4xl text-[#1D435A] block">
                    100%
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#121518]/65 mt-1 block">
                    Puro Malte &amp; Lúpulo em Flor/Pellet
                  </span>
                </div>
                <div>
                  <span className="font-serif text-3xl sm:text-4xl text-[#D88128] block">
                    Cadeia Fria
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#121518]/65 mt-1 block">
                    Frescor preservado do tanque ao copo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: BEER SCHOOLS & PHILOSOPHY (EDITORIAL PHOTOGRAPHY + HARMONIOUS LAYOUT) */}
      <section id="filosofia" className="bg-[#121518] text-[#F4F1EA] py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-20">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-[#D88128]" />
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#D88128]">
                Identidade Líquida
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight leading-[1.12]">
              Duas grandes paixões na torneira: a limpidez das Pilsens e a ousadia das IPAs.
            </h2>
          </div>

          {/* 3 Harmonious Editorial Columns with Unsplash Photography */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
            {/* Style 1: Pilsens */}
            <div className="group space-y-6">
              <div className="aspect-[4/5] overflow-hidden bg-[#1A2026]">
                <img
                  src="https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=80"
                  alt="Copo de Pilsen dourada e brilhante"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="space-y-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#D88128]">
                  01 / Escola Clássica
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#F4F1EA]">
                  Pilsens &amp; Lagers
                </h3>
                <p className="text-sm text-[#F4F1EA]/70 font-light leading-relaxed">
                  Fermentação lenta em baixa temperatura, maltes nobres e lúpulos florais. Cervejas douradas, crocantes e feitas para beber em grandes goles.
                </p>
              </div>
            </div>

            {/* Style 2: IPAs */}
            <div className="group space-y-6">
              <div className="aspect-[4/5] overflow-hidden bg-[#1A2026]">
                <img
                  src="https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=900&q=80"
                  alt="Cerveja IPA servida com colarinho denso"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="space-y-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0095D9]">
                  02 / Escola Americana
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#F4F1EA]">
                  IPAs &amp; Lupuladas
                </h3>
                <p className="text-sm text-[#F4F1EA]/70 font-light leading-relaxed">
                  Das West Coast resinosas às Hazy IPAs aveludadas. Cargas generosas de Dry Hopping trazendo notas intensas de frutas tropicais, cítricos e pinho.
                </p>
              </div>
            </div>

            {/* Style 3: Sazonais */}
            <div className="group space-y-6">
              <div className="aspect-[4/5] overflow-hidden bg-[#1A2026]">
                <img
                  src="https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&w=900&q=80"
                  alt="Barril e degustação de cervejas especiais"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="space-y-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#749B6C]">
                  03 / Receitas de Estação
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-[#F4F1EA]">
                  Estilos Sazonais
                </h3>
                <p className="text-sm text-[#F4F1EA]/70 font-light leading-relaxed">
                  A liberdade criativa da nossa cervejaria. Stouts torradas para o inverno curitibano, ales equilibradas e lotes experimentais únicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: BREWING CRAFT & ATMOSPHERE (DEEP PRUSSIAN BLUE SECTION) */}
      <section id="processo" className="bg-[#162936] text-[#F4F1EA] py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="font-mono text-xs uppercase tracking-[0.22em] text-[#D88128] block">
                Nosso Processo
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.12]">
                Pequenos lotes. Controle absoluto de ponta a ponta.
              </h2>
              <p className="text-base text-[#F4F1EA]/75 font-light leading-relaxed">
                Não aceleramos fermentações nem utilizamos conservantes. Cada brassagem da Gralha Brewing passa por maturação a frio prolongada para garantir estabilidade aromática e espuma persistente.
              </p>

              <div className="pt-6 space-y-6 border-t border-white/10">
                <div className="flex gap-6">
                  <span className="font-mono text-xs text-[#D88128] pt-1">01</span>
                  <div>
                    <h4 className="font-serif text-xl text-[#F4F1EA]">Seleção de Insumos Frescos</h4>
                    <p className="text-sm text-[#F4F1EA]/65 font-light mt-1">
                      Maltes importados e lúpulos armazenados a vácuo sob refrigeração constante.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="font-mono text-xs text-[#D88128] pt-1">02</span>
                  <div>
                    <h4 className="font-serif text-xl text-[#F4F1EA]">Água Perfilada em Curitiba</h4>
                    <p className="text-sm text-[#F4F1EA]/65 font-light mt-1">
                      Ajuste mineral específico para destacar a crocância nas Pilsens ou a maciez nas IPAs.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <span className="font-mono text-xs text-[#D88128] pt-1">03</span>
                  <div>
                    <h4 className="font-serif text-xl text-[#F4F1EA]">Envase &amp; Frescor Local</h4>
                    <p className="text-sm text-[#F4F1EA]/65 font-light mt-1">
                      Da nossa produção direto para os apreciadores da região, sem meses de prateleira.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&w=800&q=80"
                    alt="Cones de lúpulo e ingredientes cervejeiros"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden mt-12">
                  <img
                    src="https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=800&q=80"
                    alt="Brinde com cerveja artesanal"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: INVITATION TO EXPLORE THE BEERS (TRANSITION TO PAGE 2) */}
      <section className="bg-[#121518] text-[#F4F1EA] py-24 border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <img
            src="/logos/simbolo-transparente.png"
            alt="Símbolo Gralha"
            className="w-24 h-24 mx-auto object-contain"
          />
          <h2 className="font-serif text-3xl sm:text-5xl font-normal">
            Pronto para conhecer nossas receitas?
          </h2>
          <p className="text-base text-[#F4F1EA]/70 font-light max-w-xl mx-auto leading-relaxed">
            Explore nossa linha completa de Pilsens, IPAs e lotes sazonais em nossa página dedicada aos rótulos da Gralha Brewing.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onGoToCatalog}
              className="inline-flex items-center gap-3 bg-[#F4F1EA] text-[#121518] px-9 py-4 font-mono text-xs uppercase tracking-[0.2em] hover:bg-[#D88128] transition-colors"
            >
              <span>Acessar Página de Cervejas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
