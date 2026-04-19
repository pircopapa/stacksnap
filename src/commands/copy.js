import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { templateExists, getTemplatePath } from '../templates.js';

export const command = 'copy <template> <destination>';
export const desc = 'Copy a template to a new location for customization';

export const builder = (yargs) => {
  yargs
    .positional('template', {
      describe: 'Name of the template to copy',
      type: 'string',
    })
    .positional('destination', {
      describe: 'Destination directory for the copied template',
      type: 'string',
    })
    .option('force', {
      alias: 'f',
      type: 'boolean',
      default: false,
      describe: 'Overwrite destination if it already exists',
    });
};

export const handler = async (argv) => {
  const { template, destination, force } = argv;

  if (!templateExists(template)) {
    console.error(chalk.red(`Template "${template}" not found.`));
    process.exit(1);
  }

  const srcPath = getTemplatePath(template);
  const destPath = path.resolve(process.cwd(), destination);

  if (fs.existsSync(destPath) && !force) {
    console.error(
      chalk.red(`Destination "${destination}" already exists. Use --force to overwrite.`)
    );
    process.exit(1);
  }

  try {
    await fs.copy(srcPath, destPath, { overwrite: force });
    console.log(chalk.green(`Template "${template}" copied to ${destPath}`));
    console.log(chalk.gray('You can now edit the template files and use it with the create command.'));
  } catch (err) {
    console.error(chalk.red(`Failed to copy template: ${err.message}`));
    process.exit(1);
  }
};
