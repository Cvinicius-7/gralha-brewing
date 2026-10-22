export const BRAND_STORY = {
  founded: 2024,
  city: 'Curitiba — PR',
  tagline: 'Alma livre da serra paranaense. Cerveja artesanal feita sem atalhos.',
  manifesto:
    'Nascida em 2024 nas panelas de Curitiba, a Gralha Brewing Co. surgiu do desejo de transformar a paixão caseira entre família e amigos em receitas de alta precisão sensorial. Inspirados pela Gralha-Azul — símbolo das matas de araucária do Paraná — focamos no frescor extremo das Pilsens não filtradas e na explosão aromática das IPAs modernas, mantendo a identidade independente em cada lote.',
  pillars: [
    {
      id: 'lote-fresco',
      title: 'Frescor de Brassagem Local',
      subtitle: 'Direto do tanque para Curitiba',
      description:
        'Nossas Pilsens e IPAs não viajam semanas em caminhões quentes. Cadeia fria rigorosa e envase sob demanda para preservar cada óleo essencial do lúpulo.',
      metric: '100% Cold Chain',
    },
    {
      id: 'lupulos-nobres',
      title: 'Foco em Pilsens & IPAs',
      subtitle: 'Drinkability & Explosão Aromática',
      description:
        'Dos lúpulos nobres tchecos e alemães às variedades americanas e oceânicas (Citra, Mosaic, Galaxy) em duplo Dry Hopping.',
      metric: 'Double Dry Hop',
    },
    {
      id: 'dna-curitibano',
      title: 'DNA Autoral Curitibano',
      subtitle: 'Da panela caseira em 2024 ao tap',
      description:
        'Receitas criadas com água tratada perfil a perfil para o clima curitibano: cervejas limpas, equilibradas e com personalidade marcante.',
      metric: 'Est. 2024 • CWB',
    },
  ],
};

export const BEER_CATEGORIES = [
  { id: 'all', label: 'Todos os Rótulos' },
  { id: 'pilsen', label: 'Pilsens & Lagers' },
  { id: 'ipa', label: 'IPAs & Lupuladas' },
  { id: 'especiais', label: 'Estilos Sazonais' },
];

export const BEERS_CATALOG = [
  {
    id: 'gralha-bohemian-pilsen',
    name: 'Voo Rasante Pilsen',
    style: 'Czech-Style German Pilsner',
    category: 'pilsen',
    abv: '4.8%',
    ibu: 28,
    ebc: 7,
    volume: 'Lata 473ml',
    price: 18.9,
    batch: 'Lote #014',
    isFlagship: true,
    image: '/logos/voo-rasante.jpg',
    shortDesc:
      'Dourada brilhante, espuma densa e persistente. Notas de pão fresco do malte Pilsen combinadas ao perfume herbal e floral do lúpulo Saaz.',
    hops: ['Saaz', 'Hallertau Mittelfrüh'],
    malts: ['Pilsner Premium', 'Carahell'],
    temp: '2°C a 4°C',
    glass: 'Pilsner / Tulipa',
    pairing: ['Petiscos de boteco', 'Queijos leves', 'Linguiça artesanal na brasa'],
  },
  {
    id: 'gralha-west-coast-ipa',
    name: 'Gralha Azul West Coast IPA',
    style: 'American West Coast IPA',
    category: 'ipa',
    abv: '6.6%',
    ibu: 62,
    ebc: 14,
    volume: 'Lata 473ml',
    price: 25.9,
    batch: 'Lote #021',
    isFlagship: true,
    image:
      'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=1000&q=85',
    shortDesc:
      'Amargor limpo e assertivo como manda a escola californiana, notas resinosas de pinho em homenagem às araucárias, maracujá e toranja.',
    hops: ['Simcoe', 'Centennial', 'Citra'],
    malts: ['Pale Ale', 'Munich I', 'Carapils'],
    temp: '4°C a 7°C',
    glass: 'IPA Glass / Pint',
    pairing: ['Smash Burger com cheddar', 'Costelinha BBQ', 'Comida mexicana'],
  },
  {
    id: 'gralha-hazy-ipa',
    name: 'Copa das Araucárias NEIPA',
    style: 'Double Dry Hopped Hazy IPA',
    category: 'ipa',
    abv: '6.8%',
    ibu: 42,
    ebc: 11,
    volume: 'Lata 473ml',
    price: 28.9,
    batch: 'Lote #022',
    isFlagship: true,
    image:
      'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=1000&q=85',
    shortDesc:
      'Turbidez aveludada pela aveia e trigo, amargor macio e uma explosão tropical de manga madura, pêssego e frutas amarelas.',
    hops: ['Mosaic', 'Galaxy', 'El Dorado'],
    malts: ['Pale Ale', 'Aveia em Flocos', 'Trigo Maltado'],
    temp: '5°C a 8°C',
    glass: 'Snifter / Teku',
    pairing: ['Frango frito crocante', 'Tacos de porco com abacaxi', 'Queijo Gouda'],
  },
  {
    id: 'gralha-hop-lager',
    name: 'Neblina da Serra Hop Lager',
    style: 'Dry-Hopped Cold Lager',
    category: 'pilsen',
    abv: '5.1%',
    ibu: 24,
    ebc: 6,
    volume: 'Lata 473ml',
    price: 20.9,
    batch: 'Lote #018',
    isFlagship: false,
    image:
      'https://images.unsplash.com/photo-1575037614876-c38a4d44f5b8?auto=format&fit=crop&w=1000&q=85',
    shortDesc:
      'A leveza crocante de uma Lager curitibana com adição generosa de Citra no Dry Hopping. Final seco, limpo e aroma de limão siciliano.',
    hops: ['Citra', 'Motueka'],
    malts: ['Pilsner', 'Flocos de Arroz'],
    temp: '2°C a 4°C',
    glass: 'Pint / Lager Glass',
    pairing: ['Ceviche', 'Peixes grelhados', 'Pizza Margherita'],
  },
  {
    id: 'gralha-session-ipa',
    name: 'Brisa do Parque Session IPA',
    style: 'Session India Pale Ale',
    category: 'ipa',
    abv: '4.5%',
    ibu: 35,
    ebc: 9,
    volume: 'Lata 473ml',
    price: 22.5,
    batch: 'Lote #019',
    isFlagship: false,
    image:
      'https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?auto=format&fit=crop&w=1000&q=85',
    shortDesc:
      'Todo o aroma cítrico de uma IPA americana com corpo leve e baixo teor alcoólico. Perfeita para tardes inteiras de churrasco.',
    hops: ['Amarillo', 'Cascade'],
    malts: ['Pale Ale', 'Vienna'],
    temp: '3°C a 5°C',
    glass: 'Pint Americano',
    pairing: ['Dadinhos de tapioca', 'Asinhas de frango', 'Saladas cítricas'],
  },
  {
    id: 'gralha-dry-stout',
    name: 'Noite Fria Dry Stout',
    style: 'Irish-Style Dry Stout',
    category: 'especiais',
    abv: '4.6%',
    ibu: 32,
    ebc: 75,
    volume: 'Lata 473ml',
    price: 23.9,
    batch: 'Lote #015',
    isFlagship: false,
    image:
      'https://images.unsplash.com/photo-1518176258769-f227c798150e?auto=format&fit=crop&w=1000&q=85',
    shortDesc:
      'Feita para os dias frios de Curitiba. Notas intensas de café espresso recém-extraído, cacau amargo 70% e espuma cremosa cor de avelã.',
    hops: ['East Kent Goldings'],
    malts: ['Maris Otter', 'Cevada Torrada', 'Chocolate Malt', 'Flocos de Cevada'],
    temp: '7°C a 10°C',
    glass: 'Pint Nonic',
    pairing: ['Brownie de chocolate', 'Ostras', 'Carnes defumadas'],
  },
];

export const CURATED_PACKS = [
  {
    id: 'pack-pilsen-ipa-6',
    name: 'Caixa Degustação Gralha (6 Latas)',
    style: 'Seleção Completa • 6x 473ml',
    description:
      '1x unidade de cada rótulo de linha da Gralha Brewing (Pilsen, Hop Lager, West Coast IPA, NEIPA, Session IPA e Dry Stout) com 10% de desconto.',
    price: 126.9,
    originalPrice: 141.0,
    volume: 'Pack 6x 473ml',
    image:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'pack-hop-lovers-4',
    name: 'Pack Lupuladas Curitiba (4 Latas)',
    style: 'Foco em Lúpulo • 4x 473ml',
    description:
      '2x Gralha Azul West Coast IPA + 1x Copa das Araucárias NEIPA + 1x Brisa do Parque Session IPA.',
    price: 94.9,
    originalPrice: 103.2,
    volume: 'Pack 4x 473ml',
    image:
      'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=1000&q=85',
  },
];
