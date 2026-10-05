#!/usr/bin/env node
/**
 * Build dist/ from tokens/*.tokens.json with Style Dictionary v5.
 *
 * Outputs (all deterministic — no timestamps, stable key order):
 *   dist/tokens.css        CSS custom properties, web units (px / unitless)
 *   dist/tokens.print.css  same names, print units (pt, and in for page geometry)
 *   dist/tokens.less       LESS variables for the Homebrewery V3 theme
 *   dist/tokens.js         ESM: named exports + a default record
 *   dist/tokens.d.ts       types for the above
 *   dist/tokens.json       flat machine-readable record (Python consumers)
 *   dist/manifest.json     asset inventory with sizes and sha256 digests
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';

import { buildManifest } from './build-manifest.mjs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const sdVersion = JSON.parse(readFileSync('node_modules/style-dictionary/package.json', 'utf8')).version;

const BANNER = [
  'Foxhole design tokens — GENERATED, DO NOT EDIT.',
  'Source: tokens/*.tokens.json (W3C DTCG). Rebuild with `npm run build`.',
  `${pkg.name} v${pkg.version} · style-dictionary ${sdVersion}`,
];

/* ----------------------------------------------------------- primitives */

/** Hex channel pair -> 0-255. */
const chan = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);

/** DTCG srgb color object -> CSS. Uses the canonical hex, so no float drift. */
const colorToCss = (v) => {
  if (typeof v === 'string') return v; // unresolved alias, left to SD
  const alpha = v.alpha ?? 1;
  if (!v.hex) throw new Error(`color token without a hex fallback: ${JSON.stringify(v)}`);
  if (alpha === 1) return v.hex;
  return `rgba(${chan(v.hex, 0)}, ${chan(v.hex, 1)}, ${chan(v.hex, 2)}, ${alpha})`;
};

/** Trim float noise without lying about the value. */
const num = (n) => {
  const r = Math.round(n * 1e4) / 1e4;
  return String(Number(r.toFixed(4)));
};

const dimToWeb = (v) => (typeof v === 'string' ? v : `${num(v.value)}${v.unit}`);

/**
 * Print units.
 *
 * DTCG only admits px and rem for the dimension type (spec 8.2.1), but the
 * WeasyPrint pattern library is written in points and inches. Which unit a
 * measure reads naturally in is an output concern, not a token concern, so
 * the mapping lives here: it reproduces the unit each value was originally
 * authored in inside print/foxhole-print.css. All three units are absolute
 * (1in = 96px, 1pt = 4/3 px), so this is a notation change, not a resize.
 */
const PRINT_UNIT_BY_GROUP = {
  page: 'in', // @page size and margins
  border: 'px', // rule weights
  space: 'px', // paddings and margins
  overstrike: 'px', // sub-pixel double-strike offset
  shadow: 'px', // correction-patch lift
};
const PRINT_UNIT_BY_TOKEN = {
  'tracking.section': 'px',
  'tracking.stamp': 'px',
};
const printUnitFor = (path) =>
  PRINT_UNIT_BY_TOKEN[path.join('.')] ?? PRINT_UNIT_BY_GROUP[path[0]] ?? 'pt';

const dimToPrint = (v, path) => {
  if (typeof v === 'string') return v;
  if (v.unit === 'rem') return `${num(v.value)}rem`;
  const unit = printUnitFor(path);
  if (unit === 'px') return `${num(v.value)}px`;
  if (unit === 'in') return `${num(v.value / 96)}in`;
  return `${num(v.value * 0.75)}pt`;
};

/** Generic CSS font families stay unquoted; every real family name is quoted. */
const GENERIC_FAMILIES = new Set([
  'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
  'ui-serif', 'ui-sans-serif', 'ui-monospace', 'ui-rounded', 'math', 'emoji', 'fangsong',
]);

const fontFamilyToCss = (v) =>
  (Array.isArray(v) ? v : [v]).map((f) => (GENERIC_FAMILIES.has(f) ? f : `"${f}"`)).join(', ');

const shadowToCss = (v, dim) => {
  const one = (s) =>
    [dim(s.offsetX), dim(s.offsetY), dim(s.blur), dim(s.spread), colorToCss(s.color)].join(' ');
  return (Array.isArray(v) ? v : [v]).map(one).join(', ');
};

/* ----------------------------------------------------------- transforms */

StyleDictionary.registerTransform({
  name: 'name/fx',
  type: 'name',
  transform: (token, config) => [config.prefix, ...token.path].filter(Boolean).join('-').toLowerCase(),
});

StyleDictionary.registerTransform({
  name: 'color/fx',
  type: 'value',
  transitive: true,
  filter: (t) => t.$type === 'color',
  transform: (t) => colorToCss(t.$value),
});

StyleDictionary.registerTransform({
  name: 'fontFamily/fx',
  type: 'value',
  transitive: true,
  filter: (t) => t.$type === 'fontFamily',
  transform: (t) => fontFamilyToCss(t.$value),
});

StyleDictionary.registerTransform({
  name: 'dimension/fx-web',
  type: 'value',
  transitive: true,
  filter: (t) => t.$type === 'dimension',
  transform: (t) => dimToWeb(t.$value),
});

StyleDictionary.registerTransform({
  name: 'dimension/fx-print',
  type: 'value',
  transitive: true,
  filter: (t) => t.$type === 'dimension',
  transform: (t) => dimToPrint(t.$value, t.path),
});

StyleDictionary.registerTransform({
  name: 'shadow/fx-web',
  type: 'value',
  transitive: true,
  filter: (t) => t.$type === 'shadow',
  transform: (t) => shadowToCss(t.$value, dimToWeb),
});

StyleDictionary.registerTransform({
  name: 'shadow/fx-print',
  type: 'value',
  transitive: true,
  filter: (t) => t.$type === 'shadow',
  transform: (t) => shadowToCss(t.$value, (d) => dimToPrint(d, ['shadow'])),
});

const WEB = ['name/fx', 'color/fx', 'fontFamily/fx', 'dimension/fx-web', 'shadow/fx-web'];
const PRINT = ['name/fx', 'color/fx', 'fontFamily/fx', 'dimension/fx-print', 'shadow/fx-print'];

/* -------------------------------------------------------------- headers */

StyleDictionary.registerFileHeader({ name: 'fx', fileHeader: () => BANNER });

/* -------------------------------------------------------------- formats */

/** Tokens in a stable, source-declaration order. */
const ordered = (dictionary) => [...dictionary.allTokens];

StyleDictionary.registerFormat({
  name: 'fx/json',
  format: ({ dictionary }) => {
    const tokens = {};
    for (const t of ordered(dictionary)) {
      tokens[t.name] = {
        value: t.$value ?? t.value,
        type: t.$type ?? t.type,
        path: t.path,
        ...(t.$description ? { description: t.$description } : {}),
      };
    }
    return `${JSON.stringify(
      {
        name: pkg.name,
        version: pkg.version,
        generator: `style-dictionary ${sdVersion}`,
        note: 'Generated from tokens/*.tokens.json (W3C DTCG). Do not edit.',
        tokens,
      },
      null,
      2,
    )}\n`;
  },
});

const jsIdent = (name) => name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

StyleDictionary.registerFormat({
  name: 'fx/js',
  format: ({ dictionary }) => {
    const lines = [`/**\n${BANNER.map((l) => ` * ${l}`).join('\n')}\n */`, ''];
    const names = [];
    for (const t of ordered(dictionary)) {
      const ident = jsIdent(t.name);
      names.push([ident, t.name]);
      if (t.$description) lines.push(`/** ${t.$description} */`);
      lines.push(`export const ${ident} = ${JSON.stringify(t.$value ?? t.value)};`);
    }
    lines.push('');
    lines.push('/** Every token, keyed by its CSS custom-property name (without the leading `--`). */');
    lines.push('export const tokens = {');
    for (const [ident, name] of names) lines.push(`  ${JSON.stringify(name)}: ${ident},`);
    lines.push('};');
    lines.push('');
    lines.push('export default tokens;');
    return `${lines.join('\n')}\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'fx/dts',
  format: ({ dictionary }) => {
    const lines = [`/**\n${BANNER.map((l) => ` * ${l}`).join('\n')}\n */`, ''];
    const names = [];
    for (const t of ordered(dictionary)) {
      const ident = jsIdent(t.name);
      names.push([ident, t.name]);
      const literal = JSON.stringify(t.$value ?? t.value);
      if (t.$description) lines.push(`/** ${t.$description} */`);
      lines.push(`export declare const ${ident}: ${literal};`);
    }
    lines.push('');
    lines.push('export declare const tokens: {');
    for (const [ident, name] of names) lines.push(`  ${JSON.stringify(name)}: typeof ${ident};`);
    lines.push('};');
    lines.push('');
    lines.push('export default tokens;');
    return `${lines.join('\n')}\n`;
  },
});

/* ---------------------------------------------------------------- build */

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });

const sd = new StyleDictionary({
  source: ['tokens/*.tokens.json'],
  log: { verbosity: process.env.SD_VERBOSE ? 'verbose' : 'default', warnings: 'error' },
  platforms: {
    css: {
      transforms: WEB,
      prefix: 'fx',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { fileHeader: 'fx', outputReferences: true, selector: ':root' },
        },
      ],
    },
    print: {
      transforms: PRINT,
      prefix: 'fx',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.print.css',
          format: 'css/variables',
          options: { fileHeader: 'fx', outputReferences: true, selector: ':root' },
        },
      ],
    },
    less: {
      transforms: WEB,
      prefix: 'fx',
      buildPath: 'dist/',
      files: [{ destination: 'tokens.less', format: 'less/variables', options: { fileHeader: 'fx', outputReferences: true } }],
    },
    js: {
      transforms: WEB,
      prefix: 'fx',
      buildPath: 'dist/',
      files: [
        { destination: 'tokens.js', format: 'fx/js' },
        { destination: 'tokens.d.ts', format: 'fx/dts' },
      ],
    },
    json: {
      transforms: WEB,
      prefix: 'fx',
      buildPath: 'dist/',
      files: [{ destination: 'tokens.json', format: 'fx/json' }],
    },
  },
});

await sd.hasInitialized;
await sd.buildAllPlatforms();

const manifest = buildManifest({ name: pkg.name, version: pkg.version });
writeFileSync('dist/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`✔ dist/manifest.json (${manifest.assets.length} assets)`);
