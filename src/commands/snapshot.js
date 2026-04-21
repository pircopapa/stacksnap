import path from 'path';
import fs from 'fs';
import { loadConfig, getTemplatesDir } from '../config.js';
import { templateExists, loadTemplateMeta } from '../templates.js';

export const command = 'snapshot <template>';
export const desc = 'Save a versioned snapshot of a template';

export const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name to snapshot', type: 'string' })
    .option('label', { alias: 'l', type: 'string', describe: 'Optional label for the snapshot' });

export async function createSnapshot(templateName, label) {
  const config = await loadConfig();
  const templatesDir = getTemplatesDir(config);

  if (!templateExists(templateName, templatesDir)) {
    throw new Error(`Template "${templateName}" does not exist.`);
  }

  const snapshotsDir = path.join(templatesDir, templateName, '.snapshots');
  fs.mkdirSync(snapshotsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotId = label ? `${timestamp}_${label}` : timestamp;
  const snapshotDir = path.join(snapshotsDir, snapshotId);

  const templateDir = path.join(templatesDir, templateName);
  copyDirRecursive(templateDir, snapshotDir, ['.snapshots']);

  return { snapshotId, snapshotDir };
}

function copyDirRecursive(src, dest, exclude = []) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (exclude.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export async function handler(argv) {
  try {
    const { snapshotId } = await createSnapshot(argv.template, argv.label);
    console.log(`Snapshot created: ${snapshotId}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
