# Ctrl+Create — Art Generation Brief

**A complete, copy-paste-ready pipeline for generating every art asset in _Ctrl+Create_, a AAA-polish 2D papercut-style block-coding game.**

This document is the entire art pipeline. No image files exist yet. Feed the prompts below to an image generator (ChatGPT / DALL·E, Midjourney, etc.) to produce all art. Every prompt is written out in full inside a fenced code block for one-click copying. The **Asset Manifest** at the end doubles as the game's loading manifest — the game reads these exact file paths.

---

## 0. How to use this brief

1. Read the **Global Style Guide** once. It defines the `STYLE PREFIX` — a paragraph you prepend to every single prompt so all assets share one visual language.
2. When a prompt says "**[STYLE PREFIX]**", paste the full style paragraph from Section 1 there. (We reference it by name to keep this doc readable — but you must actually paste it into the generator every time.)
3. Follow the **Technical Requirements** (Section 2) for size, transparency, and the all-important **Facing Rule**.
4. Generate in the batches recommended by the **Consistency & QA Checklist** (Section 8) for maximum style coherence.
5. Save each output to the exact path in the **Asset Manifest** (Section 9).

> ### ⚠️ THE FACING RULE — read this first, it governs every character
> Every character ships as **two images**: a **right-facing** version and a **left-facing** version. The game flips between them depending on which way the sprite is moving.
>
> The left version is **NOT** a naive horizontal mirror. When you mirror an image, any asymmetric detail (a badge on the chest, a heart patch, a tool held in one hand, a cowlick) jumps to the wrong side of the body — and worse, the character often looks like it's **walking backwards**. To avoid this, every left-facing prompt instructs the generator explicitly:
>
> _"Same character, now facing left — **mirror the pose** so the character walks and looks naturally to the left. Asymmetric details (badge, heart patch, tool held in hand, etc.) stay on the **SAME physical side of the character's body**; only the facing direction flips. The character must read as confidently moving left, never as walking backwards."_
>
> Why it matters: in-game, a sprite gliding right-to-left uses the left art. If that art is just a flipped right-pose, the leading foot, the gaze, and the held props all point the wrong way and the animation looks broken. Generating a purpose-made left pose keeps motion believable in both directions.

---

## 1. Global Style Guide

**Art direction in one sentence:** _Ctrl+Create_ looks like a beautifully crafted children's pop-up book — every character, icon, and backdrop is built from layered cut construction paper, with visible scissor-cut edges and soft shadows between the paper layers.

### The STYLE PREFIX (prepend to EVERY prompt)

```
2D papercut / layered construction-paper craft illustration. Built entirely
from pieces of cut colored paper stacked in layers, with visible hand-cut
scissor edges, subtle natural paper grain and fiber texture, and soft diffuse
drop shadows cast BETWEEN the paper layers to give gentle depth. Silhouettes
are slightly imperfect and hand-cut, not machine-perfect. Flat solid colors
only — absolutely no gradients, no airbrushing, no glossy highlights. Warm,
friendly craft palette (paper tones: cream, kraft brown, coral, teal, mustard,
sky blue, soft green). Shapes are defined by the CUT EDGES of the paper itself
— there are NO drawn pen or ink outlines. Clean, bright, storybook children's
craft aesthetic with AAA polish and tidy composition.

NEGATIVE / AVOID: no 3D render, no CGI, no photorealism, no gradients, no
airbrush, no glossy plastic shading, no drawn ink or pen outlines, no
lettering or text anywhere in the image, no watermark, no busy cluttered
background, no realistic photographic texture.
```

### Palette anchors (paper swatches)

| Role | Hex | Paper name |
|---|---|---|
| Cream base | `#F7F0E1` | Ivory card |
| Kraft | `#C89B6B` | Kraft brown |
| Coral | `#FF6F61` | Coral |
| Teal | `#2FB4A6` | Teal |
| Mustard | `#F2B134` | Mustard |
| Sky | `#7EC8E3` | Sky blue |
| Leaf | `#6FBF73` | Soft green |
| Charcoal | `#3A3A3A` | Charcoal (for tiny accents/eyes) |

Characters may use colors outside these anchors, but keep everything in the **matte paper** family — flat, warm, and slightly desaturated like real construction paper.

---

## 2. Technical Requirements

| Requirement | Spec |
|---|---|
| File format | PNG with **alpha transparency** (real transparent background, not white) |
| Characters | **512 × 512 px** |
| Category icons | **256 × 256 px** |
| UI icons | **256 × 256 px** |
| Badges | **256 × 256 px** |
| Backdrops | **1024 × 768 px** |
| Light source | Consistent **top-left** across ALL assets (shadows fall down-right) |
| Character framing | Centered, full body in frame, ~**8% padding** on all sides |
| Baseline | For each character, right & left versions must share the **same foot baseline** so they don't bob when the sprite flips |
| Background | Transparent for characters/icons/badges; full-bleed art for backdrops |
| Facing | Every character = **right-facing + left-facing** pair (see Facing Rule). 8 hero characters also get a 2-frame walk pair. |

---

## 3. Characters (24)

Twenty-four game-ready characters. **Scrappy the cat** is character #1 and the game's default sprite. Each character below lists its filename pair, its one-line personality (which drives the pose), and a full generation prompt for BOTH facings. Eight are marked **⭐ HERO** and get an extra 2-frame walk pair for costume-switch animation.

> Reminder: paste the **STYLE PREFIX** wherever a prompt says **[STYLE PREFIX]**, and always generate the right AND left prompt for each character.

---

### 3.1 ⭐ Scrappy the Cat — _default sprite_
**Personality:** the plucky, curious mascot; always mid-bounce, ready to go.
**Files:** `assets/sprites/scrappy_right.png`, `assets/sprites/scrappy_left.png`, `assets/sprites/scrappy_right_step.png`, `assets/sprites/scrappy_left_step.png`

```
[STYLE PREFIX]

Subject: "Scrappy," a friendly cartoon cat mascot, the cheerful star of a
kids' coding game. Built from three papers: warm mustard-orange body, cream
paper belly and muzzle, coral pink inner ears and nose. Layered paper details:
a slightly darker orange fringe of cut paper for the tail tip and ear edges, two
small charcoal paper dot eyes with tiny cream paper glints, whiskers cut as
thin paper slivers. A single small teal paper collar tag sits on the LEFT side
of the chest (as we view the right-facing pose). Pose: standing upright on two
legs, one paw raised in a friendly wave, tail curled up with an energetic
bounce, big welcoming smile. Character is RIGHT-FACING (body and gaze oriented
to the right). Centered, full body, ~8% padding, transparent background,
top-left light source, 512x512.
```

```
[STYLE PREFIX]

Same character as Scrappy the cat above — SAME papers, same mustard-orange
body, cream belly, coral ears, same teal collar tag. Now FACING LEFT: mirror
the pose so Scrappy waves and looks naturally to the left, tail bouncing. The
teal collar tag stays on the SAME physical side of his chest as before (do not
let it jump sides). Scrappy must read as confidently moving left, never walking
backwards. Centered, full body, ~8% padding, transparent background, top-left
light source, 512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Scrappy the cat (same mustard body, cream belly, coral ears, teal collar tag),
RIGHT-FACING, in a walking step pose: OPPOSITE leg forward compared to his main
standing pose, mid-stride, paws swinging, tail bouncing — a single clean walk
frame for 2-frame animation. Identical style, colors, and scale to his main
right-facing art so the two frames alternate cleanly. Transparent background,
top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Scrappy the cat walk frame, now FACING LEFT: mirror the walking step pose so he
strides naturally to the left, opposite leg forward. Teal collar tag stays on
the same physical side of his body. Matches his left-facing main art in scale
and colors for clean 2-frame animation. Transparent background, top-left light,
512x512.
```

---

### 3.2 ⭐ Biscuit the Dog
**Personality:** loyal, goofy, tail-wagging enthusiasm.
**Files:** `assets/sprites/dog_right.png`, `assets/sprites/dog_left.png`, `assets/sprites/dog_right_step.png`, `assets/sprites/dog_left_step.png`

```
[STYLE PREFIX]

Subject: "Biscuit," a happy cartoon puppy for a kids' coding game. Built from
three papers: kraft-brown body, cream paper muzzle and belly, one folded-over
darker brown paper ear flopping forward. Layered details: a coral paper tongue
lolling out, charcoal dot eyes with cream glints, a small brown paper spot patch
over one eye. A round bone-shaped cream tag hangs on the RIGHT side of the chest
(right-facing view). Pose: upright, front paws up mid-happy-wag, tail cut as a
wagging paper curl, big goofy open smile. RIGHT-FACING. Centered, full body,
~8% padding, transparent background, top-left light, 512x512.
```

```
[STYLE PREFIX]

Same character as Biscuit the dog — same kraft-brown body, cream muzzle, folded
brown ear, coral tongue, brown eye-patch spot, cream bone tag. Now FACING LEFT:
mirror the pose so Biscuit wags and looks naturally to the left. The eye-patch
spot and the bone tag stay on the SAME physical side of his body as before; only
the facing flips. Must read as moving left, not backwards. Transparent
background, top-left light, ~8% padding, 512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Biscuit the puppy (kraft-brown body, cream muzzle, folded ear, coral tongue,
eye-patch spot, bone tag), RIGHT-FACING, walking step pose with the OPPOSITE
leg forward from his main pose, mid-stride, ears and tail bouncing. Single clean
walk frame matching his main right art in scale and color. Transparent
background, top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Biscuit the puppy walk frame FACING LEFT: mirror the stride so he walks left,
opposite leg forward. Eye-patch spot and bone tag stay on the same physical side
of his body. Matches his left-facing main art. Transparent background, top-left
light, 512x512.
```

---

### 3.3 ⭐ Bolt the Robot
**Personality:** eager, blinky, slightly clumsy helper-bot.
**Files:** `assets/sprites/robot_right.png`, `assets/sprites/robot_left.png`, `assets/sprites/robot_right_step.png`, `assets/sprites/robot_left_step.png`

```
[STYLE PREFIX]

Subject: "Bolt," a cute boxy helper robot for a kids' coding game. Built from
flat papers: sky-blue paper body panel, cream paper rounded head, teal paper
arms and legs. Papercraft mechanical details: brad-fastener paper joints at the
shoulders and hips (little round metallic-gray paper dots as rivets), a single
charcoal paper screen face with two glowing mustard-paper square eyes and a
small paper antenna topped with a coral paper dot. A round mustard "power" panel
sits on the LEFT side of the chest (right-facing view). Pose: upright, one paper
arm raised in a cheerful robotic wave, slightly tilted head. RIGHT-FACING.
Transparent background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Bolt the robot — same sky-blue body, cream head, teal limbs,
brad-fastener rivet joints, mustard square eyes, coral antenna dot, mustard
power panel. Now FACING LEFT: mirror the pose so Bolt waves and tilts naturally
to the left. The mustard power panel stays on the SAME physical side of his
chest; only facing flips. Reads as moving left, not backwards. Transparent
background, top-left light, 512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Bolt the robot (sky-blue body, cream head, teal limbs, brad rivet joints,
mustard eyes, mustard power panel), RIGHT-FACING, walk step pose with OPPOSITE
paper leg forward, mid-stride, arms swinging stiffly. Single clean walk frame
matching his main right art. Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Bolt the robot walk frame FACING LEFT: mirror the stride so he steps left,
opposite leg forward. Mustard power panel stays on the same physical side.
Matches his left-facing main art. Transparent background, top-left light,
512x512.
```

---

### 3.4 ⭐ Ember the Dragon
**Personality:** bold little firebrand, proud and playful.
**Files:** `assets/sprites/dragon_right.png`, `assets/sprites/dragon_left.png`, `assets/sprites/dragon_right_step.png`, `assets/sprites/dragon_left_step.png`

```
[STYLE PREFIX]

Subject: "Ember," a cute chubby baby dragon for a kids' coding game. Built from
papers: leaf-green paper body, cream paper belly plates (a stack of small
overlapping paper scallops), coral paper wings and spiky back-fringe cut as
layered triangles. Details: mustard paper horns, charcoal dot eyes with cream
glints, a tiny coral paper flame puff at the snout. A small mustard star patch
sits on the RIGHT shoulder (right-facing view). Pose: standing proud, chest
puffed, little wings spread, one clawed foot forward. RIGHT-FACING. Transparent
background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Ember the dragon — same leaf-green body, cream belly scallops,
coral wings and back-fringe, mustard horns, coral flame puff, mustard star
shoulder patch. Now FACING LEFT: mirror the pose so Ember stands proud facing
left, wings spread, one claw forward. The mustard star patch stays on the SAME
physical shoulder as before; only facing flips. Reads as moving left, not
backwards. Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Ember the dragon (leaf-green body, cream belly scallops, coral wings, mustard
horns, flame puff, star shoulder patch), RIGHT-FACING, walk step pose with
OPPOSITE clawed foot forward, mid-stride, wings mid-flap. Single clean walk
frame matching main right art. Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Ember the dragon walk frame FACING LEFT: mirror the stride so she steps left,
opposite claw forward. Star shoulder patch stays on the same physical shoulder.
Matches left-facing main art. Transparent background, top-left light, 512x512.
```

---

### 3.5 Pip the Penguin
**Personality:** tidy, waddling, always polite.
**Files:** `assets/sprites/penguin_right.png`, `assets/sprites/penguin_left.png`

```
[STYLE PREFIX]

Subject: "Pip," an adorable round penguin for a kids' coding game. Built from
papers: charcoal-navy paper back and head, cream paper oval belly, mustard paper
beak and feet. Details: two charcoal dot eyes with cream glints, a coral paper
bow-tie at the neck, layered cream paper wing edges. A small sky-blue snowflake
patch sits on the LEFT side of the belly (right-facing view). Pose: upright,
flippers slightly out for balance, cheerful waddle stance, one foot forward.
RIGHT-FACING. Transparent background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Pip the penguin — same navy back, cream belly, mustard beak
and feet, coral bow-tie, sky-blue snowflake belly patch. Now FACING LEFT: mirror
the waddle so Pip steps and looks naturally to the left. The snowflake patch
stays on the SAME physical side of the belly; only facing flips. Reads as moving
left, not backwards. Transparent background, top-left light, 512x512.
```

---

### 3.6 ⭐ Rusty the Fox
**Personality:** clever, quick, a mischievous grin.
**Files:** `assets/sprites/fox_right.png`, `assets/sprites/fox_left.png`, `assets/sprites/fox_right_step.png`, `assets/sprites/fox_left_step.png`

```
[STYLE PREFIX]

Subject: "Rusty," a clever cartoon fox for a kids' coding game. Built from
papers: coral-orange paper body, cream paper cheeks, belly and tail-tip,
charcoal paper paws and ear-tips. Details: layered cut-paper fringe fur along
the cheeks and the big bushy tail (overlapping paper slivers), charcoal dot eyes
with cream glints, a sly cut-paper grin. A small teal leaf pin sits on the RIGHT
side of the chest (right-facing view). Pose: crouched slightly, alert and
springy, one paw forward mid-sneak, tail swishing up. RIGHT-FACING. Transparent
background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Rusty the fox — same coral body, cream cheeks/belly/tail-tip,
charcoal paws, layered fringe-fur tail, teal leaf chest pin. Now FACING LEFT:
mirror the sneaky pose so Rusty creeps naturally to the left, tail swishing. The
teal leaf pin stays on the SAME physical side of his chest; only facing flips.
Reads as moving left, not backwards. Transparent background, top-left light,
512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Rusty the fox (coral body, cream cheeks/belly/tail-tip, charcoal paws, fringe-fur
tail, teal leaf pin), RIGHT-FACING, walk step pose with OPPOSITE paw forward,
mid-sneak stride, bushy tail bouncing. Single clean walk frame matching main
right art. Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Rusty the fox walk frame FACING LEFT: mirror the stride so he creeps left,
opposite paw forward. Teal leaf pin stays on the same physical side. Matches
left-facing main art. Transparent background, top-left light, 512x512.
```

---

### 3.7 ⭐ Chomp the Dinosaur (T-Rex)
**Personality:** big-hearted, tiny arms, loud happy roar.
**Files:** `assets/sprites/dino_right.png`, `assets/sprites/dino_left.png`, `assets/sprites/dino_right_step.png`, `assets/sprites/dino_left_step.png`

```
[STYLE PREFIX]

Subject: "Chomp," a friendly cartoon T-rex for a kids' coding game. Built from
papers: leaf-green paper body, mustard paper belly, cream paper back-spikes cut
as a row of little triangles. Details: charcoal dot eyes with cream glints, a
big open cut-paper grin with tiny cream teeth, comically tiny paper arms. A small
coral heart patch sits on the LEFT side of the chest (right-facing view). Pose:
upright on two sturdy legs, tail out for balance, arms up mid-happy-roar, one
foot stepping forward. RIGHT-FACING. Transparent background, top-left light,
~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Chomp the T-rex — same leaf-green body, mustard belly, cream
back-spikes and teeth, tiny arms, coral heart chest patch. Now FACING LEFT:
mirror the pose so Chomp roars and steps naturally to the left, tail balancing.
The coral heart patch stays on the SAME physical side of his chest; only facing
flips. Reads as moving left, not backwards. Transparent background, top-left
light, 512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Chomp the T-rex (leaf-green body, mustard belly, cream spikes/teeth, tiny arms,
coral heart patch), RIGHT-FACING, walk step pose with OPPOSITE sturdy leg
forward, mid-stomp stride, tail swinging. Single clean walk frame matching main
right art. Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Chomp the T-rex walk frame FACING LEFT: mirror the stomp so he steps left,
opposite leg forward. Coral heart patch stays on the same physical side. Matches
left-facing main art. Transparent background, top-left light, 512x512.
```

---

### 3.8 Luna the Unicorn
**Personality:** dreamy, graceful, a sprinkle of sparkle.
**Files:** `assets/sprites/unicorn_right.png`, `assets/sprites/unicorn_left.png`

```
[STYLE PREFIX]

Subject: "Luna," a gentle cartoon unicorn for a kids' coding game. Built from
papers: cream-white paper body, sky-blue and coral layered paper mane and tail
(overlapping wavy paper strands), mustard paper spiral horn. Details: charcoal
dot eyes with cream glints, coral paper cheek blush, teal paper hooves. A small
mustard star charm sits on the RIGHT side of the chest (right-facing view).
Pose: standing gracefully, one front hoof lifted daintily, mane flowing. RIGHT-
FACING. Transparent background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Luna the unicorn — same cream body, sky-blue/coral layered
mane and tail, mustard spiral horn, teal hooves, mustard star chest charm. Now
FACING LEFT: mirror the graceful pose so Luna steps and lifts a hoof naturally
to the left, mane flowing. The mustard star charm stays on the SAME physical
side of her chest; only facing flips. Reads as moving left, not backwards.
Transparent background, top-left light, 512x512.
```

---

### 3.9 Buzz the Bee
**Personality:** busy, upbeat, zippy little worker.
**Files:** `assets/sprites/bee_right.png`, `assets/sprites/bee_left.png`

```
[STYLE PREFIX]

Subject: "Buzz," a cheerful cartoon bee for a kids' coding game. Built from
papers: mustard-yellow paper body with charcoal paper stripes (cut bands), cream
paper translucent-look wings (layered semi-opaque paper), sky-blue paper eyes.
Details: two thin paper antennae topped with coral dots, tiny cream paper stinger,
a cheerful cut-paper smile. A small coral flower patch sits on the LEFT side of
the body (right-facing view). Pose: hovering upright, wings out mid-buzz, little
arms waving hello. RIGHT-FACING. Transparent background, top-left light, ~8%
padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Buzz the bee — same mustard body with charcoal stripes, cream
wings, sky-blue eyes, coral antenna dots, coral flower patch. Now FACING LEFT:
mirror the hover pose so Buzz waves and looks naturally to the left, wings
buzzing. The coral flower patch stays on the SAME physical side of his body;
only facing flips. Reads as moving left, not backwards. Transparent background,
top-left light, 512x512.
```

---

### 3.10 Finn the Shark
**Personality:** friendly (not scary!) toothy grin, always cruising.
**Files:** `assets/sprites/shark_right.png`, `assets/sprites/shark_left.png`

```
[STYLE PREFIX]

Subject: "Finn," a friendly cartoon shark for a kids' coding game (cute, not
scary). Built from papers: sky-blue paper body, cream paper belly, charcoal-navy
paper fin edges. Details: a big goofy cut-paper grin with small cream triangle
teeth, charcoal dot eyes with cream glints, layered paper gill slits, a tall
paper dorsal fin. A small mustard anchor patch sits on the RIGHT side of the
body (right-facing view). Pose: upright cruising stance, little fins out like
arms in a friendly wave, tail curved. RIGHT-FACING. Transparent background,
top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Finn the shark — same sky-blue body, cream belly, navy fin
edges, cream teeth, dorsal fin, mustard anchor patch. Now FACING LEFT: mirror
the cruising pose so Finn waves and swims naturally to the left, tail curving.
The mustard anchor patch stays on the SAME physical side of his body; only
facing flips. Reads as moving left, not backwards. Transparent background,
top-left light, 512x512.
```

---

### 3.11 Boo the Ghost
**Personality:** shy but friendly, a bashful little haunt.
**Files:** `assets/sprites/ghost_right.png`, `assets/sprites/ghost_left.png`

```
[STYLE PREFIX]

Subject: "Boo," a cute friendly ghost for a kids' coding game. Built from
papers: cream-white paper body with a soft wavy scalloped cut-paper bottom edge,
a faint sky-blue paper inner shadow layer for depth. Details: two charcoal dot
eyes with cream glints, a small round cut-paper "oooh" mouth, coral paper cheek
blush. A small teal star patch sits on the LEFT side of the body (right-facing
view). Pose: floating upright, little paper arms out, one wisp curling forward,
gently tilted in a bashful wave. RIGHT-FACING. Transparent background, top-left
light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Boo the ghost — same cream wavy body, sky-blue inner shadow,
charcoal eyes, round mouth, coral blush, teal star patch. Now FACING LEFT:
mirror the float pose so Boo drifts and waves naturally to the left, wisp
curling. The teal star patch stays on the SAME physical side of his body; only
facing flips. Reads as moving left, not backwards. Transparent background,
top-left light, 512x512.
```

---

### 3.12 ⭐ Merlin the Wizard
**Personality:** wise, whimsical, twinkly-eyed spellcaster.
**Files:** `assets/sprites/wizard_right.png`, `assets/sprites/wizard_left.png`, `assets/sprites/wizard_right_step.png`, `assets/sprites/wizard_left_step.png`

```
[STYLE PREFIX]

Subject: "Merlin," a kindly cartoon wizard for a kids' coding game. Built from
papers: teal paper robe, cream paper long beard cut in layered wavy strands, a
tall mustard paper pointed hat. Details: charcoal dot eyes with cream glints,
coral paper cheeks, a coral paper star cut into the hat, cream paper hands. He
holds a kraft-brown paper staff topped with a mustard star in his RIGHT hand
(right-facing view). A small sky-blue moon patch sits on the LEFT chest of the
robe. Pose: mid-stride casting stance, staff raised, robe flowing. RIGHT-FACING.
Transparent background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Merlin the wizard — same teal robe, cream layered beard,
mustard pointed hat with coral star, sky-blue moon chest patch, kraft staff with
mustard star. Now FACING LEFT: mirror the casting pose so Merlin strides and
raises his staff naturally to the left. The staff stays in the SAME physical
hand and the moon patch stays on the SAME physical side of the robe; only facing
flips. Reads as moving left, not backwards. Transparent background, top-left
light, 512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Merlin the wizard (teal robe, cream beard, mustard hat with coral star, moon
chest patch, staff in same hand), RIGHT-FACING, walk step pose with OPPOSITE
foot forward beneath the robe, mid-stride, staff and beard swaying. Single clean
walk frame matching main right art. Transparent background, top-left light,
512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Merlin the wizard walk frame FACING LEFT: mirror the stride so he steps left,
opposite foot forward. Staff stays in the same physical hand, moon patch on the
same physical side. Matches left-facing main art. Transparent background,
top-left light, 512x512.
```

---

### 3.13 ⭐ Sir Pip the Knight
**Personality:** brave, earnest, a little clanky.
**Files:** `assets/sprites/knight_right.png`, `assets/sprites/knight_left.png`, `assets/sprites/knight_right_step.png`, `assets/sprites/knight_left_step.png`

```
[STYLE PREFIX]

Subject: "Sir Pip," a brave cartoon knight for a kids' coding game. Built from
papers: silvery-gray paper armor (flat matte paper, no shine) with brad-fastener
paper rivets at the joints, teal paper tunic, mustard paper plume on the helmet.
Details: a cream paper face peeking from the helmet with charcoal dot eyes, coral
paper cheeks. He holds a kraft-and-cream paper sword in his RIGHT hand and a
coral paper shield with a mustard star on his LEFT arm (right-facing view). Pose:
heroic stance, sword raised, one armored foot forward. RIGHT-FACING. Transparent
background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Sir Pip the knight — same gray armor with rivets, teal tunic,
mustard helmet plume, coral shield with mustard star. Now FACING LEFT: mirror
the heroic pose so Sir Pip raises his sword and steps naturally to the left. The
sword stays in the SAME physical hand and the shield on the SAME physical arm as
before; only facing flips. Reads as moving left, not backwards. Transparent
background, top-left light, 512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Sir Pip the knight (gray riveted armor, teal tunic, mustard plume, sword and
shield in same hands), RIGHT-FACING, walk step pose with OPPOSITE armored foot
forward, mid-march, sword and plume bobbing. Single clean walk frame matching
main right art. Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Sir Pip the knight walk frame FACING LEFT: mirror the march so he steps left,
opposite foot forward. Sword and shield stay in the same physical hands. Matches
left-facing main art. Transparent background, top-left light, 512x512.
```

---

### 3.14 ⭐ Nova the Astronaut
**Personality:** adventurous explorer, wide-eyed with wonder.
**Files:** `assets/sprites/astronaut_right.png`, `assets/sprites/astronaut_left.png`, `assets/sprites/astronaut_right_step.png`, `assets/sprites/astronaut_left_step.png`

```
[STYLE PREFIX]

Subject: "Nova," a cheerful cartoon astronaut kid for a kids' coding game. Built
from papers: cream-white paper spacesuit with teal paper trim and joints, a
sky-blue paper helmet visor (flat matte, layered cream rim). Details: a happy
cream paper face behind the visor with charcoal dot eyes and coral cheeks, cream
paper backpack. A coral mission patch sits on the RIGHT shoulder (right-facing
view). Pose: bouncy low-gravity stance, one arm up in an excited wave, one boot
lifting off. RIGHT-FACING. Transparent background, top-left light, ~8% padding,
512x512.
```

```
[STYLE PREFIX]

Same character as Nova the astronaut — same cream suit, teal trim, sky-blue
visor, cream backpack, coral shoulder mission patch. Now FACING LEFT: mirror the
bouncy pose so Nova waves and bounds naturally to the left. The coral mission
patch stays on the SAME physical shoulder; only facing flips. Reads as moving
left, not backwards. Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (right):**
```
[STYLE PREFIX]

Nova the astronaut (cream suit, teal trim, sky-blue visor, backpack, coral
shoulder patch), RIGHT-FACING, walk step pose with OPPOSITE boot forward,
bouncy mid-stride, arm swinging. Single clean walk frame matching main right art.
Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Nova the astronaut walk frame FACING LEFT: mirror the bounce so she steps left,
opposite boot forward. Coral mission patch stays on the same physical shoulder.
Matches left-facing main art. Transparent background, top-left light, 512x512.
```

---

### 3.15 Shadow the Ninja
**Personality:** silent, focused, quick as a blink.
**Files:** `assets/sprites/ninja_right.png`, `assets/sprites/ninja_left.png`

```
[STYLE PREFIX]

Subject: "Shadow," a cute cartoon ninja for a kids' coding game. Built from
papers: charcoal-navy paper outfit and mask, cream paper eye-strip with two
friendly charcoal dot eyes, coral paper belt sash. Details: layered paper mask
folds, a small cream paper throwing-star tucked in the belt. A coral crescent
patch sits on the LEFT side of the chest (right-facing view). Pose: low agile
crouch, one hand forward in a ready stance, sash trailing. RIGHT-FACING.
Transparent background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Shadow the ninja — same charcoal-navy outfit and mask, cream
eye-strip, coral belt sash, cream throwing-star, coral crescent chest patch. Now
FACING LEFT: mirror the crouch so Shadow poses and looks naturally to the left,
sash trailing. The crescent patch stays on the SAME physical side of the chest;
only facing flips. Reads as moving left, not backwards. Transparent background,
top-left light, 512x512.
```

---

### 3.16 Captain the Pirate Parrot
**Personality:** boisterous, squawky, treasure-loving.
**Files:** `assets/sprites/parrot_right.png`, `assets/sprites/parrot_left.png`

```
[STYLE PREFIX]

Subject: "Captain," a boisterous cartoon pirate parrot for a kids' coding game.
Built from papers: coral-red paper body, mustard and teal layered paper wing
feathers (overlapping cut plumes), mustard paper beak. Details: a charcoal paper
eye-patch over one eye, the other a charcoal dot with cream glint, a tiny kraft-
brown paper pirate hat with a cream skull cut-out. A mustard coin patch sits on
the RIGHT side of the chest (right-facing view). Pose: perched upright, one wing
raised mid-squawk, chest out proudly. RIGHT-FACING. Transparent background,
top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Captain the pirate parrot — same coral body, mustard/teal
layered wings, mustard beak, charcoal eye-patch, kraft pirate hat, mustard coin
chest patch. Now FACING LEFT: mirror the perch pose so Captain squawks and looks
naturally to the left, wing raised. The eye-patch stays over the SAME physical
eye and the coin patch on the SAME physical side; only facing flips. Reads as
moving left, not backwards. Transparent background, top-left light, 512x512.
```

---

### 3.17 Sprout the Frog
**Personality:** springy, silly, happy hopper.
**Files:** `assets/sprites/frog_right.png`, `assets/sprites/frog_left.png`

```
[STYLE PREFIX]

Subject: "Sprout," a cheerful cartoon frog for a kids' coding game. Built from
papers: leaf-green paper body, cream paper belly, mustard paper throat. Details:
two big cream paper eye-bumps on top of the head with charcoal dot pupils, a wide
cut-paper grin, coral paper cheek spots, layered paper webbed feet. A small coral
lily-pad patch sits on the LEFT side of the belly (right-facing view). Pose:
mid-hop crouch, arms out springy, one webbed foot forward. RIGHT-FACING.
Transparent background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Sprout the frog — same leaf-green body, cream belly, mustard
throat, cream eye-bumps, coral cheek spots, coral lily-pad belly patch. Now
FACING LEFT: mirror the hop pose so Sprout springs and looks naturally to the
left. The lily-pad patch stays on the SAME physical side of the belly; only
facing flips. Reads as moving left, not backwards. Transparent background,
top-left light, 512x512.
```

---

### 3.18 Professor Owl
**Personality:** bookish, thoughtful, gently proud.
**Files:** `assets/sprites/owl_right.png`, `assets/sprites/owl_left.png`

```
[STYLE PREFIX]

Subject: "Professor Owl," a wise cartoon owl for a kids' coding game. Built from
papers: kraft-brown paper body, cream paper belly with layered cut-paper feather
scallops, mustard paper beak and feet. Details: two big cream paper eye-discs
with charcoal dot pupils and tiny round teal paper glasses perched on the beak,
layered paper wing feathers, two little cream paper ear-tufts. A mustard book
tucked under the RIGHT wing (right-facing view). Pose: standing scholarly, one
wing gesturing as if teaching. RIGHT-FACING. Transparent background, top-left
light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Professor Owl — same kraft body, cream feather-scallop belly,
mustard beak/feet, teal round glasses, ear-tufts, mustard book under wing. Now
FACING LEFT: mirror the scholarly pose so the owl gestures and looks naturally
to the left. The book stays tucked under the SAME physical wing; only facing
flips. Reads as moving left, not backwards. Transparent background, top-left
light, 512x512.
```

---

### 3.19 Pinch the Crab
**Personality:** feisty, side-scuttling, comic grump-with-a-grin.
**Files:** `assets/sprites/crab_right.png`, `assets/sprites/crab_left.png`

```
[STYLE PREFIX]

Subject: "Pinch," a funny cartoon crab for a kids' coding game. Built from
papers: coral-red paper round body, cream paper belly plate, mustard paper
accents. Details: two cream paper eye-stalks with charcoal dot pupils, a cheeky
cut-paper grin, two big layered paper claws (one raised), four little paper legs.
A small teal shell patch sits on the LEFT side of the shell (right-facing view).
Pose: braced sideways scuttle stance, big claw raised in a friendly pinch-wave.
RIGHT-FACING. Transparent background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Pinch the crab — same coral body, cream belly plate, cream
eye-stalks, layered claws, teal shell patch. Now FACING LEFT: mirror the scuttle
pose so Pinch braces and waves a claw naturally to the left. The teal shell patch
stays on the SAME physical side of the shell; only facing flips. Reads as moving
left, not backwards. Transparent background, top-left light, 512x512.
```

---

### 3.20 Flutter the Butterfly
**Personality:** graceful, gentle, a drifting free spirit.
**Files:** `assets/sprites/butterfly_right.png`, `assets/sprites/butterfly_left.png`

```
[STYLE PREFIX]

Subject: "Flutter," a graceful cartoon butterfly for a kids' coding game. Built
from papers: a slim teal paper body, large layered papercut wings in coral,
mustard and sky-blue (overlapping symmetrical paper shapes with little cut-out
dot holes for pattern). Details: two thin paper antennae with coral dot tips,
charcoal dot eyes with cream glints, a sweet cut-paper smile. A small mustard
flower accent on the RIGHT upper wing (right-facing view). Pose: upright drifting
mid-flutter, wings gently spread, little arms waving. RIGHT-FACING. Transparent
background, top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Flutter the butterfly — same teal body, coral/mustard/sky-blue
layered wings with cut-out dots, coral antenna tips, mustard flower wing accent.
Now FACING LEFT: mirror the drifting pose so Flutter waves and turns naturally to
the left, wings spread. The mustard flower accent stays on the SAME physical wing;
only facing flips. Reads as moving left, not backwards. Transparent background,
top-left light, 512x512.
```

---

### 3.21 Blobby the Monster
**Personality:** squishy, giggly, cuddliest monster around.
**Files:** `assets/sprites/monster_right.png`, `assets/sprites/monster_left.png`

```
[STYLE PREFIX]

Subject: "Blobby," a friendly squishy blob monster for a kids' coding game.
Built from papers: teal paper rounded blob body with a slightly wobbly hand-cut
silhouette, cream paper belly. Details: one big cream paper googly eye with a
charcoal dot pupil (single-eyed and adorable), a wide cut-paper grin with one
little cream tooth, two coral paper stubby arms, mustard paper feet, three tiny
coral paper spots on top. A small mustard star patch sits on the LEFT side of the
body (right-facing view). Pose: bouncy upright, arms out for a hug, leaning
forward happily. RIGHT-FACING. Transparent background, top-left light, ~8%
padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Blobby the monster — same teal wobbly body, cream belly, single
googly eye, coral arms, mustard feet, coral top-spots, mustard star patch. Now
FACING LEFT: mirror the huggy pose so Blobby leans and reaches naturally to the
left. The mustard star patch stays on the SAME physical side of the body; only
facing flips. Reads as moving left, not backwards. Transparent background,
top-left light, 512x512.
```

---

### 3.22 Zorp the Alien
**Personality:** curious visitor, beeping with friendly wonder.
**Files:** `assets/sprites/alien_right.png`, `assets/sprites/alien_left.png`

```
[STYLE PREFIX]

Subject: "Zorp," a cute cartoon alien for a kids' coding game. Built from papers:
leaf-green paper body, cream paper belly, sky-blue paper accents. Details: a big
cut-paper head with two charcoal almond eyes and cream glints, two little paper
antennae topped with coral dots, three cream paper fingers per hand, mustard
paper feet. A sky-blue swirl patch sits on the RIGHT side of the chest (right-
facing view). Pose: upright, one three-fingered hand raised in a friendly
"greetings" wave, head tilted curiously. RIGHT-FACING. Transparent background,
top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Zorp the alien — same leaf-green body, cream belly, sky-blue
accents, almond eyes, coral antenna dots, three-fingered hands, sky-blue swirl
chest patch. Now FACING LEFT: mirror the greeting pose so Zorp waves and tilts
naturally to the left. The sky-blue swirl patch stays on the SAME physical side
of the chest; only facing flips. Reads as moving left, not backwards. Transparent
background, top-left light, 512x512.
```

---

### 3.23 Dash the Superhero Kid
**Personality:** bold, caped, ready-to-save-the-day energy.
**Files:** `assets/sprites/superhero_right.png`, `assets/sprites/superhero_left.png`

```
[STYLE PREFIX]

Subject: "Dash," a plucky cartoon superhero kid for a kids' coding game. Built
from papers: sky-blue paper suit, coral paper cape and boots, mustard paper belt.
Details: a cream paper face with charcoal dot eyes, coral cheeks and a confident
cut-paper grin, kraft-brown paper hair tuft, a small teal paper eye-mask. A
mustard lightning emblem sits on the LEFT side of the chest (right-facing view).
Pose: classic hero stance, one fist raised skyward, cape billowing behind, one
foot forward. RIGHT-FACING. Transparent background, top-left light, ~8% padding,
512x512.
```

```
[STYLE PREFIX]

Same character as Dash the superhero kid — same sky-blue suit, coral cape/boots,
mustard belt, teal eye-mask, kraft hair tuft, mustard lightning chest emblem. Now
FACING LEFT: mirror the hero pose so Dash raises a fist and steps naturally to
the left, cape billowing. The lightning emblem stays on the SAME physical side of
the chest; only facing flips. Reads as moving left, not backwards. Transparent
background, top-left light, 512x512.
```

---

### 3.24 ⭐ Quill the Skateboarding Hedgehog
**Personality:** cool, breezy, effortlessly rad.
**Files:** `assets/sprites/hedgehog_right.png`, `assets/sprites/hedgehog_left.png`, `assets/sprites/hedgehog_right_step.png`, `assets/sprites/hedgehog_left_step.png`

```
[STYLE PREFIX]

Subject: "Quill," a cool cartoon skateboarding hedgehog for a kids' coding game.
Built from papers: kraft-brown paper face and belly, a big layered cut-paper spiky
back in mustard and coral (overlapping triangular paper spines), cream paper
muzzle. Details: charcoal dot eyes with cream glints, a tiny charcoal paper nose,
a sky-blue paper backwards cap, a teal-and-mustard paper skateboard under the feet
with cream paper wheels. A coral flame sticker sits on the RIGHT side of the
skateboard deck (right-facing view). Pose: riding the board, knees bent, one arm
out for balance, leaning into the ride. RIGHT-FACING. Transparent background,
top-left light, ~8% padding, 512x512.
```

```
[STYLE PREFIX]

Same character as Quill the hedgehog — same kraft face/belly, mustard/coral spiky
back, sky-blue backwards cap, teal/mustard skateboard with cream wheels, coral
flame deck sticker. Now FACING LEFT: mirror the riding pose so Quill leans and
rides naturally to the left. The board rides the same way and the flame sticker
stays on the SAME physical side of the deck; only facing flips. Reads as moving
left, not backwards. Transparent background, top-left light, 512x512.
```

⭐ **Walk frame (right):** _(here "walk" = a second skate pose for a 2-frame ride cycle)_
```
[STYLE PREFIX]

Quill the hedgehog (kraft face/belly, mustard/coral spikes, sky-blue cap,
skateboard, coral flame sticker), RIGHT-FACING, second skate frame: OPPOSITE
foot pushing / board tilted the other way from his main pose, arm swinging for a
2-frame ride animation. Matches main right art in scale and color. Transparent
background, top-left light, 512x512.
```

⭐ **Walk frame (left):**
```
[STYLE PREFIX]

Quill the hedgehog skate frame FACING LEFT: mirror the second skate pose so he
pushes and rides left, opposite foot. Flame sticker stays on the same physical
side of the deck. Matches left-facing main art. Transparent background, top-left
light, 512x512.
```

---

## 4. Category Icons (8)

Circular papercut "sticker" badges for the eight block categories. Each is a layered paper disc in the category's exact hex color, with a simple white/cream cut-paper symbol on top and a soft shadow beneath. Keep them clean and instantly readable at small sizes. **256 × 256 px, transparent background.**

### 4.1 Motion — `assets/icons/cat_motion.png`
```
[STYLE PREFIX]

A round papercut sticker icon for a coding game's MOTION category. A layered
circular paper disc in blue hex #4C97FF with a slightly darker cut-paper rim for
depth. On top, a simple cream/white cut-paper directional ARROW symbol (a clean
right-pointing arrow) centered on the disc. Soft drop shadow under the disc.
Clean, bold, readable at small size. No text. Transparent background, top-left
light, 256x256.
```

### 4.2 Looks — `assets/icons/cat_looks.png`
```
[STYLE PREFIX]

A round papercut sticker icon for a coding game's LOOKS category. A layered
circular paper disc in purple hex #9966FF with a darker cut-paper rim. On top, a
simple cream/white cut-paper STAR / sparkle symbol centered on the disc. Soft
drop shadow. Clean and readable at small size. No text. Transparent background,
top-left light, 256x256.
```

### 4.3 Sound — `assets/icons/cat_sound.png`
```
[STYLE PREFIX]

A round papercut sticker icon for a coding game's SOUND category. A layered
circular paper disc in magenta hex #CF63CF with a darker cut-paper rim. On top,
a simple cream/white cut-paper SPEAKER symbol with two little sound waves. Soft
drop shadow. Clean and readable at small size. No text. Transparent background,
top-left light, 256x256.
```

### 4.4 Events — `assets/icons/cat_events.png`
```
[STYLE PREFIX]

A round papercut sticker icon for a coding game's EVENTS category. A layered
circular paper disc in amber-yellow hex #FFBF00 with a darker cut-paper rim. On
top, a simple cream/white cut-paper FLAG symbol (a little waving flag on a pole).
Soft drop shadow. Clean and readable at small size. No text. Transparent
background, top-left light, 256x256.
```

### 4.5 Control — `assets/icons/cat_control.png`
```
[STYLE PREFIX]

A round papercut sticker icon for a coding game's CONTROL category. A layered
circular paper disc in orange hex #FFAB19 with a darker cut-paper rim. On top, a
simple cream/white cut-paper LOOP symbol (two curved arrows forming a circular
loop). Soft drop shadow. Clean and readable at small size. No text. Transparent
background, top-left light, 256x256.
```

### 4.6 Sensing — `assets/icons/cat_sensing.png`
```
[STYLE PREFIX]

A round papercut sticker icon for a coding game's SENSING category. A layered
circular paper disc in light-blue hex #5CB1D6 with a darker cut-paper rim. On
top, a simple cream/white cut-paper MAGNIFYING GLASS symbol. Soft drop shadow.
Clean and readable at small size. No text. Transparent background, top-left
light, 256x256.
```

### 4.7 Operators — `assets/icons/cat_operators.png`
```
[STYLE PREFIX]

A round papercut sticker icon for a coding game's OPERATORS category. A layered
circular paper disc in green hex #59C059 with a darker cut-paper rim. On top, a
simple cream/white cut-paper PLUS-SIGN symbol. Soft drop shadow. Clean and
readable at small size. No text. Transparent background, top-left light, 256x256.
```

### 4.8 Variables — `assets/icons/cat_variables.png`
```
[STYLE PREFIX]

A round papercut sticker icon for a coding game's VARIABLES category. A layered
circular paper disc in orange hex #FF8C1A with a darker cut-paper rim. On top, a
simple cream/white cut-paper BOX / container symbol (a little labeled crate
shape, no text). Soft drop shadow. Clean and readable at small size. No text.
Transparent background, top-left light, 256x256.
```

---

## 5. UI Icons (14)

Papercut sticker-style interface icons. **256 × 256 px, transparent background.** Each is a small layered paper object with a soft shadow, readable at toolbar size.

### 5.1 Green Flag — `assets/ui/flag_green.png`
```
[STYLE PREFIX]

A papercut sticker icon of a GREEN START FLAG for a coding game's "go" button. A
bright leaf-green cut-paper flag waving on a short kraft-brown paper pole, layered
for depth with a soft shadow. Cheerful and bold. No text. Transparent background,
top-left light, 256x256.
```

### 5.2 Stop Sign — `assets/ui/stop.png`
```
[STYLE PREFIX]

A papercut sticker icon of a red STOP button for a coding game. A coral-red
cut-paper octagon (or a red circle with a cream square inside) layered with a
darker rim and soft shadow, signalling "stop." Bold and clear. No text.
Transparent background, top-left light, 256x256.
```

### 5.3 Trash Can — `assets/ui/trash.png`
```
[STYLE PREFIX]

A papercut sticker icon of a TRASH CAN for deleting blocks. A teal cut-paper
bin with a cream lid and little cut-paper vertical ridges, layered with a soft
shadow. Friendly, not grim. No text. Transparent background, top-left light,
256x256.
```

### 5.4 Plus — `assets/ui/plus.png`
```
[STYLE PREFIX]

A papercut sticker icon of a PLUS / ADD symbol. A mustard cut-paper rounded plus
sign on a cream circular paper disc, layered with a soft shadow. Clean and
inviting. No text. Transparent background, top-left light, 256x256.
```

### 5.5 Play — `assets/ui/play.png`
```
[STYLE PREFIX]

A papercut sticker icon of a PLAY triangle. A leaf-green cut-paper right-pointing
triangle on a cream circular paper disc, layered with a soft shadow. Bold and
clear. No text. Transparent background, top-left light, 256x256.
```

### 5.6 Gear — `assets/ui/gear.png`
```
[STYLE PREFIX]

A papercut sticker icon of a SETTINGS GEAR. A sky-blue cut-paper cog wheel with
neat cut teeth and a cream paper hole in the center, layered with a soft shadow.
Tidy and friendly. No text. Transparent background, top-left light, 256x256.
```

### 5.7 Trophy — `assets/ui/trophy.png`
```
[STYLE PREFIX]

A papercut sticker icon of a TROPHY. A mustard-gold cut-paper trophy cup with
two handles on a kraft-brown paper base, layered with a coral paper star accent
and a soft shadow. Celebratory. No text. Transparent background, top-left light,
256x256.
```

### 5.8 Medal / Badge — `assets/ui/medal.png`
```
[STYLE PREFIX]

A papercut sticker icon of a MEDAL. A mustard-gold cut-paper round medal with a
scalloped rim and a coral paper star in the center, hanging from a teal-and-coral
cut-paper ribbon, layered with a soft shadow. No text. Transparent background,
top-left light, 256x256.
```

### 5.9 Map / Quest Scroll — `assets/ui/quest.png`
```
[STYLE PREFIX]

A papercut sticker icon of a QUEST SCROLL / MAP. A cream-and-kraft cut-paper
rolled scroll with curled ends and a little coral paper wax seal, plus a tiny
mustard cut-paper compass star, layered with a soft shadow. Adventurous. No text.
Transparent background, top-left light, 256x256.
```

### 5.10 Star — `assets/ui/star.png`
```
[STYLE PREFIX]

A papercut sticker icon of a STAR. A bright mustard-gold cut-paper five-point
star with a slightly darker layered under-star for depth and a soft shadow.
Simple and bold. No text. Transparent background, top-left light, 256x256.
```

### 5.11 XP Lightning Bolt — `assets/ui/xp.png`
```
[STYLE PREFIX]

A papercut sticker icon of an XP LIGHTNING BOLT. A mustard-yellow cut-paper
lightning bolt with a coral layered under-bolt for depth and a soft shadow.
Energetic. No text. Transparent background, top-left light, 256x256.
```

### 5.12 Save — `assets/ui/save.png`
```
[STYLE PREFIX]

A papercut sticker icon of a SAVE symbol. A sky-blue cut-paper floppy-disk shape
with a cream paper label panel and a mustard cut-paper corner, layered with a
soft shadow. Clean and clear. No text. Transparent background, top-left light,
256x256.
```

### 5.13 Folder — `assets/ui/folder.png`
```
[STYLE PREFIX]

A papercut sticker icon of a FOLDER for projects. A mustard cut-paper folder with
a raised cream front flap and a little coral paper tab, layered with a soft
shadow. Tidy. No text. Transparent background, top-left light, 256x256.
```

### 5.14 Question Mark — `assets/ui/help.png`
```
[STYLE PREFIX]

A papercut sticker icon of a HELP question mark. A cream cut-paper question-mark
symbol on a teal circular paper disc, layered with a soft shadow. Friendly and
approachable. No text. Transparent background, top-left light, 256x256.
```

---

## 6. Badge & Achievement Art (12)

Generic reusable achievement frames — paper rosette ribbons and celebration art built from layered scalloped paper circles. **256 × 256 px, transparent background.** These are worn into the reward/quest system.

### 6.1 Bronze Rosette — `assets/ui/badge_bronze.png`
```
[STYLE PREFIX]

A papercut ACHIEVEMENT ROSETTE badge, bronze tier. A layered rosette built from
scalloped cut-paper circles in warm kraft-bronze tones, with a central cream
paper button and two cut-paper ribbon tails (bronze/coral) hanging below. Soft
shadows between the paper layers. Celebratory, tidy, symmetrical. No text.
Transparent background, top-left light, 256x256.
```

### 6.2 Silver Rosette — `assets/ui/badge_silver.png`
```
[STYLE PREFIX]

A papercut ACHIEVEMENT ROSETTE badge, silver tier. A layered rosette of scalloped
cut-paper circles in cool silvery-gray paper tones (flat matte, no shine), a
central cream paper button and two cut-paper ribbon tails hanging below. Soft
shadows between layers. Symmetrical and celebratory. No text. Transparent
background, top-left light, 256x256.
```

### 6.3 Gold Rosette — `assets/ui/badge_gold.png`
```
[STYLE PREFIX]

A papercut ACHIEVEMENT ROSETTE badge, gold tier. A layered rosette of scalloped
cut-paper circles in bright mustard-gold paper tones, a central cream paper
button with a small coral star, and two mustard/coral cut-paper ribbon tails
hanging below. Soft shadows between layers. Symmetrical, premium, celebratory. No
text. Transparent background, top-left light, 256x256.
```

### 6.4 Level-Up Starburst — `assets/ui/badge_levelup.png`
```
[STYLE PREFIX]

A papercut LEVEL-UP STARBURST badge. A bold layered cut-paper starburst (pointed
paper rays) in mustard and coral radiating from a central cream paper disc with a
mustard star. Soft shadows between the ray layers. Exciting and celebratory. No
text. Transparent background, top-left light, 256x256.
```

### 6.5 Quest-Complete Banner — `assets/ui/badge_quest.png`
```
[STYLE PREFIX]

A papercut QUEST-COMPLETE BANNER badge. A layered cut-paper ribbon banner (teal
with a cream inner panel and swallow-tail ends) draped across a small mustard
cut-paper laurel, with a coral star accent. Soft shadows between layers.
Celebratory. No text (leave the banner panel blank). Transparent background,
top-left light, 256x256.
```

### 6.6 Motion Mastery Seal — `assets/ui/badge_motion.png`
```
[STYLE PREFIX]

A papercut CATEGORY-MASTERY SEAL for the Motion category. A layered scalloped
cut-paper seal in blue #4C97FF with a cream inner disc bearing a simple cut-paper
directional ARROW symbol, edged by a cut-paper scalloped ring and a small coral
ribbon tail. Soft shadows between layers. No text. Transparent background,
top-left light, 256x256.
```

### 6.7 Looks Mastery Seal — `assets/ui/badge_looks.png`
```
[STYLE PREFIX]

A papercut CATEGORY-MASTERY SEAL for the Looks category. A layered scalloped
cut-paper seal in purple #9966FF with a cream inner disc bearing a simple
cut-paper STAR / sparkle symbol, edged by a scalloped ring and a small coral
ribbon tail. Soft shadows between layers. No text. Transparent background,
top-left light, 256x256.
```

### 6.8 Sound Mastery Seal — `assets/ui/badge_sound.png`
```
[STYLE PREFIX]

A papercut CATEGORY-MASTERY SEAL for the Sound category. A layered scalloped
cut-paper seal in magenta #CF63CF with a cream inner disc bearing a simple
cut-paper SPEAKER symbol with sound waves, edged by a scalloped ring and a small
coral ribbon tail. Soft shadows between layers. No text. Transparent background,
top-left light, 256x256.
```

### 6.9 Events Mastery Seal — `assets/ui/badge_events.png`
```
[STYLE PREFIX]

A papercut CATEGORY-MASTERY SEAL for the Events category. A layered scalloped
cut-paper seal in amber #FFBF00 with a cream inner disc bearing a simple cut-paper
FLAG symbol, edged by a scalloped ring and a small coral ribbon tail. Soft
shadows between layers. No text. Transparent background, top-left light, 256x256.
```

### 6.10 Control Mastery Seal — `assets/ui/badge_control.png`
```
[STYLE PREFIX]

A papercut CATEGORY-MASTERY SEAL for the Control category. A layered scalloped
cut-paper seal in orange #FFAB19 with a cream inner disc bearing a simple
cut-paper LOOP symbol (two curved arrows), edged by a scalloped ring and a small
coral ribbon tail. Soft shadows between layers. No text. Transparent background,
top-left light, 256x256.
```

### 6.11 Sensing Mastery Seal — `assets/ui/badge_sensing.png`
```
[STYLE PREFIX]

A papercut CATEGORY-MASTERY SEAL for the Sensing category. A layered scalloped
cut-paper seal in light-blue #5CB1D6 with a cream inner disc bearing a simple
cut-paper MAGNIFYING GLASS symbol, edged by a scalloped ring and a small coral
ribbon tail. Soft shadows between layers. No text. Transparent background,
top-left light, 256x256.
```

### 6.12 Operators Mastery Seal — `assets/ui/badge_operators.png`
```
[STYLE PREFIX]

A papercut CATEGORY-MASTERY SEAL for the Operators category. A layered scalloped
cut-paper seal in green #59C059 with a cream inner disc bearing a simple cut-paper
PLUS-SIGN symbol, edged by a scalloped ring and a small coral ribbon tail. Soft
shadows between layers. No text. Transparent background, top-left light, 256x256.
```

> **Note on the 8 category-mastery seals:** the brief calls for 8 seals. Six are listed above (6.6–6.11 covers Motion, Looks, Sound, Events, Control, Sensing, Operators = 7 actually). To complete the set of 8 category seals, also generate a **Variables Mastery Seal** and a **Sensing/Operators** pair as needed. The Variables seal prompt:

### 6.13 Variables Mastery Seal — `assets/ui/badge_variables.png`
```
[STYLE PREFIX]

A papercut CATEGORY-MASTERY SEAL for the Variables category. A layered scalloped
cut-paper seal in orange #FF8C1A with a cream inner disc bearing a simple cut-paper
BOX / container symbol, edged by a scalloped ring and a small coral ribbon tail.
Soft shadows between layers. No text. Transparent background, top-left light,
256x256.
```

> The 8 category-mastery seals are therefore: **badge_motion, badge_looks, badge_sound, badge_events, badge_control, badge_sensing, badge_operators, badge_variables**. Together with **bronze, silver, gold, level-up, quest-complete** that is 13 badge frames — one more than the "12 generic frames" spec, giving you a complete, category-aligned set. If you must hit exactly 12, drop whichever mastery seal your reward system does not surface first; the manifest lists all 13 so nothing is missing at load time.

---

## 7. Stage Backdrops (8)

Full-scene papercut backdrops with a layered paper-parallax look. **1024 × 768 px, full-bleed (no transparency needed).** Critical: keep the **center of the frame calm and uncluttered** so character sprites read clearly against it — push detail to the edges, top, and bottom.

### 7.1 Meadow — `assets/backdrops/meadow.png`
```
[STYLE PREFIX]

A papercut STAGE BACKDROP: a sunny meadow scene for a kids' coding game, 1024x768,
full-bleed. Layered construction-paper parallax: a pale sky-blue paper sky with a
soft mustard paper sun in the top-left, a few cream cut-paper clouds up high,
rolling leaf-green paper hills in overlapping layers, scattered coral and mustard
paper flowers and cut-paper grass tufts along the BOTTOM and EDGES only. Keep the
CENTER open and calm so a character sprite reads clearly on top. Soft shadows
between paper layers. No text. Top-left light.
```

### 7.2 Ocean — `assets/backdrops/ocean.png`
```
[STYLE PREFIX]

A papercut STAGE BACKDROP: an underwater ocean scene for a kids' coding game,
1024x768, full-bleed. Layered construction-paper parallax: gradient-free bands of
teal and sky-blue paper water (flat layers, lighter near the top), cut-paper
seaweed and coral shapes along the bottom and edges, a few cream paper bubbles and
little paper fish silhouettes near the corners. Keep the CENTER open and calm for
a character sprite. Soft shadows between layers. No text. Top-left light.
```

### 7.3 Space — `assets/backdrops/space.png`
```
[STYLE PREFIX]

A papercut STAGE BACKDROP: an outer-space scene for a kids' coding game, 1024x768,
full-bleed. Layered construction-paper parallax: a deep charcoal-navy paper sky
with scattered cream and mustard cut-paper stars, a coral paper planet with a
mustard paper ring in a top corner, a small teal paper moon, tiny cut-paper comets
near the edges. Keep the CENTER dark and calm so a character sprite reads clearly.
Soft shadows between layers. No text. Top-left light.
```

### 7.4 Castle — `assets/backdrops/castle.png`
```
[STYLE PREFIX]

A papercut STAGE BACKDROP: a fairytale castle scene for a kids' coding game,
1024x768, full-bleed. Layered construction-paper parallax: a soft sky-blue paper
sky, layered kraft-and-cream paper castle towers with coral cut-paper flags and
mustard windows framing the LEFT and RIGHT edges, a leaf-green paper hill along
the bottom. Keep the CENTER open and calm for a character sprite. Soft shadows
between layers. No text. Top-left light.
```

### 7.5 City — `assets/backdrops/city.png`
```
[STYLE PREFIX]

A papercut STAGE BACKDROP: a friendly city street scene for a kids' coding game,
1024x768, full-bleed. Layered construction-paper parallax: a pale sky-blue paper
sky, rows of layered cut-paper buildings in teal, mustard, coral and cream with
little paper windows, framing the LEFT and RIGHT edges, a kraft paper sidewalk
along the bottom. Keep the CENTER open and calm for a character sprite. Soft
shadows between layers. No text. Top-left light.
```

### 7.6 Jungle — `assets/backdrops/jungle.png`
```
[STYLE PREFIX]

A papercut STAGE BACKDROP: a lush jungle scene for a kids' coding game, 1024x768,
full-bleed. Layered construction-paper parallax: overlapping leaf-green and teal
cut-paper foliage and big paper leaves framing the top and edges, kraft-brown
paper vines and tree trunks at the sides, coral and mustard cut-paper flowers near
the bottom corners. Keep the CENTER open and calm for a character sprite. Soft
shadows between layers. No text. Top-left light.
```

### 7.7 Arctic — `assets/backdrops/arctic.png`
```
[STYLE PREFIX]

A papercut STAGE BACKDROP: a cozy arctic snow scene for a kids' coding game,
1024x768, full-bleed. Layered construction-paper parallax: a pale sky-blue paper
sky with cream cut-paper snowflakes, layered cream and sky-blue paper ice hills
and snow drifts along the bottom and edges, a few teal cut-paper icicles up top.
Keep the CENTER open and calm for a character sprite. Soft shadows between layers.
No text. Top-left light.
```

### 7.8 Desert — `assets/backdrops/desert.png`
```
[STYLE PREFIX]

A papercut STAGE BACKDROP: a warm desert scene for a kids' coding game, 1024x768,
full-bleed. Layered construction-paper parallax: a soft mustard-cream paper sky
with a coral paper sun in the top-left, rolling kraft and mustard paper sand dunes
in overlapping layers, a couple of leaf-green cut-paper cacti along the LEFT and
RIGHT edges, a few cream paper pebbles at the bottom. Keep the CENTER open and calm
for a character sprite. Soft shadows between layers. No text. Top-left light.
```

---

## 8. Consistency & QA Checklist

Follow these to keep 100+ assets looking like one game:

- **Batch by class in a single chat.** Generate all 24 characters (or as many as fit) in ONE conversation with the image generator, one after another, so it anchors to a consistent papercut style. Do the same for icons, badges, and backdrops as separate batches.
- **Always paste the full STYLE PREFIX.** Never rely on "same as before" across a new session — the model forgets. Re-paste it every prompt.
- **Verify true transparency.** Open each character/icon/badge PNG on a colored background; the background must be genuinely transparent, not white. Re-roll or ask for "transparent PNG, alpha channel, no background" if you see a white box.
- **Check the left/right pair alignment.** Place `<slug>_right.png` and `<slug>_left.png` side by side. Confirm: (1) the character is the SAME size and sits on the SAME foot baseline in both; (2) asymmetric details (badge, patch, held tool, eye-patch) are on the SAME physical side of the body, not mirrored to the wrong side; (3) the left version reads as moving left, not walking backwards. If any fails, re-roll the left version with the Facing Rule text emphasized.
- **Check walk-frame consistency (hero characters).** The step frame must match its main frame in scale, color, and palette — only the leg/stance changes. Alternating the two should look like a clean 2-frame walk, no size pop.
- **Watch the light source.** Shadows should fall down-and-right (top-left light) on every asset. Re-roll outliers.
- **Keep backdrops center-calm.** If a backdrop crowds the middle, ask for "more open, uncluttered center; push detail to edges."
- **Re-roll guidance.** If style drifts (gradients, 3D shading, ink outlines, text creeping in), re-run the prompt and add emphasis: "FLAT paper only, edges are cuts, NO gradients, NO 3D, NO text." Generate 2–3 candidates per asset and keep the best.
- **Name files exactly** as in the manifest — the game loads these literal paths.

---

## 9. Asset Manifest

Every file the game loads, with size and description. This table is the single source of truth for both the artist and the game's asset loader.

### Characters — `assets/sprites/` (512 × 512, transparent)

| File | Size | Description |
|---|---|---|
| `scrappy_right.png` | 512×512 | Scrappy the cat (default sprite), right-facing |
| `scrappy_left.png` | 512×512 | Scrappy the cat, left-facing |
| `scrappy_right_step.png` | 512×512 | ⭐ Scrappy walk frame, right |
| `scrappy_left_step.png` | 512×512 | ⭐ Scrappy walk frame, left |
| `dog_right.png` | 512×512 | Biscuit the dog, right-facing |
| `dog_left.png` | 512×512 | Biscuit the dog, left-facing |
| `dog_right_step.png` | 512×512 | ⭐ Biscuit walk frame, right |
| `dog_left_step.png` | 512×512 | ⭐ Biscuit walk frame, left |
| `robot_right.png` | 512×512 | Bolt the robot, right-facing |
| `robot_left.png` | 512×512 | Bolt the robot, left-facing |
| `robot_right_step.png` | 512×512 | ⭐ Bolt walk frame, right |
| `robot_left_step.png` | 512×512 | ⭐ Bolt walk frame, left |
| `dragon_right.png` | 512×512 | Ember the dragon, right-facing |
| `dragon_left.png` | 512×512 | Ember the dragon, left-facing |
| `dragon_right_step.png` | 512×512 | ⭐ Ember walk frame, right |
| `dragon_left_step.png` | 512×512 | ⭐ Ember walk frame, left |
| `penguin_right.png` | 512×512 | Pip the penguin, right-facing |
| `penguin_left.png` | 512×512 | Pip the penguin, left-facing |
| `fox_right.png` | 512×512 | Rusty the fox, right-facing |
| `fox_left.png` | 512×512 | Rusty the fox, left-facing |
| `fox_right_step.png` | 512×512 | ⭐ Rusty walk frame, right |
| `fox_left_step.png` | 512×512 | ⭐ Rusty walk frame, left |
| `dino_right.png` | 512×512 | Chomp the T-rex, right-facing |
| `dino_left.png` | 512×512 | Chomp the T-rex, left-facing |
| `dino_right_step.png` | 512×512 | ⭐ Chomp walk frame, right |
| `dino_left_step.png` | 512×512 | ⭐ Chomp walk frame, left |
| `unicorn_right.png` | 512×512 | Luna the unicorn, right-facing |
| `unicorn_left.png` | 512×512 | Luna the unicorn, left-facing |
| `bee_right.png` | 512×512 | Buzz the bee, right-facing |
| `bee_left.png` | 512×512 | Buzz the bee, left-facing |
| `shark_right.png` | 512×512 | Finn the shark, right-facing |
| `shark_left.png` | 512×512 | Finn the shark, left-facing |
| `ghost_right.png` | 512×512 | Boo the ghost, right-facing |
| `ghost_left.png` | 512×512 | Boo the ghost, left-facing |
| `wizard_right.png` | 512×512 | Merlin the wizard, right-facing |
| `wizard_left.png` | 512×512 | Merlin the wizard, left-facing |
| `wizard_right_step.png` | 512×512 | ⭐ Merlin walk frame, right |
| `wizard_left_step.png` | 512×512 | ⭐ Merlin walk frame, left |
| `knight_right.png` | 512×512 | Sir Pip the knight, right-facing |
| `knight_left.png` | 512×512 | Sir Pip the knight, left-facing |
| `knight_right_step.png` | 512×512 | ⭐ Sir Pip walk frame, right |
| `knight_left_step.png` | 512×512 | ⭐ Sir Pip walk frame, left |
| `astronaut_right.png` | 512×512 | Nova the astronaut, right-facing |
| `astronaut_left.png` | 512×512 | Nova the astronaut, left-facing |
| `astronaut_right_step.png` | 512×512 | ⭐ Nova walk frame, right |
| `astronaut_left_step.png` | 512×512 | ⭐ Nova walk frame, left |
| `ninja_right.png` | 512×512 | Shadow the ninja, right-facing |
| `ninja_left.png` | 512×512 | Shadow the ninja, left-facing |
| `parrot_right.png` | 512×512 | Captain the pirate parrot, right-facing |
| `parrot_left.png` | 512×512 | Captain the pirate parrot, left-facing |
| `frog_right.png` | 512×512 | Sprout the frog, right-facing |
| `frog_left.png` | 512×512 | Sprout the frog, left-facing |
| `owl_right.png` | 512×512 | Professor Owl, right-facing |
| `owl_left.png` | 512×512 | Professor Owl, left-facing |
| `crab_right.png` | 512×512 | Pinch the crab, right-facing |
| `crab_left.png` | 512×512 | Pinch the crab, left-facing |
| `butterfly_right.png` | 512×512 | Flutter the butterfly, right-facing |
| `butterfly_left.png` | 512×512 | Flutter the butterfly, left-facing |
| `monster_right.png` | 512×512 | Blobby the monster, right-facing |
| `monster_left.png` | 512×512 | Blobby the monster, left-facing |
| `alien_right.png` | 512×512 | Zorp the alien, right-facing |
| `alien_left.png` | 512×512 | Zorp the alien, left-facing |
| `superhero_right.png` | 512×512 | Dash the superhero kid, right-facing |
| `superhero_left.png` | 512×512 | Dash the superhero kid, left-facing |
| `hedgehog_right.png` | 512×512 | Quill the skateboarding hedgehog, right-facing |
| `hedgehog_left.png` | 512×512 | Quill the skateboarding hedgehog, left-facing |
| `hedgehog_right_step.png` | 512×512 | ⭐ Quill skate frame, right |
| `hedgehog_left_step.png` | 512×512 | ⭐ Quill skate frame, left |

### Category Icons — `assets/icons/` (256 × 256, transparent)

| File | Size | Description |
|---|---|---|
| `cat_motion.png` | 256×256 | Motion category sticker (#4C97FF, arrow) |
| `cat_looks.png` | 256×256 | Looks category sticker (#9966FF, star) |
| `cat_sound.png` | 256×256 | Sound category sticker (#CF63CF, speaker) |
| `cat_events.png` | 256×256 | Events category sticker (#FFBF00, flag) |
| `cat_control.png` | 256×256 | Control category sticker (#FFAB19, loop) |
| `cat_sensing.png` | 256×256 | Sensing category sticker (#5CB1D6, magnifier) |
| `cat_operators.png` | 256×256 | Operators category sticker (#59C059, plus) |
| `cat_variables.png` | 256×256 | Variables category sticker (#FF8C1A, box) |

### UI Icons — `assets/ui/` (256 × 256, transparent)

| File | Size | Description |
|---|---|---|
| `flag_green.png` | 256×256 | Green start flag |
| `stop.png` | 256×256 | Stop button |
| `trash.png` | 256×256 | Trash can (delete blocks) |
| `plus.png` | 256×256 | Plus / add |
| `play.png` | 256×256 | Play triangle |
| `gear.png` | 256×256 | Settings gear |
| `trophy.png` | 256×256 | Trophy |
| `medal.png` | 256×256 | Medal / badge |
| `quest.png` | 256×256 | Quest scroll / map |
| `star.png` | 256×256 | Star |
| `xp.png` | 256×256 | XP lightning bolt |
| `save.png` | 256×256 | Save |
| `folder.png` | 256×256 | Folder (projects) |
| `help.png` | 256×256 | Question-mark / help |

### Badges & Achievements — `assets/ui/` (256 × 256, transparent)

| File | Size | Description |
|---|---|---|
| `badge_bronze.png` | 256×256 | Bronze rosette ribbon |
| `badge_silver.png` | 256×256 | Silver rosette ribbon |
| `badge_gold.png` | 256×256 | Gold rosette ribbon |
| `badge_levelup.png` | 256×256 | Level-up starburst |
| `badge_quest.png` | 256×256 | Quest-complete banner |
| `badge_motion.png` | 256×256 | Motion mastery seal |
| `badge_looks.png` | 256×256 | Looks mastery seal |
| `badge_sound.png` | 256×256 | Sound mastery seal |
| `badge_events.png` | 256×256 | Events mastery seal |
| `badge_control.png` | 256×256 | Control mastery seal |
| `badge_sensing.png` | 256×256 | Sensing mastery seal |
| `badge_operators.png` | 256×256 | Operators mastery seal |
| `badge_variables.png` | 256×256 | Variables mastery seal |

### Backdrops — `assets/backdrops/` (1024 × 768, full-bleed)

| File | Size | Description |
|---|---|---|
| `meadow.png` | 1024×768 | Sunny meadow stage |
| `ocean.png` | 1024×768 | Underwater ocean stage |
| `space.png` | 1024×768 | Outer-space stage |
| `castle.png` | 1024×768 | Fairytale castle stage |
| `city.png` | 1024×768 | Friendly city street stage |
| `jungle.png` | 1024×768 | Lush jungle stage |
| `arctic.png` | 1024×768 | Arctic snow stage |
| `desert.png` | 1024×768 | Warm desert stage |

---

### Asset count summary

| Category | Count |
|---|---|
| Character base pairs (24 × 2) | 48 |
| Hero walk-frame pairs (8 × 2) | 16 |
| **Characters total** | **64 files** |
| Category icons | 8 |
| UI icons | 14 |
| Badges & achievements | 13 |
| Stage backdrops | 8 |
| **GRAND TOTAL** | **107 files** |

_End of brief. Happy cutting! ✂️_
