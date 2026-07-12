from pathlib import Path
import math

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(r"D:\workspace\sw_ai\ai\agent_in_action\hello_langchain")
OUT_DIR = ROOT / "article-assets" / "agent-verification"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1600, 900
SCALE = 2
CANVAS = (W * SCALE, H * SCALE)

FONT_TITLE = r"C:\Windows\Fonts\msyhbd.ttc"
FONT_TEXT = r"C:\Windows\Fonts\msyh.ttc"
FONT_MONO = r"C:\Windows\Fonts\CascadiaCode.ttf"


def font(path, size):
    return ImageFont.truetype(path, size * SCALE)


title_font = font(FONT_TITLE, 68)
title_font_2 = font(FONT_TITLE, 54)
subtitle_font = font(FONT_TEXT, 32)
tag_font = font(FONT_TEXT, 24)
small_font = font(FONT_TEXT, 23)
mono_font = font(FONT_MONO, 22)
card_font = font(FONT_TITLE, 25)


def sc(v):
    return int(v * SCALE)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(tuple(sc(x) for x in box), radius=sc(radius), fill=fill, outline=outline, width=sc(width))


def text(draw, pos, content, fnt, fill):
    draw.text((sc(pos[0]), sc(pos[1])), content, font=fnt, fill=fill)


def line(draw, points, fill, width=2):
    draw.line([(sc(x), sc(y)) for x, y in points], fill=fill, width=sc(width))


img = Image.new("RGB", CANVAS, (249, 252, 255))
draw = ImageDraw.Draw(img)

# Soft pastel gradient.
for y in range(CANVAS[1]):
    t = y / CANVAS[1]
    r = int(246 + 7 * t)
    g = int(251 - 3 * t)
    b = int(255 - 10 * t)
    draw.line([(0, y), (CANVAS[0], y)], fill=(r, g, b))

glow = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
g = ImageDraw.Draw(glow)
for cx, cy, color, radius in [
    (260, 160, (128, 210, 255, 130), 260),
    (1310, 155, (255, 197, 218, 145), 280),
    (1260, 730, (180, 150, 255, 105), 280),
    (520, 730, (255, 230, 141, 100), 230),
]:
    g.ellipse([sc(cx - radius), sc(cy - radius), sc(cx + radius), sc(cy + radius)], fill=color)
glow = glow.filter(ImageFilter.GaussianBlur(sc(82)))
img = Image.alpha_composite(img.convert("RGBA"), glow)
draw = ImageDraw.Draw(img)

# Decorative dots and rounded marks.
for x, y, r, c in [
    (90, 82, 8, (94, 174, 255, 155)),
    (138, 108, 5, (255, 171, 199, 155)),
    (1480, 86, 7, (113, 214, 173, 155)),
    (1450, 820, 6, (255, 200, 87, 155)),
    (90, 785, 7, (180, 150, 255, 130)),
]:
    draw.ellipse([sc(x - r), sc(y - r), sc(x + r), sc(y + r)], fill=c)

for x in range(0, W, 92):
    line(draw, [(x, 0), (x, H)], (151, 181, 218, 34), 1)
for y in range(0, H, 92):
    line(draw, [(0, y), (W, y)], (151, 181, 218, 34), 1)

# Tag.
rounded(draw, (92, 78, 506, 124), 23, (255, 255, 255, 220), (157, 194, 235, 170), 2)
text(draw, (118, 87), "Cute Agent · Verify Loop · Code Evidence", tag_font, (72, 105, 153))

# Main title.
text(draw, (92, 172), "Agent 的最后一公里", title_font, (36, 64, 112))
text(draw, (96, 282), "从工具执行成功", title_font_2, (57, 92, 158))
text(draw, (96, 354), "到任务真的完成", title_font_2, (21, 164, 177))

text(draw, (100, 464), "把每一次 Tool 调用，", subtitle_font, (88, 109, 145))
text(draw, (100, 510), "变成可交付、可验证的工程证据。", subtitle_font, (88, 109, 145))

# Cute robot body.
robot_shadow = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
rs = ImageDraw.Draw(robot_shadow)
rs.ellipse([sc(920), sc(702), sc(1460), sc(812)], fill=(82, 112, 158, 42))
robot_shadow = robot_shadow.filter(ImageFilter.GaussianBlur(sc(16)))
img = Image.alpha_composite(img, robot_shadow)
draw = ImageDraw.Draw(img)

rounded(draw, (1050, 265, 1412, 612), 46, (255, 255, 255, 245), (101, 171, 235, 210), 3)
rounded(draw, (1110, 205, 1352, 285), 40, (239, 249, 255, 255), (101, 171, 235, 210), 3)
line(draw, [(1230, 205), (1230, 154)], (101, 171, 235, 210), 5)
draw.ellipse([sc(1214), sc(134), sc(1246), sc(166)], fill=(255, 190, 91))

# Robot face.
draw.ellipse([sc(1162), sc(332), sc(1210), sc(380)], fill=(36, 64, 112))
draw.ellipse([sc(1252), sc(332), sc(1300), sc(380)], fill=(36, 64, 112))
draw.ellipse([sc(1177), sc(342), sc(1191), sc(356)], fill=(255, 255, 255))
draw.ellipse([sc(1267), sc(342), sc(1281), sc(356)], fill=(255, 255, 255))
draw.arc([sc(1188), sc(385), sc(1276), sc(450)], 15, 165, fill=(21, 164, 177), width=sc(6))

# Robot screen checklist.
rounded(draw, (1104, 470, 1360, 570), 24, (243, 250, 255, 255), (187, 215, 245, 220), 2)
for i, (label, color) in enumerate([("Build", (113, 214, 173)), ("Verify", (94, 174, 255)), ("Report", (255, 190, 91))]):
    y = 492 + i * 25
    draw.ellipse([sc(1128), sc(y), sc(1144), sc(y + 16)], fill=color)
    text(draw, (1154, y - 5), label, mono_font, (67, 86, 125))

# Robot arms.
line(draw, [(1050, 410), (980, 468), (908, 448)], (101, 171, 235), 9)
line(draw, [(1412, 410), (1486, 456), (1500, 530)], (101, 171, 235), 9)
draw.ellipse([sc(884), sc(426), sc(930), sc(472)], fill=(255, 255, 255), outline=(101, 171, 235), width=sc(3))
draw.ellipse([sc(1478), sc(516), sc(1524), sc(562)], fill=(255, 255, 255), outline=(101, 171, 235), width=sc(3))

# Cute verification loop cards.
cards = [
    ("Reason", "拆需求", 785, 198, (105, 180, 255)),
    ("Act", "调工具", 930, 310, (113, 214, 173)),
    ("Observe", "读日志", 805, 430, (255, 190, 91)),
    ("Verify", "跑构建", 930, 550, (181, 148, 255)),
]
for name, desc, x, y, color in cards:
    rounded(draw, (x, y, x + 150, y + 82), 24, (255, 255, 255, 235), color + (255,), 3)
    text(draw, (x + 22, y + 14), name, card_font, (45, 66, 108))
    text(draw, (x + 22, y + 48), desc, small_font, (92, 112, 148))

line(draw, [(895, 240), (930, 310)], (111, 138, 184), 4)
line(draw, [(930, 392), (880, 430)], (111, 138, 184), 4)
line(draw, [(880, 512), (930, 550)], (111, 138, 184), 4)
line(draw, [(1005, 550), (1070, 505)], (111, 138, 184), 4)

# Code evidence card.
rounded(draw, (94, 585, 760, 748), 32, (255, 255, 255, 232), (168, 199, 236, 190), 2)
for i, c in enumerate([(255, 117, 117), (255, 198, 91), (113, 214, 173)]):
    draw.ellipse([sc(126 + i * 30), sc(618), sc(142 + i * 30), sc(634)], fill=c)
text(draw, (126, 662), "npm run build", mono_font, (21, 154, 115))
text(draw, (126, 692), "TS5097  →  下一轮修复线索", small_font, (224, 85, 101))

# Bottom formula.
rounded(draw, (94, 775, 888, 838), 28, (255, 255, 255, 225), (250, 199, 99, 200), 2)
text(draw, (124, 792), "LLM + Tool + Verify + Fix = 可信交付", small_font, (207, 128, 28))

img = img.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
out = OUT_DIR / "blog-cover-agent-verification-cute.png"
img.save(out, quality=96)
print(out)
