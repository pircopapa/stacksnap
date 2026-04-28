const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { getTemplatesDir } = require('../config');
const { templateExists } = require('../templates');

// Command to import a template from a .zip archive into the templates directory

const command = 'import <file>';
const desc = 'Import a template from a zip archive';

const builder = (yargs) => {
  yargs
    .positional('file', {
      describe: 'Path to the .zip archive to import',
      type: 'string',
    })
    .option('name', {
      alias: 'n',
      describe: 'Override the template name (defaults to zip filename without extension)',
      type: 'string',
    })
    .option('force', {
      alias: 'f',
      describe: 'Overwrite existing template if it already exists',
      type: 'boolean',
      default: false,
    });
};

const handler = async (argv) => {
  const { file, name, force } = argv;

  // Resolve the archive path
  const archivePath = path.resolve(file);

  if (!fs.existsSync(archivePath)) {
    console.error(`Error: File not found: ${archivePath}`);
    process.exit(1);
  }

  if (path.extname(archivePath).toLowerCase() !== '.zip') {
    console.error('Error: Only .zip archives are supported.');
    process.exit(1);
  }

  // Determine template name from --name flag or zip filename
  const templateName = name || path.basename(archivePath, '.zip');

  if (!/^[a-zA-Z0-9_-]+$/.test(templateName)) {
    console.error(`Error: Invalid template name "${templateName}". Use only letters, numbers, hyphens, and underscores.`);
    process.exit(1);
  }

  const templatesDir = getTemplatesDir();
  const destDir = path.join(templatesDir, templateName);

  // Check for existing template
  if (templateExists(templateName) && !force) {
    console.error(`Error: Template "${templateName}" already exists. Use --force to overwrite.`);
    process.exit(1);
  }

  // Extract the zip archive
  try {
    const zip = new AdmZip(archivePath);
    const entries = zip.getEntries();

    if (entries.length === 0) {
      console.error('Error: The archive is empty.');
      process.exit(1);
    }

    // If overwriting, remove the existing directory first
    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true });
    }

    fs.mkdirSync(destDir, { recursive: true });

    // Determine if the zip has a single top-level directory to strip
    const topLevelDirs = new Set(
      entries.map((e) => e.entryName.split('/')[0])
    );
    const stripRoot =
      topLevelDirs.size === 1 && !entries[0].isDirectory === false
        ? [...topLevelDirs][0]
        : null;

    zip.extractAllTo(destDir, true);

    // If all files are under a single subdirectory, lift them up
    if (stripRoot) {
      const rootSubDir = path.join(destDir, stripRoot);
      if (fs.existsSync(rootSubDir) && fs.statSync(rootSubDir).isDirectory()) {
        const items = fs.readdirSync(rootSubDir);
        for (const item of items) {
          fs.renameSync(path.join(rootSubDir, item), path.join(destDir, item));
        }
        fs.rmdirSync(rootSubDir);
      }
    }

    console.log(`Template "${templateName}" imported successfully to ${destDir}`);
  } catch (err) {
    console.error(`Error importing template: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { command, desc, builder, handler };
