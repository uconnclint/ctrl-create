/* ============================================================================
 * CTRL+CREATE — splash.js
 * The start screen kids land on. From here they can:
 *   • start a brand-new project
 *   • continue a saved one (thumbnail cards)
 *   • (grown-ups) open the teacher guide
 * Overlays the editor, which boots underneath. Choosing an option hides it.
 * A 🏠 Home button in the top bar brings it back so kids can switch projects.
 * ==========================================================================*/
(function () {
  "use strict";
  const S = window.CtrlCreate;
  if (!S) return;
  const el = S.el;

  /* ---------------------------------------------------------------- style -- */
  document.head.appendChild(el("style", { text: `
    #splash{position:fixed;inset:0;z-index:700;display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:18px;padding:24px;box-sizing:border-box;overflow:auto;
      background:#e8ddc7;
      background-image:
        radial-gradient(circle at 20% 30%, rgba(255,255,255,.18) 0 2px, transparent 2px),
        radial-gradient(circle at 70% 60%, rgba(58,50,38,.05) 0 2px, transparent 2px),
        repeating-linear-gradient(115deg, rgba(255,255,255,.05) 0 3px, transparent 3px 7px);
      background-size:44px 44px, 60px 60px, auto;
      animation:splash-in .28s ease-out}
    #splash.hiding{animation:splash-out .26s ease-in forwards}
    @keyframes splash-in{from{opacity:0}to{opacity:1}}
    @keyframes splash-out{from{opacity:1}to{opacity:0;visibility:hidden}}
    @media (prefers-reduced-motion:reduce){#splash,#splash.hiding{animation:none}}

    .splash-brand{text-align:center;transform:rotate(-1deg)}
    .splash-mark{font-size:56px;line-height:1;display:inline-block;transform:rotate(-8deg)}
    .splash-title{font:900 46px/1 -apple-system,"SF Pro Rounded","Segoe UI",ui-rounded,sans-serif;
      color:#3a3226;letter-spacing:.5px;margin:6px 0 0}
    .splash-tag{font:700 14px -apple-system,"SF Pro Rounded",sans-serif;color:#8a7f68;
      text-transform:uppercase;letter-spacing:2px;margin-top:4px}

    .splash-new{border:none;cursor:pointer;background:#59c059;color:#fff;
      font:900 20px -apple-system,"SF Pro Rounded",sans-serif;padding:16px 34px;border-radius:16px;
      box-shadow:4px 6px 0 rgba(58,50,38,.3);transform:rotate(.6deg);transition:transform .1s}
    .splash-new:hover{transform:rotate(0) translateY(-2px)}
    .splash-new:active{transform:translate(1px,2px);box-shadow:2px 3px 0 rgba(58,50,38,.3)}
    .splash-new:focus-visible{outline:3px solid #3373cc;outline-offset:3px}

    .splash-continue{width:100%;max-width:760px}
    .splash-continue h2{text-align:center;font:800 15px -apple-system,"SF Pro Rounded",sans-serif;
      color:#6b6152;text-transform:uppercase;letter-spacing:1.5px;margin:4px 0 12px;
      display:flex;align-items:center;gap:10px;justify-content:center}
    .splash-continue h2::before,.splash-continue h2::after{content:"";flex:1;max-width:120px;
      border-top:2px dashed rgba(58,50,38,.25)}
    .splash-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
    .splash-proj{background:#fbf6ea;border:2px solid #cbbfa5;border-radius:14px;padding:8px;cursor:pointer;
      text-align:center;box-shadow:3px 4px 0 rgba(58,50,38,.18);transition:transform .1s,box-shadow .1s;
      display:flex;flex-direction:column;gap:6px}
    .splash-proj:nth-child(even){transform:rotate(-.7deg)}
    .splash-proj:nth-child(odd){transform:rotate(.7deg)}
    .splash-proj:hover{transform:rotate(0) translateY(-3px);box-shadow:4px 6px 0 rgba(58,50,38,.24)}
    .splash-proj:focus-visible{outline:3px solid #3373cc;outline-offset:2px}
    .splash-proj .thumb{width:100%;aspect-ratio:4/3;border-radius:9px;object-fit:cover;
      background:#efe6d2;border:1.5px solid #d8cbae;display:flex;align-items:center;justify-content:center;
      font-size:30px;color:#c7ba9c}
    .splash-proj .pname{font:800 13px -apple-system,"SF Pro Rounded",sans-serif;color:#3a3226;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .splash-proj .pdate{font:600 10px -apple-system,"SF Pro Rounded",sans-serif;color:#9a8f78}

    .splash-teacher{margin-top:6px}
    .splash-teacher a{font:700 12px -apple-system,"SF Pro Rounded",sans-serif;color:#6b6152;
      text-decoration:none;background:rgba(251,246,234,.85);border:1.5px solid #d8cbae;border-radius:999px;
      padding:7px 16px;display:inline-flex;gap:6px;align-items:center;box-shadow:2px 2px 0 rgba(58,50,38,.15)}
    .splash-teacher a:hover{background:#fff}

    /* top-bar Home button (injected) */
    #btn-home{order:-1}

    body.on-splash #topbar,body.on-splash #layout{filter:none}
  ` }));

  /* --------------------------------------------------------------- helpers - */
  function humanDate(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso), now = new Date();
      const day = 86400000;
      const midnight = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
      const diff = Math.round((midnight(now) - midnight(d)) / day);
      if (diff <= 0) return "today";
      if (diff === 1) return "yesterday";
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) { return ""; }
  }

  /* ------------------------------------------------------------- build DOM - */
  const grid = el("div", { class: "splash-grid" });
  const continueWrap = el("div", { class: "splash-continue" }, [
    el("h2", { text: "Continue a project" }), grid,
  ]);

  const overlay = el("div", { id: "splash", role: "dialog", "aria-label": "Ctrl+Create start screen" }, [
    el("div", { class: "splash-brand" }, [
      el("div", { class: "splash-mark", text: "✂" }),
      el("h1", { class: "splash-title", text: "Ctrl+Create" }),
      el("div", { class: "splash-tag", text: "papercut code studio" }),
    ]),
    el("button", { class: "splash-new", text: "✨ Start a New Project", onClick: newProject }),
    continueWrap,
    el("div", { class: "splash-teacher" }, [
      el("a", {
        href: "./teacher-guide.html", target: "_blank", rel: "noopener",
        html: "🍎 Grown-Ups’ Corner (Teacher Guide &amp; Standards)",
      }),
    ]),
  ]);
  document.body.appendChild(overlay);

  function renderContinue() {
    grid.innerHTML = "";
    const list = (S.projectIO && S.projectIO.list()) || [];
    continueWrap.style.display = list.length ? "" : "none";
    list.slice(0, 8).forEach((p) => {
      const thumb = p.thumb
        ? el("img", { class: "thumb", src: p.thumb, alt: "" })
        : el("div", { class: "thumb", text: "✂" });
      const card = el("div", {
        class: "splash-proj", role: "button", tabindex: "0",
        "aria-label": "Open project " + p.name,
        onClick: () => openProject(p.id),
        onKeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProject(p.id); } },
      }, [thumb, el("div", { class: "pname", text: p.name }), el("div", { class: "pdate", text: humanDate(p.updated) })]);
      grid.appendChild(card);
    });
  }

  /* ------------------------------------------------------------- actions -- */
  function enterEditor() {
    overlay.classList.add("hiding");
    document.body.classList.remove("on-splash");
    setTimeout(() => { overlay.style.display = "none"; overlay.classList.remove("hiding"); }, 260);
    if (S.sound) { S.sound.init(); S.sound.play("Whoosh"); }
  }

  function newProject() {
    const make = (name) => {
      if (S.projectIO) S.projectIO.create(name || "My Project");
      enterEditor();
    };
    if (S.textPrompt) S.textPrompt("Name your new project", "My Game").then((v) => { if (v) make(v); });
    else make("My Project");
  }

  function openProject(id) {
    if (S.projectIO) S.projectIO.open(id);
    enterEditor();
  }

  function show() {
    if (S.projectIO && S.projectIO.saveCurrent) { try { S.projectIO.saveCurrent(); } catch (e) {} }
    renderContinue();
    overlay.style.display = "flex";
    overlay.classList.remove("hiding");
    document.body.classList.add("on-splash");
    const first = overlay.querySelector(".splash-new");
    if (first) setTimeout(() => first.focus(), 40);
  }
  function hide() { enterEditor(); }

  // Escape returns to the editor only if a project is already loaded.
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.display !== "none" && S.projectIO && S.projectIO.currentId()) {
      enterEditor();
    }
  });

  S.on("projects:changed", () => { if (overlay.style.display !== "none") renderContinue(); });

  /* ---------------------------------------------------- top-bar Home button */
  const homeBtn = el("button", { id: "btn-home", class: "hud-chip", title: "Home (switch projects)",
    "aria-label": "Home — switch projects", html: "🏠 Home", onClick: show });
  const hud = document.querySelector(".player-hud");
  if (hud) hud.insertBefore(homeBtn, hud.firstChild);

  S.splash = { show, hide, renderContinue };

  // Show on first load (after projectIO has booted its index).
  renderContinue();
  document.body.classList.add("on-splash");
  overlay.style.display = "flex";
})();
