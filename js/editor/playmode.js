// Play Mode — fullscreen stage takeover for CtrlCreate.
// Loads late; CtrlCreate (.engine/.stage/.sound/.el) and the DOM are ready.
// Self-contained: attaches behavior + injects its own <style>. Touches no other file.
(function () {
  "use strict";

  const S = window.CtrlCreate;
  if (!S) return;
  const el = S.el || ((t, a, c) => {
    const n = document.createElement(t);
    if (a && a.text) n.textContent = a.text;
    (c || []).forEach((x) => n.appendChild(typeof x === "string" ? document.createTextNode(x) : x));
    return n;
  });

  const $ = (id) => document.getElementById(id);
  const whoosh = () => { try { if (S.sound && S.sound.play) S.sound.play("Whoosh"); } catch (e) { /* noop */ } };

  let overlay = null;      // #play-overlay (built lazily)
  let stageSlot = null;    // where #stage-frame lives while in play mode
  let homeParent = null;   // original parent of #stage-frame
  let homeNext = null;     // original nextSibling of #stage-frame
  let active = false;
  let keyHandler = null;

  // ---- one-time CSS ---------------------------------------------------------
  function injectStyle() {
    if ($("play-mode-style")) return;
    const css = `
.ctl-play { color: #2c7a2c; }
.ctl-play:active { transform: translate(1px, 2px); }

body.play-mode #layout,
body.play-mode #topbar,
body.play-mode #toast-dock { visibility: hidden; }

#play-overlay {
  position: fixed; inset: 0; z-index: 500;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 22px;
  background: rgba(58, 50, 38, .92);
}
body.play-mode #play-overlay { animation: play-fade .18s ease-out both; }

#play-overlay #stage-frame {
  width: min(92vw, calc((100vh - 130px) * 4 / 3));
  max-width: 1280px;
  margin: 0;
}
body.play-mode #play-overlay #stage-frame { animation: play-pop .22s ease-out both; }

#play-bar { display: flex; align-items: center; gap: 16px; }
.play-btn {
  font: inherit; font-size: 20px; font-weight: 700;
  display: inline-flex; align-items: center; gap: 10px;
  height: 56px; padding: 0 26px; border-radius: 14px;
  border: 2px solid rgba(58, 50, 38, .55); cursor: pointer;
  box-shadow: 3px 4px 0 rgba(58, 50, 38, .35);
  transition: transform .05s ease;
}
.play-btn:active { transform: translate(1px, 2px); box-shadow: 2px 2px 0 rgba(58, 50, 38, .35); }
.play-btn .glyph { font-size: 22px; line-height: 1; }
.play-btn-go   { background: #cdeccb; color: #1f5e1f; }
.play-btn-stop { background: #f2c9c4; color: #8a2b23; }
.play-btn-exit { background: #efe2c8; color: #4a3d28; }
#play-hint { color: #f4ead2; font-size: 13px; opacity: .82; letter-spacing: .01em; }

@keyframes play-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes play-pop { from { transform: scale(.96); } to { transform: scale(1); } }
@media (prefers-reduced-motion: reduce) {
  body.play-mode #play-overlay,
  body.play-mode #play-overlay #stage-frame { animation: none; }
}`;
    const tag = el("style", { id: "play-mode-style" });
    tag.textContent = css;
    document.head.appendChild(tag);
  }

  // ---- lazy overlay ---------------------------------------------------------
  function buildOverlay() {
    if (overlay) return;
    stageSlot = el("div", { id: "play-stage-slot", class: "play-stage-slot" });

    const mkBtn = (cls, glyph, label, fn) =>
      el("button", { class: "play-btn " + cls, type: "button", onclick: fn }, [
        el("span", { class: "glyph", text: glyph }),
        el("span", { text: label }),
      ]);

    const bar = el("div", { id: "play-bar" }, [
      mkBtn("play-btn-go", "⚑", "Go", () => { try { S.engine && S.engine.greenFlag && S.engine.greenFlag(); } catch (e) {} }),
      mkBtn("play-btn-stop", "⬣", "Stop", () => { try { S.engine && S.engine.stopAll && S.engine.stopAll(); } catch (e) {} }),
      mkBtn("play-btn-exit", "✕", "Exit", exit),
    ]);

    const hint = el("div", { id: "play-hint", text: "arrow keys / space work while playing — Esc to exit" });

    overlay = el("div", { id: "play-overlay" }, [stageSlot, bar, hint]);
  }

  // ---- enter / exit ---------------------------------------------------------
  function enter() {
    if (active) return;
    const frame = $("stage-frame");
    if (!frame) return;

    injectStyle();
    buildOverlay();

    // remember exact home so exit restores the node in place
    homeParent = frame.parentNode;
    homeNext = frame.nextSibling;

    stageSlot.appendChild(frame); // reparent — preserves canvas ctx + listeners
    document.body.appendChild(overlay);
    document.body.classList.add("play-mode");
    active = true;

    keyHandler = (e) => {
      if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); exit(); }
      // deliberately do NOT swallow other keys — game handlers on window keep working
    };
    window.addEventListener("keydown", keyHandler);
    whoosh();
  }

  function exit() {
    if (!active) return;
    const frame = $("stage-frame");

    if (frame && homeParent) {
      if (homeNext && homeNext.parentNode === homeParent) homeParent.insertBefore(frame, homeNext);
      else homeParent.appendChild(frame);
    }
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.body.classList.remove("play-mode");

    if (keyHandler) { window.removeEventListener("keydown", keyHandler); keyHandler = null; }
    homeParent = null; homeNext = null;
    active = false;
    whoosh();
  }

  function toggle() { active ? exit() : enter(); }

  // ---- wire the topbar button ----------------------------------------------
  const btn = $("btn-play");
  if (btn) btn.addEventListener("click", toggle);

  S.playmode = { enter, exit, toggle, active: () => active };
})();
