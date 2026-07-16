/* ============================================================================
 * CTRL+CREATE — game/quests.js
 * Guided quests / teaching levels + their tracking engine.
 *
 * Each quest is a small ordered checklist of steps. A step listens for one
 * telemetry event and matches on its detail; `count` copies of the event
 * complete the step. Quests unlock sequentially — quest N+1 stays locked until
 * quest N is done.
 *
 * Persisted under CtrlCreate.game.state.quests[id] = { progress:[perStep], done }.
 * Depends on progress.js.
 * ==========================================================================*/
(function () {
  "use strict";

  const S = window.CtrlCreate;
  const g = S.game;
  const state = g.state;

  function scripts() { return (S.workspace && S.workspace._sprites) || {}; }
  function everyBlock() {
    const out = [];
    const store = scripts();
    for (const sid in store) for (const id in (store[sid].blocks || {})) out.push(store[sid].blocks[id]);
    return out;
  }
  function hasConnectedStack(required) {
    const store = scripts();
    for (const sid in store) {
      const sc = store[sid];
      for (const topId of (sc.tops || [])) {
        const ops = [];
        let b = sc.blocks[topId], guard = 0;
        while (b && guard++ < 1000) { ops.push(b.opcode); b = b.next ? sc.blocks[b.next] : null; }
        if (required.every((op) => ops.includes(op))) return true;
      }
    }
    return false;
  }

  // step: { text, event, match(detail,state)->bool, count }
  const step = (text, event, match, count) => ({ text: text, event: event, match: match || null, count: count || 1 });

  const QUESTS = [
    {
      id: "first_steps", order: 1, name: "First Steps", icon: "🐣",
      desc: "Every project starts with a hat and a flag.",
      goalText: "Add a when-flag hat, add a move block, then press ⚑.",
      xp: 60,
      steps: [
        step("Add a “when ⚑ clicked” hat", "blocks:added", (d) => d.opcode === "event_flag"),
        step("Add a “move” block",         "blocks:added", (d) => d.opcode === "motion_movesteps"),
        step("Connect them and press the green flag ⚑", "run:flag",
          () => hasConnectedStack(["event_flag", "motion_movesteps"])),
      ],
    },
    {
      id: "walk_the_walk", order: 2, name: "Walk the Walk", icon: "🚶",
      desc: "Snap blocks together into a real script.",
      goalText: "Connect a stack of 3+ blocks, then run it.",
      xp: 70,
      steps: [
        step("Connect a stack of 3+ blocks", "blocks:connected", (d) => (Number(d.stackLength) || 0) >= 3),
        step("Run the connected script",     "script:ran", (d) => (Number(d.blocksExecuted) || 0) >= 2),
      ],
    },
    {
      id: "say_hello", order: 3, name: "Say Hello", icon: "💬",
      desc: "Give your sprite a voice.",
      goalText: "Add a “say” block and run it.",
      xp: 70,
      steps: [
        step("Add a “say” block",           "blocks:added", (d) => d.opcode === "looks_say"),
        step("Run it so the sprite speaks", "block:executed", (d) => d.opcode === "looks_say"),
      ],
    },
    {
      id: "loop_the_loop", order: 4, name: "Loop the Loop", icon: "🔁",
      desc: "Repeat yourself — on purpose.",
      goalText: "Add a repeat loop and let it finish.",
      xp: 80,
      steps: [
        step("Add a “repeat” loop", "blocks:added", (d) => d.opcode === "control_repeat"),
        step("Let a loop finish",   "loop:completed"),
      ],
    },
    {
      id: "key_commander", order: 5, name: "Key Commander", icon: "⌨️",
      desc: "React to the keyboard.",
      goalText: "Add a “when key pressed” hat, then press that key.",
      xp: 80,
      steps: [
        step("Add a “when key pressed” hat", "blocks:added", (d) => d.opcode === "event_key"),
        step("Press the chosen key",          "run:key"),
      ],
    },
    {
      id: "bounce_around", order: 6, name: "Bounce Around", icon: "🏀",
      desc: "Keep your sprite on the stage forever.",
      goalText: "Use “if on edge, bounce” inside a forever loop.",
      xp: 90,
      steps: [
        step("Add “if on edge, bounce”", "blocks:added", (d) => d.opcode === "motion_ifonedge"),
        step("Run the forever loop",     "block:executed", (d) => d.opcode === "control_forever"),
      ],
    },
    {
      id: "sound_check", order: 7, name: "Sound Check", icon: "🔊",
      desc: "Turn up the volume.",
      goalText: "Play 3 sounds.",
      xp: 80,
      steps: [
        step("Play 3 sounds", "sound:played", null, 3),
      ],
    },
    {
      id: "copycat_costumes", order: 8, name: "Copycat Costumes", icon: "👗",
      desc: "Animate by cycling costumes.",
      goalText: "Switch costume 5 times.",
      xp: 90,
      steps: [
        step("Switch costume 5 times", "costume:switched", null, 5),
      ],
    },
    {
      id: "radio_star", order: 9, name: "Radio Star", icon: "📻",
      desc: "Let sprites talk to each other with messages.",
      goalText: "Add a “when I receive” hat and broadcast a message.",
      xp: 100,
      steps: [
        step("Add a “when I receive” hat", "blocks:added", (d) => d.opcode === "event_whenbroadcast"),
        step("Broadcast a message",        "broadcast:sent"),
      ],
    },
    {
      id: "score_keeper", order: 10, name: "Score Keeper", icon: "🎯",
      desc: "Remember things with variables.",
      goalText: "Set a variable, then change it 5 times.",
      xp: 100,
      steps: [
        step("Set a variable",     "variable:set", (d) => d.opcode === "data_setvar", 1),
        step("Change it 5 times",  "variable:set", (d) => d.opcode === "data_changevar", 5),
      ],
    },
    {
      id: "decision_maker", order: 11, name: "Decision Maker", icon: "🤔",
      desc: "Make your project think for itself.",
      goalText: "Add an if / else and a sensing block, then run it.",
      xp: 110,
      steps: [
        step("Add an “if / else” block", "blocks:added", (d) => d.opcode === "control_ifelse"),
        step("Add a Sensing block",      "blocks:added", (d) => d.category === "sensing"),
        step("Run a project containing both", "run:flag", () => {
          const ops = everyBlock().map((b) => b.opcode);
          return ops.includes("control_ifelse") && ops.some((op) => op.indexOf("sensing_") === 0);
        }),
      ],
    },
    {
      id: "grand_finale", order: 12, name: "Grand Finale", icon: "🎬",
      desc: "Put it all together into a real creation.",
      goalText: "Assemble a 20+ block stack and run it for 10+ seconds.",
      xp: 200,
      steps: [
        step("Assemble a 20+ block stack", "blocks:connected", (d) => (Number(d.stackLength) || 0) >= 20),
        step("Run it for 10+ seconds",     "script:ran",
          (d) => (Number(d.durationMs) || 0) >= 10000 || (Number(d.blocksExecuted) || 0) >= 100),
      ],
    },
  ];

  const byId = {};
  const byOrder = {};
  QUESTS.forEach((q) => { byId[q.id] = q; byOrder[q.order] = q; });

  // Ensure a persisted entry exists and matches the step count (survives
  // definition changes without wiping progress).
  function ensure(q) {
    let e = state.quests[q.id];
    if (!e || typeof e !== "object") { e = { progress: [], done: false, claimed: false }; state.quests[q.id] = e; }
    if (!Array.isArray(e.progress)) e.progress = [];
    while (e.progress.length < q.steps.length) e.progress.push(0);
    if (typeof e.done !== "boolean") e.done = false;
    return e;
  }
  QUESTS.forEach(ensure);

  function isUnlocked(q) {
    if (q.order <= 1) return true;
    const prev = byOrder[q.order - 1];
    if (!prev) return true;
    const pe = state.quests[prev.id];
    return !!(pe && pe.done);
  }

  function stepDone(q, e, i) { return (e.progress[i] || 0) >= (q.steps[i].count || 1); }

  /* ------------------------------------------------------------ TRACK ENGINE */
  S.on("telemetry", function (ev) {
    const name = ev.detail.name;
    const d = ev.detail.detail || {};
    for (let i = 0; i < QUESTS.length; i++) {
      const q = QUESTS[i];
      const e = ensure(q);
      if (e.done || !isUnlocked(q)) continue;

      let advanced = false;
      for (let si = 0; si < q.steps.length; si++) {
        const s = q.steps[si];
        if (stepDone(q, e, si)) continue;
        if (s.event !== name) continue;
        let ok = true;
        if (s.match) { try { ok = !!s.match(d, state); } catch (_) { ok = false; } }
        if (!ok) continue;

        e.progress[si] = (e.progress[si] || 0) + 1;
        advanced = true;
        if (stepDone(q, e, si)) S.emit("game:queststep", { quest: q, stepIndex: si });
      }

      if (advanced) {
        let all = true;
        for (let si = 0; si < q.steps.length; si++) { if (!stepDone(q, e, si)) { all = false; break; } }
        if (all && !e.done) {
          e.done = true;
          S.emit("game:questdone", { quest: q });
          g.addXP(q.xp || 0, "quest:" + q.id);
        }
        g.save();
      }
    }
  });

  /* ------------------------------------------------------------------ EXPORT */
  g.quests = QUESTS;
  g.questState = function (id) {
    const q = byId[id];
    if (!q) return null;
    const e = ensure(q);
    const stepsDone = q.steps.map((s, i) => stepDone(q, e, i));
    return { stepsDone: stepsDone, done: !!e.done, unlocked: isUnlocked(q) };
  };
})();
