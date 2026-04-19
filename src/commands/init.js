const path = require('path');
const fs = require('fs');
const { templateExists, getTemplatePath, loadTemplateMeta } = require('../templates');
const { scaffold } = require('../scaffold');
const inquirer = require('inquirer');

const command = 'init <template> [dest]';
const desc = 'Initialize a new project from a template in the current directory';

const builder = (yargs) => {
  yargs
    .positional('template', { describe: 'Template name to use', type: 'string' })
    .positional('dest', { describe: 'Destination directory', type: 'string', default: '.' })
    .option('yes', { alias: 'y', type: 'boolean', describe: 'Skip confirmation prompts', default: false });
};

const handler = async (argv) => {
  const { template, dest, yes } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const meta = loadTemplateMeta(template);
  const destPath = path.resolve(process.cwd(), dest);

  console.log(`\nInitializing project from template: ${meta.name || template}`);
  if (meta.description) console.log(`Description: ${meta.description}`);
  console.log(`Destination: ${destPath}\n`);

  if (!yes) {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Scaffold into "${destPath}"?`,
      default: true,
    }]);
    if (!confirm) {
      console.log('Aborted.');
      return;
    }
  }

  const templatePath = getTemplatePath(template);

  try {
    await scaffold(templatePath, destPath);
    console.log('\n✔ Project initialized successfully.');
  } catch (err) {
    console.error('Scaffold failed:', err.message);
    process.exit(1);
  }
};

module.exports = { command, desc, builder, handler };
