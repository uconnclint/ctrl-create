// engine-bridge.js — ES module bridge between the classic-script game
// (window.CtrlCreate) and clint-engine. MIGRATION_PLAN.md Phase 7 partial
// adoption: only ctx.settings is consumed (adoption below, plus the new
// #btn-mute master mute). ctx.save/progress are intentionally unused:
// Ctrl+Create's projects/progress/achievements keep living in their own
// existing ctrlcreate.* localStorage keys and js/game/progress.js — that
// stays the record, per CONTRACTS.md's ctx.progress-is-opt-in rule (never
// enabled here, so the save blob's `progress` key is never touched).
//
// Loaded via ONE <script type="module">, LAST in index.html (21st tag).
// Boot-order note: module scripts always run after every classic script that
// precedes them in source order (they're deferred, like `defer`), so by the
// time this file runs, all 20 classic scripts have already finished booting
// the game. Nothing in those classic scripts reads `window.CE`/ctx at load
// time (grep confirms), so unlike critter-codex's Phaser boot (which had to
// defer window.__ccStart() until CE/CEP existed) no gating pattern is needed
// here — lazy access is enough.
import { createGameContext } from '../engine/core/context.js';

// Adopt the two settings that map cleanly onto engine concepts from the
// existing "ctrlcreate.settings.v2" blob (js/enhancements.js). `guided` and
// `slow` have no engine equivalent and stay exactly where they are — that
// blob remains their one and only source of truth, read/written by
// enhancements.js exactly as before. This reader only runs once, the first
// time ctx.settings is created (see core/settings.js) — it seeds the new
// `ctrl-create.settings.v1` blob and does not touch or delete the legacy key.
function readLegacyClassroomSettings(storage) {
  let raw;
  try { raw = storage.getItem('ctrlcreate.settings.v2'); } catch (e) { return null; }
  if (!raw) return null;
  try {
    const v2 = JSON.parse(raw);
    if (!v2 || typeof v2 !== 'object') return null;
    const out = {};
    if ('quiet' in v2) out.quietCelebrations = !!v2.quiet;
    if ('lowMotion' in v2) out.reducedMotion = !!v2.lowMotion;
    return out;
  } catch (e) {
    return null; // malformed legacy blob contributes nothing — never fatal.
  }
}

const ctx = createGameContext({
  gameId: 'ctrl-create',
  legacySettingsReaders: [readLegacyClassroomSettings],
  // No legacySaveKeys: Ctrl+Create's real save data (projects, achievements,
  // quests, badges) stays entirely in its existing ctrlcreate.* keys via
  // js/projectIO.js + js/game/progress.js. ctx.save is created (every
  // context gets one) but nothing reads or writes it.
});

window.CE = ctx;

// ---- NEW master mute (MIGRATION_PLAN.md Phase 7 step 3) --------------------
// Single source of truth: ctx.settings.get('muted'). #btn-mute only ever
// calls ctx.settings.set('muted', ...); everything downstream — the actual
// audio gate in js/engine/sound.js and this button's own icon — reacts to
// that one change via onChange, so the two can never drift out of sync.
//
// Deliberately separate from "Quiet classroom mode" (CtrlCreate.settings.quiet
// in the legacy blob, still read directly by js/main.js's celebrate() exactly
// as before): that toggle keeps gating ONLY celebration cues/toasts. Two
// independent axes, as specified — muting here does not touch settings.quiet,
// and quiet mode does not touch sound.js's master gain.
const btnMute = document.getElementById('btn-mute');

function applyMuted(muted) {
  if (window.CtrlCreate && CtrlCreate.sound && typeof CtrlCreate.sound.setMuted === 'function') {
    CtrlCreate.sound.setMuted(muted);
  }
  if (btnMute) {
    btnMute.textContent = muted ? '\u{1F507}' : '\u{1F50A}'; // muted speaker : loud speaker
    btnMute.setAttribute('aria-pressed', String(!muted));
  }
}

applyMuted(ctx.settings.get('muted')); // sync immediately — onChange only fires on future changes.
ctx.settings.onChange((key, value) => { if (key === 'muted') applyMuted(value); });

if (btnMute) {
  btnMute.addEventListener('click', () => {
    ctx.settings.set('muted', !ctx.settings.get('muted'));
  });
}
