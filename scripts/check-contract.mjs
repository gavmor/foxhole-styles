#!/usr/bin/env node
/**
 * Contract gate for dist/.
 *
 * The build is only useful if the outputs agree with each other and nothing
 * silently drops a token a consumer already depends on. This checks:
 *
 *   1. legacy names — every custom property the hand-written tokens.css
 *      shipped (and print/foxhole-print.css consumes) still exists in
 *      dist/tokens.css with the same value;
 *   2. parity — tokens.css, tokens.print.css, tokens.less, tokens.js and
 *      tokens.json expose exactly the same token names;
 *   3. web-value parity — tokens.css, tokens.less, tokens.js and tokens.json
 *      agree on the value of every token;
 *   4. print units — the print build only ever changes notation, never the
 *      magnitude (1in = 96px, 1pt = 4/3 px);
 *   5. manifest — every inventoried asset exists with the recorded size and
 *      sha256.
 *
 * Exit 0 = contract held.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';

const failures = [];
const fail = (msg) => failures.push(msg);
const ok = (msg) => console.log(`  ok  ${msg}`);

const read = (p) => {
  if (!existsSync(p)) {
    fail(`missing output: ${p}`);
    return '';
  }
  return readFileSync(p, 'utf8');
};

/* ------------------------------------------------------------- 1. legacy */

/**
 * Frozen snapshot of the hand-written tokens.css that dist/ replaced
 * (commit 048fb55). print/foxhole-print.css and the Homebrewery V3 theme
 * are written against these names; losing or changing one is a MAJOR.
 */
const LEGACY = {
  '--fx-ink': '#26221a',
  '--fx-muted': '#5a5245',
  '--fx-rule': '#8a8069',
  '--fx-dots': '#6b6252',
  '--fx-leader': '#99907a',
  '--fx-stamp': '#9c1f1f',
  '--fx-paper-base': '#e9dec6',
  '--fx-paper-patch': '#e4d6ba',
  '--fx-patch-light': '#f7f3e7',
  '--fx-patch-mid': '#f0ead7',
  '--fx-patch-dark': '#e8e1cb',
  '--fx-crease': '#6e5837',
  '--fx-highlight': '#faf6ec',
  '--fx-smudge': '#5f4b32',
  '--fx-stain': '#785428',
  '--fx-dark': '#967850',
  '--fx-font-body': '"TT2020", "Courier Prime", monospace',
  '--fx-font-display': '"Special Elite", "TT2020", monospace',
};

/** Parse `--name: value;` out of a generated CSS file (comments stripped). */
const parseCss = (src) => {
  const out = new Map();
  for (const line of src.split('\n')) {
    const m = line.match(/^\s*(--[a-z0-9-]+)\s*:\s*(.+?);\s*(?:\/\*.*)?$/);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
};

const parseLess = (src) => {
  const out = new Map();
  for (const line of src.split('\n')) {
    const m = line.match(/^\s*@([a-z0-9-]+)\s*:\s*(.+?);\s*(?:\/\/.*)?$/);
    if (m) out.set(`--${m[1]}`, m[2].trim());
  }
  return out;
};

const css = parseCss(read('dist/tokens.css'));
const printCss = parseCss(read('dist/tokens.print.css'));
const less = parseLess(read('dist/tokens.less'));
const json = JSON.parse(read('dist/tokens.json') || '{"tokens":{}}');
const jsSrc = read('dist/tokens.js');
const dtsSrc = read('dist/tokens.d.ts');

console.log('1. legacy custom properties');
for (const [name, value] of Object.entries(LEGACY)) {
  if (!css.has(name)) fail(`legacy token ${name} is gone from dist/tokens.css`);
  else if (css.get(name) !== value) {
    fail(`legacy token ${name} changed: ${css.get(name)} (was ${value})`);
  }
}
if (!failures.length) ok(`all ${Object.keys(LEGACY).length} legacy custom properties preserved`);

/* ------------------------------------------------------------- 2. parity */

console.log('2. name parity across outputs');
const jsonNames = new Set(Object.keys(json.tokens ?? {}).map((n) => `--${n}`));
const jsNames = new Set([...jsSrc.matchAll(/^ {2}"([a-z0-9-]+)":/gm)].map((m) => `--${m[1]}`));

const compare = (label, set) => {
  const missing = [...css.keys()].filter((n) => !set.has(n));
  const extra = [...set].filter((n) => !css.has(n));
  if (missing.length) fail(`${label}: missing ${missing.length} token(s): ${missing.slice(0, 5).join(', ')}`);
  if (extra.length) fail(`${label}: unexpected ${extra.length} token(s): ${extra.slice(0, 5).join(', ')}`);
  if (!missing.length && !extra.length) ok(`${label} matches tokens.css (${set.size} tokens)`);
};
compare('tokens.print.css', new Set(printCss.keys()));
compare('tokens.less', new Set(less.keys()));
compare('tokens.js', jsNames);
compare('tokens.json', jsonNames);

const dtsNames = new Set([...dtsSrc.matchAll(/^ {2}"([a-z0-9-]+)":/gm)].map((m) => `--${m[1]}`));
compare('tokens.d.ts', dtsNames);

/* -------------------------------------------------------- 3. web values */

console.log('3. web value parity');
let valueMismatch = 0;
for (const [name, value] of css) {
  // CSS and LESS both emit references; compare after normalising the syntax.
  const lessValue = (less.get(name) ?? '').replace(/@fx-([a-z0-9-]+)/g, 'var(--fx-$1)');
  if (lessValue !== value) {
    fail(`value mismatch for ${name}: css="${value}" less="${less.get(name)}"`);
    valueMismatch++;
  }
  // JSON and JS carry resolved values, so only compare the non-referencing ones.
  if (!value.includes('var(--')) {
    const raw = json.tokens?.[name.slice(2)]?.value;
    const asCss = typeof raw === 'number' ? String(raw) : raw;
    if (asCss !== value) {
      fail(`value mismatch for ${name}: css="${value}" json=${JSON.stringify(raw)}`);
      valueMismatch++;
    }
  }
}
if (!valueMismatch) ok(`tokens.css, tokens.less and tokens.json agree on all ${css.size} values`);

/* -------------------------------------------------------- 4. print units */

console.log('4. print units preserve magnitude');
const PX_PER = { px: 1, pt: 96 / 72, in: 96, rem: 16 };
const toPx = (v) => {
  const m = v.match(/^(-?[\d.]+)(px|pt|in|rem)$/);
  return m ? Number(m[1]) * PX_PER[m[2]] : null;
};
let unitChecked = 0;
for (const [name, webValue] of css) {
  const webPx = toPx(webValue);
  if (webPx === null) continue;
  const printPx = toPx(printCss.get(name) ?? '');
  if (printPx === null) {
    fail(`${name}: print output "${printCss.get(name)}" is not an absolute length`);
  } else if (Math.abs(printPx - webPx) > 1e-3) {
    fail(`${name}: print ${printCss.get(name)} = ${printPx}px != web ${webValue} = ${webPx}px`);
  } else unitChecked++;
}
ok(`${unitChecked} absolute lengths round-trip between the web and print builds`);

/* ----------------------------------------------------------- 5. manifest */

console.log('5. asset manifest');
const manifest = JSON.parse(read('dist/manifest.json') || '{"assets":[]}');
let assetsOk = 0;
for (const asset of manifest.assets ?? []) {
  if (!existsSync(asset.path)) {
    fail(`manifest lists a missing asset: ${asset.path}`);
    continue;
  }
  const bytes = readFileSync(asset.path);
  if (statSync(asset.path).size !== asset.bytes) fail(`${asset.path}: size drift`);
  else if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) fail(`${asset.path}: sha256 drift`);
  else assetsOk++;
}
ok(`${assetsOk} assets verified against dist/manifest.json`);

/* ------------------------------------------------------------- report */

if (failures.length) {
  console.error(`\nFAILED — ${failures.length} problem(s):\n`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nPASS — dist/ contract held (${css.size} tokens, ${assetsOk} assets).`);
