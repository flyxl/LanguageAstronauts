#!/usr/bin/env python3
"""Scaffold Cocos Creator 3.8.x project files into app/ for Native Android builds."""

from __future__ import annotations

import json
import shutil
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "app"
EMPTY = Path(
    "/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/templates/empty-2d"
)
SCENE2D = Path(
    "/Applications/Cocos/Creator/3.8.7/CocosCreator.app/Contents/Resources/"
    "resources/3d/engine/editor/assets/default_file_content/scene"
)


def write_json(path: Path, data: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def dir_meta(path: Path) -> None:
    write_json(
        path,
        {
            "ver": "1.2.0",
            "importer": "directory",
            "imported": True,
            "uuid": str(uuid.uuid4()),
            "files": [],
            "subMetas": {},
            "userData": {},
        },
    )


def main() -> None:
    if not EMPTY.exists():
        raise SystemExit(f"Missing Creator empty-2d template: {EMPTY}")

    pkg_path = ROOT / "package.json"
    pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
    pkg["name"] = "LanguageAstronauts"
    pkg["uuid"] = str(uuid.uuid4())
    pkg["creator"] = {"version": "3.8.7"}
    pkg["version"] = "3.8.7"
    write_json(pkg_path, pkg)

    write_json(
        ROOT / "project.json",
        {
            "general": {
                "designResolution": {"width": 720, "height": 1280, "fitHeight": True}
            }
        },
    )

    for rel in (".creator", "settings"):
        src = EMPTY / rel
        dst = ROOT / rel
        if dst.exists():
            shutil.rmtree(dst)
        shutil.copytree(src, dst)

    shutil.copy2(EMPTY / "tsconfig.json", ROOT / "tsconfig.json")
    gi = (EMPTY / ".gitignore").read_text(encoding="utf-8")
    (ROOT / ".gitignore").write_text(gi + "\ncoverage/\n", encoding="utf-8")

    scene_dir = ROOT / "assets" / "scenes"
    pres = ROOT / "assets" / "scripts" / "presentation"
    scene_dir.mkdir(parents=True, exist_ok=True)
    pres.mkdir(parents=True, exist_ok=True)

    scene_uuid = str(uuid.uuid4())
    script_uuid = str(uuid.uuid4())

    shutil.copy2(SCENE2D / "scene-2d.scene", scene_dir / "Boot.scene")
    write_json(
        scene_dir / "Boot.scene.meta",
        {
            "ver": "1.1.50",
            "importer": "scene",
            "imported": True,
            "uuid": scene_uuid,
            "files": [".json"],
            "subMetas": {},
            "userData": {},
        },
    )

    for meta in (
        ROOT / "assets" / "scenes.meta",
        ROOT / "assets" / "scripts.meta",
        ROOT / "assets" / "scripts" / "presentation.meta",
        ROOT / "assets" / "config.meta",
        ROOT / "assets" / "content.meta",
    ):
        if not meta.exists():
            dir_meta(meta)

    write_json(ROOT / ".creator-ids.json", {"scene": scene_uuid, "script": script_uuid})
    print(json.dumps({"scene": scene_uuid, "script": script_uuid}))


if __name__ == "__main__":
    main()
