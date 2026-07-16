/* ============================================================================
 * CtrlCreate.fx — papercut particle / juice engine
 * ----------------------------------------------------------------------------
 * A tiny, dependency-free effects layer that paints paper confetti, torn-paper
 * pops, twinkling stars, and screen shake over the stage. All coordinates are
 * STAGE-CANVAS PIXEL coords (0..480 x, 0..360 y, y-down); the interpreter maps
 * world -> pixel before calling in.
 *
 * Loaded BEFORE stage.js, so CtrlCreate.stage does NOT exist at init — every
 * lookup is lazy, inside functions. If #stage-frame is missing, all public
 * methods are safe no-ops.
 * ========================================================================== */
(function () {
  "use strict";

  var CtrlCreate = window.CtrlCreate = window.CtrlCreate || {};

  // ---- Constants -----------------------------------------------------------
  var W = 480, H = 360;
  var MAX_PARTICLES = 400;
  var CONFETTI_COLORS = [
    "#e5533c", "#4c97ff", "#59c059", "#ffbf00",
    "#9966ff", "#cf63cf", "#fffdf7"
  ];

  // ---- Module state --------------------------------------------------------
  var canvas = null;   // overlay canvas (lazy)
  var ctx = null;
  var particles = [];  // live particles
  var running = false; // loop scheduled?
  var lastT = 0;

  // Shake state
  var shakeT = 0;          // remaining seconds
  var shakeDur = 0;        // total duration of current shake
  var shakeMag = 0;        // current intensity
  var shakeFrame = null;   // element being transformed (#stage-frame)
  var shakeBase = null;    // original inline transform to restore exactly

  // ---- Utilities -----------------------------------------------------------
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  // Darken a #rrggbb hex by factor (0..1). Used for cheap hard shadows/shades.
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16);
    var r = Math.max(0, ((n >> 16) & 255) * f) | 0;
    var g = Math.max(0, ((n >> 8) & 255) * f) | 0;
    var b = Math.max(0, (n & 255) * f) | 0;
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // ---- Overlay canvas (lazy) ----------------------------------------------
  function ensureCanvas() {
    if (canvas) return canvas;
    var frame = document.getElementById("stage-frame");
    if (!frame) return null;
    canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    canvas.setAttribute("aria-hidden", "true");
    var s = canvas.style;
    s.position = "absolute";
    s.left = "0";
    s.top = "0";
    s.width = "100%";
    s.height = "100%";
    s.pointerEvents = "none";
    s.zIndex = "2"; // above stage canvas, below #stage-overlays (later in DOM)
    // Ensure the frame can position the overlay.
    if (getComputedStyle(frame).position === "static") {
      frame.style.position = "relative";
    }
    frame.appendChild(canvas);
    ctx = canvas.getContext("2d");
    return canvas;
  }

  // ---- Particle bookkeeping ------------------------------------------------
  function push(p) {
    if (particles.length >= MAX_PARTICLES) particles.shift(); // evict oldest
    particles.push(p);
  }

  function start() {
    if (running) return;
    if (!ensureCanvas()) return;
    running = true;
    lastT = performance.now();
    CtrlCreate.nextTick(loop);
  }

  // ---- The one loop --------------------------------------------------------
  function loop() {
    if (!running) return;
    var now = performance.now();
    var dt = (now - lastT) / 1000;
    lastT = now;
    if (dt > 0.05) dt = 0.05; // clamp to 50ms

    step(dt);
    render();
    updateShake(dt);

    if (particles.length === 0 && shakeT <= 0) {
      // Nothing left: wipe once and stop scheduling.
      if (ctx) ctx.clearRect(0, 0, W, H);
      running = false;
      return;
    }
    CtrlCreate.nextTick(loop);
  }

  function step(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      if (p.grow) p.r += p.grow * dt; // expanding ring
    }
  }

  // ---- Rendering per particle type ----------------------------------------
  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var a = p.fade ? Math.min(1, p.life / p.fade) : 1;
      if (p.type === "ring") { drawRing(p, a); continue; }
      if (p.type === "star") { drawStar(p, a); continue; }
      drawScrap(p, a); // confetti + burst scraps
    }
  }

  // Flat paper rectangle / polygon with a hard offset shadow.
  function drawScrap(p, a) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    // hard shadow: single darker copy offset 1.5px
    ctx.fillStyle = p.shadow;
    if (p.poly) fillPoly(p.poly, 1.5, 1.5);
    else ctx.fillRect(-p.w / 2 + 1.5, -p.h / 2 + 1.5, p.w, p.h);
    // face
    ctx.fillStyle = p.color;
    if (p.poly) fillPoly(p.poly, 0, 0);
    else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }

  function fillPoly(pts, ox, oy) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0] + ox, pts[0][1] + oy);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + ox, pts[i][1] + oy);
    ctx.closePath();
    ctx.fill();
  }

  function drawRing(p, a) {
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 4-point paper star (twinkles via alpha in `a`, plus own oscillation).
  function drawStar(p, a) {
    var tw = 0.5 + 0.5 * Math.abs(Math.sin(p.tw));
    p.tw += 0.3;
    ctx.save();
    ctx.globalAlpha = a * tw;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    var r = p.r, i = r * 0.34;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(i, -i);
    ctx.lineTo(r, 0);
    ctx.lineTo(i, i);
    ctx.lineTo(0, r);
    ctx.lineTo(-i, i);
    ctx.lineTo(-r, 0);
    ctx.lineTo(-i, -i);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Build an irregular 3-5 sided torn-paper polygon around origin.
  function tornPoly(size) {
    var n = 3 + ((Math.random() * 3) | 0); // 3..5
    var pts = [];
    for (var i = 0; i < n; i++) {
      var ang = (i / n) * Math.PI * 2 + rand(-0.3, 0.3);
      var rr = size * rand(0.6, 1.0);
      pts.push([Math.cos(ang) * rr, Math.sin(ang) * rr]);
    }
    return pts;
  }

  // ========================================================================
  // PUBLIC EFFECTS
  // ========================================================================

  // Confetti: bright paper rectangles, upward burst, gravity, spin, air drag.
  function confetti(cx, cy, count) {
    if (!ensureCanvas()) return;
    count = count || 26;
    for (var i = 0; i < count; i++) {
      var color = pick(CONFETTI_COLORS);
      var w = rand(4, 8), h = rand(6, 11);
      push({
        type: "scrap", x: cx, y: cy,
        vx: rand(-110, 110), vy: rand(-260, -60),
        g: rand(360, 520), drag: 0.99,
        rot: rand(0, Math.PI * 2), spin: rand(-9, 9),
        w: w, h: h, color: color, shadow: shade(color, 0.55),
        life: rand(1.0, 1.4), fade: 0.5
      });
    }
    start();
  }

  // Burst: torn-paper pop in 2-3 shades of `color` + a quick expanding ring.
  function burst(cx, cy, color) {
    if (!ensureCanvas()) return;
    color = color || "#e8913c";
    var shades = [color, shade(color, 0.8), shade(color, 1.0)];
    var n = 10 + ((Math.random() * 5) | 0); // 10..14
    for (var i = 0; i < n; i++) {
      var ang = rand(0, Math.PI * 2);
      var spd = rand(80, 220);
      var c = pick(shades);
      push({
        type: "scrap", x: cx, y: cy,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 40,
        g: rand(300, 460), drag: 0.97,
        rot: rand(0, Math.PI * 2), spin: rand(-12, 12),
        poly: tornPoly(rand(4, 7)), color: c, shadow: shade(color, 0.5),
        life: rand(0.7, 1.1), fade: 0.5
      });
    }
    // expanding ring outline, fades in ~0.25s
    push({
      type: "ring", x: cx, y: cy, vx: 0, vy: 0, g: 0, drag: 1,
      rot: 0, spin: 0, r: 4, grow: 120, color: color,
      life: 0.25, fade: 0.25
    });
    start();
  }

  // Sparkle: 1-3 tiny 4-point stars drifting up, twinkling, dying ~0.6s. Cheap.
  function sparkle(cx, cy) {
    if (!ensureCanvas()) return;
    var n = 1 + ((Math.random() * 3) | 0); // 1..3
    for (var i = 0; i < n; i++) {
      push({
        type: "star", x: cx + rand(-4, 4), y: cy + rand(-4, 4),
        vx: rand(-14, 14), vy: rand(-40, -14),
        g: 30, drag: 0.98, rot: rand(0, Math.PI * 2), spin: rand(-2, 2),
        r: rand(3, 5.5), tw: rand(0, Math.PI * 2),
        color: pick(["#ffbf00", "#fffdf7", "#ffe680"]),
        life: rand(0.45, 0.6), fade: 0.6
      });
    }
    start();
  }

  // ---- Screen shake --------------------------------------------------------
  // Animate a CSS translate on #stage-frame that decays to zero, then restore
  // the exact original inline transform. Concurrent calls re-energize, never
  // stack transforms.
  function shake(seconds, intensity) {
    var frame = document.getElementById("stage-frame");
    if (!frame) return;
    seconds = seconds || 0.35;
    intensity = intensity || 6;
    if (shakeT <= 0 || shakeFrame !== frame) {
      // fresh shake: capture the true baseline transform to restore later
      shakeFrame = frame;
      shakeBase = frame.style.transform; // may be "" — restore exactly that
    }
    // extend / re-energize
    shakeT = Math.max(shakeT, seconds);
    shakeDur = Math.max(shakeDur, seconds);
    shakeMag = Math.max(shakeMag, intensity);
    start();
  }

  function updateShake(dt) {
    if (shakeT <= 0 || !shakeFrame) return;
    shakeT -= dt;
    if (shakeT <= 0) {
      // restore exactly what was there before
      shakeFrame.style.transform = shakeBase || "";
      shakeFrame = null;
      shakeBase = null;
      shakeMag = 0;
      shakeDur = 0;
      return;
    }
    var k = shakeDur > 0 ? (shakeT / shakeDur) : 0; // decay 1 -> 0
    var m = shakeMag * k;
    var dx = rand(-m, m), dy = rand(-m, m);
    var t = "translate(" + dx.toFixed(2) + "px," + dy.toFixed(2) + "px)";
    shakeFrame.style.transform = (shakeBase ? shakeBase + " " : "") + t;
  }

  // ---- Housekeeping --------------------------------------------------------
  function clear() {
    particles.length = 0;
    if (ctx) ctx.clearRect(0, 0, W, H);
    // note: an in-flight shake keeps running to restore transform cleanly
  }

  function activeCount() { return particles.length; }

  // ---- Export --------------------------------------------------------------
  CtrlCreate.fx = { confetti: confetti, burst: burst, sparkle: sparkle,
                  shake: shake, clear: clear, activeCount: activeCount };
})();
