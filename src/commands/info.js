import chalk from 'chalk';
import { loadTemplateMeta, templateExists, getTemplatePath } from '../templates.js';

export const command = 'info <template>';
export const describe = 'Show details about a specific template';

export function builder(yargs) {
  return yargs.positional('template', {
    describe: 'Template name to inspect',
    type: 'string',
  });
}

export async function handler(argv) {
  const { template } = argv;

  if (!templateExists(template)) {
    console.error(chalk.red(`Template "${template}" not found.`));
    console.error(chalk.dim('Run `stacksnap list` to see available templates.'));
    process.exit(1);
  }

  const meta = loadTemplateMeta(template);
  const templatePath = getTemplatePath(template);

  console.log();
  console.log(chalk.bold.cyan(`Template: ${meta.name || template}`));
  console.log();

  if (meta.description) {
    console.log(chalk.white(meta.description));
    console.log();
  }

  if (meta.version) {
    console.log(`${chalk.dim('Version:')}  ${meta.version}`);
  }

  if (meta.author) {
    console.log(`${chalk.dim('Author:')}   ${meta.author}`);
  }

  if (meta.tags && meta.tags.length > 0) {
    console.log(`${chalk.dim('Tags:')}     ${meta.tags.map(t => chalk.yellow(t)).join(', ')}`);
  }

  if (meta.files && meta.files.length > 0) {
    console.log();
    console.log(chalk.dim('Files included:'));
    meta.files.forEach(f => console.log(`  ${chalk.green('+')} ${f}`));
  }

  console.log();
  console.log(chalk.dim(`Path: ${templatePath}`));
  console.log();
}
