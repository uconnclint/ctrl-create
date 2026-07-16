/* ============================================================================
 * CTRL+CREATE — blockDefs.js
 * The block CATALOG. This is the single source of truth for every opcode.
 * Renderer, palette, and interpreter all key off `CtrlCreate.defs[opcode]`.
 *
 * def shape:
 *   opcode   "category_action"      (unique)
 *   category "motion" | ...         (drives color)
 *   shape    "hat"|"stack"|"cap"|"c"|"c2"|"reporter"|"boolean"
 *   text     "move %STEPS steps"    (%NAME = an input slot)
 *   args     { NAME: {type, default, options?, min?, max?} }
 *            type: number|text|angle|color|dropdown|boolean|reporter|note
 *   help     one-line description (tooltip)
 *
 * "c"  = single mouth (repeat / forever / if)
 * "c2" = two mouths (if/else)
 * ==========================================================================*/
(function () {
  "use strict";

  const CATEGORIES = [
    { id: "events",    label: "Events",    color: "#FFBF00", edge: "#CC9900" },
    { id: "motion",    label: "Motion",    color: "#4C97FF", edge: "#3373CC" },
    { id: "looks",     label: "Looks",     color: "#9966FF", edge: "#774DCB" },
    { id: "sound",     label: "Sound",     color: "#CF63CF", edge: "#A63FA6" },
    { id: "control",   label: "Control",   color: "#FFAB19", edge: "#CF8B17" },
    { id: "sensing",   label: "Sensing",   color: "#5CB1D6", edge: "#2E8EB8" },
    { id: "operators", label: "Operators", color: "#59C059", edge: "#389438" },
    { id: "variables", label: "Variables", color: "#FF8C1A", edge: "#DB6E00" },
    { id: "pen",       label: "Pen",       color: "#0FBD8C", edge: "#0B8E69" },
    { id: "juice",     label: "Juice",     color: "#FF6680", edge: "#E64D6E" },
  ];

  // Shorthand builders keep the list readable.
  const num = (d) => ({ type: "number", default: d });
  const txt = (d) => ({ type: "text", default: d });
  const dd = (opts, d) => ({ type: "dropdown", options: opts, default: d != null ? d : opts[0][1] });
  // dynamic dropdown: options is a TOKEN string the renderer resolves live
  // ("VARS" | "MESSAGES" | "TOUCH_TARGETS" | "POINT_TARGETS" | "BACKDROPS" | "CLONE_TARGETS")
  const ddt = (token, d) => ({ type: "dropdown", options: token, default: d });
  const bool = () => ({ type: "boolean" });
  const rep = () => ({ type: "reporter" });
  const angle = (d) => ({ type: "angle", default: d });
  const color = (d) => ({ type: "color", default: d });

  const DEFS = [
    /* ---------------------------------------------------------------- MOTION */
    { opcode: "motion_movesteps", category: "motion", shape: "stack",
      text: "move %STEPS steps", args: { STEPS: num(10) }, help: "Move the sprite forward." },
    { opcode: "motion_turnright", category: "motion", shape: "stack",
      text: "turn ↻ %DEG degrees", args: { DEG: num(15) }, help: "Rotate clockwise." },
    { opcode: "motion_turnleft", category: "motion", shape: "stack",
      text: "turn ↺ %DEG degrees", args: { DEG: num(15) }, help: "Rotate counter-clockwise." },
    { opcode: "motion_goto", category: "motion", shape: "stack",
      text: "go to x: %X y: %Y", args: { X: num(0), Y: num(0) }, help: "Jump to a point." },
    { opcode: "motion_glide", category: "motion", shape: "stack",
      text: "glide %SECS secs to x: %X y: %Y", args: { SECS: num(1), X: num(0), Y: num(0) }, help: "Slide smoothly to a point." },
    { opcode: "motion_pointdir", category: "motion", shape: "stack",
      text: "point in direction %DIR", args: { DIR: angle(90) }, help: "Face a heading." },
    { opcode: "motion_pointtowards", category: "motion", shape: "stack",
      text: "point towards %TARGET", args: { TARGET: ddt("POINT_TARGETS", "_mouse_") }, help: "Face the mouse or a sprite." },
    { opcode: "motion_changex", category: "motion", shape: "stack",
      text: "change x by %DX", args: { DX: num(10) }, help: "Nudge horizontally." },
    { opcode: "motion_changey", category: "motion", shape: "stack",
      text: "change y by %DY", args: { DY: num(10) }, help: "Nudge vertically." },
    { opcode: "motion_setx", category: "motion", shape: "stack",
      text: "set x to %X", args: { X: num(0) }, help: "Set x position." },
    { opcode: "motion_sety", category: "motion", shape: "stack",
      text: "set y to %Y", args: { Y: num(0) }, help: "Set y position." },
    { opcode: "motion_ifonedge", category: "motion", shape: "stack",
      text: "if on edge, bounce", args: {}, help: "Bounce off the stage border." },
    { opcode: "motion_setrotation", category: "motion", shape: "stack",
      text: "set rotation style %STYLE",
      args: { STYLE: dd([["left-right","left-right"],["don't rotate","none"],["all around","all"]]) },
      help: "How the sprite turns." },
    { opcode: "motion_xposition", category: "motion", shape: "reporter", text: "x position", args: {}, help: "Sprite x." },
    { opcode: "motion_yposition", category: "motion", shape: "reporter", text: "y position", args: {}, help: "Sprite y." },
    { opcode: "motion_direction", category: "motion", shape: "reporter", text: "direction", args: {}, help: "Sprite heading." },

    /* ---------------------------------------------------------------- LOOKS */
    { opcode: "looks_say", category: "looks", shape: "stack",
      text: "say %MSG", args: { MSG: txt("Hello!") }, help: "Speech bubble." },
    { opcode: "looks_sayfor", category: "looks", shape: "stack",
      text: "say %MSG for %SECS seconds", args: { MSG: txt("Hello!"), SECS: num(2) }, help: "Timed speech bubble." },
    { opcode: "looks_think", category: "looks", shape: "stack",
      text: "think %MSG", args: { MSG: txt("Hmm...") }, help: "Thought bubble." },
    { opcode: "looks_switchcostume", category: "looks", shape: "stack",
      text: "switch costume to %COS", args: { COS: dd([["costume1","costume1"],["costume2","costume2"]]) }, help: "Change look." },
    { opcode: "looks_nextcostume", category: "looks", shape: "stack",
      text: "next costume", args: {}, help: "Advance costume — animate!" },
    { opcode: "looks_changesize", category: "looks", shape: "stack",
      text: "change size by %N", args: { N: num(10) }, help: "Grow / shrink." },
    { opcode: "looks_setsize", category: "looks", shape: "stack",
      text: "set size to %N %", args: { N: num(100) }, help: "Absolute size." },
    { opcode: "looks_changeeffect", category: "looks", shape: "stack",
      text: "change %EFFECT effect by %N",
      args: { EFFECT: dd([["color","color"],["ghost","ghost"],["brightness","brightness"]]), N: num(25) },
      help: "Visual effect." },
    { opcode: "looks_seteffect", category: "looks", shape: "stack",
      text: "set %EFFECT effect to %N",
      args: { EFFECT: dd([["color","color"],["ghost","ghost"],["brightness","brightness"]]), N: num(0) },
      help: "Set an effect." },
    { opcode: "looks_cleareffects", category: "looks", shape: "stack", text: "clear graphic effects", args: {}, help: "Reset effects." },
    { opcode: "looks_show", category: "looks", shape: "stack", text: "show", args: {}, help: "Make visible." },
    { opcode: "looks_hide", category: "looks", shape: "stack", text: "hide", args: {}, help: "Make invisible." },
    { opcode: "looks_gotofront", category: "looks", shape: "stack",
      text: "go to %LAYER layer", args: { LAYER: dd([["front","front"],["back","back"]]) }, help: "Reorder layer." },
    { opcode: "looks_switchbackdrop", category: "looks", shape: "stack",
      text: "switch backdrop to %BD", args: { BD: ddt("BACKDROPS", "meadow") }, help: "Change the scene." },
    { opcode: "looks_nextbackdrop", category: "looks", shape: "stack",
      text: "next backdrop", args: {}, help: "Cycle to the next scene." },
    { opcode: "looks_size", category: "looks", shape: "reporter", text: "size", args: {}, help: "Current size %." },
    { opcode: "looks_costumenumber", category: "looks", shape: "reporter", text: "costume #", args: {}, help: "Costume index." },

    /* ---------------------------------------------------------------- SOUND */
    { opcode: "sound_play", category: "sound", shape: "stack",
      text: "start sound %SND", args: { SND: dd([["Meow","Meow"],["Bark","Bark"],["Roar","Roar"],["Giggle","Giggle"],["Cheer","Cheer"],["Pop","Pop"],["Boing","Boing"],["Jump","Jump"],["Chomp","Chomp"],["Coin","Coin"],["Ding","Ding"],["Laser","Laser"],["Boom","Boom"],["Rocket","Rocket"],["Magic","Magic"],["Splash","Splash"],["Bubbles","Bubbles"],["Whistle","Whistle"],["Horn","Horn"],["Drumroll","Drumroll"],["Buzzer","Buzzer"]]) }, help: "Play a sound." },
    { opcode: "sound_playuntil", category: "sound", shape: "stack",
      text: "play sound %SND until done", args: { SND: dd([["Meow","Meow"],["Bark","Bark"],["Roar","Roar"],["Giggle","Giggle"],["Cheer","Cheer"],["Pop","Pop"],["Boing","Boing"],["Jump","Jump"],["Chomp","Chomp"],["Coin","Coin"],["Ding","Ding"],["Laser","Laser"],["Boom","Boom"],["Rocket","Rocket"],["Magic","Magic"],["Splash","Splash"],["Bubbles","Bubbles"],["Whistle","Whistle"],["Horn","Horn"],["Drumroll","Drumroll"],["Buzzer","Buzzer"]]) }, help: "Play and wait." },
    { opcode: "sound_stopall", category: "sound", shape: "stack", text: "stop all sounds", args: {}, help: "Silence." },
    { opcode: "sound_changevol", category: "sound", shape: "stack",
      text: "change volume by %N", args: { N: num(-10) }, help: "Adjust volume." },
    { opcode: "sound_setvol", category: "sound", shape: "stack",
      text: "set volume to %N %", args: { N: num(100) }, help: "Set volume." },
    { opcode: "sound_playnote", category: "sound", shape: "stack",
      text: "play note %NOTE for %BEATS beats", args: { NOTE: num(60), BEATS: num(0.5) }, help: "Play a musical note." },
    { opcode: "sound_volume", category: "sound", shape: "reporter", text: "volume", args: {}, help: "Current volume." },

    /* --------------------------------------------------------------- EVENTS */
    { opcode: "event_flag", category: "events", shape: "hat",
      text: "when ⚑ clicked", args: {}, help: "Start when the green flag is clicked." },
    { opcode: "event_key", category: "events", shape: "hat",
      text: "when %KEY key pressed",
      args: { KEY: dd([["space","space"],["up arrow","up arrow"],["down arrow","down arrow"],["left arrow","left arrow"],["right arrow","right arrow"],["any","any"]]) },
      help: "Start on a key press." },
    { opcode: "event_clicked", category: "events", shape: "hat", text: "when this sprite clicked", args: {}, help: "Start when clicked." },
    { opcode: "event_broadcast", category: "events", shape: "stack",
      text: "broadcast %MSG", args: { MSG: ddt("MESSAGES", "message1") }, help: "Send a signal." },
    { opcode: "event_broadcastwait", category: "events", shape: "stack",
      text: "broadcast %MSG and wait", args: { MSG: ddt("MESSAGES", "message1") }, help: "Send and wait." },
    { opcode: "event_whenbroadcast", category: "events", shape: "hat",
      text: "when I receive %MSG", args: { MSG: ddt("MESSAGES", "message1") }, help: "Start on a signal." },

    /* -------------------------------------------------------------- CONTROL */
    { opcode: "control_wait", category: "control", shape: "stack",
      text: "wait %SECS seconds", args: { SECS: num(1) }, help: "Pause." },
    { opcode: "control_repeat", category: "control", shape: "c",
      text: "repeat %N", args: { N: num(10) }, help: "Loop a fixed number of times." },
    { opcode: "control_forever", category: "control", shape: "c",
      text: "forever", args: {}, help: "Loop endlessly." },
    { opcode: "control_if", category: "control", shape: "c",
      text: "if %COND then", args: { COND: bool() }, help: "Run if true." },
    { opcode: "control_ifelse", category: "control", shape: "c2",
      text: "if %COND then", args: { COND: bool() }, help: "Run one branch or the other." },
    { opcode: "control_waituntil", category: "control", shape: "stack",
      text: "wait until %COND", args: { COND: bool() }, help: "Pause until true." },
    { opcode: "control_repeatuntil", category: "control", shape: "c",
      text: "repeat until %COND", args: { COND: bool() }, help: "Loop until true." },
    { opcode: "control_clone", category: "control", shape: "stack",
      text: "create clone of %TARGET", args: { TARGET: ddt("CLONE_TARGETS", "_myself_") }, help: "Spawn a copy that runs its own scripts." },
    { opcode: "control_whenclone", category: "control", shape: "hat",
      text: "when I start as a clone", args: {}, help: "Runs in every new clone." },
    { opcode: "control_deleteclone", category: "control", shape: "cap",
      text: "delete this clone", args: {}, help: "Remove this clone." },
    { opcode: "control_stop", category: "control", shape: "cap",
      text: "stop %WHAT", args: { WHAT: dd([["all","all"],["this script","this script"]]) }, help: "Halt scripts." },

    /* -------------------------------------------------------------- SENSING */
    { opcode: "sensing_touching", category: "sensing", shape: "boolean",
      text: "touching %TARGET ?", args: { TARGET: ddt("TOUCH_TARGETS", "_edge_") }, help: "Collision test — edge, mouse, or another sprite." },
    { opcode: "sensing_touchingcolor", category: "sensing", shape: "boolean",
      text: "touching color %COLOR ?", args: { COLOR: color("#ff2b2b") }, help: "Color collision." },
    { opcode: "sensing_keypressed", category: "sensing", shape: "boolean",
      text: "key %KEY pressed?",
      args: { KEY: dd([["space","space"],["up arrow","up arrow"],["down arrow","down arrow"],["left arrow","left arrow"],["right arrow","right arrow"]]) },
      help: "Is a key down?" },
    { opcode: "sensing_mousedown", category: "sensing", shape: "boolean", text: "mouse down?", args: {}, help: "Is the mouse pressed?" },
    { opcode: "sensing_mousex", category: "sensing", shape: "reporter", text: "mouse x", args: {}, help: "Mouse x." },
    { opcode: "sensing_mousey", category: "sensing", shape: "reporter", text: "mouse y", args: {}, help: "Mouse y." },
    { opcode: "sensing_distance", category: "sensing", shape: "reporter",
      text: "distance to %TARGET", args: { TARGET: ddt("POINT_TARGETS", "_mouse_") }, help: "Distance to the mouse or a sprite." },
    { opcode: "sensing_timer", category: "sensing", shape: "reporter", text: "timer", args: {}, help: "Seconds since reset." },
    { opcode: "sensing_resettimer", category: "sensing", shape: "stack", text: "reset timer", args: {}, help: "Zero the timer." },
    { opcode: "sensing_ask", category: "sensing", shape: "stack",
      text: "ask %Q and wait", args: { Q: txt("What's your name?") }, help: "Prompt the player." },
    { opcode: "sensing_answer", category: "sensing", shape: "reporter", text: "answer", args: {}, help: "Last typed answer." },

    /* ------------------------------------------------------------ OPERATORS */
    { opcode: "operator_add", category: "operators", shape: "reporter",
      text: "%A + %B", args: { A: num(""), B: num("") }, help: "Add." },
    { opcode: "operator_subtract", category: "operators", shape: "reporter",
      text: "%A − %B", args: { A: num(""), B: num("") }, help: "Subtract." },
    { opcode: "operator_multiply", category: "operators", shape: "reporter",
      text: "%A × %B", args: { A: num(""), B: num("") }, help: "Multiply." },
    { opcode: "operator_divide", category: "operators", shape: "reporter",
      text: "%A ÷ %B", args: { A: num(""), B: num("") }, help: "Divide." },
    { opcode: "operator_random", category: "operators", shape: "reporter",
      text: "pick random %A to %B", args: { A: num(1), B: num(10) }, help: "Random integer." },
    { opcode: "operator_gt", category: "operators", shape: "boolean",
      text: "%A > %B", args: { A: num(""), B: num("50") }, help: "Greater than." },
    { opcode: "operator_lt", category: "operators", shape: "boolean",
      text: "%A < %B", args: { A: num(""), B: num("50") }, help: "Less than." },
    { opcode: "operator_eq", category: "operators", shape: "boolean",
      text: "%A = %B", args: { A: num(""), B: num("50") }, help: "Equal to." },
    { opcode: "operator_and", category: "operators", shape: "boolean",
      text: "%A and %B", args: { A: bool(), B: bool() }, help: "Both true." },
    { opcode: "operator_or", category: "operators", shape: "boolean",
      text: "%A or %B", args: { A: bool(), B: bool() }, help: "Either true." },
    { opcode: "operator_not", category: "operators", shape: "boolean",
      text: "not %A", args: { A: bool() }, help: "Invert." },
    { opcode: "operator_join", category: "operators", shape: "reporter",
      text: "join %A %B", args: { A: txt("apple "), B: txt("banana") }, help: "Concatenate text." },
    { opcode: "operator_mod", category: "operators", shape: "reporter",
      text: "%A mod %B", args: { A: num(""), B: num("") }, help: "Remainder." },
    { opcode: "operator_round", category: "operators", shape: "reporter",
      text: "round %A", args: { A: num("") }, help: "Round to integer." },

    /* ------------------------------------------------------------ VARIABLES */
    { opcode: "data_setvar", category: "variables", shape: "stack",
      text: "set %VAR to %VAL", args: { VAR: ddt("VARS", "score"), VAL: txt("0") }, help: "Assign a variable." },
    { opcode: "data_changevar", category: "variables", shape: "stack",
      text: "change %VAR by %VAL", args: { VAR: ddt("VARS", "score"), VAL: num(1) }, help: "Add to a variable." },
    { opcode: "data_showvar", category: "variables", shape: "stack",
      text: "show variable %VAR", args: { VAR: ddt("VARS", "score") }, help: "Display on stage." },
    { opcode: "data_hidevar", category: "variables", shape: "stack",
      text: "hide variable %VAR", args: { VAR: ddt("VARS", "score") }, help: "Hide from stage." },
    { opcode: "data_variable", category: "variables", shape: "reporter",
      text: "%VAR", args: { VAR: ddt("VARS", "score") }, help: "Read a variable." },

    /* ------------------------------------------------------------------ PEN */
    { opcode: "pen_clear", category: "pen", shape: "stack", text: "erase all", args: {}, help: "Wipe all pen marks and stamps." },
    { opcode: "pen_stamp", category: "pen", shape: "stack", text: "stamp", args: {}, help: "Print a copy of this sprite onto the paper." },
    { opcode: "pen_down", category: "pen", shape: "stack", text: "pen down", args: {}, help: "Start drawing as you move." },
    { opcode: "pen_up", category: "pen", shape: "stack", text: "pen up", args: {}, help: "Stop drawing." },
    { opcode: "pen_setcolor", category: "pen", shape: "stack",
      text: "set pen color to %COLOR", args: { COLOR: color("#e5533c") }, help: "Pick the pen color." },
    { opcode: "pen_setsize", category: "pen", shape: "stack",
      text: "set pen size to %N", args: { N: num(3) }, help: "Pen thickness (1-50)." },

    /* ---------------------------------------------------------------- JUICE */
    { opcode: "juice_confetti", category: "juice", shape: "stack",
      text: "confetti burst", args: {}, help: "Celebrate! Confetti pops from this sprite." },
    { opcode: "juice_shake", category: "juice", shape: "stack",
      text: "shake screen %SECS secs", args: { SECS: num(0.3) }, help: "Rumble the whole stage." },
    { opcode: "juice_pop", category: "juice", shape: "stack",
      text: "pop into scraps", args: {}, help: "Burst into paper scraps (and stay hidden until shown)." },
    { opcode: "juice_trail", category: "juice", shape: "stack",
      text: "sparkle trail %STATE", args: { STATE: dd([["on","on"],["off","off"]]) }, help: "Leave sparkles as you move." },
  ];

  // index by opcode, pre-tokenize, and stitch category color onto each def
  const byOpcode = {};
  const catColor = {};
  CATEGORIES.forEach((c) => { catColor[c.id] = c; });
  DEFS.forEach((d) => {
    d.tokens = CtrlCreate.tokenize(d.text);
    d.color = catColor[d.category].color;
    d.edge = catColor[d.category].edge;
    byOpcode[d.opcode] = d;
  });

  CtrlCreate.categories = CATEGORIES;
  CtrlCreate.defs = byOpcode;
  CtrlCreate.defList = DEFS;
  CtrlCreate.defsByCategory = function (cat) { return DEFS.filter((d) => d.category === cat); };
})();
