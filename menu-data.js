/* Novo cardápio — N1 Burger Club (RE:MENU, 29/09/2026)
   Base: cardápio final do processo com júri (pack/50-cardapio-final.json) + ajustes finais de revisão:
   combo com regra única (+R$ 16 em qualquer burger), descrições fiéis à ficha técnica, selos só com base.
   Custos: planilha "CMV 2026" (abas Precificação N1, Frango & Burguers, Pré-operação), com saco kraft. */
(function () {
  const H = "img/hd/";
  const A = "img/atual/";
  const N = "img/novo/";
  const P_DUPLA = 54.9; // Dupla do Clube (2 The Original)

  /* ---------- grupos reutilizáveis ---------- */
  const COMBO = 16; // acréscimo único do combo (R3 · Regra 1)
  const gCombo = () => ({
    id: "combo", title: "Vira Combo N1?", hint: "Escolha 1 · o combo sai R$ 5,80 mais barato que separado", min: 1, max: 1, highlight: true, why: "combo-step",
    options: [
      { id: "combo", name: "Combo: + Batata Frita Crocante Individual + Coca lata", price: COMBO, img: N + "thumb-batata-coca.jpg", desc: "Separado sairia R$ 21,80 · economize R$ 5,80" },
      { id: "turbo", name: "Combo turbo: + Batata Cheddar e Bacon Individual + Coca lata", price: 24, img: H + "batata-cheddar-e-bacon.jpg", desc: "Separado sairia R$ 29,80 · economize R$ 5,80" },
      { id: "solo", name: "Só o lanche" },
    ],
  });
  const gDrink = () => ({
    id: "bebida", title: "Bebida do combo", hint: "Já vai Coca-Cola · troque se quiser", min: 1, max: 1, preset: { coca: 1 }, showIf: { g: "combo", any: ["combo", "turbo"] },
    options: [
      { id: "coca", name: "Coca-Cola lata", img: H + "coca-lata-normal.jpg" },
      { id: "zero", name: "Coca-Cola sem açúcar lata", img: H + "coca-lata-zero.jpg" },
    ],
  });
  const gDouble = (price, desc = "Mesmo preço do Double pronto do cardápio") => ({
    id: "camada", title: "Vira Double?", hint: "Opcional · +2 tiras de sassami crocante", min: 0, max: 1, addon: true, why: "double",
    options: [{ id: "double", name: "Fazer Double: + 2 tiras de sassami", price, img: H + "double-original.jpg", desc }],
  });
  const gTriple = () => ({
    id: "camada", title: "Vira Triple?", hint: "Opcional · a 3ª camada", min: 0, max: 1, addon: true, why: "double",
    options: [{ id: "triple", name: "Fazer Triple: + 2 tiras de sassami", price: 13, img: N + "triple-bbc.jpg", ai: true, desc: "Não é desafio, é declaração" }],
  });
  const gTurbine = () => ({
    id: "turbine", title: "Turbine seu burger", hint: "Opcional · direto no lanche", min: 0, max: 4, why: "turbine",
    options: [
      { id: "bacon", name: "+ Bacon em cubos", price: 5.9, max: 1 },
      { id: "onion", name: "+ 3 onion rings dentro do burger", price: 5.9, max: 1 },
      { id: "cheddar", name: "+ Cheddar cremoso", price: 4.9, max: 1 },
      { id: "picles", name: "+ Picles", price: 1.9, max: 1 },
    ],
  });
  const SAUCES = [
    ["verde", "Molho Verde da Casa", H + "maionese-verde.jpg"],
    ["bacon", "Bacon Mayo", H + "maionese-de-bacon.jpg"],
    ["alho", "Garlic Cheese Mayo", H + "maionese-alho-com-queijo.jpg"],
    ["cheddar", "Cheddar Punch", H + "molho-cheddar.jpg"],
    ["bbq", "BBQ", H + "barbecue-burger-club.jpg"],
    ["mostarda", "Mostarda", H + "mostarda-burger-club.jpg"],
    ["ketchup", "Ketchup", H + "catchup.jpg"],
  ];
  const gMolho = () => ({
    id: "molho", title: "Molho extra no potinho", hint: "Opcional · até 3 · R$ 6,90 cada escolhido aqui (avulso a partir de R$ 8,90)", min: 0, max: 3, why: "molhos",
    options: SAUCES.map(([id, name, img]) => ({ id, name, price: 6.9, img })),
  });
  const gMolhoIncluso = (n) => ({
    id: "molho-incluso", title: n > 1 ? `${n} molhos da casa inclusos` : "Molho da casa incluso", hint: `Escolha ${n} · ${n > 1 ? "já estão" : "já está"} no preço`, min: n, max: n,
    options: SAUCES.map(([id, name, img]) => ({ id, name, img })),
  });
  /* Sobremesa no modal: opcional, preço do cardápio, nada marcado (CDC art. 39, III).
     No burger é 1 só (evita Brigadeiro + Mini Churros avulsos, R$ 21,80, no lugar do Churros + Brigadeiro, R$ 17,90). */
  const DOCE = {
    cb: { id: "churros-brigadeiro", name: "Churros + Brigadeiro", price: 17.9, cost: 4.65, img: N + "churros-brigadeiro.jpg", ai: true, desc: "Mini churros e brigadeiro pra mergulhar · separado sairia R$ 21,80" },
    ch: { id: "mini-churros", name: "Mini Churros Individual", price: 11.9, cost: 2.63, img: H + "mini-churros.jpg", desc: "Com açúcar e canela, recheados" },
    br: { id: "brigadeiro", name: "Brigadeiro do Clube", price: 9.9, cost: 2.02, img: H + "brigadeiro.jpg", desc: "De colher, cremoso, no potinho" },
    su: { id: "mini-churros-super", name: "Mini Churros Super", price: 32.9, cost: 7.16, img: H + "mini-churros.jpg", desc: "Pra dividir" },
  };
  const gSobremesa = () => ({ id: "sobremesa", title: "Fecha com uma sobremesa?", hint: "Opcional · mesmo preço do cardápio", min: 0, max: 1, addon: true, why: "sobremesas", options: [DOCE.cb, DOCE.ch, DOCE.br] });
  const gSobremesaDividir = (max) => ({
    id: "sobremesa", title: max > 2 ? "Sobremesa pra galera?" : "Sobremesa pra dividir?", hint: `Opcional · até ${max} · mesmo preço do cardápio`, min: 0, max, why: "sobremesas",
    options: max > 2 ? [{ ...DOCE.su, max: 2 }, { ...DOCE.cb, max }, { ...DOCE.br, max }] : [{ ...DOCE.cb, max }, { ...DOCE.su, max: 1 }, { ...DOCE.br, max }],
  });
  /* Troca do acompanhamento incluso: a batata já vem marcada (R$ 0); a troca paga só a diferença de custo com margem. */
  const LADO_IMG = { batata: H + "batata-frita.jpg", aipim: H + "aipim-frito.jpg", onion: H + "onion-rings.jpg", loaded: H + "batata-cheddar-e-bacon.jpg" };
  const gLado = (title, rows) => ({ id: "lado", title, hint: "Já incluso · troque se quiser", min: 1, max: 1, preset: { batata: 1 }, options: rows.map(([id, name, price]) => ({ id, name, price, img: LADO_IMG[id] })) });
  const LADO_SUPER = [["batata", "Batata Frita Crocante Super", 0], ["aipim", "Aipim Frito Super", 0], ["onion", "Onion Rings Super", 3], ["loaded", "Batata Cheddar e Bacon Super", 8]];
  const LADO_MEGA = [["batata", "Batata Frita Crocante Mega", 0], ["aipim", "Aipim Frito Mega", 0], ["loaded", "Batata Cheddar e Bacon Mega", 20]];
  const gMolhoAcomp = () => ({ ...gMolho(), title: "Molho pra mergulhar" });
  const burger = (extra = []) => [gCombo(), gDrink(), ...extra, gSobremesa(), gTurbine(), gMolho()];
  const PICK = [
    ["original", "The Original", 0, H + "o-original.jpg"],
    ["smoke", "The Smoke", 0, H + "chicken-bbq.jpg"],
    ["crunch", "The Crunch", 1, N + "the-crunch.jpg", true],
    ["garden", "The Garden", 2, H + "verde.jpg"],
    ["garlic", "The Garlic", 4, H + "garlic-bacon.jpg"],
    ["onion", "The Onion Storm", 4, H + "onion.jpg"],
    ["bbc", "The B.B.C.", 4, H + "o-b-b-c.jpg"],
  ];
  const pick = (n) => ({
    id: "burgers", title: n > 1 ? `Escolha os ${n} burgers` : "Escolha o burger", hint: n > 1 ? `Escolha ${n} · pode repetir` : "Escolha 1", min: n, max: n,
    options: PICK.map(([id, name, price, img, ai]) => ({ id, name, price, img, ai })),
  });
  const sizes = (id, title, opts) => ({ id, title, min: 1, max: 1, options: opts.map(([oid, name, price, desc]) => ({ id: oid, name, price, desc })) });
  const cocaGrande = { id: "bebida", title: "Coca grande", min: 1, max: 1, preset: { coca: 1 }, options: [{ id: "coca", name: "Coca-Cola 1,5 L ou 2 L", img: H + "coca-grande-normal-1-5l.jpg" }, { id: "zero", name: "Coca-Cola sem açúcar 1,5 L ou 2 L", img: H + "coca-grande-zero-1-5l.jpg" }] };
  const duasCocas = { id: "bebida", title: "2 Cocas lata", hint: "Escolha 2 · pode misturar", min: 2, max: 2, preset: { coca: 2 }, options: [{ id: "coca", name: "Coca-Cola lata", img: H + "coca-lata-normal.jpg" }, { id: "zero", name: "Coca-Cola sem açúcar lata", img: H + "coca-lata-zero.jpg" }] };

  const items = [
    /* ===== Pra Dois ===== */
    { id: "dupla-clube", cat: "pra-dois", name: "Dupla do Clube", img: N + "dupla-clube.jpg", ai: true, price: P_DUPLA, old: 63.8, badge: { text: "Leve 2", tone: "pink" }, serves: "2 burgers", why: "dupla",
      desc: "2 The Original: 2 tiras de sassami de frango crocante e Molho Verde da Casa no brioche. Sai R$ 27,45 cada.",
      groups: [gMolhoIncluso(1), { id: "completar", title: "Quer completar a dupla?", hint: "Opcional · vira um Date Night", min: 0, max: 1, addon: true, why: "dupla",
        options: [{ id: "sb", name: "+ Batata Frita Crocante Super pra dividir", price: 18, img: H + "batata-frita.jpg", desc: "Fica R$ 72,90 · separado sairia R$ 34,90" },
          { id: "dn", name: "+ Batata Frita Crocante Super pra dividir + 2 Cocas lata", price: +(89.9 - P_DUPLA).toFixed(2), img: H + "date-night.jpg", desc: "Vira Date Night, R$ 89,90 · separado sairia R$ 54,70" }] },
        { ...duasCocas, showIf: { g: "completar", any: ["dn"] } }, gSobremesaDividir(2)],
      role: "Isca de conversão", cost: 15.0 },
    { id: "date-night", cat: "pra-dois", name: "Date Night", img: H + "date-night.jpg", price: 89.9, old: 118.5, fromLabel: true, serves: "Serve 2 pessoas", tag: "Sextou pra dois",
      desc: "2 burgers à sua escolha + Batata Frita Crocante Super pra dividir + 2 Cocas lata. Sem briga sobre o que pedir.",
      groups: [pick(2), gLado("Acompanhamento pra dividir", LADO_SUPER), duasCocas, gMolhoIncluso(1), gSobremesaDividir(2)],
      role: "Estrela do ticket", cost: 30.34 },

    /* ===== Pra Compartilhar ===== */
    { id: "o-bonde", cat: "pra-compartilhar", name: "O Bonde", img: A + "o-bonde.jpg", price: 169.9, old: 203.4, fromLabel: true, badge: { text: "Pra galera", tone: "yellow" }, serves: "Serve 3 a 4 pessoas",
      desc: "4 burgers à escolha + Batata Frita Crocante Mega + Coca grande. Sai até 11% abaixo de 4 combos.",
      groups: [pick(4), gLado("Acompanhamento pra galera", LADO_MEGA), cocaGrande, { ...gMolho(), title: "Molho pra galera" }, gSobremesaDividir(4)], role: "Volume (grupo)", cost: 51.42 },
    { id: "a-monstra", cat: "pra-compartilhar", name: "Os Monstros", img: H + "a-monstra.jpg", price: 219.9, old: 255.4, badge: { text: "Fome grande", tone: "red" }, serves: "Serve 4 pessoas com folga",
      desc: "4 Double Original + Batata Frita Crocante Mega + Coca grande + 2 molhos da casa. Pede com responsabilidade.",
      groups: [gLado("Acompanhamento pra galera", LADO_MEGA), gMolhoIncluso(2), cocaGrande, gSobremesaDividir(4)], role: "Âncora de teto", cost: 67.94 },

    /* ===== Chicken Burgers ===== */
    { id: "the-garlic", cat: "burgers", name: "The Garlic", img: H + "garlic-bacon.jpg", price: 38.9,
      desc: "2 tiras de sassami de frango crocante, maionese de alho e queijo, bacon em cubos, alface, tomate e picles.",
      groups: burger([gDouble(11)]), role: "Estrela", cost: 8.36 },
    { id: "the-bbc", cat: "burgers", name: "The B.B.C.", img: H + "o-b-b-c.jpg", price: 39.9, badge: { text: "Carro-chefe", tone: "dark" },
      desc: "2 tiras de sassami de frango crocante com bacon em cubos, barbecue defumado e cheddar cremoso.",
      groups: burger([gDouble(10)]), role: "Quebra-cabeça (carro-chefe)", cost: 8.49 },
    { id: "the-crunch", cat: "burgers", name: "The Crunch", img: N + "the-crunch.jpg", ai: true, price: 32.9, badge: { text: "Novo", tone: "red" }, why: "crunch",
      desc: "2 tiras de sassami de frango crocante, molho cheddar e picles no brioche. Crocante, cremoso e ácido na medida.",
      groups: burger([gDouble(10, "Fica com 4 tiras de sassami · R$ 42,90")]), role: "Novidade (zero insumo novo)", cost: 7.31 },
    { id: "the-onion-storm", cat: "burgers", name: "The Onion Storm", img: H + "onion.jpg", price: 38.9,
      desc: "2 tiras de sassami de frango crocante, 3 anéis de cebola empanados e maionese de bacon.",
      groups: burger([gDouble(10)]), role: "Quebra-cabeça", cost: 8.26 },
    { id: "the-garden", cat: "burgers", name: "The Garden", img: H + "verde.jpg", price: 33.9, badge: { text: "Mais pedido", tone: "dark" }, why: "garden",
      desc: "2 tiras de sassami de frango crocante, cheddar cremoso, Molho Verde da Casa, alface, tomate, cebola e picles. O mais completo.",
      groups: burger([gDouble(10, "Fica com 4 tiras de sassami · R$ 43,90")]), role: "Burro de carga", cost: 7.45 },
    { id: "the-original", cat: "burgers", name: "The Original", img: H + "o-original.jpg", price: 31.9, tag: "O clássico",
      desc: "2 tiras de sassami de frango crocante e Molho Verde da Casa no brioche. Simples do jeito certo.",
      groups: burger([gDouble(11)]), role: "Base de combo", cost: 7.02 },
    { id: "the-smoke", cat: "burgers", name: "The Smoke", img: H + "chicken-bbq.jpg", price: 29.9,
      desc: "2 tiras de sassami de frango crocante com barbecue defumado, no brioche.",
      groups: burger([gDouble(10)]), role: "Entrada de preço", cost: 6.75 },

    /* ===== Doubles & Triple ===== */
    { id: "double-bbc", cat: "doubles", name: "Double B.B.C.", img: H + "double-b-b-c.jpg", price: 49.9, tag: "Dose dupla",
      desc: "4 tiras de sassami de frango crocante com bacon, barbecue e cheddar em dose dupla.",
      groups: burger([gTriple()]), role: "Âncora premium", cost: 13.23 },
    { id: "double-garlic", cat: "doubles", name: "Double Garlic", img: H + "double-garlic.jpg", price: 49.9,
      desc: "4 tiras de sassami de frango, bacon em cubos, maionese de alho e queijo, alface, tomate e picles.",
      groups: burger(), role: "Quebra-cabeça", cost: 12.98 },
    { id: "double-onion-storm", cat: "doubles", name: "Double Onion Storm", img: H + "double-onion.jpg", price: 48.9,
      desc: "4 tiras de sassami de frango, anéis de cebola empanados e maionese de bacon em dose dupla.",
      groups: burger(), role: "Quebra-cabeça", cost: 12.76 },
    { id: "double-original", cat: "doubles", name: "Double Original", img: H + "double-original.jpg", price: 42.9,
      desc: "4 tiras de sassami de frango crocante e Molho Verde da Casa no brioche. O clássico em dose dupla.",
      groups: burger(), role: "Âncora do single", cost: 10.3 },
    { id: "double-smoke", cat: "doubles", name: "Double Smoke", img: H + "double-b-b-q.jpg", price: 39.9, badge: { text: "Novo preço", tone: "yellow" }, why: "double",
      desc: "4 tiras de sassami de frango crocante com barbecue defumado, no brioche.",
      groups: burger(), role: "Quebra-cabeça", cost: 9.74 },
    { id: "triple-bbc", cat: "doubles", name: "Triple B.B.C.", img: N + "triple-bbc.jpg", ai: true, price: 62.9, badge: { text: "Novo", tone: "red" }, why: "triple",
      desc: "6 tiras de sassami de frango em 3 camadas, bacon, barbecue e cheddar. Não é desafio, é declaração.",
      groups: burger(), role: "Âncora de teto", cost: 17.97, est: true },

    /* ===== Acompanhamentos ===== */
    { id: "batata", cat: "acomp", name: "Batata Frita Crocante", img: H + "batata-frita.jpg", price: 0, fromLabel: true,
      desc: "Batata palito crocante, sal na medida.",
      groups: [sizes("tam", "Escolha o tamanho", [["ind", "Individual", 11.9], ["super", "Super", 34.9, "Serve 2 a 3"], ["mega", "Mega", 59.9, "Serve 4 a 5"]]), gMolhoAcomp()], role: "Ancoragem p/ combo", cost: 2.02 },
    { id: "batata-loaded", cat: "acomp", name: "Batata Cheddar e Bacon", img: H + "batata-cheddar-e-bacon.jpg", price: 0, fromLabel: true, badge: { text: "Novo tamanho", tone: "yellow" }, why: "acomp",
      desc: "Batata frita, bacon em cubos e cheddar cremoso. Agora também em porção individual.",
      groups: [sizes("tam", "Escolha o tamanho", [["ind", "Individual (novo)", 19.9, "Cabe no pedido de 1 pessoa"], ["super", "Super", 42.9, "Serve 2 a 3"], ["mega", "Mega", 79.9, "Serve 4 a 5"]]), gMolhoAcomp()], role: "Upsell (combo turbo)", cost: 4.38 },
    { id: "onion-rings", cat: "acomp", name: "Onion Rings", img: H + "onion-rings.jpg", price: 0, fromLabel: true,
      desc: "Anéis de cebola empanados, sequinhos e crocantes.",
      groups: [sizes("tam", "Escolha o tamanho", [["ind", "Individual", 12.9], ["super", "Super", 36.9, "Serve 2 a 3"], ["mega", "Mega", 62.9, "Serve 4 a 5"]]), gMolhoAcomp()], role: "Impulso", cost: 2.62 },
    { id: "aipim", cat: "acomp", name: "Aipim Frito", img: H + "aipim-frito.jpg", price: 0, fromLabel: true,
      desc: "Mandioca frita em cubos, casquinha crocante e miolo macio.",
      groups: [sizes("tam", "Escolha o tamanho", [["ind", "Individual", 12.9], ["super", "Super", 32.9, "Serve 2 a 3"], ["mega", "Mega", 54.9, "Serve 4 a 5"]]), gMolhoAcomp()], role: "Ancoragem p/ combo", cost: 1.71 },
    { id: "chicken-bites", cat: "acomp", name: "Chicken Bites", img: N + "chicken-bites.jpg", ai: true, price: 0, fromLabel: true,
      desc: "Cubinhos de sassami empanados, o mesmo frango da casa. Pra beliscar junto.",
      groups: [sizes("tam", "Escolha o tamanho", [["pp", "PP", 9.9, "Pra acompanhar o burger"], ["p", "P", 28.9, "Pra dividir"], ["m", "M", 52.9, "Pra galera"]]), gMolhoAcomp()], role: "Upsell", cost: 3.07 },
    { id: "bites-pp", cat: "acomp", hidden: true, name: "Chicken Bites PP", img: N + "chicken-bites.jpg", ai: true, price: 9.9, desc: "Cubinhos de sassami empanados, pra acompanhar o burger.", role: "Upsell", cost: 3.07 },

    /* ===== Molhos da Casa ===== */
    { id: "verde-n1", cat: "molhos", name: "Molho Verde da Casa", img: H + "maionese-verde.jpg", price: 8.9, badge: { text: "Assinatura", tone: "green" }, why: "molhos",
      desc: "A maionese-assinatura do clube, a mesma do The Original. Vai bem até com a batata.", role: "Pura margem (assinatura)", cost: 1.74 },
    { id: "trio-molhos", cat: "molhos", name: "Trio de Molhos", img: H + "maioneses-caseiras.jpg", price: 19.9, old: 26.7, badge: { text: "Pra provar tudo", tone: "yellow" },
      desc: "Escolha 3 potinhos. O Verde da Casa é a assinatura do clube.",
      groups: [{ id: "tres", title: "Escolha 3 molhos", hint: "Pode repetir", min: 3, max: 3, options: SAUCES.map(([id, name, img]) => ({ id, name, img })) }], role: "Pura margem", cost: 5.4 },
    { id: "molhos", cat: "molhos", name: "Molhos no potinho", img: H + "molho-cheddar.jpg", price: 8.9, fromLabel: true,
      desc: "Bacon Mayo, Garlic Cheese Mayo, Cheddar Punch, BBQ, Mostarda ou Ketchup.",
      groups: [{ id: "qual", title: "Qual molho?", min: 1, max: 1, options: [
        { id: "bacon", name: "Bacon Mayo", img: H + "maionese-de-bacon.jpg" }, { id: "alho", name: "Garlic Cheese Mayo", img: H + "maionese-alho-com-queijo.jpg" },
        { id: "cheddar", name: "Cheddar Punch", price: 3, img: H + "molho-cheddar.jpg" }, { id: "bbq", name: "BBQ", img: H + "barbecue-burger-club.jpg" }, { id: "mostarda", name: "Mostarda", img: H + "mostarda-burger-club.jpg" }, { id: "ketchup", name: "Ketchup", img: H + "catchup.jpg" }] }],
      role: "Pura margem", cost: 1.7 },

    /* ===== Sobremesas ===== */
    { id: "churros-brigadeiro", cat: "sobremesas", name: "Churros + Brigadeiro", img: N + "churros-brigadeiro.jpg", ai: true, price: 17.9, old: 21.8, badge: { text: "Novo", tone: "red" },
      desc: "Mini churros recheados e um pote de brigadeiro pra mergulhar.", role: "Impulso final", cost: 4.65 },
    { id: "brigadeiro", cat: "sobremesas", name: "Brigadeiro do Clube", img: H + "brigadeiro.jpg", price: 9.9,
      desc: "Brigadeiro de colher, cremoso, no potinho.", role: "Impulso final", cost: 2.02 },
    { id: "mini-churros", cat: "sobremesas", name: "Mini Churros", img: H + "mini-churros.jpg", price: 0, fromLabel: true,
      desc: "Mini churros com açúcar e canela, recheados.",
      groups: [sizes("tam", "Escolha o tamanho", [["ind", "Individual", 11.9], ["super", "Super", 32.9, "Pra dividir"]])], role: "Pequeno luxo", cost: 2.63 },
    { id: "mini-churros-ind", cat: "sobremesas", hidden: true, name: "Mini Churros Individual", img: H + "mini-churros.jpg", price: 11.9, desc: "Pra mergulhar no Brigadeiro de brinde.", role: "Impulso final", cost: 2.63 },

    /* ===== Bebidas ===== */
    { id: "coca-lata", cat: "bebidas", name: "Coca-Cola lata", img: H + "coca-lata-normal.jpg", price: 9.9, badge: { text: "Novo preço", tone: "yellow" }, why: "bebidas",
      desc: "Normal ou sem açúcar, 310 ml ou 350 ml conforme a região.",
      groups: [{ id: "tipo", title: "Normal ou sem açúcar?", min: 1, max: 1, preset: { normal: 1 }, options: [{ id: "normal", name: "Normal", img: H + "coca-lata-normal.jpg" }, { id: "zero", name: "Sem açúcar", img: H + "coca-lata-zero.jpg" }] }],
      role: "Ancoragem p/ combo", cost: 3.64 },
    { id: "coca-grande", cat: "bebidas", name: "Coca-Cola grande", img: H + "coca-grande-normal-1-5l.jpg", price: 23.9,
      desc: "1,5 L ou 2 L conforme a região, normal ou sem açúcar.",
      groups: [{ id: "tipo", title: "Normal ou sem açúcar?", min: 1, max: 1, preset: { normal: 1 }, options: [{ id: "normal", name: "Normal", img: H + "coca-grande-normal-1-5l.jpg" }, { id: "zero", name: "Sem açúcar", img: H + "coca-grande-zero-1-5l.jpg" }] }],
      role: "Conveniência", cost: 9.91 },
  ];

  /* ---------- engenharia (tabela da página): itens + combos via modal + tamanhos ---------- */
  const OVERHEAD = 7.76; // batata individual + Coca lata + embalagens do combo = linha do combo na planilha − ficha do burger sem kraft (bate 5 linhas); o kraft entra uma vez, dentro de it.cost
  const eng = [];
  const add = (cat, name, price, cost, role, isNew, est) => eng.push({ cat, name, price, cost, role, isNew, est });
  items.forEach((it) => {
    if (it.cat === "acomp" || it.cat === "molhos" || it.cat === "sobremesas" || it.cat === "bebidas") return;
    add(it.cat, it.name, it.price, it.cost, it.role, /Novo/.test(it.badge?.text || "") || it.id === "dupla-clube", it.est);
  });
  items.filter((i) => ["burgers", "doubles"].includes(i.cat)).forEach((it) =>
    add("combo", `Combo ${it.name}`, it.price + COMBO, +(it.cost + OVERHEAD).toFixed(2), "Combo via modal (+R$ 16)", false, it.est));
  [
    ["pra-dois", "Dupla + Batata Super (via modal)", 72.9, 23.7, "Degrau do casal (R$ 60 a R$ 85)", true],
    ["doubles", "Double The Garden (via modal)", 43.9, 10.73, "Vira Double no modal", true, true], ["doubles", "Double The Crunch (via modal)", 42.9, 10.59, "Vira Double no modal", true, true],
    ["acomp", "Batata Frita Crocante Individual", 11.9, 2.02, "Ancoragem p/ combo"], ["acomp", "Batata Frita Crocante Super", 34.9, 7.09, "Compartilhado"], ["acomp", "Batata Frita Crocante Mega", 59.9, 13.57, "Upsell familiar"],
    ["acomp", "Batata Cheddar e Bacon Individual", 19.9, 4.38, "Upsell (combo turbo)", true, true], ["acomp", "Batata Cheddar e Bacon Super", 42.9, 9.93, "Compartilhado"], ["acomp", "Batata Cheddar e Bacon Mega", 79.9, 19.25, "Upsell familiar"],
    ["acomp", "Onion Rings Individual", 12.9, 2.62, "Impulso"], ["acomp", "Onion Rings Super", 36.9, 9.34, "Compartilhado"], ["acomp", "Onion Rings Mega", 62.9, 18.63, "Upsell familiar"],
    ["acomp", "Aipim Frito Individual", 12.9, 1.71, "Ancoragem p/ combo"], ["acomp", "Aipim Frito Super", 32.9, 6.17, "Ancoragem p/ combo"], ["acomp", "Aipim Frito Mega", 54.9, 11.5, "Ancoragem p/ combo"],
    ["acomp", "Chicken Bites PP", 9.9, 3.07, "Upsell", true], ["acomp", "Chicken Bites P", 28.9, 8.43, "Upsell", true], ["acomp", "Chicken Bites M", 52.9, 15.13, "Upsell", true],
    ["molhos", "Molho Verde da Casa (avulso)", 8.9, 1.74, "Pura margem (assinatura)"], ["molhos", "Molho no potinho (avulso)", 8.9, 1.7, "Pura margem"], ["molhos", "Cheddar Punch (avulso)", 11.9, 2.33, "Pura margem"],
    ["molhos", "Molho extra no modal do item", 6.9, 1.7, "Pura margem"], ["molhos", "Trio de Molhos", 19.9, 5.4, "Pura margem", true],
    ["sobremesas", "Churros + Brigadeiro", 17.9, 4.65, "Impulso final", true], ["sobremesas", "Brigadeiro do Clube", 9.9, 2.02, "Impulso final"], ["sobremesas", "Mini Churros Individual", 11.9, 2.63, "Impulso final"], ["sobremesas", "Mini Churros Super", 32.9, 7.16, "Pequeno luxo"],
    ["bebidas", "Coca-Cola lata", 9.9, 3.64, "Ancoragem p/ combo"], ["bebidas", "Coca-Cola grande", 23.9, 9.91, "Conveniência"],
  ].forEach((r) => add(...r));

  window.N1 = {
    store: {
      name: "N1 Burger Club", tagline: "Chicken burgers · Lanches", cover: N + "cover.jpg", logo: "img/brand/n1-badge.svg",
      rating: "4,8 (exemplo)", eta: "30–45 min", fee: "Entrega R$ 6,99", feeValue: 6.99,
      club: "5 to Free: 1 de 6 já é seu. A cada 5 pedidos, um The Original por nossa conta.",
    },
    goal: { value: 74.9, gift: "1 Brigadeiro do Clube", skip: ["pra-dois", "pra-compartilhar"] },
    featured: ["the-bbc", "dupla-clube", "the-crunch", "date-night", "triple-bbc"],
    cross: { dessert: ["churros-brigadeiro", "brigadeiro"], dessertWon: ["mini-churros-ind"], sauce: "verde-n1", sauceAlt: "trio-molhos", bites: "bites-pp" },
    categories: [
      { id: "pra-dois", name: "Pra Dois", sub: "O formato nº 1 da rede, agora com vitrine própria no clube." },
      { id: "pra-compartilhar", name: "Pra Compartilhar", short: "Compartilhar", sub: "De 3 a 4 pessoas. Os Monstros já vêm com 2 molhos da casa." },
      { id: "burgers", name: "Chicken Burgers", short: "Burgers", sub: "2 tiras de sassami empanadas na hora, no brioche. Qualquer burger vira combo por +R$ 16: combo a partir de R$ 45,90." },
      { id: "doubles", name: "Doubles & Triple", short: "Doubles", sub: "O mesmo clássico, em dose dupla ou tripla." },
      { id: "acomp", name: "Acompanhamentos", short: "Acompanhamentos" },
      { id: "molhos", name: "Molhos da Casa", short: "Molhos", sub: "Feitos na cozinha. O Verde da Casa é a nossa assinatura." },
      { id: "sobremesas", name: "Sobremesas", short: "Sobremesas" },
      { id: "bebidas", name: "Bebidas", short: "Bebidas" },
    ],
    items,
    eng,
    why: {
      destaques: { title: "Destaques no topo", tags: ["Prova social", "Primeira tela"],
        text: "Até 5 itens, só o que puxa pedido: o carro-chefe, a porta de entrada e as novidades. Destacar os mais pedidos aumentou a demanda deles em <b>13% a 20%</b> num experimento de campo, e a seção “Mais Vendidos” do iFood teve <b>+44%</b> nas vendas originadas nela. O carrossel é recalculado a cada 30 dias com dado real do clube.",
        ref: "Cai, Chen & Fang (AER, 2009) · blog iFood Parceiros" },
      "pra-dois": { title: "Pra Dois: o formato que a rede já prova", tags: ["Isca de conversão", "Formato nº 1 da rede"],
        text: "O formato “dois burgers com desconto” foi o item com mais pedidos da rede (marca-mãe) em 2025: <b>79.661</b>, quase o dobro do 2º colocado (Combo M, 39.985). O clube nunca teve essa vitrine. A Dupla do Clube sai a <b>R$ 54,90</b> (R$ 27,45 cada) e sobe em degraus no próprio modal: <b>+R$ 18</b> com Batata Super (R$ 72,90, dentro do orçamento do casal, de R$ 60 a R$ 85) ou <b>+R$ 35</b> vira Date Night. Date Night cai de R$ 96,90 para <b>R$ 89,90</b>, o topo da faixa de combos pra 2 no mercado. A Dupla B.B.C. sai: com 2 The B.B.C., o Date Night fica em R$ 97,90, R$ 12 a menos que ela pelo mesmo pedido. Preço “separado” sem contar o molho incluso.",
        ref: "Itens Vendidos 2025 (rede, marca N1 Chicken) · benchmark Brasil · Nagle (conta de empate)" },
      dupla: { title: "Dupla do Clube: por que R$ 54,90", tags: ["Conta de empate", "CMV 27,3%"],
        text: "Separados, 2 The Original custam R$ 63,80. A R$ 54,90 o cliente economiza <b>R$ 8,90 (14%)</b>. Para empatar a margem total, basta vender <b>25% mais pares</b>: a margem cai de R$ 49,76 (2 avulsos) para R$ 39,90 (a dupla, já com o molho incluso).",
        ref: "Nagle, Müller & Gruyaert (break-even de desconto) · planilha CMV 2026" },
      "pra-compartilhar": { title: "Compartilhar: dentro do orçamento da galera", tags: ["Volume (grupo)", "Âncora de teto"],
        text: "Persona Galera de Sábado (25% do público do plano, orçamento de R$ 130 a R$ 170). O Bonde cai de R$ 199,90 para <b>R$ 169,90</b>: a R$ 189,90 ele saía só R$ 1,70 mais barato que 4 combos individuais e R$ 44,91 acima do Combo N1 da Galera do iFood. Agora sai <b>até 11% abaixo de 4 combos</b>, com CMV de <b>30,3%</b> (meta de 29% a 30%) e R$ 24,19 a mais de margem que a Galera do iFood. O molho vira escolha paga (R$ 6,90), e Os Monstros (R$ 219,90, com 2 molhos) ficam como âncora de teto. O preço “separado” é a soma com o burger mais barato.",
        ref: "Plano de marca §5.3 · Slim Chickens · planilha CMV" },
      burgers: { title: "A ordem é de propósito", tags: ["Kasavana & Smith", "Posição na lista"],
        text: "The Garlic abre a lista: é o único item <b>Estrela</b> da matriz (popular na rede e com margem em R$ acima da média). Itens no início e no fim de uma lista chegam a ser <b>2x mais escolhidos</b>. No fim, a entrada de preço: The Smoke (R$ 29,90). Todo burger tem no mínimo 2 tiras de sassami. Todos com nome oficial do plano da marca: The Original, The B.B.C., The Garden.",
        ref: "Kasavana & Smith (1982) · Dayan & Bar-Hillel (2011) · plano de marca §6.3" },
      garden: { title: "Selo só onde tem dado", tags: ["Prova social honesta"],
        text: "Na rede, a mesma receita do The Garden (Chicken Salada) teve <b>14.045 pedidos em 2025</b>, o burger individual mais pedido. Por isso o selo “Mais pedido” está nele. O The B.B.C. vira <b>carro-chefe</b>: é a escolha da marca, e o selo de mais pedido só volta se o dado do clube em D+60 confirmar.",
        ref: "Itens Vendidos 2025 (rede) · R3 §6.3" },
      crunch: { title: "The Crunch: novidade sem insumo novo", tags: ["Zero insumo novo", "Cheddar + picles"],
        text: "2 tiras de sassami crocante, molho cheddar e picles: o cheddar do The B.B.C. e o picles do The Garden, que já estão na cozinha. Custo de <b>R$ 7,31</b> e CMV de 22%. Entra no lugar do The Spicy, que depende de um molho de pimenta que não está na lista de compras.",
        ref: "Planilha CMV (fichas técnicas) · plano de marca §6.3" },
      doubles: { title: "Escada Single → Double → Triple", tags: ["Good-better-best", "Dígito da esquerda"],
        text: "Todos os 7 burgers viram Double no próprio modal por <b>+R$ 10 ou +R$ 11</b>: nos 5 com Double pronto, pelo mesmo preço dele; no The Garden e no The Crunch, por +R$ 10 (custo da 2ª camada estimado), e o Double B.B.C. vira Triple por <b>+R$ 13</b>. O Double Smoke cai de R$ 41,90 para <b>R$ 39,90</b>: o efeito do dígito da esquerda só aparece quando o 1º dígito muda. O Triple existe para ancorar o topo e fazer o Double parecer a escolha razoável.",
        ref: "Thomas & Morwitz (2005) · Sharpe, Staelin & Huber (2008)" },
      double: { title: "Vira Double: margem que sobe em R$", tags: ["Upsell no modal"],
        text: "A 2ª camada custa de <b>R$ 2,99 a R$ 4,74</b> a mais em insumo, conforme o sabor, e soma R$ 10 ou R$ 11 ao preço, nos 5 sabores com Double pronto, exatamente o preço dele. A margem em reais do pedido sobe mesmo com CMV um pouco maior. Meta do plano: 28% dos pedidos com Double ou Triple em 90 dias.",
        ref: "Planilha CMV (Doubles) · plano de marca §12.2" },
      triple: { title: "Triple B.B.C.: âncora de teto", tags: ["Âncora real, não isca falsa"],
        text: "Decoys artificiais falham com estímulos reais. O Triple é um produto de verdade, a <b>R$ 62,90</b>, e faz o Double B.B.C. (R$ 49,90) parecer a escolha certa. Custo de R$ 17,97 extrapolado da ficha do Double: <b>precisa de custeio oficial</b> antes do lançamento.",
        ref: "Frederick, Lee & Baskin (2014) · plano de marca §6.4" },
      acomp: { title: "Acompanhamento que cabe no pedido de 1 pessoa", tags: ["Upsell", "Combo turbo"],
        text: "A Batata Cheddar e Bacon só existia em tamanho de dividir. Agora tem <b>Individual a R$ 19,90</b> (CMV de cerca de 22%, custo estimado a partir da Super) e vira o combo turbo por +R$ 24, com a mesma economia de R$ 5,80. Chicken Bites PP a R$ 9,90 usa o sassami que a cozinha já tem.",
        ref: "Planilha CMV (Precificação N1)" },
      molhos: { title: "Molho com nome e dois preços", tags: ["Pura margem", "Assinatura"],
        text: "Nas redes de frango que mais crescem, o molho da casa com nome próprio vira ativo de marca (Chick-fil-A Sauce, Cane's Sauce). A maionese verde vira <b>Molho Verde da Casa</b>, o nome do plano da marca. Escolhido no próprio lanche ou acompanhamento, qualquer molho extra sai a <b>R$ 6,90</b>; o potinho avulso, R$ 8,90 (Cheddar Punch R$ 11,90), como na planilha; o Trio de Molhos, R$ 19,90. Antes era R$ 6,49 num lugar e R$ 8,90 no outro.",
        ref: "Benchmark EUA · R3 Regra 5 · planilha CMV" },
      sobremesas: { title: "Sobremesa em todo burger", tags: ["Cross-sell no item", "Nada pago pré-marcado"],
        text: "Todo burger, Double e o Triple têm o passo opcional <b>“Fecha com uma sobremesa?”</b>, logo depois do combo e do Vira Double, pelo preço do cardápio e sem nada marcado: Churros + Brigadeiro (<b>R$ 17,90</b>, margem de R$ 13,25), Mini Churros Individual (R$ 11,90) e Brigadeiro do Clube (R$ 9,90). Pra Dois e Pra Compartilhar oferecem sobremesa pra dividir. O passo marca a opção que fecha a meta do brinde. A sacola só sugere doce se o pedido ainda não tem e, acima de R$ 74,90, oferece o Mini Churros pra mergulhar no Brigadeiro de brinde.",
        ref: "DoorDash Merchants (add-on ligado ao item) · Baymard (sugestão na página do produto) · iFood N1 Burguers (29/09/2026) · planilha CMV" },
      bebidas: { title: "Coca dentro da faixa de mercado", tags: ["Menos atrito na sacola"],
        text: "A lata cai de R$ 11,90 para <b>R$ 9,90</b>: o mercado cobra de R$ 7,50 a R$ 9,90, e bebida cara na sacola é motivo de desistência. Normal ou sem açúcar vira escolha dentro do item.",
        ref: "Benchmark Brasil (Poyos, Chicken Town) · planilha CMV" },
      carrinho: { title: "Sacola que completa o pedido", tags: ["Cross-sell por ausência", "Meta de brinde"],
        text: "Sem bebida, sugere Coca; sem doce (nem no lanche), sobremesa; sem molho extra, o Verde da Casa (ou o Trio, se o pedido já tem Verde). Quando faltam até R$ 17,90 para a meta, o 1º card é o mais barato que libera o brinde. Acima da meta, a sacola não oferece o Brigadeiro que já vai de brinde: oferece o Mini Churros pra mergulhar nele. Se o burger foi sem combo, a sacola oferece o combo de novo, já com a escolha da Coca; se a Dupla foi sem complemento, oferece o Date Night. Barra de meta: <b>Brigadeiro de brinde acima de R$ 74,90</b> (custo R$ 2,02), sem contar os combos Pra Dois e Pra Compartilhar: eles passam da meta sozinhos, e ali o brinde seria só custo (o Date Night iria de 33,7% para 36,0% de CMV).",
        ref: "Baymard · Kivetz, Urminsky & Zheng (2006)" },
      "combo-step": { title: "Combo: uma regra só", tags: ["+R$ 16 em qualquer burger", "Nada pago pré-marcado"],
        text: "No iFood de hoje, nenhum dos 8 burgers tem combo dentro do item: quem monta B.B.C. + batata + lata pelo burger paga R$ 61,97, e o Trio (R$ 47,98) só aparece em Super Ofertas. No rascunho do app, só 5 dos 11 burgers tinham combo. Agora <b>qualquer burger vira combo por +R$ 16</b>, e a economia é sempre a mesma: <b>R$ 5,80</b>. O cliente precisa escolher: nenhuma opção paga vem marcada (CDC, art. 39, III).",
        ref: "R3 Regra 1 · Sharpe & Staelin (2010) · CDC" },
      turbine: { title: "Turbine: upgrade do próprio lanche", tags: ["Preço de impulso", "12% a 20% do burger"],
        text: "O antigo Turbine vendia maionese e sobremesa. Agora é upgrade do burger: <b>bacon R$ 5,90, onion rings R$ 5,90 e cheddar R$ 4,90</b>, de 12% a 20% do preço do burger (menos nos Doubles e no Triple), e picles R$ 1,90 como impulso. Todos opcionais. A sobremesa ganhou passo próprio no modal.",
        ref: "Hayes & Dopson (adicionais como fração do item) · R3 Regra 6" },
    },
    sim: {
      base: 31.1, baseCmv: 0.22, orders: 600,
      levers: [
        { id: "combo", label: "Pedidos em que o burger vira combo", before: 45, after: 65, max: 90, value: 16, valueBefore: 17, cmv: 0.49, note: "combo em qualquer burger por +R$ 16" },
        { id: "dupla", label: "Pedidos com 2º burger (Dupla, Date Night)", before: 25, after: 30, max: 60, value: 23, valueBefore: 23, cmv: 0.35, note: "Dupla do Clube fixa na vitrine" },
        { id: "turbine", label: "Pedidos com adicional no modal (Turbine ou Vira Double)", before: 3, after: 15, max: 50, value: 7.5, cmv: 0.3, note: "Turbine virou upgrade do lanche; o Double pronto já entra no burger médio" },
        { id: "molho", label: "Pedidos com molho extra pago", before: 12, after: 20, max: 60, value: 6.9, valueBefore: 6.49, cmv: 0.25, note: "molho extra a R$ 6,90 no próprio item" },
        { id: "doce", label: "Pedidos com sobremesa", before: 5, after: 15, max: 40, value: 13, valueBefore: 11, cmv: 0.23, note: "“Fecha com uma sobremesa?” em todo burger, Pra Dois e Compartilhar" },
        { id: "extra", label: "Pedidos com acompanhamento extra", before: 8, after: 12, max: 40, value: 14, valueBefore: 13, cmv: 0.22, note: "Batata Cheddar e Bacon individual e Bites PP" },
      ],
      foot: "Premissas do cardápio final (take rates de hoje e meta de 90 dias), não resultado medido. A linha de base é a estimativa do plano da marca (R$ 45 a R$ 50) até entrarem os dados reais do Portal do Parceiro. Só o cardápio explica de +12% a +18% de ticket (cenário base: +16%); o resto da meta vem de mais pedidos no funil. O custo do Brigadeiro de brinde (R$ 2,02 nos pedidos acima de R$ 74,90) não entra nesta conta. O CMV do pedido sobe um pouco porque o combo tem CMV maior, mas a margem em reais por pedido sobe mais; a meta do plano é CMV consolidado até 28% em 90 dias, com o mix de Pra Compartilhar e molhos (CMV de 18% a 29%) como alavanca de ajuste.",
    },
    kpis: [
      { big: "100%", label: "dos burgers viram combo em 1 toque (no iFood hoje: 0 de 8)" },
      { big: "R$ 54,90", label: "Dupla do Clube: o formato nº 1 da rede (79.661 pedidos em 2025)" },
      { big: "10–13%", meta: true, label: "visita → pedido em 90 dias (hoje 6,8%; o cardápio leva a cerca de 10%, o resto depende da compra)" },
      { big: "R$ 55–62", meta: true, label: "ticket médio em 90 dias (hoje: R$ 45 a R$ 50, estimativa do plano)" },
    ],
  };
})();
