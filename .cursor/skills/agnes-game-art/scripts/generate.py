#!/usr/bin/env python3
"""Generate Language Astronauts game art via Agnes Image API.

Requires:
  export AGNES_API_KEY=...

Optional (recommended for true alpha):
  pip install rembg pillow
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API_URL = "https://apihub.agnes-ai.com/v1/images/generations"
DEFAULT_CATALOG = Path(__file__).resolve().parent.parent / "asset-catalog.json"


def load_catalog(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def build_prompt(catalog: dict, asset: dict) -> str:
    return (
        f"{catalog['stylePrefix']}. "
        f"{asset['subject']}. "
        f"{catalog.get('negativeHint', '')}"
    ).strip()


def call_agnes(api_key: str, model: str, prompt: str, size: str, ratio: str) -> bytes:
    payload = {
        "model": model,
        "prompt": prompt,
        "size": size,
        "ratio": ratio,
        "return_base64": True,
    }
    # Prefer exact 1024 when supported; keep tier+ratio as fallback fields already set.
    if size in ("1K", "1024x1024"):
        payload["size"] = "1024x1024" if size == "1024x1024" else "1K"

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Agnes HTTP {e.code}: {detail}") from e

    items = body.get("data") or []
    if not items:
        raise SystemExit(f"Unexpected response (no data): {body}")

    item = items[0]
    if item.get("b64_json"):
        return base64.b64decode(item["b64_json"])
    if item.get("url"):
        with urllib.request.urlopen(item["url"], timeout=120) as img_resp:
            return img_resp.read()
    raise SystemExit(f"No image payload in response: {item}")


def remove_background(png_bytes: bytes) -> bytes:
    try:
        from io import BytesIO

        from PIL import Image
        from rembg import remove
    except ImportError as e:
        raise SystemExit(
            "rembg/Pillow not installed. Run: pip install rembg pillow\n"
            f"Original error: {e}"
        ) from e

    out = remove(png_bytes)
    # Ensure PNG with alpha
    img = Image.open(BytesIO(out)).convert("RGBA")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def save_bytes(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate game art with Agnes API")
    parser.add_argument("--catalog", type=Path, default=DEFAULT_CATALOG)
    parser.add_argument("--out", type=Path, default=None, help="Output directory")
    parser.add_argument("--id", action="append", dest="ids", help="Asset id (repeatable)")
    parser.add_argument("--all", action="store_true", help="Generate all catalog assets")
    parser.add_argument("--model", default=None)
    parser.add_argument("--size", default=None, help='e.g. 1K or 1024x1024')
    parser.add_argument("--ratio", default=None, help="e.g. 1:1")
    parser.add_argument(
        "--no-rembg",
        action="store_true",
        help="Skip rembg alpha matting (not recommended)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print prompts only")
    parser.add_argument("--sleep", type=float, default=1.0, help="Delay between requests")
    args = parser.parse_args()

    catalog = load_catalog(args.catalog)
    repo_root = Path(__file__).resolve().parents[4]
    out_dir = args.out or (repo_root / catalog.get("outputDir", "assets/images"))

    assets = catalog["assets"]
    if args.ids:
        wanted = set(args.ids)
        assets = [a for a in assets if a["id"] in wanted]
        missing = wanted - {a["id"] for a in assets}
        if missing:
            raise SystemExit(f"Unknown asset ids: {sorted(missing)}")
    elif not args.all:
        raise SystemExit("Specify --all or --id <asset-id>")

    api_key = os.environ.get("AGNES_API_KEY", "").strip()
    if not args.dry_run and not api_key:
        raise SystemExit("Set AGNES_API_KEY environment variable")

    model = args.model or catalog.get("model", "agnes-image-2.1-flash")
    size = args.size or catalog.get("size", "1K")
    ratio = args.ratio or catalog.get("ratio", "1:1")

    for i, asset in enumerate(assets):
        prompt = build_prompt(catalog, asset)
        out_path = out_dir / asset["file"]
        print(f"[{i + 1}/{len(assets)}] {asset['id']} -> {out_path}")
        if args.dry_run:
            print(prompt)
            print("---")
            continue

        raw = call_agnes(api_key, model, prompt, size, ratio)
        if args.no_rembg:
            final = raw
        else:
            print("  rembg: removing background...")
            final = remove_background(raw)
        save_bytes(out_path, final)
        print(f"  saved {out_path.stat().st_size} bytes")
        if i < len(assets) - 1 and args.sleep > 0:
            time.sleep(args.sleep)

    return 0


if __name__ == "__main__":
    sys.exit(main())
