const path = require('path');
const fs = require('fs');
const { getTemplatesDir } = require('../config');
const { templateExists } = require('../templates');

const command = 'lock <template>';
const desc = 'Lock a template to prevent modifications';

const builder = (yargs) =>
  yargs.positional('template', {
    describe: 'Template name to lock',
    type: 'string',
  });

function getLockfilePath(templatesDir, name) {
  return path.join(templatesDir, name, '.lock');
}

function isLocked(templatesDir, name) {
  return fs.existsSync(getLockfilePath(templatesDir, name));
}

async function handler(argv) {
  const { template } = argv;
  const templatesDir = getTemplatesDir();

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const lockfile = getLockfilePath(templatesDir, template);

  if (isLocked(templatesDir, template)) {
    console.log(`Template "${template}" is already locked.`);
    return;
  }

  fs.writeFileSync(lockfile, JSON.stringify({ lockedAt: new Date().toISOString() }));
  console.log(`Template "${template}" has been locked.`);
}

module.exports = { command, desc, builder, handler, isLocked, getLockfilePath };
