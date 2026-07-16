/* CtrlCreate — "My Projects" shelf dialog.
 * Loads late; DOM + CtrlCreate global fully available. IIFE, defensive throughout. */
(function () {
  "use strict";

  var S = window.CtrlCreate;
  if (!S || !S.projectIO) return;
  var IO = S.projectIO;
  var el = S.el;

  function click() { if (S.sound) try { S.sound.play("Click"); } catch (e) {} }
  function pop() { if (S.sound) try { S.sound.play("Pop"); } catch (e) {} }
  function snip() { if (S.sound) try { S.sound.play("Snip"); } catch (e) {} }

  /* ---- text prompt (feature-detect CtrlCreate.textPrompt, else inline fallback) ---- */
  function prompt(title, initial) {
    if (typeof S.textPrompt === "function") {
      try { return S.textPrompt(title, initial); } catch (e) {}
    }
    return inlinePrompt(title, initial);
  }
  function inlinePrompt(title, initial) {
    return new Promise(function (resolve) {
      var input = el("input", { class: "prj-inp", value: initial || "" });
      input.value = initial || "";
      var done = false;
      function finish(v) { if (done) return; done = true; try { back.remove(); } catch (e) {} resolve(v); }
      var box = el("div", { class: "prj-ip-box" }, [
        el("div", { class: "prj-ip-title", text: title || "" }),
        input,
        el("div", { class: "prj-ip-row" }, [
          el("button", { class: "prj-btn", text: "Cancel", onClick: function () { finish(null); } }),
          el("button", { class: "prj-btn prj-green", text: "OK", onClick: function () { finish(input.value.trim() || null); } })
        ])
      ]);
      var back = el("div", { class: "prj-ip-back" }, [box]);
      back.addEventListener("click", function (ev) { if (ev.target === back) finish(null); });
      input.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") { ev.preventDefault(); finish(input.value.trim() || null); }
        else if (ev.key === "Escape") { ev.preventDefault(); finish(null); }
      });
      document.body.appendChild(back);
      setTimeout(function () { try { input.focus(); input.select(); } catch (e) {} }, 0);
    });
  }

  /* ---- date humanizer ---- */
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function humanDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    function midnight(x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); }
    var days = Math.round((midnight(new Date()) - midnight(d)) / 86400000);
    if (days <= 0) return "today";
    if (days === 1) return "yesterday";
    return MON[d.getMonth()] + " " + d.getDate();
  }

  /* ---- styles ---- */
  var css = ""
    + "#dlg-projects .prj-head{display:flex;gap:10px;margin-bottom:16px}"
    + ".prj-btn{font:inherit;font-weight:700;cursor:pointer;color:#3a3226;background:#fbf6ea;"
    + "border:2px solid #3a3226;border-radius:8px;padding:7px 12px;box-shadow:3px 3px 0 #3a3226;"
    + "transition:transform .08s,box-shadow .08s}"
    + ".prj-btn:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 #3a3226}"
    + ".prj-btn:active{transform:translate(2px,2px);box-shadow:1px 1px 0 #3a3226}"
    + ".prj-btn:disabled{opacity:.4;cursor:default;box-shadow:2px 2px 0 #3a3226;transform:none}"
    + ".prj-green{background:#59c059;color:#12330f}"
    + ".prj-red{background:#e5533c;color:#fff}"
    + ".prj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}"
    + ".prj-card{position:relative;background:#fbf6ea;border:2px solid #3a3226;border-radius:12px;"
    + "padding:10px;box-shadow:4px 4px 0 #3a3226;transition:transform .1s,box-shadow .1s}"
    + ".prj-card:hover{transform:translate(-2px,-3px) rotate(-.5deg);box-shadow:7px 8px 0 #3a3226}"
    + ".prj-thumb{width:100%;aspect-ratio:4/3;object-fit:cover;border:2px solid #3a3226;"
    + "border-radius:8px;display:block;background:#e9dcc0}"
    + ".prj-ph{width:100%;aspect-ratio:4/3;border:2px solid #3a3226;border-radius:8px;"
    + "background:repeating-linear-gradient(45deg,#e9dcc0,#e9dcc0 10px,#e2d3b3 10px,#e2d3b3 20px);"
    + "display:flex;align-items:center;justify-content:center;font-size:38px;color:#8a795a}"
    + ".prj-name{font-weight:800;color:#3a3226;margin:8px 2px 2px;cursor:text;white-space:nowrap;"
    + "overflow:hidden;text-overflow:ellipsis}"
    + ".prj-name:hover{text-decoration:underline dotted}"
    + ".prj-date{font-size:12px;color:#8a795a;margin:0 2px 8px}"
    + ".prj-row{display:flex;gap:6px;flex-wrap:wrap}"
    + ".prj-row .prj-btn{padding:5px 9px;font-size:13px}"
    + ".prj-cur{position:absolute;top:-8px;right:-8px;background:#59c059;color:#12330f;"
    + "font-weight:800;font-size:10px;letter-spacing:.5px;padding:3px 7px;border:2px solid #3a3226;"
    + "border-radius:6px;transform:rotate(6deg);box-shadow:2px 2px 0 #3a3226}"
    + ".prj-empty{text-align:center;color:#8a795a;font-weight:700;padding:40px 10px;font-size:16px}"
    + ".prj-err{color:#e5533c;font-weight:700;font-size:13px;margin-top:8px}"
    + ".prj-ip-back{position:fixed;inset:0;background:rgba(30,24,14,.45);z-index:9999;"
    + "display:flex;align-items:center;justify-content:center}"
    + ".prj-ip-box{background:#fbf6ea;border:3px solid #3a3226;border-radius:12px;padding:18px;"
    + "box-shadow:6px 6px 0 #3a3226;min-width:280px}"
    + ".prj-ip-title{font-weight:800;color:#3a3226;margin-bottom:10px}"
    + ".prj-inp{font:inherit;width:100%;box-sizing:border-box;padding:8px;border:2px solid #3a3226;"
    + "border-radius:8px;background:#fff;color:#3a3226}"
    + ".prj-ip-row{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}";
  var style = el("style", {});
  style.textContent = css;
  document.head.appendChild(style);

  /* ---- dialog skeleton ---- */
  var body = el("div", { class: "dlg-body" });
  var head = el("div", { class: "dlg-head" }, [
    el("h2", { text: "My Projects" }),
    el("button", { class: "dlg-close", text: "✕" })
  ]);
  head.querySelector(".dlg-close").setAttribute("data-close", "");
  var dlg = el("dialog", { class: "paper-dialog" }, [head, body]);
  dlg.id = "dlg-projects";
  document.body.appendChild(dlg);

  var fileInput = el("input", { type: "file" });
  fileInput.setAttribute("accept", ".json,.ctrlcreate.json");
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);

  /* ---- open / close ---- */
  function openDialog() {
    try { IO.saveCurrent(); } catch (e) {}
    render();
    try {
      if (typeof dlg.showModal === "function") dlg.showModal();
      else dlg.setAttribute("open", "");
    } catch (e) { dlg.setAttribute("open", ""); }
  }
  function closeDialog() {
    try { if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open"); }
    catch (e) { dlg.removeAttribute("open"); }
  }
  function isOpen() { return dlg.hasAttribute("open") || (dlg.open === true); }

  dlg.addEventListener("click", function (ev) {
    if (ev.target === dlg) { click(); closeDialog(); return; }
    var t = ev.target.closest ? ev.target.closest("[data-close]") : null;
    if (t) { click(); closeDialog(); }
  });

  /* ---- render ---- */
  var errTimer = null;
  function showError(msg) {
    var box = body.querySelector(".prj-err");
    if (!box) return;
    box.textContent = msg;
    if (errTimer) clearTimeout(errTimer);
    errTimer = setTimeout(function () { if (box) box.textContent = ""; }, 3000);
  }

  function render() {
    var list = [];
    try { list = IO.list() || []; } catch (e) { list = []; }
    var cur = null;
    try { cur = IO.currentId(); } catch (e) {}

    body.textContent = "";

    var newBtn = el("button", { class: "prj-btn prj-green", text: "＋ New project", onClick: onNew });
    var impBtn = el("button", { class: "prj-btn", text: "⬆ Import", onClick: function () { click(); fileInput.value = ""; fileInput.click(); } });
    body.appendChild(el("div", { class: "prj-head" }, [newBtn, impBtn]));
    body.appendChild(el("div", { class: "prj-err" }));

    if (!list.length) {
      body.appendChild(el("div", { class: "prj-empty", text: "No projects yet — hit ＋ to start crafting!" }));
      return;
    }

    var grid = el("div", { class: "prj-grid" });
    list.forEach(function (p) { grid.appendChild(makeCard(p, cur)); });
    body.appendChild(grid);
  }

  function makeCard(p, cur) {
    var isCur = p.id === cur;
    var thumb;
    if (p.thumb) {
      thumb = el("img", { class: "prj-thumb" });
      thumb.src = p.thumb;
      thumb.alt = p.name || "";
    } else {
      thumb = el("div", { class: "prj-ph", text: "✂" });
    }

    var name = el("div", { class: "prj-name", text: p.name || "Untitled", title: "Click to rename" });
    name.addEventListener("click", function () { onRename(p); });

    var row = el("div", { class: "prj-row" });
    if (!isCur) {
      row.appendChild(el("button", { class: "prj-btn prj-green", text: "Open", onClick: function () { onOpen(p.id); } }));
    }
    row.appendChild(el("button", { class: "prj-btn", text: "⧉", title: "Duplicate", onClick: function () { onDup(p.id); } }));
    row.appendChild(el("button", { class: "prj-btn", text: "⬇", title: "Export", onClick: function () { onExport(p.id); } }));
    row.appendChild(makeDeleteBtn(p.id));

    var card = el("div", { class: "prj-card" }, [
      thumb, name,
      el("div", { class: "prj-date", text: humanDate(p.updated) }),
      row
    ]);
    if (isCur) card.appendChild(el("div", { class: "prj-cur", text: "CURRENT" }));
    return card;
  }

  function makeDeleteBtn(id) {
    var armed = false, timer = null;
    var btn = el("button", { class: "prj-btn", text: "🗑", title: "Delete" });
    btn.addEventListener("click", function () {
      if (!armed) {
        armed = true;
        btn.textContent = "Really?";
        btn.classList.add("prj-red");
        click();
        timer = setTimeout(function () {
          armed = false; btn.textContent = "🗑"; btn.classList.remove("prj-red");
        }, 2500);
        return;
      }
      if (timer) clearTimeout(timer);
      onDelete(id);
    });
    return btn;
  }

  /* ---- actions ---- */
  function onNew() {
    click();
    prompt("Name your project", "My Game").then(function (v) {
      if (v == null) return;
      try { IO.create(v); } catch (e) { return; }
      closeDialog(); pop();
    });
  }
  function onOpen(id) {
    click();
    var ok = false;
    try { ok = IO.open(id); } catch (e) { ok = false; }
    if (ok) { closeDialog(); pop(); }
  }
  function onRename(p) {
    click();
    prompt("Rename project", p.name || "").then(function (v) {
      if (v == null) return;
      try { IO.rename(p.id, v); } catch (e) {}
    });
  }
  function onDup(id) {
    click();
    try { IO.duplicate(id); } catch (e) {}
  }
  function onExport(id) {
    click();
    try { IO.exportProject(id); } catch (e) {}
  }
  function onDelete(id) {
    snip();
    try { IO.remove(id); } catch (e) {}
  }

  fileInput.addEventListener("change", function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) return;
    var pr;
    try { pr = IO.importFile(f); } catch (e) { showError("Import failed."); return; }
    if (!pr || typeof pr.then !== "function") { showError("Import failed."); return; }
    pr.then(function () { closeDialog(); pop(); })
      .catch(function () { showError("Couldn't import that file."); });
  });

  /* ---- live updates ---- */
  try {
    S.on("projects:changed", function () { if (isOpen()) render(); });
  } catch (e) {}

  /* ---- topbar button ---- */
  var trigger = document.getElementById("btn-projects");
  if (trigger) trigger.addEventListener("click", function () { click(); openDialog(); });

  /* ---- Ctrl/Cmd+S quick-save ---- */
  document.addEventListener("keydown", function (ev) {
    if ((ev.ctrlKey || ev.metaKey) && (ev.key === "s" || ev.key === "S")) {
      ev.preventDefault();
      try { IO.saveCurrent(); } catch (e) {}
      try { CtrlCreate.track("project:manualsave", { blockCount: Object.keys(CtrlCreate.workspace.blocks).length }); } catch (e) {}
    }
  });
})();
