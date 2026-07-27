---
name: agnes-game-art
description: >-
  Generate Language Astronauts game art (weapons, bosses, pets, ships) via Agnes Image
  API with transparent-background prompts and rembg post-processing. Use when
  the user asks to regenerate assets, call Agnes/Agnes AI image API, fix opaque
  backgrounds, or produce PNGs for assets/images.
---

# Agnes Game Art Generator

Generate kid-friendly space game icons for **Language Astronauts** using Agnes Image API, then force true alpha with `rembg`.

## When to use

- Regenerate weapons / bosses / pets / ships under `assets/images/`
- User mentions Agnes API / `agnes-image-2.1-flash`
- Current PNGs have solid (non-transparent) backgrounds

## Hard requirements

1. **Output**: PNG with real alpha (`RGBA`), 1:1, target `1024x1024` (`size: "1K"` + `ratio: "1:1"` or `1024x1024`)
2. **Filenames**: must match catalog (`weapon-pulse.png`, `boss-listen.png`, …)
3. **Do not** put API keys in git, prompts files, or chat logs
4. Agnes often **does not** return true transparency even if prompted — **always run rembg** unless user forbids it

## Auth

```bash
export AGNES_API_KEY="..."
```

Endpoint: `POST https://apihub.agnes-ai.com/v1/images/generations`

Default model: `agnes-image-2.1-flash`

## Workflow

Copy and track:

```
- [ ] Confirm AGNES_API_KEY is set
- [ ] Install deps: pip install rembg pillow
- [ ] Dry-run prompts
- [ ] Generate selected or all assets
- [ ] Spot-check alpha (transparent checker in Preview / browser)
- [ ] If Web already wired, hard-refresh GitHub Pages / local server
```

### 1) Dry-run

From repo root:

```bash
python3 .cursor/skills/agnes-game-art/scripts/generate.py --all --dry-run
```

### 2) Generate all

```bash
python3 .cursor/skills/agnes-game-art/scripts/generate.py --all
```

### 3) Generate one / few

```bash
python3 .cursor/skills/agnes-game-art/scripts/generate.py --id weapon-pulse --id boss-speak
```

### 4) Skip rembg (not recommended)

```bash
python3 .cursor/skills/agnes-game-art/scripts/generate.py --id pet-star-fox --no-rembg
```

## Prompt rules (must follow)

Full catalog: [asset-catalog.json](asset-catalog.json)

Every prompt = `stylePrefix` + `subject` + `negativeHint`.

**Must include (transparency):**

- `isolated cutout`
- `transparent background PNG with alpha channel`
- `no backdrop, no floor, no ground shadow, no environment, no scenery`

**Must avoid:**

- solid black / space nebula as a filled canvas
- readable English words on bosses (use abstract letter blocks)
- horror / blood / photoreal guns

If regenerating from an existing opaque image, prefer **text-to-image regenerate** (cleaner) over img2img unless user wants to keep pose.

## API request shape

Text-to-image + Base64 (preferred for script save):

```json
{
  "model": "agnes-image-2.1-flash",
  "prompt": "<stylePrefix>. <subject>. <negativeHint>",
  "size": "1K",
  "ratio": "1:1",
  "return_base64": true
}
```

URL mode (manual):

```json
{
  "model": "agnes-image-2.1-flash",
  "prompt": "...",
  "size": "1K",
  "ratio": "1:1",
  "extra_body": { "response_format": "url" }
}
```

Notes from Agnes docs:

- Put `response_format` **inside** `extra_body`, never top-level
- Timeout client `60–360s`
- Do not send `tags: ["img2img"]`

## Quality checklist after generate

- [ ] File opens as PNG with alpha (not flattened JPEG-like)
- [ ] Subject centered, margins clear
- [ ] No full-bleed black rectangle background
- [ ] Soft rim glow ok; hard drop-shadow on a floor not ok
- [ ] Display in game stays small via existing CSS (`game-asset` / `asset-box`)

## Related docs

Human-readable prompt pack (kept in sync with catalog subjects):

`docs/art/prompts-weapons-bosses-pets.md`
