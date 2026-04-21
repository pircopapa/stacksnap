const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { getTemplatesDir } = require('../config');
const { templateExists } = require('../templates');

const command = 'archive <name>';
const desc = 'Archive a template as a zip file';

const builder = (yargs) =>
  yargs
    .positional('name', { describe: 'Template name to archive', type: 'string' })
    .option('output', {
      alias: 'o',
      describe: 'Output directory for the archive',
      type: 'string',
      default: process.cwd(),
    });

const handler = async (argv) => {
  const { name, output } = argv;
  const templatesDir = await getTemplatesDir();

  if (!(await templateExists(name))) {
    console.error(`Template "${name}" not found.`);
    process.exit(1);
  }

  const templatePath = path.join(templatesDir, name);
  const outFile = path.join(output, `${name}.zip`);

  await fs.promises.mkdir(output, { recursive: true });

  await createZip(templatePath, outFile);
  console.log(`Archived "${name}" to ${outFile}`);
};

function createZip(sourceDir, outFile) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

module.exports = { command, desc, builder, handler, createZip };
