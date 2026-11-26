(function () {
  var cfg = window.CLEARVIEW || {};
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  // Some styles swap in photos that suit them (example photos until the real ones arrive)
  var STYLE_PHOTOS = {
    drafted: { "cta-photo": "1704307163247-cde12ba3ff28" }
  };
  var swaps = STYLE_PHOTOS[document.documentElement.getAttribute("data-style")] || {};
  Object.keys(swaps).forEach(function (slot) {
    var img = document.querySelector('[data-slot="' + slot + '"] img');
    if (!img) return;
    var base = "assets/photos/" + swaps[slot] + "-";
    img.srcset = [800, 1400, 1600].map(function (w) { return base + w + ".jpg " + w + "w"; }).join(", ");
    img.src = base + "1400.jpg";
    img.alt = "Example photo: modern wooden gable house";
  });

  // Preview mode: ?preview shows content marked "pending"
  if (/[?&]preview\b/.test(location.search)) document.documentElement.classList.add("preview");

  // Contact info from config.js
  $$("[data-phone]").forEach(function (el) { el.textContent = cfg.phoneDisplay; });
  $$("[data-tel]").forEach(function (el) { el.href = "tel:" + cfg.phoneDial; });
  $$("[data-sms]").forEach(function (el) { el.href = "sms:" + cfg.phoneDial; });
  $$("[data-email]").forEach(function (el) {
    el.href = "mailto:" + cfg.email;
    if (!el.children.length) el.textContent = cfg.email;
  });

  // Schedule buttons → Spectora (falls back to the contact form until the link is set)
  // (they jump to the booking form embedded on the homepage; pages without it link to Spectora directly)
  if (cfg.scheduleUrl && !document.getElementById("book")) {
    $$("[data-schedule]").forEach(function (el) { if (!/#book$/.test(el.getAttribute("href"))) el.href = cfg.scheduleUrl; });
  }
  if (cfg.sampleReportUrl) {
    $$("[data-sample-report]").forEach(function (el) {
      el.href = cfg.sampleReportUrl;
      el.target = "_blank";
      el.rel = "noopener";
    });
  }
  if (cfg.googleReviewsUrl) {
    $$("[data-reviews]").forEach(function (el) { el.href = cfg.googleReviewsUrl; });
  }

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Quote form
  $$("form[data-quote-form]").forEach(function (form) {
    var status = form.querySelector(".form-status");
    if (cfg.formEndpoint) {
      form.action = cfg.formEndpoint;
      form.method = "POST";
    }
    form.addEventListener("submit", function (e) {
      // Honeypot: real visitors never fill this hidden field
      if (form.querySelector(".hp input").value) { e.preventDefault(); return; }
      if (!cfg.formEndpoint) {
        e.preventDefault();
        status.hidden = false;
        status.textContent = "The form isn't connected yet. Please call or text " + cfg.phoneDisplay + " for a quote.";
      }
    });
  });

  // Design style switcher (review only)
  if (cfg.showStyleSwitcher) {
    var styles = ["drafted"];
    var bar = document.createElement("div");
    bar.className = "style-switcher";
    bar.innerHTML = "<span>Style</span>" + styles.map(function (s) {
      return '<button type="button" data-style-pick="' + s + '">' + s.charAt(0).toUpperCase() + s.slice(1) + "</button>";
    }).join("");
    document.body.appendChild(bar);
    var sync = function () {
      var cur = document.documentElement.getAttribute("data-style");
      $$("[data-style-pick]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.stylePick === cur); });
    };
    // Picking a style reloads the page at the top in that style, so every layout and animation starts fresh
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-style-pick]");
      if (!b) return;
      var s = b.dataset.stylePick;
      if (s === document.documentElement.getAttribute("data-style")) return;
      try { localStorage.setItem("cv-style", s); sessionStorage.setItem("cv-switched", s); sessionStorage.removeItem("cv-intro"); } catch (err) {}
      // The style rides in the hash (#style-drafted) so it also survives hosts that drop the query string
      var url = new URL(location.href);
      url.searchParams.delete("style");
      url.hash = "style-" + s;
      document.body.classList.add("style-leaving");
      setTimeout(function () {
        try { history.scrollRestoration = "manual"; history.replaceState(null, "", url.toString()); } catch (err) {}
        location.reload();
      }, 160);
    });
    sync();

    // Name the new style for a moment after switching
    var switched = null;
    try { switched = sessionStorage.getItem("cv-switched"); sessionStorage.removeItem("cv-switched"); } catch (err) {}
    if (switched) {
      window.scrollTo(0, 0);
      var toast = document.createElement("div");
      toast.className = "style-toast";
      toast.textContent = switched.charAt(0).toUpperCase() + switched.slice(1) + " style";
      document.body.appendChild(toast);
      setTimeout(function () { toast.remove(); }, 1800);
    }
  }

  // Motion (used by the Studio, Atelier and Porch styles; everything is skipped for reduced motion)
  var root = document.documentElement;
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!still) {
    root.classList.add("motion");

    // Section headings "01. Why-ClearView": split eyebrow words so the last one can be set in italic serif
    $$("main .eyebrow").forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      if (el.closest(".hero")) return;
      var last = words.pop();
      el.innerHTML = (words.length ? '<span class="ew-a">' + words.join(" ") + '</span><span class="ew-gap"> </span>' : "") + "<em>" + last + "</em>";
    });

    // Intro: "Inspections" swaps to "ClearView", then the curtain lifts. Plays on every page load.
    var style = root.getAttribute("data-style");
    if (/^drafted$/.test(style) && document.querySelector(".hero-stage")) {
      var intro = document.createElement("div");
      intro.className = "intro";
      intro.setAttribute("aria-hidden", "true");
      intro.innerHTML = '<span class="intro-corner">[©' + new Date().getFullYear() + ']</span>' +
        '<span class="intro-words"><span>Inspections</span><span>ClearView</span></span>' +
        '<span class="intro-corner">[licensed home inspector]</span>';
      document.body.appendChild(intro);
      root.classList.add("intro-on");
      root.style.setProperty("--intro-delay", "1.5s");
      // Remove it once the curtain has actually lifted. A fixed timer cut it off on slow loads,
      // before "ClearView" had a chance to slide in. The long timeout is only a safety net.
      var endIntro = function () { if (!intro.parentNode) return; intro.remove(); root.classList.remove("intro-on"); };
      intro.addEventListener("animationend", function (e) { if (e.animationName === "cv-curtain") endIntro(); });
      setTimeout(endIntro, 8000);
    }

    // Reveal blocks as they scroll into view
    var targets = $$(".section-head, .why-quote, .why-points li, .flow, .prep, .spec-group, .house-aid, .inspector-figure, main .card, .finding, .inspect-grid > div, .faq details, .chip-group, .philosophy, .cred, .contact-method, .report, .ph-portrait, .ph-wide, [data-slot='service-area-map'], .cta-band h2, .cta-phone");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      targets.forEach(function (el) { el.classList.add("rv"); io.observe(el); });
    }

    // Porch: number each line of the hero drawing so it can draw itself in order
    $$(".hero-illustration svg path, .hero-illustration svg circle, .hero-illustration svg rect").filter(function (el) { return !el.closest(".no-draw"); }).forEach(function (el, i) {
      el.setAttribute("pathLength", "1");
      el.style.setProperty("--i", i);
    });

    // Blueprint floor plan behind the page: each line draws in as you scroll
    $$(".blueprint path, .house-aid .ha-house :is(path, rect, circle)").forEach(function (el) { el.setAttribute("pathLength", "1"); });

    // Hero stats count up once the hero has settled
    $$(".hero-stats dd").forEach(function (dd) {
      var node = dd.firstChild;
      if (!node || node.nodeType !== 3) return;
      if (!/^\d+$/.test(node.nodeValue.trim())) return; /* only plain numbers count up */
      var target = parseInt(node.nodeValue, 10);
      if (!target) return;
      node.nodeValue = "0";
      var delay = (parseFloat(getComputedStyle(root).getPropertyValue("--intro-delay")) || 0) * 1000 + 700;
      setTimeout(function () {
        var t0 = performance.now(), dur = 1400;
        (function tick(now) {
          var k = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - k, 3);
          node.nodeValue = String(Math.round(target * e));
          if (k < 1) requestAnimationFrame(tick);
        })(t0);
      }, delay);
    });

    // Scroll progress for the hero parallax, photo drift and the closing photo
    var drift = /^drafted$/.test(style) ? $$(".ph:not(.ph-thumb) img") : [];
    var hero = document.querySelector(".hero"), cta = document.querySelector(".cta-visual"), ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      var max = document.documentElement.scrollHeight - vh;
      root.style.setProperty("--sp", (max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0).toFixed(4));
      if (hero) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty("--hero-p", Math.min(Math.max(-r.top / r.height, 0), 1).toFixed(3));
      }
      drift.forEach(function (img) {
        var b = img.parentNode.getBoundingClientRect();
        if (b.bottom < 0 || b.top > vh) return;
        var p = ((b.top + b.height / 2) - vh / 2) / vh;
        img.style.setProperty("--py", (p * -5).toFixed(2) + "%");
      });
      if (cta) {
        var c = cta.getBoundingClientRect();
        cta.style.setProperty("--cta-p", Math.min(Math.max((vh - c.top) / (vh * .8), 0), 1).toFixed(3));
      }
    };
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // What we inspect: groups are always open on big screens, tap to open on phones
  var specWide = window.matchMedia("(min-width: 700px)");
  var syncSpec = function () { $$(".spec-group").forEach(function (d) { if (specWide.matches) d.open = true; else if (!d.dataset.touched) d.open = false; }); };
  $$(".spec-group summary").forEach(function (sm) {
    sm.addEventListener("click", function (e) { if (specWide.matches) e.preventDefault(); else sm.parentNode.dataset.touched = "1"; });
  });
  syncSpec();
  if (specWide.addEventListener) specWide.addEventListener("change", syncSpec);

  // Colour palette picker (review only)
  if (cfg.showPalettePicker) {
    var PALETTES = [
      ["blueprint", "Blueprint", "#121212", "#2f6be0"],
      ["forest", "Forest", "#13201a", "#2e7d57"],
      ["harbor", "Harbor", "#0e1a2b", "#b07a2e"],
      ["clay", "Clay", "#1d1714", "#c0532b"],
      ["tidewater", "Tidewater", "#0f2326", "#1b8a7e"]
    ];
    var picker = document.createElement("div");
    picker.className = "palette-picker";
    picker.setAttribute("role", "group");
    picker.setAttribute("aria-label", "Colour palette");
    picker.innerHTML = "<span>Colors</span>" + PALETTES.map(function (p) {
      return '<button type="button" data-palette-pick="' + p[0] + '" title="' + p[1] + '"><i style="--sw-a:' + p[2] + ';--sw-b:' + p[3] + '"></i><b>' + p[1] + "</b></button>";
    }).join("");
    document.body.appendChild(picker);
    var syncPal = function () {
      var cur = document.documentElement.getAttribute("data-palette") || "blueprint";
      $$("[data-palette-pick]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-palette-pick") === cur ? "true" : "false"); });
    };
    picker.addEventListener("click", function (e) {
      var b = e.target.closest("[data-palette-pick]");
      if (!b) return;
      var name = b.getAttribute("data-palette-pick");
      document.documentElement.setAttribute("data-palette", name);
      try { localStorage.setItem("cv-palette", name); } catch (err) {}
      syncPal();
    });
    syncPal();
  }

  // What We Inspect: exploded isometric cut-away house with a guided tour of the 12 systems
  (function () {
    var wrap = document.querySelector("[data-wwi]"), host = wrap && wrap.querySelector("[data-iso]");
    if (!host) return;
    wrap.classList.add("wwi-ready");
    var NS = "http://www.w3.org/2000/svg", U = 22, C = 0.866, S = 0.5;
    var P = function (x, y, z) { return [(x - y) * C * U, (x + y) * S * U - z * U]; };
    var BB = { x1: 1e9, y1: 1e9, x2: -1e9, y2: -1e9 }, grow = function (q) { if (q[0] < BB.x1) BB.x1 = q[0]; if (q[0] > BB.x2) BB.x2 = q[0]; if (q[1] < BB.y1) BB.y1 = q[1]; if (q[1] > BB.y2) BB.y2 = q[1]; };
    var pts = function (a) { return a.map(function (p) { var q = P(p[0], p[1], p[2]); grow(q); return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "); };
    var el = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
    var svg = el("svg", { viewBox: "-300 -150 600 560", "class": "iso", "aria-hidden": "true" });
    var defs = el("defs", {}, svg);
    defs.innerHTML = '<radialGradient id="isoWarm"><stop offset="0" stop-color="#cfe0ff" stop-opacity=".42"/><stop offset="1" stop-color="#cfe0ff" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="isoWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8ff"/><stop offset="1" stop-color="#8fb8ff"/></linearGradient>' +
      '<filter id="isoGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
    var shade = function (hex, f) { var n = parseInt(hex.slice(1), 16), r = n >> 16, g = n >> 8 & 255, b = n & 255; r = Math.round(r * f); g = Math.round(g * f); b = Math.round(b * f); return "rgb(" + r + "," + g + "," + b + ")"; };
    var box = function (g, x, y, z, w, d, h, col, sys, cls) {
      var b = el("g", { "class": "bx" + (cls ? " " + cls : "") + (sys ? " it" : "") }, g);
      if (sys) b.setAttribute("data-s", sys);
      el("polygon", { points: pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]), fill: shade(col, .78) }, b);
      el("polygon", { points: pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]), fill: shade(col, .6) }, b);
      el("polygon", { points: pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]), fill: col }, b);
      return b;
    };
    var face = function (g, p, fill, sys, cls) { var f = el("polygon", { points: pts(p), fill: fill, "class": (cls || "") + (sys ? " it" : "") }, g); if (sys) f.setAttribute("data-s", sys); return f; };
    var line = function (g, a, b, stroke, w, sys, dash) { var q1 = P(a[0], a[1], a[2]), q2 = P(b[0], b[1], b[2]); grow(q1); grow(q2); var l = el("line", { x1: q1[0], y1: q1[1], x2: q2[0], y2: q2[1], stroke: stroke, "stroke-width": w || 1, "stroke-linecap": "round" }, g); if (dash) l.setAttribute("stroke-dasharray", dash); if (sys) { l.setAttribute("data-s", sys); l.setAttribute("class", "it"); } return l; };
    var glow = function (g, x, y, z, r) { var q = P(x, y, z); el("ellipse", { cx: q[0], cy: q[1], rx: r * U, ry: r * U * .5, fill: "url(#isoWarm)", "class": "lamp" }, g); };
    var W = 10, D = 7, H = 3;
    var level = function (z0, i, opts) {
      var g = el("g", { "class": "lvl", style: "--i:" + i }, svg);
      box(g, 0, 0, z0 - .35, W, D, .35, opts.floor, opts.floorSys, "st");
      line(g, [0, D, z0 - .36], [W, D, z0 - .36], "#4d8df0", 1.6, null).setAttribute("class", "led");
      line(g, [W, 0, z0 - .36], [W, D, z0 - .36], "#4d8df0", 1.6, null).setAttribute("class", "led");
      box(g, 0, 0, z0, .3, D, H, opts.wall, opts.wallSys, "st");
      box(g, 0, 0, z0, W, .3, H, opts.wall, opts.wallSys, "st");
      return g;
    };
    var win = function (g, plane, a1, a2, z1, z2, sys) {
      var p = plane === "x" ? [[.31, a1, z1], [.31, a2, z1], [.31, a2, z2], [.31, a1, z2]] : [[a1, .31, z1], [a2, .31, z1], [a2, .31, z2], [a1, .31, z2]];
      face(g, p, "url(#isoWin)", sys, "win");
      var m = plane === "x" ? [[.32, (a1 + a2) / 2, z1], [.32, (a1 + a2) / 2, z2]] : [[(a1 + a2) / 2, .32, z1], [(a1 + a2) / 2, .32, z2]];
      line(g, m[0], m[1], "#6b4a2e", 1.2);
    };
    // blueprint base plate under the whole house
    var plate = el("g", { "class": "lvl plate", style: "--i:0" }, svg);
    face(plate, [[-2.6, -2.6, -.9], [16.4, -2.6, -.9], [16.4, 11.6, -.9], [-2.6, 11.6, -.9]], "rgba(77,141,240,.16)");
    for (var gx = -2; gx <= 16; gx += 2) line(plate, [gx, -2.6, -.9], [gx, 11.6, -.9], "rgba(140,185,255,.22)", 1);
    for (var gy = -2; gy <= 11; gy += 2) line(plate, [-2.6, gy, -.9], [16.4, gy, -.9], "rgba(140,185,255,.22)", 1);
    line(plate, [-2.6, 11.6, -.9], [16.4, 11.6, -.9], "rgba(160,200,255,.6)", 1.6);
    line(plate, [16.4, -2.6, -.9], [16.4, 11.6, -.9], "rgba(160,200,255,.6)", 1.6);
    // ground and yard (front of the house, at main-floor level)
    var Z1 = 7.4, yard = el("g", { "class": "lvl yard", style: "--i:1" }, svg);
    box(yard, 10.4, -1.2, Z1 - .8, 5, 9.6, .4, "#1f2b24", 2, "st");
    box(yard, -1.2, 7.4, Z1 - .8, 11.6, 3.2, .4, "#1f2b24", 2, "st");
    box(yard, 4, 7.5, Z1 - .4, 1.8, 3.1, .06, "#c9cdd2", 2);
    box(yard, 3.9, 7.1, Z1 - .7, 2, .9, .3, "#dfe2e6", 2);
    box(yard, 12, 1.4, Z1 - .4, 1.3, 1.3, 1.1, "#9aa3ab", 7);
    line(yard, [12.2, 2.05, Z1 + .72], [13.1, 2.05, Z1 + .72], "#5c646b", 1.4, 7);
    [[13.8, 6.4], [11.2, 8.6], [0.4, 9.2]].forEach(function (b, k) { var q = P(b[0], b[1], Z1 - .4); el("ellipse", { cx: q[0], cy: q[1] - 10 - k * 2, rx: 16 + k * 3, ry: 13 + k * 2, fill: "#2c4535", "class": "it", "data-s": 2 }, yard); });
    // basement
    var g0 = level(0, 0, { floor: "#4a4e54", wall: "#34383d", floorSys: 4, wallSys: 4 });
    glow(g0, 5, 3.5, 0, 4);
    box(g0, .3, 2.2, 0, .7, 1.8, 2, "#2a2d32");
    box(g0, 1.2, .4, 0, 1.5, 1.2, 2.2, "#e9ecef", 7);
    box(g0, 1.5, .55, 2.2, .9, .9, .8, "#b9c0c8", 7);
    box(g0, 3.4, .45, 0, 1.05, 1.05, 2, "#f4f5f6", 6);
    line(g0, [3.95, 1, 2], [3.95, 1, 3], "#b7894f", 2.2, 6);
    box(g0, .31, 4.6, .9, .18, 1.1, 1.4, "#3c4046", 5);
    [1.2, 1.5, 1.8].forEach(function (z) { line(g0, [.5, 4.75, z], [.5, 5.55, z], "#9aa3ab", 1, 5); });
    box(g0, 7.4, 4.8, 0, 1.1, 1.1, .12, "#2b2e32", 4);
    box(g0, 5.2, 1.6, 0, 2.6, .5, .5, "#2a2d32");
    // main floor
    var z1 = 7.4, g1 = level(z1, 1, { floor: "#c9bba5", wall: "#e4e7ea", floorSys: 3 });
    glow(g1, 3, 4.2, z1, 3.4); glow(g1, 7.2, 2.4, z1, 3);
    win(g1, "y", 5.4, 7.4, z1 + 1.1, z1 + 2.4, 9);
    win(g1, "x", 1.4, 3, z1 + 1.1, z1 + 2.4, 9);
    box(g1, 1.6, 3.4, z1, 3.2, 2.6, .03, "#1c2433");
    box(g1, .3, 5, z1, .8, 1.7, 1.5, "#202328", 12);
    face(g1, [[1.11, 5.45, z1 + .15], [1.11, 6.25, z1 + .15], [1.11, 6.25, z1 + .95], [1.11, 5.45, z1 + .95]], "#8fc0ff", 12, "fire");
    box(g1, .45, 5.25, z1 + 1.5, .55, 1.1, 1.5, "#2b2e33", 12);
    box(g1, 2.4, 3.6, z1, 1, 1.2, .45, "#b8a588");
    box(g1, 3.9, 3.3, z1, 1, 2.4, .55, "#25292f");
    box(g1, 3.9, 3.3, z1 + .55, .3, 2.4, .7, "#2e333a");
    box(g1, 5, .3, z1, 3.9, .9, 1.05, "#f6f7f8", 12);
    box(g1, 6.4, .3, z1, 1, .9, 1.12, "#16181b", 12);
    box(g1, 8.95, .3, z1, .95, 1, 2.3, "#c3c8ce", 12);
    box(g1, 5.6, 2.5, z1, 2.4, 1.1, 1.05, "#1b1e22");
    box(g1, 6.5, .35, z1 + 2.1, .9, .5, .4, "#5a5f66", 8);
    box(g1, 5.4, .4, z1 + 1.05, .8, .55, .03, "#8d949b", 6);
    line(g1, [5.8, .42, z1 + 1.06], [5.8, .42, z1 + 1.4], "#c9ced4", 1.6, 6);
    box(g1, 2, 1.4, z1 + .72, 1.7, 1, .08, "#f2f3f4");
    [[1.75, 1.6], [1.75, 2.0], [3.75, 1.6], [3.75, 2.0]].forEach(function (c) { box(g1, c[0], c[1], z1, .3, .3, .45, "#25292f"); });
    for (var st = 0; st < 8; st++) box(g1, 6.2 + st * .4, 6.2, z1, .4, .75, (st + 1) * .37, "#e9ecef", 9);
    line(g1, [6.2, 6.95, z1 + .9], [9.4, 6.95, z1 + 3.9], "#1f2328", 1.6, 9);
    // upper floor
    var z2 = 14.8, g2 = level(z2, 2, { floor: "#c9bba5", wall: "#e4e7ea", floorSys: 3 });
    glow(g2, 2, 1.8, z2, 2.6); glow(g2, 7.4, 4.4, z2, 3.2);
    box(g2, 4.9, .3, z2, .15, 2.8, H, "#d5d9dd", 9, "st");
    win(g2, "y", 6.6, 8.6, z2 + 1.1, z2 + 2.4, 9);
    win(g2, "x", 4, 5.6, z2 + 1.1, z2 + 2.4, 9);
    box(g2, .3, .3, z2, 2.5, 1.15, .7, "#eef0f2", 6);
    box(g2, .45, .45, z2 + .45, 2.2, .85, .26, "#9ec4e0", 6);
    box(g2, 3, .3, z2, .6, .7, .62, "#e6e8ea", 6);
    box(g2, 3.75, .3, z2, 1, .6, 1, "#1f2328", 6);
    box(g2, 1.2, .31, z2 + 2.45, .7, .12, .4, "#8d949b", 8);
    box(g2, 6.3, 3.3, z2, 2.6, 3, .55, "#2a2e34");
    box(g2, 6.3, 3.3, z2 + .55, 2.6, .5, .25, "#ffffff");
    box(g2, 6.3, 3.3, z2, .25, 3, 1.3, "#1f2328");
    box(g2, 8.95, 3.3, z2, .8, .8, .6, "#b8a588");
    box(g2, 5.4, 5.2, z2, 1, .7, .05, "#3a4a63", 7);
    box(g2, .45, 5.25, z2, .55, 1.1, H, "#2b2e33", 12);
    // attic and roof
    var z3 = 22.2, g3 = el("g", { "class": "lvl", style: "--i:3" }, svg);
    face(g3, [[-.4, -.4, z3], [10.4, -.4, z3], [10.4, 3.5, z3 + 4], [-.4, 3.5, z3 + 4]], "#1d2024", 1, "roof");
    for (var k = 1; k < 9; k++) { var t = k / 9; line(g3, [-.4, -.4 + 3.9 * t, z3 + 4 * t], [10.4, -.4 + 3.9 * t, z3 + 4 * t], "#2c3036", 1.1, 1); }
    line(g3, [-.4, -.4, z3 - .05], [10.4, -.4, z3 - .05], "#9aa3ab", 2.4, 1);
    face(g3, [[.31, 0, z3], [.31, 7, z3], [.31, 3.5, z3 + 3.7]], "#2a2d31", 10);
    box(g3, 0, 0, z3 - .35, W, D, .35, "#3a3d42", 10, "st");
    box(g3, .3, .3, z3, 9.4, 6.4, .22, "#e6e9ec", 11);
    for (var j = 1; j < 9; j++) line(g3, [.3 + j * 1.05, .4, z3 + .23], [.3 + j * 1.05, 6.6, z3 + .23], "#c3c9d0", 1, 11);
    box(g3, .45, 5.25, z3, .55, 1.1, 5, "#2b2e33", 12);
    box(g3, .35, 5.15, z3 + 5, .75, 1.3, .25, "#16181b", 12);
    for (var x = .2; x <= 10; x += 1.3) line(g3, [x, 7.4, z3], [x, 3.5, z3 + 4], "#dfe3e8", 1.4, 10);
    line(g3, [-.4, 3.5, z3 + 4], [10.4, 3.5, z3 + 4], "#f2f4f6", 2, 10);
    line(g3, [-.4, 7.4, z3], [10.4, 7.4, z3], "#dfe3e8", 1.6, 10);
    box(g3, 2.5, 3.3, z3 + 3.95, 5.5, .4, .18, "#8d949b", 8);
    box(g3, 7.6, 1.6, z3 + 1.7, .6, .5, .45, "#8d949b", 8);
    // ---------- system overlays: what each system actually looks like inside the house ----------
    var ovRoot = el("g", { "class": "ovs" }, svg);
    var path3 = function (g, pts3, cls, w) {
      var d = pts3.map(function (p, i) { var q = P(p[0], p[1], p[2]); return (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" ");
      var base = el("path", { d: d, "class": "ov-line " + (cls || ""), "stroke-width": w || 2.4, pathLength: 1 }, g);
      el("path", { d: d, "class": "ov-flow " + (cls || ""), "stroke-width": Math.max(1, (w || 2.4) * .45) }, g);
      return base;
    };
    var dot3 = function (g, p, r, cls) { var q = P(p[0], p[1], p[2]); return el("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: r || 3, "class": "ov-dot " + (cls || "") }, g); };
    var ov = function (n) { return el("g", { "class": "ov", "data-ov": n }, ovRoot); };
    var o;
    // 1 roofing: gutters, downspout, flashing, shingle courses
    o = ov(1);
    path3(o, [[-.4, -.45, z3 - .05], [10.4, -.45, z3 - .05]], "c-roof", 3.4);
    path3(o, [[10.4, -.45, z3 - .05], [10.4, -.45, Z1 - .4], [11.6, -.45, Z1 - .4]], "c-roof", 3);
    path3(o, [[.35, 5.15, z3 + 2.6], [1.15, 5.15, z3 + 2.6], [1.15, 6.45, z3 + 2.6]], "c-roof", 2);
    for (var r1 = 1; r1 < 5; r1++) { var t1 = r1 / 5; path3(o, [[0, -.4 + 3.9 * t1, z3 + 4 * t1], [10, -.4 + 3.9 * t1, z3 + 4 * t1]], "c-roof thin", 1.2); }
    // 2 exterior: grading arrows carrying water away, walkway and steps
    o = ov(2);
    [[11, 1], [11, 3.5], [11, 6], [3, 8], [7, 8]].forEach(function (a) {
      var away = a[1] === 8 ? [a[0], 9.8, Z1 - .38] : [13.8, a[1], Z1 - .38];
      path3(o, [[a[0], a[1], Z1 - .38], away], "c-ext", 2.2);
      dot3(o, away, 3.4, "c-ext");
    });
    path3(o, [[3.9, 7.1, Z1 - .38], [5.9, 7.1, Z1 - .38], [5.9, 10.4, Z1 - .38], [3.9, 10.4, Z1 - .38], [3.9, 7.1, Z1 - .38]], "c-ext thin", 1.4);
    // 3 structure: wall studs, floor joists, beam and posts
    o = ov(3);
    [z1, z2].forEach(function (zz) {
      for (var sy = .9; sy < 7; sy += 1.2) path3(o, [[.32, sy, zz], [.32, sy, zz + 3]], "c-str thin", 1.2);
      for (var sx = 1.2; sx < 10; sx += 1.2) path3(o, [[sx, .32, zz], [sx, .32, zz + 3]], "c-str thin", 1.2);
      for (var jx = .6; jx < 10; jx += .9) path3(o, [[jx, 7, zz - .35], [jx, 7, zz - .02]], "c-str", 1.6);
    });
    path3(o, [[0, 3.5, 2.95], [10, 3.5, 2.95]], "c-str", 4);
    [3, 6.5].forEach(function (px) { path3(o, [[px, 3.5, 0], [px, 3.5, 2.95]], "c-str", 3); });
    // 4 foundation: footing, perimeter drain, a crack and the sump
    o = ov(4);
    path3(o, [[0, 7.2, -.4], [10.2, 7.2, -.4], [10.2, 0, -.4]], "c-fnd", 3.2);
    path3(o, [[.2, 7.5, -.55], [10.5, 7.5, -.55], [10.5, .2, -.55], [8, 5.3, -.2], [7.95, 5.35, .05]], "c-fnd dash", 1.8);
    path3(o, [[4.6, .32, 2.6], [4.75, .32, 2.1], [4.55, .32, 1.6], [4.8, .32, 1.0], [4.65, .32, .5]], "c-fnd", 1.6);
    dot3(o, [7.95, 5.35, .14], 5, "c-fnd");
    // 5 electrical: service panel, circuits up through the floors, outlets and lights
    o = ov(5);
    path3(o, [[.5, 5.15, 2.3], [.36, 4.3, 2.3], [.36, 4.3, z2 + 2.8]], "c-ele", 2.4);
    path3(o, [[.36, 4.3, z1 + .4], [.36, 1.0, z1 + .4], [5, .36, z1 + 1.35], [8.8, .36, z1 + 1.35]], "c-ele", 1.8);
    path3(o, [[.36, 4.3, z1 + 2.9], [6.8, 3.05, z1 + 2.9], [6.8, 3.05, z1 + 2.2]], "c-ele", 1.8);
    path3(o, [[.36, 4.3, z2 + .4], [.36, 1.6, z2 + .4]], "c-ele", 1.8);
    path3(o, [[.36, 4.3, z2 + 2.9], [7.6, 4.8, z2 + 2.9], [7.6, 4.8, z2 + 2.4]], "c-ele", 1.8);
    [[.36, 3, z1 + .4], [.36, 1.6, z1 + .4], [6, .36, z1 + 1.35], [8.2, .36, z1 + 1.35], [.36, 2.4, z2 + .4]].forEach(function (p) { dot3(o, p, 3.2, "c-ele box"); });
    [[6.8, 3.05, z1 + 2.15], [7.6, 4.8, z2 + 2.35]].forEach(function (p) { dot3(o, p, 6, "c-ele bulb"); });
    // 6 plumbing: cold and hot supply from the water heater, drains down to the sewer
    o = ov(6);
    path3(o, [[3.6, 1.7, .25], [4.7, 1.7, .25], [4.7, .62, .25], [4.7, .62, z2 + .6]], "c-cold", 2.4);
    path3(o, [[4.7, .62, z1 + .95], [5.8, .62, z1 + .95], [5.8, .62, z1 + 1.15]], "c-cold", 2);
    path3(o, [[4.7, .62, z2 + .6], [2.6, .62, z2 + .6]], "c-cold", 2);
    path3(o, [[3.95, .98, 2.05], [3.95, .98, 2.5], [4.95, .98, 2.5], [4.95, .52, 2.5], [4.95, .52, z2 + .75]], "c-hot", 2.4);
    path3(o, [[4.95, .52, z1 + 1.05], [5.95, .52, z1 + 1.05], [5.95, .52, z1 + 1.15]], "c-hot", 2);
    path3(o, [[4.95, .52, z2 + .75], [2.4, .52, z2 + .75]], "c-hot", 2);
    path3(o, [[3.3, .62, z2 + .3], [3.3, .45, z2 - .1], [3.3, .45, .12], [3.3, 7.4, .12]], "c-drain", 3.6);
    path3(o, [[5.6, .6, z1 + .9], [3.3, .6, z1 + .5]], "c-drain", 2.6);
    [[5.8, .62, z1 + 1.15], [5.95, .52, z1 + 1.15], [2.6, .62, z2 + .6], [4.25, .62, z2 + .9], [3.3, .62, z2 + .4]].forEach(function (p) { dot3(o, p, 3, "c-fix"); });
    // 7 HVAC: supply trunk, risers to each floor, registers and the AC line set
    o = ov(7);
    path3(o, [[1.95, 1, 3.0], [1.95, 3.6, 2.9], [8.3, 3.6, 2.9]], "c-hvac", 7);
    path3(o, [[3.1, 3.6, 2.9], [3.1, 3.6, z1]], "c-hvac", 5);
    path3(o, [[8.3, 3.6, 2.9], [8.3, 3.6, z1]], "c-hvac", 5);
    path3(o, [[5.9, 5.55, 2.9], [5.9, 5.55, z2]], "c-hvac", 5);
    path3(o, [[12.6, 2.05, Z1 + .6], [10.2, 2.05, Z1 + .6], [10.2, 2.05, 2.5], [2.7, 1, 2.5]], "c-line", 1.6);
    [[3.1, 3.6, z1 + .02], [8.3, 3.6, z1 + .02], [5.9, 5.55, z2 + .02]].forEach(function (p) { dot3(o, p, 5, "c-hvac vent"); });
    // 8 ventilation: bath fan and kitchen hood ducts out, attic air in at the soffit and out at the ridge
    o = ov(8);
    path3(o, [[1.55, .45, z2 + 2.85], [1.55, .45, z3 + .6], [1.55, 1.2, z3 + 1.3]], "c-air", 2.6);
    path3(o, [[6.9, .62, z1 + 2.5], [9.6, .62, z1 + 2.9], [9.6, .62, z3 + .2], [9.2, 1.4, z3 + 1.4]], "c-air", 2.6);
    path3(o, [[5, 7.3, z3 + .3], [5, 5.4, z3 + 1.6], [5, 3.6, z3 + 4.2]], "c-air", 2.2);
    path3(o, [[8, 7.3, z3 + .3], [8, 5.4, z3 + 1.6], [8, 3.6, z3 + 4.2]], "c-air", 2.2);
    [[1.55, 1.2, z3 + 1.3], [9.2, 1.4, z3 + 1.4], [5, 3.6, z3 + 4.25], [8, 3.6, z3 + 4.25]].forEach(function (p) { dot3(o, p, 3.4, "c-air"); });
    // 9 interior: windows, doors and the stairs
    o = ov(9);
    [[5.4, 7.4, z1], [6.6, 8.6, z2]].forEach(function (w) { path3(o, [[w[0], .33, w[2] + 1.1], [w[1], .33, w[2] + 1.1], [w[1], .33, w[2] + 2.4], [w[0], .33, w[2] + 2.4], [w[0], .33, w[2] + 1.1]], "c-int", 2); });
    [[1.4, 3, z1], [4, 5.6, z2]].forEach(function (w) { path3(o, [[.33, w[0], w[2] + 1.1], [.33, w[1], w[2] + 1.1], [.33, w[1], w[2] + 2.4], [.33, w[0], w[2] + 2.4], [.33, w[0], w[2] + 1.1]], "c-int", 2); });
    path3(o, [[5.06, 1.4, z2], [5.06, 1.4, z2 + 2.2], [5.06, 2.4, z2 + 2.2], [5.06, 2.4, z2]], "c-int", 2);
    path3(o, [[6.2, 6.95, z1 + .9], [9.4, 6.95, z1 + 3.9]], "c-int", 2);
    // 10 attic: rafters, sheathing and a flashlight sweep
    o = ov(10);
    for (var rx = .2; rx <= 10; rx += 1.3) path3(o, [[rx, -.4, z3], [rx, 3.5, z3 + 4], [rx, 7.4, z3]], "c-att", 1.6);
    path3(o, [[-.4, 3.5, z3 + 4], [10.4, 3.5, z3 + 4]], "c-att", 2.4);
    var beamA = P(2.2, 6, z3 + .4), beamB = P(6.5, 1, z3 + 2.4), beamC = P(4.6, .2, z3 + 3.2);
    el("polygon", { points: [beamA, beamB, beamC].map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "), "class": "ov-beam" }, o);
    // 11 insulation: attic blanket and wall cavities
    o = ov(11);
    for (var ix = .5; ix < 9.8; ix += .55) path3(o, [[ix, .4, z3 + .25], [ix + .28, .4, z3 + .42], [ix + .55, .4, z3 + .25]], "c-ins", 1.4);
    for (var iy = .5; iy < 6.6; iy += .55) path3(o, [[.4, iy, z3 + .25], [.4, iy + .28, z3 + .42], [.4, iy + .55, z3 + .25]], "c-ins", 1.4);
    [z1, z2].forEach(function (zz) { for (var wy = .6; wy < 6.8; wy += .5) path3(o, [[.18, wy, zz + .2], [.18, wy + .25, zz + 2.8]], "c-ins thin", 1); });
    // 12 installed systems: appliances, fireplace and chimney flue
    o = ov(12);
    path3(o, [[.72, 5.8, z1 + 1.5], [.72, 5.8, z3 + 5.3]], "c-app dash", 2.4);
    [[7, .75, z1 + 1.15], [9.4, .8, z1 + 2.35], [.7, 5.85, z1 + .6], [6.9, .55, z1 + 2.15]].forEach(function (p) { dot3(o, p, 5, "c-app ring"); });
    // the twelve markers: [x, y, z] anchor for each system
    var A = { 1: [5.5, 1.4, z3 + 1.8], 2: [14.4, 5.2, Z1 - .3], 3: [10, 7, z2 - .2], 4: [5.2, .3, 1.5], 5: [.5, 5.15, 1.6], 6: [3.95, 1, 2.1], 7: [1.95, 1, 2.6], 8: [5.2, 3.5, z3 + 4.2], 9: [6.4, .32, z1 + 1.75], 10: [3.6, 6, z3 + 1.6], 11: [7.2, 5.4, z3 + .25], 12: [1.1, 5.85, z1 + .55] };
    var names = {}; $$(".wwi-chip").forEach(function (c) { names[c.getAttribute("data-n")] = c.textContent.replace(/^\d+/, ""); });
    var pins = el("g", { "class": "pins" }, svg);
    var scan = el("g", { "class": "scan" }, pins);
    el("circle", { r: 26, "class": "scan-ring" }, scan);
    el("circle", { r: 26, "class": "scan-pulse" }, scan);
    el("path", { d: "M18.4 18.4l14 14", "class": "scan-handle" }, scan);
    Object.keys(A).forEach(function (n) {
      var q = P(A[n][0], A[n][1], A[n][2]);
      var p = el("g", { "class": "pin", "data-n": n, transform: "translate(" + q[0].toFixed(1) + " " + q[1].toFixed(1) + ")", tabindex: "-1" }, pins);
      el("circle", { r: 10.5 }, p);
      var t = el("text", { y: 4, "text-anchor": "middle" }, p); t.textContent = n;
    });
    var tag = el("g", { "class": "tag" }, pins);
    var tagBg = el("rect", { rx: 6, height: 26, y: -48 }, tag);
    var tagTx = el("text", { y: -31, x: 12 }, tag);
    el("line", { x1: 0, y1: -22, x2: 0, y2: -12, "class": "tag-lead" }, tag);
    host.appendChild(svg);
    // fit the frame to the drawing (from its own geometry, so it works even before the section is on screen)
    var VB = BB.x2 > BB.x1 ? { x: BB.x1 - 24, y: BB.y1 - 56, w: BB.x2 - BB.x1 + 48, h: BB.y2 - BB.y1 + 80 } : { x: -300, y: -150, w: 600, h: 560 };
    svg.setAttribute("viewBox", [VB.x, VB.y, VB.w, VB.h].map(function (v) { return v.toFixed(1); }).join(" "));

    // tour state
    var arts = Array.prototype.slice.call(wrap.querySelectorAll(".sys")), chips = $$(".wwi-chip"), cur = 0, playing = !still, timer = null, DUR = 6500;
    var bar = wrap.querySelector(".wwi-progress i"), playBtn = wrap.querySelector("[data-wwi-play]");
    var show = function (n, fromUser) {
      n = ((n - 1 + 12) % 12) + 1; cur = n; wrap.classList.add("in");
      arts.forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-n") == n); });
      chips.forEach(function (c) { var on = c.getAttribute("data-n") == n; c.classList.toggle("on", on); c.setAttribute("aria-pressed", on); });
      Array.prototype.slice.call(svg.querySelectorAll(".it")).forEach(function (e) { e.classList.toggle("hl", e.getAttribute("data-s") == n); });
      Array.prototype.slice.call(svg.querySelectorAll(".pin")).forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-n") == n); });
      Array.prototype.slice.call(svg.querySelectorAll(".ov")).forEach(function (o) { o.classList.toggle("on", o.getAttribute("data-ov") == n); });
      svg.classList.add("focus");
      var q = P(A[n][0], A[n][1], A[n][2]);
      scan.style.transform = "translate(" + q[0].toFixed(1) + "px," + q[1].toFixed(1) + "px)";
      tagTx.textContent = (names[n] || "").trim();
      var w = Math.max(60, tagTx.getComputedTextLength ? tagTx.getComputedTextLength() + 24 : 120);
      tagBg.setAttribute("width", w); tagBg.setAttribute("x", 0);
      var tx = Math.min(Math.max(q[0] - w / 2, VB.x + 6), VB.x + VB.w - 6 - w);
      tag.style.transform = "translate(" + tx.toFixed(1) + "px," + (q[1] - 8).toFixed(1) + "px)";
      tag.querySelector(".tag-lead").setAttribute("x1", (q[0] - tx).toFixed(1)); tag.querySelector(".tag-lead").setAttribute("x2", (q[0] - tx).toFixed(1));
      tagTx.setAttribute("x", 12);
      if (fromUser) pause();
      restartBar();
    };
    var restartBar = function () {
      if (!bar) return;
      bar.style.transition = "none"; bar.style.width = "0";
      if (!playing) return;
      void bar.offsetWidth; bar.style.transition = "width " + DUR + "ms linear"; bar.style.width = "100%";
      clearTimeout(timer); timer = setTimeout(function () { show(cur + 1); }, DUR);
    };
    var pause = function () { playing = false; clearTimeout(timer); wrap.classList.add("paused"); playBtn.setAttribute("aria-label", "Play tour"); restartBar(); };
    var play = function () { playing = true; wrap.classList.remove("paused"); playBtn.setAttribute("aria-label", "Pause tour"); show(cur + 1); };
    playBtn.addEventListener("click", function () { playing ? pause() : play(); });
    wrap.querySelector("[data-wwi-prev]").addEventListener("click", function () { show(cur - 1, true); });
    wrap.querySelector("[data-wwi-next]").addEventListener("click", function () { show(cur + 1, true); });
    chips.forEach(function (c) { c.addEventListener("click", function () { show(+c.getAttribute("data-n"), true); }); });
    Array.prototype.slice.call(svg.querySelectorAll(".pin")).forEach(function (p) { p.addEventListener("click", function () { show(+p.getAttribute("data-n"), true); }); });
    if (!playing) wrap.classList.add("paused");
    // start the tour when the house scrolls into view
    var started = false, start = function () { if (started) return; started = true; wrap.classList.add("in"); show(1); };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { start(); io.disconnect(); } }); }, { threshold: .25 });
      io.observe(host);
    } else start();
    // pause while the tab is hidden or the section is off screen
    document.addEventListener("visibilitychange", function () { if (!started) return; if (document.hidden) clearTimeout(timer); else if (playing) restartBar(); });
  })();

  // Footer year
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
