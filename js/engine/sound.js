/* ============================================================================
 * CTRL+CREATE — engine/sound.js
 * The synthesized sound engine. Every sound effect and musical note is
 * generated live with the WebAudio API — there are no audio files anywhere.
 *
 * Attaches `CtrlCreate.sound` with:
 *   init(), play(name), playUntilDone(name), stopAll(),
 *   setVolume(pct), changeVolume(delta), getVolume(),
 *   setMuted(bool), getMuted(), playNote(midi, beats)
 *
 * Design:
 *   - Lazy AudioContext, resumed on the first user gesture (autoplay policy).
 *   - Every voice routes:  source(s) -> voiceGain(env) -> [filter] -> master -> dest
 *   - Live source nodes tracked in a Set so stopAll() can silence everything.
 *   - All audio timing uses ctx.currentTime offsets. setTimeout is used ONLY to
 *     resolve Promises, never to schedule sound.
 *   - If WebAudio is unavailable, every method degrades to a safe no-op and
 *     playUntilDone still resolves after the nominal duration.
 *   - setMuted()/getMuted(): the engine-level master mute (js/engine-bridge.js
 *     wires this to ctx.settings' 'muted', driven by the #btn-mute toolbar
 *     toggle). Starts true (Clint's Q11 "start muted" standard) and gates the
 *     master GainNode independently of volumePct and of "Quiet classroom
 *     mode" (js/main.js's celebrate(), unrelated to this file).
 *
 * Depends on: js/core.js (CtrlCreate.emit / CtrlCreate.on / CtrlCreate.track)
 * ==========================================================================*/
(function () {
  "use strict";

  var CtrlCreate = window.CtrlCreate;
  if (!CtrlCreate) return; // core.js must load first.

  // --------------------------------------------------------------------------
  // AudioContext plumbing & autoplay handling
  // --------------------------------------------------------------------------
  var AC = window.AudioContext || window.webkitAudioContext || null;
  var supported = !!AC;

  var ctx = null;         // the shared AudioContext
  var master = null;      // master GainNode -> destination
  var noiseBuffer = null; // shared 1s white-noise buffer (built lazily)
  var live = new Set();   // every currently-playing source node
  var gesturesArmed = false;

  var volumePct = 100;    // 0..100, master volume (kid-block-driven; see sound_setvol)

  // Engine-level master mute — independent of volumePct above and of "Quiet
  // classroom mode" (which only ever gates celebration cues in js/main.js).
  // Defaults TRUE (Clint's Q11 "start muted" standard) so a fresh AudioContext
  // is never audible even in the brief window before js/engine-bridge.js
  // applies the real persisted ctx.settings.get('muted') value. Wired via
  // setMuted()/getMuted() below, driven by the #btn-mute toggle through
  // ctx.settings — this module never touches localStorage itself.
  var masterMuted = true;

  // Convert a 0..100 percentage into a gain 0..1 with a gentle perceptual curve.
  function pctToGain(pct) {
    var p = Math.max(0, Math.min(100, pct)) / 100;
    return Math.pow(p, 1.5);
  }

  // The one place mute and volume combine into an actual gain value — the
  // single gating point every code path below goes through.
  function effectiveGain() {
    return masterMuted ? 0 : pctToGain(volumePct);
  }

  // Resume the context if the browser suspended it (autoplay policy).
  function resume() {
    if (ctx && ctx.state === "suspended" && ctx.resume) {
      try { ctx.resume(); } catch (e) { /* ignore */ }
    }
  }

  // Install one-time gesture listeners that unlock/resume audio.
  function armGestures() {
    if (gesturesArmed || typeof window.addEventListener !== "function") return;
    gesturesArmed = true;
    var unlock = function () {
      init();
      resume();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      window.removeEventListener("touchstart", unlock, true);
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    window.addEventListener("touchstart", unlock, true);
  }

  // Lazily create the AudioContext + master chain. Safe to call repeatedly.
  function init() {
    if (!supported) return null;
    if (ctx) { armGestures(); return ctx; }
    try {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = effectiveGain();
      master.connect(ctx.destination);
    } catch (e) {
      supported = false;
      ctx = null;
      master = null;
      return null;
    }
    armGestures();
    preloadSamples(); // decode works even while the context is suspended
    return ctx;
  }

  // Ensure we have a usable context; returns ctx or null.
  function ensure() {
    if (!supported) return null;
    if (!ctx) init();
    resume();
    return ctx;
  }

  // Build (once) a 1 second buffer of white noise.
  function getNoiseBuffer() {
    if (!ctx) return null;
    if (noiseBuffer) return noiseBuffer;
    var len = Math.floor(ctx.sampleRate * 1.0);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  // --------------------------------------------------------------------------
  // Low-level voice helpers
  // --------------------------------------------------------------------------

  // Track a source node so stopAll() can find it; auto-untrack when it ends.
  function trackSource(node, stopAt) {
    live.add(node);
    node.onended = function () { live.delete(node); };
    if (typeof stopAt === "number") {
      try { node.stop(stopAt); } catch (e) { /* already scheduled */ }
    }
    return node;
  }

  // Create an oscillator wired: osc -> gain. Returns { osc, gain }.
  function makeOsc(type) {
    var osc = ctx.createOscillator();
    osc.type = type || "sine";
    var g = ctx.createGain();
    g.gain.value = 0;
    osc.connect(g);
    return { osc: osc, gain: g };
  }

  // Create a noise source wired: noise -> gain. Returns { src, gain }.
  function makeNoise() {
    var src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer();
    var g = ctx.createGain();
    g.gain.value = 0;
    src.connect(g);
    return { src: src, gain: g };
  }

  // A standard percussive gain envelope (attack -> exp decay to ~silence).
  function envelope(gainNode, t0, peak, attack, dur) {
    var g = gainNode.gain;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + attack);
    g.exponentialRampToValueAtTime(0.0001, t0 + dur);
  }

  // --------------------------------------------------------------------------
  // Named SFX patches
  // Each returns its approximate duration in seconds. Assumes ctx is ready.
  // --------------------------------------------------------------------------
  var PATCHES = {

    // "Meow" — two chained pitch-bent segments (rise then fall) + lowpass.
    Meow: function (t0) {
      var dur = 0.42;
      var lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(1200, t0);
      lp.frequency.linearRampToValueAtTime(2400, t0 + 0.18);
      lp.frequency.linearRampToValueAtTime(900, t0 + dur);
      lp.Q.value = 6;
      lp.connect(master);

      // Segment 1: rise (the "me-").
      var a = makeOsc("sawtooth");
      a.gain.connect(lp);
      a.osc.frequency.setValueAtTime(520, t0);
      a.osc.frequency.exponentialRampToValueAtTime(760, t0 + 0.16);
      envelope(a.gain, t0, 0.5, 0.02, 0.2);

      // Segment 2: fall (the "-ow"), a triangle overlapping the tail.
      var b = makeOsc("triangle");
      b.gain.connect(lp);
      b.osc.frequency.setValueAtTime(760, t0 + 0.16);
      b.osc.frequency.exponentialRampToValueAtTime(430, t0 + dur);
      envelope(b.gain, t0 + 0.15, 0.55, 0.02, dur - 0.15);

      trackSource(a.osc); a.osc.start(t0); a.osc.stop(t0 + 0.24);
      trackSource(b.osc); b.osc.start(t0 + 0.14); b.osc.stop(t0 + dur + 0.02);
      return dur;
    },

    // "Pop" — very short sine pitch-drop 600 -> 150 Hz.
    Pop: function (t0) {
      var dur = 0.07;
      var o = makeOsc("sine");
      o.gain.connect(master);
      o.osc.frequency.setValueAtTime(600, t0);
      o.osc.frequency.exponentialRampToValueAtTime(150, t0 + 0.06);
      var g = o.gain.gain;
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(0.85, t0 + 0.006);
      g.exponentialRampToValueAtTime(0.0001, t0 + dur);
      trackSource(o.osc); o.osc.start(t0); o.osc.stop(t0 + dur + 0.01);
      return dur;
    },

    // "Boing" — fast exponential pitch fall + springy LFO wobble.
    Boing: function (t0) {
      var dur = 0.5;
      var o = makeOsc("triangle");
      o.gain.connect(master);
      o.osc.frequency.setValueAtTime(880, t0);
      o.osc.frequency.exponentialRampToValueAtTime(120, t0 + 0.4);

      // Springy wobble: LFO modulating the oscillator frequency.
      var lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(18, t0);
      lfo.frequency.exponentialRampToValueAtTime(7, t0 + dur);
      var lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, t0);
      lfoGain.gain.exponentialRampToValueAtTime(8, t0 + dur);
      lfo.connect(lfoGain);
      lfoGain.connect(o.osc.frequency);

      envelope(o.gain, t0, 0.6, 0.01, dur);
      trackSource(o.osc); o.osc.start(t0); o.osc.stop(t0 + dur + 0.02);
      trackSource(lfo); lfo.start(t0); lfo.stop(t0 + dur + 0.02);
      return dur;
    },

    // "Chomp" — filtered noise burst + low square blip.
    Chomp: function (t0) {
      var dur = 0.15;
      var n = makeNoise();
      var bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(1400, t0);
      bp.frequency.exponentialRampToValueAtTime(500, t0 + dur);
      bp.Q.value = 1.2;
      n.gain.connect(bp);
      bp.connect(master);
      envelope(n.gain, t0, 0.55, 0.004, 0.12);

      var sq = makeOsc("square");
      sq.gain.connect(master);
      sq.osc.frequency.setValueAtTime(180, t0);
      sq.osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.1);
      envelope(sq.gain, t0, 0.35, 0.004, dur);

      trackSource(n.src); n.src.start(t0); n.src.stop(t0 + dur + 0.02);
      trackSource(sq.osc); sq.osc.start(t0); sq.osc.stop(t0 + dur + 0.02);
      return dur;
    },

    // "Coin" — two-note square arpeggio B5 -> E6.
    Coin: function (t0) {
      var dur = 0.35;
      var o = makeOsc("square");
      o.gain.connect(master);
      // B5 ~ 987.77, E6 ~ 1318.51
      o.osc.frequency.setValueAtTime(987.77, t0);
      o.osc.frequency.setValueAtTime(1318.51, t0 + 0.08);
      var g = o.gain.gain;
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(0.5, t0 + 0.01);
      g.setValueAtTime(0.5, t0 + 0.08);
      g.exponentialRampToValueAtTime(0.0001, t0 + dur);
      trackSource(o.osc); o.osc.start(t0); o.osc.stop(t0 + dur + 0.02);
      return dur;
    },

    // "Tada" — three-note rising triad + noise sparkle.
    Tada: function (t0) {
      var dur = 0.6;
      var notes = [523.25, 659.25, 783.99]; // C5 E5 G5
      for (var i = 0; i < notes.length; i++) {
        var o = makeOsc("triangle");
        o.gain.connect(master);
        o.osc.frequency.setValueAtTime(notes[i], t0);
        envelope(o.gain, t0 + i * 0.06, 0.4, 0.01, dur - i * 0.06);
        trackSource(o.osc); o.osc.start(t0 + i * 0.06); o.osc.stop(t0 + dur + 0.02);
      }
      // sparkle
      var n = makeNoise();
      var hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 4000;
      n.gain.connect(hp);
      hp.connect(master);
      envelope(n.gain, t0 + 0.18, 0.25, 0.02, 0.4);
      trackSource(n.src); n.src.start(t0 + 0.18); n.src.stop(t0 + dur + 0.02);
      return dur;
    },

    // "Click" — 2ms tick.
    Click: function (t0) {
      var dur = 0.02;
      var o = makeOsc("square");
      o.gain.connect(master);
      o.osc.frequency.setValueAtTime(2000, t0);
      var g = o.gain.gain;
      g.setValueAtTime(0.4, t0);
      g.exponentialRampToValueAtTime(0.0001, t0 + dur);
      trackSource(o.osc); o.osc.start(t0); o.osc.stop(t0 + dur + 0.005);
      return dur;
    },

    // "Whoosh" — bandpass-swept noise.
    Whoosh: function (t0) {
      var dur = 0.3;
      var n = makeNoise();
      var bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(300, t0);
      bp.frequency.exponentialRampToValueAtTime(3500, t0 + dur);
      n.gain.connect(bp);
      bp.connect(master);
      var g = n.gain.gain;
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(0.5, t0 + 0.12);
      g.exponentialRampToValueAtTime(0.0001, t0 + dur);
      trackSource(n.src); n.src.start(t0); n.src.stop(t0 + dur + 0.02);
      return dur;
    },

    // "LevelUp" — rising 4-note arpeggio + shimmer tail.
    LevelUp: function (t0) {
      var dur = 0.6;
      var notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      var step = 0.09;
      for (var i = 0; i < notes.length; i++) {
        var o = makeOsc("square");
        o.gain.connect(master);
        o.osc.frequency.setValueAtTime(notes[i], t0 + i * step);
        envelope(o.gain, t0 + i * step, 0.4, 0.008, 0.16);
        trackSource(o.osc);
        o.osc.start(t0 + i * step);
        o.osc.stop(t0 + i * step + 0.2);
      }
      // shimmer
      var s = makeOsc("triangle");
      s.gain.connect(master);
      s.osc.frequency.setValueAtTime(1046.5, t0 + 0.27);
      s.osc.frequency.linearRampToValueAtTime(1568, t0 + dur);
      envelope(s.gain, t0 + 0.27, 0.25, 0.02, dur - 0.27);
      trackSource(s.osc); s.osc.start(t0 + 0.27); s.osc.stop(t0 + dur + 0.02);
      return dur;
    },

    // "Achievement" — two-chime bell (sine + harmonic partials, long decay).
    Achievement: function (t0) {
      var dur = 1.4;
      function chime(when, fund) {
        var partials = [
          { m: 1.0, g: 0.5 },
          { m: 2.0, g: 0.25 },
          { m: 3.0, g: 0.12 },
          { m: 4.2, g: 0.08 }
        ];
        for (var i = 0; i < partials.length; i++) {
          var p = partials[i];
          var o = makeOsc("sine");
          o.gain.connect(master);
          o.osc.frequency.setValueAtTime(fund * p.m, when);
          var g = o.gain.gain;
          g.setValueAtTime(0.0001, when);
          g.exponentialRampToValueAtTime(p.g, when + 0.01);
          g.exponentialRampToValueAtTime(0.0001, when + 0.9);
          trackSource(o.osc); o.osc.start(when); o.osc.stop(when + 0.95);
        }
      }
      chime(t0, 880);        // A5
      chime(t0 + 0.22, 1174.66); // D6
      return dur;
    },

    // "Snip" — two short filtered noise snips (scissors).
    Snip: function (t0) {
      var dur = 0.12;
      function snip(when) {
        var n = makeNoise();
        var bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.setValueAtTime(3200, when);
        bp.frequency.exponentialRampToValueAtTime(1800, when + 0.04);
        bp.Q.value = 4;
        n.gain.connect(bp);
        bp.connect(master);
        var g = n.gain.gain;
        g.setValueAtTime(0.0001, when);
        g.exponentialRampToValueAtTime(0.45, when + 0.003);
        g.exponentialRampToValueAtTime(0.0001, when + 0.045);
        trackSource(n.src); n.src.start(when); n.src.stop(when + 0.06);
      }
      snip(t0);
      snip(t0 + 0.06);
      return dur;
    },

    // "Error" — descending minor-second buzz.
    Error: function (t0) {
      var dur = 0.3;
      var o = makeOsc("sawtooth");
      var lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1400;
      o.gain.connect(lp);
      lp.connect(master);
      // minor second: ~330 -> ~311 Hz (E4 -> D#4)
      o.osc.frequency.setValueAtTime(329.63, t0);
      o.osc.frequency.setValueAtTime(311.13, t0 + 0.15);
      var g = o.gain.gain;
      g.setValueAtTime(0.0001, t0);
      g.exponentialRampToValueAtTime(0.45, t0 + 0.01);
      g.setValueAtTime(0.45, t0 + 0.15);
      g.exponentialRampToValueAtTime(0.0001, t0 + dur);
      trackSource(o.osc); o.osc.start(t0); o.osc.stop(t0 + dur + 0.02);
      return dur;
    }
  };

  // Nominal durations (used for the no-op fallback so playUntilDone still waits).
  var NOMINAL = {
    Meow: 0.42, Pop: 0.07, Boing: 0.5, Chomp: 0.15, Coin: 0.35,
    Tada: 0.6, Click: 0.02, Whoosh: 0.3, LevelUp: 0.6,
    Achievement: 1.4, Snip: 0.12, Error: 0.3
  };

  // --------------------------------------------------------------------------
  // Sampled sounds — generated MP3s in assets/sounds/<Name>.mp3.
  // Values are nominal durations (fallback while a buffer is still decoding).
  // Buffers route through the same master gain, and their sources are tracked
  // in `live`, so volume blocks and stop-all work exactly like synth patches.
  // --------------------------------------------------------------------------
  var SAMPLES = {
    Laser: 0.6, Jump: 0.7, Splash: 0.8, Boom: 1.2, Cheer: 1.5, Giggle: 1.0,
    Bark: 0.8, Roar: 1.2, Magic: 1.0, Whistle: 1.2, Drumroll: 1.5, Buzzer: 0.7,
    Rocket: 1.2, Bubbles: 1.2, Ding: 0.6, Horn: 0.8
  };
  var sampleBuffers = {};   // name -> AudioBuffer | "loading" | "failed"
  var samplesPreloaded = false;

  function loadSample(name) {
    if (!ctx || sampleBuffers[name]) return;
    sampleBuffers[name] = "loading";
    fetch("assets/sounds/" + name + ".mp3")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(function (ab) { return ctx.decodeAudioData(ab); })
      .then(function (buf) { sampleBuffers[name] = buf; })
      .catch(function () { sampleBuffers[name] = "failed"; });
  }
  function preloadSamples() {
    if (samplesPreloaded || !ctx) return;
    samplesPreloaded = true;
    for (var name in SAMPLES) loadSample(name);
  }
  function playSample(name) {
    var c = ensure();
    if (!c) return SAMPLES[name];
    var buf = sampleBuffers[name];
    if (!buf) loadSample(name); // first request races the decode; next one wins
    if (!buf || typeof buf === "string") return SAMPLES[name];
    try {
      var src = ctx.createBufferSource();
      src.buffer = buf;
      var g = ctx.createGain();
      g.gain.value = 0.9;
      src.connect(g);
      g.connect(master);
      trackSource(src);
      src.start();
      return buf.duration;
    } catch (e) { return SAMPLES[name]; }
  }

  // Only warn once per unknown name.
  var warnedUnknown = {};
  function warnUnknown(name) {
    if (warnedUnknown[name]) return;
    warnedUnknown[name] = true;
    if (window.console && console.warn) {
      console.warn('CtrlCreate.sound: unknown sound "' + name + '" — ignoring.');
    }
  }

  // --------------------------------------------------------------------------
  // Public API
  // --------------------------------------------------------------------------

  // Fire-and-forget a named SFX. Returns approximate duration in seconds.
  function play(name) {
    CtrlCreate.track && CtrlCreate.track("sound:played", { name: name });
    if (SAMPLES[name]) return playSample(name);
    var patch = PATCHES[name];
    if (!patch) {
      // Unknown but possibly game-requested: warn once, no-op.
      if (!(name in NOMINAL)) warnUnknown(name);
      return NOMINAL[name] || 0;
    }
    var c = ensure();
    if (!c) return NOMINAL[name] || 0; // no audio backend -> nominal duration.
    try {
      return patch(c.currentTime + 0.001) || (NOMINAL[name] || 0);
    } catch (e) {
      if (window.console && console.warn) console.warn("CtrlCreate.sound: play failed", e);
      return NOMINAL[name] || 0;
    }
  }

  // Play and resolve a Promise when the sound has finished.
  function playUntilDone(name) {
    var dur = play(name);
    return new Promise(function (resolve) {
      setTimeout(resolve, Math.max(0, dur) * 1000);
    });
  }

  // Immediately silence and stop every live source.
  function stopAll() {
    var now = ctx ? ctx.currentTime : 0;
    live.forEach(function (node) {
      try { node.onended = null; node.stop(now); } catch (e) { /* ignore */ }
    });
    live.clear();
  }

  // Master volume controls (0..100). A kid's own "set volume to %" block still
  // works while master-muted (volumePct updates, getVolume() reflects it) —
  // it just has no audible effect until the master mute is lifted.
  function setVolume(pct) {
    pct = Math.max(0, Math.min(100, isFinite(pct) ? pct : 100));
    volumePct = pct;
    if (master && ctx) {
      master.gain.setTargetAtTime(effectiveGain(), ctx.currentTime, 0.01);
    }
    return volumePct;
  }
  function changeVolume(delta) {
    return setVolume(volumePct + (isFinite(delta) ? delta : 0));
  }
  function getVolume() { return volumePct; }

  // Engine-level master mute (see `masterMuted` above). Independent of
  // volumePct/"Quiet classroom mode" — this is the single audio on/off switch
  // the #btn-mute toolbar toggle drives via ctx.settings.
  function setMuted(muted) {
    masterMuted = !!muted;
    if (master && ctx) {
      master.gain.setTargetAtTime(effectiveGain(), ctx.currentTime, 0.01);
    }
    return masterMuted;
  }
  function getMuted() { return masterMuted; }

  // --------------------------------------------------------------------------
  // Musical notes
  // Tempo fixed at 120bpm -> 1 beat = 0.5s. Triangle + sine layered pluck.
  // --------------------------------------------------------------------------
  function midiToFreq(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  function playNote(midiNote, beats) {
    CtrlCreate.track && CtrlCreate.track("sound:played", { name: "note" });
    var m = Math.max(0, Math.min(130, isFinite(midiNote) ? midiNote : 60));
    var b = isFinite(beats) ? beats : 1;
    var dur = Math.max(0, b) * 0.5; // 0.5s per beat.

    var c = ensure();
    if (!c || dur <= 0) {
      return new Promise(function (resolve) {
        setTimeout(resolve, Math.max(0, dur) * 1000);
      });
    }

    var t0 = c.currentTime + 0.001;
    var freq = midiToFreq(m);

    // Layered pluck: triangle body + sine sub, exponential decay.
    var tri = makeOsc("triangle");
    tri.gain.connect(master);
    tri.osc.frequency.setValueAtTime(freq, t0);

    var sine = makeOsc("sine");
    sine.gain.connect(master);
    sine.osc.frequency.setValueAtTime(freq, t0);

    var tail = 0.06; // small release beyond the notated length
    var total = dur + tail;

    var gt = tri.gain.gain;
    gt.setValueAtTime(0.0001, t0);
    gt.exponentialRampToValueAtTime(0.5, t0 + 0.008);
    gt.exponentialRampToValueAtTime(0.0001, t0 + total);

    var gs = sine.gain.gain;
    gs.setValueAtTime(0.0001, t0);
    gs.exponentialRampToValueAtTime(0.3, t0 + 0.008);
    gs.exponentialRampToValueAtTime(0.0001, t0 + total);

    trackSource(tri.osc); tri.osc.start(t0); tri.osc.stop(t0 + total + 0.02);
    trackSource(sine.osc); sine.osc.start(t0); sine.osc.stop(t0 + total + 0.02);

    return new Promise(function (resolve) {
      setTimeout(resolve, dur * 1000);
    });
  }

  // --------------------------------------------------------------------------
  // Attach & arm
  // --------------------------------------------------------------------------
  CtrlCreate.sound = {
    init: init,
    play: play,
    playUntilDone: playUntilDone,
    stopAll: stopAll,
    setVolume: setVolume,
    changeVolume: changeVolume,
    getVolume: getVolume,
    setMuted: setMuted,
    getMuted: getMuted,
    playNote: playNote
  };

  // Arm gesture listeners immediately so the very first user interaction
  // unlocks audio, even before init() is explicitly called.
  if (supported) armGestures();

  // If the game layer broadcasts a hard stop, silence everything.
  if (CtrlCreate.on) {
    CtrlCreate.on("run:stop", stopAll);
    CtrlCreate.on("stop:all", stopAll);
  }

})();
