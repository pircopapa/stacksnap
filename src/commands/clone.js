const path = require('path');
const fs = require('fs');
const { templateExists, getTemplatePath, loadTemplateMeta } = require('../templates');
const { getTemplatesDir } = require('../config');

const command = 'clone <source> <destination>';
const desc = 'Clone an existing template into a new one';

const builder = (yargs) => {
  yargs
    .positional('source', { describe: 'Name of the template to clone', type: 'string' })
    .positional('destination', { describe: 'Name for the new cloned template', type: 'string' })
    .option('overwrite', { alias: 'o', type: 'boolean', default: false, describe: 'Overwrite destination if it exists' });
};

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const handler = async (argv) => {
  const { source, destination, overwrite } = argv;

  if (!templateExists(source)) {
    console.error(`Template "${source}" does not exist.`);
    process.exit(1);
  }

  if (templateExists(destination) && !overwrite) {
    console.error(`Template "${destination}" already exists. Use --overwrite to replace it.`);
    process.exit(1);
  }

  const srcPath = getTemplatePath(source);
  const destPath = path.join(getTemplatesDir(), destination);

  try {
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }
    copyDirRecursive(srcPath, destPath);

    // Update meta name to match new destination
    const metaPath = path.join(destPath, 'meta.json');
    if (fs.existsSync(metaPath)) {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      meta.name = destination;
      meta.clonedFrom = source;
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    }

    console.log(`Template "${source}" cloned to "${destination}" successfully.`);
  } catch (err) {
    console.error(`Failed to clone template: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { command, desc, builder, handler, copyDirRecursive };
