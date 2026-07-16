# ✂ Ctrl+Create — Papercut Code Studio

A complete Scratch-style block-coding game in a 2D papercut / construction-paper art style.
Pure HTML/CSS/JS — no build step, no dependencies. Open `index.html` from any local
web server and play.

```bash
cd scratchy
python3 -m http.server 8734
# → http://localhost:8734
```

Run the dependency-free regression checks with:

```bash
node --test tests/smoke.mjs
```

## What's inside

### 🧩 The block editor
- **10 categories, 97 blocks**: Motion, Looks, Sound, Events, Control, Sensing,
  Operators, Variables, **Pen** (draw/stamp), and **Juice** (confetti, screen
  shake, paper-pop, sparkle trails — effects Scratch doesn't have).
- Full drag & drop with Scratch-style puzzle notches: snap, nest inside
  `repeat` / `forever` / `if` / `if-else` mouths, plug reporters/booleans into
  slots, drag to the trash to delete.
- **Undo/redo** (Ctrl+Z / buttons), **duplicate** (right-click or Alt-drag).
- **Make your own variables & broadcast messages** (➕ entries in dropdowns);
  sensing/motion dropdowns list your actual sprites.
- **Clones**: `create clone of…`, `when I start as a clone`, `delete this clone`
  — spawn coins, enemies, bullets, rain (cap 100).
- Drag sprites directly on the stage to place them.

### 📁 Projects & Play
- **My Projects shelf**: named saves with stage thumbnails, duplicate/delete,
  export/import as `.ctrlcreate.json` files. Ctrl+S quick-saves.
- **▶ Play mode**: fullscreen presentation view with big Go/Stop buttons.

### 🎭 The stage
- 480×360 stage, Scratch coordinates (0,0 center).
- **84 papercut characters & props + 26 backdrops** across themed packs — the
  originals (Scrappy, Robo, Drago…) plus Sports, Space, Old Times, Town & City,
  Holidays, and Prehistoric sets. Pick any from the character picker (＋) and
  cycle backdrops with the 🎬 button. 17 heroes have 2-frame walk animations.
  (Prompts for the themed art live in `ASSETS-THEME-PACKS.md`.)
- **Reverse-facing rule**: characters are authored facing right; when a sprite moves
  left the correct left-facing art is shown so it never appears to walk backwards
  (procedural fallback covers any missing PNG).
- Speech/thought bubbles, ask-and-wait prompt, variable monitors.
- **21 sounds in the sound blocks**: 5 synthesized classics (Meow, Pop, Boing,
  Chomp, Coin) plus 16 AI-generated effects in `assets/sounds/` (Bark, Roar,
  Giggle, Cheer, Jump, Ding, Laser, Boom, Rocket, Magic, Splash, Bubbles,
  Whistle, Horn, Drumroll, Buzzer) — all routed through one master volume so
  the volume blocks and stop-all affect everything. System sounds (level-up,
  achievements, clicks) remain synthesized.

### 🏆 The game layer
- **XP + 30 maker levels** with papercraft rank names (Paper Scrap → Papercut Legend).
- **49 achievements** in bronze/silver/gold tiers (gold ones are secret until earned).
- **18 badges** — per-category mastery seals plus meta seals.
- **12 sequential quests** that teach coding: First Steps → Grand Finale.
- Toasts, level-up confetti dialog, all progress persisted in `localStorage`.

### 🎨 The art pipeline — `ASSETS.md`
Feed `ASSETS.md` to ChatGPT/DALL-E section by section. It contains complete prompts for
**107 assets**: 24 characters × left/right pairs (+ walk frames for 8 heroes),
8 category icons, 14 UI icons, 13 badge frames, 8 backdrops — all with a shared
papercut STYLE PREFIX, exact filenames, sizes, and a QA checklist. Drop the finished
PNGs into `assets/` and the game picks them up.

## File map

```
index.html            DOM skeleton + script load order
css/theme.css         layout + papercut aesthetic (kraft paper, torn edges)
css/blocks.css        block shapes (hat/stack/C/reporter/boolean, paper tabs)
css/game.css          HUD, toasts, dialogs, achievement/badge/quest cards
js/core.js            namespace, event bus, block data model, frame scheduler
js/blockDefs.js       the block catalog (single source of truth)
js/editor/            block renderer, palette, drag-drop workspace
js/engine/            stage renderer, WebAudio synth, block interpreter
js/game/              XP/levels, achievements, quests, game UI
ASSETS.md             image-generation brief for all 107 art assets
```
