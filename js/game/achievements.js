/* ============================================================================
 * CTRL+CREATE — game/achievements.js
 * Achievement + Badge definitions and the unlock engine.
 *
 * Two evaluation mechanisms, both funnel through one `evaluateAll()`:
 *   (a) counter-threshold   — check() reads persisted counters/level/sessions.
 *   (b) instant / session   — a telemetry listener flips ephemeral `rt` flags
 *                             (e.g. "said hello this run"); check() reads them.
 * evaluateAll() is debounced ~250ms behind telemetry, and re-runs itself while
 * unlocks keep happening (XP from one unlock can trip a level/quantity gate).
 *
 * Depends on progress.js (CtrlCreate.game).
 * ==========================================================================*/
(function () {
  "use strict";

  const S = window.CtrlCreate;
  const g = S.game;
  const state = g.state;

  // ---- convenience readers -------------------------------------------------
  const c = (n) => g.count(n);
  function categoriesUsed() {
    let k = 0;
    S.categories.forEach((cat) => { if (c("blocks_per_category_" + cat.id) > 0) k++; });
    return k;
  }
  function distinctInCategory(prefix) {
    const m = state.counters.distinct_opcodes || {};
    let k = 0;
    for (const op in m) { if (op.indexOf(prefix) === 0) k++; }
    return k;
  }
  function completedQuests() {
    const q = state.quests || {};
    let k = 0;
    for (const id in q) { if (q[id] && q[id].done) k++; }
    return k;
  }
  function totalQuests() { return (g.quests && g.quests.length) || 12; }
  function achievementsUnlocked() { return Object.keys(state.achievements).length; }

  // ---- ephemeral (per page-load) flags for instant achievements ------------
  const rt = {};

  /* ------------------------------------------------------------ ACHIEVEMENTS
   * tier default XP: bronze 25, silver 75, gold 200 (override with `xp`).
   */
  const ACHS = [
    // — block building —
    { id: "first_cut",    name: "First Cut",        tier: "bronze", icon: "✂️", desc: "Add your very first block.",           check: () => c("total_blocks_added") >= 1 },
    { id: "snip_snip",    name: "Snip Snip",        tier: "bronze", icon: "📎", desc: "Add 10 blocks.",                        check: () => c("total_blocks_added") >= 10 },
    { id: "block_party",  name: "Block Party",      tier: "silver", icon: "🎉", desc: "Add 100 blocks.",                       check: () => c("total_blocks_added") >= 100 },
    { id: "block_hoarder",name: "Block Hoarder",    tier: "silver", icon: "🗄️", desc: "Add 250 blocks.",                       check: () => c("total_blocks_added") >= 250 },
    { id: "paper_trail",  name: "Paper Trail",      tier: "gold",   icon: "🧻", desc: "Add 500 blocks. Legendary stamina.",    check: () => c("total_blocks_added") >= 500 },
    { id: "connector",    name: "Master Connector", tier: "silver", icon: "🔗", desc: "Snap 50 blocks together.",              check: () => c("total_connections") >= 50 },
    { id: "skyscraper",   name: "Skyscraper",       tier: "silver", icon: "🏙️", desc: "Build a stack 15 blocks tall.",         check: () => c("max_stack_length") >= 15 },
    { id: "marie_kondo",  name: "Marie Kondo",      tier: "silver", icon: "🗑️", desc: "Delete 20 blocks. Spark joy.",          check: () => c("total_blocks_deleted") >= 20 },

    // — running —
    { id: "first_flight", name: "First Flight",     tier: "bronze", icon: "⚑", desc: "Click the green flag for the first time.", check: () => c("total_runs") >= 1 },
    { id: "busy_bee",     name: "Busy Bee",         tier: "bronze", icon: "🐝", desc: "Run a script 10 times.",                check: () => c("total_scripts_ran") >= 10 },
    { id: "marathon",     name: "Marathon Runner",  tier: "silver", icon: "🏃", desc: "Press the flag 25 times.",              check: () => c("total_runs") >= 25 },
    { id: "deep_diver",   name: "Deep Diver",       tier: "silver", icon: "🤿", desc: "Rack up 60 seconds of run time.",       check: () => c("total_run_ms") >= 60000 },
    { id: "speed_runner", name: "Speed Runner",     tier: "silver", icon: "⚡", desc: "Run 20+ blocks in under 2 seconds.",    check: () => !!rt.speedRun },

    // — looks / sound —
    { id: "hello_world",  name: "Hello World",      tier: "bronze", icon: "💬", desc: "Make a sprite say something.",          check: () => !!rt.saidHello },
    { id: "quick_change", name: "Quick Change",     tier: "bronze", icon: "👗", desc: "Switch costume 10 times.",              check: () => c("total_costume_switches") >= 10 },
    { id: "sound_designer",name: "Sound Designer",  tier: "bronze", icon: "🎧", desc: "Play 5 sounds.",                        check: () => c("total_sounds") >= 5 },
    { id: "maestro",      name: "Maestro",          tier: "silver", icon: "🎼", desc: "Play 25 sounds.",                       check: () => c("total_sounds") >= 25 },
    { id: "composer",     name: "Composer",         tier: "bronze", icon: "🎹", desc: "Play a musical note.",                  check: () => !!rt.playedNote },

    // — motion —
    { id: "glider",       name: "Smooth Glider",    tier: "bronze", icon: "🛝", desc: "Use a glide block.",                    check: () => !!rt.glided },

    // — control —
    { id: "loop_de_loop", name: "Loop-de-loop",     tier: "bronze", icon: "🔁", desc: "Complete your first loop.",             check: () => c("total_loops") >= 1 },
    { id: "loop_master",  name: "Loop Master",      tier: "silver", icon: "♾️", desc: "Complete 25 loops.",                    check: () => c("total_loops") >= 25 },
    { id: "infinite_paper",name: "Infinite Paper",  tier: "silver", icon: "🌀", desc: "Run a loop 100+ iterations.",           check: () => !!rt.bigLoop },
    { id: "deep_thinker", name: "Deep Thinker",     tier: "bronze", icon: "🤔", desc: "Use an if / else block.",              check: () => !!rt.usedIfElse },

    // — events / variables / sensing —
    { id: "broadcaster",  name: "On the Air",       tier: "bronze", icon: "📡", desc: "Send your first broadcast.",            check: () => c("total_broadcasts") >= 1 },
    { id: "chatterbox",   name: "Chatterbox",       tier: "silver", icon: "📣", desc: "Send 10 broadcasts.",                   check: () => c("total_broadcasts") >= 10 },
    { id: "variable_star",name: "Variable Star",    tier: "bronze", icon: "⭐", desc: "Set a variable for the first time.",     check: () => c("total_var_sets") >= 1 },
    { id: "mad_scientist",name: "Mad Scientist",    tier: "silver", icon: "🧪", desc: "Set variables 10 times.",              check: () => c("total_var_sets") >= 10 },
    { id: "mathlete",     name: "Mathlete",         tier: "silver", icon: "➗", desc: "Add 10 operator blocks.",               check: () => c("blocks_per_category_operators") >= 10 },
    { id: "inquisitive",  name: "Inquisitive Mind", tier: "bronze", icon: "❓", desc: "Ask the player 5 questions.",           check: () => c("total_questions") >= 5 },
    { id: "sensing_sensei",name: "Sensei of Sensing",tier: "gold",  icon: "👁️", desc: "Use 8 different Sensing blocks.",       check: () => distinctInCategory("sensing_") >= 8 },

    // — sprites —
    { id: "casting_call", name: "Casting Call",     tier: "bronze", icon: "🎬", desc: "Have 3 sprites on stage.",             check: () => c("total_sprites") >= 3 },
    { id: "director",     name: "Director",         tier: "silver", icon: "🎥", desc: "Have 5 sprites on stage.",             check: () => c("total_sprites") >= 5 },
    { id: "puppeteer",    name: "Puppeteer",        tier: "gold",   icon: "🎭", desc: "Have 8 sprites on stage.",             check: () => c("total_sprites") >= 8 },

    // — saving —
    { id: "saver",        name: "Keeper of Crafts", tier: "bronze", icon: "💾", desc: "Save a project.",                       check: () => !!rt.savedProject },
    { id: "big_saver",    name: "Master Archivist", tier: "silver", icon: "🗃️", desc: "Save a project with 50+ blocks.",       check: () => !!rt.bigSave },

    // — variety / mastery —
    { id: "explorer",     name: "Explorer",         tier: "bronze", icon: "🧭", desc: "Use blocks from 5 categories.",         check: () => categoriesUsed() >= 5 },
    { id: "polyglot",     name: "Polyglot",         tier: "gold",   icon: "🌈", desc: "Use blocks from all 8 categories.",     check: () => categoriesUsed() >= 8 },
    { id: "curious_cutter",name: "Curious Cutter",  tier: "bronze", icon: "🔍", desc: "Use 15 different blocks.",              check: () => g.countDistinctOpcodes() >= 15 },
    { id: "block_botanist",name: "Block Botanist",  tier: "silver", icon: "🌿", desc: "Use 35 different blocks.",              check: () => g.countDistinctOpcodes() >= 35 },
    { id: "catalog_complete",name: "Catalog Complete",tier:"gold",  icon: "📚", desc: "Use 60 different blocks.",              check: () => g.countDistinctOpcodes() >= 60 },

    // — sessions —
    { id: "persistent",   name: "Persistent",       tier: "bronze", icon: "📆", desc: "Come back for 5 sessions.",            check: () => (state.meta.sessions || 0) >= 5 },
    { id: "devoted",      name: "Devoted",          tier: "gold",   icon: "🔥", desc: "Come back for 20 sessions.",           check: () => (state.meta.sessions || 0) >= 20 },

    // — quests —
    { id: "quest_first",  name: "Quest Begun",      tier: "bronze", icon: "🗺️", desc: "Complete your first quest.",           check: () => completedQuests() >= 1 },
    { id: "quest_five",   name: "Quest Veteran",    tier: "silver", icon: "🧭", desc: "Complete 5 quests.",                    check: () => completedQuests() >= 5 },
    { id: "quest_all",    name: "Quest Master",     tier: "gold",   icon: "🏵️", desc: "Complete every quest.",                check: () => completedQuests() >= totalQuests() },

    // — levels —
    { id: "level_5",      name: "Rising Star",      tier: "bronze", icon: "🌟", desc: "Reach level 5.",                        check: () => state.level >= 5 },
    { id: "level_10",     name: "Double Digits",    tier: "silver", icon: "💫", desc: "Reach level 10.",                       check: () => state.level >= 10 },
    { id: "level_20",     name: "High Roller",      tier: "gold",   icon: "🎲", desc: "Reach level 20.",                       check: () => state.level >= 20 },
    { id: "level_30",     name: "Apex Papercrafter",tier: "gold",   icon: "🏆", desc: "Reach the maximum level, 30.",          check: () => state.level >= 30 },
  ];

  /* ------------------------------------------------------------------ BADGES
   * "Mastery seals" — one per category plus milestone seals. Fixed 150 XP each.
   */
  const catBadge = (cat, id, name, icon) => ({
    id: id, name: name, icon: icon,
    desc: "Add 30 " + cat + " blocks and run them 200 times.",
    check: () => c("blocks_per_category_" + cat) >= 30 && c("exec_per_category_" + cat) >= 200,
  });

  const BADGES = [
    catBadge("motion",    "badge_motion",    "Motion Master",     "🏃"),
    catBadge("looks",     "badge_looks",     "Looks Luminary",    "🎨"),
    catBadge("sound",     "badge_sound",     "Sound Sorcerer",    "🔊"),
    catBadge("events",    "badge_events",    "Event Emcee",       "📣"),
    catBadge("control",   "badge_control",   "Control Conductor", "🎛️"),
    catBadge("sensing",   "badge_sensing",   "Sensing Seer",      "👁️"),
    catBadge("operators", "badge_operators", "Operator Oracle",   "➗"),
    catBadge("variables", "badge_variables", "Variable Virtuoso", "🔢"),

    { id: "badge_starter",    name: "Starter Badge",      icon: "🌟", desc: "Finish your first quest.",                     check: () => completedQuests() >= 1 },
    { id: "badge_scholar",    name: "Scholar",            icon: "🎓", desc: "Finish 3 tutorial quests.",                    check: () => completedQuests() >= 3 },
    { id: "badge_architect",  name: "Architect",          icon: "🏗️", desc: "Save a project with 50+ blocks.",              check: () => !!rt.bigSave },
    { id: "badge_showman",    name: "Showman",            icon: "🎭", desc: "Say, play a sound, and switch costume in one session.", check: () => !!(rt.showSaid && rt.showSound && rt.showCostume) },
    { id: "badge_grinder",    name: "Grinder",            icon: "💪", desc: "Reach level 15.",                              check: () => state.level >= 15 },
    { id: "badge_legend",     name: "Legend",             icon: "👑", desc: "Reach level 30.",                              check: () => state.level >= 30 },
    { id: "badge_collector",  name: "Collector",          icon: "📦", desc: "Unlock 20 achievements.",                     check: () => achievementsUnlocked() >= 20 },
    { id: "badge_hoarder",    name: "Hoarder",            icon: "🗃️", desc: "Unlock 35 achievements.",                      check: () => achievementsUnlocked() >= 35 },
    { id: "badge_attendance", name: "Perfect Attendance", icon: "📅", desc: "Play across 10 sessions.",                    check: () => (state.meta.sessions || 0) >= 10 },
    { id: "badge_champion",   name: "Quest Champion",     icon: "🏆", desc: "Complete every quest.",                       check: () => completedQuests() >= totalQuests() },
  ];

  /* ------------------------------------------------------------ UNLOCK ENGINE */
  const TIER_XP = { bronze: 10, silver: 35, gold: 90 };
  const BADGE_XP = 60;

  function unlockAch(a) {
    if (state.achievements[a.id]) return false;
    state.achievements[a.id] = new Date().toISOString();
    S.emit("game:achievement", { ach: a });
    g.addXP(a.xp || TIER_XP[a.tier] || 25, "achievement:" + a.id);
    g.save();
    return true;
  }
  function unlockBadge(b) {
    if (state.badges[b.id]) return false;
    state.badges[b.id] = new Date().toISOString();
    S.emit("game:badge", { badge: b });
    g.addXP(b.xp || BADGE_XP, "badge:" + b.id);
    g.save();
    return true;
  }

  // Re-run while unlocks keep landing (an unlock's XP can trip a level gate,
  // which unlocks a level badge, …). Bounded to avoid any pathological loop.
  function evaluateAll() {
    let changed = true, passes = 0;
    while (changed && passes < 8) {
      changed = false; passes++;
      for (let i = 0; i < ACHS.length; i++) {
        const a = ACHS[i];
        if (state.achievements[a.id]) continue;
        let ok = false;
        try { ok = !!a.check(); } catch (e) { ok = false; }
        if (ok && unlockAch(a)) changed = true;
      }
      for (let i = 0; i < BADGES.length; i++) {
        const b = BADGES[i];
        if (state.badges[b.id]) continue;
        let ok = false;
        try { ok = !!b.check(); } catch (e) { ok = false; }
        if (ok && unlockBadge(b)) changed = true;
      }
    }
  }

  let evalTimer = null;
  function scheduleEval() {
    if (evalTimer) return;
    evalTimer = setTimeout(function () { evalTimer = null; evaluateAll(); }, 250);
  }

  // Flip ephemeral flags for instant achievements, then schedule a pass.
  S.on("telemetry", function (e) {
    const name = e.detail.name;
    const d = e.detail.detail || {};
    switch (name) {
      case "block:executed":
        if (d.opcode === "looks_say" || d.opcode === "looks_sayfor") { rt.saidHello = true; rt.showSaid = true; }
        if (d.opcode === "sound_playnote") rt.playedNote = true;
        break;
      case "blocks:added":
        if (d.opcode === "control_ifelse") rt.usedIfElse = true;
        if (d.opcode === "motion_glide") rt.glided = true;
        if (d.opcode === "sound_playnote") rt.playedNote = true;
        break;
      case "sound:played":     rt.showSound = true; break;
      case "costume:switched": rt.showCostume = true; break;
      case "loop:completed":   if ((Number(d.iterations) || 0) >= 100) rt.bigLoop = true; break;
      case "script:ran":
        if ((Number(d.durationMs) || 0) < 2000 && (Number(d.blocksExecuted) || 0) >= 20) rt.speedRun = true;
        break;
      case "project:manualsave":
      case "project:exported":
        rt.savedProject = true;
        if ((Number(d.blockCount) || 0) >= 50) rt.bigSave = true;
        break;
      default: break;
    }
    scheduleEval();
  });

  // Level-ups and quest completions can satisfy achievements without a raw
  // telemetry event of their own.
  S.on("game:levelup", scheduleEval);
  S.on("game:questdone", scheduleEval);

  /* ------------------------------------------------------------------ EXPORT */
  g.achievements = ACHS;
  g.badges = BADGES;
  g.isUnlocked = function (id) { return !!(state.achievements[id] || state.badges[id]); };

  // Deferred initial sweep: catches anything already earned (levels, sessions,
  // restored counters) once the UI's listeners are attached so toasts show.
  setTimeout(evaluateAll, 0);
})();
