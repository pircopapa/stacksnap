import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { templateExists, getTemplatePath, loadTemplateMeta } from '../templates.js';

export const command = 'export <name> [dest]';
export const desc = 'Export a template as a zip archive';

export const builder = (yargs) => {
  yargs
    .positional('name', {
      describe: 'Template name to export',
      type: 'string',
    })
    .positional('dest', {
      describe: 'Destination directory for the zip file',
      type: 'string',
      default: process.cwd(),
    })
    .option('output', {
      alias: 'o',
      describe: 'Custom output filename (without .zip)',
      type: 'string',
    });
};

export const handler = async (argv) => {
  const { name, dest, output } = argv;

  if (!templateExists(name)) {
    console.error(`Template "${name}" not found.`);
    process.exit(1);
  }

  const templatePath = getTemplatePath(name);
  const meta = loadTemplateMeta(name);
  const fileName = `${output || name}.zip`;
  const outputPath = path.resolve(dest, fileName);

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const outputStream = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  await new Promise((resolve, reject) => {
    outputStream.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(outputStream);
    archive.directory(templatePath, name);
    archive.finalize();
  });

  console.log(`✔ Exported "${name}" to ${outputPath}`);
  if (meta?.description) {
    console.log(`  Description: ${meta.description}`);
  }
  console.log(`  Size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
};
