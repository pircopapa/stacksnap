const { templateExists, loadTemplateMeta, getTemplatePath } = require('../templates');
const { scaffold } = require('../scaffold');
const path = require('path');
const fs = require('fs');

const command = 'use <template> [destination]';
const describe = 'Apply a template to a target directory';

const builder = (yargs) => {
  yargs
    .positional('template', {
      describe: 'Name of the template to use',
      type: 'string',
    })
    .positional('destination', {
      describe: 'Target directory (defaults to current directory)',
      type: 'string',
      default: '.',
    })
    .option('overwrite', {
      alias: 'o',
      type: 'boolean',
      describe: 'Overwrite existing files',
      default: false,
    })
    .option('dry-run', {
      alias: 'd',
      type: 'boolean',
      describe: 'Preview changes without applying them',
      default: false,
    });
};

const handler = async (argv) => {
  const { template, destination, overwrite, dryRun } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const meta = loadTemplateMeta(template);
  const templatePath = getTemplatePath(template);
  const destPath = path.resolve(destination);

  if (!fs.existsSync(destPath)) {
    if (!dryRun) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    console.log(`Created destination directory: ${destPath}`);
  }

  if (dryRun) {
    console.log(`[dry-run] Would apply template "${template}" to ${destPath}`);
    console.log(`[dry-run] Template: ${meta.description || 'No description'}`);
    return;
  }

  try {
    await scaffold(templatePath, destPath, { overwrite });
    console.log(`✓ Template "${template}" applied to ${destPath}`);
  } catch (err) {
    console.error(`Failed to apply template: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { command, describe, builder, handler };
