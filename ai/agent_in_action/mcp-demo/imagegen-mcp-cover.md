# MCP 博客封面图生成方案

## 目标

生成一张真正具备 AI 图像模型质感的 MCP 博客封面图，风格为“可爱 + 赛博 + 高级科技博客封面”。

前一张 `mcp-cute-cyber-cover.png` 是本地代码绘制的 PNG，只适合作为构图草图，不适合作为最终封面。最终版本应使用图像模型生成主视觉，再后期叠加中文标题。

## 推荐策略

不要让图像模型直接生成中文标题。

原因：

- 中文文字容易变形、错字或糊掉
- 图像模型更擅长生成主视觉、材质、光影和氛围
- 标题和副标题应由后期排版控制，保证清晰、可修改、可复用

正确流程：

1. 生成无文字主视觉
2. 选出构图最好的版本
3. 用 HTML、PPT、Figma、Canva 或代码叠加标题
4. 导出最终博客封面

## 图像生成 Prompt

```text
A polished cute cyberpunk blog hero illustration about an AI agent connecting tools, resources, and real systems through MCP.

Scene:
A charming small robot assistant floats at the center of a futuristic workspace. Around it are glowing tool nodes, resource cards, data streams, and protocol connectors, visually suggesting Model Context Protocol, tool calling, resource context, and cross-process communication.

Style:
Premium tech editorial illustration, cute but not childish, high-end digital art, soft 3D illustration mixed with cyberpunk UI elements, refined and modern, similar quality to a polished AI product launch visual.

Composition:
Wide 16:9 hero image. Central mascot with generous negative space on the left side for later title text. Balanced depth, clean visual hierarchy, no clutter.

Lighting:
Soft volumetric lighting, cyan and magenta neon glow, subtle rim light, glossy materials, gentle reflections, atmospheric depth.

Color palette:
Deep navy and near-black background, cyan, magenta, violet, and small mint highlights. Avoid cheap rainbow colors.

Details:
The robot should feel friendly and intelligent. Add small floating interface panels, cable-like light trails, abstract server blocks, tool icons, and resource document cards. Make everything coherent and premium.

Constraints:
No text, no letters, no logos, no watermarks, no brand marks, no distorted typography. Do not include any readable UI text. Do not make it look like flat vector clipart.
```

## 推荐 CLI 命令

需要先设置 `OPENAI_API_KEY`，并允许网络访问。

PowerShell：

```powershell
$env:IMAGE_GEN = "$env:USERPROFILE\.codex\skills\.system\imagegen\scripts\image_gen.py"
python $env:IMAGE_GEN generate `
  --prompt-file prompts/mcp-cute-cyber-hero.prompt.txt `
  --use-case "stylized-concept" `
  --style "premium cute cyberpunk tech editorial illustration, soft 3D, polished AI product visual" `
  --composition "wide 16:9 hero image, central cute robot mascot, negative space on the left for title text" `
  --constraints "no text, no logos, no watermark, no readable UI text, no flat vector clipart" `
  --quality high `
  --size 2048x1152 `
  --out output/imagegen/mcp-cute-cyber-hero.png
```

## 后期标题建议

主标题：

```text
MCP Agent
```

副标题：

```text
让 AI 连接工具、资源与真实系统
```

排版建议：

- 标题放左侧负空间
- 使用白色或浅青色大标题
- 副标题用较小字号，透明度 80% 左右
- 不要把文字交给图像模型生成

## 验收标准

生成结果应满足：

- 不是扁平矢量草图
- 有明显空间深度、材质、光影
- 主体可爱但不幼稚
- 画面能表达 Agent、Tool、Resource、Protocol 的连接关系
- 左侧有足够空间放标题
- 无文字、无水印、无品牌标识
