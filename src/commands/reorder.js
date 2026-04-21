const path = require('path');
const fs = require('fs');
const { getTemplatesDir } = require('../config');
const { templateExists, loadTemplateMeta } = require('../templates');

const command = 'reorder <template> <from> <to>';
const desc = 'Reorder a file within a template directory by renaming its position prefix';

const builder = (yargs) => {
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('from', { describe: 'Current filename (with or without prefix)', type: 'string' })
    .positional('to', { describe: 'New filename or numeric prefix', type: 'string' })
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      default: false,
      describe: 'Preview the rename without applying it',
    });
};

const resolveNewName = (from, to) => {
  if (/^\d+$/.test(to)) {
    const base = from.replace(/^\d+[-_]/, '');
    return `${to}-${base}`;
  }
  return to;
};

const handler = async (argv) => {
  const { template, from, to, dryRun } = argv;
  const templatesDir = await getTemplatesDir();

  if (!(await templateExists(template))) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const templateDir = path.join(templatesDir, template);
  const fromPath = path.join(templateDir, from);

  if (!fs.existsSync(fromPath)) {
    console.error(`File "${from}" not found in template "${template}".`);
    process.exit(1);
  }

  const newName = resolveNewName(from, to);
  const toPath = path.join(templateDir, newName);

  if (fs.existsSync(toPath) && fromPath !== toPath) {
    console.error(`A file named "${newName}" already exists in template "${template}".`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(`[dry-run] Would rename: ${from} → ${newName}`);
    return;
  }

  fs.renameSync(fromPath, toPath);
  console.log(`Renamed: ${from} → ${newName}`);
};

module.exports = { command, desc, builder, handler, resolveNewName };
