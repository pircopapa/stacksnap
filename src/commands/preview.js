import path from 'path';
import fs from 'fs';
import { getTemplatePath, templateExists, loadTemplateMeta } from '../templates.js';

export const command = 'preview <template>';
export const desc = 'Preview the file structure of a template';

export const builder = (yargs) => {
  yargs.positional('template', {
    describe: 'Template name to preview',
    type: 'string',
  });
};

function walkDir(dir, prefix = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const lines = [];
  entries.forEach((entry, i) => {
    const isLast = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';
    lines.push(`${prefix}${connector}${entry.name}`);
    if (entry.isDirectory()) {
      lines.push(...walkDir(path.join(dir, entry.name), prefix + childPrefix));
    }
  });
  return lines;
}

export const handler = async (argv) => {
  const { template } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const meta = loadTemplateMeta(template);
  const templatePath = getTemplatePath(template);
  const filesDir = path.join(templatePath, 'files');

  console.log(`\nTemplate: ${meta.name || template}`);
  if (meta.description) console.log(`Description: ${meta.description}`);
  console.log(`\nFile structure:\n`);
  console.log(template + '/');

  if (!fs.existsSync(filesDir)) {
    console.log('  (no files directory found)');
    return;
  }

  const lines = walkDir(filesDir);
  lines.forEach((line) => console.log(line));
  console.log();
};
