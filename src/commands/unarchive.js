const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');
const { getTemplatesDir } = require('../config');

const command = 'unarchive <file>';
const desc = 'Restore a template from a zip archive';

const builder = (yargs) =>
  yargs
    .positional('file', { describe: 'Path to the zip archive', type: 'string' })
    .option('name', {
      alias: 'n',
      describe: 'Name to give the restored template (defaults to zip basename)',
      type: 'string',
    });

const handler = async (argv) => {
  const { file } = argv;
  const templatesDir = await getTemplatesDir();

  if (!fs.existsSync(file)) {
    console.error(`Archive not found: ${file}`);
    process.exit(1);
  }

  const name = argv.name || path.basename(file, '.zip');
  const destDir = path.join(templatesDir, name);

  if (fs.existsSync(destDir)) {
    console.error(`Template "${name}" already exists. Use --name to choose a different name.`);
    process.exit(1);
  }

  await fs.promises.mkdir(destDir, { recursive: true });

  await fs
    .createReadStream(file)
    .pipe(unzipper.Extract({ path: destDir }))
    .promise();

  console.log(`Unarchived "${name}" to ${destDir}`);
};

module.exports = { command, desc, builder, handler };
