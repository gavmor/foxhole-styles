#!/usr/bin/env node
/**
 * DTCG gate for tokens/*.tokens.json.
 *
 * Checks the Design Tokens Format Module 2025.10 rules that this repo relies
 * on. It is deliberately strict: anything it lets through must survive the
 * Style Dictionary build and land in dist/ unchanged in meaning.
 *
 * Enforced:
 *   - file naming: tokens/*.tokens.json, parseable JSON, object at the root
 *   - names: no "{", "}", "." in a group or token name; names may not start "$"
 *   - a token is any object carrying $value; groups are everything else
 *   - only $value / $type / $description / $extensions / $deprecated are
 *     allowed as $-properties
 *   - $type resolves from the token or its nearest ancestor group and must be
 *     one of the 2025.10 types
 *   - per-type value shape (color, dimension, fontFamily, fontWeight, number,
 *     shadow, duration, cubicBezier)
 *   - dimension units are px or rem only (spec 8.2.1), unit required even at 0
 *   - color: srgb components match the declared hex (the hex is canonical here)
 *   - aliases "{a.b.c}" resolve to a real token, with no cycles
 *   - token names are globally unique once flattened to the output name
 *
 * Exit 0 = valid. Exit 1 = one or more violations, each printed with its path.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const TOKENS_DIR = 'tokens';

// Design Tokens Format Module 2025.10 §8
const TYPES = new Set([
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'duration',
  'cubicBezier',
  'number',
  'strokeStyle',
  'border',
  'transition',
  'shadow',
  'gradient',
  'typography',
]);

const COLOR_SPACES = new Set([
  'srgb', 'srgb-linear', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec2020',
  'xyz-d50', 'xyz-d65', 'lab', 'lch', 'oklab', 'oklch', 'hsl', 'hwb',
]);

const FONT_WEIGHT_ALIASES = new Set([
  'thin', 'hairline', 'extra-light', 'ultra-light', 'light', 'normal', 'regular',
  'book', 'medium', 'semi-bold', 'demi-bold', 'bold', 'extra-bold', 'ultra-bold',
  'black', 'heavy', 'extra-black', 'ultra-black',
]);

const ALLOWED_DOLLAR = new Set(['$value', '$type', '$description', '$extensions', '$deprecated']);
const ALIAS = /^\{([^{}]+)\}$/;

const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

const isPlainObject = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);

/* ------------------------------------------------------------------ load */

const files = readdirSync(TOKENS_DIR).sort();
const bad = files.filter((f) => !f.endsWith('.tokens.json'));
if (bad.length) fail(TOKENS_DIR, `non-token files present: ${bad.join(', ')} (expected *.tokens.json)`);

const sources = files
  .filter((f) => f.endsWith('.tokens.json'))
  .map((f) => {
    const path = join(TOKENS_DIR, f);
    try {
      const data = JSON.parse(readFileSync(path, 'utf8'));
      if (!isPlainObject(data)) fail(path, 'root must be a JSON object');
      return { path, data: isPlainObject(data) ? data : {} };
    } catch (e) {
      fail(path, `unparseable JSON: ${e.message}`);
      return { path, data: {} };
    }
  });

if (!sources.length) fail(TOKENS_DIR, 'no *.tokens.json files found');

/* ---------------------------------------------------------------- walk */

/** @type {Map<string, {path: string[], type: string, value: unknown, file: string}>} */
const tokens = new Map();

const walk = (node, path, inheritedType, file) => {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) {
      if (!ALLOWED_DOLLAR.has(key)) fail(`${file} ${[...path, key].join('.')}`, `unknown $-property "${key}"`);
      continue;
    }
    const here = [...path, key];
    const where = `${file} ${here.join('.')}`;

    if (/[{}.]/.test(key)) fail(where, 'name may not contain "{", "}" or "."');
    if (!isPlainObject(child)) {
      fail(where, 'a group or token must be a JSON object');
      continue;
    }

    const type = child.$type ?? inheritedType;
    if (child.$type !== undefined && typeof child.$type !== 'string') fail(where, '$type must be a string');
    if (child.$description !== undefined && typeof child.$description !== 'string') {
      fail(where, '$description must be a string');
    }

    if ('$value' in child) {
      if (!type) fail(where, 'no $type on the token or any ancestor group');
      else if (!TYPES.has(type)) fail(where, `unknown $type "${type}"`);
      tokens.set(here.join('.'), { path: here, type, value: child.$value, file, where });
      // A token may not also hold child tokens.
      for (const k of Object.keys(child)) {
        if (!k.startsWith('$')) fail(where, `token also declares child member "${k}"`);
      }
    } else {
      walk(child, here, type, file);
    }
  }
};

for (const { path, data } of sources) {
  if (data.$type !== undefined && !TYPES.has(data.$type)) fail(path, `unknown root $type "${data.$type}"`);
  walk(data, [], data.$type, path);
}

/* -------------------------------------------------------------- aliases */

const resolve = (ref, seen, where) => {
  const chain = [...seen, ref];
  if (seen.includes(ref)) {
    fail(where, `circular alias: ${chain.join(' -> ')}`);
    return undefined;
  }
  const target = tokens.get(ref);
  if (!target) {
    fail(where, `alias {${ref}} does not resolve to a token`);
    return undefined;
  }
  const m = typeof target.value === 'string' ? target.value.match(ALIAS) : null;
  return m ? resolve(m[1], chain, where) : target;
};

/* --------------------------------------------------------- value checks */

const checkDimension = (v, where, label = '$value') => {
  if (typeof v === 'string') {
    const m = v.match(ALIAS);
    if (m) return void resolve(m[1], [], where);
    return fail(where, `${label}: dimension must be {value, unit}, not the legacy string "${v}"`);
  }
  if (!isPlainObject(v)) return fail(where, `${label}: dimension must be an object {value, unit}`);
  if (typeof v.value !== 'number' || !Number.isFinite(v.value)) fail(where, `${label}.value must be a finite number`);
  if (v.unit !== 'px' && v.unit !== 'rem') fail(where, `${label}.unit must be "px" or "rem" (got ${JSON.stringify(v.unit)})`);
  const extra = Object.keys(v).filter((k) => k !== 'value' && k !== 'unit');
  if (extra.length) fail(where, `${label}: unexpected keys ${extra.join(', ')}`);
};

const checkColor = (v, where, label = '$value') => {
  if (typeof v === 'string') {
    const m = v.match(ALIAS);
    if (m) return void resolve(m[1], [], where);
    return fail(where, `${label}: color must be a 2025.10 object, not the legacy string "${v}"`);
  }
  if (!isPlainObject(v)) return fail(where, `${label}: color must be an object`);
  if (!COLOR_SPACES.has(v.colorSpace)) fail(where, `${label}.colorSpace invalid: ${JSON.stringify(v.colorSpace)}`);
  if (!Array.isArray(v.components) || v.components.length !== 3) {
    return fail(where, `${label}.components must be an array of 3 numbers`);
  }
  for (const c of v.components) {
    if (typeof c !== 'number' || !Number.isFinite(c)) fail(where, `${label}.components must all be finite numbers`);
  }
  if (v.alpha !== undefined && (typeof v.alpha !== 'number' || v.alpha < 0 || v.alpha > 1)) {
    fail(where, `${label}.alpha must be a number in [0, 1]`);
  }
  if (v.hex !== undefined) {
    if (!/^#[0-9a-f]{6}$/.test(v.hex)) return fail(where, `${label}.hex must match #rrggbb lowercase (got ${v.hex})`);
    if (v.colorSpace === 'srgb') {
      // The hex is canonical in this repo; components must agree with it.
      const want = [1, 3, 5].map((i) => Math.round((parseInt(v.hex.slice(i, i + 2), 16) / 255) * 10000) / 10000);
      const drift = want.map((w, i) => Math.abs(w - v.components[i]));
      if (drift.some((d) => d > 0.0001)) {
        fail(where, `${label}.components ${JSON.stringify(v.components)} disagree with hex ${v.hex} (expected ${JSON.stringify(want)})`);
      }
    }
  }
};

const checkNumber = (v, where, label = '$value') => {
  if (typeof v === 'string' && ALIAS.test(v)) return void resolve(v.match(ALIAS)[1], [], where);
  if (typeof v !== 'number' || !Number.isFinite(v)) fail(where, `${label} must be a finite number`);
};

const CHECKS = {
  color: checkColor,
  dimension: checkDimension,
  number: checkNumber,
  fontFamily: (v, where) => {
    if (typeof v === 'string') {
      if (ALIAS.test(v)) return void resolve(v.match(ALIAS)[1], [], where);
      return;
    }
    if (!Array.isArray(v) || !v.length || v.some((f) => typeof f !== 'string')) {
      fail(where, '$value must be a font name or a non-empty array of font names');
    }
  },
  fontWeight: (v, where) => {
    if (typeof v === 'string') {
      if (ALIAS.test(v)) return void resolve(v.match(ALIAS)[1], [], where);
      if (!FONT_WEIGHT_ALIASES.has(v)) fail(where, `$value "${v}" is not a known font-weight alias`);
      return;
    }
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 1000) {
      fail(where, '$value must be an integer 1-1000 or a font-weight alias');
    }
  },
  duration: (v, where) => {
    if (!isPlainObject(v) || typeof v.value !== 'number' || !['ms', 's'].includes(v.unit)) {
      fail(where, '$value must be {value, unit: "ms"|"s"}');
    }
  },
  cubicBezier: (v, where) => {
    if (!Array.isArray(v) || v.length !== 4 || v.some((n) => typeof n !== 'number')) {
      fail(where, '$value must be an array of 4 numbers');
    }
  },
  shadow: (v, where) => {
    const one = (s, i) => {
      const at = i === null ? '$value' : `$value[${i}]`;
      if (!isPlainObject(s)) return fail(where, `${at} must be an object`);
      checkColor(s.color, where, `${at}.color`);
      for (const k of ['offsetX', 'offsetY', 'blur', 'spread']) {
        if (s[k] === undefined) fail(where, `${at}.${k} is required`);
        else checkDimension(s[k], where, `${at}.${k}`);
      }
      if (s.inset !== undefined && typeof s.inset !== 'boolean') fail(where, `${at}.inset must be a boolean`);
    };
    if (Array.isArray(v)) v.forEach((s, i) => one(s, i));
    else one(v, null);
  },
};

for (const t of tokens.values()) {
  if (typeof t.value === 'string' && ALIAS.test(t.value)) {
    resolve(t.value.match(ALIAS)[1], [t.path.join('.')], t.where);
    continue;
  }
  const check = CHECKS[t.type];
  if (check) check(t.value, t.where);
}

/* ------------------------------------------------- output-name collisions */

const byName = new Map();
for (const t of tokens.values()) {
  const name = `fx-${t.path.join('-')}`.toLowerCase();
  if (byName.has(name)) fail(t.where, `output name "--${name}" collides with ${byName.get(name)}`);
  else byName.set(name, t.path.join('.'));
}

/* ----------------------------------------------------------------- report */

if (errors.length) {
  console.error(`DTCG validation FAILED — ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `DTCG validation OK — ${tokens.size} tokens across ${sources.length} file(s): ` +
    `${[...new Set([...tokens.values()].map((t) => t.type))].sort().join(', ')}`,
);
