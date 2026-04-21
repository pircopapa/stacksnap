// merge.js — merge two templates into a new one
const fs = require('fs');
const path = require('path');
const { getTemplatePath, templateExists } = require('../templates');
const { getTemplatesDir } = require('../config');

const command = 'merge <source1> <source2> <dest>';
const desc = 'Merge two templates into a new combined template';

const builder = (yargs) =>
  yargs
    .positional('source1', { describe: 'First source template', type: 'string' })
    .positional('source2', { describe: 'Second source template', type: 'string' })
    .positional('dest', { describe: 'Name for the merged template', type: 'string' })
    .option('overwrite', { alias: 'o', type: 'boolean', default: false, describe: 'Overwrite dest if it exists' });

function copyDirContents(srcDir, destDir, label) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirContents(srcPath, destPath, label);
    } else {
      if (fs.existsSync(destPath)) {
        console.warn(`  [merge] conflict — keeping existing file: ${entry.name} (from ${label})`);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function mergeMeta(meta1, meta2, destName) {
  return {
    name: destName,
    description: `Merged from ${meta1.name || 'source1'} and ${meta2.name || 'source2'}`,
    version: '1.0.0',
    tags: [...new Set([...(meta1.tags || []), ...(meta2.tags || [])])],
    mergedFrom: [meta1.name || 'source1', meta2.name || 'source2'],
  };
}

const handler = (argv) => {
  const { source1, source2, dest, overwrite } = argv;

  if (!templateExists(source1)) return console.error(`Template not found: ${source1}`);
  if (!templateExists(source2)) return console.error(`Template not found: ${source2}`);

  const destDir = path.join(getTemplatesDir(), dest);
  if (fs.existsSync(destDir)) {
    if (!overwrite) return console.error(`Destination template '${dest}' already exists. Use --overwrite to replace.`);
    fs.rmSync(destDir, { recursive: true, force: true });
  }

  fs.mkdirSync(destDir, { recursive: true });

  const src1Dir = path.join(getTemplatePath(source1), 'files');
  const src2Dir = path.join(getTemplatePath(source2), 'files');
  const destFilesDir = path.join(destDir, 'files');

  copyDirContents(src1Dir, destFilesDir, source1);
  copyDirContents(src2Dir, destFilesDir, source2);

  const loadMeta = (name) => {
    try { return JSON.parse(fs.readFileSync(path.join(getTemplatePath(name), 'meta.json'), 'utf8')); }
    catch { return { name }; }
  };

  const merged = mergeMeta(loadMeta(source1), loadMeta(source2), dest);
  fs.writeFileSync(path.join(destDir, 'meta.json'), JSON.stringify(merged, null, 2));

  console.log(`✔ Merged '${source1}' + '${source2}' → '${dest}'`);
};

module.exports = { command, desc, builder, handler, mergeMeta };
