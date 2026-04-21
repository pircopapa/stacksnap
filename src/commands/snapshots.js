import path from 'path';
import fs from 'fs';
import { loadConfig, getTemplatesDir } from '../config.js';
import { templateExists } from '../templates.js';

export const command = 'snapshots <template>';
export const desc = 'List all snapshots for a template';

export const builder = (yargs) =>
  yargs.positional('template', { describe: 'Template name', type: 'string' });

export function listSnapshots(templateName, templatesDir) {
  const snapshotsDir = path.join(templatesDir, templateName, '.snapshots');
  if (!fs.existsSync(snapshotsDir)) return [];
  return fs.readdirSync(snapshotsDir).filter((entry) => {
    return fs.statSync(path.join(snapshotsDir, entry)).isDirectory();
  });
}

export async function handler(argv) {
  try {
    const config = await loadConfig();
    const templatesDir = getTemplatesDir(config);

    if (!templateExists(argv.template, templatesDir)) {
      console.error(`Template "${argv.template}" does not exist.`);
      process.exit(1);
    }

    const snapshots = listSnapshots(argv.template, templatesDir);
    if (snapshots.length === 0) {
      console.log(`No snapshots found for "${argv.template}".`);
      return;
    }

    console.log(`Snapshots for "${argv.template}":`);
    snapshots.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}
