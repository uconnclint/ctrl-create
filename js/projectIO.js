/* ============================================================================
 * CTRL+CREATE — projectIO.js
 * Full-project persistence: serialize/restore the whole world (scripts for
 * every sprite, the sprites themselves, custom variables/messages, backdrop),
 * plus a multi-project store with thumbnails and file export/import.
 *
 * The projects dialog (js/editor/projects.js) is pure UI over this API:
 *   CtrlCreate.projectIO.list()            -> [{id,name,updated,thumb}]
 *   CtrlCreate.projectIO.currentId()
 *   CtrlCreate.projectIO.saveCurrent()     -> writes blob + index + thumbnail
 *   CtrlCreate.projectIO.create(name)      -> saves current, opens a fresh world
 *   CtrlCreate.projectIO.open(id)
 *   CtrlCreate.projectIO.rename(id, name)
 *   CtrlCreate.projectIO.duplicate(id)
 *   CtrlCreate.projectIO.remove(id)
 *   CtrlCreate.projectIO.exportProject(id?) -> downloads a .ctrlcreate.json file
 *   CtrlCreate.projectIO.importFile(file)   -> Promise; adds + opens it
 * Emits "projects:changed" after any store mutation.
 * ==========================================================================*/
(function () {
  "use strict";
  const S = window.CtrlCreate;

  const INDEX_KEY = "ctrlcreate.projects.index.v1";
  const BLOB_KEY = (id) => "ctrlcreate.project.blob." + id;
  const CURRENT_KEY = "ctrlcreate.projects.current";
  const LEGACY_KEY = "ctrlcreate.project.v1";
  const HISTORY_KEY = (id) => "ctrlcreate.project.history." + id;

  /* ------------------------------------------------------------ storage --- */
  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
  function drop(key) { try { localStorage.removeItem(key); } catch (e) {} }

  let index = readJSON(INDEX_KEY, []);
  if (!Array.isArray(index)) index = [];
  let currentId = null;
  try { currentId = localStorage.getItem(CURRENT_KEY) || null; } catch (e) {}

  function saveIndex() { writeJSON(INDEX_KEY, index); S.emit("projects:changed", {}); }
  function entry(id) { return index.find((p) => p.id === id) || null; }
  function newId() { return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------------------------------------------------------- serialize --- */
  function serialize(name) {
    const scripts = {};
    const store = S.workspace._sprites;
    for (const sid in store) {
      scripts[sid] = JSON.parse(JSON.stringify(store[sid]));
    }
    return {
      v: 2,
      name: name || (entry(currentId) ? entry(currentId).name : "My Project"),
      scripts: scripts,
      sprites: S.stage.serializeSprites ? S.stage.serializeSprites() : [],
      registry: JSON.parse(JSON.stringify(S.registry || { variables: [], messages: [] })),
      backdrop: S.stage.getBackdrop ? S.stage.getBackdrop() : "meadow",
      customBackdrops: S.stage.serializeCustomBackdrops ? S.stage.serializeCustomBackdrops() : {},
      savedAt: new Date().toISOString(),
    };
  }

  // Remap every block id to a fresh uid so the session's id counter can never
  // collide with ids minted in an earlier session.
  function remapScripts(scripts) {
    const out = {};
    for (const sid in scripts) {
      const src = scripts[sid] || { blocks: {}, tops: [] };
      const map = {};
      for (const oldId in src.blocks) map[oldId] = S.uid("l");
      const nb = {};
      for (const oldId in src.blocks) {
        const b = JSON.parse(JSON.stringify(src.blocks[oldId]));
        b.id = map[oldId];
        b.next = map[b.next] || null;
        b.substack = map[b.substack] || null;
        b.substack2 = map[b.substack2] || null;
        b.parent = null;
        for (const n in b.inputs) {
          if (b.inputs[n] && b.inputs[n].kind === "block" && b.inputs[n].block) {
            b.inputs[n].block = map[b.inputs[n].block] || null;
          }
        }
        nb[b.id] = b;
      }
      out[sid] = { blocks: nb, tops: (src.tops || []).map((t) => map[t]).filter(Boolean) };
    }
    return out;
  }

  function loadSnapshot(snap) {
    if (!snap || typeof snap !== "object") return false;
    try {
      if (S.engine && S.engine.stopAll) S.engine.stopAll(false);

      // registry first (dropdowns resolve from it during render)
      if (S.registry && snap.registry) {
        S.registry.variables = Array.isArray(snap.registry.variables) && snap.registry.variables.length
          ? snap.registry.variables.slice() : ["score", "lives"];
        S.registry.messages = Array.isArray(snap.registry.messages) && snap.registry.messages.length
          ? snap.registry.messages.slice() : ["message1", "start", "win", "lose"];
      }

      // scripts (remapped), then sprites, then backdrop
      const store = S.workspace._sprites;
      for (const k in store) delete store[k];
      const remapped = remapScripts(snap.scripts || {});
      for (const k in remapped) store[k] = remapped[k];

      if (S.stage.restoreSprites) S.stage.restoreSprites(snap.sprites || []);
      if (S.stage.restoreCustomBackdrops) S.stage.restoreCustomBackdrops(snap.customBackdrops || {});
      if (S.stage.setBackdrop && snap.backdrop) S.stage.setBackdrop(snap.backdrop);

      S.emit("registry:changed", {});
      S.workspace.render();
      if (S.palette) S.palette.rebuild();
      return true;
    } catch (e) {
      console.warn("[CtrlCreate] project load failed:", e);
      return false;
    }
  }

  /* ---------------------------------------------------------- thumbnails -- */
  function thumbnail() {
    try {
      const cvs = document.getElementById("stage");
      const t = document.createElement("canvas");
      t.width = 160; t.height = 120;
      t.getContext("2d").drawImage(cvs, 0, 0, 160, 120);
      return t.toDataURL("image/jpeg", 0.55);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------- store ---- */
  function saveCurrent() {
    if (!currentId) return adopt("My First Project");
    const snap = serialize();
    const en = entry(currentId);
    if (en) { snap.name = en.name; en.updated = snap.savedAt; en.thumb = thumbnail() || en.thumb; }
    const previous = readJSON(BLOB_KEY(currentId), null);
    if (previous) {
      const hist = readJSON(HISTORY_KEY(currentId), []);
      const last = hist[0];
      if (!last || Math.abs(new Date(previous.savedAt || 0).getTime() - new Date(last.savedAt || 0).getTime()) > 15000) {
        hist.unshift(previous); writeJSON(HISTORY_KEY(currentId), hist.slice(0, 5));
      }
    }
    writeJSON(BLOB_KEY(currentId), snap);
    saveIndex();
    return currentId;
  }

  // Turn the live (possibly legacy-restored) world into a tracked project.
  function adopt(name) {
    const id = newId();
    currentId = id;
    try { localStorage.setItem(CURRENT_KEY, id); } catch (e) {}
    index.unshift({ id: id, name: name, updated: new Date().toISOString(), thumb: thumbnail() });
    writeJSON(BLOB_KEY(id), serialize(name));
    saveIndex();
    return id;
  }

  function freshWorld() {
    if (S.registry) {
      S.registry.variables = ["score", "lives"];
      S.registry.messages = ["message1", "start", "win", "lose"];
    }
    const store = S.workspace._sprites;
    for (const k in store) delete store[k];
    if (S.stage.restoreSprites) {
      S.stage.restoreSprites([{ id: "sprite1", name: "Scrappy", char: "scrappy", x: 0, y: 0, dir: 90, size: 100, visible: true, rotationStyle: "left-right", costume: 0 }]);
    }
    if (S.stage.setBackdrop) S.stage.setBackdrop("meadow");
    if (S.stage.restoreCustomBackdrops) S.stage.restoreCustomBackdrops({});
    if (S.stage.pen && S.stage.pen.clear) S.stage.pen.clear();
    S.emit("registry:changed", {});
    S.workspace.render();
    if (S.palette) S.palette.rebuild();
  }

  function create(name) {
    if (currentId) saveCurrent();
    freshWorld();
    return adopt(name || "Untitled " + (index.length + 1));
  }

  function open(id) {
    const snap = readJSON(BLOB_KEY(id), null);
    if (!snap) return false;
    if (currentId && currentId !== id) saveCurrent();
    if (!loadSnapshot(snap)) return false;
    currentId = id;
    try { localStorage.setItem(CURRENT_KEY, id); } catch (e) {}
    S.emit("projects:changed", {});
    return true;
  }

  function rename(id, name) {
    const en = entry(id);
    if (!en || !name) return;
    en.name = String(name).slice(0, 40);
    const blob = readJSON(BLOB_KEY(id), null);
    if (blob) { blob.name = en.name; writeJSON(BLOB_KEY(id), blob); }
    saveIndex();
  }

  function duplicate(id) {
    const blob = readJSON(BLOB_KEY(id), null);
    const en = entry(id);
    if (!blob || !en) return null;
    const nid = newId();
    blob.name = en.name + " copy";
    writeJSON(BLOB_KEY(nid), blob);
    index.unshift({ id: nid, name: blob.name, updated: new Date().toISOString(), thumb: en.thumb });
    saveIndex();
    return nid;
  }

  function remove(id) {
    index = index.filter((p) => p.id !== id);
    drop(BLOB_KEY(id));
    drop(HISTORY_KEY(id));
    if (currentId === id) {
      currentId = null;
      drop(CURRENT_KEY);
      if (index.length) open(index[0].id);
      else { freshWorld(); adopt("My Project"); }
    }
    saveIndex();
  }

  /* ------------------------------------------------------- file transfer -- */
  function exportProject(id) {
    const pid = id || currentId;
    if (pid === currentId) saveCurrent();
    const blob = readJSON(BLOB_KEY(pid), null);
    if (!blob) return;
    const en = entry(pid);
    const data = new Blob([JSON.stringify(blob, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(data);
    a.download = ((en && en.name) || "project").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") + ".ctrlcreate.json";
    document.body.appendChild(a);
    a.click();
    S.track("project:exported", { blockCount: Object.keys(S.workspace.blocks || {}).length });
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  function importFile(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = () => reject(new Error("read failed"));
      r.onload = () => {
        try {
          const snap = JSON.parse(r.result);
          if (!snap || snap.v !== 2 || typeof snap.scripts !== "object") throw new Error("not a ctrlcreate project");
          const id = newId();
          const name = (snap.name || file.name.replace(/\.ctrlcreate\.json$/i, "") || "Imported").slice(0, 40);
          snap.name = name;
          writeJSON(BLOB_KEY(id), snap);
          index.unshift({ id: id, name: name, updated: new Date().toISOString(), thumb: null });
          saveIndex();
          open(id);
          resolve(id);
        } catch (e) { reject(e); }
      };
      r.readAsText(file);
    });
  }

  /* ------------------------------------------------------------ autosave -- */
  let autosaveTimer = null;
  function scheduleAutosave() {
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => { autosaveTimer = null; saveCurrent(); }, 1600);
  }
  ["project:saved", "sprite:added", "sprite:selected", "sprite:edited", "backdrop:switched", "registry:changed"]
    .forEach((ev) => S.on(ev, scheduleAutosave));

  /* ---------------------------------------------------------------- boot --- */
  // Restore the last-open project. If none exists but the legacy single-slot
  // save does, the already-restored legacy world gets adopted as project #1.
  function boot() {
    if (currentId && readJSON(BLOB_KEY(currentId), null)) {
      loadSnapshot(readJSON(BLOB_KEY(currentId), null));
    } else if (index.length) {
      open(index[0].id);
    } else {
      const hadLegacy = !!readJSON(LEGACY_KEY, null);
      adopt(hadLegacy ? "My First Project" : "My Project");
    }
  }

  S.projectIO = {
    list: () => index.map((p) => ({ id: p.id, name: p.name, updated: p.updated, thumb: p.thumb })),
    currentId: () => currentId,
    serialize, loadSnapshot,
    saveCurrent, create, open, rename, duplicate, remove,
    exportProject, importFile,
    history: (id) => readJSON(HISTORY_KEY(id || currentId), []),
    recoverLatest: function () {
      const hist = readJSON(HISTORY_KEY(currentId), []);
      if (!hist.length) return false;
      const current = readJSON(BLOB_KEY(currentId), null);
      if (current) hist.unshift(current);
      const snap = hist.splice(1, 1)[0] || hist.shift();
      if (!snap || !loadSnapshot(snap)) return false;
      writeJSON(BLOB_KEY(currentId), snap); writeJSON(HISTORY_KEY(currentId), hist.slice(0, 5)); saveIndex(); return true;
    },
    _boot: boot,
  };

  // stage/workspace exist (load order), but let the whole page settle first
  setTimeout(boot, 0);
})();
