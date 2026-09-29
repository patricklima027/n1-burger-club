/* Gráfico do funil real (iFood, jan–mar/2026, soma da rede Tastefy por marca).
   Barras de contexto em cinza, destaque em vermelho N1 para a meta do Burger Club. */
(function () {
  "use strict";
  const root = document.getElementById("funnel-chart");
  if (!root) return;
  const rows = [
    { k: "Projeto Brasa Hamburgueria", v: 16.4, note: "hamburgueria especializada da rede", tone: "ctx" },
    { k: "N1 Chicken (marca-mãe)", v: 15.9, note: "ver item 62% · adicionar 48% · compra 55%", tone: "ctx" },
    { k: "Brasileirinho", v: 14.6, note: "comida brasileira", tone: "ctx" },
    { k: "Marmita Top", v: 13.7, note: "marmitas", tone: "ctx" },
    { k: "Loja de burger da rede sem diferenciação", v: 6.8, note: "mesmo cardápio, preço e foto da marca-mãe · ver item 46% · adicionar 36% · compra 44%", tone: "low" },
    { k: "N1 Burger Club · meta 90 dias", v: 11.5, lo: 10, hi: 13, note: "meta proposta: 10% a 13% (centro 11,5%)", tone: "goal" },
  ];
  const max = 18;
  const fmt = (n) => n.toFixed(1).replace(".", ",") + "%";
  root.innerHTML = `
    <div class="fc-title">Visita → pedido no iFood</div>
    <div class="fc-sub">Jan–mar/2026, soma da rede Tastefy por marca. Fonte: planilha “Conversão 2026 – Funil de vendas”.</div>
    <div class="fc-rows" role="list">${rows
      .map(
        (r, i) => `
      <div class="fc-row ${r.tone}" role="listitem" tabindex="0" data-i="${i}">
        <div class="fc-k">${r.k}</div>
        <div class="fc-track">
          ${r.lo ? `<i class="fc-range" style="left:${(r.lo / max) * 100}%;width:${((r.hi - r.lo) / max) * 100}%"></i>` : ""}
          <i class="fc-bar" style="width:${(r.v / max) * 100}%"></i>
        </div>
        <div class="fc-v">${r.lo ? `${fmt(r.lo)}–${fmt(r.hi)}` : fmt(r.v)}</div>
      </div>`
      )
      .join("")}</div>
    <div class="fc-tip" hidden></div>
    <details class="fc-table"><summary>Ver como tabela</summary>
      <table><thead><tr><th>Marca</th><th class="num">Visita → pedido</th><th>Observação</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${r.k}</td><td class="num">${r.lo ? `${fmt(r.lo)}–${fmt(r.hi)}` : fmt(r.v)}</td><td>${r.note}</td></tr>`).join("")}</tbody></table>
    </details>`;
  const tip = root.querySelector(".fc-tip");
  const show = (el, x, y) => {
    const r = rows[+el.dataset.i];
    tip.innerHTML = `<b>${r.k}</b><span>${r.lo ? `${fmt(r.lo)} a ${fmt(r.hi)}` : fmt(r.v)} das visitas viram pedido</span><em>${r.note}</em>`;
    tip.hidden = false;
    const box = root.getBoundingClientRect();
    tip.style.left = Math.min(x - box.left + 12, box.width - 260) + "px";
    tip.style.top = y - box.top + 12 + "px";
  };
  root.querySelectorAll(".fc-row").forEach((el) => {
    el.addEventListener("mousemove", (e) => show(el, e.clientX, e.clientY));
    el.addEventListener("mouseleave", () => (tip.hidden = true));
    el.addEventListener("focus", () => {
      const b = el.getBoundingClientRect();
      show(el, b.left + b.width / 2, b.top + b.height);
    });
    el.addEventListener("blur", () => (tip.hidden = true));
  });
})();
