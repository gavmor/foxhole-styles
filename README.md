# foxhole-styles

The **Foxhole field-paperwork design system** — alt-history WWI/WWII
typewritten staff paperwork: baked aged-paper plates, TT2020 typewriter
body with contextual alternates, Special Elite display type, overstrike
bold, ruled section headings, specification tables, dirty-white
correction patches, rubber stamps, routing blocks, and mastheads.

This repo is the **single source of truth** for the Foxhole look. It is a
shared dependency of:

- **gavmor/diegetic-docs** — the skill that generates diegetic in-world
  documents and planning charts (WeasyPrint pipeline). Syncs from here
  via `bin/sync-styles.sh`.
- **gavmor/homebrewery** — the Homebrewery fork whose default V3 theme is
  Foxhole. Consumes this repo as an npm dependency and materializes the
  theme at build time via `scripts/sync-foxhole-styles.js`.

## Layout

```
fonts/          TT2020 Style B (regular + italic, TTF + woff2, OFL)
                Special Elite (regular, TTF + woff2, Apache 2.0)
plate/
  make_plate.py        Bake aged-paper @page plate PNGs (needs Pillow)
  foxhole-plate-150.png  Canonical baked plate, 150dpi, portrait
print/
  foxhole-print.css    WeasyPrint pattern library: masthead, routing,
                       stamp, spec tables, section heads, note boxes,
                       correction patches, @page rules
tokens.css             Design tokens (palette, type). Source of truth;
                       the Homebrewery theme's variables mirror these.
homebrewery/
  themes/V3/Foxhole/   The V3 theme: style.less, settings.json,
                       snippets.js, picker art
  themes/fonts/Foxhole/  woff2 faces + fonts.less
  themes/assets/       foxholePlate.png
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

## Tokens

`tokens.css` holds the palette and type tokens. The Homebrewery theme
defines its own `--HB_Color_*` variables; keep them in sync with this
file — this file wins.

## Versioning

Bump `version` in `package.json` on any visual change. Consumers pin or
float at their discretion; the Homebrewery fork installs from GitHub and
re-syncs on every build.
