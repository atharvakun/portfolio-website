/* ============================================================================
   SUPPLAR — site interactions
   ========================================================================= */

/* ─── SITE CONFIG ─────────────────────────────────────────────────────────── */
const siteConfig = {
  companyName: "SUPPLAR",
  email: "info@supplar.in",
  phone: "7070 9090 61",
  phoneHref: "+917070909061",
  location: "Pune, Maharashtra, India",
};

function applySiteConfig() {
  document.querySelectorAll("[data-company]").forEach((n) => (n.textContent = siteConfig.companyName));
  document.querySelectorAll("[data-email-link]").forEach((n) => {
    n.textContent = siteConfig.email;
    n.setAttribute("href", `mailto:${siteConfig.email}`);
  });
  document.querySelectorAll("[data-phone-link]").forEach((n) => {
    n.textContent = siteConfig.phone;
    n.setAttribute("href", `tel:${siteConfig.phoneHref}`);
  });
  document.querySelectorAll("[data-location]").forEach((n) => (n.textContent = siteConfig.location));
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
}

/* ─── HEADER SCROLL STATE ─────────────────────────────────────────────────── */
function setupHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ─── MOBILE NAV ──────────────────────────────────────────────────────────── */
function setupMobileNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

/* ─── REVEAL ON SCROLL ────────────────────────────────────────────────────── */
function setupReveals() {
  const nodes = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !nodes.length) {
    nodes.forEach((n) => n.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        obs.unobserve(e.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  nodes.forEach((n) => io.observe(n));
}

/* ─── PAGE PROGRESS BAR ───────────────────────────────────────────────────── */
function setupPageProgress() {
  const bar = document.getElementById("page-progress");
  if (!bar) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : "0%";
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* ─── HERO SHOWCASE (scroll-driven harness → winding animation) ───────────── */
function setupShowcase() {
  const showcase = document.getElementById("showcase");
  const svg = document.getElementById("hx-svg");
  if (!showcase || !svg) return;

  const wires = [...svg.querySelectorAll(".hx-wire")];
  const flows = [...svg.querySelectorAll(".hx-flow")];
  const nodes = [...svg.querySelectorAll(".hx-node")];
  const leads = [...svg.querySelectorAll(".hx-lead")];
  const ticks = [...svg.querySelectorAll(".hx-tick")];
  const feeder = document.getElementById("hx-feeder");
  const grid   = document.querySelector(".hx-grid");
  const harnessG = document.getElementById("hx-harness-scene");
  const windingG = document.getElementById("hx-winding-scene");
  const turnsN   = document.getElementById("hx-turns-n");
  const progFill = document.getElementById("stage-progress-fill");
  const pHero = document.getElementById("hx-hero");
  const pHarn = document.getElementById("hx-card-harness");
  const pWind = document.getElementById("hx-card-winding");
  const cue   = pHero ? pHero.querySelector(".hero-cue") : null;

  // build the coil rings around the stator core
  const NRING = 18, x0 = 398, x1 = 802, cy = 280, ry = 64, rx = 15;
  const ringsG = document.getElementById("hx-rings");
  const rings = [];
  for (let i = 0; i < NRING; i++) {
    const cx = x0 + ((x1 - x0) * i) / (NRING - 1);
    const e = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    e.setAttribute("class", "hx-ring");
    e.setAttribute("cx", cx); e.setAttribute("cy", cy);
    e.setAttribute("rx", rx); e.setAttribute("ry", ry);
    ringsG.appendChild(e); rings.push(e);
  }
  wires.forEach((w) => {
    const L = w.getTotalLength();
    w.style.strokeDasharray = L; w.style.strokeDashoffset = L; w.dataset.len = L;
  });

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a || 1e-6), 0, 1);
  const ease = (t) => t * t * (3 - 2 * t);
  const sv = (el) => el.dataset.seg.split(",").map(Number);

  function render(p) {
    // harness self-draws, then fades to make way for the winding
    const hOut = ease(seg(p, 0.56, 0.66));
    harnessG.style.opacity = 1 - hOut;
    wires.forEach((w) => { const [a, b] = sv(w);
      w.style.strokeDashoffset = w.dataset.len * (1 - ease(seg(p, a, b))); });
    nodes.forEach((n) => { const [a, b] = sv(n); const d = ease(seg(p, a, b));
      n.style.opacity = d; n.style.transform = `scale(${0.82 + 0.18 * d})`; });
    flows.forEach((f) => { f.style.opacity = 0.9 * ease(seg(p, 0.46, 0.58)); });
    ticks.forEach((g) => { const [a, b] = sv(g); g.style.opacity = ease(seg(p, a, b)); });

    // winding builds up turn by turn
    windingG.style.opacity = ease(seg(p, 0.60, 0.70));
    leads.forEach((l) => { l.style.opacity = ease(seg(p, 0.62, 0.72)); });
    const wound = ease(seg(p, 0.66, 0.96));
    const lit = wound * NRING;
    rings.forEach((r, i) => { r.style.opacity = clamp(lit - i, 0, 1); });
    if (turnsN) turnsN.textContent = Math.round(wound * 54);

    // feeder marker tracks the active turn, then steps aside when done
    if (feeder) {
      feeder.setAttribute("transform", `translate(${398 + (802 - 398) * wound},0)`);
      feeder.style.opacity = ease(seg(p, 0.66, 0.70)) * (1 - ease(seg(p, 0.94, 0.97)));
    }
    if (grid)  grid.style.backgroundPosition = `0 ${-p * 46}px, ${-p * 46}px 0`;

    // overlay copy
    if (pHero) pHero.style.opacity = 1 - ease(seg(p, 0.08, 0.20));
    const mh = ease(seg(p, 0.34, 0.46)) * (1 - ease(seg(p, 0.56, 0.64)));
    if (pHarn) { pHarn.style.opacity = mh; pHarn.style.transform = `translateY(${10 - 10 * mh}px)`; }
    const mw = ease(seg(p, 0.72, 0.82));
    if (pWind) { pWind.style.opacity = mw; pWind.style.transform = `translateY(${10 - 10 * mw}px)`; }
    if (cue) cue.style.opacity = 1 - ease(seg(p, 0.02, 0.12));
    if (progFill) progFill.style.height = `${p * 100}%`;
  }

  function progress() {
    const rect = showcase.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp(-rect.top / scrollable, 0, 1);
  }

  let scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; render(progress()); });
  }

  // ?p=<0..1> renders a fixed scroll state (preview/tuning aid)
  const qp = new URLSearchParams(location.search).get("p");
  if (qp !== null) { render(clamp(parseFloat(qp) || 0, 0, 1)); return; }

  render(progress());
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

/* ─── PRODUCT CARDS (cursor spotlight + staggered reveal) ─────────────────── */
function setupProductCards() {
  const cards = document.querySelectorAll(".cat-section .card");
  if (!cards.length) return;

  // spotlight: feed the cursor position into each card's CSS vars
  cards.forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // staggered reveal: delay each card by its position, then clear the delay
  // once it has faded in so hover stays snappy
  document.querySelectorAll(".cat-section .card-grid").forEach((grid) => {
    Array.from(grid.children).forEach((card, i) => {
      card.style.transitionDelay = `${i * 90}ms`;
      card.addEventListener("transitionend", function clear(ev) {
        if (ev.propertyName !== "opacity") return;
        card.style.transitionDelay = "";
        card.removeEventListener("transitionend", clear);
      });
    });
  });
}

/* ─── ENQUIRY FORM ────────────────────────────────────────────────────────── */
function setupEnquiryForm() {
  const form = document.getElementById("enquiry-form");
  const note = document.getElementById("form-note");
  if (!form || !note) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const get = (k) => (d.get(k) || "").toString().trim();

    const subject = encodeURIComponent(`${get("company") || "New"} enquiry — ${get("category") || "Supplar"}`);
    const body = encodeURIComponent(
      [
        `Name: ${get("name")}`,
        `Company: ${get("company")}`,
        `Email: ${get("email")}`,
        `Phone: ${get("phone") || "Not provided"}`,
        `Category: ${get("category") || "Not selected"}`,
        "",
        "Requirement:",
        get("requirement"),
      ].join("\n")
    );

    note.textContent = "Opening your email app with a drafted enquiry…";
    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  });
}

/* ─── LIVE STATOR (winding section visual) ────────────────────────────────── */
function setupStator() {
  const g = document.getElementById("stator-g");
  if (!g) return;
  const NS = "http://www.w3.org/2000/svg";
  const N = 9;
  const el = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  for (let i = 0; i < N; i++) {
    const grp = el("g", { transform: `rotate(${i * (360 / N)} 210 210)` });
    // tooth neck: attached to the yoke's inner edge, pointing inward
    grp.appendChild(el("rect", { class: "st-tooth", x: 197, y: 26, width: 26, height: 72, rx: 3 }));
    // pole shoe: the wider T-tip near the rotor (air gap below it)
    grp.appendChild(el("rect", { class: "st-tooth", x: 184, y: 92, width: 52, height: 14, rx: 7 }));
    // winding: individual wire turns stacked along the neck
    const coil = el("g", { class: "st-coil" });
    for (let k = 0; k < 7; k++) {
      const y = 40 + k * 7.2;
      coil.appendChild(el("line", { x1: 190, y1: y, x2: 230, y2: y }));
    }
    coil.style.animationDelay = `${(i * 2.2) / N}s`;
    grp.appendChild(coil);
    g.appendChild(grp);
  }

  // transformer: winding turns across the centre limb
  const tx = document.getElementById("tx-coil");
  if (tx) for (let k = 0; k < 11; k++) {
    const y = 158 + k * 7.2;
    tx.appendChild(el("path", { d: `M163 ${y} Q210 ${y + 4} 257 ${y}` }));
  }
  // solenoid: turns along the bobbin
  const sol = document.getElementById("sol-coil");
  if (sol) for (let k = 0; k < 17; k++) {
    const x = 126 + k * 9.7;
    sol.appendChild(el("path", { d: `M${x} 162 Q${x + 4} 210 ${x} 258` }));
  }
  // pump: turns across the motor head
  const pw = document.getElementById("pw-coil");
  if (pw) for (let k = 0; k < 6; k++) {
    const y = 73 + k * 12;
    pw.appendChild(el("path", { d: `M177 ${y} Q210 ${y + 6} 243 ${y}` }));
  }
  // pump: impeller blades (spun by CSS)
  const imp = document.getElementById("pw-imp");
  if (imp) {
    for (let i = 0; i < 5; i++) {
      imp.appendChild(el("path", {
        d: "M210 286 C209 257 223 234 244 226 C251 251 239 274 216 289 Z",
        transform: `rotate(${i * 72} 210 286)`,
      }));
    }
    imp.appendChild(el("circle", { cx: 210, cy: 286, r: 11 }));
  }
}

/* ─── WINDING CHIPS: switch the product visual ────────────────────────────── */
function setupVisTabs() {
  const chips = [...document.querySelectorAll("#winding-chips li[data-vis]")];
  const panes = [...document.querySelectorAll("#winding .vis")];
  if (!chips.length || !panes.length) return;
  chips.forEach((chip) => {
    const activate = () => {
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      panes.forEach((p) => p.classList.toggle("active", p.id === chip.dataset.vis));
    };
    chip.addEventListener("click", activate);
    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); }
    });
    // ?vis=vis-transformers preselects a tab (preview aid)
    if (new URLSearchParams(location.search).get("vis") === chip.dataset.vis) activate();
  });
}

/* Harness chips: each application gets its own readable product view. */
function setupHarnessTabs() {
  const svg = document.getElementById("harness-visual");
  const chips = [...document.querySelectorAll("#harness-chips li[data-harness]")];
  if (!svg || !chips.length) return;

  const views = {
    automotive: `<path class="amb-wire t" d="M120 150H780"/><path class="harness-signal" d="M120 150H780"/><path class="amb-wire b" d="M270 150V82M450 150v82M630 150V82"/><path class="harness-signal" d="M270 150V82M450 150v82M630 150V82"/><g class="harness-dark"><rect x="55" y="119" width="80" height="62" rx="12"/><rect x="765" y="119" width="80" height="62" rx="12"/></g><g class="harness-part"><rect x="235" y="35" width="70" height="48" rx="9"/><rect x="415" y="231" width="70" height="48" rx="9"/><rect x="595" y="35" width="70" height="48" rx="9"/></g><circle class="amb-led" cx="95" cy="150" r="7"/><circle class="amb-led" cx="805" cy="150" r="7"/><text class="harness-label" x="450" y="25">VEHICLE WIRING LOOM</text>`,
    industrial: `<rect class="harness-dark" x="92" y="55" width="150" height="190" rx="10"/><rect class="harness-part" x="658" y="55" width="150" height="190" rx="10"/><path class="amb-wire t" d="M242 95C390 95 500 95 658 95M242 135h416M242 175h416M242 215h416"/><path class="harness-signal" d="M242 95C390 95 500 95 658 95M242 135h416M242 175h416M242 215h416"/><g class="harness-pin"><circle cx="167" cy="95" r="9"/><circle cx="167" cy="135" r="9"/><circle cx="167" cy="175" r="9"/><circle cx="167" cy="215" r="9"/><circle cx="733" cy="95" r="9"/><circle cx="733" cy="135" r="9"/><circle cx="733" cy="175" r="9"/><circle cx="733" cy="215" r="9"/></g><text class="harness-label" x="167" y="280">CONTROL PANEL</text><text class="harness-label" x="733" y="280">FIELD I/O</text>`,
    connector: `<path class="amb-wire t" d="M65 150H305M595 150h240"/><g class="harness-signal"><path d="M65 150H305M595 150h240"/></g><path class="harness-dark" d="M285 88h115v124H285l-28-24v-76z"/><path class="harness-part" d="M500 88h115l28 24v76l-28 24H500z"/><g class="harness-pin"><circle cx="330" cy="120" r="9"/><circle cx="370" cy="120" r="9"/><circle cx="330" cy="180" r="9"/><circle cx="370" cy="180" r="9"/><circle cx="530" cy="120" r="9"/><circle cx="570" cy="120" r="9"/><circle cx="530" cy="180" r="9"/><circle cx="570" cy="180" r="9"/></g><path class="harness-check" d="M425 151l18 18 37-42"/><text class="harness-label" x="450" y="263">CRIMPED • LOCKED • SEALED</text>`,
    continuity: `<rect class="harness-dark" x="55" y="88" width="160" height="124" rx="16"/><rect class="harness-dark" x="685" y="88" width="160" height="124" rx="16"/><path class="amb-wire t" d="M215 120H685M215 150h470M215 180h470"/><path class="harness-signal" d="M215 120H685M215 150h470M215 180h470"/><g class="harness-pin"><circle cx="135" cy="120" r="8"/><circle cx="135" cy="150" r="8"/><circle cx="135" cy="180" r="8"/><circle cx="765" cy="120" r="8"/><circle cx="765" cy="150" r="8"/><circle cx="765" cy="180" r="8"/></g><circle class="harness-part" cx="450" cy="150" r="70"/><path class="harness-check" d="M416 151l23 23 47-53"/><text class="harness-label" x="450" y="264">100% CONTINUITY PASS</text>`
  };

  const activate = (chip) => {
    chips.forEach((item) => item.classList.toggle("active", item === chip));
    svg.innerHTML = views[chip.dataset.harness];
  };
  chips.forEach((chip) => {
    chip.addEventListener("click", () => activate(chip));
    chip.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); activate(chip); }
    });
  });
  activate(chips[0]);
}

/* ─── COUNT-UP STATS ──────────────────────────────────────────────────────── */
function setupStatCounters() {
  const nodes = document.querySelectorAll(".stat strong");
  if (!nodes.length || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const m = e.target.textContent.trim().match(/^(\d+)(.*)$/);
      if (!m) return;
      const end = +m[1], suffix = m[2], t0 = performance.now(), dur = 900;
      (function step(t) {
        const k = Math.min(1, (t - t0) / dur);
        const eased = k * k * (3 - 2 * k);
        e.target.textContent = Math.round(end * eased) + suffix;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  nodes.forEach((n) => io.observe(n));
}

/* ─── PAGE-LONG COPPER WIRE ───────────────────────────────────────────────── */
function setupWirePath() {
  const wrap = document.getElementById("wirepath");
  const main = document.querySelector("main");
  if (!wrap || !main) return;
  const fill = wrap.querySelector(".wp-fill");
  const dot = wrap.querySelector(".wp-dot");
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  const sections = ["winding", "harness", "lab", "process", "contact"]
    .map((id) => document.getElementById(id)).filter(Boolean);
  let top = 0, bottom = 0, nodes = [];

  function update() {
    const h = bottom - top;
    if (h <= 0) return;
    const tip = clampN(window.scrollY + window.innerHeight * 0.62 - top, 0, h);
    fill.style.height = `${tip}px`;
    dot.style.top = `${tip}px`;
    nodes.forEach((n) => n.el.classList.toggle("lit", tip >= n.y));
  }

  function layout() {
    const docTop = main.getBoundingClientRect().top + window.scrollY;
    const first = document.querySelector(".intro-section");
    const last = document.getElementById("contact");
    if (!first || !last) return;
    top = first.getBoundingClientRect().top + window.scrollY - docTop + 40;
    bottom = last.getBoundingClientRect().bottom + window.scrollY - docTop - 90;
    wrap.style.top = `${top}px`;
    wrap.style.height = `${bottom - top}px`;
    wrap.querySelectorAll(".wp-node").forEach((n) => n.remove());
    nodes = sections.map((s) => {
      const y = s.getBoundingClientRect().top + window.scrollY - docTop + 90 - top;
      const el = document.createElement("div");
      el.className = "wp-node";
      el.style.top = `${y}px`;
      wrap.appendChild(el);
      return { el, y };
    });
    update();
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; update(); });
  }, { passive: true });
  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);
  layout();
}

/* ─── DEBUG: ?top=<px> jumps the page; ?flat=1 hides the hero (screenshots) ── */
function setupDebugScroll() {
  const params = new URLSearchParams(location.search);
  if (params.has("flat")) {
    const sc = document.getElementById("showcase");
    if (sc) sc.style.display = "none";
    window.dispatchEvent(new Event("resize"));
  }
  const t = params.get("top");
  if (t === null) return;
  document.documentElement.style.scrollBehavior = "auto";
  window.addEventListener("load", () => setTimeout(() => window.scrollTo(0, +t || 0), 80));
}

/* ─── INIT ────────────────────────────────────────────────────────────────── */
applySiteConfig();
setupHeader();
setupMobileNav();
setupProductCards();
setupReveals();
setupPageProgress();
setupShowcase();
setupEnquiryForm();
setupStator();
setupVisTabs();
setupHarnessTabs();
setupStatCounters();
setupWirePath();
setupDebugScroll();
