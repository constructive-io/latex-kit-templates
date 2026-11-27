#!/usr/bin/env node
// Bundles: templates that are signed together and filled from one record.
//
//   node scripts/bundles.mjs check
//   node scripts/bundles.mjs new <bundle> <name>
//
// A bundle is packages/<pkg>/bundles/<id>.json:
//   { "title": "...", "record": "engagements",
//     "documents": [{ "template": "consulting-agreement", "suffix": "consulting" }, ...] }
//
// `new` writes one shared record, project/data/<record>/<name>.json, and one
// document per template, project/documents/<name>-<suffix>.json, each pointing
// at the shared record. latex-kit then builds them like any other documents.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const PACKAGES = join(ROOT, 'packages');
const PROJECT = join(ROOT, 'project');
const rel = (p) => relative(process.cwd(), p);

function loadBundles() {
  const out = [];
  for (const pkg of readdirSync(PACKAGES).sort()) {
    const dir = join(PACKAGES, pkg, 'bundles');
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
      out.push({ id: file.slice(0, -5), pkg, file: join(dir, file), ...JSON.parse(readFileSync(join(dir, file), 'utf8')) });
    }
  }
  return out;
}

function problems(bundle) {
  const errors = [];
  if (!bundle.title) errors.push('needs a "title"');
  if (!/^[a-z0-9-]+$/.test(bundle.record ?? '')) errors.push('needs a "record": the data folder for the shared record, e.g. "engagements"');
  if (!Array.isArray(bundle.documents) || bundle.documents.length < 2) errors.push('needs at least two "documents"');
  const seen = new Set();
  for (const d of bundle.documents ?? []) {
    if (!existsSync(join(PACKAGES, bundle.pkg, 'templates', d.template ?? '', 'template.tex'))) errors.push(`no template "${d.template}" in this package`);
    if (!/^[a-z0-9-]+$/.test(d.suffix ?? '')) errors.push(`document "${d.template}" needs a "suffix"`);
    if (seen.has(d.suffix)) errors.push(`suffix "${d.suffix}" is used twice`);
    seen.add(d.suffix);
  }
  return errors;
}

/** A typed placeholder for every required field of a JSON Schema. */
function skeleton(node, root, depth = 0) {
  if (!node || typeof node !== 'object' || depth > 8) return '';
  if (node.$ref) {
    const m = /^#\/(\$defs|definitions)\/(.+)$/.exec(node.$ref);
    return m ? skeleton(root[m[1]]?.[m[2]], root, depth + 1) : '';
  }
  if (node.default !== undefined) return node.default;
  if (node.enum) return node.enum[0];
  const variant = node.anyOf ?? node.oneOf;
  if (variant) return skeleton(variant[0], root, depth + 1);
  const type = Array.isArray(node.type) ? node.type[0] : node.type;
  if (type === 'object' || node.properties) {
    const out = {};
    for (const key of node.required ?? []) out[key] = skeleton(node.properties?.[key], root, depth + 1);
    return out;
  }
  if (type === 'array') return [];
  if (type === 'number' || type === 'integer') return 0;
  if (type === 'boolean') return false;
  return '';
}

const merge = (a, b) => {
  for (const [k, v] of Object.entries(b)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) merge(a[k], v);
    else if (!(k in a)) a[k] = v;
  }
  return a;
};

const [command, bundleId, name] = process.argv.slice(2);
const bundles = loadBundles();

if (command === 'check') {
  let bad = 0;
  for (const b of bundles) {
    for (const e of problems(b)) {
      bad++;
      console.error(`${rel(b.file)}: ${e}`);
    }
  }
  if (bad) process.exit(1);
  console.log(`bundles: ${bundles.length} checked`);
} else if (command === 'new') {
  const bundle = bundles.find((b) => b.id === bundleId);
  if (!bundle || !/^[a-z0-9-]+$/.test(name ?? '')) {
    console.error(`usage: bundles.mjs new <bundle> <name>\nbundles: ${bundles.map((b) => b.id).join(', ') || '(none)'}`);
    process.exit(1);
  }
  const record = {};
  for (const d of bundle.documents) {
    const schemaFile = join(PACKAGES, bundle.pkg, 'templates', d.template, `${d.template}.schema.json`);
    if (!existsSync(schemaFile)) {
      console.error(`${rel(schemaFile)} is missing: run "pnpm typegen" first`);
      process.exit(1);
    }
    const schema = JSON.parse(readFileSync(schemaFile, 'utf8'));
    const data = schema.properties?.data ?? schema;
    merge(record, skeleton(data, schema));
  }
  const write = (file, value) => {
    if (existsSync(file)) {
      console.error(`${rel(file)} already exists`);
      process.exit(1);
    }
    mkdirSync(join(file, '..'), { recursive: true });
    writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
    console.log(`+ ${rel(file)}`);
  };
  write(join(PROJECT, 'data', bundle.record, `${name}.json`), record);
  for (const d of bundle.documents) {
    write(join(PROJECT, 'documents', `${name}-${d.suffix}.json`), { template: d.template, data: { $ref: `${bundle.record}/${name}` } });
  }
} else {
  console.error('usage: bundles.mjs check | new <bundle> <name>');
  process.exit(1);
}
