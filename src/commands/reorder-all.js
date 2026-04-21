const path = require('path');
const fs = require('fs');
const { getTemplatesDir } = require('../config');
const { templateExists } = require('../templates');
const { resolveNewName } = require('./reorder');

const command = 'reorder-all <template>';
const desc = 'Interactively reorder all files in a template by specifying a new order list';

const builder = (yargs) => {
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .option('order', {
      alias: 'o',
      type: 'array',
      describe: 'Ordered list of filenames (space-separated)',
      demandOption: true,
    })
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      default: false,
      describe: 'Preview renames without applying them',
    });
};

const handler = async (argv) => {
  const { template, order, dryRun } = argv;
  const templatesDir = await getTemplatesDir();

  if (!(await templateExists(template))) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const templateDir = path.join(templatesDir, template);
  const renames = [];

  order.forEach((filename, idx) => {
    const prefix = String(idx + 1).padStart(2, '0');
    const newName = resolveNewName(filename, prefix);
    if (filename !== newName) {
      renames.push({ from: filename, to: newName });
    }
  });

  if (renames.length === 0) {
    console.log('No renames needed.');
    return;
  }

  for (const { from, to } of renames) {
    const fromPath = path.join(templateDir, from);
    const toPath = path.join(templateDir, to);

    if (!fs.existsSync(fromPath)) {
      console.warn(`Skipping "${from}": file not found.`);
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${from} → ${to}`);
    } else {
      fs.renameSync(fromPath, toPath);
      console.log(`Renamed: ${from} → ${to}`);
    }
  }
};

module.exports = { command, desc, builder, handler };
