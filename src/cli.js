#!/usr/bin/env node

import { program } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

program
  .name('stacksnap')
  .description('Scaffold opinionated project structures from reusable templates')
  .version(pkg.version);

program
  .command('init <project-name>')
  .description('Initialize a new project from a template')
  .option('-t, --template <template>', 'template to use', 'default')
  .option('-d, --dir <directory>', 'output directory', '.')
  .action(async (projectName, options) => {
    const { runInit } = await import('./commands/init.js');
    await runInit(projectName, options);
  });

program
  .command('list')
  .description('List all available templates')
  .action(async () => {
    const { runList } = await import('./commands/list.js');
    await runList();
  });

program.parseAsync(process.argv).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
