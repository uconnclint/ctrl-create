# Ctrl+Create — Themed Art Expansion Packs

**A self-contained, copy-paste-ready brief for generating six new packs of papercut art** for _Ctrl+Create_, in the **exact same layered construction-paper style** as the existing assets. Feed this whole file (or one pack at a time) to Codex / an image generator.

Six packs, each with **characters + backdrops + props**:

| Pack | Characters | Backdrops | Props |
|---|---|---|---|
| 🏅 Sports | 6 | 3 | 4 |
| 🚀 Space | 6 | 3 | 4 |
| 🏰 Old Times | 6 | 3 | 4 |
| 🏙️ Town & City | 6 | 3 | 4 |
| 🎉 Holidays | 6 | 3 | 4 |
| 🦕 Prehistoric | 6 | 3 | 4 |

**Totals:** 36 characters + 24 props = 60 sprites (× 2 facings = **120 sprite images**) plus **18 backdrops** = **138 new images**.

---

## 0. How to use this brief

1. Read **§1 Style** and **§2 Tech + Facing Rule** once.
2. For every prompt, paste the full **STYLE PREFIX** (below) where it says `[STYLE PREFIX]`, then the specifics.
3. Generate each character **twice** — a right-facing and a left-facing version — using the **Left-Facing Template** in §2. This is not optional; the game needs both.
4. Save every file to the exact path in its row (paths listed per asset and collected in the **Manifest**, §9).
5. Wire new assets into the game — see **§8 Drop-in wiring** (two tiny edits in `js/engine/stage.js`).

---

## 1. Style — the STYLE PREFIX (prepend to EVERY prompt)

> This is copied verbatim from the game's original art brief. Do not alter it — it is what keeps every pack visually identical to the existing sprites.

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

**Palette anchors:** cream `#F7F0E1`, kraft `#C89B6B`, coral `#FF6F61`, teal `#2FB4A6`, mustard `#F2B134`, sky `#7EC8E3`, leaf `#6FBF73`, charcoal `#3A3A3A` (eyes/accents). Characters may use other colors but keep everything in the **matte paper** family — flat, warm, slightly desaturated like real construction paper.

---

## 2. Technical requirements + the Facing Rule

| Requirement | Spec |
|---|---|
| Format | **PNG with real alpha transparency** (transparent background, not white) |
| Characters & props | **512 × 512 px** |
| Backdrops | **1024 × 768 px** (full-bleed art, no transparency) |
| Light source | Consistent **top-left** everywhere (shadows fall down-right) |
| Character framing | Centered, full body, ~**8% padding**; feet share a baseline between the right & left versions |
| Facing | Every character AND prop ships **right-facing + left-facing** |

> ### ⚠️ THE FACING RULE — governs every sprite
> The game flips between a right image and a left image as a sprite moves. The left version is **NOT** a naive horizontal mirror — a plain flip throws asymmetric details (a held racket, a badge, a leading foot) to the wrong side and makes the character look like it's **walking backwards**.
>
> **Left-Facing Template** — append this to any character's right-prompt to make its left pair:
>
> ```
> Same character, same style and colors, now FACING LEFT — mirror the POSE so
> the character walks and looks naturally to the left. Any asymmetric detail
> (item held in a hand, badge, patch, leading foot, gaze) stays on the SAME
> physical side of the character's body; only the facing direction flips. It
> must read as confidently moving LEFT, never walking backwards. Keep the feet
> on the exact same baseline as the right-facing version.
> ```
>
> **Symmetric props** (a ball, a planet, a gift box): the left version can simply be the mirror of the right — still export both files so the loader always has one.

---

## 3. 🏅 SPORTS PACK

### Characters (`assets/sprites/<slug>_right.png` + `_left.png`)

**`soccer_star`** — "Striker", a confident kid mid-kick.
```
[STYLE PREFIX] A cheerful child soccer player made of layered cut paper,
facing right, mid-kick with one leg swung forward toward a ball. Coral-and-cream
striped jersey, teal shorts, little paper cleats, round happy face with charcoal
dot eyes. Dynamic action pose, layered paper limbs with soft shadows between
layers. Centered, ~8% padding, transparent background, 512x512.
```

**`hoops_ace`** — "Swish", dribbling a basketball.
```
[STYLE PREFIX] A kid basketball player of cut paper, facing right, dribbling a
mustard-orange paper basketball with one hand low. Teal jersey with cream trim,
knee-high paper socks, mid-stride. Friendly face, charcoal dot eyes. Centered,
~8% padding, transparent background, 512x512.
```

**`tennis_pro`** — "Ace", racket raised for a swing.
```
[STYLE PREFIX] A child tennis player of layered paper, facing right, holding a
paper tennis racket up in the right hand ready to swing, a tiny mustard ball in
the air. Cream polo, coral visor, white paper skirt/shorts. Bright, energetic.
Centered, ~8% padding, transparent background, 512x512.
```

**`boxing_roo`** — "Rocky", a friendly boxing kangaroo. ⭐ consider a walk pair.
```
[STYLE PREFIX] A friendly cartoon kangaroo boxer built from kraft-brown cut
paper, facing right, standing upright with two big coral paper boxing gloves
raised playfully (not aggressive). Cream belly patch, little pouch, big soft
eyes, cheerful. Centered, ~8% padding, transparent background, 512x512.
```

**`skate_kid`** — "Ollie", riding a skateboard.
```
[STYLE PREFIX] A kid skateboarder of cut paper, facing right, knees bent riding
a paper skateboard with mustard wheels, arms out for balance. Teal hoodie, coral
beanie, cream sneakers. Layered paper, soft between-layer shadows. Centered on
the board, ~8% padding, transparent background, 512x512.
```

**`gymnast_kid`** — "Tumble", arms up in a finish pose.
```
[STYLE PREFIX] A young gymnast of layered paper, facing right, arms raised in a
triumphant finish pose on tiptoe, a flowing coral paper ribbon curling from one
hand. Teal leotard, cream limbs, happy face. Graceful, tidy silhouette.
Centered, ~8% padding, transparent background, 512x512.
```

### Backdrops (`assets/backdrops/<name>.png`, 1024×768)

**`stadium`**
```
[STYLE PREFIX] A sunny outdoor sports stadium scene, layered cut-paper: a leaf-
green paper pitch with cream boundary lines in the foreground, tiered paper
grandstands with rows of tiny colorful paper spectators behind, a sky-blue paper
sky with a few soft cream clouds and a bright mustard sun top-left. Calm, open
center so a sprite reads clearly against it. Full-bleed, 1024x768.
```

**`gym_court`**
```
[STYLE PREFIX] An indoor basketball gymnasium in layered paper: warm kraft-brown
wooden floor with cream court lines, a paper hoop and backboard on the right, a
back wall of soft teal with paper banners (no text), warm overhead light from
top-left. Uncluttered center. Full-bleed, 1024x768.
```

**`race_track`**
```
[STYLE PREFIX] A running / race track in layered paper: coral-red oval track
lanes with cream lane lines sweeping through the foreground, a strip of leaf-
green infield, sky-blue paper sky with soft clouds. Bright and clean, open
center. Full-bleed, 1024x768.
```

### Props (`assets/sprites/<slug>_right.png` + `_left.png`, symmetric — left = mirror)

- **`soccer_ball`** — `[STYLE PREFIX] A single soccer ball made of cut cream and charcoal paper pentagons, flat and matte, soft drop shadow. Centered, transparent, 512x512.`
- **`basketball`** — `[STYLE PREFIX] A mustard-orange paper basketball with charcoal seam lines, flat matte paper, soft shadow. Centered, transparent, 512x512.`
- **`trophy_cup`** — `[STYLE PREFIX] A gold-mustard paper trophy cup with two handles on a kraft-brown base, layered paper, soft shadow. Centered, transparent, 512x512.`
- **`goal_net`** — `[STYLE PREFIX] A small soccer goal with cream paper posts and a criss-cross paper net, facing right at a slight angle, layered paper. Centered, transparent, 512x512.`

---

## 4. 🚀 SPACE PACK

### Characters

**`astro_pup`** — "Comet", a puppy in a spacesuit. ⭐ walk pair recommended.
```
[STYLE PREFIX] An adorable puppy astronaut of layered cut paper, facing right,
walking in a cream paper spacesuit with a teal-rimmed round helmet (paper glare
shape, no gloss), a little coral backpack. Kraft-brown paper ears poking the
helmet shape, happy dot eyes. Centered, ~8% padding, transparent, 512x512.
```

**`rover_bot`** — "Sprocket", a cute wheeled space robot.
```
[STYLE PREFIX] A friendly little space rover robot built from cut paper, facing
right, a boxy teal paper body on three mustard paper wheels, a small periscope
neck with a single round charcoal camera-eye, a coral antenna. Curious, cheerful.
Centered, ~8% padding, transparent, 512x512.
```

**`martian`** — "Blip", a friendly little alien (distinct from existing Zorp).
```
[STYLE PREFIX] A friendly small martian of layered paper, facing right, round
teal body, three stubby legs mid-step, two curly antennae with mustard tips, one
big charcoal-and-cream eye, tiny waving arm. Whimsical, kind. Centered, ~8%
padding, transparent, 512x512.
```

**`star_captain`** — "Nova Jr.", a kid space captain.
```
[STYLE PREFIX] A child space captain of cut paper, facing right, striding
confidently in a coral paper flight suit with a cream sash and a mustard star
badge on the chest, teal boots. Brave, friendly grin. Centered, ~8% padding,
transparent, 512x512.
```

**`moon_bunny`** — "Luna", a bunny in a bubble helmet.
```
[STYLE PREFIX] A soft cream paper bunny hopping right, wearing a round clear-
paper bubble helmet and a tiny teal jetpack puffing a small coral paper flame.
Long paper ears folded inside the helmet shape, sweet face. Centered, ~8%
padding, transparent, 512x512.
```

**`comet_cat`** — "Ziggy", a cat riding a shooting star.
```
[STYLE PREFIX] A playful paper cat facing right, curled riding on a mustard-
yellow paper shooting star with a trailing cream-and-coral paper tail of sparks.
Teal collar, delighted face. Layered paper, soft shadows. Centered, ~8% padding,
transparent, 512x512.
```

### Backdrops

**`moon_base`**
```
[STYLE PREFIX] A moon surface scene in layered paper: pale cream-grey cratered
ground with soft round paper craters in the foreground, a small teal paper dome
habitat to one side, a deep navy-blue paper sky full of tiny cream paper stars
and a large soft Earth as a blue-and-green paper circle high in the corner.
Calm, open center. Full-bleed, 1024x768.
```

**`mars_surface`**
```
[STYLE PREFIX] A Mars landscape in layered paper: rusty coral-red dusty ground
with paper rocks and low mesas, a dusty peach paper sky, two tiny paper moons,
a distant paper rover silhouette. Warm red-orange palette, uncluttered center.
Full-bleed, 1024x768.
```

**`starfield`**
```
[STYLE PREFIX] Deep space in layered paper: a rich navy-and-indigo paper sky
filled with scattered cream and mustard paper stars of varying sizes, a soft
teal-and-coral paper nebula cloud drifting across, a couple of tiny ringed
paper planets. Dreamy, calm center. Full-bleed, 1024x768.
```

### Props (symmetric where noted)

- **`rocket_ship`** — `[STYLE PREFIX] A classic paper rocket, facing/pointing up-right, cream body with a coral nose cone and teal fins, a mustard paper flame at the base. Layered paper, soft shadow. Centered, transparent, 512x512.`
- **`planet_saturn`** — `[STYLE PREFIX] A cute ringed planet of cut paper, a mustard sphere with a tilted teal-and-cream paper ring, soft shadow. Symmetric. Centered, transparent, 512x512.`
- **`ufo`** — `[STYLE PREFIX] A friendly flying saucer of layered paper, a teal dome on a cream disc with mustard paper lights around the rim, facing right at a slight tilt. Centered, transparent, 512x512.`
- **`moon_rock`** — `[STYLE PREFIX] A small grey-cream paper moon rock / meteor with soft crater dents, matte paper, soft shadow. Symmetric. Centered, transparent, 512x512.`

---

## 5. 🏰 OLD TIMES PACK

### Characters

**`pirate_captain`** — "Salty", a jolly pirate. ⭐ walk pair recommended.
```
[STYLE PREFIX] A jolly cartoon pirate captain of layered cut paper, facing
right, walking with a coral paper coat, cream shirt, a kraft-brown tricorne hat,
a little charcoal eye patch, one paper hook hand held up cheerfully. Friendly,
not scary. Centered, ~8% padding, transparent, 512x512.
```

**`cowboy`** — "Tex", a friendly cowboy.
```
[STYLE PREFIX] A friendly cowboy kid of cut paper, facing right, mid-stride in a
kraft-brown paper hat, teal bandana, cream shirt, coral paper vest, little paper
boots, a coiled mustard lasso in one hand. Warm and cheerful. Centered, ~8%
padding, transparent, 512x512.
```

**`viking`** — "Bjorn", a cute viking.
```
[STYLE PREFIX] A cute chubby viking of layered paper, facing right, kraft-brown
tunic, a cream fur collar, a mustard paper helmet with two rounded paper horns,
a small round teal paper shield on one arm, big braided coral beard. Jolly.
Centered, ~8% padding, transparent, 512x512.
```

**`pharaoh`** — "Tut", a young pharaoh.
```
[STYLE PREFIX] A young Egyptian pharaoh of cut paper, facing right, striding in
a cream kilt with a teal-and-mustard striped paper headdress (nemes), a coral
broad collar, a small paper crook held across the chest. Regal, friendly.
Centered, ~8% padding, transparent, 512x512.
```

**`roman_gladiator`** — "Max", a small gladiator.
```
[STYLE PREFIX] A small friendly Roman gladiator of layered paper, facing right,
cream tunic with kraft-brown leather straps, a mustard paper helmet with a coral
crest, a round teal shield and a stubby wooden paper sword held low. Brave, cute.
Centered, ~8% padding, transparent, 512x512.
```

**`princess`** — "Rose", a medieval princess.
```
[STYLE PREFIX] A medieval princess of cut paper, facing right, a flowing coral-
and-cream layered paper gown, a mustard paper crown, long paper hair, hands
clasped happily. Gentle, storybook. Feet hidden by gown but baseline consistent.
Centered, ~8% padding, transparent, 512x512.
```

### Backdrops

**`pirate_cove`**
```
[STYLE PREFIX] A sunny pirate cove in layered paper: a cream sandy beach
foreground with a kraft-brown paper treasure chest hint, teal ocean water, a
paper pirate ship anchored in the bay, palm-fern paper trees framing the sides,
sky-blue paper sky. Open center. Full-bleed, 1024x768.
```

**`wild_west`**
```
[STYLE PREFIX] A wild-west main street in layered paper: warm kraft-brown dusty
road, cream-and-coral paper saloon and shopfront facades along the sides (no
text on signs), a paper cactus, a peach desert paper sky with a big soft mustard
sun. Uncluttered center. Full-bleed, 1024x768.
```

**`throne_room`**
```
[STYLE PREFIX] A castle throne room in layered paper: a kraft-brown stone paper
floor with a coral carpet runner leading to a mustard-and-teal paper throne on a
low dais, tall cream paper columns and arched windows on the sides, warm light
from top-left. Calm, open center. Full-bleed, 1024x768.
```

### Props

- **`treasure_chest`** — `[STYLE PREFIX] An open kraft-brown paper treasure chest spilling mustard-gold paper coins and a teal gem, layered paper, soft shadow. Centered, transparent, 512x512.`
- **`pirate_ship`** — `[STYLE PREFIX] A small cartoon pirate ship of cut paper, facing right, kraft-brown hull, cream sails on paper masts, a coral pennant. Layered paper. Centered, transparent, 512x512.`
- **`campfire`** — `[STYLE PREFIX] A little campfire of cut paper, kraft-brown crossed logs with layered coral-mustard paper flames, symmetric, soft glow shadow. Centered, transparent, 512x512.`
- **`cannon`** — `[STYLE PREFIX] A small charcoal-grey paper cannon on a kraft-brown wooden carriage with paper wheels, facing right, a tiny cream paper smoke puff at the muzzle. Centered, transparent, 512x512.`

---

## 6. 🏙️ TOWN & CITY PACK

### Characters (community helpers)

**`police_officer`** — "Officer Pat".
```
[STYLE PREFIX] A friendly police officer of layered cut paper, facing right,
mid-stride, sky-blue paper uniform with a mustard star badge, a cream cap, a
gentle wave. Approachable, kind. Centered, ~8% padding, transparent, 512x512.
```

**`firefighter`** — "Blaze".
```
[STYLE PREFIX] A cheerful firefighter of cut paper, facing right, coral-red
paper jacket with cream reflective stripes (matte, no gloss), a mustard paper
helmet, holding a teal paper hose. Brave and warm. Centered, ~8% padding,
transparent, 512x512.
```

**`chef`** — "Basil".
```
[STYLE PREFIX] A jolly chef of layered paper, facing right, cream double-breasted
coat, tall cream paper toque, a coral neckerchief, holding a paper frying pan
with a little teal pancake flipping. Rosy, happy. Centered, ~8% padding,
transparent, 512x512.
```

**`doctor`** — "Dr. Wren".
```
[STYLE PREFIX] A kind doctor of cut paper, facing right, cream lab coat over teal
scrubs, a paper stethoscope around the neck, holding a coral clipboard. Warm,
reassuring smile. Centered, ~8% padding, transparent, 512x512.
```

**`mail_carrier`** — "Posty". ⭐ walk pair recommended.
```
[STYLE PREFIX] A friendly mail carrier of layered paper, facing right, walking
with a sky-blue paper uniform and cap, a mustard shoulder satchel full of cream
paper letters, one letter held out. Cheerful. Centered, ~8% padding, transparent,
512x512.
```

**`builder`** — "Nail", a construction worker.
```
[STYLE PREFIX] A cheerful construction worker of cut paper, facing right, mustard
paper hard hat, coral safety vest over a cream shirt, kraft-brown tool belt,
carrying a teal paper wrench. Friendly, capable. Centered, ~8% padding,
transparent, 512x512.
```

### Backdrops

**`downtown_street`**
```
[STYLE PREFIX] A friendly downtown street in layered paper: a kraft-grey paper
sidewalk and road foreground with a cream crosswalk, rows of cheerful cut-paper
buildings in coral, teal, mustard and cream along the sides (windows as flat
paper squares, no text), a sky-blue paper sky. Open, tidy center. Full-bleed,
1024x768.
```

**`neighborhood`**
```
[STYLE PREFIX] A cozy suburban neighborhood in layered paper: a cream sidewalk
and leaf-green paper lawns in front, a couple of cheerful cut-paper houses with
coral and teal roofs and little paper trees along the sides, sky-blue paper sky
with soft clouds. Calm center. Full-bleed, 1024x768.
```

**`city_park`**
```
[STYLE PREFIX] A sunny city park in layered paper: a leaf-green paper lawn with a
cream winding path, rounded paper trees and a teal paper pond to the sides, a
mustard park bench, a hint of paper city skyline behind, sky-blue sky. Open
center. Full-bleed, 1024x768.
```

### Props

- **`taxi_car`** — `[STYLE PREFIX] A cute mustard-yellow paper taxi car, facing right, cream windows, charcoal paper wheels, soft shadow. Layered paper. Centered, transparent, 512x512.`
- **`traffic_light`** — `[STYLE PREFIX] A charcoal-grey paper traffic light on a post with three flat paper circles: coral, mustard, leaf-green. Symmetric. Centered, transparent, 512x512.`
- **`mailbox`** — `[STYLE PREFIX] A sky-blue paper mailbox on a kraft-brown post with a little coral flag up, facing right, layered paper, soft shadow. Centered, transparent, 512x512.`
- **`hotdog_cart`** — `[STYLE PREFIX] A cheerful food cart of cut paper, facing right, coral-and-cream striped umbrella over a mustard cart on paper wheels, a teal awning. Layered paper. Centered, transparent, 512x512.`

---

## 7. 🎉 HOLIDAYS PACK

### Characters

**`santa`** — "Nick". ⭐ walk pair recommended.
```
[STYLE PREFIX] A jolly Santa Claus of layered cut paper, facing right, walking
with a coral-red paper suit trimmed in cream, a kraft-brown belt, a fluffy cream
paper beard and hat pom, carrying a teal paper gift sack over one shoulder.
Warm, twinkly. Centered, ~8% padding, transparent, 512x512.
```

**`snowman`** — "Frost".
```
[STYLE PREFIX] A cheerful snowman of layered cream-white paper stacked in three
rounds, facing right (mustard paper carrot nose points right, charcoal dot eyes,
a coral scarf blowing to one side, kraft-brown twig arms). Symmetric body but
asymmetric nose/scarf — treat with the facing rule. Centered, ~8% padding,
transparent, 512x512.
```

**`easter_bunny`** — "Tulip".
```
[STYLE PREFIX] A sweet Easter bunny of cut paper, facing right, soft cream body,
long paper ears with coral inner paper, holding a teal basket of pastel paper
eggs. Gentle, springy. Centered, ~8% padding, transparent, 512x512.
```

**`jack_o_lantern`** — "Jack", a friendly pumpkin.
```
[STYLE PREFIX] A friendly jack-o'-lantern of layered paper, a coral-orange paper
pumpkin with charcoal cut-paper triangle eyes and a happy smile, a kraft-brown
paper stem and a small leaf-green leaf, tiny paper feet mid-step facing right.
Playful, not scary. Centered, ~8% padding, transparent, 512x512.
```

**`turkey_tom`** — "Gobble".
```
[STYLE PREFIX] A cheerful Thanksgiving turkey of cut paper, facing right, a
kraft-brown round body with a fanned tail of coral, mustard, and leaf-green
layered paper feathers, a coral wattle, cheerful dot eyes, little paper legs
mid-step. Centered, ~8% padding, transparent, 512x512.
```

**`birthday_kid`** — "Party", a kid in a party hat.
```
[STYLE PREFIX] A happy child of layered paper, facing right, wearing a coral-and-
mustard striped paper party hat, holding a teal paper balloon on a string and a
tiny cream cupcake, confetti bits of paper around. Joyful. Centered, ~8% padding,
transparent, 512x512.
```

### Backdrops

**`winter_village`**
```
[STYLE PREFIX] A cozy snowy village at dusk in layered paper: cream snow drifts
in the foreground, little cut-paper cottages with coral and teal roofs and warm
mustard paper windows, snow-topped paper pine trees, a deep blue paper sky with
cream paper snowflakes and a soft moon. Calm center. Full-bleed, 1024x768.
```

**`haunted_yard`** — friendly, not scary.
```
[STYLE PREFIX] A playful Halloween yard in layered paper: a leaf-and-kraft paper
lawn with grinning cut-paper pumpkins, a friendly paper ghost shape, bare paper
trees to the sides, a deep purple-blue paper night sky with a big mustard moon
and a few cream stars. Cute, not scary. Open center. Full-bleed, 1024x768.
```

**`party_room`**
```
[STYLE PREFIX] A festive birthday party room in layered paper: a cream floor and
a soft teal wall hung with coral-and-mustard paper bunting and balloons, a paper
table with a cake shape, confetti bits of paper. Bright, cheerful, uncluttered
center. Full-bleed, 1024x768.
```

### Props (symmetric where noted)

- **`gift_box`** — `[STYLE PREFIX] A cheerful wrapped present of cut paper, a teal box with a coral paper ribbon and bow on top, soft shadow. Symmetric. Centered, transparent, 512x512.`
- **`christmas_tree`** — `[STYLE PREFIX] A cute decorated Christmas tree of layered leaf-green paper triangles with tiny coral and mustard paper ornaments and a cream star on top, kraft trunk. Symmetric. Centered, transparent, 512x512.`
- **`candy_cane`** — `[STYLE PREFIX] A single candy cane of cut paper, cream and coral stripes, soft shadow, matte paper. Centered, transparent, 512x512.`
- **`fireworks`** — `[STYLE PREFIX] A burst of paper fireworks, radiating coral, mustard, and teal paper sparks from a center point on a transparent background, flat layered paper. Symmetric. Centered, transparent, 512x512.`

---

## 8. 🦕 PREHISTORIC PACK

### Characters

**`triceratops`** — "Tri". ⭐ walk pair recommended.
```
[STYLE PREFIX] A friendly triceratops of layered cut paper, facing right,
walking, a leaf-green paper body, a cream paper neck frill, three little mustard
paper horns, kraft-brown belly, cheerful dot eyes. Chunky and cute. Centered,
~8% padding, transparent, 512x512.
```

**`pterodactyl`** — "Terry".
```
[STYLE PREFIX] A cute pterodactyl of cut paper, facing right in a gentle glide,
coral paper wings spread, a teal head crest, a long cream beak, happy eye.
Layered paper, soft shadows. Centered, ~8% padding, transparent, 512x512.
```

**`stegosaurus`** — "Spike".
```
[STYLE PREFIX] A friendly stegosaurus of layered paper, facing right, a mustard-
green paper body with a row of coral paper plates along the back and a teal-
tipped tail, tiny kraft paper feet mid-step, sweet face. Centered, ~8% padding,
transparent, 512x512.
```

**`cavekid`** — "Ugg".
```
[STYLE PREFIX] A cheerful cave kid of cut paper, facing right, mid-stride in a
kraft-brown paper spotted tunic, messy coral paper hair, carrying a rounded paper
club over the shoulder playfully. Friendly, plucky. Centered, ~8% padding,
transparent, 512x512.
```

**`mammoth`** — "Woolly".
```
[STYLE PREFIX] A soft woolly mammoth of layered paper, facing right, a big
kraft-brown shaggy paper body, cream curved tusks, a raised paper trunk, little
charcoal eye, rounded feet. Gentle giant, cute. Centered, ~8% padding,
transparent, 512x512.
```

**`sabertooth`** — "Fang", a friendly saber-tooth cat.
```
[STYLE PREFIX] A friendly saber-tooth cat of cut paper, facing right, a mustard-
tan paper body with kraft spots, two cream paper fangs, a coral nose, tufted
paper ears, mid-prowl but cheerful (not fierce). Centered, ~8% padding,
transparent, 512x512.
```

### Backdrops

**`volcano_valley`**
```
[STYLE PREFIX] A prehistoric valley in layered paper: leaf-green paper ferns and
kraft rocks in the foreground, a large coral-and-charcoal paper volcano with a
soft mustard lava glow (flat paper, no gradient) in the mid-ground, a warm peach
paper sky. Uncluttered center. Full-bleed, 1024x768.
```

**`jungle_swamp`**
```
[STYLE PREFIX] A lush prehistoric swamp in layered paper: teal paper water with
lily-pad shapes in front, giant leaf-green paper ferns and kraft palm trunks to
the sides, a hint of a paper dinosaur silhouette behind, a soft green paper sky.
Calm, open center. Full-bleed, 1024x768.
```

**`ice_cave`**
```
[STYLE PREFIX] An ice-age cave in layered paper: cream-and-sky-blue paper ice
walls and hanging paper icicles framing the sides, a kraft-brown stone floor, a
soft cool light from the cave mouth top-left, a couple of cream snow mounds.
Open center. Full-bleed, 1024x768.
```

### Props

- **`dino_egg`** — `[STYLE PREFIX] A large speckled dinosaur egg of cut paper, cream with mustard and teal paper spots, in a small kraft nest, soft shadow. Symmetric. Centered, transparent, 512x512.`
- **`volcano`** — `[STYLE PREFIX] A single small volcano of layered paper, kraft-brown cone with a coral-mustard paper lava puff and a cream smoke cloud on top. Symmetric. Centered, transparent, 512x512.`
- **`bone`** — `[STYLE PREFIX] A single cartoon dinosaur bone of cream cut paper, matte, soft shadow. Symmetric. Centered, transparent, 512x512.`
- **`palm_fern`** — `[STYLE PREFIX] A prehistoric fern plant of layered leaf-green paper fronds in a kraft paper pot/mound, facing right at a slight lean. Centered, transparent, 512x512.`

---

## 9. Drop-in wiring (two edits in `js/engine/stage.js`)

The game auto-loads `assets/sprites/<slug>_right.png` / `_left.png` and `assets/backdrops/<name>.png`. To make new assets selectable:

**1. Add characters + props to the roster** — extend the `ROSTER` array (around line 193). Each entry is `{ slug, name }`; the `slug` must match the filenames.
```js
// … existing entries …
{ slug: "soccer_star", name: "Striker" }, { slug: "astro_pup", name: "Comet" },
{ slug: "pirate_captain", name: "Salty" }, { slug: "police_officer", name: "Officer Pat" },
{ slug: "santa", name: "Nick" }, { slug: "triceratops", name: "Tri" },
// … one line per character/prop you generated …
```
Any character you also made a **walk pair** (`_right_step.png` / `_left_step.png`) for goes in the `HEROES` map (around line 211) so costume-switching animates it:
```js
const HEROES = { scrappy: 1, /* … */, boxing_roo: 1, astro_pup: 1, pirate_captain: 1,
  mail_carrier: 1, santa: 1, triceratops: 1 };
```

**2. Add backdrops** — extend `BACKDROP_NAMES` (around line 475). The 🎬 backdrop switcher and the `switch backdrop to […]` block pick these up automatically:
```js
const BACKDROP_NAMES = ["meadow", "ocean", "space", "castle", "city", "jungle", "arctic", "desert",
  "stadium", "gym_court", "race_track", "moon_base", "mars_surface", "starfield",
  "pirate_cove", "wild_west", "throne_room", "downtown_street", "neighborhood", "city_park",
  "winter_village", "haunted_yard", "party_room", "volcano_valley", "jungle_swamp", "ice_cave"];
```

No other code changes needed — drop the PNGs in `assets/sprites/` and `assets/backdrops/`, add the lines above, and bump the `?v=` cache number on `stage.js` in `index.html` (and `sw.js`).

---

## 10. Consistency & QA checklist

- **Batch per pack.** Generate one whole pack in a single session so its 6 characters share exact shading/paper texture.
- **Style anchor.** Keep one finished existing sprite (e.g. `scrappy_right.png`) visible as a reference so grain, edge softness, and saturation stay identical across packs.
- **Facing pairs.** For every character, generate right first, then the left with the **Left-Facing Template** — verify the leading foot and any held item point LEFT and sit on the SAME baseline (feet shouldn't bob when flipped).
- **Transparency.** Confirm a real transparent background (checkerboard), not white. Re-export if the generator baked a white card.
- **No text.** Reject any output with letters/numbers on jerseys, signs, or badges — the NEGATIVE clause forbids lettering.
- **Backdrops breathe.** The center third of every backdrop should be calm/empty so a sprite reads clearly on top.
- **Names are unique.** All slugs above avoid the 24 existing character slugs and 8 existing backdrop names — don't reuse `space`, `city`, `castle`, or `jungle` (those backdrops already exist).

---

## 11. Master manifest (all 138 files)

**Characters & props — each gets `_right.png` + `_left.png` in `assets/sprites/` (512×512), heroes also `_right_step.png` + `_left_step.png`:**

`soccer_star`, `hoops_ace`, `tennis_pro`, `boxing_roo`⭐, `skate_kid`, `gymnast_kid`, `soccer_ball`, `basketball`, `trophy_cup`, `goal_net`, `astro_pup`⭐, `rover_bot`, `martian`, `star_captain`, `moon_bunny`, `comet_cat`, `rocket_ship`, `planet_saturn`, `ufo`, `moon_rock`, `pirate_captain`⭐, `cowboy`, `viking`, `pharaoh`, `roman_gladiator`, `princess`, `treasure_chest`, `pirate_ship`, `campfire`, `cannon`, `police_officer`, `firefighter`, `chef`, `doctor`, `mail_carrier`⭐, `builder`, `taxi_car`, `traffic_light`, `mailbox`, `hotdog_cart`, `santa`⭐, `snowman`, `easter_bunny`, `jack_o_lantern`, `turkey_tom`, `birthday_kid`, `gift_box`, `christmas_tree`, `candy_cane`, `fireworks`, `triceratops`⭐, `pterodactyl`, `stegosaurus`, `cavekid`, `mammoth`, `sabertooth`, `dino_egg`, `volcano`, `bone`, `palm_fern`

**Backdrops — `assets/backdrops/<name>.png` (1024×768):**

`stadium`, `gym_court`, `race_track`, `moon_base`, `mars_surface`, `starfield`, `pirate_cove`, `wild_west`, `throne_room`, `downtown_street`, `neighborhood`, `city_park`, `winter_village`, `haunted_yard`, `party_room`, `volcano_valley`, `jungle_swamp`, `ice_cave`

⭐ = 7 hero characters recommended for a 2-frame walk pair (`boxing_roo`, `astro_pup`, `pirate_captain`, `mail_carrier`, `santa`, `triceratops`, plus pick any 1 more you like).
