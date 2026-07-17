/* CtrlCreate classroom and learning enhancements. */
(function () {
  "use strict";
  const S = window.CtrlCreate;
  const el = S.el;
  const SETTINGS_KEY = "ctrlcreate.settings.v2";
  function readSettings() {
    try { return Object.assign({ quiet: false, guided: true, slow: false, lowMotion: false }, JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")); }
    catch (_) { return { quiet: false, guided: true, slow: false, lowMotion: false }; }
  }
  S.settings = readSettings();
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(S.settings)); } catch (_) {}
    document.body.classList.toggle("quiet-mode", !!S.settings.quiet);
    document.body.classList.toggle("guided-mode", !!S.settings.guided);
    document.body.classList.toggle("low-motion", !!S.settings.lowMotion);
    if (S.engine && S.engine.debug) S.engine.debug.slow(!!S.settings.slow);
    S.emit("settings:changed", S.settings);
  }

  // Better accessible names for symbol-only controls and the canvas.
  [["btn-flag", "Run project"], ["btn-stop", "Stop all scripts"], ["btn-play", "Open play mode"],
   ["btn-add-sprite", "Add a sprite"], ["trash", "Delete blocks dropped here"]].forEach(([id, label]) => {
    const n = document.getElementById(id); if (n) n.setAttribute("aria-label", label);
  });
  const stageCanvas = document.getElementById("stage");
  if (stageCanvas) {
    stageCanvas.setAttribute("role", "img");
    stageCanvas.setAttribute("aria-label", "Project stage. Select a sprite below to edit its properties.");
  }

  // Persistent, live quest coach.
  const coach = el("section", { id: "quest-coach", "aria-live": "polite" }, [
    el("div", { class: "coach-kicker", text: "CURRENT QUEST" }),
    el("strong", { class: "coach-title", text: "Free build" }),
    el("div", { class: "coach-goal", text: "Create anything you can imagine." }),
    el("div", { class: "coach-steps" }),
    el("div", { class: "coach-actions" }, [
      el("button", { class: "coach-focus", text: "Show me the block" })
    ])
  ]);
  document.getElementById("workspace-wrap").appendChild(coach);
  const questTargets = {
    first_steps: ["event_flag", "motion_movesteps"], walk_the_walk: ["motion_movesteps"],
    say_hello: ["looks_say"], loop_the_loop: ["control_repeat"], key_commander: ["event_key"],
    bounce_around: ["motion_ifonedge", "control_forever"], sound_check: ["sound_play"],
    copycat_costumes: ["looks_nextcostume"], radio_star: ["event_whenbroadcast", "event_broadcast"],
    score_keeper: ["data_setvar", "data_changevar"], decision_maker: ["control_ifelse", "sensing_touching"]
  };
  let currentQuest = null;
  function refreshCoach() {
    if (!S.settings.guided) { coach.hidden = true; return; }
    coach.hidden = false;
    currentQuest = (S.game.quests || []).find((q) => {
      const st = S.game.questState(q.id); return st && st.unlocked && !st.done;
    }) || null;
    const title = coach.querySelector(".coach-title");
    const goal = coach.querySelector(".coach-goal");
    const steps = coach.querySelector(".coach-steps");
    if (!currentQuest) {
      title.textContent = "Quest trail complete"; goal.textContent = "Build, remix, and teach someone else."; steps.textContent = "";
      syncCoachRead(); return;
    }
    const st = S.game.questState(currentQuest.id);
    title.textContent = currentQuest.icon + " " + currentQuest.name;
    goal.textContent = currentQuest.goalText;
    steps.textContent = st.stepsDone.filter(Boolean).length + " of " + currentQuest.steps.length + " steps complete";
    markTargets();
    syncCoachRead();
  }

  // Keep a "Read to me" button in the coach that follows the current quest.
  let coachReadFor;
  function syncCoachRead() {
    const actions = coach.querySelector(".coach-actions");
    if (!actions || !S.voice) return;
    const id = currentQuest ? currentQuest.id : null;
    if (coachReadFor === id) return;               // already showing the right one
    const old = actions.querySelector(".read-btn");
    if (old) { if (S.voice.isPlaying()) S.voice.stop(); old.remove(); }
    if (id) actions.appendChild(S.voice.button(id));
    coachReadFor = id;
  }
  function markTargets() {
    document.querySelectorAll(".cat-btn.quest-target,.palette-block.quest-target").forEach((n) => n.classList.remove("quest-target"));
    if (!currentQuest) return;
    const targets = questTargets[currentQuest.id] || [];
    targets.forEach((op) => {
      const def = S.defs[op];
      const cat = def && document.querySelector('.cat-btn[data-cat="' + def.category + '"]');
      if (cat) cat.classList.add("quest-target");
      const block = document.querySelector('.palette-block[data-opcode="' + op + '"]');
      if (block) block.classList.add("quest-target");
    });
  }
  coach.querySelector(".coach-focus").addEventListener("click", function () {
    if (!currentQuest) return;
    const op = (questTargets[currentQuest.id] || [])[0], def = S.defs[op];
    if (def) { S.palette.select(def.category); setTimeout(markTargets, 0); }
  });
  ["game:queststep", "game:questdone", "settings:changed", "registry:changed", "sprite:selected"].forEach((ev) => S.on(ev, refreshCoach));
  S.on("telemetry", (e) => { if (["blocks:added", "blocks:connected", "run:flag", "run:key", "script:ran"].includes(e.detail.name)) setTimeout(refreshCoach, 20); });

  // Debug controls.
  const pauseBtn = document.getElementById("btn-pause");
  const stepBtn = document.getElementById("btn-step");
  function updatePause() {
    const paused = S.engine.debug.paused;
    pauseBtn.classList.toggle("active", paused);
    pauseBtn.textContent = paused ? "▶" : "Ⅱ";
    pauseBtn.setAttribute("aria-label", paused ? "Resume running code" : "Pause running code");
  }
  pauseBtn.addEventListener("click", () => { S.engine.debug.pause(); updatePause(); });
  stepBtn.addEventListener("click", () => { S.engine.debug.step(); updatePause(); });
  S.on("debug:block", (e) => {
    const d = S.defs[e.detail.opcode];
    const live = document.getElementById("debug-live");
    if (live) live.textContent = "Running: " + ((d && d.text) || e.detail.opcode).replace(/%[A-Z0-9_]+/g, "value");
  });

  // Workspace cleanup and live debugger label.
  const editbar = document.querySelector(".ws-editbar");
  if (editbar) {
    const clean = el("button", { text: "⌁", title: "Clean up scripts", "aria-label": "Clean up script positions", onClick: () => S.workspace.cleanUp() });
    editbar.appendChild(clean);
    editbar.appendChild(el("span", { id: "debug-live", text: "", role: "status" }));
  }

  // Editable sprite inspector; kept outside the per-frame readout.
  const spriteEditor = el("div", { id: "sprite-editor" });
  document.getElementById("sprite-panel").appendChild(spriteEditor);
  function input(label, key, type, min, max) {
    const wrap = el("label", { class: "sprite-field" }, [el("span", { text: label })]);
    const inp = el("input", { type: type || "number", "data-prop": key });
    if (min != null) inp.min = min; if (max != null) inp.max = max;
    inp.addEventListener("change", () => {
      const s = S.stage.selected(); if (!s) return;
      if (key === "name") s.name = (inp.value.trim() || s.name).slice(0, 24);
      else s[key] = Math.max(Number(min == null ? -Infinity : min), Math.min(Number(max == null ? Infinity : max), Number(inp.value) || 0));
      S.track("sprite:edited", { id: s.id, property: key });
      S.workspace.render();
    });
    wrap.appendChild(inp); return wrap;
  }
  const fields = [input("Name", "name", "text"), input("X", "x", "number", -240, 240), input("Y", "y", "number", -180, 180),
    input("Direction", "dir", "number", -180, 180), input("Size %", "size", "number", 5, 500)];
  fields.forEach((f) => spriteEditor.appendChild(f));
  const visible = el("label", { class: "sprite-check" }, [el("input", { type: "checkbox", "data-prop": "visible" }), " Visible"]);
  visible.querySelector("input").addEventListener("change", function () { const s = S.stage.selected(); if (s) { s.visible = this.checked; S.track("sprite:edited", { id: s.id }); } });
  spriteEditor.appendChild(visible);
  const rotation = el("select", { "aria-label": "Sprite rotation style" }, [
    el("option", { value: "left-right", text: "Left-right" }), el("option", { value: "don't rotate", text: "Don't rotate" }), el("option", { value: "all around", text: "All around" })
  ]);
  rotation.addEventListener("change", () => { const s = S.stage.selected(); if (s) { s.rotationStyle = rotation.value; S.track("sprite:edited", { id: s.id }); } });
  spriteEditor.appendChild(rotation);
  let deleteArmed = false;
  const del = el("button", { class: "sprite-remove", text: "Remove sprite", onClick: function () {
    const s = S.stage.selected(); if (!s || S.stage.sprites.filter((x) => !x.isClone).length <= 1) return;
    if (!deleteArmed) { deleteArmed = true; del.textContent = "Click again to remove"; setTimeout(() => { deleteArmed = false; del.textContent = "Remove sprite"; }, 2500); return; }
    S.stage.removeSprite(s.id); deleteArmed = false; del.textContent = "Remove sprite";
  }});
  spriteEditor.appendChild(del);
  function refreshSpriteEditor() {
    const s = S.stage.selected(); if (!s) return;
    spriteEditor.querySelectorAll("[data-prop]").forEach((n) => {
      if (document.activeElement === n) return;
      if (n.type === "checkbox") n.checked = !!s[n.dataset.prop]; else n.value = s[n.dataset.prop];
    });
    rotation.value = s.rotationStyle;
    del.disabled = S.stage.sprites.filter((x) => !x.isClone).length <= 1;
  }
  S.on("sprite:selected", refreshSpriteEditor); S.on("sprite:edited", refreshSpriteEditor);
  setInterval(refreshSpriteEditor, 500);

  // Save status and lightweight recovery indicator.
  const saveStatus = document.getElementById("save-status");
  S.on("telemetry", (e) => {
    if (["blocks:added", "blocks:connected", "blocks:edited", "blocks:deleted", "sprite:edited"].includes(e.detail.name)) {
      saveStatus.textContent = "Saving…"; saveStatus.classList.add("saving");
    }
    if (e.detail.name === "project:saved") setTimeout(() => { saveStatus.textContent = "Saved"; saveStatus.classList.remove("saving"); }, 80);
  });

  // Starter/remix projects.
  function make(op) { return S.makeBlock(S.defs[op]); }
  function loadStarter(kind) {
    const specs = {
      hello: { name: "Hello World", ops: ["event_flag", "looks_sayfor", "motion_movesteps"] },
      dance: { name: "Dance Party", ops: ["event_flag", "looks_nextcostume", "motion_turnright", "sound_play"] },
      keys: { name: "Arrow Key Game", ops: ["event_key", "motion_movesteps", "motion_ifonedge"] }
    };
    const spec = specs[kind]; if (!spec) return;
    S.projectIO.create(spec.name);
    const sc = S.workspace.scriptsFor("sprite1"); sc.blocks = {}; sc.tops = [];
    let prev = null;
    spec.ops.forEach((op, i) => { const b = make(op); b.x = 90; b.y = 90; if (prev) prev.next = b.id; else sc.tops.push(b.id); sc.blocks[b.id] = b; prev = b; });
    S.workspace.setSprite("sprite1"); S.workspace.render(); S.projectIO.saveCurrent();
    settingsDlg.close();
  }

  // Classroom/settings dialog.
  const settingsDlg = el("dialog", { id: "dlg-settings", class: "paper-dialog settings-dialog" });
  settingsDlg.innerHTML = '<div class="dlg-head"><h2>Learning & classroom</h2><button class="dlg-close" aria-label="Close settings">✕</button></div>' +
    '<div class="dlg-body settings-body"><p>Adjust the editor for this learner or lesson.</p></div>';
  document.body.appendChild(settingsDlg);
  settingsDlg.querySelector(".dlg-close").addEventListener("click", () => settingsDlg.close());
  const sb = settingsDlg.querySelector(".settings-body");
  function settingToggle(label, key, help) {
    const box = el("input", { type: "checkbox" }); box.checked = !!S.settings[key];
    box.addEventListener("change", () => { S.settings[key] = box.checked; saveSettings(); refreshCoach(); });
    sb.appendChild(el("label", { class: "setting-row" }, [box, el("span", {}, [el("b", { text: label }), el("small", { text: help })])]));
  }
  settingToggle("Guided quest coach", "guided", "Keep the current objective beside the workspace.");
  settingToggle("Quiet classroom mode", "quiet", "Hide reward popups and suppress celebratory interruptions.");
  settingToggle("Slow execution", "slow", "Pause briefly on each block so learners can follow the program.");
  settingToggle("Extra reduced motion", "lowMotion", "Disable decorative motion even when the device setting is unchanged.");
  sb.appendChild(el("h3", { text: "Starter projects" }));
  const starters = el("div", { class: "starter-row" });
  [["hello", "Hello World"], ["dance", "Dance Party"], ["keys", "Arrow Key Game"]].forEach(([id, label]) => starters.appendChild(el("button", { text: label, onClick: () => loadStarter(id) })));
  sb.appendChild(starters);
  const mediaInput = el("input", { type: "file", accept: "image/png,image/jpeg,image/webp", style: { display: "none" } });
  mediaInput.addEventListener("change", function () {
    const file = this.files && this.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      const im = new Image();
      im.onload = function () {
        const c = document.createElement("canvas"); c.width = 960; c.height = 720;
        const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
        const scale = Math.max(c.width / im.width, c.height / im.height), w = im.width * scale, h = im.height * scale;
        g.drawImage(im, (c.width - w) / 2, (c.height - h) / 2, w, h);
        S.stage.addCustomBackdrop(file.name.replace(/\.[^.]+$/, ""), c.toDataURL("image/jpeg", .82));
        S.projectIO.saveCurrent(); mediaInput.value = "";
      };
      im.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  sb.appendChild(mediaInput);
  sb.appendChild(el("button", { class: "media-upload", text: "Upload custom backdrop", onClick: () => mediaInput.click() }));
  sb.appendChild(el("div", { class: "settings-actions" }, [
    el("button", { text: "Recover previous version", onClick: function () {
      const ok = S.projectIO.recoverLatest && S.projectIO.recoverLatest();
      this.textContent = ok ? "Previous version restored" : "No earlier version yet";
    }}),
    el("button", { text: "Export learning report", onClick: function () {
      const report = { exportedAt: new Date().toISOString(), level: S.game.levelInfo(), achievements: S.game.state.achievements,
        badges: S.game.state.badges, quests: S.game.state.quests, counters: S.game.state.counters };
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
      a.download = "ctrlcreate-learning-report.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 500);
    }}),
    el("button", { text: "Reset learning progress", class: "danger", onClick: function () {
      if (this.dataset.armed) { S.game.reset(); this.textContent = "Progress reset"; delete this.dataset.armed; refreshCoach(); }
      else { this.dataset.armed = "1"; this.textContent = "Click again to reset"; }
    }})
  ]));
  document.getElementById("btn-settings").addEventListener("click", () => settingsDlg.showModal());

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) navigator.serviceWorker.register("sw.js").catch(() => {});
  saveSettings(); refreshCoach(); refreshSpriteEditor(); updatePause();
})();
