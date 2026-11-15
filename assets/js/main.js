/* Grüne Pause · Interaktionen & Animationen (ohne Abhängigkeiten) */
(function () {
  "use strict";
  var html = document.documentElement;
  html.classList.remove("no-js");
  var C = window.GP_CONFIG || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Seiten-Ladeanimation & Übergänge ---------- */
  function loaded() { html.classList.add("is-loaded"); }
  window.addEventListener("load", function () { setTimeout(loaded, 120); });
  setTimeout(loaded, 1800); // Fallback
  window.addEventListener("pageshow", function (e) { if (e.persisted) { html.classList.remove("leaving"); loaded(); } });

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || /^(tel:|mailto:|https?:)/i.test(href) || !/\.html(#.*)?$/.test(href)) return;
    if (reduce) return;
    e.preventDefault();
    html.classList.add("leaving");
    setTimeout(function () { window.location.href = href; }, 560);
  });

  /* ---------- Header ---------- */
  var head = $(".head"), lastY = 0;
  function onScrollHead() {
    var y = window.scrollY;
    if (!head) return;
    head.classList.toggle("scrolled", y > 24);
    if (!document.body.classList.contains("menu-open")) head.classList.toggle("hide", y > 420 && y > lastY + 2);
    if (y < lastY - 2) head.classList.remove("hide");
    lastY = y;
  }
  window.addEventListener("scroll", onScrollHead, { passive: true });
  onScrollHead();

  /* ---------- Mobiles Menü ---------- */
  var burger = $(".burger");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    if (burger) { burger.setAttribute("aria-expanded", open ? "true" : "false"); burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen"); }
    var m = $(".mnav"); if (m) m.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  $$(".mnav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ---------- Bilder mit illustriertem Fallback ---------- */
  $$(".media > img").forEach(function (img) {
    var box = img.parentNode;
    function ok() { box.classList.remove("failed"); img.classList.add("ok"); }
    function fail() { if (!img.classList.contains("ok")) box.classList.add("failed"); }
    if (img.complete && img.naturalWidth > 0) ok();
    else if (img.complete) fail();
    img.addEventListener("load", ok);
    img.addEventListener("error", fail);
    setTimeout(fail, 7000);
  });

  /* ---------- Wort-Animation für Überschriften ---------- */
  $$(".split").forEach(function (el) {
    var i = 0, walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) { if (!n.parentNode.closest("svg") && n.nodeValue.trim()) nodes.push(n); }
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
        var w = document.createElement("span"); w.className = "w";
        var s = document.createElement("span"); s.textContent = part; s.style.setProperty("--i", i++);
        w.appendChild(s); frag.appendChild(w);
      });
      node.parentNode.replaceChild(frag, node);
    });
  });

  /* ---------- Reveal beim Scrollen ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); if (en.target.hasAttribute("data-count")) countUp(en.target); }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }) : null;
  $$("[data-reveal], .split, [data-in], [data-count]").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });

  function countUp(el) {
    var to = parseFloat(el.getAttribute("data-count")), dec = (el.getAttribute("data-count").split(".")[1] || "").length, t0 = null, dur = reduce ? 1 : 1600;
    function step(t) {
      if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = (to * e).toFixed(dec).replace(".", ",");
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Scroll-Text (Wörter füllen sich) ---------- */
  var statements = $$("[data-scrolltext]");
  statements.forEach(function (el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
        var s = document.createElement("span"); s.className = "sw"; s.textContent = part; frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el._words = $$(".sw", el);
  });

  /* ---------- Parallax ---------- */
  var px = $$("[data-parallax]");
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (!reduce) px.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var sp = parseFloat(el.getAttribute("data-parallax")) || 0.1;
      var off = (r.top + r.height / 2 - vh / 2) * sp * -1;
      el.style.setProperty("--py", off.toFixed(1) + "px");
    });
    statements.forEach(function (el) {
      var r = el.getBoundingClientRect(), total = el._words.length;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var count = Math.round(p * total);
      el._words.forEach(function (w, i) { w.classList.toggle("on", i < count); });
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("resize", req);
  frame();

  /* ---------- Magnetische Buttons ---------- */
  if (!reduce && window.matchMedia("(hover:hover)").matches) {
    $$(".btn, .rbtn").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px";
      });
      b.addEventListener("pointerleave", function () { b.style.translate = ""; });
    });
  }

  /* ---------- Swipe-Tracks (Touch, Maus-Drag, Pfeile, Fortschritt) ---------- */
  $$("[data-track]").forEach(function (wrap) {
    var track = $(".track", wrap), prev = $("[data-prev]", wrap), next = $("[data-next]", wrap), bar = $(".progress i", wrap);
    if (!track) return;
    function itemW() { var f = track.children[0]; return f ? f.getBoundingClientRect().width + 20 : 300; }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 1;
      if (bar) bar.style.width = Math.max(12, (track.clientWidth / track.scrollWidth) * 100 + p * (100 - (track.clientWidth / track.scrollWidth) * 100)) + "%";
      if (prev) prev.disabled = track.scrollLeft < 8;
      if (next) next.disabled = track.scrollLeft > max - 8;
    }
    if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -itemW(), behavior: "smooth" }); });
    if (next) next.addEventListener("click", function () { track.scrollBy({ left: itemW(), behavior: "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    // Maus-Drag
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add("dragging"); }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return; down = false;
      if (moved) {
        track.classList.remove("dragging");
        var w = itemW(); track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: "smooth" });
      }
    });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { track.scrollBy({ left: itemW(), behavior: "smooth" }); }
      if (e.key === "ArrowLeft") { track.scrollBy({ left: -itemW(), behavior: "smooth" }); }
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = $(".lb");
  if (lb) {
    var stage = $(".lb-stage-in", lb), cap = $(".lb-cap", lb), cnt = $(".lb-count", lb), items = [], idx = 0, lastFocus = null;
    function visibleItems(group) { return $$("[data-lb]", group).filter(function (el) { return !el.classList.contains("hidden"); }); }
    function show(i) {
      idx = (i + items.length) % items.length;
      var src = $(".media", items[idx]);
      stage.innerHTML = "";
      var clone = src.cloneNode(true);
      clone.removeAttribute("data-reveal"); clone.style.cssText = "";
      var im = $("img", clone);
      if (im) { im.removeAttribute("loading"); im.sizes = "100vw"; }
      stage.appendChild(clone);
      if (im) {
        if (src.classList.contains("failed")) clone.classList.add("failed");
        im.addEventListener("load", function () { clone.classList.remove("failed"); im.classList.add("ok"); });
        im.addEventListener("error", function () { clone.classList.add("failed"); });
      }
      cap.textContent = items[idx].getAttribute("data-cap") || "";
      cnt.textContent = String(idx + 1).padStart(2, "0") + " / " + String(items.length).padStart(2, "0");
    }
    function open(el) {
      var group = el.closest("[data-lb-group]") || document;
      items = visibleItems(group); lastFocus = el;
      show(items.indexOf(el));
      lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setTimeout(function () { $(".lb-close", lb).focus(); }, 50);
    }
    function close() {
      lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    $$("[data-lb]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); open(el); });
    });
    $(".lb-close", lb).addEventListener("click", close);
    $(".lb-prev", lb).addEventListener("click", function () { show(idx - 1); });
    $(".lb-next", lb).addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-stage")) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "Tab") { // Fokus in der Lightbox halten
        var f = $$("button", lb); var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var tx = null;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------- Galerie-Filter ---------- */
  $$("[data-filters]").forEach(function (bar) {
    var grid = document.getElementById(bar.getAttribute("data-filters"));
    $$("button", bar).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", bar).forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var f = b.getAttribute("data-filter");
        $$(".g", grid).forEach(function (g) {
          var show = f === "alle" || (g.getAttribute("data-cat") || "").split(" ").indexOf(f) > -1;
          g.classList.toggle("hidden", !show);
        });
      });
    });
  });

  /* ---------- Speisekarte: aktive Kategorie ---------- */
  var catLinks = $$(".catbar a[href^='#']");
  if (catLinks.length && io) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        catLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.classList.toggle("active", on);
          if (on) { var bar = a.parentNode; bar.scrollTo({ left: a.offsetLeft - bar.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" }); }
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    $$(".cat[id]").forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Infografik: Teller ---------- */
  $$("[data-plate]").forEach(function (root) {
    var segs = $$(".seg", root), btns = $$(".legend button", root);
    btns.forEach(function (b, i) {
      function on() {
        btns.forEach(function (x) { x.classList.toggle("on", x === b); });
        segs.forEach(function (s, j) { s.style.opacity = j === i ? "1" : ".22"; });
        var c = $(".plate-center", root); if (c) { $("b", c).textContent = b.getAttribute("data-t"); $("span", c).textContent = b.getAttribute("data-s"); }
      }
      b.addEventListener("mouseenter", on); b.addEventListener("focus", on); b.addEventListener("click", on);
    });
    root.addEventListener("mouseleave", function () {
      btns.forEach(function (x) { x.classList.remove("on"); });
      segs.forEach(function (s) { s.style.opacity = "1"; });
      var c = $(".plate-center", root); if (c) { $("b", c).textContent = c.getAttribute("data-t"); $("span", c).textContent = c.getAttribute("data-s"); }
    });
  });

  /* ---------- Öffnungszeiten aus config.js ---------- */
  var days = [["mo", "Montag"], ["di", "Dienstag"], ["mi", "Mittwoch"], ["do", "Donnerstag"], ["fr", "Freitag"], ["sa", "Samstag"], ["so", "Sonntag"]];
  var todayKey = days[(new Date().getDay() + 6) % 7][0];
  function fmt(slots) { return slots && slots.length ? slots.map(function (s) { return s[0] + "–" + s[1]; }).join(", ") + " Uhr" : "Geschlossen"; }
  function isOpen() {
    if (!C.hours) return null;
    var slots = C.hours[todayKey]; if (!slots) return false;
    var d = new Date(), m = d.getHours() * 60 + d.getMinutes();
    return slots.some(function (s) { var a = s[0].split(":"), b = s[1].split(":"); return m >= +a[0] * 60 + +a[1] && m < +b[0] * 60 + +b[1]; });
  }
  $$("[data-hours]").forEach(function (box) {
    if (!C.hours) {
      box.innerHTML = '<p class="muted" style="margin:0">Unsere aktuellen Öffnungszeiten erfährst du am schnellsten telefonisch – ruf einfach kurz an unter <a class="link-u" href="' + C.phoneHref + '">' + C.phoneDisplay + "</a>.</p>";
      return;
    }
    var ul = document.createElement("ul"); ul.className = "hours";
    days.forEach(function (d) {
      var li = document.createElement("li"); if (d[0] === todayKey) li.className = "today";
      li.innerHTML = "<span>" + d[1] + "</span><span>" + fmt(C.hours[d[0]]) + "</span>";
      ul.appendChild(li);
    });
    box.innerHTML = ""; box.appendChild(ul);
    if (C.hoursNote) { var p = document.createElement("p"); p.className = "fine"; p.textContent = C.hoursNote; box.appendChild(p); }
  });
  $$("[data-status]").forEach(function (el) {
    var o = isOpen();
    if (o === null) { el.innerHTML = "<i></i>Zeiten telefonisch erfragen"; return; }
    el.classList.add(o ? "open" : "closed");
    el.innerHTML = "<i></i>" + (o ? "Jetzt geöffnet" : "Gerade geschlossen");
  });


  /* ---------- Pausen-Uhr mit echtem Öffnungsstatus ---------- */
  $$("[data-clock]").forEach(function (el) {
    var msg = $("[data-clock-msg]");
    function toMin(t) { var x = t.split(":"); return +x[0] * 60 + +x[1]; }
    function hr(t) { var x = t.split(":"); return (+x[0]) + (x[1] === "00" ? "" : ":" + x[1]) + " Uhr"; }
    function status() {
      var d = new Date(), m = d.getHours() * 60 + d.getMinutes();
      var idx = (d.getDay() + 6) % 7;
      if (!C.hours) return "Ruf an für unsere Öffnungszeiten";
      var today = C.hours[days[idx][0]];
      if (today) {
        for (var i = 0; i < today.length; i++) {
          if (m >= toMin(today[i][0]) && m < toMin(today[i][1])) return "Jetzt geöffnet bis " + hr(today[i][1]);
          if (m < toMin(today[i][0])) return "Heute ab " + hr(today[i][0]) + " geöffnet";
        }
      }
      for (var k = 1; k <= 7; k++) {
        var j = (idx + k) % 7, s = C.hours[days[j][0]];
        if (s && s.length) return "Geschlossen · " + (k === 1 ? "morgen" : days[j][1]) + " ab " + hr(s[0][0]);
      }
      return "Gerade geschlossen";
    }
    function tick() {
      var d = new Date();
      el.textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
      if (msg) msg.textContent = status();
    }
    tick(); setInterval(tick, 20000);
  });

  /* ---------- Google, Bewertung, Kundenstimmen ---------- */
  var gUrl = C.googleReviewsUrl || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Grüne Pause, Marktplatz 10/1, 88400 Biberach an der Riß");
  $$("[data-google]").forEach(function (a) { a.href = gUrl; a.target = "_blank"; a.rel = "noopener"; });
  if (C.rating) {
    $$("[data-rating-count]").forEach(function (el) { el.textContent = C.rating.count; });
    $$("[data-rating-asof]").forEach(function (el) { el.textContent = C.rating.asOf; });
  }
  $$("[data-reviews]").forEach(function (box) {
    var wrap = box.closest("[data-reviews-wrap]") || box;
    if (!C.reviews || !C.reviews.length) { wrap.hidden = true; return; }
    C.reviews.forEach(function (r) {
      var q = document.createElement("figure"); q.className = "quote";
      var p = document.createElement("p"); p.textContent = "„" + r.text + "“";
      var c = document.createElement("cite"); c.textContent = "— " + r.author + (r.source ? " · " + r.source : "");
      q.appendChild(p); q.appendChild(c); box.appendChild(q);
    });
  });

  /* ---------- Google Maps erst nach Einwilligung ---------- */
  $$("[data-map-load]").forEach(function (b) {
    b.addEventListener("click", function () {
      var box = b.closest(".map-embed");
      var f = document.createElement("iframe");
      f.src = "https://www.google.com/maps?q=" + encodeURIComponent("Grüne Pause, Marktplatz 10/1, 88400 Biberach an der Riß") + "&z=17&output=embed";
      f.title = "Google-Maps-Karte: Grüne Pause, Marktplatz 10/1, Biberach";
      f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade"; f.allowFullscreen = true;
      box.appendChild(f); box.classList.add("loaded");
    });
  });

  /* ---------- Kleinigkeiten ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
