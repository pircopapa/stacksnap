import path from 'path';
import fs from 'fs';
import { loadConfig, getTemplatesDir } from '../config.js';
import { templateExists } from '../templates.js';
import { listSnapshots } from './snapshots.js';

export const command = 'restore <template> <snapshotId>';
export const desc = 'Restore a template from a snapshot';

export const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('snapshotId', { describe: 'Snapshot ID to restore', type: 'string' })
    .option('dry-run', { type: 'boolean', default: false, describe: 'Preview without applying changes' });

export async function restoreSnapshot(templateName, snapshotId, templatesDir, dryRun = false) {
  if (!templateExists(templateName, templatesDir)) {
    throw new Error(`Template "${templateName}" does not exist.`);
  }

  const snapshotsDir = path.join(templatesDir, templateName, '.snapshots');
  const snapshotPath = path.join(snapshotsDir, snapshotId);

  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${snapshotId}" not found.`);
  }

  const templateDir = path.join(templatesDir, templateName);

  if (dryRun) {
    console.log(`[dry-run] Would restore "${templateName}" from snapshot "${snapshotId}"`);
    return;
  }

  // Remove existing files (excluding .snapshots)
  for (const entry of fs.readdirSync(templateDir)) {
    if (entry === '.snapshots') continue;
    fs.rmSync(path.join(templateDir, entry), { recursive: true, force: true });
  }

  // Copy snapshot back
  for (const entry of fs.readdirSync(snapshotPath, { withFileTypes: true })) {
    const src = path.join(snapshotPath, entry.name);
    const dest = path.join(templateDir, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(src, dest, { recursive: true });
    } else {
      fs.copyFileSync(src, dest);
    }
  }

  return snapshotId;
}

export async function handler(argv) {
  try {
    const config = await loadConfig();
    const templatesDir = getTemplatesDir(config);
    await restoreSnapshot(argv.template, argv.snapshotId, templatesDir, argv['dry-run']);
    if (!argv['dry-run']) {
      console.log(`Restored "${argv.template}" from snapshot "${argv.snapshotId}".`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
