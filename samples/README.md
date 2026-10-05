# samples/

Visual regression harness for `print/foxhole-print.css`. Exercises every
pattern on two sheets so a diff in `docs/screenshots/*.jpg` is a diff in
every downstream consumer.

## Rebuild

```bash
pip install weasyprint pillow
# 1. Bake fresh paper plates (deterministic; same every time).
python3 ../plate/make_plate.py --format portrait --dpi 200 --pages 2 \
  --out plates/plate.png
# 2. Render the showcase to PDF.
python3 -m weasyprint pattern-showcase.html pattern-showcase.pdf
# 3. Rasterize and downsize for the README.
pdftoppm -png -r 150 pattern-showcase.pdf pattern-showcase
python3 build-screenshots.py   # resamples to JPEG under ../docs/screenshots/
```

The plate PNGs and intermediate renders are gitignored; the only
committed artefacts are the HTML source, the plate recipe (above), and
the final JPEG screenshots under `../docs/screenshots/`.
