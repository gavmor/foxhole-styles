# foxhole-styles

The **Foxhole field-paperwork design system** — alt-history WWI/WWII
typewritten staff paperwork: baked aged-paper plates, TT2020 typewriter
body with contextual alternates, Special Elite display type, overstrike
bold, ruled section headings, specification tables, dirty-white
correction patches, rubber stamps, routing blocks, and mastheads.

This repo is the **single source of truth** for the Foxhole look. It is a
shared dependency of:

- **gavmor/diegetic-docs** — the skill that generates diegetic in-world
  documents and planning charts (WeasyPrint pipeline).
- **gavmor/homebrewery** — the Homebrewery fork whose default V3 theme is
  Foxhole.

## Layout

```
tokens/                Design tokens in W3C DTCG format — THE SOURCE
  color.tokens.json      ink, stamp, paper, plate-aging palette
  typography.tokens.json faces, sizes, type scale, leading, tracking
  space.tokens.json      spacing scale, @page geometry, rule weights
  effect.tokens.json     patch shadow, stamp tilt, overstrike offset
dist/                  Generated outputs — DO NOT EDIT (committed, see below)
scripts/
  validate-tokens.mjs    DTCG gate (npm run validate)
  build.mjs              Style Dictionary build (npm run build)
  build-manifest.mjs     asset inventory with sha256
  check-contract.mjs     output contract gate (npm test)
fonts/                 TT2020 Style B (regular + italic, TTF + woff2, OFL)
                       Special Elite (regular, TTF + woff2, Apache 2.0)
plate/
  make_plate.py          Bake aged-paper @page plate PNGs (needs Pillow)
  foxhole-plate-150.png  Canonical baked plate, 150dpi, portrait
print/
  foxhole-print.css      WeasyPrint pattern library: masthead, routing,
                         stamp, spec tables, section heads, note boxes,
                         correction patches, @page rules
homebrewery/
  themes/V3/Foxhole/     The V3 theme: style.less, settings.json,
                         snippets.js, picker art
  themes/fonts/Foxhole/  woff2 faces + fonts.less
  themes/assets/         foxholePlate.png
pyproject.toml         The Python distribution (`foxhole-styles`)
foxhole_styles/        Its import package — the accessor API
tests/                 unittest suite for the Python package
```

## Tokens

### Build

```bash
npm install
npm run build     # validate, then Style Dictionary -> dist/
npm test          # assert the dist/ contract still holds
npm run check     # build + test + fail if dist/ drifted from the tokens
```

`dist/` is **committed**. Python consumers install this repo straight from a
pinned Git URL and never run npm, so the generated artifacts have to be in
the tree. `npm run check` is the guard: it rebuilds, re-tests and fails on
`git diff -- dist`, so a committed `dist/` can never drift from `tokens/`.
The build is deterministic — no timestamps, stable ordering — so two builds
of the same tokens are byte-identical.

### Outputs

| File | For | Units |
|---|---|---|
| `dist/tokens.css` | web / Homebrewery, CSS custom properties | px, unitless |
| `dist/tokens.print.css` | WeasyPrint print pipeline, same property names | pt, in, px |
| `dist/tokens.less` | the Homebrewery V3 theme (`@fx-*`) | px, unitless |
| `dist/tokens.js` + `.d.ts` | JS/TS consumers — named exports plus a `tokens` record | px, unitless |
| `dist/tokens.json` | Python and anything else machine-readable | px, unitless |
| `dist/manifest.json` | asset inventory: path, role, bytes, sha256 | — |

Every output exposes the **same 84 token names**; `npm test` enforces that,
plus value parity between the CSS, LESS and JSON outputs.

### Naming

A token's output name is `fx-` plus its path through the DTCG files, joined
with hyphens: `ink` → `--fx-ink`, `paper.base` → `--fx-paper-base`,
`font-size.body` → `--fx-font-size-body`. LESS gets `@fx-ink`, JS gets
`fxInk`, JSON keys on `fx-ink`.

The 18 custom properties the hand-written `tokens.css` used to ship are
frozen: `scripts/check-contract.mjs` fails the build if any of them is
renamed or changes value. `print/foxhole-print.css` and the Homebrewery
theme are written against those names.

### Reading the tokens

CSS / WeasyPrint:

```css
@import "@gavmor/foxhole-styles/tokens.print.css";   /* or tokens.css on the web */
body { color: var(--fx-ink); font-family: var(--fx-font-body); }
```

LESS (Homebrewery theme):

```less
@import (less) './dist/tokens.less';
:root { --HB_Color_Ink: @fx-ink; --HB_Color_StampRed: @fx-stamp; }
```

JavaScript:

```js
import tokens, { fxInk } from '@gavmor/foxhole-styles';
```

Python:

```python
import foxhole_styles as fx
fx.token("fx-ink")        # '#26221a'
```

See [Python package](#python-package) for the install line and the rest of
the accessor.

### Units, and why the dimensions are in px

The DTCG `dimension` type only admits `px` and `rem` (spec §8.2.1), so every
absolute measure is **authored in px** even though the print pipeline is
written in points and inches. All three units are absolute and exact
(`1in = 96px`, `1pt = 4/3 px`), so the print build converts notation without
changing magnitude: `--fx-font-size-body` is `14px` in `tokens.css` and
`10.5pt` in `tokens.print.css`. Which unit each measure prints in is a
table at the top of `scripts/build.mjs`, chosen to reproduce how
`print/foxhole-print.css` was originally written. `npm test` round-trips
every absolute length between the two builds and fails on any drift.

Values that are relative in the web theme (`em` type scale, `em` tracking,
line-heights, opacities, rotation angles) are unitless `number` tokens:
multiply them locally, e.g.
`letter-spacing: calc(1em * var(--fx-tracking-scale-section))` or
`transform: rotate(calc(var(--fx-angle-stamp-web) * 1deg))`.

### Validation

`npm run validate` is a real DTCG gate, not a lint pass. It checks file
naming, group/token name legality, `$type` resolution through ancestor
groups, the 2025.10 value shape for every type in use, `px`/`rem`-only
dimension units, alias resolution and cycles, output-name collisions, and
that each colour's sRGB components still agree with its canonical hex.

Style Dictionary v5 is used rather than v4 because v5.3/v5.4 added support
for the DTCG 2025.10 structured `color` and `dimension` values that these
token files are authored in; v4 only understands the older string forms.

### Known gaps

- `print/foxhole-print.css` and the Homebrewery `style.less` still carry
  their own literals. They consume the `--fx-*` colour and face tokens but
  not yet the size, spacing and effect tokens; rewiring them is consumer
  work with a rasterize-and-look QA pass attached.
- The Homebrewery theme's vertical rhythm is expressed in centimetres
  (`0.325cm` paragraph gap and friends). Centimetres are not a legal DTCG
  dimension unit and the cm values do not line up with the print px scale,
  so that rhythm is not tokenised yet.

## Python package

The same tokens and assets, for Python consumers (the diegetic-docs
WeasyPrint pipeline, the plate baker, anything that generates CSS). There is
no PyPI release — install it from a **pinned repo URL**:

```bash
pip install "foxhole-styles @ git+https://github.com/gavmor/foxhole-styles.git@v1.0.0"
```

or in a consumer's `pyproject.toml`:

```toml
dependencies = [
  "foxhole-styles @ git+https://github.com/gavmor/foxhole-styles.git@v1.0.0",
]
```

Distribution name `foxhole-styles`, import package `foxhole_styles`,
`pyproject.toml` at the repo root — so the URL needs **no `#subdirectory=`
fragment**. Pin a tag (or, for a fully reproducible lock, the tag's commit
SHA); never pin a branch.

The distribution version is read out of `package.json` at build time
(`[tool.hatch.version]` with a regex source), so there is no second version
literal to forget: a Changesets bump moves the npm package, the git tag and
the wheel together, and `@v1.2.3` can never install a wheel claiming
something else.

### Reading tokens

```python
import foxhole_styles as fx

fx.token("fx-ink")                  # '#26221a'
fx.token("ink")                     # same — 'fx-' prefix optional
fx.token("paper.base")              # '#e9dec6' — DTCG path spelling
fx.token("fxInk")                   # same — JS spelling
fx.token("fx-angle-stamp-print")    # -9  (numbers stay numbers)

fx.tokens()                         # {'fx-ink': '#26221a', ...} all 84
fx.token_names()
fx.tokens_of_type("color")

t = fx.token_info("fx-paper-base")
t.value, t.type, t.path, t.description   # '#e9dec6', 'color', ('paper','base'), '…'
t.css_var, t.css_reference               # '--fx-paper-base', 'var(--fx-paper-base)'
```

Values are the resolved ones — identical to `dist/tokens.js` and
`dist/tokens.json`, and identical to `dist/tokens.css` except for the one
token the CSS build emits as a `var()` reference (`--fx-shadow-patch`), which
Python gives you flattened. `tests/test_accessor.py` asserts that parity
against the packaged CSS, print CSS, LESS, JS and `.d.ts` outputs, so an
import can never disagree with a stylesheet.

### Reading assets

Everything the npm package ships is packaged data, laid out under the import
package exactly as it is in the repo, so the package-root-relative paths in
`dist/manifest.json` resolve verbatim:

```python
fx.print_css_path()                         # …/print/foxhole-print.css
fx.font_path("tt2020-styleb-regular.ttf")   # …/fonts/…
fx.fonts(".ttf")                            # all three TTFs
fx.plate_baker()                            # …/plate/make_plate.py
fx.plate_image_path()                       # the pre-baked 150dpi plate
fx.tokens_css_path("print")                 # …/dist/tokens.print.css
fx.theme_path("themes/V3/Foxhole/style.less")
fx.path("dist/tokens.json")                 # anything, by relative path
```

`fx.path()` returns a real `pathlib.Path` (what WeasyPrint, Pillow and
`subprocess` need), extracting from a zip import only if it ever has to. The
plain `importlib.resources` spelling works too:

```python
from importlib.resources import files
files("foxhole_styles").joinpath("print").joinpath("foxhole-print.css")
```

The manifest is exposed with its digests, so a consumer can prove it loaded
the bytes the release shipped:

```python
fx.assets("font")           # [Asset(path='fonts/OFL.txt', role='font', …), …]
fx.asset("print/foxhole-print.css").sha256
fx.verify_assets()          # [] — every installed asset matches the manifest
```

Baking plates from the installed package:

```python
import subprocess, sys, foxhole_styles as fx
subprocess.run([sys.executable, str(fx.plate_baker()),
                "--pages", "3", "--dpi", "150", "--out", "paper-plate.png"],
               check=True)       # needs Pillow in the consumer's env
```

### Tests

```bash
python -m unittest discover -s tests -v
```

`tests/test_accessor.py` runs against the installed package alone and is the
post-install smoke test; `tests/test_repo_sync.py` additionally checks the
installed bytes against the checkout and that the version is still
single-sourced from `package.json` (it skips when there is no checkout).

### Building it by hand

`python -m build` writes into `dist/` by default, which here is the committed
token build — always redirect it:

```bash
python -m build --outdir build-artifacts
```

## Plates

WeasyPrint drops all but one `background-image` layer on `@page`, so the
whole page background — paper tone, grain, stains, vignette, crease — is
baked into a single PNG per page:

```bash
pip install pillow
python3 plate/make_plate.py --pages 3 --dpi 150 --out assets/paper-plate.png
```

`--pages N` derives deterministic per-page seeds so consecutive sheets get
different coffee rings, creases, drips, and smudges. Options: `--seed`,
`--stains`, `--no-crease`, `--no-drips`, `--no-smudges`, `--format
portrait|landscape`, `--page N`.

The plate baker's palette constants (`BASE`, `PATCH`, `CREASE`,
`HIGHLIGHT`, `SMUDGE`, `STAIN`, `DARK`) are mirrored as tokens
(`--fx-paper-base`, `--fx-crease`, …) so documents can tint UI chrome to
match the paper they are printed on.

## Versioning

Changesets manages versions and the changelog. Asset policy:

- **patch** — regenerated output with no visual change
- **minor** — new fonts, tokens, themes or patterns
- **major** — removed or renamed tokens, dropped font families, breaking
  LESS variable changes, manifest schema changes
