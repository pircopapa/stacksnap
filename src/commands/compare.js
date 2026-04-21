import fs from 'fs';
import path from 'path';
import { templateExists, loadTemplateMeta, getTemplatePath } from '../templates.js';

export const command = 'compare <templateA> <templateB>';
export const desc = 'Compare two templates side by side';

export function builder(yargs) {
  yargs
    .positional('templateA', { describe: 'First template name', type: 'string' })
    .positional('templateB', { describe: 'Second template name', type: 'string' })
    .option('files', { alias: 'f', type: 'boolean', default: false, describe: 'Show file list diff' })
    .option('meta', { alias: 'm', type: 'boolean', default: true, describe: 'Show meta diff' });
}

function getFileList(templatePath) {
  const results = [];
  function walk(dir, base = '') {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      const rel = base ? `${base}/${entry}` : entry;
      if (fs.statSync(full).isDirectory()) walk(full, rel);
      else results.push(rel);
    }
  }
  walk(templatePath);
  return results;
}

export function compareTemplates(metaA, metaB) {
  const keys = new Set([...Object.keys(metaA), ...Object.keys(metaB)]);
  const diffs = [];
  for (const key of keys) {
    const a = metaA[key] ?? '(none)';
    const b = metaB[key] ?? '(none)';
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs.push({ key, a, b });
    }
  }
  return diffs;
}

/**
 * Compares the file contents of a file shared between two templates.
 * Returns true if the contents are identical, false otherwise.
 */
function sharedFileContentsMatch(templateA, templateB, relPath) {
  const contentA = fs.readFileSync(path.join(getTemplatePath(templateA), relPath), 'utf8');
  const contentB = fs.readFileSync(path.join(getTemplatePath(templateB), relPath), 'utf8');
  return contentA === contentB;
}

export async function handler(argv) {
  const { templateA, templateB, files, meta } = argv;

  if (!templateExists(templateA)) return console.error(`Template not found: ${templateA}`);
  if (!templateExists(templateB)) return console.error(`Template not found: ${templateB}`);

  if (meta) {
    const metaA = loadTemplateMeta(templateA);
    const metaB = loadTemplateMeta(templateB);
    const diffs = compareTemplates(metaA, metaB);
    if (diffs.length === 0) {
      console.log('Meta: identical');
    } else {
      console.log('Meta differences:');
      for (const { key, a, b } of diffs) {
        console.log(`  ${key}:`);
        console.log(`    [${templateA}] ${JSON.stringify(a)}`);
        console.log(`    [${templateB}] ${JSON.stringify(b)}`);
      }
    }
  }

  if (files) {
    const filesA = new Set(getFileList(getTemplatePath(templateA)));
    const filesB = new Set(getFileList(getTemplatePath(templateB)));
    const onlyA = [...filesA].filter(f => !filesB.has(f));
    const onlyB = [...filesB].filter(f => !filesA.has(f));
    const shared = [...filesA].filter(f => filesB.has(f));
    const modifiedShared = shared.filter(f => !sharedFileContentsMatch(templateA, templateB, f));
    console.log(`\nFiles only in ${templateA}: ${onlyA.length ? onlyA.join(', ') : '(none)'}`);
    console.log(`Files only in ${templateB}: ${onlyB.length ? onlyB.join(', ') : '(none)'}`);
    console.log(`Shared files: ${shared.length} (${modifiedShared.length} differ in content)`);
    if (modifiedShared.length > 0) {
      console.log(`  Modified: ${modifiedShared.join(', ')}`);
    }
  }
}
