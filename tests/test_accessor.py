"""Contract tests for the installed ``foxhole_styles`` data package.

Everything here runs against the *installed* package and its own packaged
data -- no repo checkout required -- so this doubles as the post-install
smoke test for a pinned repo-URL install:

    pip install "foxhole-styles @ git+https://github.com/gavmor/foxhole-styles.git@v1.0.0"
    python -m unittest foxhole_styles_tests.test_accessor   # or: pytest tests/

The point of the parity tests is the acceptance criterion "importing the
package returns the same token values as the JS/CSS outputs": the Python
accessor is checked against the generated CSS, print CSS, LESS, JS and
TypeScript builds byte for byte, the same way scripts/check-contract.mjs
checks them against each other on the JS side.
"""

from __future__ import annotations

import hashlib
import json
import re
import unittest

import foxhole_styles as fx

CSS_DECL = re.compile(r"^\s*(--[a-z0-9-]+)\s*:\s*(.+?);\s*(?:/\*.*)?$")
LESS_DECL = re.compile(r"^\s*@([a-z0-9-]+)\s*:\s*(.+?);\s*(?://.*)?$")
JS_CONST = re.compile(r"^export const (\w+) = (.+);$", re.MULTILINE)
JS_RECORD = re.compile(r'^  "([a-z0-9-]+)": (\w+),$', re.MULTILINE)
DTS_RECORD = re.compile(r'^  "([a-z0-9-]+)":', re.MULTILINE)


def parse_css(text):
    out = {}
    for line in text.split("\n"):
        m = CSS_DECL.match(line)
        if m:
            out[m.group(1)[2:]] = m.group(2).strip()
    return out


def parse_less(text):
    out = {}
    for line in text.split("\n"):
        m = LESS_DECL.match(line)
        if m:
            out[m.group(1)] = m.group(2).strip()
    return out


def parse_js(text):
    """``{token-name: literal value}`` from the generated ES module."""
    consts = {}
    for ident, literal in JS_CONST.findall(text):
        consts[ident] = json.loads(literal)
    return {name: consts[ident] for name, ident in JS_RECORD.findall(text)}


def as_css_text(value):
    """Render a resolved token value the way the CSS build writes it."""
    if isinstance(value, bool):  # pragma: no cover - no boolean tokens today
        return str(value).lower()
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, (int, float)):
        return str(value)
    return str(value)


class TestPackagedData(unittest.TestCase):
    def test_token_build_is_packaged(self):
        self.assertTrue(fx.tokens(), "no tokens were packaged")
        self.assertEqual(len(fx.tokens()), 84)

    def test_every_manifest_asset_is_packaged_and_intact(self):
        inventory = fx.assets()
        self.assertEqual(len(inventory), 20)
        self.assertEqual(fx.verify_assets(), [], "asset bytes drifted from the manifest")

    def test_manifest_paths_resolve_against_the_package_root(self):
        for item in fx.assets():
            resolved = item.file()
            self.assertTrue(resolved.is_file(), f"{item.path} did not resolve")
            self.assertEqual(resolved.stat().st_size, item.bytes)

    def test_version_is_consistent_across_metadata_and_data(self):
        self.assertEqual(fx.__version__, fx.version())
        self.assertEqual(fx.version(), fx.manifest()["version"])
        self.assertEqual(fx.version(), json.loads(fx.read_text(fx.TOKENS_JSON))["version"])


class TestTokenParity(unittest.TestCase):
    """The accessor must agree with every generated output."""

    @classmethod
    def setUpClass(cls):
        cls.py = fx.tokens()
        cls.css = parse_css(fx.read_text("dist/tokens.css"))
        cls.print_css = parse_css(fx.read_text("dist/tokens.print.css"))
        cls.less = parse_less(fx.read_text("dist/tokens.less"))
        cls.js = parse_js(fx.read_text("dist/tokens.js"))
        cls.dts = set(DTS_RECORD.findall(fx.read_text("dist/tokens.d.ts")))

    def test_names_match_css(self):
        self.assertEqual(set(self.py), set(self.css))

    def test_names_match_print_css_less_js_and_dts(self):
        self.assertEqual(set(self.py), set(self.print_css))
        self.assertEqual(set(self.py), set(self.less))
        self.assertEqual(set(self.py), set(self.js))
        self.assertEqual(set(self.py), self.dts)

    def test_values_match_js_exactly(self):
        """tokens.js and tokens.json both carry fully resolved values."""
        self.assertEqual(self.py, self.js)

    def test_values_match_css(self):
        """CSS agrees for every token it does not emit as a var() reference."""
        compared = 0
        for name, css_value in self.css.items():
            if "var(--" in css_value:
                continue  # CSS keeps the alias; JSON/JS resolve it
            self.assertEqual(
                as_css_text(self.py[name]),
                css_value,
                f"{name}: python={self.py[name]!r} css={css_value!r}",
            )
            compared += 1
        self.assertGreater(compared, 80)

    def test_aliased_token_resolves_in_python(self):
        """--fx-shadow-patch is var()-referenced in CSS, resolved in Python."""
        self.assertIn("var(--fx-patch-shadow)", self.css["fx-shadow-patch"])
        self.assertEqual(
            fx.token("fx-shadow-patch"),
            self.css["fx-shadow-patch"].replace(
                "var(--fx-patch-shadow)", self.css["fx-patch-shadow"]
            ),
        )

    def test_values_match_less_after_normalising_references(self):
        for name, css_value in self.css.items():
            normalised = re.sub(r"@fx-([a-z0-9-]+)", r"var(--fx-\1)", self.less[name])
            self.assertEqual(normalised, css_value, f"{name} drifted between css and less")

    def test_print_build_changes_notation_not_magnitude(self):
        px_per = {"px": 1.0, "pt": 96 / 72, "in": 96.0, "rem": 16.0}
        length = re.compile(r"^(-?[\d.]+)(px|pt|in|rem)$")
        checked = 0
        for name, css_value in self.css.items():
            web = length.match(css_value)
            if not web:
                continue
            prt = length.match(self.print_css[name])
            if prt is None:
                self.fail(f"{name}: print value is not an absolute length")
            self.assertAlmostEqual(
                float(web.group(1)) * px_per[web.group(2)],
                float(prt.group(1)) * px_per[prt.group(2)],
                places=3,
                msg=f"{name}: magnitude changed between web and print",
            )
            checked += 1
        self.assertGreater(checked, 30)

    def test_legacy_custom_properties_are_frozen(self):
        """The 18 hand-written properties print/foxhole-print.css consumes."""
        legacy = {
            "fx-ink": "#26221a",
            "fx-muted": "#5a5245",
            "fx-rule": "#8a8069",
            "fx-dots": "#6b6252",
            "fx-leader": "#99907a",
            "fx-stamp": "#9c1f1f",
            "fx-paper-base": "#e9dec6",
            "fx-paper-patch": "#e4d6ba",
            "fx-patch-light": "#f7f3e7",
            "fx-patch-mid": "#f0ead7",
            "fx-patch-dark": "#e8e1cb",
            "fx-crease": "#6e5837",
            "fx-highlight": "#faf6ec",
            "fx-smudge": "#5f4b32",
            "fx-stain": "#785428",
            "fx-dark": "#967850",
            "fx-font-body": '"TT2020", "Courier Prime", monospace',
            "fx-font-display": '"Special Elite", "TT2020", monospace',
        }
        for name, value in legacy.items():
            self.assertEqual(fx.token(name), value, f"legacy token {name} changed")


class TestAccessorAPI(unittest.TestCase):
    def test_token_accepts_every_spelling(self):
        for spelling in ("fx-ink", "--fx-ink", "ink", "fxInk"):
            self.assertEqual(fx.token(spelling), "#26221a", spelling)
        self.assertEqual(fx.token("paper.base"), fx.token("fx-paper-base"))

    def test_unknown_token_raises_unless_defaulted(self):
        with self.assertRaises(KeyError):
            fx.token("fx-not-a-token")
        self.assertIsNone(fx.token("fx-not-a-token", None))

    def test_token_info_carries_dtcg_metadata(self):
        info = fx.token_info("fx-paper-base")
        self.assertEqual(info.value, "#e9dec6")
        self.assertEqual(info.type, "color")
        self.assertEqual(info.path, ("paper", "base"))
        self.assertTrue(info.description)
        self.assertEqual(info.css_var, "--fx-paper-base")
        self.assertEqual(info.css_reference, "var(--fx-paper-base)")

    def test_numeric_tokens_stay_numeric(self):
        self.assertIsInstance(fx.token("fx-angle-stamp-print"), (int, float))
        self.assertEqual(fx.token("fx-angle-stamp-print"), -9)
        self.assertAlmostEqual(fx.token("fx-opacity-stamp-print"), 0.78)

    def test_tokens_of_type(self):
        colors = fx.tokens_of_type("color")
        self.assertIn("fx-ink", colors)
        self.assertNotIn("fx-angle-stamp-print", colors)
        self.assertEqual({t.type for t in colors.values()}, {"color"})

    def test_diegetic_docs_assets_resolve(self):
        """The three things diegetic-docs pins this package for."""
        print_css = fx.print_css_path()
        self.assertTrue(print_css.is_file())
        self.assertIn("@page", print_css.read_text(encoding="utf-8"))

        baker = fx.plate_baker()
        self.assertTrue(baker.is_file())
        self.assertIn("def ", baker.read_text(encoding="utf-8"))

        for face in (
            "special-elite-regular.ttf",
            "tt2020-styleb-regular.ttf",
            "tt2020-styleb-italic.ttf",
        ):
            resolved = fx.font_path(face)
            self.assertTrue(resolved.is_file(), face)
            self.assertEqual(resolved.read_bytes()[:4], b"\x00\x01\x00\x00", face)

    def test_documented_importlib_pattern_still_works(self):
        """The literal pattern the consumer contract was written against."""
        from importlib.resources import files

        css = files("foxhole_styles").joinpath("print").joinpath("foxhole-print.css")
        self.assertEqual(
            hashlib.sha256(css.read_bytes()).hexdigest(),
            fx.asset("print/foxhole-print.css").sha256,
        )

    def test_other_shortcuts(self):
        self.assertTrue(fx.tokens_json_path().is_file())
        self.assertTrue(fx.tokens_css_path("web").is_file())
        self.assertTrue(fx.tokens_css_path("print").is_file())
        self.assertTrue(fx.less_path().is_file())
        self.assertTrue(fx.plate_image_path().is_file())
        self.assertTrue(fx.theme_path("themes/V3/Foxhole/style.less").is_file())
        self.assertEqual(len(fx.fonts(".ttf")), 3)
        self.assertEqual(len(fx.fonts(".woff2")), 3)
        with self.assertRaises(ValueError):
            fx.tokens_css_path("letterpress")

    def test_assets_by_role(self):
        roles = {a.role for a in fx.assets()}
        self.assertEqual(roles, {"font", "plate", "print-css", "homebrewery-theme"})
        self.assertEqual(len(fx.assets("print-css")), 1)

    def test_path_traversal_is_refused(self):
        for bad in ("/etc/passwd", "../package.json", "fonts/../../package.json"):
            with self.assertRaises(ValueError, msg=bad):
                fx.path(bad)

    def test_missing_resource_raises(self):
        with self.assertRaises(FileNotFoundError):
            fx.path("dist/tokens.sass")


if __name__ == "__main__":
    unittest.main()
