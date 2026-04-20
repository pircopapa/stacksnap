import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { templateExists, getTemplatePath } from '../templates.js';

export const command = 'delete <name>';
export const desc = 'Delete a template by name';

export const builder = (yargs) => {
  yargs
    .positional('name', {
      describe: 'Name of the template to delete',
      type: 'string',
    })
    .option('force', {
      alias: 'f',
      type: 'boolean',
      default: false,
      describe: 'Skip confirmation prompt',
    });
};

export const handler = async (argv) => {
  const { name, force } = argv;

  if (!templateExists(name)) {
    console.error(chalk.red(`Template "${name}" does not exist.`));
    process.exit(1);
  }

  if (!force) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Are you sure you want to delete template "${name}"? This cannot be undone.`,
        default: false,
      },
    ]);

    if (!confirmed) {
      console.log(chalk.yellow('Delete cancelled.'));
      return;
    }
  }

  try {
    const templatePath = getTemplatePath(name);
    await fs.remove(templatePath);
    console.log(chalk.green(`Template "${name}" deleted successfully.`));
  } catch (err) {
    console.error(chalk.red(`Failed to delete template: ${err.message}`));
    process.exit(1);
  }
};
