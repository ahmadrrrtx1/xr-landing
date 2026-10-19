#!/usr/bin/env python3
"""
Subset the two webfonts to the characters this site actually renders.

Both faces ship as full latin variable fonts (48 KB + 40 KB). The site
uses a small, knowable set of characters, so the faces are cut down to
exactly those plus a safety margin of ASCII, typographic punctuation
and the symbols the UI draws. The result is a smaller download with
identical rendering.

Run after a content change:

    python3 scripts/subset-fonts.py
"""

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "public" / "fonts"

# A generous safety net: everything printable in ASCII, the typographic
# characters the copy uses, and the glyphs the UI draws by hand.
SAFETY = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + " ¡¢£¤¥¦§¨©ª«¬®¯°±²³´µ¶·¸¹º»¼½¾¿"
    + "×÷–—‘’‚“”„†‡•…‰‹›€™"
    + "←↑→↓↔↕⇄⇅⇒⇔∀∂∃∇∈∏∑−∕∙√∞∫≈≠≡≤≥"
    + "─│┌┐└┘├┤┬┴┼━┃┏┓┗┛┣┫┳┻╋═║╔╗╚╝╠╣╦╩╬"
    + "▲▼◀▶◆◇●○★☆✓✕✦•—–"
    + "€₹₽₩₪¢"
)

# Characters that appear in the rendered HTML, in the client components,
# and in the recorded session transcripts the site replays.
SOURCES = [
    ROOT / ".next" / "server" / "app" / "index.html",
    ROOT / ".next" / "server" / "app" / "_not-found.html",
    ROOT / "public" / "cli" / "xr-session.txt",
]


def collect() -> str:
    chars = set(SAFETY)
    for path in SOURCES:
        if not path.exists():
            continue
        chars.update(path.read_text(encoding="utf-8", errors="ignore"))
    # The replay and the feature copy are rendered client-side from
    # lib/replay.ts and lib/features.ts.
    for rel in ("lib/replay.ts", "lib/features.ts", "lib/site.ts"):
        p = ROOT / rel
        if p.exists():
            chars.update(p.read_text(encoding="utf-8", errors="ignore"))
    return "".join(sorted(chars))


def subset(src: Path, dst: Path, text: str) -> None:
    cmd = [
        sys.executable,
        "-m",
        "fontTools.subset",
        str(src),
        f"--text={text}",
        "--flavor=woff2",
        "--layout-features=kern,liga,calt,ccmp,locl,mark,mkmk",
        "--no-hinting",
        "--desubroutinize",
        f"--output-file={dst}",
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    before = src.stat().st_size
    after = dst.stat().st_size
    print(
        f"  {src.name}: {before/1024:.1f} KB -> {after/1024:.1f} KB "
        f"({100 - after / before * 100:.0f}% smaller)"
    )


def main() -> None:
    text = collect()
    print(f"subsetting to {len(text)} distinct characters")

    work = FONTS / "_work"
    work.mkdir(exist_ok=True)

    inter = work / "inter.woff2"
    mono = work / "mono.woff2"
    subset(FONTS / "inter-latin-wght-normal.woff2", inter, text)
    subset(FONTS / "jetbrains-mono-latin-wght-normal.woff2", mono, text)

    inter.replace(FONTS / "inter-latin-wght-normal.woff2")
    mono.replace(FONTS / "jetbrains-mono-latin-wght-normal.woff2")
    for leftover in work.glob("*"):
        leftover.unlink()
    work.rmdir()
    print("done")


if __name__ == "__main__":
    main()
