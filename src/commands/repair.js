const { loadConfig, getTemplatesDir } = require('../config');
const { listTemplates, loadTemplateMeta } = require('../templates');
const { runChecks } = require('./doctor');
const fs = require('fs');
const path = require('path');

const command = 'repair';
const desc = 'Attempt to auto-fix common stacksnap setup issues';

const builder = (yargs) =>
  yargs.option('dry-run', {
    alias: 'd',
    type: 'boolean',
    default: false,
    describe: 'Show what would be fixed without making changes',
  });

async function handler(argv) {
  const { dryRun } = argv;
  const config = loadConfig();
  const templatesDir = getTemplatesDir(config);
  let fixed = 0;
  let skipped = 0;

  // Ensure templates directory exists
  if (!fs.existsSync(templatesDir)) {
    if (dryRun) {
      console.log(`[dry-run] Would create templates directory: ${templatesDir}`);
    } else {
      fs.mkdirSync(templatesDir, { recursive: true });
      console.log(`✅ Created templates directory: ${templatesDir}`);
    }
    fixed++;
  }

  // Check templates for missing meta fields
  let templates = [];
  try {
    templates = listTemplates(config);
  } catch (e) {
    console.warn(`⚠️  Could not list templates: ${e.message}`);
  }

  for (const name of templates) {
    try {
      const meta = loadTemplateMeta(name, config);
      const metaPath = path.join(templatesDir, name, 'meta.json');
      let changed = false;

      if (!meta.version) { meta.version = '0.0.1'; changed = true; }
      if (!meta.description) { meta.description = `Template: ${name}`; changed = true; }

      if (changed) {
        if (dryRun) {
          console.log(`[dry-run] Would patch meta.json for "${name}"`);
        } else {
          fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
          console.log(`✅ Patched meta.json for "${name}"`);
        }
        fixed++;
      } else {
        skipped++;
      }
    } catch (e) {
      console.warn(`⚠️  Skipping "${name}": ${e.message}`);
      skipped++;
    }
  }

  console.log(`\nRepair complete. Fixed: ${fixed}, Skipped: ${skipped}`);
  if (dryRun) console.log('(dry-run mode — no changes written)');
}

module.exports = { command, desc, builder, handler };
