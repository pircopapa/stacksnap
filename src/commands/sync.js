import path from 'path';
import fs from 'fs';
import { getTemplatePath, templateExists } from '../templates.js';
import { walkDir } from './preview.js';

export const command = 'sync <template> <target>';
export const desc = 'Sync missing template files into an existing project directory';

export const builder = (yargs) => {
  yargs
    .positional('template', { describe: 'Source template name', type: 'string' })
    .positional('target', { describe: 'Target project directory', type: 'string' })
    .option('dry-run', {
      alias: 'd',
      describe: 'Preview what would be copied without making changes',
      type: 'boolean',
      default: false,
    })
    .option('overwrite', {
      alias: 'o',
      describe: 'Overwrite existing files that differ',
      type: 'boolean',
      default: false,
    });
};

export const handler = async (argv) => {
  const { template, target, dryRun, overwrite } = argv;

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

  const templateFiles = walkDir(templateDir);
  let copied = 0;
  let skipped = 0;

  for (const srcFile of templateFiles) {
    const relative = path.relative(templateDir, srcFile);
    const destFile = path.join(targetDir, relative);
    const exists = fs.existsSync(destFile);

    if (exists && !overwrite) {
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`  [dry-run] ${exists ? 'overwrite' : 'copy'}: ${relative}`);
    } else {
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.copyFileSync(srcFile, destFile);
      console.log(`  ${exists ? 'overwritten' : 'copied'}: ${relative}`);
    }
    copied++;
  }

  console.log(`\nSync complete. ${copied} file(s) ${dryRun ? 'would be' : ''} synced, ${skipped} skipped.`);
};
