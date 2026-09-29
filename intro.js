/* Abertura "O Encaixe": o N se monta em 3 peças, o 1 trava no canto,
   e a cortina abre na diagonal exata do N (43,6°). ~1,9 s, pulável, 1× por sessão. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = false;
  try { seen = sessionStorage.getItem("n1-intro") === "1"; } catch (e) {}
  if (reduce || seen || !document.body.animate) return;
  try { sessionStorage.setItem("n1-intro", "1"); } catch (e) {}

  var NS = "http://www.w3.org/2000/svg";
  var P = {
    stem: "M0 0 L41 0 L41 100 L0 100Z",
    diag: "M41 0 L46.8 0 L93.6 44.7 L93.6 100 L92.8 100 L41 50.6Z",
    right: "M93.6 0 L141.8 0 L130.9 9.3 L130.9 41.4 L143 41.4 L143 100 L93.6 100Z",
    one: "M158.6 0 L193.4 0 L193.4 100 L153.9 100 L153.9 33.2 L140.1 33.2 L140.1 12.6Z",
  };
  var box = document.createElement("div");
  box.id = "intro";
  box.setAttribute("aria-hidden", "true");
  box.innerHTML =
    '<div class="in-half in-a"></div><div class="in-half in-b"></div>' +
    '<div class="in-logo"><svg viewBox="-2 -2 197.4 104" class="in-mark"></svg><div class="in-club"></div></div>' +
    '<button class="in-skip" type="button">Pular</button>';
  document.body.appendChild(box);
  var svg = box.querySelector(".in-mark");
  var clip = document.createElementNS(NS, "clipPath");
  clip.id = "in-clip";
  var r = document.createElementNS(NS, "rect");
  r.setAttribute("x", "-2"); r.setAttribute("y", "-1"); r.setAttribute("width", "150"); r.setAttribute("height", "102");
  clip.appendChild(r);
  var defs = document.createElementNS(NS, "defs");
  defs.appendChild(clip);
  svg.appendChild(defs);
  var g = document.createElementNS(NS, "g");
  g.setAttribute("clip-path", "url(#in-clip)");
  svg.appendChild(g);
  function piece(d, parent) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "#E21D24");
    parent.appendChild(p);
    return p;
  }
  var stem = piece(P.stem, g), diag = piece(P.diag, g), right = piece(P.right, g);
  var solid = piece("M0 0 L0 100 L41 100 L41 50.6 L92.8 100 L143 100 L143 41.4 L130.9 41.4 L130.9 9.3 L141.8 0 L93.6 0 L93.6 44.7 L46.8 0Z", svg);
  solid.style.opacity = "0";
  var one = piece(P.one, svg);
  var spark = document.createElementNS(NS, "circle");
  spark.setAttribute("cx", "136"); spark.setAttribute("cy", "5"); spark.setAttribute("r", "3");
  spark.setAttribute("fill", "none"); spark.setAttribute("stroke", "#D4A017"); spark.setAttribute("stroke-width", "1.4");
  spark.style.opacity = "0";
  svg.appendChild(spark);
  var club = box.querySelector(".in-club");
  "BURGER CLUB".split("").forEach(function (ch) {
    var s = document.createElement("span");
    s.textContent = ch === " " ? " " : ch;
    club.appendChild(s);
  });

  var snap = "cubic-bezier(.2,1.5,.4,1)";
  var cut = "cubic-bezier(.83,0,.17,1)";
  var o = function (d, delay, easing) { return { duration: d, delay: delay, easing: easing || snap, fill: "both" }; };
  var done = false;
  var anims = [];
  anims.push(stem.animate([{ transform: "translateY(-140px)" }, { transform: "none" }], o(420, 80)));
  anims.push(diag.animate([{ transform: "translate(-96px,-100px)" }, { transform: "none" }], o(420, 170)));
  anims.push(right.animate([{ transform: "translateY(140px)" }, { transform: "none" }], o(420, 260)));
  anims.push(solid.animate([{ opacity: 0 }, { opacity: 1 }], o(1, 700, "linear")));
  anims.push(one.animate([{ transform: "translateX(90px)", opacity: 0 }, { transform: "translateX(90px)", opacity: 1, offset: 0.01 }, { transform: "none", opacity: 1 }], o(360, 560)));
  anims.push(spark.animate([{ opacity: 0, r: 2 }, { opacity: 1, r: 4, offset: 0.2 }, { opacity: 0, r: 16 }], o(420, 860, "ease-out")));
  [].forEach.call(club.children, function (s, i) {
    anims.push(s.animate([{ transform: "translateY(110%)" }, { transform: "none" }], o(380, 900 + i * 28, "cubic-bezier(.16,1,.3,1)")));
  });
  var a = box.querySelector(".in-a"), b = box.querySelector(".in-b"), logo = box.querySelector(".in-logo");
  var t0 = 1650;
  anims.push(logo.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.96)" }], o(260, t0 - 60, "ease-in")));
  anims.push(a.animate([{ transform: "none" }, { transform: "translate(72vw,-76vw)" }], o(620, t0, cut)));
  var last = b.animate([{ transform: "none" }, { transform: "translate(-72vw,76vw)" }], o(620, t0, cut));
  anims.push(last);

  function end() {
    if (done) return;
    done = true;
    box.remove();
  }
  last.onfinish = end;
  box.querySelector(".in-skip").addEventListener("click", function () {
    anims.forEach(function (x) { try { x.finish(); } catch (e) {} });
    end();
  });
  setTimeout(end, 4000);
})();
