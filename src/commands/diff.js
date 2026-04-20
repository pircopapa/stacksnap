import path from 'path';
import fs from 'fs';
import { getTemplatePath, templateExists } from '../templates.js';
import { walkDir } from './preview.js';

export const command = 'diff <template> <target>';
export const desc = 'Show differences between a template and an existing directory';

export const builder = (yargs) => {
  yargs
    .positional('template', {
      describe: 'Template name to compare against',
      type: 'string',
    })
    .positional('target', {
      describe: 'Target directory to compare',
      type: 'string',
    })
    .option('files-only', {
      alias: 'f',
      describe: 'Only show file presence differences, not content',
      type: 'boolean',
      default: false,
    });
};

export const handler = async (argv) => {
  const { template, target, filesOnly } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const templateDir = getTemplatePath(template);
  const targetDir = path.resolve(target);

  if (!fs.existsSync(targetDir)) {
    console.error(`Target directory "${targetDir}" does not exist.`);
    process.exit(1);
  }

  const templateFiles = walkDir(templateDir).map((f) => path.relative(templateDir, f));
  const targetFiles = walkDir(targetDir).map((f) => path.relative(targetDir, f));

  const onlyInTemplate = templateFiles.filter((f) => !targetFiles.includes(f));
  const onlyInTarget = targetFiles.filter((f) => !templateFiles.includes(f));
  const inBoth = templateFiles.filter((f) => targetFiles.includes(f));

  console.log(`\nDiff: ${template} vs ${targetDir}\n`);

  onlyInTemplate.forEach((f) => console.log(`  + ${f}  (in template only)`));
  onlyInTarget.forEach((f) => console.log(`  - ${f}  (in target only)`));

  if (!filesOnly) {
    inBoth.forEach((f) => {
      const tContent = fs.readFileSync(path.join(templateDir, f), 'utf8');
      const dContent = fs.readFileSync(path.join(targetDir, f), 'utf8');
      if (tContent !== dContent) {
        console.log(`  ~ ${f}  (content differs)`);
      }
    });
  }

  if (!onlyInTemplate.length && !onlyInTarget.length) {
    console.log('  No file differences found.');
  }
};
