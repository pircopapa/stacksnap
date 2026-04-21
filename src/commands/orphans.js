import fs from 'fs';
import path from 'path';
import { getTemplatesDir, loadConfig } from '../config.js';
import { listTemplates, loadTemplateMeta } from '../templates.js';

export const command = 'orphans';
export const desc = 'Find templates not referenced in any alias, pin, or history';

export const builder = (yargs) =>
  yargs.option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Show details for each orphaned template',
    default: false,
  });

function getReferencedTemplates(config) {
  const referenced = new Set();

  const aliases = config.aliases || {};
  for (const target of Object.values(aliases)) {
    referenced.add(target);
  }

  const pinned = config.pinned || [];
  for (const name of pinned) {
    referenced.add(name);
  }

  const history = config.history || [];
  for (const entry of history) {
    if (entry.template) referenced.add(entry.template);
  }

  return referenced;
}

export async function handler(argv) {
  const config = loadConfig();
  const templatesDir = getTemplatesDir(config);

  const templates = listTemplates(templatesDir);
  if (templates.length === 0) {
    console.log('No templates found.');
    return;
  }

  const referenced = getReferencedTemplates(config);
  const orphans = templates.filter((t) => !referenced.has(t));

  if (orphans.length === 0) {
    console.log('No orphaned templates found.');
    return;
  }

  console.log(`Found ${orphans.length} orphaned template(s):\n`);

  for (const name of orphans) {
    if (argv.verbose) {
      try {
        const meta = loadTemplateMeta(templatesDir, name);
        console.log(`  ${name}`);
        console.log(`    description: ${meta.description || '(none)'}`);
        console.log(`    version:     ${meta.version || '(none)'}`);
      } catch {
        console.log(`  ${name} (could not load meta)`);
      }
    } else {
      console.log(`  ${name}`);
    }
  }
}
