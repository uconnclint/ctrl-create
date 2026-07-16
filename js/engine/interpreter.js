/* ============================================================================
 * CTRL+CREATE — interpreter.js
 * Cooperative multi-threaded block runtime (Scratch semantics, simplified):
 *  - each hat script runs as an async "thread"
 *  - loops yield one frame per iteration; straight-line code runs instantly
 *  - stop-all works via an epoch counter every yield point checks
 * ==========================================================================*/
(function () {
  "use strict";
  const { clamp } = CtrlCreate;

  const stage = CtrlCreate.stage;
  const cvs = document.getElementById("stage");
  const cctx = cvs.getContext("2d");

  const STOP_ALL = Symbol("stopAll");
  const STOP_THIS = Symbol("stopThis");

  let epoch = 0;
  let liveThreads = 0;
  let runStart = 0;
  let blocksExecuted = 0;
  let opcodesThisRun = new Set();
  let timerBase = performance.now();

  const vars = { score: 0, lives: 3 };
  let answer = "";
  const debugState = { paused: false, slow: false, steps: 0 };

  async function debugBefore(th, b) {
    while (debugState.paused && debugState.steps <= 0) await frame(th.epoch);
    if (debugState.steps > 0) debugState.steps--;
    document.querySelectorAll(".blk.is-executing").forEach((n) => n.classList.remove("is-executing"));
    if (CtrlCreate.workspace.currentSprite === th.spriteId) {
      const node = document.querySelector('.blk[data-id="' + b.id + '"]');
      if (node) node.classList.add("is-executing");
    }
    CtrlCreate.emit("debug:block", { id: b.id, opcode: b.opcode, spriteId: th.spriteId });
    if (debugState.slow) await sleep(320, th.epoch);
  }

  /* ------------------------------------------------------------ keyboard -- */
  const keysDown = new Set();
  function scratchKey(e) {
    if (e.key === " ") return "space";
    if (e.key === "ArrowUp") return "up arrow";
    if (e.key === "ArrowDown") return "down arrow";
    if (e.key === "ArrowLeft") return "left arrow";
    if (e.key === "ArrowRight") return "right arrow";
    return e.key.length === 1 ? e.key.toLowerCase() : null;
  }
  window.addEventListener("keydown", (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA")) return;
    const k = scratchKey(e);
    if (!k) return;
    if (["space","up arrow","down arrow","left arrow","right arrow"].includes(k)) e.preventDefault();
    const fresh = !keysDown.has(k);
    keysDown.add(k);
    if (fresh) startKeyHats(k);
  });
  window.addEventListener("keyup", (e) => { const k = scratchKey(e); if (k) keysDown.delete(k); });

  /* ------------------------------------------------------------ helpers --- */
  function frame(myEpoch) {
    return new Promise((resolve, reject) => {
      CtrlCreate.nextTick(() => (myEpoch === epoch ? resolve() : reject(STOP_ALL)));
    });
  }
  function sleep(ms, myEpoch) {
    const end = performance.now() + ms;
    return (async function loop() {
      while (performance.now() < end) await frame(myEpoch);
    })();
  }
  function toNum(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function scripts(spriteId) { return CtrlCreate.workspace.scriptsFor(spriteId); }
  function blockIn(spriteId, id) { return scripts(spriteId).blocks[id]; }

  /* --------------------------------------------------------- movement ----- */
  // Every position change funnels through here so the pen can draw the path
  // and the sparkle trail can emit. `s` may be a sprite or a clone.
  function setPos(s, nx, ny) {
    nx = clamp(nx, -stage.HW, stage.HW);
    ny = clamp(ny, -stage.HH, stage.HH);
    if (s.pen && s.pen.down && (nx !== s.x || ny !== s.y)) {
      stage.pen.line(s.x, s.y, nx, ny, s.pen.color, s.pen.size);
    }
    s.x = nx; s.y = ny;
    if (s.trail && CtrlCreate.fx) {
      s._tt = (s._tt || 0) + 1;
      if (s._tt % 3 === 0) CtrlCreate.fx.sparkle(stage.HW + s.x, stage.HH - s.y);
    }
  }

  /* ------------------------------------------------------------ eval ------ */
  async function evalInput(th, block, name) {
    const slot = block.inputs[name];
    if (slot && slot.kind === "block" && slot.block) {
      const rb = blockIn(th.spriteId, slot.block);
      if (rb) return evalReporter(th, rb);
      return 0;
    }
    if (slot && slot.kind === "literal") return slot.value;
    if (name in block.fields) return block.fields[name];
    return 0;
  }
  async function evalNum(th, block, name) { return toNum(await evalInput(th, block, name)); }
  async function evalBool(th, block, name) {
    const slot = block.inputs[name];
    if (slot && slot.kind === "block" && slot.block) {
      const rb = blockIn(th.spriteId, slot.block);
      if (rb) return !!(await evalReporter(th, rb));
    }
    return false; // empty condition slot = false
  }

  async function evalReporter(th, b) {
    const s = th.actor;
    countExec(b);
    switch (b.opcode) {
      case "motion_xposition": return s.x;
      case "motion_yposition": return s.y;
      case "motion_direction": return s.dir;
      case "looks_size": return s.size;
      case "looks_costumenumber": return s.costume + 1;
      case "sound_volume": return CtrlCreate.sound ? CtrlCreate.sound.getVolume() : 100;
      case "sensing_mousex": return Math.round(stage.mouse.x);
      case "sensing_mousey": return Math.round(stage.mouse.y);
      case "sensing_mousedown": return stage.mouse.down;
      case "sensing_keypressed": return keysDown.has(b.fields.KEY);
      case "sensing_timer": return Math.round((performance.now() - timerBase) / 100) / 10;
      case "sensing_answer": return answer;
      case "sensing_distance": {
        const t = b.fields.TARGET;
        if (t === "_mouse_") return Math.round(Math.hypot(s.x - stage.mouse.x, s.y - stage.mouse.y));
        const o = findTarget(t);
        return o ? Math.round(Math.hypot(s.x - o.x, s.y - o.y)) : 0;
      }
      case "sensing_touching": return touching(s, b.fields.TARGET);
      case "sensing_touchingcolor": return touchingColor(s, (b.inputs.COLOR && b.inputs.COLOR.value) || "#ff2b2b");
      case "operator_add": return (await evalNum(th, b, "A")) + (await evalNum(th, b, "B"));
      case "operator_subtract": return (await evalNum(th, b, "A")) - (await evalNum(th, b, "B"));
      case "operator_multiply": return (await evalNum(th, b, "A")) * (await evalNum(th, b, "B"));
      case "operator_divide": { const d = await evalNum(th, b, "B"); return d === 0 ? 0 : (await evalNum(th, b, "A")) / d; }
      case "operator_random": {
        const a = await evalNum(th, b, "A"), c = await evalNum(th, b, "B");
        const lo = Math.min(a, c), hi = Math.max(a, c);
        return Math.floor(Math.random() * (hi - lo + 1)) + lo;
      }
      case "operator_gt": return (await evalNum(th, b, "A")) > (await evalNum(th, b, "B"));
      case "operator_lt": return (await evalNum(th, b, "A")) < (await evalNum(th, b, "B"));
      case "operator_eq": {
        const a = await evalInput(th, b, "A"), c = await evalInput(th, b, "B");
        return String(a).toLowerCase() === String(c).toLowerCase();
      }
      case "operator_and": return (await evalBool(th, b, "A")) && (await evalBool(th, b, "B"));
      case "operator_or": return (await evalBool(th, b, "A")) || (await evalBool(th, b, "B"));
      case "operator_not": return !(await evalBool(th, b, "A"));
      case "operator_join": return String(await evalInput(th, b, "A")) + String(await evalInput(th, b, "B"));
      case "operator_mod": { const d = await evalNum(th, b, "B"); return d === 0 ? 0 : ((await evalNum(th, b, "A")) % d + d) % d; }
      case "operator_round": return Math.round(await evalNum(th, b, "A"));
      case "data_variable": return vars[b.fields.VAR] != null ? vars[b.fields.VAR] : 0;
      default: return 0;
    }
  }

  /* --------------------------------------------------------- sensing bits -- */
  function touching(s, target) {
    const h = stage.halfExtent(s);
    if (target === "_edge_") {
      return s.x - h < -stage.HW || s.x + h > stage.HW || s.y - h < -stage.HH || s.y + h > stage.HH;
    }
    if (target === "_mouse_") return stage.hitTest(s, stage.mouse.x, stage.mouse.y);
    // matches the named sprite OR any of its clones
    for (let i = 0; i < stage.sprites.length; i++) {
      const o = stage.sprites[i];
      if (o === s || !o.visible) continue;
      if (o.name !== target && o.id !== target) continue;
      const ho = stage.halfExtent(o);
      if (Math.abs(s.x - o.x) < h + ho && Math.abs(s.y - o.y) < h + ho) return true;
    }
    return false;
  }

  // prefer the original sprite; fall back to any clone
  function findTarget(name) {
    return stage.sprites.find((x) => !x.isClone && (x.name === name || x.id === name)) ||
           stage.sprites.find((x) => x.name === name || x.id === name) || null;
  }

  function touchingColor(s, hex) {
    // sample points around the sprite's bounding box on the rendered canvas
    const m = hex.match(/^#?([0-9a-f]{6})$/i);
    if (!m) return false;
    const tv = parseInt(m[1], 16);
    const tr = (tv >> 16) & 255, tg = (tv >> 8) & 255, tb = tv & 255;
    const h = stage.halfExtent(s) + 3;
    const cx = stage.HW + s.x, cy = stage.HH - s.y;
    try {
      for (let a = 0; a < 8; a++) {
        const px = Math.round(cx + Math.cos(a * Math.PI / 4) * h);
        const py = Math.round(cy - Math.sin(a * Math.PI / 4) * h);
        if (px < 0 || py < 0 || px >= stage.W || py >= stage.H) continue;
        const d = cctx.getImageData(px, py, 1, 1).data;
        if (Math.abs(d[0] - tr) + Math.abs(d[1] - tg) + Math.abs(d[2] - tb) < 90) return true;
      }
    } catch (err) { /* tainted canvas etc. */ }
    return false;
  }

  /* --------------------------------------------------------- telemetry ---- */
  function countExec(b) {
    blocksExecuted++;
    if (!opcodesThisRun.has(b.opcode) || blocksExecuted % 50 === 0) {
      opcodesThisRun.add(b.opcode);
      CtrlCreate.track("block:executed", { opcode: b.opcode, category: b.category });
    }
  }

  /* --------------------------------------------------------- statements --- */
  async function execBlock(th, b) {
    const s = th.actor;
    if (!s || s.deleted) throw STOP_THIS;
    await debugBefore(th, b);
    countExec(b);
    const my = th.epoch;

    switch (b.opcode) {
      /* motion */
      case "motion_movesteps": {
        const steps = await evalNum(th, b, "STEPS");
        const rad = ((s.dir - 90) * Math.PI) / 180;
        setPos(s, s.x + Math.cos(rad) * steps, s.y - Math.sin(rad) * steps);
        break;
      }
      case "motion_turnright": s.dir = norm(s.dir + await evalNum(th, b, "DEG")); break;
      case "motion_turnleft": s.dir = norm(s.dir - await evalNum(th, b, "DEG")); break;
      case "motion_goto": setPos(s, await evalNum(th, b, "X"), await evalNum(th, b, "Y")); break;
      case "motion_glide": {
        const secs = Math.max(0, await evalNum(th, b, "SECS"));
        const tx = clamp(await evalNum(th, b, "X"), -stage.HW, stage.HW);
        const ty = clamp(await evalNum(th, b, "Y"), -stage.HH, stage.HH);
        const sx = s.x, sy = s.y, t0 = performance.now(), dur = secs * 1000;
        while (performance.now() - t0 < dur) {
          const p = (performance.now() - t0) / dur;
          setPos(s, sx + (tx - sx) * p, sy + (ty - sy) * p);
          await frame(my);
        }
        setPos(s, tx, ty);
        break;
      }
      case "motion_pointdir": s.dir = norm(await evalNum(th, b, "DIR")); break;
      case "motion_pointtowards": {
        const t = b.fields.TARGET;
        let tx = stage.mouse.x, ty = stage.mouse.y;
        if (t !== "_mouse_") { const o = findTarget(t); if (o) { tx = o.x; ty = o.y; } }
        s.dir = norm(90 - (Math.atan2(ty - s.y, tx - s.x) * 180) / Math.PI);
        break;
      }
      case "motion_changex": setPos(s, s.x + await evalNum(th, b, "DX"), s.y); break;
      case "motion_changey": setPos(s, s.x, s.y + await evalNum(th, b, "DY")); break;
      case "motion_setx": setPos(s, await evalNum(th, b, "X"), s.y); break;
      case "motion_sety": setPos(s, s.x, await evalNum(th, b, "Y")); break;
      case "motion_ifonedge": {
        const h = stage.halfExtent(s);
        let bx = s.x, by = s.y;
        if (s.x + h > stage.HW || s.x - h < -stage.HW) { s.dir = norm(-s.dir); bx = clamp(s.x, -stage.HW + h, stage.HW - h); }
        if (s.y + h > stage.HH || s.y - h < -stage.HH) { s.dir = norm(180 - s.dir); by = clamp(s.y, -stage.HH + h, stage.HH - h); }
        if (bx !== s.x || by !== s.y) setPos(s, bx, by);
        break;
      }
      case "motion_setrotation": s.rotationStyle = b.fields.STYLE; break;

      /* looks */
      case "looks_say": s.say = { text: await evalInput(th, b, "MSG"), type: "say", until: 0 }; break;
      case "looks_sayfor": {
        const secs = await evalNum(th, b, "SECS");
        s.say = { text: await evalInput(th, b, "MSG"), type: "say", until: performance.now() + secs * 1000 };
        await sleep(secs * 1000, my);
        s.say = null;
        break;
      }
      case "looks_think": s.say = { text: await evalInput(th, b, "MSG"), type: "think", until: 0 }; break;
      case "looks_switchcostume": {
        s.costume = b.fields.COS === "costume2" ? 1 : 0;
        CtrlCreate.track("costume:switched", {});
        break;
      }
      case "looks_nextcostume": s.costume = (s.costume + 1) % s.costumeCount; CtrlCreate.track("costume:switched", {}); break;
      case "looks_changesize": s.size = clamp(s.size + await evalNum(th, b, "N"), 5, 500); break;
      case "looks_setsize": s.size = clamp(await evalNum(th, b, "N"), 5, 500); break;
      case "looks_changeeffect": s.effects[b.fields.EFFECT] = (s.effects[b.fields.EFFECT] || 0) + await evalNum(th, b, "N"); break;
      case "looks_seteffect": s.effects[b.fields.EFFECT] = await evalNum(th, b, "N"); break;
      case "looks_cleareffects": s.effects = { ghost: 0, color: 0, brightness: 0 }; break;
      case "looks_show": s.visible = true; break;
      case "looks_hide": s.visible = false; break;
      case "looks_gotofront": {
        const i = stage.sprites.indexOf(s);
        if (i >= 0) { stage.sprites.splice(i, 1); b.fields.LAYER === "back" ? stage.sprites.unshift(s) : stage.sprites.push(s); }
        break;
      }

      case "looks_switchbackdrop": stage.setBackdrop(b.fields.BD); break;
      case "looks_nextbackdrop": stage.cycleBackdrop(); break;

      /* pen */
      case "pen_clear": stage.pen.clear(); break;
      case "pen_stamp": stage.stampSprite(s); CtrlCreate.track("pen:used", { opcode: b.opcode }); break;
      case "pen_down":
        s.pen.down = true;
        stage.pen.line(s.x, s.y, s.x, s.y, s.pen.color, s.pen.size); // dot
        CtrlCreate.track("pen:used", { opcode: b.opcode });
        break;
      case "pen_up": s.pen.down = false; break;
      case "pen_setcolor": s.pen.color = (b.inputs.COLOR && b.inputs.COLOR.value) || "#e5533c"; break;
      case "pen_setsize": s.pen.size = clamp(await evalNum(th, b, "N"), 1, 50); break;

      /* juice */
      case "juice_confetti":
        if (CtrlCreate.fx) CtrlCreate.fx.confetti(stage.HW + s.x, stage.HH - s.y);
        CtrlCreate.track("juice:used", { opcode: b.opcode });
        break;
      case "juice_shake":
        if (CtrlCreate.fx) CtrlCreate.fx.shake(clamp(await evalNum(th, b, "SECS"), 0.05, 3));
        CtrlCreate.track("juice:used", { opcode: b.opcode });
        break;
      case "juice_pop":
        if (CtrlCreate.fx) CtrlCreate.fx.burst(stage.HW + s.x, stage.HH - s.y);
        if (CtrlCreate.sound) CtrlCreate.sound.play("Pop");
        s.visible = false;
        CtrlCreate.track("juice:used", { opcode: b.opcode });
        break;
      case "juice_trail":
        s.trail = b.fields.STATE === "on";
        CtrlCreate.track("juice:used", { opcode: b.opcode });
        break;

      /* clones */
      case "control_clone": {
        const t = b.fields.TARGET;
        const orig = (t === "_myself_") ? s : findTarget(t);
        if (orig) {
          const c = stage.cloneSprite(orig);
          if (c) startCloneHats(c);
        }
        break;
      }
      case "control_whenclone": break; // hat — inert mid-chain
      case "control_deleteclone":
        if (s.isClone) { stage.removeClone(s); throw STOP_THIS; }
        break;

      /* sound */
      case "sound_play": if (CtrlCreate.sound) CtrlCreate.sound.play(b.fields.SND); break;
      case "sound_playuntil": if (CtrlCreate.sound) await race(CtrlCreate.sound.playUntilDone(b.fields.SND), my); break;
      case "sound_stopall": if (CtrlCreate.sound) CtrlCreate.sound.stopAll(); break;
      case "sound_changevol": if (CtrlCreate.sound) CtrlCreate.sound.changeVolume(await evalNum(th, b, "N")); break;
      case "sound_setvol": if (CtrlCreate.sound) CtrlCreate.sound.setVolume(await evalNum(th, b, "N")); break;
      case "sound_playnote": if (CtrlCreate.sound) await race(CtrlCreate.sound.playNote(await evalNum(th, b, "NOTE"), await evalNum(th, b, "BEATS")), my); break;

      /* events */
      case "event_broadcast": broadcast(b.fields.MSG); break;
      case "event_broadcastwait": await race(Promise.all(broadcast(b.fields.MSG)), my); break;

      /* control */
      case "control_wait": await sleep((await evalNum(th, b, "SECS")) * 1000, my); break;
      case "control_repeat": {
        const n = Math.round(await evalNum(th, b, "N"));
        for (let i = 0; i < n; i++) {
          if (b.substack) await execChain(th, b.substack);
          await frame(my);
        }
        CtrlCreate.track("loop:completed", { opcode: b.opcode, iterations: n });
        break;
      }
      case "control_forever": {
        let iters = 0;
        for (;;) {
          if (b.substack) await execChain(th, b.substack);
          await frame(my);
          iters++;
          if (iters % 100 === 0) CtrlCreate.track("loop:completed", { opcode: b.opcode, iterations: iters });
        }
      }
      case "control_if": if (await evalBool(th, b, "COND")) { if (b.substack) await execChain(th, b.substack); } break;
      case "control_ifelse":
        if (await evalBool(th, b, "COND")) { if (b.substack) await execChain(th, b.substack); }
        else if (b.substack2) await execChain(th, b.substack2);
        break;
      case "control_waituntil": while (!(await evalBool(th, b, "COND"))) await frame(my); break;
      case "control_repeatuntil": {
        let iters = 0;
        while (!(await evalBool(th, b, "COND"))) {
          if (b.substack) await execChain(th, b.substack);
          await frame(my);
          iters++;
        }
        CtrlCreate.track("loop:completed", { opcode: b.opcode, iterations: iters });
        break;
      }
      case "control_stop":
        if (b.fields.WHAT === "all") { stopAll(); throw STOP_ALL; }
        throw STOP_THIS;

      /* sensing */
      case "sensing_resettimer": timerBase = performance.now(); break;
      case "sensing_ask": {
        CtrlCreate.track("question:asked", {});
        const q = await evalInput(th, b, "Q");
        answer = await race(stage.ask(String(q)), my);
        break;
      }

      /* variables */
      case "data_setvar": {
        const v = await evalInput(th, b, "VAL");
        const n = parseFloat(v);
        vars[b.fields.VAR] = (!isNaN(n) && String(n) === String(v).trim()) ? n : v;
        stage.setMonitor(b.fields.VAR, vars[b.fields.VAR]);
        CtrlCreate.track("variable:set", { name: b.fields.VAR, opcode: b.opcode });
        break;
      }
      case "data_changevar":
        vars[b.fields.VAR] = toNum(vars[b.fields.VAR]) + await evalNum(th, b, "VAL");
        stage.setMonitor(b.fields.VAR, vars[b.fields.VAR]);
        CtrlCreate.track("variable:set", { name: b.fields.VAR, opcode: b.opcode });
        break;
      case "data_showvar": stage.setMonitor(b.fields.VAR, vars[b.fields.VAR] != null ? vars[b.fields.VAR] : 0, true); break;
      case "data_hidevar": stage.setMonitor(b.fields.VAR, vars[b.fields.VAR] != null ? vars[b.fields.VAR] : 0, false); break;

      default: break; // hats and unknowns are no-ops mid-chain
    }
  }

  function norm(d) { d = d % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return d; }

  // race a promise against stop (so stop-all interrupts sound waits / asks)
  function race(p, myEpoch) {
    return new Promise((resolve, reject) => {
      let settled = false;
      p.then((v) => { if (!settled) { settled = true; resolve(v); } },
             () => { if (!settled) { settled = true; resolve(undefined); } });
      (function check() {
        if (settled) return;
        if (myEpoch !== epoch) { settled = true; reject(STOP_ALL); return; }
        CtrlCreate.nextTick(check);
      })();
    });
  }

  /* ------------------------------------------------------------ threads --- */
  async function execChain(th, blockId) {
    let b = blockIn(th.spriteId, blockId);
    while (b) {
      if (th.epoch !== epoch) throw STOP_ALL;
      await execBlock(th, b);
      b = b.next ? blockIn(th.spriteId, b.next) : null;
    }
  }

  function startThread(spriteId, topId, actor) {
    const th = { spriteId, topId, epoch, actor: actor || stage.get(spriteId) };
    if (!th.actor) return Promise.resolve();
    liveThreads++;
    const top = blockIn(spriteId, topId);
    const startId = top && CtrlCreate.defs[top.opcode] && CtrlCreate.defs[top.opcode].shape === "hat" ? top.next : topId;
    const p = (async () => {
      try { if (startId) await execChain(th, startId); }
      catch (err) { if (err !== STOP_ALL && err !== STOP_THIS) console.error("CtrlCreate thread error:", err); }
      finally {
        liveThreads--;
        if (liveThreads <= 0) finishRun();
      }
    })();
    return p;
  }

  // when-I-start-as-a-clone hats, run against the freshly minted clone
  function startCloneHats(clone) {
    const owner = clone.cloneOf;
    const sc = scripts(owner);
    beginRunStats();
    sc.tops.forEach((topId) => {
      const b = sc.blocks[topId];
      if (b && b.opcode === "control_whenclone") startThread(owner, topId, clone);
    });
  }

  function finishRun() {
    if (!runStart) return;
    const durationMs = Math.round(performance.now() - runStart);
    runStart = 0;
    CtrlCreate.track("script:ran", { blocksExecuted, durationMs });
  }

  // Collect matching hats across sprites. Clones (when included) run their
  // ORIGINAL's scripts with themselves as the actor — that's what makes a
  // swarm of clones all respond to broadcasts and key presses.
  function hatsAcrossSprites(match, includeClones) {
    const out = [];
    stage.sprites.forEach((s) => {
      if (s.isClone && !includeClones) return;
      const owner = s.isClone ? s.cloneOf : s.id;
      const sc = scripts(owner);
      sc.tops.forEach((topId) => {
        const b = sc.blocks[topId];
        if (b && match(b)) out.push({ spriteId: owner, topId, actor: s });
      });
    });
    return out;
  }

  function beginRunStats() {
    if (!runStart) { runStart = performance.now(); blocksExecuted = 0; opcodesThisRun = new Set(); }
  }

  /* ------------------------------------------------------------- events --- */
  function greenFlag() {
    stopAll(false);
    epoch++; // fresh epoch for the new run
    beginRunStats();
    timerBase = performance.now();
    CtrlCreate.track("run:flag", {});
    stage.removeAllClones();
    const hats = hatsAcrossSprites((b) => b.opcode === "event_flag", false);
    if (!hats.length) { runStart = 0; return; }
    hats.forEach((h) => startThread(h.spriteId, h.topId, h.actor));
  }

  function startKeyHats(key) {
    const hats = hatsAcrossSprites((b) => b.opcode === "event_key" && (b.fields.KEY === key || b.fields.KEY === "any"), true);
    if (!hats.length) return;
    CtrlCreate.track("run:key", { key });
    beginRunStats();
    hats.forEach((h) => startThread(h.spriteId, h.topId, h.actor));
  }

  function broadcast(msg) {
    CtrlCreate.track("broadcast:sent", { msg });
    const hats = hatsAcrossSprites((b) => b.opcode === "event_whenbroadcast" && b.fields.MSG === msg, true);
    beginRunStats();
    return hats.map((h) => startThread(h.spriteId, h.topId, h.actor));
  }

  CtrlCreate.on("stage:spriteclick", (e) => {
    const id = e.detail.id;
    const sc = scripts(id);
    const hats = sc.tops.filter((t) => sc.blocks[t] && sc.blocks[t].opcode === "event_clicked");
    if (!hats.length) return;
    beginRunStats();
    hats.forEach((t) => startThread(id, t));
  });

  function stopAll(track) {
    epoch++;
    finishRun();
    liveThreads = 0;
    stage.cancelAsk();
    stage.sprites.forEach((s) => { s.say = null; });
    if (CtrlCreate.sound) CtrlCreate.sound.stopAll();
    if (track !== false) CtrlCreate.track("run:stop", {});
    document.querySelectorAll(".blk.is-executing").forEach((n) => n.classList.remove("is-executing"));
  }

  /* ------------------------------------------------------------- expose --- */
  CtrlCreate.engine = {
    greenFlag, stopAll, broadcast, vars,
    debug: {
      get paused() { return debugState.paused; },
      get slow() { return debugState.slow; },
      pause(v) { debugState.paused = v == null ? !debugState.paused : !!v; return debugState.paused; },
      step() { debugState.paused = true; debugState.steps++; },
      slow(v) { debugState.slow = v == null ? !debugState.slow : !!v; return debugState.slow; },
    },
    get running() { return liveThreads > 0; },
    get answer() { return answer; },
  };
})();
