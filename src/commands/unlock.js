const path = require('path');
const fs = require('fs');
const { getTemplatesDir } = require('../config');
const { templateExists } = require('../templates');
const { isLocked, getLockfilePath } = require('./lock');

const command = 'unlock <template>';
const desc = 'Unlock a previously locked template';

const builder = (yargs) =>
  yargs.positional('template', {
    describe: 'Template name to unlock',
    type: 'string',
  });

async function handler(argv) {
  const { template } = argv;
  const templatesDir = getTemplatesDir();

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (!isLocked(templatesDir, template)) {
    console.log(`Template "${template}" is not locked.`);
    return;
  }

  const lockfile = getLockfilePath(templatesDir, template);
  fs.unlinkSync(lockfile);
  console.log(`Template "${template}" has been unlocked.`);
}

module.exports = { command, desc, builder, handler };
