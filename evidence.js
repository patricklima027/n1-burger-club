/* Seções de evidência do novo cardápio: números do hero, o que muda, regras de preço,
   antes × depois, engenharia (CMV), referências, livros, plano de teste e pendências. */
(function () {
  "use strict";
  const D = window.N1;
  const $ = (s) => document.querySelector(s);
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const pct = (v) => `${(v * 100).toFixed(1).replace(".", ",")}%`;
  const set = (sel, html) => {
    const el = $(sel);
    if (el) el.innerHTML = html;
  };

  /* ---------- números do hero ---------- */
  set("#kpis", D.kpis.map((k) => `<div class="kpi"><b>${k.big}${k.meta ? "<small>META</small>" : ""}</b><span>${k.label}</span></div>`).join(""));

  /* ---------- o que muda ---------- */
  set("#mudancas-lede", "Mantivemos as fichas técnicas, as fotos no padrão da marca e os combos com personalidade. Mudamos o que travava o pedido e o ticket, com uma regra por decisão.");
  const CH = [
    ["+R$ 16", "Qualquer burger vira combo", "Passo único no modal, economia sempre de R$ 5,80. No iFood hoje: 0 de 8 burgers com combo no item (no rascunho do app, 5 de 11).", "R3 Regra 1 · Sharpe & Staelin (2010)"],
    ["R$ 54,90", "Dupla do Clube, fixa", "2 The Original por R$ 27,45 cada. É o formato nº 1 da rede: 79.661 pedidos em 2025.", "Itens Vendidos 2025 (rede) · Nagle"],
    ["R$ 32,90", "The Crunch: novidade", "2 tiras de sassami, molho cheddar e picles. Zero insumo novo, CMV de 22%, no lugar do The Spicy enquanto o molho de pimenta não chega.", "Planilha CMV · plano de marca §6.3"],
    ["+R$ 10 a 11", "Vira Double no próprio modal", "Nos 7 burgers, pelo mesmo preço do Double pronto (The Garden e The Crunch ganham Double só no modal); o Triple B.B.C. é a âncora de teto.", "Sharpe, Staelin & Huber (2008)"],
    ["R$ 9,90 a 17,90", "Sobremesa em todo burger", "Passo “Fecha com uma sobremesa?” no modal, nada marcado, preço do cardápio. Combo The B.B.C. + Churros + Brigadeiro: R$ 73,80, e a sacola mostra que faltam R$ 1,10 para o brinde.", "iFood atual já pergunta a sobremesa · CDC art. 39, III"],
    ["R$ 6,90", "Molho em todo pedido", "Molho Verde da Casa como assinatura; R$ 6,90 no modal do burger e dos acompanhamentos, avulso R$ 8,90, Trio de Molhos R$ 19,90.", "Chick-fil-A, Cane's · R3 Regra 5"],
  ];
  set("#changes", CH.map((c, i) => `<article class="card glass rv"><div class="n">${c[0]}</div><h3>${c[1]}</h3><p>${c[2]}</p><div class="s">${c[3]}</div></article>`).join(""));

  /* ---------- regras de preço ---------- */
  const RULES = [
    ["+R$ 16", "combo em qualquer burger, economia fixa de R$ 5,80"],
    ["+R$ 10 a 13", "vira Double ou Triple no próprio modal, igual ao item pronto"],
    ["0", "item pago pré-marcado: sobremesa, Turbine e molho são sempre escolha do cliente"],
    ["R$ 74,90", "meta do brinde (Brigadeiro, custo R$ 2,02), visível na loja, no modal e na sacola"],
  ];
  set("#rules", RULES.map((r) => `<div class="rule"><b>${r[0]}</b><span>${r[1]}</span></div>`).join(""));

  /* ---------- antes × depois ---------- */
  const BA = [
    ["Nomes", "O Original, O B.B.C., O Verde, O Onion", "The Original, The B.B.C., The Garden, The Onion Storm, como no plano da marca", "Uma nomenclatura em todos os canais"],
    ["Combo", "5 de 11 burgers; acréscimo de R$ 15 a R$ 19; 17 etapas com uma só opção", "Qualquer burger, Double ou Triple vira combo por +R$ 16 no modal; economia fixa de R$ 5,80, mostrada no modal", "Regra única de bundling; menos toques até pedir"],
    ["“2 por”", "Não existia no clube", "Dupla do Clube R$ 54,90, fixa na vitrine; +R$ 18 com Batata Super (R$ 72,90) ou +R$ 35 vira Date Night", "Formato nº 1 da rede (79.661 pedidos em 2025); escada 54,90 → 72,90 → 89,90"],
    ["Pra dois", "Date Night R$ 96,90; Bacon Lover Duo e A Dupla B.B.C. com o mesmo papel", "Date Night R$ 89,90 com os burgers à escolha (com 2 B.B.C. sai R$ 97,90); Bacon Lover Duo e A Dupla B.B.C. (R$ 109,90) saem", "Topo da faixa de mercado (R$ 57 a R$ 90); uma opção por papel"],
    ["Galera", "O Bonde R$ 199,90", "O Bonde R$ 169,90, no teto do orçamento da galera, com molho extra a R$ 6,90; Os Monstros com 2 molhos inclusos", "CMV de 30,3% e até 11% abaixo de 4 combos individuais"],
    ["Novidade", "Nenhuma", "The Crunch (2 tiras, cheddar e picles) e Triple B.B.C.", "Zero insumo novo no The Crunch"],
    ["Doubles", "Double B.B.Q R$ 41,90, logo acima de R$ 40", "Double Smoke R$ 39,90; Vira Double no modal nos 7 burgers, pelo preço do Double pronto", "Dígito da esquerda (Thomas & Morwitz, 2005)"],
    ["Descrições", "O Onion “com molho cheddar” (a ficha usa maionese de bacon); “filé” para 2 tiras de sassami", "Texto igual à ficha técnica: tiras de sassami e o que vai de verdade", "Foto e texto fiéis evitam reclamação e cancelamento"],
    ["Turbine", "Maionese, churros e brigadeiro", "Bacon, onion rings e cheddar (R$ 4,90 a R$ 5,90) e picles (R$ 1,90)", "Upgrade do lanche, 12% a 20% do preço do burger"],
    ["Sobremesa", "Churros e brigadeiro só no Turbine; no iFood, “Qual sua sobremesa hoje?” com Brigadeiro a +R$ 7,99 (a planilha diz R$ 9,90)", "“Fecha com uma sobremesa?” em todo burger e nos combos: Churros + Brigadeiro R$ 17,90, Mini Churros R$ 11,90, Brigadeiro R$ 9,90; acima de R$ 74,90 o Brigadeiro vai de brinde", "Mesmo preço em todo lugar; o combo de doce vale mais que 2 doces avulsos"],
    ["Molhos", "R$ 6,49 no Turbine e R$ 8,90 na planilha", "R$ 6,90 no modal do burger e dos acompanhamentos; avulso R$ 8,90 (Cheddar Punch R$ 11,90); Trio de Molhos R$ 19,90", "Molho com nome vira marca; custa R$ 1,70"],
    ["Bebidas", "Coca lata R$ 11,90", "Coca lata R$ 9,90", "Mercado R$ 7,50 a R$ 9,90"],
    ["Selos", "“Mais pedido” no B.B.C., sem dado", "“Mais pedido” só no The Garden (14.045 pedidos da mesma receita na rede); B.B.C. vira carro-chefe", "Prova social só onde é verdade"],
    ["Calendário", "Brindes de até R$ 6,64 por pedido (Squad Saturday)", "Brinde grátis só até cerca de R$ 2 por pedido (Brigadeiro, R$ 2,02); o resto vira desconto anunciado", "Efeito do grátis só em insumo barato (Shampanier et al., 2007)"],
    ["5 to Free", "Contagem do zero até o 6º pedido", "Cliente já começa com 1 de 6; prêmio The Original (custo R$ 7,02), como no plano", "Progresso dotado (Nunes & Drèze, 2006)"],
  ];
  set("#ba-body", BA.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join(""));

  /* ---------- engenharia ---------- */
  const CATS = { "pra-dois": "Pra Dois", "pra-compartilhar": "Pra Compartilhar", burgers: "Chicken Burgers", doubles: "Doubles & Triple", combo: "Combos (via modal)", acomp: "Acompanhamentos", molhos: "Molhos", sobremesas: "Sobremesas", bebidas: "Bebidas" };
  const order = ["pra-dois", "pra-compartilhar", "burgers", "doubles", "combo", "acomp", "molhos", "sobremesas", "bebidas"];
  const rows = [];
  order.forEach((cat) => {
    const list = D.eng.filter((r) => r.cat === cat);
    if (!list.length) return;
    rows.push(`<tr class="grp-row"><td colspan="7">${CATS[cat]}</td></tr>`);
    list.forEach((r) => {
      const cmv = r.cost / r.price;
      rows.push(`<tr><td>${r.name}${r.isNew ? '<span class="new-dot">NOVO</span>' : ""}${r.est ? " *" : ""}</td><td>${CATS[r.cat]}</td>
        <td class="num">${brl(r.price)}</td><td class="num">${brl(r.cost)}</td><td class="num">${pct(cmv)}</td><td class="num">${brl(r.price - r.cost)}</td>
        <td><span class="role">${r.role || ""}</span></td></tr>`);
    });
  });
  set("#eng-body", rows.join(""));
  set("#eng-lede", "Custo com saco kraft, como na aba Precificação N1. Combo = burger com seu kraft + R$ 7,76 (batata individual, Coca lata e embalagens do combo: a diferença que bate 5 linhas de combo da planilha). Margem em reais (Kasavana &amp; Smith), não só em porcentagem. * custo extrapolado: precisa de custeio oficial. Papéis preliminares, com vendas da rede: reclassificar em D+60 com as vendas do Portal (popular = 70% ou mais da média da categoria; lucrativo = margem em R$ acima da média ponderada da categoria).");

  /* ---------- referências ---------- */
  const REFS = [
    ["EUA", "Raising Cane's", "4 itens e um molho só. Virou a 3ª maior rede de frango dos EUA, com vendas +32% em 2024.", "Cardápio enxuto: Bacon Lover Duo sai; Coca vira uma escolha dentro do item"],
    ["EUA", "Chick-fil-A", "O molho da casa nasceu numa loja e virou o condimento mais pedido da rede.", "A maionese verde vira Molho Verde da Casa, a assinatura do clube"],
    ["EUA", "Popeyes", "Classic e Spicy com o mesmo pão e picles; muda só o tempero.", "The Crunch muda o sabor com insumos que já estão na cozinha"],
    ["EUA", "Slim Chickens", "O combo de 5 tiras traz 2 molhos, o de 3 traz 1; o sanduíche sobe de preço por topping.", "Os Monstros com 2 molhos inclusos; Turbine com bacon e cheddar"],
    ["EUA", "Dave's Hot Chicken", "Níveis de picância com nome viraram conteúdo e motivo de volta.", "The Spicy fica pronto para entrar quando o molho de pimenta for confirmado"],
    ["Brasil", "Burger King Brasil", "“2x1” e “King em Dobro” como categorias fixas.", "Dupla do Clube fixa em Pra Dois"],
    ["Brasil", "KFC Brasil", "Adicionais de R$ 3 a R$ 6 (cheddar, onion, bacon) sobre a mesma base.", "Turbine de R$ 1,90 a R$ 5,90 nos burgers e doubles"],
    ["Brasil", "Poyos (Curitiba)", "Só frango, 2 tiras no sanduíche e combos nomeados por número de pessoas.", "Pra Dois e Pra Compartilhar com “serve X pessoas”"],
    ["Brasil", "Chicken Town (SP)", "Lata a R$ 7,99 no delivery.", "Coca lata sai de R$ 11,90 para R$ 9,90"],
    ["Brasil", "Jeronimo", "Escada de tamanho pela quantidade de proteína no mesmo produto.", "Vira Double e Triple no próprio modal"],
  ];
  set("#refs", REFS.map((r) => `<article class="ref-card glass rv"><div class="flag">${r[0]}</div><h3>${r[1]}</h3><p>${r[2]}</p><div class="take">${r[3]}</div></article>`).join(""));

  /* ---------- livros ---------- */
  const BOOKS = [
    ["Foundations of Menu Planning", "Daniel Traster · 2ª ed. · cap. 7, 8, 10 e 11", "Engenharia de cardápio pela margem em R$, zona quente no topo, poucos selos e preço anunciado verdadeiro.", "Mudou hoje: The Onion Storm (margem R$ 30,64) entra nos Destaques no lugar do The Crunch; selos de 13 para 8 itens; o “separado” do Date Night vai para R$ 114,50, a soma com o burger mais barato."],
    ["Practical Food and Beverage Cost Control", "Clement Ojugo · cap. 2, 10 e 13", "Ficha técnica e porção padrão; decidir por margem em R$, não pelo menor CMV %; venda sugestiva do item de maior margem.", "Mudou hoje: o Vira Double passa a ser a receita do Double pronto pelo mesmo preço; a lata avulsa sai da sacola quando o resgate do combo já traz a Coca."],
    ["Using Behavioral Science in Marketing", "Nancy Harhut · cap. 5, 11 e 12", "Escolha ativa no lugar do opt-in, ancoragem pelo preço mais alto e preço por unidade.", "Confirma o combo como escolha ativa, sem nada pago marcado. Mudou hoje: Os Monstros antes do O Bonde; Date Night e O Bonde mostram o preço por pessoa (R$ 44,95 e R$ 42,48)."],
    ["Decoded", "Phil Barden · 2ª ed. · cap. 2, 3 e 4", "Valor = recompensa − dor do preço; o pacote esconde o preço das partes; desconto permanente perde o efeito.", "Confirma o combo dentro do item, com a economia na tela, e o preço “separado” igual à soma real."],
    ["Delivering the Digital Restaurant", "Meredith Sandland e Carl Orsbourn · cap. 8, 11 e 12", "Combo e complemento programados no fluxo digital; adicional que vende é o da casa; menu curto no celular; foto real.", "Mudou hoje: a Mostarda sai do molho pago (6 opções, dentro do guia do iFood). Pendência: fotografar os itens com imagem de IA antes do iFood."],
    ["Restaurant Marketing: Competency Guide", "NRAEF ManageFirst · cap. 4 e 5", "Bundling e upselling sobem o ticket; desconto em excesso desvaloriza o preço cheio; promoção se mede antes, durante e depois.", "Confirma o combo em 100% dos burgers e a sobremesa no modal; reforça que todo “separado” é a soma real."],
    ["Successful Service Operations Management", "Richard Metters, Kathryn King-Metters e Madeleine Pullman · cap. 7, 9 e 12", "O gargalo define a capacidade; linha curta e modular; tirar trabalho do horário de pico.", "Confirma a porção padrão (2 tiras por camada) e o kit único do combo. Plano de pico da fritadeira vai para a operação."],
    ["How to Franchise Your Business", "Brian Duckett e Paul Monaghan · cap. 2, 14 e 16", "Formato fácil de aprender e de duplicar; uma regra só, documentada; margem bruta abaixo do esperado sinaliza desconto ou porção errada.", "Confirma a regra única de combo (+R$ 16) e a porção declarada em 13 de 13 burgers; o Vira Double com uma receita só por preço."],
  ];
  set("#books", BOOKS.map((b, i) => `<article class="panel book rv"><div class="b-n">${String(i + 1).padStart(2, "0")}</div><div><h3>${b[0]}</h3><div class="b-a">${b[1]}</div><p>${b[2]}</p><div class="take">${b[3]}</div></div></article>`).join("") +
    `<p class="src books-note rv">Não auditados: The Strategy and Tactics of Pricing (Nagle), porque o PDF é escaneado e não tem texto, e Trustworthy Online Controlled Experiments (Kohavi, Tang e Xu), em formato AZW3. A conta de empate e o plano de testes seguem o método desses autores pelos sumários das editoras. Os livros foram usados só como referência: nenhum trecho é reproduzido aqui.</p>`);

  /* ---------- plano de teste + pendências ---------- */
  set(
    "#test-plan",
    `<div class="panel glass rv"><h3>Métrica-mestra: margem por visita</h3>
      <p>Conversão × ticket × margem. Subir o ticket derrubando a conversão não conta como vitória.</p>
      <ul><li><b>Acompanhar:</b> visita → ver item → adicionar → pedido, ticket (média e mediana), % de burgers em combo, % de Double/Triple, attach de molho e sobremesa, recompra em 60 dias.</li>
      <li><b>Guardrails:</b> CMV consolidado até 28%, cancelamento, nota a partir de 4,7, tempo de preparo.</li>
      <li><b>Holdout:</b> 5% a 10% das visitas sem o “Peça também”, para medir o ganho real do upsell.</li></ul></div>
    <div class="panel glass rv"><h3>Ordem dos testes no app próprio</h3>
      <ul><li>1. Passo “Vira Combo N1?” com escolha ativa × sem o passo.</li>
      <li>2. Dupla do Clube a R$ 54,90 × R$ 49,90 (a R$ 49,90 o empate exige +43% de pares).</li>
      <li>3. “Peça também” na sacola × holdout.</li>
      <li>4. Meta do brinde em R$ 74,90 × R$ 69,90.</li>
      <li>5. Double Original a R$ 42,90 × R$ 39,90: o 2º preço do lado errado da dezena apontado na pesquisa (R3, Regra 4).</li>
      <li>6. Pra Dois antes × depois de Chicken Burgers na ordem das categorias.</li>
      <li>7. Passo “Fecha com uma sobremesa?” × sem o passo. Guardrails: conversão do modal, tempo até adicionar e attach de Turbine e molho (a sobremesa não pode roubar o molho).</li></ul>
      <p class="src">Conversão de 10% → 11% pede ~15 mil visitas por versão, meses de tráfego numa loja só: por isso a conversão é medida antes × depois (4 + 4 semanas no funil do Portal) e o A/B fica nas métricas do modal, de taxa alta (combo de 45% → 55%: ~390 modais abertos por versão). Cada teste cobre semanas cheias, com o pico das 20h.</p></div>`
  );
  set(
    "#pendencias",
    `<h3>Pendências antes do lançamento</h3><ul>
      <li><b>The Spicy:</b> o molho de pimenta extra forte está no plano como “já estocado”, mas não aparece na Lista de Compras nem na aba Pré-operação. Fica fora do cardápio e do calendário até Suprimentos confirmar.</li>
      <li><b>Spicy Wednesday:</b> o calendário do plano tem Spicy Wednesday; enquanto o The Spicy estiver pendente, a quarta vira Crunch Wednesday (The Crunch em destaque, 10% no combo).</li>
      <li><b>Triple B.B.C.:</b> custo de R$ 17,97 extrapolado da ficha do Double. Precisa de custeio oficial na planilha.</li>
      <li><b>The Smoke:</b> a foto mostra picles, mas a ficha técnica não tem. Decidir se entra (+R$ 0,19) ou se a foto é refeita.</li>
      <li><b>Double Day:</b> a 2ª camada custa de R$ 2,99 a R$ 4,74, acima do teto do brinde grátis (cerca de R$ 2) e dos R$ 2,55 do plano. Vira desconto anunciado em todos os sabores, sem camada grátis.</li>
      <li><b>Coca-Cola:</b> o plano de marca lista a lata a R$ 7,90 na rede (N1 Chicken, marca-mãe); aqui ela fica a R$ 9,90 (faixa de mercado) para manter a economia do combo. Testar R$ 7,90 × R$ 9,90.</li>
      <li><b>Sobremesa no modal:</b> criar o modificador na comanda e no PDV (sai junto do pedido, embalagem separada). A porção “pra dividir” do Mini Churros Super (R$ 32,90) precisa de gramatura oficial.</li>
      <li><b>Os Monstros:</b> a linha “A Monstra” da planilha (R$ 58,40) fica R$ 4,50 abaixo da soma das fichas da composição anunciada (4 Double Original + Mega + Coca grande). O site usa a soma (R$ 67,94, CMV 30,9%). Confirmar com quem mantém a planilha.</li>
      <li><b>Double The Garden e Double The Crunch:</b> existem só no modal; custo da 2ª camada estimado em +R$ 3,28. Custear na planilha.</li>
      <li><b>Selos:</b> “Mais pedido” no The Garden usa o dado da rede. Revisar todos os selos em D+60 com o dado do próprio clube.</li>
      <li><b>Imagens ilustrativas:</b> The Crunch, Triple B.B.C., Dupla do Clube, Chicken Bites, Churros + Brigadeiro e a capa foram geradas por IA a partir das fotos reais. Fotografar antes de publicar.</li></ul>`
  );

  /* ---------- KPI do simulador (compatibilidade) ---------- */
  const S = D.sim;
  let tb = S.base,
    ta = S.base;
  S.levers.forEach((l) => {
    tb += (l.before / 100) * (l.valueBefore || l.value);
    ta += (l.after / 100) * l.value;
  });
  const kt = $("#kpi-ticket");
  if (kt) kt.textContent = `+${((ta / tb - 1) * 100).toFixed(1).replace(".", ",")}%`;
})();
