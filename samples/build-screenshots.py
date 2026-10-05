#!/usr/bin/env python3
"""Resize + JPEG-compress samples/pattern-showcase-*.png -> docs/screenshots.

Keep JPEG at ~82 quality: aged-paper gradients compress gracefully, text
stays sharp, and both pages land under 250 KB each.
"""
from __future__ import annotations

import os
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
DEST = HERE.parent / "docs" / "screenshots"
DEST.mkdir(parents=True, exist_ok=True)

for n in (1, 2):
    src = HERE / f"pattern-showcase-{n}.png"
    out = DEST / f"pattern-showcase-{n}.jpg"
    if not src.exists():
        raise SystemExit(f"missing {src} — run pdftoppm first (see samples/README.md)")
    im = Image.open(src).convert("RGB")
    im.thumbnail((1000, 1300), Image.Resampling.LANCZOS)
    im.save(out, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"{out.relative_to(HERE.parent)}: {os.path.getsize(out):,} bytes, {im.size}")
