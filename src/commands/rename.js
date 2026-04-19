const { templateExists, getTemplatePath } = require('../templates');
const fs = require('fs');
const path = require('path');

const command = 'rename <oldName> <newName>';
const desc = 'Rename an existing template';

const builder = (yargs) => {
  yargs
    .positional('oldName', {
      describe: 'Current name of the template',
      type: 'string',
    })
    .positional('newName', {
      describe: 'New name for the template',
      type: 'string',
    });
};

const handler = async (argv) => {
  const { oldName, newName } = argv;

  if (!templateExists(oldName)) {
    console.error(`Template "${oldName}" does not exist.`);
    process.exit(1);
  }

  if (templateExists(newName)) {
    console.error(`Template "${newName}" already exists. Choose a different name.`);
    process.exit(1);
  }

  if (!/^[a-z0-9-_]+$/.test(newName)) {
    console.error(`Invalid template name "${newName}". Use lowercase letters, numbers, hyphens, or underscores.`);
    process.exit(1);
  }

  const oldPath = getTemplatePath(oldName);
  const newPath = getTemplatePath(newName);

  try {
    fs.renameSync(oldPath, newPath);
    console.log(`Template "${oldName}" renamed to "${newName}" successfully.`);
  } catch (err) {
    console.error(`Failed to rename template: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { command, desc, builder, handler };
