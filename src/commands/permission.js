const { templateExists } = require('../templates');
const {
  setPermission,
  getPermission,
  removePermission,
  listPermissions,
} = require('../permissions');

const command = 'permission <template> [level]';
const desc = 'Get or set permission level for a template';

const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('level', {
      describe: 'Permission level: read-only, writable, locked',
      type: 'string',
    })
    .option('reset', {
      alias: 'r',
      type: 'boolean',
      describe: 'Reset permission to default (writable)',
    })
    .option('list', {
      alias: 'l',
      type: 'boolean',
      describe: 'List all template permissions',
    });

async function handler(argv) {
  const { template, level, reset, list } = argv;

  if (list) {
    const all = listPermissions();
    const entries = Object.entries(all);
    if (entries.length === 0) {
      console.log('No custom permissions set.');
    } else {
      entries.forEach(([name, perm]) => console.log(`${name}: ${perm}`));
    }
    return;
  }

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (reset) {
    removePermission(template);
    console.log(`Permission for "${template}" reset to default (writable).`);
    return;
  }

  if (!level) {
    const current = getPermission(template);
    console.log(`Permission for "${template}": ${current}`);
    return;
  }

  try {
    setPermission(template, level);
    console.log(`Permission for "${template}" set to "${level}".`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { command, desc, builder, handler };
