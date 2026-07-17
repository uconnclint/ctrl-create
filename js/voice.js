/* ============================================================================
 * CTRL+CREATE — voice.js
 * "Read to me" narration for quests — an accessibility feature for early
 * readers (K–2) who can't yet read the quest text themselves.
 *
 * Audio lives in assets/voice/quest_<id>.m4a (generated with Kokoro TTS).
 * Only ONE narration plays at a time; pressing a playing button stops it.
 *
 * Exposes CtrlCreate.voice:
 *   play(questId)   -> Promise-ish; starts narration, stops any other
 *   stop()          -> stop everything
 *   isPlaying(id?)  -> true if that quest (or anything) is narrating
 *   button(questId) -> a ready-made 🔊 button element wired to that quest
 * Emits "voice:started" / "voice:stopped" {questId}.
 * ==========================================================================*/
(function () {
  "use strict";
  const S = window.CtrlCreate;
  if (!S) return;

  const SRC = (id) => "assets/voice/quest_" + id + ".m4a";
  const cache = {};          // questId -> HTMLAudioElement
  let current = null;        // {id, audio}

  function get(id) {
    if (!cache[id]) {
      const a = new Audio(SRC(id));
      a.preload = "none";     // don't fetch 12 files up front
      cache[id] = a;
    }
    return cache[id];
  }

  function stop() {
    if (!current) return;
    const { id, audio } = current;
    current = null;
    try { audio.pause(); audio.currentTime = 0; } catch (e) {}
    S.emit("voice:stopped", { questId: id });
  }

  function play(id) {
    if (current && current.id === id) { stop(); return; }  // toggle off
    stop();
    const audio = get(id);
    current = { id, audio };
    audio.onended = () => {
      if (current && current.id === id) { current = null; S.emit("voice:stopped", { questId: id }); }
    };
    audio.onerror = () => {
      // missing/unsupported file — fail quietly, never break the UI
      if (current && current.id === id) { current = null; S.emit("voice:stopped", { questId: id }); }
    };
    const p = audio.play();
    if (p && p.catch) p.catch(() => { /* autoplay blocked until a gesture */ });
    S.emit("voice:started", { questId: id });
    S.track("voice:read", { questId: id });
  }

  function isPlaying(id) { return id ? !!(current && current.id === id) : !!current; }

  /* ----------------------------------------------------------- button ----- */
  // A self-updating 🔊 button. Shows a stop state while its quest narrates.
  function button(questId, label) {
    const btn = S.el("button", {
      class: "read-btn",
      type: "button",
      title: "Read this quest out loud",
      "aria-label": "Read this quest out loud",
    });
    const paint = () => {
      const on = isPlaying(questId);
      btn.textContent = on ? "⏹ Stop" : (label ? "🔊 " + label : "🔊 Read to me");
      btn.classList.toggle("playing", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    };
    btn.addEventListener("click", (e) => { e.stopPropagation(); play(questId); });
    S.on("voice:started", paint);
    S.on("voice:stopped", paint);
    paint();
    return btn;
  }

  // stop narration if the whole app is silenced
  S.on("run:stop", stop);

  document.head.appendChild(S.el("style", { text: `
    .read-btn{
      display:inline-flex; align-items:center; gap:4px; flex:none;
      border:1.5px solid #cbbfa5; border-radius:999px;
      background:#fffdf7; color:#3a3226; cursor:pointer;
      font:800 11px/1 -apple-system,"SF Pro Rounded","Segoe UI",ui-rounded,sans-serif;
      padding:5px 10px; box-shadow:2px 2px 0 rgba(58,50,38,.18);
      transition:transform .08s, background .12s;
    }
    .read-btn:hover{ background:#fff; transform:translateY(-1px); }
    .read-btn:active{ transform:translate(1px,2px); box-shadow:1px 1px 0 rgba(58,50,38,.18); }
    .read-btn.playing{ background:#ffe45c; border-color:#d9b400; }
    .read-btn:focus-visible{ outline:3px solid #4c97ff; outline-offset:2px; }
    /* quest dialog rows: keep the button on its own line, right-aligned */
    .quest-row .read-btn{ margin-top:8px; }
    /* coach card: sit beside "Show me the block" */
    #quest-coach .coach-actions{ display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
  ` }));

  S.voice = { play, stop, isPlaying, button, src: SRC };
})();
