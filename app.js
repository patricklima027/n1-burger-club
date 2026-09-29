/* N1 Burger Club — Cardápio 2.0 (protótipo navegável no layout do app Tastefy)
   Dados em menu-data.js (window.N1). Tudo local: nada é enviado a lugar nenhum. */
(function () {
  "use strict";
  const D = window.N1;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const byId = Object.fromEntries(D.items.map((i) => [i.id, i]));

  const state = { cart: [], open: null, sel: {}, qty: 1, obs: "", showWhy: true, lastCat: null };

  /* ---------- preço ---------- */
  const minExtras = (it) =>
    (it.groups || []).reduce((sum, g) => {
      if (!g.min || g.showIf) return sum;
      const cheapest = Math.min(...g.options.map((o) => o.price || 0));
      return sum + cheapest * g.min;
    }, 0);
  const startPrice = (it) => it.price + minExtras(it);
  const priceLine = (it, big) => {
    const p = startPrice(it);
    const pre = it.fromLabel ? `<span class="pfx">a partir de</span> ` : "";
    const old = it.old ? `<span class="old">separado <s>${brl(it.old)}</s></span>` : "";
    const save = it.old ? `<span class="save">economize ${brl(it.old - p)}</span>` : "";
    return `<span class="price ${big ? "big" : ""}">${pre}${brl(p)}</span>${old}${save}`;
  };

  /* ---------- loja ---------- */
  function renderStore() {
    const s = D.store;
    $("#store").innerHTML = `
      <div class="cover"><img src="${s.cover}" alt="Burgers do N1 Burger Club lado a lado" />
        <span class="cover-tag">Novo cardápio · protótipo · imagem ilustrativa</span></div>
      <div class="profile">
        <img class="logo" src="${s.logo}" alt="Logo N1 Burger Club" />
        <div class="p-name">${esc(s.name)}</div>
        <div class="p-sub">${esc(s.tagline)}</div>
        <div class="p-line"><span>★ ${esc(s.rating)}</span><span>${esc(s.eta)}</span><span>${esc(s.fee)}</span></div>
        <div class="club-strip">${esc(s.club)}</div>
        <div class="club-strip goal-strip">Pedido acima de ${brl(D.goal.value)} ganha ${esc(D.goal.gift)} · fora combos Pra Dois e Compartilhar</div>
      </div>`;
  }

  function badgeHtml(b) {
    if (!b) return "";
    return `<span class="badge b-${b.tone || "dark"}">${esc(b.text)}</span>`;
  }

  function renderFeatured() {
    const f = D.featured.map((id) => byId[id]).filter(Boolean);
    $("#featured").innerHTML = `
      <div class="sec-h"><h2>Destaques do clube</h2>${whyPin("destaques")}</div>
      <div class="hscroll">${f
        .map(
          (it) => `
        <button class="fcard" data-open="${it.id}">
          <div class="fimg"><img src="${it.img}" alt="" loading="lazy" />${badgeHtml(it.badge)}${it.ai ? '<span class="ai-tag">ilustrativa</span>' : ""}</div>
          <div class="fbody"><div class="fname">${esc(it.name)}</div>
          <div class="fprice">${priceLine(it)}</div></div>
        </button>`
        )
        .join("")}</div>`;
  }

  function whyPin(key) {
    return D.why[key] ? `<button class="why-pin" data-why="${key}" aria-label="Por que isso está aqui?">?</button>` : "";
  }

  function renderTabs() {
    $("#tabs").innerHTML = D.categories
      .map((c, i) => `<a href="#cat-${c.id}" data-cat="${c.id}" class="tab ${i === 0 ? "on" : ""}">${esc(c.short || c.name)}</a>`)
      .join("");
  }

  function itemRow(it) {
    return `
      <button class="row" data-open="${it.id}">
        <div class="r-txt">
          <div class="r-top">${badgeHtml(it.badge)}${it.tag ? `<span class="tagline">${esc(it.tag)}</span>` : ""}</div>
          <div class="r-name">${esc(it.name)}</div>
          <div class="r-desc">${esc(it.desc)}</div>
          ${it.serves ? `<div class="r-serves">${esc(it.serves)}</div>` : ""}
          <div class="r-price">${priceLine(it)}</div>
        </div>
        <div class="r-img"><img src="${it.img}" alt="" loading="lazy" />${it.ai ? '<span class="ai-tag">ilustrativa</span>' : ""}<span class="plus">+</span></div>
      </button>`;
  }

  function renderSections() {
    $("#sections").innerHTML = D.categories
      .map((c) => {
        const items = D.items.filter((i) => i.cat === c.id && !i.hidden);
        return `
        <section class="cat" id="cat-${c.id}" data-cat="${c.id}">
          <div class="sec-h"><div><h2>${esc(c.name)}</h2>${c.sub ? `<p class="sec-sub">${esc(c.sub)}</p>` : ""}</div>${whyPin(c.id)}</div>
          <div class="rows">${items.map(itemRow).join("")}</div>
        </section>`;
      })
      .join("");
  }

  /* ---------- scrollspy dentro do app ---------- */
  function setupSpy() {
    const scroller = $("#app-scroll");
    const tabs = $("#tabs");
    const onScroll = () => {
      const top = scroller.getBoundingClientRect().top + 120;
      let cur = D.categories[0].id;
      for (const sec of $$(".cat", scroller)) if (sec.getBoundingClientRect().top <= top) cur = sec.dataset.cat;
      const featuredVisible = $("#featured").getBoundingClientRect().bottom > top;
      $$(".tab", tabs).forEach((t) => t.classList.toggle("on", t.dataset.cat === cur));
      const on = $(".tab.on", tabs);
      if (on && state.lastCat !== cur) {
        tabs.scrollTo({ left: on.offsetLeft - 16, behavior: "smooth" });
      }
      const key = featuredVisible ? "destaques" : cur;
      if (state.lastCat !== key) {
        state.lastCat = key;
        showWhy(key, false);
      }
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    tabs.addEventListener("click", (e) => {
      const a = e.target.closest("a.tab");
      if (!a) return;
      e.preventDefault();
      const sec = $(`#cat-${a.dataset.cat}`);
      scroller.scrollTo({ top: sec.offsetTop - tabs.offsetHeight - 6, behavior: "smooth" });
    });
    onScroll();
  }

  /* ---------- painel "por quê" ---------- */
  function showWhy(key, flash) {
    const w = D.why[key];
    const box = $("#why-now");
    if (!w || !box) return;
    box.innerHTML = `
      <div class="wn-eyebrow">Você está vendo</div>
      <div class="wn-title">${esc(w.title)}</div>
      <p class="wn-text">${w.text}</p>
      ${w.tags ? `<div class="wn-tags">${w.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
      ${w.ref ? `<div class="wn-ref">Base: ${esc(w.ref)}</div>` : ""}`;
    if (flash) {
      box.classList.remove("flash");
      void box.offsetWidth;
      box.classList.add("flash");
    }
  }

  function popWhy(key, anchor) {
    const w = D.why[key];
    if (!w) return;
    showWhy(key, true);
    // No celular (sem painel lateral) abre um balão dentro do app.
    if (window.matchMedia("(min-width: 900px)").matches) return;
    const pop = $("#why-pop");
    pop.innerHTML = `<div class="wp-card"><button class="x" data-close-pop aria-label="Fechar">×</button>
      <div class="wn-eyebrow">Por que isso está aqui</div><div class="wn-title">${esc(w.title)}</div>
      <p class="wn-text">${w.text}</p>${w.tags ? `<div class="wn-tags">${w.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}</div>`;
    pop.hidden = false;
  }

  /* ---------- item sheet ---------- */
  function openItem(id) {
    const it = byId[id];
    if (!it) return;
    state.open = it;
    state.sel = {};
    state.qty = 1;
    state.obs = "";
    (it.groups || []).forEach((g) => {
      if (g.preset) state.sel[g.id] = { ...g.preset };
    });
    renderSheet();
    $("#sheet").hidden = false;
    $("#sheet .sh-body").scrollTop = 0;
    if (it.why) showWhy(it.why, true);
  }
  const isVisible = (g) => {
    if (!g.showIf) return true;
    const sel = state.sel[g.showIf.g] || {};
    return g.showIf.any.some((o) => (sel[o] || 0) > 0);
  };
  const visGroups = (it) => (it.groups || []).filter(isVisible);
  const groupCount = (g) => Object.values(state.sel[g.id] || {}).reduce((a, b) => a + b, 0);
  const extrasTotal = (it) =>
    visGroups(it).reduce((sum, g) => sum + g.options.reduce((s, o) => s + (o.price || 0) * ((state.sel[g.id] || {})[o.id] || 0), 0), 0);
  const complete = (it) => visGroups(it).every((g) => !g.min || groupCount(g) >= g.min);

  function groupSub(g) {
    if (!g.min) return g.max === 1 ? "Opcional · escolha 1" : `Opcional · até ${g.max}`;
    if (g.min === g.max) return `Escolha ${g.min} ${g.min === 1 ? "opção" : "opções"}`;
    return `Escolha de ${g.min} a ${g.max}`;
  }

  const dessertSel = (it) => {
    const g = visGroups(it).find((x) => x.id === "sobremesa");
    return g ? g.options.reduce((s, o) => s + (o.price || 0) * ((state.sel[g.id] || {})[o.id] || 0), 0) : 0;
  };
  const goalLeftBefore = (it) => D.goal.value - (goalBase() + (goalSkip(it) ? 0 : (it.price + extrasTotal(it) - dessertSel(it)) * state.qty));
  const sobHint = (it, g) => {
    const left = goalLeftBefore(it);
    const per = state.qty > 1 && g.max === 1 ? " · 1 por burger" : "";
    if (goalSkip(it)) return g.hint;
    if (left <= 0) return `Opcional · ${D.goal.gift} já vai de brinde neste pedido${per}`;
    return `${g.hint}${per}`;
  };
  function renderSheet() {
    const it = state.open;
    const body = $("#sheet .sh-body");
    const groups = visGroups(it);
    body.innerHTML = `
      <div class="sh-img"><img src="${it.img}" alt="" />${badgeHtml(it.badge)}${it.ai ? '<span class="ai-tag big">Imagem ilustrativa</span>' : ""}</div>
      <div class="sh-pad">
        <h3 class="sh-name">${esc(it.name)}</h3>
        <p class="sh-desc">${esc(it.long || it.desc)}</p>
        ${it.serves ? `<div class="r-serves">${esc(it.serves)}</div>` : ""}
        <div class="sh-price">${priceLine(it, true)}</div>
        ${groups
          .map((g) => {
            const c = groupCount(g);
            const ok = !g.min || c >= g.min;
            return `
          <section class="grp ${g.style === "cards" ? "grp-cards" : ""} ${g.highlight ? "grp-hl" : ""}" data-g="${g.id}">
            <div class="grp-h"><div><div class="grp-t">${esc(g.title)}</div><div class="grp-s">${esc(g.id === "sobremesa" ? sobHint(it, g) : g.hint || groupSub(g))}</div></div>
              <div class="grp-st">${g.min ? (ok ? `<span class="ok">✓ OK</span>` : `<span class="req">OBRIGATÓRIO</span>`) : `<span class="cnt">${c}/${g.max}</span>`}</div></div>
            <div class="opts">${g.options
              .map((o) => {
                const n = (state.sel[g.id] || {})[o.id] || 0;
                const radio = g.max === 1 && !g.addon;
                const priceTxt = o.price ? `+ ${brl(o.price)}` : o.priceNote || (g.min && o.id !== "solo" ? "incluso" : "");
                const left = g.id === "sobremesa" && !goalSkip(it) ? goalLeftBefore(it) : 1e9;
                const goalTag = g.id === "sobremesa" && left > 0 && left < 1e9 && o.price * state.qty >= left ? '<span class="s-goal">ganha o brinde</span>' : "";
                const oDesc = g.id === "sobremesa" && left <= 0 && o.id === "brigadeiro" ? "Mais 1 · o primeiro já vai de brinde" : o.desc;
                return `
              <div class="opt ${n ? "on" : ""}" data-g="${g.id}" data-o="${o.id}">
                ${o.img ? `<span class="imgw"><img class="o-img" src="${o.img}" alt="" loading="lazy" />${o.ai ? '<span class="ai-mini">IA</span>' : ""}</span>` : ""}
                <div class="o-txt"><div class="o-name">${esc(o.name)}</div>${oDesc ? `<div class="o-desc">${esc(oDesc)}</div>` : ""}
                  <div class="o-price">${esc(priceTxt)}${o.old ? ` <s>${brl(o.old)}</s>` : ""}${goalTag}</div></div>
                ${
                  radio
                    ? `<button class="radio ${n ? "on" : ""}" data-act="toggle" aria-label="Selecionar ${esc(o.name)}"></button>`
                    : n
                    ? `<div class="stepper"><button data-act="dec" aria-label="Menos">−</button><span>${n}</span><button data-act="inc" aria-label="Mais" ${c >= g.max || (o.max && n >= o.max) ? "disabled" : ""}>+</button></div>`
                    : `<button class="add" data-act="inc" aria-label="Adicionar ${esc(o.name)}" ${c >= g.max && !(g.addon && g.max === 1) ? "disabled" : ""}>+</button>`
                }
              </div>`;
              })
              .join("")}</div>
          </section>`;
          })
          .join("")}
        <label class="obs-l" for="obs">Alguma observação?</label>
        <textarea id="obs" rows="2" maxlength="140" placeholder="Ex.: sem picles, molho à parte">${esc(state.obs)}</textarea>
      </div>`;
    updateSheetFooter();
  }

  function updateSheetFooter() {
    const it = state.open;
    const total = (it.price + extrasTotal(it)) * state.qty;
    const ok = complete(it);
    $("#qty-n").textContent = state.qty;
    const btn = $("#add-btn");
    btn.disabled = !ok;
    btn.innerHTML = ok ? `Adicionar <b>${brl(total)}</b>` : `Escolha as opções · ${brl(Math.max(startPrice(it), it.price + extrasTotal(it)) * state.qty)}`;
  }

  function refreshSheet() {
    const sc = $("#sheet .sh-body");
    const keep = sc.scrollTop;
    renderSheet();
    sc.scrollTop = keep;
  }

  function setOpt(gid, oid, delta) {
    const it = state.open;
    const g = it.groups.find((x) => x.id === gid);
    const cur = { ...(state.sel[gid] || {}) };
    if (g.max === 1) {
      const was = cur[oid] || 0;
      Object.keys(cur).forEach((k) => (cur[k] = 0));
      cur[oid] = was && !g.min ? 0 : 1;
    } else {
      const others = Object.entries(cur).reduce((s, [k, v]) => s + (k === oid ? 0 : v), 0);
      const o = g.options.find((x) => x.id === oid);
      cur[oid] = Math.max(0, Math.min((cur[oid] || 0) + delta, g.max - others, o.max || g.max));
    }
    state.sel[gid] = cur;
    const filled = Object.values(cur).reduce((a, b) => a + b, 0) >= g.max;
    const scroller = $("#sheet .sh-body");
    const keep = scroller.scrollTop;
    renderSheet();
    scroller.scrollTop = keep;
    if (g.onPick) g.onPick(state, cur);
    // auto-avanço estilo iFood: grupo cheio → rola até o próximo que falta
    if (filled && delta > 0) {
      const vg = visGroups(it);
      const idx = vg.indexOf(g);
      const next = vg.slice(idx + 1).find((x) => groupCount(x) < (x.min || x.max));
      const el = next && $(`.grp[data-g="${next.id}"]`, scroller);
      if (el) scroller.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    }
    if (g.why) showWhy(g.why, true);
  }

  function addToCart() {
    const it = state.open;
    if (!complete(it)) return;
    const opts = [];
    visGroups(it).forEach((g) =>
      g.options.forEach((o) => {
        const n = (state.sel[g.id] || {})[o.id] || 0;
        if (n) opts.push({ g: g.id, id: o.id, name: o.name, n, price: o.price || 0 });
      })
    );
    const before = goalBase();
    state.cart.push({ id: it.id, name: it.name, img: it.img, unit: it.price + extrasTotal(it), qty: state.qty, opts, obs: state.obs.trim() });
    closeSheet();
    renderBag(true);
    toast(before < D.goal.value && goalBase() >= D.goal.value ? `Adicionado · você ganhou ${D.goal.gift}` : "Adicionado à sacola");
  }
  function closeSheet() {
    $("#sheet").hidden = true;
    state.open = null;
  }

  /* ---------- sacola ---------- */
  const cartTotal = () => state.cart.reduce((s, l) => s + l.unit * l.qty, 0);
  const goalSkip = (it) => (D.goal.skip || []).includes(it.cat);
  const goalBase = () => state.cart.reduce((s, l) => s + (goalSkip(byId[l.id] || {}) ? 0 : l.unit * l.qty), 0);
  const cartCount = () => state.cart.reduce((s, l) => s + l.qty, 0);
  const cartHas = (pred) => state.cart.some((l) => pred(byId[l.id], l));

  function renderBag(bump) {
    const bar = $("#bag");
    const n = cartCount();
    bar.hidden = n === 0;
    if (!n) return;
    $("#bag-n").textContent = `${n} ${n === 1 ? "item" : "itens"}`;
    $("#bag-t").textContent = brl(cartTotal());
    const goal = D.goal;
    const left = goal.value - goalBase();
    $("#bag-goal").innerHTML = !goalBase() && state.cart.length ? "" :
      left > 0 ? `Faltam <b>${brl(left)}</b> para ganhar ${esc(goal.gift)}` : `<b>Você ganhou ${esc(goal.gift)}</b> neste pedido`;
    $("#bag-bar-fill").style.width = `${Math.min(100, (goalBase() / goal.value) * 100)}%`;
    if (bump) {
      bar.classList.remove("bump");
      void bar.offsetWidth;
      bar.classList.add("bump");
    }
  }

  function suggestions() {
    const out = [];
    const inG = (l, ids) => l.opts.some((o) => ids.includes(o.g));
    const won = goalBase() >= D.goal.value;
    // enquanto um resgate (combo ou Date Night) está na tela, a lata avulsa não concorre com ele
    const rescueOn = state.cart.some((l) => (l.id === "dupla-clube" && !l.opts.some((o) => o.g === "completar")) || (["burgers", "doubles"].includes(byId[l.id].cat) && l.opts.some((o) => o.g === "combo" && o.id === "solo")));
    if (!rescueOn && !cartHas((it, l) => it.cat === "bebidas" || l.opts.some((o) => /coca/i.test(o.name)))) out.push("coca-lata");
    if (!cartHas((it, l) => it.cat === "sobremesas" || inG(l, ["sobremesa"]))) out.push(...(won ? D.cross.dessertWon : D.cross.dessert));
    const hasVerde = cartHas((it, l) => ["the-original", "the-garden", "double-original", "dupla-clube", "a-monstra", "verde-n1"].includes(it.id) || l.opts.some((o) => o.id === "verde"));
    if (!cartHas((it, l) => it.cat === "molhos" || inG(l, ["molho"]))) out.push(hasVerde ? D.cross.sauceAlt : D.cross.sauce);
    if (!cartHas((it) => it.id === "chicken-bites" || it.id === "bites-pp")) out.push(D.cross.bites);
    let list = [...new Set(out)].map((id) => byId[id]).filter(Boolean);
    // quando faltam até R$ 17,90, o 1º card é o mais barato que fecha a meta e ainda deixa mais margem que o custo do brinde
    const left = D.goal.value - goalBase();
    const closes = (it) => startPrice(it) >= left && startPrice(it) - (it.cost || 0) > 2.02;
    const cl = left > 0 && left <= 17.9 ? list.filter(closes).sort((a, b) => startPrice(a) - startPrice(b))[0] : null;
    if (cl) list = [cl, ...list.filter((x) => x !== cl)];
    return list.slice(0, 4).map((it) => ({ it, gift: it === cl }));
  }

  function openCart() {
    const box = $("#cart .sh-body");
    const sub = cartTotal();
    const fee = D.store.feeValue;
    const goal = D.goal;
    const gb = goalBase();
    const gift = gb >= goal.value;
    const sug = suggestions();
    const duplaIdx = state.cart.findIndex((l) => l.id === "dupla-clube" && !l.opts.some((o) => o.g === "completar"));
    const rescueIdx = duplaIdx >= 0 ? -1 : state.cart.findIndex((l) => ["burgers", "doubles"].includes(byId[l.id].cat) && l.opts.some((o) => o.g === "combo" && (o.id === "solo" || o.name === "Só o lanche")));
    box.innerHTML = `
      <div class="sh-pad">
        <h3 class="sh-name">Sua sacola</h3>
        <div class="c-goal ${gift ? "won" : ""}"><div class="c-goal-t">${
          gift ? `Pedido acima de ${brl(goal.value)}: ${esc(goal.gift)} vai junto, por nossa conta.` : `Faltam <b>${brl(goal.value - gb)}</b> para ganhar ${esc(goal.gift)}${gb < sub ? " <small>(combos Pra Dois e Compartilhar não contam)</small>" : ""}`
        }</div><div class="c-goal-bar"><i style="width:${Math.min(100, (gb / goal.value) * 100)}%"></i></div></div>
        <ul class="lines">${state.cart
          .map(
            (l, i) => `
          <li class="line"><span class="imgw"><img src="${l.img}" alt="" />${(byId[l.id] || {}).ai ? '<span class="ai-mini">IA</span>' : ""}</span><div class="l-txt"><div class="l-name">${esc(l.name)}</div>
            ${(() => {
              const mods = l.opts.filter((o) => o.g !== "sobremesa");
              const doces = l.opts.filter((o) => o.g === "sobremesa");
              const fmt = (o) => `${o.n * (o.g === "sobremesa" ? l.qty : 1) > 1 ? o.n * (o.g === "sobremesa" ? l.qty : 1) + "× " : ""}${esc(o.name)}`;
              return (mods.length ? `<div class="l-opts">${mods.map(fmt).join(" · ")}</div>` : "") + (doces.length ? `<div class="l-opts l-dessert">+ Sobremesa: ${doces.map(fmt).join(" · ")}</div>` : "");
            })()}
            ${l.obs ? `<div class="l-opts">Obs.: ${esc(l.obs)}</div>` : ""}
            <div class="l-price">${brl(l.unit * l.qty)}</div></div>
            <div class="stepper sm"><button data-line="${i}" data-d="-1" aria-label="Menos">−</button><span>${l.qty}</span><button data-line="${i}" data-d="1" aria-label="Mais">+</button></div></li>`
          )
          .join("")}${gift ? `<li class="line gift"><span class="imgw"><img src="img/hd/brigadeiro.jpg" alt="" /></span><div class="l-txt"><div class="l-name">${esc(goal.gift)} · brinde</div><div class="l-price">R$ 0,00</div></div></li>` : ""}</ul>
        ${
          duplaIdx >= 0
            ? (() => { const l = state.cart[duplaIdx]; return `<div class="rescue"><img src="img/hd/date-night.jpg" alt="" /><span><b>Complete a dupla: vira Date Night</b><br>+ Batata Frita Crocante Super pra dividir + 2 Cocas lata por +${brl(35 * l.qty)} · economize ${brl(19.7 * l.qty)}</span><div class="rs-btns"><button data-rescue-dupla="${duplaIdx}" data-drink="coca">Date Night com 2 Coca-Cola · +${brl(35 * l.qty)}</button><button data-rescue-dupla="${duplaIdx}" data-drink="mix">Com 1 Coca e 1 sem açúcar · +${brl(35 * l.qty)}</button></div></div>`; })()
            : rescueIdx >= 0
            ? (() => { const l = state.cart[rescueIdx]; return `<div class="rescue"><img src="img/novo/thumb-batata-coca.jpg" alt="" /><span><b>Complete o ${esc(l.name)} como combo</b><br>+ Batata Frita Crocante Individual + Coca lata por +${brl(16 * l.qty)}${l.qty > 1 ? ` (${l.qty} combos)` : ""} · economize ${brl(5.8 * l.qty)}</span><div class="rs-btns"><button data-rescue="${rescueIdx}" data-drink="coca">Combo com Coca-Cola · +${brl(16 * l.qty)}</button><button data-rescue="${rescueIdx}" data-drink="zero">Combo com Coca sem açúcar · +${brl(16 * l.qty)}</button></div></div>`; })()
            : ""
        }
        ${
          sug.length
            ? `<div class="sec-h small"><h4>Peça também</h4>${whyPin("carrinho")}</div>
        <div class="hscroll sug">${sug
          .map(
            ({ it, gift: g }) => `<button class="scard" data-quick="${it.id}"><span class="imgw sc"><img src="${it.img}" alt="" loading="lazy" />${it.ai ? '<span class="ai-tag">ilustrativa</span>' : ""}</span><div class="s-name">${esc(it.name)}</div><div class="s-price">${brl(startPrice(it))}</div>${g ? '<span class="s-goal">libera o brinde</span>' : ""}<span class="s-add">+ adicionar</span></button>`
          )
          .join("")}</div>`
            : ""
        }
        <dl class="totals"><div><dt>Subtotal</dt><dd>${brl(sub)}</dd></div><div><dt>Taxa de entrega <small>(exemplo)</small></dt><dd>${brl(fee)}</dd></div>
          <div class="grand"><dt>Total</dt><dd>${brl(sub + fee)}</dd></div></dl>
      </div>`;
    $("#cart").hidden = false;
    showWhy("carrinho", true);
  }

  function quickAdd(id) {
    const it = byId[id];
    const req = (it.groups || []).filter((g) => g.min);
    const presetOk = req.every((g) => g.preset && Object.values(g.preset).reduce((a, b) => a + b, 0) >= g.min);
    if (req.length && !presetOk) {
      $("#cart").hidden = true;
      openItem(id);
      return;
    }
    const opts = [];
    req.forEach((g) => Object.entries(g.preset || {}).forEach(([oid, n]) => {
      const o = g.options.find((x) => x.id === oid);
      opts.push({ g: g.id, id: oid, name: o.name, n, price: o.price || 0 });
    }));
    const unit = it.price + opts.reduce((s, o) => s + o.price * o.n, 0);
    const before = goalBase();
    state.cart.push({ id: it.id, name: it.name, img: it.img, unit, qty: 1, opts, obs: "" });
    renderBag(true);
    openCart();
    toast(before < D.goal.value && goalBase() >= D.goal.value ? `${it.name} adicionado · você ganhou ${D.goal.gift}` : `${it.name} adicionado`);
  }

  function checkout() {
    const sub = cartTotal();
    const box = $("#cart .sh-body");
    const gift = sub >= D.goal.value;
    box.innerHTML = `<div class="sh-pad done"><div class="done-ico">✓</div><h3 class="sh-name">Pedido simulado</h3>
      <p class="sh-desc">Este é um protótipo: nenhum pedido foi enviado. Ticket deste pedido: <b>${brl(sub)}</b>${gift ? ` + ${esc(D.goal.gift)} de brinde` : ""}.</p>
      <p class="sh-desc">Compare com o ticket médio simulado do cardápio atual no painel ao lado.</p>
      <button class="btn-y" data-reset>Começar outro pedido</button></div>`;
    $("#cart-foot").hidden = true;
  }

  /* ---------- toast ---------- */
  let tt;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(tt);
    tt = setTimeout(() => (t.hidden = true), 1600);
  }

  /* ---------- busca ---------- */
  function setupSearch() {
    const inp = $("#q");
    inp.addEventListener("input", () => {
      const q = inp.value.trim().toLowerCase();
      $$(".row", $("#sections")).forEach((r) => {
        const it = byId[r.dataset.open];
        r.hidden = q && !`${it.name} ${it.desc}`.toLowerCase().includes(q);
      });
      $$(".cat").forEach((s) => (s.hidden = q && !$$(".row", s).some((r) => !r.hidden)));
      $("#featured").hidden = !!q;
    });
  }

  /* ---------- eventos ---------- */
  function wire() {
    document.addEventListener("click", (e) => {
      const t = e.target;
      const pin = t.closest("[data-why]");
      if (pin) {
        e.stopPropagation();
        popWhy(pin.dataset.why, pin);
        return;
      }
      if (t.closest("[data-close-pop]") || t.id === "why-pop") {
        $("#why-pop").hidden = true;
        return;
      }
      const op = t.closest("[data-open]");
      if (op) return openItem(op.dataset.open);
      const optEl = t.closest(".opt");
      if (optEl && state.open) {
        const act = t.closest("[data-act]")?.dataset.act || (t.closest(".o-img,.o-txt,.imgw") ? "row" : null);
        const g = state.open.groups.find((x) => x.id === optEl.dataset.g);
        if (act === "row") return setOpt(optEl.dataset.g, optEl.dataset.o, g.max === 1 ? 1 : 1);
        if (act === "toggle" || act === "inc") return setOpt(optEl.dataset.g, optEl.dataset.o, 1);
        if (act === "dec") return setOpt(optEl.dataset.g, optEl.dataset.o, -1);
      }
      if (t.closest("[data-close-sheet]")) return closeSheet();
      if (t.closest("#qty-m")) {
        state.qty = Math.max(1, state.qty - 1);
        return refreshSheet();
      }
      if (t.closest("#qty-p")) {
        state.qty += 1;
        return refreshSheet();
      }
      if (t.closest("#add-btn")) return addToCart();
      if (t.closest("#bag")) return openCart();
      if (t.closest("[data-close-cart]")) {
        $("#cart").hidden = true;
        $("#cart-foot").hidden = false;
        return;
      }
      const ln = t.closest("[data-line]");
      if (ln) {
        const l = state.cart[+ln.dataset.line];
        l.qty += +ln.dataset.d;
        if (l.qty <= 0) state.cart.splice(+ln.dataset.line, 1);
        renderBag();
        if (!state.cart.length) {
          $("#cart").hidden = true;
          return;
        }
        return openCart();
      }
      const rd = t.closest("[data-rescue-dupla]");
      if (rd) {
        const l = state.cart[+rd.dataset.rescueDupla];
        l.opts = l.opts.filter((o) => o.g !== "completar" && o.g !== "bebida");
        l.opts.push({ g: "completar", id: "dn", name: "+ Batata Frita Crocante Super pra dividir + 2 Cocas lata", n: 1, price: 35 });
        if (rd.dataset.drink === "mix") l.opts.push({ g: "bebida", id: "coca", name: "Coca-Cola lata", n: 1, price: 0 }, { g: "bebida", id: "zero", name: "Coca-Cola sem açúcar lata", n: 1, price: 0 });
        else l.opts.push({ g: "bebida", id: "coca", name: "Coca-Cola lata", n: 2, price: 0 });
        l.unit += 35;
        renderBag(true);
        toast("Virou Date Night");
        return openCart();
      }
      const rs = t.closest("[data-rescue]");
      if (rs) {
        const l = state.cart[+rs.dataset.rescue];
        const zero = rs.dataset.drink === "zero";
        l.opts = l.opts.filter((o) => o.g !== "combo" && o.g !== "bebida");
        l.opts.unshift({ g: "combo", id: "combo", name: "Combo: + Batata Frita Crocante Individual + Coca lata", n: 1, price: 16 }, { g: "bebida", id: zero ? "zero" : "coca", name: zero ? "Coca-Cola sem açúcar lata" : "Coca-Cola lata", n: 1, price: 0 });
        l.unit += 16;
        renderBag(true);
        toast("Virou combo");
        return openCart();
      }
      const qa = t.closest("[data-quick]");
      if (qa) return quickAdd(qa.dataset.quick);
      if (t.closest("#checkout")) return checkout();
      if (t.closest("[data-reset]")) {
        state.cart = [];
        renderBag();
        $("#cart").hidden = true;
        $("#cart-foot").hidden = false;
        return;
      }
      const jump = t.closest("[data-jump]");
      if (jump) {
        const sec = $(`#cat-${jump.dataset.jump}`);
        $("#app-scroll").scrollTo({ top: sec.offsetTop - $("#tabs").offsetHeight - 6, behavior: "smooth" });
      }
    });
    document.addEventListener("input", (e) => {
      if (e.target.id === "obs") state.obs = e.target.value;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!$("#why-pop").hidden) $("#why-pop").hidden = true;
      else if (!$("#sheet").hidden) closeSheet();
      else if (!$("#cart").hidden) $("#cart").hidden = true;
    });
  }


  /* ---------- simulador de ticket ---------- */
  function setupSim() {
    const S = D.sim;
    const root = $("#sim");
    if (!root) return;
    root.innerHTML = `
      <div class="sim-grid">
        <div class="sim-ctrls">${S.levers
          .map(
            (l) => `
          <div class="lev"><label for="lev-${l.id}">${esc(l.label)}</label>
            <div class="lev-row"><input type="range" id="lev-${l.id}" min="0" max="${l.max}" step="1" value="${l.after}" />
            <output id="out-${l.id}">${l.after}%</output></div>
            <div class="lev-note">Hoje (premissa): ${l.before}% · ${esc(l.note)}</div></div>`
          )
          .join("")}
          <div class="lev"><label for="lev-orders">Pedidos por mês numa loja (exemplo)</label>
            <div class="lev-row"><input type="range" id="lev-orders" min="100" max="2000" step="50" value="${S.orders}" /><output id="out-orders">${S.orders}</output></div></div>
        </div>
        <div class="sim-out">
          <div class="so-row"><span>Ticket médio · cardápio atual</span><b id="t-before"></b></div>
          <div class="so-row hi"><span>Ticket médio · novo cardápio</span><b id="t-after"></b></div>
          <div class="so-delta" id="t-delta"></div>
          <div class="so-row"><span>Margem bruta por pedido (preço − CMV)</span><b id="t-margin"></b></div>
          <div class="so-row"><span>CMV estimado do pedido médio</span><b id="t-cmv"></b></div>
          <div class="so-row"><span>Faturamento extra por mês</span><b id="t-month"></b></div>
          <p class="so-foot">${S.foot}</p>
        </div>
      </div>`;
    const calc = (vals, before) => {
      let t = S.base;
      S.levers.forEach((l) => (t += (vals[l.id] / 100) * (before ? l.valueBefore || l.value : l.value)));
      return t;
    };
    const costCalc = (vals, before) => {
      let c = S.base * S.baseCmv;
      S.levers.forEach((l) => (c += (vals[l.id] / 100) * (before ? l.valueBefore || l.value : l.value) * l.cmv));
      return c;
    };
    const pctTxt = (v) => `${(v * 100).toFixed(1).replace(".", ",")}%`;
    const upd = () => {
      const before = {}, after = {};
      S.levers.forEach((l) => {
        before[l.id] = l.before;
        after[l.id] = +$(`#lev-${l.id}`).value;
        $(`#out-${l.id}`).textContent = `${after[l.id]}%`;
      });
      const orders = +$("#lev-orders").value;
      $("#out-orders").textContent = orders;
      const tb = calc(before, true), ta = calc(after, false);
      $("#t-before").textContent = brl(tb);
      $("#t-after").textContent = brl(ta);
      const pct = ((ta / tb - 1) * 100).toFixed(1).replace(".", ",");
      $("#t-delta").textContent = `${ta >= tb ? "+" : ""}${pct}% no ticket médio`;
      $("#t-month").textContent = brl((ta - tb) * orders);
      const cb = costCalc(before, true), ca = costCalc(after, false);
      const mb = tb - cb, ma = ta - ca;
      $("#t-margin").textContent = `${brl(mb)} → ${brl(ma)} (${ma >= mb ? "+" : ""}${brl(ma - mb)})`;
      $("#t-cmv").textContent = `${pctTxt(cb / tb)} → ${pctTxt(ca / ta)}`;
    };
    root.addEventListener("input", upd);
    upd();
  }

  /* ---------- boot ---------- */
  renderStore();
  renderFeatured();
  renderTabs();
  renderSections();
  setupSpy();
  setupSearch();
  setupSim();
  wire();
  renderBag();
})();
