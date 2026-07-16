import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const text = (p) => readFile(join(root, p), "utf8");

test("block catalog loads with unique opcodes and all categories", async () => {
  class CE extends Event { constructor(type, init = {}) { super(type); this.detail = init.detail; } }
  const sandbox = { document: { createElement() { return {}; } }, EventTarget, CustomEvent: CE, Event, setTimeout, clearTimeout, console, Math, Date };
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  vm.runInContext(await text("js/core.js"), context);
  vm.runInContext(await text("js/blockDefs.js"), context);
  const S = context.window.Scratchy;
  assert.ok(S.defList.length >= 90, "expected the full classroom block catalog");
  assert.equal(new Set(S.defList.map((d) => d.opcode)).size, S.defList.length, "opcodes must be unique");
  assert.equal(S.categories.length, 10);
  for (const category of S.categories) assert.ok(S.defList.some((d) => d.category === category.id), category.id + " must have blocks");
});

test("HTML local assets and scripts exist", async () => {
  const html = await text("index.html");
  const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map((m) => m[1].split("?")[0]).filter((p) => !/^(?:https?:|data:)/.test(p));
  for (const ref of refs) await stat(join(root, ref));
});

test("quest regressions require connected execution and actual key input", async () => {
  const quests = await text("js/game/quests.js");
  assert.match(quests, /hasConnectedStack\(\["event_flag", "motion_movesteps"\]\)/);
  assert.match(quests, /"run:key"/);
  assert.match(quests, /d\.opcode === "data_changevar"/);
});

test("project format preserves recovery history and custom backdrops", async () => {
  const io = await text("js/projectIO.js");
  assert.match(io, /HISTORY_KEY/);
  assert.match(io, /customBackdrops/);
  assert.match(io, /recoverLatest/);
});

test("offline manifest points to an existing icon", async () => {
  const manifest = JSON.parse(await text("manifest.webmanifest"));
  assert.equal(manifest.display, "standalone");
  for (const icon of manifest.icons) await stat(join(root, icon.src));
});
