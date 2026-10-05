"""Python accessor for the Foxhole field-paperwork design system.

This package ships the *generated* outputs of ``@gavmor/foxhole-styles`` --
the Style Dictionary token builds plus every binary asset -- as package data,
so Python consumers (WeasyPrint pipelines, the plate baker, docs generators)
read exactly the same values the CSS/LESS/JS consumers do.

Install it from a pinned repo URL::

    foxhole-styles @ git+https://github.com/gavmor/foxhole-styles.git@v1.0.0

Read tokens::

    import foxhole_styles as fx

    fx.token("fx-ink")            # '#26221a'   (also 'ink', '--fx-ink', 'fxInk')
    fx.token("paper.base")        # '#e9dec6'
    fx.tokens()["fx-font-body"]   # '"TT2020", "Courier Prime", monospace'
    fx.token_info("fx-ink").description

Resolve assets to real filesystem paths (what WeasyPrint and PIL need)::

    fx.print_css_path()                          # .../print/foxhole-print.css
    fx.font_path("tt2020-styleb-regular.ttf")    # .../fonts/...
    fx.plate_baker()                             # .../plate/make_plate.py
    fx.path("dist/tokens.print.css")             # anything, by package-relative path

Layout inside the installed package mirrors the repo, so the
package-root-relative paths recorded in ``dist/manifest.json`` resolve
verbatim against ``importlib.resources.files("foxhole_styles")``.
"""

from __future__ import annotations

import atexit
import hashlib
import json
import re
from contextlib import ExitStack
from dataclasses import dataclass
from importlib import resources
from pathlib import Path, PurePosixPath
from typing import Any, Dict, List, Mapping, Optional, Tuple

__all__ = [
    "Asset",
    "Token",
    "TOKENS_JSON",
    "MANIFEST_JSON",
    "__version__",
    "asset",
    "assets",
    "font_path",
    "fonts",
    "less_path",
    "manifest",
    "path",
    "plate_baker",
    "plate_image_path",
    "print_css_path",
    "read_bytes",
    "read_text",
    "resource",
    "theme_path",
    "token",
    "token_info",
    "token_names",
    "tokens",
    "tokens_css_path",
    "tokens_json_path",
    "tokens_of_type",
    "verify_assets",
    "version",
]

#: Package-relative path of the machine-readable token build.
TOKENS_JSON = "dist/tokens.json"
#: Package-relative path of the asset inventory.
MANIFEST_JSON = "dist/manifest.json"

_ANCHOR = resources.files(__name__)
_STACK = ExitStack()
atexit.register(_STACK.close)

_CAMEL_BOUNDARY = re.compile(r"(?<!^)(?=[A-Z])")


# --------------------------------------------------------------- resources


def _traverse(relpath: str):
    """Resolve a package-relative POSIX path to an importlib Traversable."""
    pure = PurePosixPath(str(relpath))
    if pure.is_absolute() or ".." in pure.parts:
        raise ValueError(f"not a package-relative path: {relpath!r}")
    node = _ANCHOR
    for part in pure.parts:
        node = node.joinpath(part)
    return node


def resource(relpath: str):
    """Return the ``importlib.resources`` Traversable for a packaged file.

    Use this when you want to stream or read without materialising a path.
    """
    node = _traverse(relpath)
    if not node.is_file() and not node.is_dir():
        raise FileNotFoundError(f"{relpath} is not packaged with foxhole_styles")
    return node


def path(relpath: str) -> Path:
    """Return a real filesystem :class:`~pathlib.Path` for a packaged file.

    Normal wheel installs are unpacked, so this is the installed file itself
    and costs nothing. If the package is ever loaded from a zip, the file is
    extracted to a temporary location that lives until interpreter exit.
    """
    node = _traverse(relpath)
    if not node.is_file():
        raise FileNotFoundError(f"{relpath} is not packaged with foxhole_styles")
    return Path(_STACK.enter_context(resources.as_file(node)))


def read_text(relpath: str, encoding: str = "utf-8") -> str:
    """Read a packaged text file."""
    return _traverse(relpath).read_text(encoding=encoding)


def read_bytes(relpath: str) -> bytes:
    """Read a packaged binary file."""
    return _traverse(relpath).read_bytes()


def _load_json(relpath: str) -> Dict[str, Any]:
    return json.loads(read_text(relpath))


# ------------------------------------------------------------------ tokens


@dataclass(frozen=True)
class Token:
    """One design token, as built by Style Dictionary.

    ``value`` is already resolved: aliases are flattened and colours are
    emitted in the same notation the CSS build uses. Numeric tokens
    (opacities, angles, line heights, font weights) come back as ``int`` or
    ``float``, matching ``dist/tokens.json``.
    """

    name: str
    value: Any
    type: str
    path: Tuple[str, ...]
    description: str = ""

    @property
    def css_var(self) -> str:
        """The CSS custom property this token is emitted as."""
        return f"--{self.name}"

    @property
    def css_reference(self) -> str:
        """``var(--fx-...)``, for splicing into generated stylesheets."""
        return f"var(--{self.name})"


_TOKEN_CACHE: Dict[str, Token] = {}


def _token_map() -> Mapping[str, Token]:
    if not _TOKEN_CACHE:
        raw = _load_json(TOKENS_JSON)
        for name, entry in raw.get("tokens", {}).items():
            _TOKEN_CACHE[name] = Token(
                name=name,
                value=entry.get("value"),
                type=entry.get("type", ""),
                path=tuple(entry.get("path", ())),
                description=entry.get("description", "") or "",
            )
    return _TOKEN_CACHE


def _normalise(name: str) -> List[str]:
    """Candidate token keys for a user-supplied name.

    Accepts ``fx-ink``, ``--fx-ink``, ``ink``, ``paper.base`` and ``fxInk``.
    """
    key = str(name).strip()
    if key.startswith("--"):
        key = key[2:]
    key = key.replace(".", "-")
    if any(c.isupper() for c in key):
        key = _CAMEL_BOUNDARY.sub("-", key).lower()
    candidates = [key]
    if not key.startswith("fx-"):
        candidates.append(f"fx-{key}")
    return candidates


_MISSING = object()


def tokens() -> Dict[str, Any]:
    """Every token as ``{"fx-ink": "#26221a", ...}`` with resolved values.

    The keys are the CSS custom property names minus the leading ``--``,
    which is also how ``dist/tokens.json`` and the JS ``tokens`` record key
    them.
    """
    return {name: tok.value for name, tok in _token_map().items()}


def token(name: str, default: Any = _MISSING) -> Any:
    """Resolved value of one token, by any of its spellings."""
    table = _token_map()
    for candidate in _normalise(name):
        if candidate in table:
            return table[candidate].value
    if default is not _MISSING:
        return default
    raise KeyError(f"unknown Foxhole token: {name!r}")


def token_info(name: str) -> Token:
    """Full :class:`Token` record (value, type, DTCG path, description)."""
    table = _token_map()
    for candidate in _normalise(name):
        if candidate in table:
            return table[candidate]
    raise KeyError(f"unknown Foxhole token: {name!r}")


def token_names() -> List[str]:
    """All token names, in build order."""
    return list(_token_map())


def tokens_of_type(type_: str) -> Dict[str, Token]:
    """Tokens filtered by DTCG ``$type`` (``color``, ``dimension``, ...)."""
    return {n: t for n, t in _token_map().items() if t.type == type_}


# ---------------------------------------------------------------- manifest


@dataclass(frozen=True)
class Asset:
    """One packaged binary or stylesheet, as inventoried in the manifest."""

    path: str
    role: str
    type: str
    bytes: int
    sha256: str

    def file(self) -> Path:
        """Resolve this asset to a real filesystem path."""
        return path(self.path)

    def read_bytes(self) -> bytes:
        return read_bytes(self.path)

    def verify(self) -> bool:
        """True if the installed bytes still match the recorded digest."""
        data = self.read_bytes()
        return (
            len(data) == self.bytes
            and hashlib.sha256(data).hexdigest() == self.sha256
        )


_MANIFEST_CACHE: Dict[str, Any] = {}


def manifest() -> Dict[str, Any]:
    """The raw ``dist/manifest.json`` document."""
    if not _MANIFEST_CACHE:
        _MANIFEST_CACHE.update(_load_json(MANIFEST_JSON))
    return _MANIFEST_CACHE


def assets(role: Optional[str] = None) -> List[Asset]:
    """Inventoried assets, optionally filtered by role.

    Roles in this release: ``font``, ``plate``, ``print-css``,
    ``homebrewery-theme``.
    """
    out = [
        Asset(
            path=entry["path"],
            role=entry.get("role", ""),
            type=entry.get("type", ""),
            bytes=int(entry.get("bytes", 0)),
            sha256=entry.get("sha256", ""),
        )
        for entry in manifest().get("assets", [])
    ]
    if role is not None:
        out = [a for a in out if a.role == role]
    return out


def asset(relpath: str) -> Asset:
    """One inventoried asset, by its package-relative path."""
    wanted = str(relpath).lstrip("/")
    for item in assets():
        if item.path == wanted:
            return item
    raise KeyError(f"not in dist/manifest.json: {relpath!r}")


def verify_assets(role: Optional[str] = None) -> List[str]:
    """Check installed assets against the manifest digests.

    Returns the paths that failed; an empty list means everything matched.
    """
    return [a.path for a in assets(role) if not a.verify()]


# --------------------------------------------------------- named shortcuts


def tokens_json_path() -> Path:
    """Path to ``dist/tokens.json``."""
    return path(TOKENS_JSON)


def tokens_css_path(variant: str = "web") -> Path:
    """Path to the token custom-property sheet.

    ``variant="web"`` gives px/unitless values, ``variant="print"`` gives the
    pt/in notation the WeasyPrint pipeline is written in.
    """
    if variant == "web":
        return path("dist/tokens.css")
    if variant == "print":
        return path("dist/tokens.print.css")
    raise ValueError(f"variant must be 'web' or 'print', got {variant!r}")


def less_path() -> Path:
    """Path to ``dist/tokens.less`` (the Homebrewery theme's ``@fx-*``)."""
    return path("dist/tokens.less")


def print_css_path() -> Path:
    """Path to ``print/foxhole-print.css``, the WeasyPrint pattern library."""
    return path("print/foxhole-print.css")


def fonts(suffix: Optional[str] = None) -> List[Path]:
    """Packaged font files, optionally filtered by suffix (``.ttf``/``.woff2``)."""
    out = [a.file() for a in assets("font") if a.path.startswith("fonts/")]
    if suffix:
        out = [p for p in out if p.suffix == suffix]
    return sorted(out)


def font_path(filename: str) -> Path:
    """Path to one packaged font, e.g. ``tt2020-styleb-regular.ttf``."""
    return path(f"fonts/{PurePosixPath(filename).name}")


def plate_baker() -> Path:
    """Path to ``plate/make_plate.py``, the aged-paper plate generator.

    Run it with the ambient interpreter (it needs Pillow)::

        subprocess.run([sys.executable, str(fx.plate_baker()),
                        "--pages", "3", "--out", "paper-plate.png"])
    """
    return path("plate/make_plate.py")


def plate_image_path() -> Path:
    """Path to the canonical pre-baked 150dpi portrait plate PNG."""
    return path("plate/foxhole-plate-150.png")


def theme_path(relpath: str = "") -> Path:
    """Path inside the packaged Homebrewery theme tree.

    ``theme_path()`` is the ``homebrewery/`` root;
    ``theme_path("themes/V3/Foxhole/style.less")`` is one file in it.
    """
    rel = f"homebrewery/{relpath}".rstrip("/")
    node = _traverse(rel)
    return Path(_STACK.enter_context(resources.as_file(node)))


# ----------------------------------------------------------------- version


def version() -> str:
    """The released version of the design system.

    Single-sourced from ``package.json`` at build time, so the Python
    distribution, the npm package and the git tag always agree.
    """
    try:
        from importlib.metadata import version as _dist_version

        return _dist_version("foxhole-styles")
    except Exception:  # pragma: no cover - source checkout without install
        return str(manifest().get("version", "0+unknown"))


__version__ = version()
