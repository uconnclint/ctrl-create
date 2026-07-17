/* ============================================================================
 * CTRL+CREATE — game/ui.js
 * The visible layer: HUD, toasts, achievement/badge/quest dialogs, level-up.
 *
 * Purely reactive — subscribes to game:* events and paints existing DOM (never
 * creates duplicate structural nodes). Every lookup is guarded so a missing
 * element degrades gracefully instead of throwing.
 *
 * Loads LAST of the game/* modules; depends on progress/achievements/quests.
 * ==========================================================================*/
(function () {
  "use strict";

  const S = window.CtrlCreate;
  const el = S.el;
  const $ = (id) => document.getElementById(id);

  /* --------------------------------------------------------------- DIALOGS */
  function openDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === "function") { try { dlg.showModal(); return; } catch (e) { /* already open */ } }
    dlg.setAttribute("open", "");
  }
  function closeDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function") { try { dlg.close(); return; } catch (e) { /* not open */ } }
    dlg.removeAttribute("open");
  }

  /* ------------------------------------------------------------------- HUD */
  function refreshHud() {
    const info = S.game.levelInfo();
    const lvl = $("hud-level-num"); if (lvl) lvl.textContent = info.level;
    const fill = $("hud-xp-fill"); if (fill) fill.style.width = info.pct + "%";
    const ac = $("hud-ach-count"); if (ac) ac.textContent = Object.keys(S.game.state.achievements).length;
    const bc = $("hud-badge-count"); if (bc) bc.textContent = Object.keys(S.game.state.badges).length;
  }

  /* ---------------------------------------------------------------- TOASTS
   * Max 3 visible; extras queue. Each toast fades (class "out") at 4s and is
   * removed at 4.6s, which pulls the next queued toast in.
   */
  let visibleToasts = 0;
  const toastQueue = [];

  function enqueueToast(t) { toastQueue.push(t); pumpToasts(); }

  function pumpToasts() {
    const dock = $("toast-dock");
    if (!dock) return;
    if (S.settings && S.settings.quiet) { toastQueue.length = 0; return; }
    while (visibleToasts < 2 && toastQueue.length) {
      const t = toastQueue.shift();
      visibleToasts++;
      const node = el("div", { class: "toast toast-" + t.kind }, [
        el("span", { class: "toast-icon", text: t.icon || "✨" }),
        el("div", { class: "toast-body" }, [
          el("b", { class: "toast-title", text: t.title || "" }),
          el("div", { class: "toast-desc", text: t.desc || "" }),
        ]),
      ]);
      dock.appendChild(node);
      setTimeout(function () { node.classList.add("out"); }, 4000);
      setTimeout(function () {
        if (node.parentNode) node.parentNode.removeChild(node);
        visibleToasts--;
        pumpToasts();
      }, 4600);
    }
  }

  /* ----------------------------------------------------------- LEVEL-UP DLG */
  function renderLevelup(d) {
    if (S.settings && S.settings.quiet) return;
    const dlg = $("dlg-levelup");
    const body = $("levelup-body");
    if (body) {
      body.innerHTML = "";
      body.appendChild(el("div", { class: "levelup-emoji", text: d.emoji }));
      body.appendChild(el("div", { class: "levelup-level", text: "LEVEL " + d.level }));
      body.appendChild(el("div", { class: "levelup-rank", text: d.name }));
      const confetti = el("div", { class: "levelup-confetti" });
      for (let i = 1; i <= 12; i++) confetti.appendChild(el("i", { class: "confetti c" + i }));
      body.appendChild(confetti);
      body.appendChild(el("button", { class: "levelup-continue", onClick: function () { closeDialog(dlg); } }, ["Continue ✂"]));
    }
    openDialog(dlg);
  }

  /* ------------------------------------------------------- DIALOG RENDERERS */
  const tierLabel = (t) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : "");

  function renderAchievements() {
    const grid = $("ach-grid");
    if (!grid) return;
    grid.innerHTML = "";
    S.game.achievements.forEach(function (a) {
      const unlocked = !!S.game.state.achievements[a.id];
      // Gold-tier secrets stay hidden until earned.
      const desc = unlocked ? a.desc : (a.tier === "gold" ? "???" : a.desc);
      const icon = unlocked ? a.icon : (a.tier === "gold" ? "🔒" : a.icon);
      grid.appendChild(el("div", { class: "ach-card " + (unlocked ? "unlocked" : "locked") }, [
        el("div", { class: "ach-icon", text: icon }),
        el("div", { class: "ach-name", text: a.name }),
        el("div", { class: "ach-desc", text: desc }),
        el("div", { class: "ach-tier " + a.tier, text: tierLabel(a.tier) }),
      ]));
    });
  }

  function renderBadges() {
    const grid = $("badge-grid");
    if (!grid) return;
    grid.innerHTML = "";
    S.game.badges.forEach(function (b) {
      const unlocked = !!S.game.state.badges[b.id];
      grid.appendChild(el("div", { class: "badge-card " + (unlocked ? "unlocked" : "locked") }, [
        el("div", { class: "badge-icon", text: unlocked ? b.icon : "🔒" }),
        el("div", { class: "badge-name", text: b.name }),
        el("div", { class: "badge-desc", text: b.desc }),
      ]));
    });
  }

  function renderQuests() {
    const list = $("quest-list");
    if (!list) return;
    list.innerHTML = "";
    S.game.quests.forEach(function (q) {
      const st = S.game.questState(q.id) || { stepsDone: [], done: false, unlocked: false };
      const cls = "quest-row" + (st.done ? " done" : "") + (!st.unlocked ? " locked" : "");
      const main = el("div", { class: "quest-main" }, [el("div", { class: "quest-name", text: q.name })]);

      if (!st.unlocked) {
        main.appendChild(el("div", { class: "quest-goal", text: "🔒 Complete previous quest" }));
      } else {
        main.appendChild(el("div", { class: "quest-goal", text: q.goalText }));
        const ul = el("ul", { class: "quest-steps" });
        q.steps.forEach(function (s, i) {
          const done = st.stepsDone[i];
          ul.appendChild(el("li", { class: "quest-step" + (done ? " done" : ""), text: (done ? "✓ " : "○ ") + s.text }));
        });
        main.appendChild(ul);
        const total = q.steps.length;
        const doneN = st.stepsDone.filter(Boolean).length;
        const pct = total ? Math.round((doneN / total) * 100) : 0;
        main.appendChild(el("div", { class: "quest-progress" }, [el("div", { class: "quest-fill", style: { width: pct + "%" } })]));
        // "Read to me" — narrates the quest for kids who can't read it yet
        if (S.voice) main.appendChild(S.voice.button(q.id));
      }

      list.appendChild(el("div", { class: cls }, [el("div", { class: "quest-icon", text: q.icon }), main]));
    });
  }

  /* ---------------------------------------------------------------- WIRING */
  function wire() {
    // Open buttons render fresh, then show.
    const ba = $("btn-achievements");
    if (ba) ba.addEventListener("click", function () { renderAchievements(); openDialog($("dlg-achievements")); });
    const bb = $("btn-badges");
    if (bb) bb.addEventListener("click", function () { renderBadges(); openDialog($("dlg-badges")); });
    const bq = $("btn-quests");
    if (bq) bq.addEventListener("click", function () { renderQuests(); openDialog($("dlg-quests")); });

    // [data-close] buttons close their parent dialog.
    const closers = document.querySelectorAll("[data-close]");
    for (let i = 0; i < closers.length; i++) {
      closers[i].addEventListener("click", function () {
        const dlg = this.closest ? this.closest("dialog") : null;
        closeDialog(dlg);
      });
    }

    // Backdrop click (target is the dialog element itself) closes.
    ["dlg-achievements", "dlg-badges", "dlg-quests", "dlg-levelup"].forEach(function (id) {
      const dlg = $(id);
      if (!dlg) return;
      dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDialog(dlg); });
    });
  }

  /* ---------------------------------------------------------- SUBSCRIPTIONS */
  S.on("game:ready", refreshHud);
  S.on("game:xp", refreshHud);

  S.on("game:levelup", function (e) {
    const d = e.detail;
    refreshHud();
    enqueueToast({ kind: "levelup", icon: d.emoji, title: "Level " + d.level + "!", desc: d.name });
    renderLevelup(d);
  });

  S.on("game:achievement", function (e) {
    const a = e.detail.ach || {};
    refreshHud();
    enqueueToast({ kind: "achievement", icon: a.icon, title: a.name, desc: a.desc });
    if ($("dlg-achievements") && $("dlg-achievements").open) renderAchievements();
  });

  S.on("game:badge", function (e) {
    const b = e.detail.badge || {};
    refreshHud();
    enqueueToast({ kind: "badge", icon: b.icon, title: b.name, desc: b.desc });
    if ($("dlg-badges") && $("dlg-badges").open) renderBadges();
  });

  S.on("game:questdone", function (e) {
    const q = e.detail.quest || {};
    enqueueToast({ kind: "quest", icon: q.icon, title: "Quest Complete!", desc: q.name });
    if ($("dlg-quests") && $("dlg-quests").open) renderQuests();
  });

  S.on("game:queststep", function (e) {
    const q = e.detail.quest || {};
    const s = (q.steps && q.steps[e.detail.stepIndex]) || {};
    enqueueToast({ kind: "step", icon: q.icon || "☑️", title: q.name || "Progress", desc: s.text || "Step complete" });
    if ($("dlg-quests") && $("dlg-quests").open) renderQuests();
  });

  /* ------------------------------------------------------------------- BOOT */
  wire();
  refreshHud();
})();
