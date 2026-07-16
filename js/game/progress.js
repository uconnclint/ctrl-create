/* ============================================================================
 * CTRL+CREATE — game/progress.js
 * The progression CORE: XP, levels, persistent state, counters.
 *
 * Loads FIRST of the game/* modules. Creates `CtrlCreate.game`; the achievements
 * and quests modules hang extra methods off the same object.
 *
 * Persistence: localStorage "ctrlcreate.progress.v1"
 *   { xp, level, achievements{id:iso}, badges{id:iso},
 *     quests{id:{progress,done,claimed}}, counters{...}, meta{firstSeen,sessions} }
 *
 * Everything is defensive: file:// contexts can throw on localStorage, JSON can
 * be corrupt, telemetry payloads can be missing fields. Nothing here throws.
 * ==========================================================================*/
(function () {
  "use strict";

  const S = window.CtrlCreate;
  const clamp = S.clamp;
  const KEY = "ctrlcreate.progress.v1";
  const MAX_LEVEL = 30;

  /* ----------------------------------------------------------------- LEVELS
   * 30 papercraft ranks. Cumulative XP to *reach* level n = 50*(n-1)*n,
   * so completing level n costs 50*n*(n+1) (L1->2 = 100, gently super-linear).
   */
  const LEVELS = [
    { name: "Paper Scrap",            emoji: "📄" },
    { name: "Doodler",                emoji: "✏️" },
    { name: "Sticker Collector",      emoji: "✨" },
    { name: "Origami Novice",         emoji: "🦢" },
    { name: "Glue Guru",              emoji: "🧴" },
    { name: "Scissor Sensei",         emoji: "✂️" },
    { name: "Cardstock Captain",      emoji: "🎴" },
    { name: "Confetti Commander",     emoji: "🎊" },
    { name: "Crease Crafter",         emoji: "📐" },
    { name: "Pop-up Pioneer",         emoji: "🎪" },
    { name: "Ribbon Ranger",          emoji: "🎀" },
    { name: "Collage Conjurer",       emoji: "🖼️" },
    { name: "Stencil Sage",           emoji: "🔖" },
    { name: "Fold Fabler",            emoji: "🪭" },
    { name: "Quilling Quartermaster", emoji: "🌀" },
    { name: "Pinwheel Prodigy",       emoji: "🎡" },
    { name: "Papier-mâché Maestro",   emoji: "🏺" },
    { name: "Tape Titan",             emoji: "🩹" },
    { name: "Mosaic Marshal",         emoji: "🧩" },
    { name: "Kirigami Knight",        emoji: "🗡️" },
    { name: "Vellum Virtuoso",        emoji: "📜" },
    { name: "Cutout Champion",        emoji: "🏅" },
    { name: "Lantern Luminary",       emoji: "🏮" },
    { name: "Garland General",        emoji: "🎍" },
    { name: "Diorama Duke",           emoji: "🏰" },
    { name: "Montage Monarch",        emoji: "👑" },
    { name: "Filigree Field Marshal", emoji: "🎖️" },
    { name: "Craft Colossus",         emoji: "🗿" },
    { name: "Grandmaster of Glue",    emoji: "🧙" },
    { name: "Papercut Legend",        emoji: "🏆✂️" },
  ];

  // XP required to have *reached* level n.  reach(1)=0, reach(2)=100, reach(3)=300…
  function cumToReach(n) { return 50 * (n - 1) * n; }
  function levelForXP(xp) {
    let lvl = 1;
    for (let n = 2; n <= MAX_LEVEL; n++) {
      if (xp >= cumToReach(n)) lvl = n; else break;
    }
    return lvl;
  }

  /* ------------------------------------------------------------------ STATE */
  function freshState() {
    return {
      xp: 0,
      level: 1,
      achievements: {},
      badges: {},
      quests: {},
      counters: { distinct_opcodes: {} },
      meta: { firstSeen: new Date().toISOString(), sessions: 0 },
    };
  }

  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (!raw) return freshState();
    try {
      const p = JSON.parse(raw);
      if (!p || typeof p !== "object") return freshState();
      const s = freshState();
      s.xp = typeof p.xp === "number" && isFinite(p.xp) ? p.xp : 0;
      s.achievements = (p.achievements && typeof p.achievements === "object") ? p.achievements : {};
      s.badges = (p.badges && typeof p.badges === "object") ? p.badges : {};
      s.quests = (p.quests && typeof p.quests === "object") ? p.quests : {};
      s.counters = (p.counters && typeof p.counters === "object") ? p.counters : { distinct_opcodes: {} };
      if (!s.counters.distinct_opcodes || typeof s.counters.distinct_opcodes !== "object") {
        s.counters.distinct_opcodes = {};
      }
      s.meta = (p.meta && typeof p.meta === "object") ? p.meta : { firstSeen: new Date().toISOString(), sessions: 0 };
      if (!s.meta.firstSeen) s.meta.firstSeen = new Date().toISOString();
      if (typeof s.meta.sessions !== "number") s.meta.sessions = 0;
      s.level = levelForXP(s.xp);
      return s;
    } catch (e) {
      return freshState(); // corrupt JSON -> start clean
    }
  }

  let state = load();

  /* ------------------------------------------------------------- PERSISTENCE
   * Debounced save (~500ms after the last mutation).
   */
  let saveTimer = null;
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode / file:// */ }
  }
  function save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveTimer = null; persist(); }, 500);
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    const f = freshState();
    // mutate in place so external references to CtrlCreate.game.state stay valid
    state.xp = 0;
    state.level = 1;
    state.achievements = {};
    state.badges = {};
    state.quests = {};
    state.counters = { distinct_opcodes: {} };
    state.meta = f.meta;
    for (const k in awardCounts) delete awardCounts[k];
    persist();
    const info = levelInfo();
    S.emit("game:xp", { xp: 0, level: 1, intoLevel: info.intoLevel, needed: info.needed, pct: info.pct, reason: "reset" });
    S.emit("game:ready", { state: state, level: 1 });
  }

  /* ------------------------------------------------------------------- LEVEL */
  function levelInfo() {
    const level = state.level;
    const base = cumToReach(level);
    const next = level >= MAX_LEVEL ? base : cumToReach(level + 1);
    const needed = Math.max(1, next - base);
    const intoLevel = state.xp - base;
    const pct = level >= MAX_LEVEL ? 100 : clamp(Math.round((intoLevel / needed) * 100), 0, 100);
    const m = LEVELS[level - 1] || LEVELS[LEVELS.length - 1];
    return { level: level, name: m.name, emoji: m.emoji, xp: state.xp, intoLevel: intoLevel, needed: needed, pct: pct };
  }

  function addXP(amount, reason) {
    amount = Math.round(Number(amount) || 0);
    if (!amount) return;
    const prevLevel = state.level;
    state.xp = Math.max(0, state.xp + amount);
    state.level = levelForXP(state.xp);
    const info = levelInfo();
    S.emit("game:xp", {
      xp: state.xp, level: state.level,
      intoLevel: info.intoLevel, needed: info.needed, pct: info.pct,
      reason: reason || "",
    });
    if (state.level > prevLevel) {
      const m = LEVELS[state.level - 1];
      S.emit("game:levelup", { level: state.level, name: m.name, emoji: m.emoji, xp: state.xp });
    }
    save();
  }

  /* ---------------------------------------------------------------- COUNTERS */
  function bump(name, amount) {
    amount = (amount == null) ? 1 : Number(amount) || 0;
    const v = (Number(state.counters[name]) || 0) + amount;
    state.counters[name] = v;
    save();
    return v;
  }
  function count(name) { return Number(state.counters[name]) || 0; }
  function setMax(name, v) {
    v = Number(v) || 0;
    if (v > (Number(state.counters[name]) || 0)) { state.counters[name] = v; save(); }
    return Number(state.counters[name]) || 0;
  }
  function recordOpcode(op) {
    if (!op) return;
    const m = state.counters.distinct_opcodes;
    if (!m[op]) { m[op] = 1; save(); }
  }
  function countDistinctOpcodes() { return Object.keys(state.counters.distinct_opcodes || {}).length; }

  /* ----------------------------------------------------------- XP AWARD CAPS
   * Per-session diminishing: each event type may only award XP 40x per page
   * load, so spamming a single action can't farm levels. Non-persisted.
   */
  const awardCounts = Object.create(null);
  function award(evName, amount) {
    const n = awardCounts[evName] || 0;
    if (n >= 40) return;
    awardCounts[evName] = n + 1;
    addXP(amount, "action:" + evName);
  }

  /* --------------------------------------------------------- TELEMETRY WIRING
   * One cheap handler drives all automatic counters + XP awards. block:executed
   * is frequent, so its branch stays O(1) and never awards XP.
   */
  S.on("telemetry", function (e) {
    const name = e.detail.name;
    const d = e.detail.detail || {};
    switch (name) {
      case "blocks:added":
        bump("total_blocks_added");
        if (d.category) bump("blocks_per_category_" + d.category);
        recordOpcode(d.opcode);
        award("blocks:added", 2);
        break;
      case "blocks:connected":
        bump("total_connections");
        if (typeof d.stackLength === "number") setMax("max_stack_length", d.stackLength);
        award("blocks:connected", 3);
        break;
      case "blocks:deleted":
        bump("total_blocks_deleted");
        break;
      case "run:flag":
        bump("total_runs");
        award("run:flag", 5);
        break;
      case "script:ran": {
        bump("total_scripts_ran");
        if (typeof d.durationMs === "number") bump("total_run_ms", d.durationMs);
        const xp = clamp(Math.floor((Number(d.blocksExecuted) || 0) / 10), 0, 25); // +1 / 10 blocks, cap +25
        if (xp > 0) award("script:ran", xp);
        break;
      }
      case "block:executed":
        if (d.category) bump("exec_per_category_" + d.category);
        recordOpcode(d.opcode);
        break;
      case "loop:completed":
        bump("total_loops");
        break;
      case "broadcast:sent":
        bump("total_broadcasts");
        award("broadcast:sent", 2);
        break;
      case "sound:played":
        bump("total_sounds");
        award("sound:played", 1);
        break;
      case "sprite:added":
        if (typeof d.total === "number") setMax("total_sprites", d.total);
        award("sprite:added", 10);
        break;
      case "variable:set":
        bump("total_var_sets");
        award("variable:set", 2);
        break;
      case "question:asked":
        bump("total_questions");
        break;
      case "costume:switched":
        bump("total_costume_switches");
        break;
      case "project:saved":
        bump("total_saves");
        break;
      case "session:start":
        state.meta.sessions = (state.meta.sessions || 0) + 1;
        save();
        break;
      default:
        break;
    }
  });

  /* ------------------------------------------------------------------ EXPORT */
  S.game = {
    // state + persistence
    state: state,
    save: save,
    reset: reset,
    // counters
    bump: bump,
    count: count,
    setMax: setMax,
    countDistinctOpcodes: countDistinctOpcodes,
    // xp / levels
    addXP: addXP,
    levelInfo: levelInfo,
    levels: LEVELS,
    maxLevel: MAX_LEVEL,
    // achievements.js / quests.js augment this object with more methods.
  };

  // Announce readiness on the next tick so achievements/quests/ui (loaded after
  // this file) have their listeners attached before we fire.
  setTimeout(function () {
    S.emit("game:ready", { state: state, level: state.level });
  }, 0);

  console.log("[CtrlCreate] game progression ready — level " + state.level + ", " + state.xp + " XP");
})();
