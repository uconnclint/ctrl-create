/* ============================================================================
 * CTRL+CREATE — main.js
 * Boot glue: run buttons, initial render, session start.
 * ==========================================================================*/
(function () {
  "use strict";

  const flagBtn = document.getElementById("btn-flag");
  const stopBtn = document.getElementById("btn-stop");

  flagBtn.addEventListener("click", () => {
    if (CtrlCreate.sound) CtrlCreate.sound.play("Click");
    CtrlCreate.engine.greenFlag();
    flagBtn.classList.add("running");
    setTimeout(() => flagBtn.classList.remove("running"), 300);
  });

  stopBtn.addEventListener("click", () => {
    CtrlCreate.engine.stopAll();
  });

  // celebratory sounds for the game layer
  const celebrate = (name) => { if (!(CtrlCreate.settings && CtrlCreate.settings.quiet) && CtrlCreate.sound) CtrlCreate.sound.play(name); };
  CtrlCreate.on("game:achievement", () => celebrate("Achievement"));
  CtrlCreate.on("game:badge", () => celebrate("Tada"));
  CtrlCreate.on("game:levelup", () => celebrate("LevelUp"));
  CtrlCreate.on("game:questdone", () => celebrate("Coin"));
  CtrlCreate.on("blocks:connected", () => CtrlCreate.sound && CtrlCreate.sound.play("Snip"));

  if (CtrlCreate.sound) CtrlCreate.sound.init();

  CtrlCreate.workspace.render();
  CtrlCreate.booted = true;
  CtrlCreate.track("session:start", {});
  console.log("✂ Ctrl+Create " + CtrlCreate.version + " booted — " + CtrlCreate.defList.length + " blocks loaded");
})();
