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


title_font = font(FONT_TITLE, 78)
title_font_2 = font(FONT_TITLE, 66)
subtitle_font = font(FONT_TEXT, 34)
tag_font = font(FONT_TEXT, 25)
small_font = font(FONT_TEXT, 23)
mono_font = font(FONT_MONO, 25)
mono_small = font(FONT_MONO, 22)
card_font = font(FONT_TITLE, 27)


def sc(v):
    return int(v * SCALE)


def rounded(draw, box, radius, fill, outline=None, width=1):
    box = tuple(sc(x) for x in box)
    draw.rounded_rectangle(box, radius=sc(radius), fill=fill, outline=outline, width=sc(width))


def text(draw, pos, content, fnt, fill):
    draw.text((sc(pos[0]), sc(pos[1])), content, font=fnt, fill=fill)


def line(draw, points, fill, width=2):
    draw.line([(sc(x), sc(y)) for x, y in points], fill=fill, width=sc(width))


img = Image.new("RGB", CANVAS, (11, 17, 31))
draw = ImageDraw.Draw(img)

# Deep background gradient.
for y in range(CANVAS[1]):
    t = y / CANVAS[1]
    r = int(9 + 14 * t)
    g = int(15 + 18 * t)
    b = int(31 + 35 * t)
    draw.line([(0, y), (CANVAS[0], y)], fill=(r, g, b))

# Soft glows.
glow = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
gdraw = ImageDraw.Draw(glow)
for cx, cy, color, radius in [
    (260, 140, (31, 128, 255, 96), 250),
    (1320, 210, (20, 184, 166, 88), 280),
    (1180, 760, (147, 88, 255, 72), 310),
]:
    gdraw.ellipse(
        [sc(cx - radius), sc(cy - radius), sc(cx + radius), sc(cy + radius)],
        fill=color,
    )
glow = glow.filter(ImageFilter.GaussianBlur(sc(80)))
img = Image.alpha_composite(img.convert("RGBA"), glow)
draw = ImageDraw.Draw(img)

# Subtle grid.
grid_color = (62, 78, 112, 42)
for x in range(0, W, 80):
    line(draw, [(x, 0), (x, H)], grid_color, 1)
for y in range(0, H, 80):
    line(draw, [(0, y), (W, y)], grid_color, 1)

# Main tag.
rounded(draw, (92, 80, 515, 125), 20, (26, 38, 64, 230), (87, 111, 156, 180), 1)
text(draw, (118, 88), "LangChain · Tool Use · Verification Loop", tag_font, (179, 200, 228))

# Title.
text(draw, (92, 170), "Agent 的最后一公里", title_font, (238, 245, 255))
text(draw, (92, 260), "从工具执行成功", title_font_2, (238, 245, 255))
text(draw, (92, 340), "到任务真的完成", title_font_2, (90, 207, 255))

# Subtitle.
text(draw, (96, 455), "不是让 LLM 会调用工具，", subtitle_font, (190, 205, 225))
text(draw, (96, 502), "而是让结果可交付、可验证、可追责。", subtitle_font, (190, 205, 225))

# Formula strip.
rounded(draw, (94, 752, 890, 818), 24, (18, 28, 48, 235), (80, 114, 165, 180), 1)
text(draw, (126, 770), "LLM + Tool 调度 + 工程安全网 + 验收反馈闭环", small_font, (255, 207, 111))

# Left code card.
rounded(draw, (94, 575, 755, 735), 22, (14, 22, 39, 242), (68, 86, 120, 170), 1)
for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
    draw.ellipse([sc(122 + i * 28), sc(602), sc(138 + i * 28), sc(618)], fill=color)
text(draw, (124, 635), "npm run build", mono_font, (83, 226, 160))
text(draw, (124, 671), "TS5097: import path ends with .tsx", mono_small, (255, 116, 116))
text(draw, (124, 699), "→ error becomes next Reason input", mono_small, (178, 196, 224))

# Right verification loop panel.
rounded(draw, (950, 110, 1506, 798), 34, (17, 26, 46, 235), (83, 111, 158, 180), 1)
text(draw, (995, 150), "Agent 验收闭环", subtitle_font, (238, 245, 255))
text(draw, (998, 198), "Reason → Act → Observe → Verify → Fix", small_font, (140, 160, 190))

nodes = [
    ("Reason", "拆需求", 1070, 292, (80, 190, 255)),
    ("Act", "调用 Tool", 1320, 292, (64, 208, 146)),
    ("Observe", "读日志", 1320, 485, (255, 194, 87)),
    ("Verify", "跑构建", 1070, 485, (147, 118, 255)),
    ("Fix", "自修复", 1195, 650, (255, 116, 116)),
]

node_boxes = {}
for name, desc, cx, cy, color in nodes:
    x0, y0, x1, y1 = cx - 95, cy - 48, cx + 95, cy + 48
    node_boxes[name] = (x0, y0, x1, y1)
    rounded(draw, (x0, y0, x1, y1), 22, (23, 35, 59, 245), color + (200,), 2)
    text(draw, (x0 + 25, y0 + 17), name, card_font, (238, 245, 255))
    text(draw, (x0 + 25, y0 + 55), desc, small_font, (172, 190, 216))


def arrow(start, end, color=(109, 132, 174, 210)):
    line(draw, [start, end], color, 4)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    size = 12
    p1 = (end[0] - size * math.cos(angle - 0.45), end[1] - size * math.sin(angle - 0.45))
    p2 = (end[0] - size * math.cos(angle + 0.45), end[1] - size * math.sin(angle + 0.45))
    draw.polygon([(sc(end[0]), sc(end[1])), (sc(p1[0]), sc(p1[1])), (sc(p2[0]), sc(p2[1]))], fill=color)


arrow((1166, 292), (1225, 292))
arrow((1320, 342), (1320, 435))
arrow((1224, 485), (1166, 485))
arrow((1070, 535), (1140, 612))
arrow((1252, 612), (1310, 535))

# Evidence chips.
chips = [
    ("文件存在", 995, 735),
    ("代码证据", 1122, 735),
    ("构建日志", 1248, 735),
    ("验收报告", 1374, 735),
]
for label, x, y in chips:
    rounded(draw, (x, y, x + 108, y + 38), 16, (28, 42, 68, 238), (74, 101, 148, 160), 1)
    text(draw, (x + 14, y + 7), label, small_font, (206, 221, 240))

# Small accent mark.
draw.arc([sc(1358), sc(112), sc(1488), sc(242)], 205, 342, fill=(80, 190, 255, 220), width=sc(7))
draw.arc([sc(1330), sc(84), sc(1516), sc(270)], 208, 340, fill=(64, 208, 146, 180), width=sc(4))

img = img.convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
out = OUT_DIR / "blog-cover-agent-verification.png"
img.save(out, quality=96)
print(out)
