/* Direção de scroll do site:
   1) HERO — a manchete "Apresentamos o novo N1 Burger Club." despedaça no primeiro scroll,
      a câmera mergulha no celular do cliente até o cardápio ficar grande e usável.
   2) FILME — o vídeo cresce de um cartão até ocupar a tela inteira.
   3) Faixas seguintes — revelação suave e paralaxe.
   Sem bibliotecas: um único requestAnimationFrame lê o scroll e escreve transforms. */
(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Tela do celular na foto (coordenadas da imagem original). */
  const SCR = window.N1_HERO || { W: 4096, H: 2294, x0: 1722, y0: 358, x1: 2320, y1: 1632, r: 62 };
  const APP_W = 390;
  const APP_H = Math.round(APP_W * ((SCR.y1 - SCR.y0) / (SCR.x1 - SCR.x0)));

  const hero = $("#hero");
  const world = $("#world");
  const img = $("#hero-img");
  const slot = $("#app-slot");
  const shade = $("#hero-shade");
  const copy = $("#hero-copy");
  const sideL = $("#side-l");
  const sideR = $("#side-r");
  const cue = $("#hero-cue");
  const credit = $(".hero-credit");
  const film = $("#filme");
  const frame = $("#film-frame");
  const video = $("#video");
  const filmHead = $("#film-head");
  const prog = $("#prog");
  if (!hero || !world) return;

  document.documentElement.style.setProperty("--app-w", APP_W + "px");
  document.documentElement.style.setProperty("--app-h", APP_H + "px");

  /* ---------- manchete que despedaça ---------- */
  const frags = [];
  $$("[data-shatter]").forEach((h, hi) => {
    const lines = h.innerHTML.split(/<br\s*\/?>/i);
    h.innerHTML = lines
      .map((line) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = line;
        const out = [];
        const walk = (node, wrap) => {
          node.childNodes.forEach((n) => {
            if (n.nodeType === 3) {
              n.textContent.split("").forEach((ch) => out.push({ ch, wrap }));
            } else if (n.nodeType === 1) walk(n, n.tagName.toLowerCase());
          });
        };
        walk(tmp, null);
        return (
          '<span class="sh-line">' +
          out
            .map(({ ch, wrap }) => {
              if (ch === " ") return '<span class="sh-sp"> </span>';
              const safe = ch.replace(/&/g, "&amp;").replace(/</g, "&lt;");
              const inner =
                '<span class="sh-f f1">' + safe + '</span><span class="sh-f f2">' + safe + '</span><span class="sh-f f3">' + safe + "</span>";
              return wrap ? `<${wrap} class="sh-l">${inner}</${wrap}>` : `<span class="sh-l">${inner}</span>`;
            })
            .join("") +
          "</span>"
        );
      })
      .join("");
    let seed = 7 + hi * 13;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    $$(".sh-l", h).forEach((l, li) => {
      const cx = 30 + rnd() * 40;
      const cy = 35 + rnd() * 30;
      const f = $$(".sh-f", l);
      f[0].style.clipPath = `polygon(0 0,100% 0,100% ${cy - 10}%,${cx}% ${cy}%,0 ${cy + 12}%)`;
      f[1].style.clipPath = `polygon(100% ${cy - 10}%,100% 100%,${cx + 8}% 100%,${cx}% ${cy}%)`;
      f[2].style.clipPath = `polygon(0 ${cy + 12}%,${cx}% ${cy}%,${cx + 8}% 100%,0 100%)`;
      f.forEach((el, k) => {
        const ang = (k === 0 ? -1.9 : k === 1 ? 0.4 : 2.4) + (rnd() - 0.5) * 1.2;
        frags.push({
          el,
          vx: Math.cos(ang) * (220 + rnd() * 420),
          vy: Math.sin(ang) * (160 + rnd() * 320) - 60,
          r: (rnd() - 0.5) * 120,
          d: (li % 7) * 0.03 + rnd() * 0.08,
        });
      });
    });
  });

  /* ---------- geometria ---------- */
  let L = null;
  function layout() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const s = Math.max(vw / SCR.W, vh / SCR.H);
    const iw = SCR.W * s;
    const ih = SCR.H * s;
    const ox = (vw - iw) / 2;
    const oy = (vh - ih) / 2;
    img.style.width = iw + "px";
    img.style.height = ih + "px";
    img.style.left = ox + "px";
    img.style.top = oy + "px";
    shade.style.width = iw + "px";
    shade.style.height = ih + "px";
    shade.style.left = ox + "px";
    shade.style.top = oy + "px";
    const sx = ox + SCR.x0 * s;
    const sy = oy + SCR.y0 * s;
    const sw = (SCR.x1 - SCR.x0) * s;
    const sh = (SCR.y1 - SCR.y0) * s;
    const a0 = sw / APP_W;
    slot.style.transform = `translate(${sx}px, ${sy}px) scale(${a0})`;
    document.documentElement.style.setProperty("--app-r", (SCR.r * s) / a0 + "px");
    const narrow = vw < 900;
    const topEl = document.querySelector(".top");
    const topH = topEl ? topEl.offsetHeight : 0;
    const avail = vh - topH - (narrow ? 12 : 28);
    const target = Math.min(avail / APP_H, (vw * (narrow ? 0.94 : 0.4)) / APP_W, 1.3);
    L = { vw, vh, cx: sx + sw / 2, cy: sy + sh / 2, Z: target / a0, a0, narrow, fy: topH + (vh - topH) / 2 };
    world.style.transformOrigin = `${L.cx}px ${L.cy}px`;
    fitCopy(ox + (SCR.x0 - 80) * s, narrow);
    tick(true);
  }

  /* a manchete cabe sempre dentro do vidro e à esquerda do celular */
  function fitCopy(phoneLeft, narrow) {
    const copy = document.getElementById("hero-copy");
    const h1 = copy && copy.querySelector("h1");
    if (!h1) return;
    h1.style.fontSize = "";
    copy.style.maxWidth = "";
    if (narrow) return;
    const cs = getComputedStyle(copy);
    const left = copy.getBoundingClientRect().left;
    const avail = Math.max(280, phoneLeft - left - 24);
    copy.style.maxWidth = avail + "px";
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    let wmax = 0;
    $$(".sh-line", h1).forEach((line) => {
      const ls = line.querySelectorAll(".sh-l");
      if (!ls.length) return;
      wmax = Math.max(wmax, ls[ls.length - 1].getBoundingClientRect().right - ls[0].getBoundingClientRect().left);
    });
    const room = avail - pad;
    if (wmax > room) {
      const fs = parseFloat(getComputedStyle(h1).fontSize);
      h1.style.fontSize = Math.max(32, Math.floor((fs * room) / wmax)) + "px";
    }
  }

  /* ---------- quadro a quadro ---------- */
  let started = false;
  let userPaused = false;
  let lastP = -1;
  let lastF = -1;
  function tick(force) {
    if (!L) return;
    const vh = L.vh;
    // progresso global (barra no topo)
    const doc = document.documentElement;
    const gp = clamp(window.scrollY / Math.max(1, doc.scrollHeight - vh));
    if (prog) prog.style.transform = `scaleX(${gp})`;

    // HERO
    const hr = hero.getBoundingClientRect();
    const p = clamp(-hr.top / Math.max(1, hero.offsetHeight - vh));
    if (force || Math.abs(p - lastP) > 0.0005) {
      lastP = p;
      const e = reduce ? (p > 0.3 ? 1 : 0) : ease(clamp((p - 0.1) / 0.58));
      const z = Math.pow(L.Z, e);
      const tx = (L.vw / 2 - L.cx) * e;
      const ty = (L.fy - L.cy) * e;
      world.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${z})`;
      shade.style.opacity = String(clamp((p - 0.42) / 0.26) * 0.86);
      // manchete despedaça
      const k = reduce ? (p > 0.05 ? 1 : 0) : clamp(p / 0.16);
      frags.forEach((f) => {
        const t = easeOut(clamp((k - f.d) / (1 - f.d)));
        f.el.style.transform = t ? `translate3d(${f.vx * t}px, ${f.vy * t + 220 * t * t}px, 0) rotate(${f.r * t}deg)` : "";
        f.el.style.opacity = String(1 - t);
      });
      copy.style.pointerEvents = k > 0.6 ? "none" : "";
      const fade = String(1 - clamp((p - 0.02) / 0.1));
      $$(".hero-glass, .kicker, .hero-lede", copy).forEach((el) => (el.style.opacity = fade));
      if (cue) cue.style.opacity = String(1 - clamp(p / 0.05));
      if (credit) credit.style.opacity = String(1 - clamp((p - 0.3) / 0.2));
      const side = clamp((p - 0.66) / 0.14);
      [sideL, sideR].forEach((el, i) => {
        if (!el) return;
        el.style.opacity = String(side);
        el.style.transform = `translate3d(${(i ? 1 : -1) * (1 - side) * 40}px, 0, 0)`;
        el.style.pointerEvents = side > 0.5 ? "auto" : "none";
      });
      const live = p >= 0.64;
      slot.classList.toggle("live", live);
      document.body.classList.toggle("in-app", live && p < 0.999);
    }

    // FILME
    if (film && frame) {
      const fr = film.getBoundingClientRect();
      const f = clamp(-fr.top / Math.max(1, film.offsetHeight - vh));
      const visible = fr.top < vh && fr.bottom > 0;
      if (force || Math.abs(f - lastF) > 0.0005) {
        lastF = f;
        const e = reduce ? 1 : easeOut(clamp(f / 0.5));
        const cw = Math.min(L.vw * (L.narrow ? 0.92 : 0.62), 1180);
        const ch = cw * 9 / 16;
        const ix = ((L.vw - cw) / 2) * (1 - e);
        const iy = ((vh - ch) / 2) * (1 - e) + (L.narrow ? 0 : 60 * (1 - e));
        const iyb = ((vh - ch) / 2) * (1 - e) - (L.narrow ? 0 : 60 * (1 - e));
        const r = 28 * (1 - e);
        frame.style.clipPath = `inset(${iy}px ${ix}px ${iyb}px ${ix}px round ${r}px)`;
        frame.style.setProperty("--cb", Math.max(0, iyb) + "px");
        video.style.transform = `scale(${1.12 - 0.12 * e})`;
        if (filmHead) {
          filmHead.style.opacity = String(1 - clamp((f - 0.18) / 0.2));
          filmHead.style.transform = `translate3d(0, ${-40 * clamp(f / 0.4)}px, 0)`;
        }
        frame.classList.toggle("full", e > 0.98);
      }
      if (video) {
        if (visible && f > 0.04 && !started && !userPaused) {
          started = true;
          video.muted = true;
          const pr = video.play();
          if (pr && pr.catch) pr.catch(() => (started = false));
        }
        if (!visible && !video.paused) {
          video.pause();
          started = false;
        }
      }
    }
  }

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      tick(false);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  if (img.complete) layout();
  else img.addEventListener("load", layout, { once: true });
  layout();

  /* ---------- controles do filme ---------- */
  const bPlay = $("#f-play");
  const bSound = $("#f-sound");
  const bFull = $("#f-full");
  const tLabel = $("#f-time");
  const sync = () => {
    if (!video) return;
    if (bPlay) bPlay.setAttribute("aria-label", video.paused ? "Reproduzir" : "Pausar"), (bPlay.dataset.state = video.paused ? "paused" : "playing");
    if (bSound) (bSound.dataset.state = video.muted ? "off" : "on"), (bSound.querySelector("span").textContent = video.muted ? "Ativar som" : "Som ligado");
  };
  if (video) {
    ["play", "pause", "volumechange"].forEach((ev) => video.addEventListener(ev, sync));
    video.addEventListener("timeupdate", () => {
      if (!tLabel || !video.duration) return;
      const s = Math.floor(video.currentTime);
      const d = Math.floor(video.duration);
      tLabel.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} / ${Math.floor(d / 60)}:${String(d % 60).padStart(2, "0")}`;
    });
  }
  if (bPlay)
    bPlay.addEventListener("click", () => {
      if (video.paused) {
        userPaused = false;
        video.play().catch(() => {});
      } else {
        userPaused = true;
        video.pause();
      }
    });
  if (bSound)
    bSound.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted && video.paused) video.play().catch(() => {});
    });
  if (bFull)
    bFull.addEventListener("click", () => {
      const el = frame;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) {
        try {
          const r = req.call(el);
          if (r && r.catch) r.catch(() => video.webkitEnterFullscreen && video.webkitEnterFullscreen());
        } catch (e) {
          if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
        }
      } else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    });
  sync();

  /* ---------- revelação das faixas + paralaxe ---------- */
  // Checagem direta no scroll (sem depender de IntersectionObserver): nada fica apagado esperando.
  let pending = [];
  if (!reduce) {
    const vh0 = window.innerHeight;
    $$(".rv").forEach((el) => {
      if (el.getBoundingClientRect().top > vh0 * 0.9) {
        el.classList.add("pre");
        pending.push(el);
      }
    });
    const reveal = () => {
      if (!pending.length) return;
      const lim = window.innerHeight * 0.92;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < lim) {
          el.classList.remove("pre");
          return false;
        }
        return true;
      });
    };
    window.addEventListener("scroll", reveal, { passive: true });
    window.addEventListener("resize", reveal);
    setTimeout(reveal, 300);
  }
  const px = $$("[data-parallax]");
  const ribbons = $$("[data-ribbon]");
  if (!reduce && (px.length || ribbons.length)) {
    const upd = () => {
      const vh = window.innerHeight;
      px.forEach((el) => {
        const r = el.getBoundingClientRect();
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0, ${c * -parseFloat(el.dataset.parallax)}px, 0)`;
      });
      ribbons.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.firstElementChild.style.transform = `translate3d(${(r.top / vh) * parseFloat(el.dataset.ribbon)}px, 0, 0)`;
      });
    };
    window.addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
    upd();
  }

  /* atalho: "ir ao cardápio" leva ao fim do mergulho */
  $$("[data-goto-app]").forEach((a) =>
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      const y = hero.offsetTop + (hero.offsetHeight - window.innerHeight) * 0.72;
      window.scrollTo({ top: y, behavior: "smooth" });
    })
  );
})();
