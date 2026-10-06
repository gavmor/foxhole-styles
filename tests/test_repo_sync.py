"""Repo-side checks that the Python distribution tracks the npm package.

Skipped when the package is imported from an install with no checkout next
to it (the wheel does not ship these inputs). Run from a clone:

    python -m unittest discover -s tests -v
"""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

import foxhole_styles as fx

REPO = Path(__file__).resolve().parent.parent
PACKAGE_JSON = REPO / "package.json"
PYPROJECT = REPO / "pyproject.toml"

needs_checkout = unittest.skipUnless(
    PACKAGE_JSON.is_file() and PYPROJECT.is_file(),
    "not running from a foxhole-styles checkout",
)


@needs_checkout
class TestVersionSync(unittest.TestCase):
    """package.json is the single source of truth for the version.

    pyproject.toml declares `dynamic = ["version"]` and reads package.json, so
    a Changesets bump moves the npm package, the wheel and the git tag
    together and a pinned `@v<tag>` install can never resolve to a wheel
    carrying a different version.
    """

    @classmethod
    def setUpClass(cls):
        cls.pkg = json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))
        cls.pyproject = PYPROJECT.read_text(encoding="utf-8")

    def test_pyproject_has_no_second_version_literal(self):
        project_table = self.pyproject.split("[project]", 1)[1].split("\n[", 1)[0]
        self.assertNotRegex(
            project_table,
            r'(?m)^version\s*=',
            "pyproject.toml pins a literal version; it must stay dynamic so "
            "Changesets only has to bump package.json",
        )
        self.assertIn('dynamic = ["version"]', project_table)

    def test_hatch_reads_the_version_from_package_json(self):
        self.assertRegex(self.pyproject, r'(?m)^\[tool\.hatch\.version\]')
        self.assertRegex(self.pyproject, r'(?m)^path\s*=\s*"package\.json"')
        pattern = re.search(r"(?m)^pattern\s*=\s*'(.+)'$", self.pyproject)
        if pattern is None:
            self.fail("no version pattern configured")
        extracted = re.search(pattern.group(1), PACKAGE_JSON.read_text(encoding="utf-8"))
        if extracted is None:
            self.fail("the configured pattern matches nothing in package.json")
        self.assertEqual(extracted.group("version"), self.pkg["version"])

    def test_installed_version_matches_package_json(self):
        self.assertEqual(fx.__version__, self.pkg["version"])

    def test_generated_outputs_carry_the_same_version(self):
        self.assertEqual(fx.manifest()["version"], self.pkg["version"])
        self.assertEqual(fx.manifest()["name"], self.pkg["name"])


@needs_checkout
class TestPackagedTreeMatchesRepo(unittest.TestCase):
    """What the wheel ships has to be byte-identical to the repo tree."""

    def test_every_manifest_asset_matches_the_repo_file(self):
        for item in fx.assets():
            source = REPO / item.path
            self.assertTrue(source.is_file(), f"{item.path} missing from the repo")
            self.assertEqual(
                source.read_bytes(),
                item.read_bytes(),
                f"{item.path} differs between the repo and the installed package",
            )

    def test_every_token_output_matches_the_repo_file(self):
        for name in (
            "tokens.css",
            "tokens.print.css",
            "tokens.less",
            "tokens.js",
            "tokens.d.ts",
            "tokens.json",
            "manifest.json",
        ):
            self.assertEqual(
                (REPO / "dist" / name).read_text(encoding="utf-8"),
                fx.read_text(f"dist/{name}"),
                f"dist/{name} differs between the repo and the installed package",
            )

    def test_wheel_does_not_ship_python_build_artifacts(self):
        shipped = {entry["path"] for entry in fx.manifest()["assets"]}
        self.assertFalse(
            [p for p in shipped if p.endswith((".whl", ".tar.gz", ".egg-info"))],
            "a Python build artifact leaked into the manifest",
        )


if __name__ == "__main__":
    unittest.main()
