# 《时空语航员》文生图提示词 · 武器 / Boss / 宠物

> **必须透明底**：主体 cutout，真正 PNG alpha。  
> Agnes 常仍会画出实心底 → 生成后用 skill 脚本里的 **rembg** 抠图。  
> 推荐分辨率：`1K` + `1:1`（1024×1024）。  
> 自动化：见 `.cursor/skills/agnes-game-art/`。

---

## 统一风格前缀（每条都要带）

**中文前缀：**
```
儿童向太空科幻游戏立绘，Q版半立体，圆润可爱，精细材质，柔和体积光，轻微发光边缘，
主体居中且四周留白，孤立抠图素材，透明背景 PNG（带 alpha），禁止任何背景、地面、
地板投影、环境、星空画布、纯色底，无文字无水印无UI，高清晰游戏图标
```

**English prefix（Agnes 建议用英文主体描述）：**
```
Cute chibi space-fantasy game asset for kids, semi-3D stylized, rounded friendly shapes,
premium material detail, soft volumetric lighting, subtle rim glow, subject centered with
generous empty margin, isolated cutout, transparent background PNG with alpha channel,
no backdrop, no floor, no ground shadow, no environment, no scenery, no solid black canvas,
no nebula background fill, no text, no watermark, no UI frame, crisp game-icon rendering
```

**负向约束（追加在提示词末尾）：**
```
Avoid: solid background, black backdrop, space nebula background, floor, ground shadow,
studio backdrop, checkerboard, photo realism, horror, blood, readable English words,
watermark, logo, UI, clutter, lowres, blurry
```

---

## 一、武器（5）

| 文件 | 英文 subject（拼到前缀后） |
|------|---------------------------|
| `weapon-pulse.png` | A sleek single-barrel pulse laser cannon, cyan-blue energy core, silver-white metal body, soft cyan muzzle glow and tiny particles, clean starter weapon, slight low-angle front view, game item icon |
| `weapon-plasma.png` | A twin-barrel plasma cannon, two purple energy barrels, bright violet crystal core in the center, deep purple and silver body, soft plasma arcs at both muzzles, cool but kid-friendly, game item icon |
| `weapon-flame.png` | A flame thrower cannon with stylized orange-to-crimson energy fire at the muzzle, dark orange metal body with heat fins, warm powerful look, cartoon flame not realistic fire, kid-safe, game item icon |
| `weapon-frost.png` | A frost crystal cannon with translucent ice-blue crystal prisms set into the barrel, frosty vapor and tiny ice particles at the muzzle, cool specular highlights, jewel-like premium look, game item icon |
| `weapon-thunder.png` | A thunder arc cannon with golden lightning patterns wrapping the body, bright electric arcs and gold-white sparks at the muzzle, deep gold and black armor plating, legendary crit weapon vibe, majestic but kid-friendly, game item icon |

### 示例完整提示词 · 脉冲光炮

```
Cute chibi space-fantasy game asset for kids, semi-3D stylized, rounded friendly shapes, premium material detail, soft volumetric lighting, subtle rim glow, subject centered with generous empty margin, isolated cutout, transparent background PNG with alpha channel, no backdrop, no floor, no ground shadow, no environment, no scenery, no solid black canvas, no nebula background fill, no text, no watermark, no UI frame, crisp game-icon rendering. A sleek single-barrel pulse laser cannon, cyan-blue energy core, silver-white metal body, soft cyan muzzle glow and tiny particles, clean starter weapon, slight low-angle front view, game item icon. Avoid: solid background, black backdrop, space nebula background, floor, ground shadow, studio backdrop, checkerboard, photo realism, horror, blood, readable English words, watermark, logo, UI, clutter, lowres, blurry
```

---

## 二、Boss（4 · 进化递增）

| 文件 | 英文 subject |
|------|-------------|
| `boss-listen.png` | A purple Listening Devourer alien monster, chubby round body, oversized headphone-like ear fins, sonic wave emblem on chest, curious squinted eyes, adorable mildly mischievous, smaller stage-1 boss, game enemy character |
| `boss-read.png` | A sky-blue Reading Devourer alien monster, eyes glowing like magnifying lenses, floating translucent rune shards around shoulders with no readable letters, clever expression, slightly larger than stage-1, game enemy character |
| `boss-spell.png` | A pink-magenta Spelling Devourer octopus-like alien, tentacles wrapping colorful alphabet building blocks that are abstract and not readable real words, inky pink-purple glow, playful tongue-out expression, mid-size stage-3 boss, game enemy character |
| `boss-speak.png` | A red-gold Speaking Devourer final boss, cute dragon-like space beast, glowing sonic resonance core in the throat, golden energy patterns on fins and horns, majestic not scary, big cartoon eyes, largest stage-4 epic game boss character |

---

## 三、宠物（3）

| 文件 | 英文 subject |
|------|-------------|
| `pet-star-fox.png` | A Star Dust Fox space pet, orange-gold little fox with sparkling stardust fur, big friendly eyes, fluffy tail tipped with tiny flame-like starlight, loyal companion vibe, sitting front view, game companion character |
| `pet-nebula-cat.png` | A Nebula Cat space pet, purple-and-white kitten with nebula-swirl eyes, golden ear tips, soft lavender nebula wisps floating around the body only, elegant mysterious yet adorable, sitting front view, game companion character |
| `pet-crystal-dragon.png` | A Crystal Chinese dragon space pet, cute chibi Eastern long dragon (shenlong style), serpentine body coiled in a gentle S-shape, no bat wings, small antler-like horns and whiskers, translucent ice-cyan crystal scales with cut-gem facets, pearl-like bright eyes, flowing mane and tail tip with rainbow refraction, auspicious cloud wisps around the body only, gentle healing guardian vibe, front 3/4 view, kid-friendly, game companion character |

---

## Agnes API 速查

```bash
export AGNES_API_KEY=...
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer $AGNES_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.1-flash",
    "prompt": "<完整英文提示词>",
    "size": "1K",
    "ratio": "1:1",
    "return_base64": true
  }'
```

注意：`response_format` 若用 URL 模式，必须放在 `extra_body` 内，不能顶层。

---

## 一键生成（推荐）

```bash
pip install rembg pillow
export AGNES_API_KEY=...
python3 .cursor/skills/agnes-game-art/scripts/generate.py --all
```

脚本会：调 Agnes → rembg 抠透明 → 写入 `assets/images/`。
