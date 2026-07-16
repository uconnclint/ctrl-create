#!/usr/bin/env python3
from __future__ import annotations

import math
import random
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "assets"
RNG = random.Random(42)

CREAM = "#F7F0E1"
KRAFT = "#C89B6B"
CORAL = "#FF6F61"
TEAL = "#2FB4A6"
MUSTARD = "#F2B134"
SKY = "#7EC8E3"
LEAF = "#6FBF73"
CHARCOAL = "#3A3A3A"
WHITE = "#FFF7EA"
SILVER = "#D6D7D2"
BRONZE = "#B9784B"
GOLD = "#F2B134"


def ensure_dirs() -> None:
    for name in ("sprites", "icons", "ui", "backdrops"):
        (ASSETS / name).mkdir(parents=True, exist_ok=True)


def rgba(color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    color = color.lstrip("#")
    return tuple(int(color[i : i + 2], 16) for i in (0, 2, 4)) + (alpha,)


def paper_canvas(size: tuple[int, int], transparent: bool = True, base: str = CREAM) -> Image.Image:
    if transparent:
        return Image.new("RGBA", size, (0, 0, 0, 0))
    img = Image.new("RGBA", size, rgba(base))
    add_grain(img, 14)
    return img


def add_grain(img: Image.Image, strength: int = 10) -> None:
    px = img.load()
    w, h = img.size
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            a = px[x, y][3]
            if a == 0:
                continue
            delta = RNG.randint(-strength, strength)
            r, g, b, _ = px[x, y]
            c = (max(0, min(255, r + delta)), max(0, min(255, g + delta)), max(0, min(255, b + delta)), a)
            px[x, y] = c
            if x + 1 < w:
                px[x + 1, y] = c
            if y + 1 < h:
                px[x, y + 1] = c
            if x + 1 < w and y + 1 < h:
                px[x + 1, y + 1] = c


def shadow_layer(mask: Image.Image, blur: int = 7, offset: tuple[int, int] = (7, 8), alpha: int = 70) -> Image.Image:
    sh = Image.new("RGBA", mask.size, (0, 0, 0, 0))
    a = mask.split()[-1].filter(ImageFilter.GaussianBlur(blur))
    a = ImageChops.offset(a, offset[0], offset[1])
    sh.putalpha(a.point(lambda p: min(alpha, p)))
    return sh


def draw_paper(base: Image.Image, shape: str, box: tuple[int, int, int, int], color: str, *, points=None, blur=7, shadow=True) -> None:
    layer = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    if shape == "ellipse":
        d.ellipse(box, fill=rgba(color))
    elif shape == "rect":
        d.rounded_rectangle(box, radius=max(8, min(box[2] - box[0], box[3] - box[1]) // 7), fill=rgba(color))
    elif shape == "poly":
        d.polygon(points, fill=rgba(color))
    elif shape == "line":
        d.line(points, fill=rgba(color), width=box[0], joint="curve")
    add_grain(layer, 8)
    if shadow:
        base.alpha_composite(shadow_layer(layer, blur=blur))
    base.alpha_composite(layer)


def poly(cx: int, cy: int, radii: Iterable[tuple[float, float]], wobble: int = 4) -> list[tuple[int, int]]:
    pts = []
    for angle, r in radii:
        pts.append((int(cx + math.cos(angle) * (r + RNG.randint(-wobble, wobble))), int(cy + math.sin(angle) * (r + RNG.randint(-wobble, wobble)))))
    return pts


def star_points(cx: int, cy: int, outer: int, inner: int, count: int = 5, start: float = -math.pi / 2) -> list[tuple[int, int]]:
    pts = []
    for i in range(count * 2):
        r = outer if i % 2 == 0 else inner
        a = start + i * math.pi / count
        pts.append((int(cx + math.cos(a) * r), int(cy + math.sin(a) * r)))
    return pts


def maybe_flip(x: int, facing: str, w: int = 512) -> int:
    return w - x if facing == "left" else x


def pts_flip(points: list[tuple[int, int]], facing: str, w: int = 512) -> list[tuple[int, int]]:
    return [(maybe_flip(x, facing, w), y) for x, y in points]


def flip_box(x1: int, y1: int, x2: int, y2: int, facing: str, w: int = 512) -> tuple[int, int, int, int]:
    fx1, fx2 = maybe_flip(x1, facing, w), maybe_flip(x2, facing, w)
    return (min(fx1, fx2), y1, max(fx1, fx2), y2)


def eye_pair(img: Image.Image, cx: int, cy: int, facing: str, scale: float = 1.0) -> None:
    dx = int(27 * scale)
    for ex in (cx - dx, cx + dx):
        x = maybe_flip(ex, facing)
        draw_paper(img, "ellipse", (x - 10, cy - 11, x + 10, cy + 11), CHARCOAL, blur=3)
        draw_paper(img, "ellipse", (x + 2, cy - 6, x + 7, cy - 1), CREAM, blur=2)


CHARACTERS = {
    "scrappy": (MUSTARD, CREAM, "cat"),
    "dog": (KRAFT, CREAM, "dog"),
    "robot": (SKY, TEAL, "robot"),
    "dragon": (LEAF, CORAL, "dragon"),
    "penguin": (CHARCOAL, CREAM, "penguin"),
    "fox": ("#D97832", CREAM, "fox"),
    "dino": ("#7CBF5F", CREAM, "dino"),
    "unicorn": (WHITE, CORAL, "unicorn"),
    "bee": (MUSTARD, CHARCOAL, "bee"),
    "shark": ("#5EAFC7", CREAM, "shark"),
    "ghost": (WHITE, SKY, "ghost"),
    "wizard": ("#6D63C7", MUSTARD, "wizard"),
    "knight": (SILVER, SKY, "knight"),
    "astronaut": (WHITE, TEAL, "astronaut"),
    "ninja": ("#2E3740", CORAL, "ninja"),
    "parrot": (LEAF, CORAL, "parrot"),
    "frog": (LEAF, CREAM, "frog"),
    "owl": (KRAFT, CREAM, "owl"),
    "crab": (CORAL, CREAM, "crab"),
    "butterfly": ("#9966FF", CORAL, "butterfly"),
    "monster": (TEAL, MUSTARD, "monster"),
    "alien": ("#8BD36F", SKY, "alien"),
    "superhero": ("#4C97FF", CORAL, "superhero"),
    "hedgehog": (KRAFT, MUSTARD, "hedgehog"),
}

HEROES = {"scrappy", "dog", "robot", "dragon", "fox", "dino", "wizard", "knight", "astronaut", "hedgehog"}


def draw_character(name: str, facing: str, step: bool = False) -> Image.Image:
    body, accent, kind = CHARACTERS[name]
    img = paper_canvas((512, 512), True)
    s = -1 if facing == "left" else 1
    leg_shift = 22 if step else 0

    # Tail, wings, or large rear details behind body.
    if kind in {"cat", "dog", "fox", "dragon", "dino", "hedgehog"}:
        tail = pts_flip([(238 - 90 * s, 318), (204 - 145 * s, 260), (226 - 110 * s, 220), (270 - 54 * s, 286)], facing)
        draw_paper(img, "poly", (0, 0, 0, 0), body, points=tail)
    if kind == "butterfly":
        draw_paper(img, "ellipse", (110, 130, 255, 330), "#CFA7FF")
        draw_paper(img, "ellipse", (257, 130, 402, 330), CORAL)
    if kind == "parrot":
        draw_paper(img, "ellipse", flip_box(160, 185, 250, 355, facing), "#E8C64B")

    # Legs and feet share a stable baseline.
    for side in (-1, 1):
        lx = maybe_flip(230 + side * (35 + (leg_shift if side == 1 else -leg_shift)), facing)
        draw_paper(img, "line", (22, 0, 0, 0), body, points=[(lx, 330), (lx - 10 * side * s, 418)])
        draw_paper(img, "ellipse", (lx - 29, 405, lx + 36, 435), body, blur=4)

    # Body and head.
    if kind == "robot":
        draw_paper(img, "rect", (176, 205, 336, 345), body)
        draw_paper(img, "rect", (167, 112, 345, 215), CREAM)
        draw_paper(img, "rect", (205, 139, 307, 190), CHARCOAL)
        eye_pair(img, 256, 164, facing, 0.75)
        draw_paper(img, "line", (12, 0, 0, 0), TEAL, points=[(256, 112), (256, 72)])
        draw_paper(img, "ellipse", (242, 56, 270, 84), CORAL)
    elif kind == "ghost":
        draw_paper(img, "ellipse", (160, 110, 352, 358), body)
        wave = [(160, 300), (190, 340), (220, 300), (250, 340), (280, 300), (312, 340), (352, 300), (352, 392), (160, 392)]
        draw_paper(img, "poly", (0, 0, 0, 0), body, points=wave)
    else:
        draw_paper(img, "ellipse", (176, 195, 336, 375), body)
        draw_paper(img, "ellipse", (174, 96, 338, 236), body)

    if kind not in {"robot", "ghost"}:
        draw_paper(img, "ellipse", (213, 244, 299, 345), accent)
    eye_pair(img, 256, 158, facing)
    draw_paper(img, "ellipse", (238, 183, 274, 202), CORAL if kind in {"cat", "dog", "fox", "unicorn"} else CHARCOAL, blur=3)

    # Arms.
    raised = -42 if not step else 30
    for side in (-1, 1):
        x0 = maybe_flip(204 + side * 72, facing)
        x1 = maybe_flip(174 + side * 92, facing)
        y1 = 214 + (raised if side == 1 else 52)
        draw_paper(img, "line", (24, 0, 0, 0), body, points=[(x0, 252), (x1, y1)])
        draw_paper(img, "ellipse", (x1 - 19, y1 - 15, x1 + 21, y1 + 18), body, blur=4)

    # Distinct costume/species marks.
    if kind in {"cat", "fox"}:
        ears = [(188, 120), (215, 56), (246, 124), (266, 124), (297, 56), (324, 120)]
        draw_paper(img, "poly", (0, 0, 0, 0), body, points=pts_flip(ears[:3], facing))
        draw_paper(img, "poly", (0, 0, 0, 0), body, points=pts_flip(ears[3:], facing))
        draw_paper(img, "ellipse", (237, 324, 275, 362), TEAL, blur=3)
    elif kind == "dog":
        ear_x = maybe_flip(190, facing)
        draw_paper(img, "ellipse", (ear_x - 35, 106, ear_x + 25, 215), "#9B6C48")
        draw_paper(img, "ellipse", (235, 205, 283, 235), CORAL, blur=3)
    elif kind == "dragon":
        for i, y in enumerate((112, 145, 178, 210)):
            draw_paper(img, "poly", (0, 0, 0, 0), CORAL, points=pts_flip([(255, y - 28), (276, y), (235, y)], facing), blur=4)
        draw_paper(img, "poly", (0, 0, 0, 0), "#E8C64B", points=pts_flip([(330, 170), (386, 145), (355, 198)], facing))
    elif kind == "penguin":
        draw_paper(img, "ellipse", (208, 126, 304, 350), CREAM)
        draw_paper(img, "poly", (0, 0, 0, 0), MUSTARD, points=pts_flip([(257, 168), (310, 184), (257, 200)], facing), blur=3)
    elif kind == "dino":
        draw_paper(img, "ellipse", flip_box(275, 112, 385, 220, facing), body)
        draw_paper(img, "ellipse", flip_box(325, 160, 374, 196, facing), CREAM, blur=3)
    elif kind == "unicorn":
        draw_paper(img, "poly", (0, 0, 0, 0), GOLD, points=pts_flip([(256, 76), (236, 118), (276, 118)], facing))
        for i, c in enumerate((CORAL, MUSTARD, TEAL)):
            draw_paper(img, "ellipse", (180 + i * 22, 82 + i * 10, 245 + i * 22, 135 + i * 10), c, blur=3)
    elif kind == "bee":
        for y in (238, 284, 330):
            draw_paper(img, "rect", (190, y, 322, y + 22), CHARCOAL, blur=3)
        draw_paper(img, "ellipse", (117, 156, 210, 275), rgba_to_hex((126, 200, 227)), blur=4)
        draw_paper(img, "ellipse", (302, 156, 395, 275), SKY, blur=4)
    elif kind == "shark":
        draw_paper(img, "poly", (0, 0, 0, 0), body, points=pts_flip([(330, 135), (402, 170), (330, 205)], facing))
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=pts_flip([(210, 205), (330, 210), (295, 250)], facing), blur=3)
    elif kind == "wizard":
        draw_paper(img, "poly", (0, 0, 0, 0), "#5147A8", points=pts_flip([(256, 38), (174, 134), (338, 134)], facing))
        draw_paper(img, "ellipse", (225, 204, 287, 285), "#D8D0C0", blur=4)
        draw_paper(img, "poly", (0, 0, 0, 0), GOLD, points=star_points(maybe_flip(318, facing), 78, 18, 8), blur=3)
    elif kind == "knight":
        draw_paper(img, "rect", (182, 110, 330, 210), SILVER)
        draw_paper(img, "rect", (206, 148, 306, 170), CHARCOAL, blur=3)
        draw_paper(img, "rect", flip_box(318, 230, 390, 330, facing), SKY)
    elif kind == "astronaut":
        draw_paper(img, "ellipse", (174, 92, 338, 238), WHITE)
        draw_paper(img, "ellipse", (205, 124, 307, 196), "#8ECFE0", blur=4)
        draw_paper(img, "rect", (216, 258, 296, 306), TEAL, blur=3)
    elif kind == "ninja":
        draw_paper(img, "rect", (196, 132, 316, 178), CHARCOAL, blur=3)
        eye_pair(img, 256, 154, facing, 0.75)
        draw_paper(img, "line", (10, 0, 0, 0), CORAL, points=pts_flip([(171, 118), (132, 78)], facing))
    elif kind == "parrot":
        draw_paper(img, "poly", (0, 0, 0, 0), GOLD, points=pts_flip([(302, 150), (372, 170), (302, 195)], facing), blur=3)
        draw_paper(img, "ellipse", (222, 65, 290, 130), CORAL, blur=4)
    elif kind == "frog":
        draw_paper(img, "ellipse", (182, 83, 230, 130), body)
        draw_paper(img, "ellipse", (282, 83, 330, 130), body)
    elif kind == "owl":
        draw_paper(img, "ellipse", (194, 130, 318, 230), CREAM)
        draw_paper(img, "poly", (0, 0, 0, 0), GOLD, points=[(256, 174), (238, 205), (274, 205)], blur=3)
    elif kind == "crab":
        for side in (-1, 1):
            cx = maybe_flip(166 + side * 178, facing)
            draw_paper(img, "ellipse", (cx - 40, 190, cx + 40, 250), body)
            draw_paper(img, "line", (14, 0, 0, 0), body, points=[(cx, 245), (cx + 15 * side, 330)])
    elif kind == "monster":
        for x in (218, 256, 294):
            draw_paper(img, "poly", (0, 0, 0, 0), body, points=[(x - 18, 106), (x, 64), (x + 18, 106)], blur=4)
    elif kind == "alien":
        draw_paper(img, "ellipse", (150, 105, 362, 220), body)
        for x in (218, 294):
            draw_paper(img, "line", (10, 0, 0, 0), body, points=[(x, 108), (x - 22, 58)])
            draw_paper(img, "ellipse", (x - 34, 42, x - 10, 66), CORAL, blur=3)
    elif kind == "superhero":
        cape = pts_flip([(190, 205), (113, 265), (184, 370)], facing)
        draw_paper(img, "poly", (0, 0, 0, 0), CORAL, points=cape)
        draw_paper(img, "poly", (0, 0, 0, 0), GOLD, points=star_points(256, 278, 32, 14), blur=3)
    elif kind == "hedgehog":
        for i in range(10):
            a = math.pi + i * math.pi / 9
            x = int(256 + math.cos(a) * 98)
            y = int(205 + math.sin(a) * 96)
            draw_paper(img, "poly", (0, 0, 0, 0), "#8A5F3E", points=pts_flip([(x, y), (x + 28, y + 38), (x - 16, y + 38)], facing), blur=4)
        draw_paper(img, "rect", (166, 417, 346, 442), "#5CB1D6", blur=4)
        draw_paper(img, "ellipse", (188, 436, 220, 468), CHARCOAL, blur=3)
        draw_paper(img, "ellipse", (294, 436, 326, 468), CHARCOAL, blur=3)

    return img


def rgba_to_hex(t: tuple[int, int, int]) -> str:
    return f"#{t[0]:02X}{t[1]:02X}{t[2]:02X}"


def category_icon(filename: str, color: str, symbol: str) -> Image.Image:
    img = paper_canvas((256, 256), True)
    draw_paper(img, "rect", (34, 42, 222, 214), color)
    d = ImageDraw.Draw(img)
    if symbol == "arrow":
        draw_paper(img, "line", (24, 0, 0, 0), CREAM, points=[(78, 132), (170, 132)])
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=[(160, 92), (202, 132), (160, 172)])
    elif symbol == "star":
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=star_points(128, 128, 72, 32))
    elif symbol == "speaker":
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=[(70, 108), (105, 108), (148, 78), (148, 178), (105, 148), (70, 148)])
        for r in (30, 54):
            d.arc((128, 128 - r, 128 + r, 128 + r), -45, 45, fill=rgba(CREAM), width=10)
    elif symbol == "flag":
        draw_paper(img, "line", (13, 0, 0, 0), CREAM, points=[(88, 70), (88, 188)])
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=[(94, 72), (180, 88), (94, 120)])
    elif symbol == "loop":
        d.arc((68, 80, 188, 176), 20, 330, fill=rgba(CREAM), width=18)
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=[(174, 80), (208, 92), (184, 118)])
    elif symbol == "magnifier":
        draw_paper(img, "ellipse", (70, 70, 156, 156), CREAM)
        draw_paper(img, "ellipse", (88, 88, 138, 138), color, blur=3, shadow=False)
        draw_paper(img, "line", (17, 0, 0, 0), CREAM, points=[(146, 146), (194, 194)])
    elif symbol == "plus":
        draw_paper(img, "rect", (112, 60, 144, 196), CREAM)
        draw_paper(img, "rect", (60, 112, 196, 144), CREAM)
    elif symbol == "box":
        draw_paper(img, "rect", (74, 84, 182, 176), CREAM)
        draw_paper(img, "rect", (92, 104, 164, 140), color, blur=2, shadow=False)
    return img


def ui_icon(name: str) -> Image.Image:
    img = paper_canvas((256, 256), True)
    if name == "flag_green":
        draw_paper(img, "line", (14, 0, 0, 0), KRAFT, points=[(76, 58), (76, 204)])
        draw_paper(img, "poly", (0, 0, 0, 0), LEAF, points=[(84, 58), (198, 82), (84, 122)])
    elif name == "stop":
        pts = [(128 + int(math.cos(i * math.pi / 4 + math.pi / 8) * 78), 128 + int(math.sin(i * math.pi / 4 + math.pi / 8) * 78)) for i in range(8)]
        draw_paper(img, "poly", (0, 0, 0, 0), CORAL, points=pts)
        draw_paper(img, "rect", (83, 83, 173, 173), CREAM)
    elif name == "trash":
        draw_paper(img, "rect", (74, 92, 182, 204), SKY)
        draw_paper(img, "rect", (62, 70, 194, 94), TEAL)
        for x in (100, 128, 156):
            draw_paper(img, "line", (8, 0, 0, 0), CREAM, points=[(x, 112), (x, 184)], blur=3)
    elif name == "plus":
        draw_paper(img, "ellipse", (42, 42, 214, 214), TEAL)
        draw_paper(img, "rect", (110, 70, 146, 186), CREAM)
        draw_paper(img, "rect", (70, 110, 186, 146), CREAM)
    elif name == "play":
        draw_paper(img, "ellipse", (42, 42, 214, 214), LEAF)
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=[(104, 78), (184, 128), (104, 178)])
    elif name == "gear":
        draw_paper(img, "poly", (0, 0, 0, 0), SKY, points=star_points(128, 128, 88, 64, count=10))
        draw_paper(img, "ellipse", (91, 91, 165, 165), CREAM, shadow=False)
    elif name == "trophy":
        draw_paper(img, "rect", (86, 74, 170, 154), GOLD)
        draw_paper(img, "ellipse", (68, 80, 104, 130), GOLD)
        draw_paper(img, "ellipse", (152, 80, 188, 130), GOLD)
        draw_paper(img, "rect", (112, 154, 144, 196), KRAFT)
        draw_paper(img, "rect", (82, 194, 174, 214), KRAFT)
    elif name == "medal":
        draw_paper(img, "poly", (0, 0, 0, 0), CORAL, points=[(88, 44), (122, 44), (134, 122), (100, 122)])
        draw_paper(img, "poly", (0, 0, 0, 0), SKY, points=[(134, 44), (168, 44), (156, 122), (122, 122)])
        draw_paper(img, "ellipse", (70, 104, 186, 220), GOLD)
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=star_points(128, 162, 38, 16), blur=3)
    elif name == "quest":
        draw_paper(img, "rect", (54, 70, 202, 186), CREAM)
        draw_paper(img, "ellipse", (42, 66, 86, 106), KRAFT)
        draw_paper(img, "ellipse", (170, 150, 214, 190), KRAFT)
        draw_paper(img, "line", (9, 0, 0, 0), TEAL, points=[(86, 116), (166, 96)])
    elif name == "star":
        draw_paper(img, "poly", (0, 0, 0, 0), GOLD, points=star_points(128, 128, 96, 42))
    elif name == "xp":
        draw_paper(img, "poly", (0, 0, 0, 0), GOLD, points=[(145, 36), (72, 142), (124, 142), (104, 220), (188, 104), (136, 104)])
    elif name == "save":
        draw_paper(img, "rect", (58, 54, 198, 202), TEAL)
        draw_paper(img, "rect", (84, 66, 164, 114), CREAM)
        draw_paper(img, "rect", (88, 142, 168, 202), CREAM)
    elif name == "folder":
        draw_paper(img, "rect", (42, 88, 214, 196), MUSTARD)
        draw_paper(img, "poly", (0, 0, 0, 0), GOLD, points=[(48, 76), (112, 76), (132, 96), (48, 96)])
    elif name == "help":
        draw_paper(img, "ellipse", (42, 42, 214, 214), "#9966FF")
        d = ImageDraw.Draw(img)
        d.text((103, 63), "?", fill=rgba(CREAM), font_size=118)
    return img


def badge(name: str) -> Image.Image:
    img = paper_canvas((256, 256), True)
    colors = {
        "bronze": BRONZE,
        "silver": SILVER,
        "gold": GOLD,
        "levelup": MUSTARD,
        "quest": TEAL,
        "motion": "#4C97FF",
        "looks": "#9966FF",
        "sound": "#CF63CF",
        "events": "#FFBF00",
        "control": "#FFAB19",
        "sensing": "#5CB1D6",
        "operators": "#59C059",
        "variables": "#FF8C1A",
    }
    c = colors[name]
    if name == "quest":
        draw_paper(img, "poly", (0, 0, 0, 0), c, points=[(40, 88), (216, 88), (190, 128), (216, 168), (40, 168), (66, 128)])
        draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=star_points(128, 128, 42, 18), blur=3)
    else:
        draw_paper(img, "poly", (0, 0, 0, 0), c, points=star_points(128, 116, 82, 64, count=14))
        draw_paper(img, "ellipse", (70, 58, 186, 174), CREAM, blur=5)
        draw_paper(img, "ellipse", (88, 76, 168, 156), c, blur=4)
        draw_paper(img, "poly", (0, 0, 0, 0), CORAL, points=[(92, 164), (116, 164), (108, 224)])
        draw_paper(img, "poly", (0, 0, 0, 0), SKY, points=[(140, 164), (164, 164), (148, 224)])
        symbol = "star" if name in {"bronze", "silver", "gold", "levelup"} else "plus"
        if symbol == "star":
            draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=star_points(128, 116, 34, 15), blur=3)
        else:
            draw_paper(img, "rect", (120, 94, 136, 138), CREAM, blur=3)
            draw_paper(img, "rect", (106, 108, 150, 124), CREAM, blur=3)
    return img


def backdrop(name: str) -> Image.Image:
    palettes = {
        "meadow": (SKY, LEAF, MUSTARD),
        "ocean": ("#67C7DD", "#3193B2", CORAL),
        "space": ("#27345A", "#4B4D8C", MUSTARD),
        "castle": ("#A9D6EA", "#95B684", "#B7A0D8"),
        "city": ("#B9E1F0", "#A7B7C7", CORAL),
        "jungle": ("#8FD184", "#368A58", MUSTARD),
        "arctic": ("#CFEAF5", "#F7F0E1", SKY),
        "desert": ("#F1C66D", "#D99B58", TEAL),
    }
    sky, ground, accent = palettes[name]
    img = paper_canvas((1024, 768), False, sky)
    if name == "space":
        for _ in range(44):
            x, y = RNG.randint(30, 990), RNG.randint(30, 560)
            draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=star_points(x, y, RNG.randint(5, 11), RNG.randint(2, 5)), blur=2)
        draw_paper(img, "ellipse", (705, 88, 885, 268), "#D9C771")
        draw_paper(img, "ellipse", (760, 130, 802, 172), "#B9A85E", blur=3, shadow=False)
    else:
        draw_paper(img, "ellipse", (720, 55, 875, 210), MUSTARD)
    draw_paper(img, "poly", (0, 0, 0, 0), ground, points=[(0, 570), (210, 520), (430, 585), (660, 535), (1024, 575), (1024, 768), (0, 768)])
    if name == "meadow":
        for x in range(70, 980, 135):
            draw_paper(img, "ellipse", (x, 500, x + 72, 640), LEAF)
            draw_paper(img, "ellipse", (x + 18, 460, x + 120, 555), "#79C884")
        for x in range(90, 950, 120):
            draw_paper(img, "poly", (0, 0, 0, 0), accent, points=star_points(x, RNG.randint(610, 700), 17, 8), blur=3)
    elif name == "ocean":
        for y in (215, 310, 420, 535):
            draw_paper(img, "line", (16, 0, 0, 0), "#8BE0E9", points=[(0, y), (180, y + 36), (360, y), (540, y + 36), (720, y), (900, y + 36), (1024, y)], blur=4)
        for x in (180, 520, 790):
            draw_paper(img, "poly", (0, 0, 0, 0), accent, points=[(x, 625), (x + 35, 560), (x + 70, 625)])
    elif name == "castle":
        for x in (190, 330, 610, 750):
            draw_paper(img, "rect", (x, 270, x + 90, 570), "#D8D0C0")
            draw_paper(img, "poly", (0, 0, 0, 0), accent, points=[(x - 14, 270), (x + 45, 190), (x + 104, 270)])
        draw_paper(img, "rect", (300, 350, 725, 570), "#E7DDCE")
    elif name == "city":
        for x, h, c in ((70, 260, "#D8D0C0"), (210, 330, "#9EC7D9"), (375, 235, "#D7A6A1"), (535, 310, "#C7B9D8"), (710, 270, "#D8D0C0"), (850, 340, "#9EC7D9")):
            draw_paper(img, "rect", (x, 570 - h, x + 105, 570), c)
            for wy in range(570 - h + 35, 535, 65):
                draw_paper(img, "rect", (x + 25, wy, x + 52, wy + 32), CREAM, blur=2, shadow=False)
    elif name == "jungle":
        for x in range(60, 980, 110):
            top_x = x + RNG.randint(-20, 20)
            draw_paper(img, "line", (24, 0, 0, 0), KRAFT, points=[(x, 570), (top_x, 275)])
            for dx in (-55, 0, 55):
                draw_paper(img, "ellipse", (x + dx - 55, 230, x + dx + 55, 360), "#368A58")
    elif name == "arctic":
        for x in (70, 240, 450, 680, 850):
            draw_paper(img, "poly", (0, 0, 0, 0), CREAM, points=[(x, 575), (x + 90, 355), (x + 190, 575)])
            draw_paper(img, "poly", (0, 0, 0, 0), SKY, points=[(x + 90, 355), (x + 45, 455), (x + 135, 455)], blur=3)
    elif name == "desert":
        for x in (145, 480, 780):
            draw_paper(img, "line", (28, 0, 0, 0), TEAL, points=[(x, 590), (x, 390)])
            draw_paper(img, "line", (18, 0, 0, 0), TEAL, points=[(x, 465), (x - 55, 425)])
            draw_paper(img, "line", (18, 0, 0, 0), TEAL, points=[(x, 505), (x + 55, 460)])
    return img


def save_all() -> None:
    ensure_dirs()
    for name in CHARACTERS:
        for facing in ("right", "left"):
            draw_character(name, facing).save(ASSETS / "sprites" / f"{name}_{facing}.png")
            if name in HEROES:
                draw_character(name, facing, step=True).save(ASSETS / "sprites" / f"{name}_{facing}_step.png")

    cats = [
        ("cat_motion", "#4C97FF", "arrow"),
        ("cat_looks", "#9966FF", "star"),
        ("cat_sound", "#CF63CF", "speaker"),
        ("cat_events", "#FFBF00", "flag"),
        ("cat_control", "#FFAB19", "loop"),
        ("cat_sensing", "#5CB1D6", "magnifier"),
        ("cat_operators", "#59C059", "plus"),
        ("cat_variables", "#FF8C1A", "box"),
    ]
    for filename, color, symbol in cats:
        category_icon(filename, color, symbol).save(ASSETS / "icons" / f"{filename}.png")

    for name in ("flag_green", "stop", "trash", "plus", "play", "gear", "trophy", "medal", "quest", "star", "xp", "save", "folder", "help"):
        ui_icon(name).save(ASSETS / "ui" / f"{name}.png")

    for name in ("bronze", "silver", "gold", "levelup", "quest", "motion", "looks", "sound", "events", "control", "sensing", "operators", "variables"):
        badge(name).save(ASSETS / "ui" / f"badge_{name}.png")

    for name in ("meadow", "ocean", "space", "castle", "city", "jungle", "arctic", "desert"):
        backdrop(name).save(ASSETS / "backdrops" / f"{name}.png")


if __name__ == "__main__":
    save_all()
