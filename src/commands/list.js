import chalk from 'chalk';
import { listTemplates, loadTemplateMeta } from '../templates.js';

export async function listCommand(options = {}) {
  const templates = await listTemplates();

  if (templates.length === 0) {
    console.log(chalk.yellow('No templates found.'));
    return;
  }

  console.log(chalk.bold('\nAvailable templates:\n'));

  for (const name of templates) {
    try {
      const meta = await loadTemplateMeta(name);

      const displayName = meta.displayName || name;
      const description = meta.description || 'No description provided.';
      const version = meta.version ? chalk.gray(`v${meta.version}`) : '';
      const tags = meta.tags?.length
        ? chalk.cyan(`[${meta.tags.join(', ')}]`)
        : '';

      console.log(`  ${chalk.green(displayName)} ${version} ${tags}`.trimEnd());

      if (options.verbose) {
        console.log(`    ${chalk.gray(description)}`);
        if (meta.author) {
          console.log(`    ${chalk.gray('Author:')} ${meta.author}`);
        }
      } else {
        console.log(`    ${chalk.gray(description)}`);
      }

      console.log();
    } catch {
      console.log(`  ${chalk.green(name)}`);
      console.log(`    ${chalk.gray('(metadata unavailable)')}\n`);
    }
  }

  console.log(chalk.gray(`${templates.length} template(s) available.\n`));
}
