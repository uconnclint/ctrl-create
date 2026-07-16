/* ============================================================================
 * CTRL+CREATE — stage.js
 * Canvas stage + sprite system.
 *  - Procedural PAPERCUT characters (built-in vector art, 2 frames each).
 *    Every character is authored FACING RIGHT; when a sprite faces left
 *    (rotationStyle "left-right", dir < 0) we mirror it, so it never looks
 *    like it's moonwalking. When generated PNG assets exist at
 *    assets/sprites/<slug>_right.png / _left.png they are used instead.
 *  - Speech/thought bubbles, ask prompt, variable monitors (DOM overlays).
 *  - Sprite panel UI (list, add, select) + live x/y/size/dir readout.
 * ==========================================================================*/
(function () {
  "use strict";
  const { el, clamp } = CtrlCreate;

  const cvs = document.getElementById("stage");
  const ctx = cvs.getContext("2d");
  const overlays = document.getElementById("stage-overlays");
  const frame = document.getElementById("stage-frame");
  const listEl = document.getElementById("sprite-list");
  const propsEl = document.getElementById("sprite-props");

  const W = 480, H = 360, HW = 240, HH = 180;

  /* ----------------------------------------------- overlay styles (self) -- */
  document.head.appendChild(el("style", { text: `
    #stage-overlays{position:absolute;inset:0;pointer-events:none;overflow:hidden}
    .say-bubble{position:absolute;max-width:150px;background:#fffdf7;color:#3a3226;
      border:1.5px solid #cbbfa5;border-radius:12px 12px 12px 3px;padding:6px 10px;
      font:600 12px/1.3 -apple-system,"SF Pro Rounded","Segoe UI",ui-rounded,sans-serif;
      box-shadow:2px 3px 0 rgba(58,50,38,.18);transform:translate(-8%,-100%)}
    .say-bubble.think{border-radius:14px;border-style:dashed}
    .var-monitor{position:absolute;left:8px;background:#fffdf7;border:1.5px solid #cbbfa5;
      border-radius:8px;padding:3px 8px;font:700 11px/1.2 -apple-system,"SF Pro Rounded",sans-serif;
      color:#3a3226;box-shadow:2px 2px 0 rgba(58,50,38,.15);display:flex;gap:6px;align-items:center}
    .var-monitor b{background:#ff8c1a;color:#fff;border-radius:6px;padding:2px 7px;font-size:11px}
    .ask-box{position:absolute;left:10px;right:10px;bottom:10px;background:#fffdf7;
      border:1.5px solid #cbbfa5;border-radius:10px;padding:8px;pointer-events:auto;
      box-shadow:3px 4px 0 rgba(58,50,38,.2);font:600 12px -apple-system,"SF Pro Rounded",sans-serif;color:#3a3226}
    .ask-box input{width:100%;box-sizing:border-box;margin-top:6px;border:1.5px solid #cbbfa5;
      border-radius:8px;padding:6px 8px;font:inherit;outline:none}
    .sprite-chip{display:flex;align-items:center;gap:8px;padding:5px 8px;margin:4px 0;
      border-radius:10px;cursor:pointer;border:1.5px dashed transparent}
    .sprite-chip:hover{background:rgba(58,50,38,.06)}
    .sprite-chip.selected{border-color:#cbbfa5;background:#fffdf7;box-shadow:2px 2px 0 rgba(58,50,38,.12)}
    .sprite-chip canvas{width:34px;height:34px}
    .sprite-chip .nm{font:700 12px -apple-system,"SF Pro Rounded",sans-serif;color:#3a3226}
    #sprite-props{font:600 11px -apple-system,"SF Pro Rounded",sans-serif;color:#3a3226;
      opacity:.8;display:flex;gap:10px;padding:6px 4px;flex-wrap:wrap}
  ` }));

  /* -------------------------------------------------- papercut char lib -- */
  // Each draws in a ~[-40,40] box, FACING RIGHT. frame ∈ {0,1} for walk pose.
  // Layered flat shapes + hard offset shadow = papercut.
  function shadowed(c, fill, path) {
    c.save();
    c.translate(2.5, 3); c.fillStyle = "rgba(58,50,38,.25)"; path(c); c.fill();
    c.restore();
    c.fillStyle = fill; path(c); c.fill();
  }
  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); }
  function tri(c, x1, y1, x2, y2, x3, y3) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.closePath(); }
  function eye(c, x, y, r) {
    c.fillStyle = "#fffdf7"; circle(c, x, y, r); c.fill();
    c.fillStyle = "#3a3226"; circle(c, x + r * 0.3, y, r * 0.45); c.fill();
  }

  const CHARS = {
    scrappy: { name: "Scrappy", draw(c, f) {   // papercut cat — the mascot
      const leg = f ? 6 : -6;
      shadowed(c, "#e8913c", (k) => { rr(k, -26, -8, 44, 34, 12); });          // body
      c.fillStyle = "#c96f22"; rr(c, -20 + leg, 22, 10, 12, 4); c.fill();      // legs
      rr(c, 4 - leg, 22, 10, 12, 4); c.fill();
      c.strokeStyle = "#c96f22"; c.lineWidth = 6; c.lineCap = "round";          // tail
      c.beginPath(); c.moveTo(-26, 4); c.quadraticCurveTo(-40, -2 + (f ? 6 : 0), -36, -16); c.stroke();
      shadowed(c, "#f2a75c", (k) => { circle(k, 16, -18, 17); });               // head
      c.fillStyle = "#f2a75c"; tri(c, 4, -30, 12, -38, 16, -28); c.fill();      // ears
      tri(c, 22, -32, 30, -36, 30, -24); c.fill();
      c.fillStyle = "#e26d5c"; tri(c, 7, -29, 11, -34, 14, -28); c.fill();
      eye(c, 12, -20, 4); eye(c, 24, -20, 4);
      c.fillStyle = "#e26d5c"; circle(c, 19, -12, 2.5); c.fill();               // nose
      c.strokeStyle = "#3a3226"; c.lineWidth = 1.4;                             // whiskers
      c.beginPath(); c.moveTo(24, -10); c.lineTo(34, -12); c.moveTo(24, -8); c.lineTo(34, -6); c.stroke();
    }},
    robo: { name: "Robo", draw(c, f) {
      const arm = f ? 5 : -5;
      shadowed(c, "#9aa7b8", (k) => { rr(k, -22, -10, 40, 32, 6); });           // torso
      c.fillStyle = "#7c8a9c"; rr(c, -18 + arm, 22, 9, 12, 3); c.fill(); rr(c, 6 - arm, 22, 9, 12, 3); c.fill();
      shadowed(c, "#b8c4d4", (k) => { rr(k, -12, -34, 32, 24, 8); });           // head
      c.fillStyle = "#59c059"; rr(c, -6, -28, 8, 8, 2); c.fill();               // eyes
      c.fillStyle = "#59c059"; rr(c, 8, -28, 8, 8, 2); c.fill();
      c.strokeStyle = "#7c8a9c"; c.lineWidth = 3;                                // antenna
      c.beginPath(); c.moveTo(4, -34); c.lineTo(4, -42); c.stroke();
      c.fillStyle = "#e5533c"; circle(c, 4, -44, 3.5); c.fill();
      c.fillStyle = "#e8b23c"; circle(c, -2, 4, 5); c.fill();                    // button
    }},
    drago: { name: "Drago", draw(c, f) {
      const wing = f ? -6 : 2;
      c.fillStyle = "#3f9b57"; tri(c, -14, -6 + wing, -34, -26 + wing, -6, -14 + wing); c.fill(); // wing
      shadowed(c, "#59c059", (k) => { rr(k, -26, -6, 46, 30, 14); });           // body
      c.fillStyle = "#3f9b57";                                                   // tail spikes
      tri(c, -26, 6, -40, 2, -28, 14); c.fill();
      shadowed(c, "#6ed06e", (k) => { circle(k, 18, -16, 15); });                // head
      tri(c, 8, -28, 12, -38, 18, -27); c.fillStyle = "#e8b23c"; c.fill();       // horns
      tri(c, 22, -30, 28, -38, 30, -26); c.fill();
      eye(c, 16, -18, 4); eye(c, 27, -18, 3.5);
      c.fillStyle = "#e26d5c"; tri(c, 30, -10, 40, -8, 30, -5); c.fill();        // fire puff
    }},
    pip: { name: "Pip", draw(c, f) {
      const flip = f ? 4 : -4;
      shadowed(c, "#3a3226", (k) => { rr(k, -18, -26, 36, 52, 17); });           // body
      c.fillStyle = "#fffdf7"; rr(c, -11, -12, 22, 32, 11); c.fill();            // belly
      c.fillStyle = "#3a3226"; tri(c, -18, -2 + flip, -28, 6 + flip, -16, 10); c.fill(); // flipper
      eye(c, 2, -16, 4); eye(c, 12, -16, 4);
      c.fillStyle = "#e8913c"; tri(c, 14, -10, 24, -7, 14, -4); c.fill();        // beak
      c.fillStyle = "#e8913c"; rr(c, -12 + flip, 24, 10, 6, 3); c.fill();        // feet
      rr(c, 2 - flip, 24, 10, 6, 3); c.fill();
    }},
    foxy: { name: "Foxy", draw(c, f) {
      const leg = f ? 5 : -5;
      c.fillStyle = "#e5533c";                                                   // tail
      tri(c, -24, 2, -42, -8 + (f ? 6 : 0), -26, 14); c.fill();
      c.fillStyle = "#fffdf7"; tri(c, -38, -5 + (f ? 6 : 0), -42, -8 + (f ? 6 : 0), -36, 2); c.fill();
      shadowed(c, "#ef6a4d", (k) => { rr(k, -24, -6, 42, 28, 12); });            // body
      c.fillStyle = "#c94f36"; rr(c, -16 + leg, 20, 9, 12, 4); c.fill(); rr(c, 4 - leg, 20, 9, 12, 4); c.fill();
      shadowed(c, "#ef6a4d", (k) => { tri(k, 2, -8, 34, -14, 16, -34); });       // angular head
      c.fillStyle = "#3a3226"; tri(c, 8, -30, 12, -40, 16, -30); c.fill();       // ears
      tri(c, 18, -32, 24, -40, 26, -30); c.fill();
      c.fillStyle = "#fffdf7"; tri(c, 26, -13, 34, -14, 29, -8); c.fill();       // snout
      c.fillStyle = "#3a3226"; circle(c, 33, -13, 2.2); c.fill();
      eye(c, 16, -22, 3.5);
    }},
    rex: { name: "Rex", draw(c, f) {
      const leg = f ? 7 : -7;
      shadowed(c, "#7db54b", (k) => { rr(k, -28, -10, 44, 34, 12); });           // body
      c.fillStyle = "#639139"; rr(c, -18 + leg, 22, 12, 13, 4); c.fill(); rr(c, 2 - leg, 22, 12, 13, 4); c.fill();
      tri(c, -28, 0, -44, 8, -28, 14); c.fillStyle = "#7db54b"; c.fill();        // tail
      shadowed(c, "#8fc95d", (k) => { rr(k, 4, -36, 32, 28, 9); });              // big head
      c.fillStyle = "#fffdf7"; tri(c, 26, -14, 30, -8, 22, -8); c.fill();        // tooth
      eye(c, 16, -26, 4.5);
      c.fillStyle = "#639139"; rr(c, 12, -2, 7, 8, 3); c.fill();                 // tiny arm
      c.fillStyle = "#3a3226"; circle(c, 30, -22, 1.8); c.fill();                // nostril
    }},
    bumble: { name: "Bumble", draw(c, f) {
      const wing = f ? -4 : 0;
      c.fillStyle = "rgba(180,210,255,.75)";                                     // wings
      circle(c, -6, -22 + wing, 10); c.fill(); circle(c, 6, -24 + wing, 8); c.fill();
      shadowed(c, "#ffbf00", (k) => { rr(k, -22, -12, 42, 28, 14); });           // body
      c.fillStyle = "#3a3226"; rr(c, -14, -12, 8, 28, 2); c.fill();              // stripes
      rr(c, 0, -12, 8, 28, 2); c.fill();
      tri(c, -22, 0, -30, 2, -22, 6); c.fill();                                  // stinger
      eye(c, 14, -4, 4);
      c.strokeStyle = "#3a3226"; c.lineWidth = 1.6;                              // antenna
      c.beginPath(); c.moveTo(16, -12); c.quadraticCurveTo(20, -20, 24, -18); c.stroke();
    }},
    boo: { name: "Boo", draw(c, f) {
      const wob = f ? 3 : -3;
      shadowed(c, "#f4efff", (k) => {
        k.beginPath();
        k.moveTo(-20, 20);
        k.quadraticCurveTo(-24, -24, 0, -26);
        k.quadraticCurveTo(24, -24, 20, 20);
        k.lineTo(14, 14 + wob); k.lineTo(7, 20 - wob); k.lineTo(0, 14 + wob);
        k.lineTo(-7, 20 - wob); k.lineTo(-14, 14 + wob); k.closePath();
      });
      eye(c, 4, -8, 4.5); eye(c, 15, -8, 4.5);
      c.fillStyle = "#3a3226"; circle(c, 10, 2, 3); c.fill();                    // mouth
      c.fillStyle = "#c9b8f0"; circle(c, -8, -2, 3); c.fill();                   // blush
    }},
  };
  // Map art slugs -> a procedural fallback drawing (shown only until the PNG
  // loads). The 8 hand-drawn characters cover the matching art slugs; every
  // other slug uses a friendly paper-blob placeholder.
  const PROC = {
    scrappy: CHARS.scrappy.draw, robot: CHARS.robo.draw, dragon: CHARS.drago.draw,
    penguin: CHARS.pip.draw, fox: CHARS.foxy.draw, dino: CHARS.rex.draw,
    bee: CHARS.bumble.draw, ghost: CHARS.boo.draw,
  };
  function genericDraw(c, f) {
    const wob = f ? 2 : -2;
    shadowed(c, "#d9c4a0", (k) => { rr(k, -22, -20, 44, 44, 16); });
    eye(c, -6, -4, 4); eye(c, 8, -4, 4);
    c.fillStyle = "#b98a5e"; circle(c, 1, 9 + wob * 0.4, 3); c.fill();
  }
  function drawProc(slug, c, f) { (PROC[slug] || genericDraw)(c, f); }

  // The full playable roster — matches assets/sprites/<slug>_{right,left}.png
  const ROSTER = [
    { slug: "scrappy", name: "Scrappy" }, { slug: "dog", name: "Ruff" },
    { slug: "robot", name: "Robo" }, { slug: "dragon", name: "Drago" },
    { slug: "penguin", name: "Pip" }, { slug: "fox", name: "Foxy" },
    { slug: "dino", name: "Rex" }, { slug: "unicorn", name: "Sparkle" },
    { slug: "bee", name: "Bumble" }, { slug: "shark", name: "Chomp" },
    { slug: "ghost", name: "Boo" }, { slug: "wizard", name: "Merlin" },
    { slug: "knight", name: "Sir Cut" }, { slug: "astronaut", name: "Nova" },
    { slug: "ninja", name: "Shadow" }, { slug: "parrot", name: "Polly" },
    { slug: "frog", name: "Hopscotch" }, { slug: "owl", name: "Hoot" },
    { slug: "crab", name: "Pinchy" }, { slug: "butterfly", name: "Flutter" },
    { slug: "monster", name: "Blobby" }, { slug: "alien", name: "Zorp" },
    { slug: "superhero", name: "Captain Craft" }, { slug: "hedgehog", name: "Quill" },
    // Sports
    { slug: "soccer_star", name: "Striker" }, { slug: "hoops_ace", name: "Swish" },
    { slug: "tennis_pro", name: "Ace" }, { slug: "boxing_roo", name: "Rocky" },
    { slug: "skate_kid", name: "Ollie" }, { slug: "gymnast_kid", name: "Tumble" },
    { slug: "soccer_ball", name: "Soccer Ball" }, { slug: "basketball", name: "Basketball" },
    { slug: "trophy_cup", name: "Trophy Cup" }, { slug: "goal_net", name: "Goal Net" },
    // Space
    { slug: "astro_pup", name: "Comet" }, { slug: "rover_bot", name: "Sprocket" },
    { slug: "martian", name: "Blip" }, { slug: "star_captain", name: "Nova Jr." },
    { slug: "moon_bunny", name: "Luna" }, { slug: "comet_cat", name: "Ziggy" },
    { slug: "rocket_ship", name: "Rocket Ship" }, { slug: "planet_saturn", name: "Ringed Planet" },
    { slug: "ufo", name: "UFO" }, { slug: "moon_rock", name: "Moon Rock" },
    // Old Times
    { slug: "pirate_captain", name: "Salty" }, { slug: "cowboy", name: "Tex" },
    { slug: "viking", name: "Bjorn" }, { slug: "pharaoh", name: "Tut" },
    { slug: "roman_gladiator", name: "Max" }, { slug: "princess", name: "Rose" },
    { slug: "treasure_chest", name: "Treasure Chest" }, { slug: "pirate_ship", name: "Pirate Ship" },
    { slug: "campfire", name: "Campfire" }, { slug: "cannon", name: "Cannon" },
    // Town & City
    { slug: "police_officer", name: "Officer Pat" }, { slug: "firefighter", name: "Blaze" },
    { slug: "chef", name: "Basil" }, { slug: "doctor", name: "Dr. Wren" },
    { slug: "mail_carrier", name: "Posty" }, { slug: "builder", name: "Nail" },
    { slug: "taxi_car", name: "Taxi Car" }, { slug: "traffic_light", name: "Traffic Light" },
    { slug: "mailbox", name: "Mailbox" }, { slug: "hotdog_cart", name: "Food Cart" },
    // Holidays
    { slug: "santa", name: "Nick" }, { slug: "snowman", name: "Frost" },
    { slug: "easter_bunny", name: "Tulip" }, { slug: "jack_o_lantern", name: "Jack" },
    { slug: "turkey_tom", name: "Gobble" }, { slug: "birthday_kid", name: "Party" },
    { slug: "gift_box", name: "Gift Box" }, { slug: "christmas_tree", name: "Christmas Tree" },
    { slug: "candy_cane", name: "Candy Cane" }, { slug: "fireworks", name: "Fireworks" },
    // Prehistoric
    { slug: "triceratops", name: "Tri" }, { slug: "pterodactyl", name: "Terry" },
    { slug: "stegosaurus", name: "Spike" }, { slug: "cavekid", name: "Ugg" },
    { slug: "mammoth", name: "Woolly" }, { slug: "sabertooth", name: "Fang" },
    { slug: "dino_egg", name: "Dino Egg" }, { slug: "volcano", name: "Volcano" },
    { slug: "bone", name: "Dinosaur Bone" }, { slug: "palm_fern", name: "Palm Fern" },
  ];
  const ROSTER_BY_SLUG = {};
  ROSTER.forEach((r) => { ROSTER_BY_SLUG[r.slug] = r; });
  const CHAR_KEYS = ROSTER.map((r) => r.slug);
  // characters that ship a 2-frame walk cycle (<slug>_{right,left}_step.png)
  const HEROES = { scrappy: 1, dog: 1, robot: 1, dragon: 1, fox: 1, dino: 1, wizard: 1, knight: 1, astronaut: 1, hedgehog: 1,
    soccer_star: 1, boxing_roo: 1, astro_pup: 1, pirate_captain: 1, mail_carrier: 1, santa: 1, triceratops: 1 };

  /* ------------------------------------------------- optional PNG assets -- */
  // rec: {right, left, right_step, left_step} — any may stay null (no file).
  const imgCache = {};
  let assetLoadPending = false;
  function onAssetLoaded() {
    // coalesce redraws of thumbnails/picker after images arrive
    if (assetLoadPending) return;
    assetLoadPending = true;
    setTimeout(() => { assetLoadPending = false; rebuildPanel(); refreshPicker(); }, 60);
  }
  function loadSide(slug, side) {
    const rec = imgCache[slug] || (imgCache[slug] = {});
    if (rec[side] !== undefined) return;      // already loading/loaded/failed
    rec[side] = null;
    const im = new Image();
    im.onload = () => { rec[side] = im; onAssetLoaded(); };
    im.onerror = () => { rec[side] = false; };
    im.src = "assets/sprites/" + slug + "_" + side + ".png";
  }
  function ensureThumb(slug) { loadSide(slug, "right"); }
  function assetFor(slug) {
    const sides = HEROES[slug] ? ["right", "left", "right_step", "left_step"] : ["right", "left"];
    sides.forEach((s) => loadSide(slug, s));
    return imgCache[slug];
  }

  /* ----------------------------------------------------------- sprites --- */
  let nextSpriteNum = 1;
  const sprites = []; // draw order: index 0 = back
  let selectedId = null;

  function makeSprite(charKey) {
    const key = charKey || CHAR_KEYS[(nextSpriteNum - 1) % CHAR_KEYS.length];
    const meta = ROSTER_BY_SLUG[key] || { name: key };
    const s = {
      id: "sprite" + nextSpriteNum,
      name: meta.name + (nextSpriteNum > CHAR_KEYS.length ? " " + nextSpriteNum : ""),
      char: key,
      x: 0, y: 0, dir: 90, size: 100,
      visible: true, rotationStyle: "left-right",
      costume: 0, costumeCount: 2,
      effects: { ghost: 0, color: 0, brightness: 0 },
      say: null, // {text, type:'say'|'think', until}
      pen: { down: false, color: "#e5533c", size: 3 },
      trail: false,
      isClone: false, cloneOf: null, deleted: false,
    };
    nextSpriteNum++;
    return s;
  }

  /* -------------------------------------------------------------- clones --- */
  const CLONE_CAP = 100;
  function cloneCount() { return sprites.reduce((n, s) => n + (s.isClone ? 1 : 0), 0); }
  function cloneSprite(orig) {
    if (!orig || cloneCount() >= CLONE_CAP) return null;
    const c = {
      id: "clone_" + CtrlCreate.uid("c"),
      name: orig.name, char: orig.char,
      x: orig.x, y: orig.y, dir: orig.dir, size: orig.size,
      visible: orig.visible, rotationStyle: orig.rotationStyle,
      costume: orig.costume, costumeCount: orig.costumeCount,
      effects: { ghost: orig.effects.ghost, color: orig.effects.color, brightness: orig.effects.brightness },
      say: null,
      pen: { down: false, color: orig.pen.color, size: orig.pen.size },
      trail: orig.trail,
      isClone: true, cloneOf: orig.isClone ? orig.cloneOf : orig.id, deleted: false,
    };
    const i = sprites.indexOf(orig);
    sprites.splice(i >= 0 ? i : sprites.length, 0, c); // just behind the original
    return c;
  }
  function removeClone(c) {
    c.deleted = true;
    const i = sprites.indexOf(c);
    if (i >= 0) sprites.splice(i, 1);
  }
  function removeAllClones() {
    for (let i = sprites.length - 1; i >= 0; i--) {
      if (sprites[i].isClone) { sprites[i].deleted = true; sprites.splice(i, 1); }
    }
  }

  /* -------------------------------------------------- project serialization */
  function serializeSprites() {
    return sprites.filter((s) => !s.isClone).map((s) => ({
      id: s.id, name: s.name, char: s.char,
      x: s.x, y: s.y, dir: s.dir, size: s.size,
      visible: s.visible, rotationStyle: s.rotationStyle, costume: s.costume,
    }));
  }
  function restoreSprites(list) {
    sprites.length = 0;
    penClear();
    const src = (Array.isArray(list) && list.length) ? list
      : [{ id: "sprite1", name: "Scrappy", char: "scrappy", x: 0, y: 0, dir: 90, size: 100, visible: true, rotationStyle: "left-right", costume: 0 }];
    let maxNum = 0;
    src.forEach((d) => {
      const key = CHARS[d.char] || ROSTER_BY_SLUG[d.char] ? d.char : "scrappy";
      const s = {
        id: d.id || "sprite" + (maxNum + 1),
        name: d.name || (ROSTER_BY_SLUG[key] ? ROSTER_BY_SLUG[key].name : key),
        char: key,
        x: Number(d.x) || 0, y: Number(d.y) || 0,
        dir: Number(d.dir) || 90, size: Number(d.size) || 100,
        visible: d.visible !== false,
        rotationStyle: d.rotationStyle || "left-right",
        costume: Number(d.costume) || 0, costumeCount: 2,
        effects: { ghost: 0, color: 0, brightness: 0 },
        say: null,
        pen: { down: false, color: "#e5533c", size: 3 },
        trail: false, isClone: false, cloneOf: null, deleted: false,
      };
      sprites.push(s);
      assetFor(s.char);
      const m = /^sprite(\d+)$/.exec(s.id);
      if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
    });
    nextSpriteNum = maxNum + 1;
    select(sprites[0].id);
  }

  function addSprite(charKey, opts) {
    const s = makeSprite(charKey);
    if (sprites.length) { s.x = Math.round(-120 + (sprites.length * 60) % 240); s.y = -40 + (sprites.length % 3) * 40; }
    sprites.push(s);
    assetFor(s.char);
    select(s.id);
    rebuildPanel();
    if (!opts || !opts.silent) CtrlCreate.track("sprite:added", { name: s.name, total: sprites.length });
    return s;
  }

  function removeSprite(id) {
    const i = sprites.findIndex((s) => s.id === id);
    if (i < 0 || sprites.length <= 1) return;
    sprites.splice(i, 1);
    if (selectedId === id) select(sprites[sprites.length - 1].id);
    rebuildPanel();
  }

  function get(id) { return sprites.find((s) => s.id === id); }
  function selected() { return get(selectedId); }

  function select(id) {
    selectedId = id;
    CtrlCreate.workspace.setSprite(id);
    rebuildPanel();
    CtrlCreate.emit("sprite:selected", { id });
  }

  /* ------------------------------------------------------- sprite panel -- */
  function thumb(slug, size) {
    ensureThumb(slug);
    const t = document.createElement("canvas");
    t.width = t.height = 68;
    const tc = t.getContext("2d");
    const rec = imgCache[slug];
    if (rec && rec.right) {
      tc.drawImage(rec.right, 1, 1, 66, 66);
    } else {
      tc.translate(34, 36); tc.scale(0.72, 0.72);
      drawProc(slug, tc, 0);
    }
    t.style.width = t.style.height = (size || 34) + "px";
    return t;
  }

  function rebuildPanel() {
    listEl.innerHTML = "";
    sprites.filter((s) => !s.isClone).forEach((s) => {
      const chip = el("button", {
        class: "sprite-chip" + (s.id === selectedId ? " selected" : ""),
        type: "button", "aria-pressed": s.id === selectedId ? "true" : "false",
        "aria-label": "Select sprite " + s.name,
        onClick: () => select(s.id),
      }, [thumb(s.char), el("span", { class: "nm", text: s.name })]);
      chip.title = "Select " + s.name;
      listEl.appendChild(chip);
    });
  }

  function refreshProps() {
    const s = selected();
    if (!s) { propsEl.textContent = ""; return; }
    propsEl.innerHTML = "";
    [["x", Math.round(s.x)], ["y", Math.round(s.y)], ["dir", Math.round(s.dir) + "°"], ["size", Math.round(s.size) + "%"]]
      .forEach(([k, v]) => propsEl.appendChild(el("span", { text: k + ": " + v })));
  }

  /* ------------------------------------------------------------ pen layer -- */
  // Persistent drawing surface between the backdrop and the sprites.
  const penCvs = document.createElement("canvas");
  penCvs.width = W; penCvs.height = H;
  const penCtx = penCvs.getContext("2d");
  function penClear() { penCtx.clearRect(0, 0, W, H); }
  function penLine(x1, y1, x2, y2, color, size) {
    penCtx.strokeStyle = color;
    penCtx.lineWidth = clamp(size, 1, 50);
    penCtx.lineCap = "round";
    penCtx.beginPath();
    penCtx.moveTo(HW + x1, HH - y1);
    penCtx.lineTo(HW + x2, HH - y2);
    penCtx.stroke();
  }
  function stampSprite(s) { drawSprite(s, penCtx); }

  /* -------------------------------------------- mouse + stage sprite drag -- */
  const mouse = { x: 0, y: 0, down: false };
  function toStage(e) {
    const r = cvs.getBoundingClientRect();
    return {
      x: clamp(((e.clientX - r.left) / r.width) * W - HW, -HW, HW),
      y: clamp(HH - ((e.clientY - r.top) / r.height) * H, -HH, HH),
    };
  }

  let grab = null; // {s, dx, dy, moved}
  cvs.style.touchAction = "none";
  cvs.addEventListener("pointermove", (e) => {
    const p = toStage(e);
    mouse.x = p.x; mouse.y = p.y;
    if (grab && !grab.s.isClone) {
      const nx = clamp(p.x - grab.dx, -HW, HW);
      const ny = clamp(p.y - grab.dy, -HH, HH);
      if (!grab.moved && Math.hypot(nx - grab.s.x, ny - grab.s.y) > 3) grab.moved = true;
      if (grab.moved) { grab.s.x = nx; grab.s.y = ny; }
    }
  });
  cvs.addEventListener("pointerdown", (e) => {
    mouse.down = true;
    const p = toStage(e);
    for (let i = sprites.length - 1; i >= 0; i--) {
      const s = sprites[i];
      if (s.visible && hitTest(s, p.x, p.y)) {
        grab = { s, dx: p.x - s.x, dy: p.y - s.y, moved: false };
        try { cvs.setPointerCapture(e.pointerId); } catch (err) {}
        break;
      }
    }
  });
  window.addEventListener("pointerup", () => {
    mouse.down = false;
    if (grab) {
      if (!grab.moved) {
        CtrlCreate.emit("stage:spriteclick", { id: grab.s.isClone ? grab.s.cloneOf : grab.s.id });
      } else if (!grab.s.isClone) {
        select(grab.s.id);                       // moving a sprite focuses it
        if (CtrlCreate.projectIO) CtrlCreate.projectIO.saveCurrent();
      }
      grab = null;
    }
  });

  function halfExtent(s) { return 38 * (s.size / 100); }
  function hitTest(s, px, py) {
    const h = halfExtent(s);
    return px > s.x - h && px < s.x + h && py > s.y - h && py < s.y + h;
  }

  /* ----------------------------------------------------------- drawing --- */
  /* --------------------------------------------------------- backdrops --- */
  const BACKDROP_NAMES = ["meadow", "ocean", "space", "castle", "city", "jungle", "arctic", "desert",
    "stadium", "gym_court", "race_track", "moon_base", "mars_surface", "starfield",
    "pirate_cove", "wild_west", "throne_room", "downtown_street", "neighborhood", "city_park",
    "winter_village", "haunted_yard", "party_room", "volcano_valley", "jungle_swamp", "ice_cave"];
  const BUILTIN_BACKDROPS = BACKDROP_NAMES.slice();
  const backdrops = {};
  const customBackdropData = {};
  let currentBackdrop = "meadow";
  function loadBackdrop(name) {
    if (backdrops[name] !== undefined) return;
    backdrops[name] = null;
    const im = new Image();
    im.onload = () => { backdrops[name] = im; };
    im.onerror = () => { backdrops[name] = false; };
    im.src = "assets/backdrops/" + name + ".png";
  }
  BACKDROP_NAMES.forEach(loadBackdrop);
  function addCustomBackdrop(name, dataUrl) {
    if (!dataUrl || typeof dataUrl !== "string" || dataUrl.indexOf("data:image/") !== 0) return null;
    let safe = String(name || "My backdrop").replace(/[^a-z0-9 _-]/gi, "").trim().slice(0, 28) || "My backdrop";
    if (BUILTIN_BACKDROPS.indexOf(safe) >= 0) safe = "My " + safe;
    if (BACKDROP_NAMES.indexOf(safe) < 0) BACKDROP_NAMES.push(safe);
    customBackdropData[safe] = dataUrl;
    const im = new Image();
    im.onload = () => { backdrops[safe] = im; };
    im.src = dataUrl; backdrops[safe] = im;
    setBackdrop(safe); return safe;
  }
  function restoreCustomBackdrops(map) {
    BACKDROP_NAMES.slice().forEach((n) => {
      if (BUILTIN_BACKDROPS.indexOf(n) < 0) {
        const i = BACKDROP_NAMES.indexOf(n); if (i >= 0) BACKDROP_NAMES.splice(i, 1);
        delete backdrops[n];
      }
    });
    for (const k in customBackdropData) delete customBackdropData[k];
    if (map && typeof map === "object") for (const name in map) addCustomBackdrop(name, map[name]);
  }
  function setBackdrop(name) {
    if (BACKDROP_NAMES.indexOf(name) < 0) return;
    currentBackdrop = name;
    loadBackdrop(name);
    CtrlCreate.track("backdrop:switched", { name });
  }
  function cycleBackdrop() {
    const i = BACKDROP_NAMES.indexOf(currentBackdrop);
    setBackdrop(BACKDROP_NAMES[(i + 1) % BACKDROP_NAMES.length]);
    return currentBackdrop;
  }

  function drawBackdrop() {
    const bd = backdrops[currentBackdrop];
    if (bd && bd.complete && bd.naturalWidth) { ctx.drawImage(bd, 0, 0, W, H); return; }
    // layered papercut hills (fallback while the PNG loads)
    ctx.fillStyle = "#cfe7f2"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#f7e9b8"; circle(ctx, 400, 60, 34); ctx.fill();            // sun
    ctx.fillStyle = "#efe0a0"; circle(ctx, 400, 60, 26); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.85)";                                    // clouds
    [[90, 70, 26], [130, 62, 20], [60, 80, 18]].forEach(([x, y, r]) => { circle(ctx, x, y, r); ctx.fill(); });
    ctx.fillStyle = "#bfe0c0";                                                  // far hill
    ctx.beginPath(); ctx.moveTo(0, 290); ctx.quadraticCurveTo(140, 210, 300, 280); ctx.quadraticCurveTo(400, 320, 480, 270); ctx.lineTo(480, 360); ctx.lineTo(0, 360); ctx.fill();
    ctx.fillStyle = "#9fd0a0";                                                  // near hill
    ctx.beginPath(); ctx.moveTo(0, 330); ctx.quadraticCurveTo(180, 280, 480, 330); ctx.lineTo(480, 360); ctx.lineTo(0, 360); ctx.fill();
    ctx.fillStyle = "rgba(58,50,38,.06)"; ctx.fillRect(0, 352, W, 8);           // ground shadow strip
  }

  function drawSprite(s, g) {
    g = g || ctx;
    if (!s.visible) return;
    const cx = HW + s.x, cy = HH - s.y;
    const scale = s.size / 100;
    const facingLeft = s.rotationStyle === "left-right" && ((s.dir % 360) + 360) % 360 > 180; // dir in (180,360) => leftward
    g.save();
    g.translate(cx, cy);
    if (s.rotationStyle === "all") g.rotate(((s.dir - 90) * Math.PI) / 180);
    else if (facingLeft) g.scale(-1, 1);
    g.scale(scale, scale);
    g.globalAlpha = clamp(1 - s.effects.ghost / 100, 0, 1);
    const fx = [];
    if (s.effects.color) fx.push("hue-rotate(" + (s.effects.color * 3.6) + "deg)");
    if (s.effects.brightness) fx.push("brightness(" + (1 + s.effects.brightness / 100) + ")");
    if (fx.length) g.filter = fx.join(" ");

    // PNG asset (generated art) beats procedural drawing when loaded.
    // costume 1 uses the walk-step frame when one exists (hero characters).
    const rec = imgCache[s.char];
    const side = facingLeft ? "left" : "right";
    const stepImg = rec && rec[side + "_step"];
    const useStep = (s.costume % 2 === 1) && stepImg;
    const img = rec && (useStep ? stepImg : rec[side]);
    if (img) {
      if (facingLeft) g.scale(-1, 1); // asset is pre-mirrored; undo canvas flip
      g.drawImage(img, -48, -48, 96, 96);
    } else {
      drawProc(s.char, g, s.costume % 2);
    }
    g.restore();
  }

  function drawBubbles() {
    overlays.querySelectorAll(".say-bubble").forEach((n) => n.remove());
    const r = cvs.getBoundingClientRect();
    const sx = r.width / W, sy = r.height / H;
    sprites.forEach((s) => {
      if (!s.say || !s.say.text) return;
      if (s.say.until && performance.now() > s.say.until) { s.say = null; return; }
      const b = el("div", { class: "say-bubble" + (s.say.type === "think" ? " think" : ""), text: String(s.say.text) });
      b.style.left = ((HW + s.x + 20 * (s.size / 100)) * sx) + "px";
      b.style.top = ((HH - s.y - 34 * (s.size / 100)) * sy) + "px";
      overlays.appendChild(b);
    });
  }

  /* --------------------------------------------------- variable monitors -- */
  const monitors = {}; // name -> {el, visible}
  function setMonitor(name, value, visible) {
    let m = monitors[name];
    if (!m) {
      const node = el("div", { class: "var-monitor" }, [
        el("span", { text: name }), el("b", { text: "0" }),
      ]);
      m = monitors[name] = { el: node, visible: false };
      overlays.appendChild(node);
    }
    if (visible !== undefined) m.visible = visible;
    m.el.style.display = m.visible ? "flex" : "none";
    m.el.querySelector("b").textContent = String(value);
    // stack monitors vertically
    let top = 8;
    Object.keys(monitors).forEach((k) => {
      const mm = monitors[k];
      if (mm.visible) { mm.el.style.top = top + "px"; top += 30; }
    });
  }

  /* ------------------------------------------------------------ ask box -- */
  let askResolve = null;
  function ask(question) {
    return new Promise((resolve) => {
      if (askResolve) askResolve(""); // cancel previous
      askResolve = resolve;
      overlays.querySelectorAll(".ask-box").forEach((n) => n.remove());
      const inp = el("input", { type: "text", placeholder: "Type your answer and press Enter…" });
      const box = el("div", { class: "ask-box" }, [el("div", { text: question }), inp]);
      inp.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const v = inp.value;
          box.remove(); askResolve = null;
          CtrlCreate.track("question:answered", {});
          resolve(v);
        }
      });
      overlays.appendChild(box);
      setTimeout(() => inp.focus(), 30);
    });
  }
  function cancelAsk() {
    overlays.querySelectorAll(".ask-box").forEach((n) => n.remove());
    if (askResolve) { const r = askResolve; askResolve = null; r(""); }
  }

  /* ----------------------------------------------------------- rAF loop -- */
  function tick() {
    drawBackdrop();
    ctx.drawImage(penCvs, 0, 0);          // pen marks sit on top of the backdrop
    sprites.forEach((s) => drawSprite(s, ctx));
    drawBubbles();
    refreshProps();
    CtrlCreate.nextTick(tick);
  }

  /* ----------------------------------------------------- character picker -- */
  let pickerEl = null;
  function buildPickerGrid() {
    const grid = el("div", { class: "picker-grid" });
    ROSTER.forEach((r) => {
      const cell = el("button", { class: "picker-cell", type: "button", title: r.name, "aria-label": "Add " + r.name, onClick: () => { addSprite(r.slug); closePicker(); } },
        [thumb(r.slug, 54), el("div", { class: "picker-name", text: r.name })]);
      grid.appendChild(cell);
    });
    return grid;
  }
  function openPicker() {
    ROSTER.forEach((r) => ensureThumb(r.slug));
    if (!pickerEl) {
      pickerEl = el("div", { class: "sprite-picker", onPointerdown: (e) => { if (e.target === pickerEl) closePicker(); } }, [
        el("div", { class: "picker-card paper-card" }, [
          el("div", { class: "picker-head" }, [
            el("h2", { text: "Pick a character" }),
            el("button", { class: "picker-x", text: "✕", onClick: closePicker }),
          ]),
          buildPickerGrid(),
        ]),
      ]);
      document.body.appendChild(pickerEl);
    } else {
      // refresh thumbnails (art may have finished loading) then show
      const card = pickerEl.querySelector(".picker-card");
      const old = card.querySelector(".picker-grid");
      if (old) card.replaceChild(buildPickerGrid(), old);
      pickerEl.style.display = "flex";
    }
  }
  function closePicker() { if (pickerEl) pickerEl.style.display = "none"; }
  function refreshPicker() {
    if (!pickerEl || pickerEl.style.display === "none") return;
    const card = pickerEl.querySelector(".picker-card");
    const old = card.querySelector(".picker-grid");
    if (old) card.replaceChild(buildPickerGrid(), old);
  }

  /* --------------------------------------------------- backdrop control -- */
  function buildBackdropButton() {
    const label = el("span", { class: "backdrop-name", text: currentBackdrop });
    const btn = el("button", { class: "backdrop-btn", title: "Change backdrop" },
      [el("span", { text: "🎬" }), label]);
    btn.addEventListener("click", cycleBackdrop);
    // keep the label in sync whether switched by click or by a running script
    CtrlCreate.on("backdrop:switched", (e) => { label.textContent = e.detail.name; });
    frame.appendChild(btn);
  }

  // picker + backdrop styles
  document.head.appendChild(el("style", { text: `
    .sprite-picker{position:fixed;inset:0;z-index:400;display:flex;align-items:center;
      justify-content:center;background:rgba(58,50,38,.4)}
    .picker-card{background:#fbf6ea;padding:16px 18px 20px;border-radius:16px;max-width:660px;
      width:88%;max-height:82vh;overflow:auto;box-shadow:5px 7px 0 rgba(58,50,38,.28);
      border:2px solid #cbbfa5}
    .picker-head{display:flex;align-items:center;justify-content:space-between;
      border-bottom:2px dashed #cbbfa5;padding-bottom:8px;margin-bottom:12px}
    .picker-head h2{margin:0;font:800 18px -apple-system,"SF Pro Rounded",sans-serif;color:#3a3226}
    .picker-x{border:none;background:#e5533c;color:#fff;width:28px;height:28px;border-radius:8px;
      cursor:pointer;font:700 14px sans-serif;box-shadow:2px 2px 0 rgba(58,50,38,.25)}
    .picker-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
    @media(max-width:560px){.picker-grid{grid-template-columns:repeat(4,1fr)}}
    .picker-cell{cursor:pointer;text-align:center;padding:8px 4px;border-radius:12px;
      border:1.5px dashed transparent;transition:transform .1s}
    .picker-cell:hover{background:#fff;border-color:#cbbfa5;transform:translateY(-2px) rotate(-1deg);
      box-shadow:2px 3px 0 rgba(58,50,38,.16)}
    .picker-cell canvas{width:54px;height:54px}
    .picker-name{font:700 11px -apple-system,"SF Pro Rounded",sans-serif;color:#3a3226;margin-top:3px}
    .backdrop-btn{position:absolute;left:8px;bottom:8px;display:flex;align-items:center;gap:5px;
      background:#fffdf7;border:1.5px solid #cbbfa5;border-radius:10px;padding:4px 9px;cursor:pointer;
      font:700 11px -apple-system,"SF Pro Rounded",sans-serif;color:#3a3226;
      box-shadow:2px 2px 0 rgba(58,50,38,.18);z-index:5}
    .backdrop-btn:hover{transform:translateY(-1px)}
    .backdrop-name{text-transform:capitalize;opacity:.75}
  ` }));

  /* ------------------------------------------------------------- expose -- */
  CtrlCreate.stage = {
    W, H, HW, HH,
    sprites, get, selected, addSprite, removeSprite, select,
    mouse, hitTest, halfExtent,
    setMonitor, ask, cancelAsk,
    chars: CHARS, charKeys: CHAR_KEYS, roster: ROSTER, thumb,
    setBackdrop, cycleBackdrop, openPicker, addCustomBackdrop,
    serializeCustomBackdrops: () => Object.assign({}, customBackdropData),
    restoreCustomBackdrops,
    backdropNames: BACKDROP_NAMES,
    getBackdrop: () => currentBackdrop,
    serializeSprites, restoreSprites,
    cloneSprite, removeClone, removeAllClones,
    pen: { clear: penClear, line: penLine },
    stampSprite,
  };

  document.getElementById("btn-add-sprite").addEventListener("click", openPicker);

  // boot: one default sprite, the backdrop switcher, then start drawing
  addSprite("scrappy", { silent: true });
  buildBackdropButton();
  CtrlCreate.nextTick(tick);
})();
