const { writeHook, listHooks, hookExists, HOOK_NAMES } = require('../hooks');
const { templateExists } = require('../templates');
const fs = require('fs');
const { getHookPath } = require('../hooks');

const command = 'hook <template> <hook-name>';
const describe = 'Add or view a lifecycle hook for a template';

const builder = (yargs) => {
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('hook-name', { describe: `Hook to manage (${HOOK_NAMES.join(', ')})`, type: 'string' })
    .option('show', { alias: 's', type: 'boolean', describe: 'Show existing hook content' })
    .option('set', { type: 'string', describe: 'Inline JS content to write as hook' })
    .option('remove', { alias: 'r', type: 'boolean', describe: 'Remove the hook' });
};

const handler = (argv) => {
  const { template, 'hook-name': hookName, show, set: setContent, remove } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (!HOOK_NAMES.includes(hookName)) {
    console.error(`Invalid hook name. Valid: ${HOOK_NAMES.join(', ')}`);
    process.exit(1);
  }

  if (show) {
    const hookPath = getHookPath(template, hookName);
    if (!hookExists(template, hookName)) {
      console.log(`No ${hookName} hook defined for "${template}".`);
    } else {
      console.log(fs.readFileSync(hookPath, 'utf8'));
    }
    return;
  }

  if (remove) {
    const hookPath = getHookPath(template, hookName);
    if (!hookExists(template, hookName)) {
      console.log(`No ${hookName} hook to remove.`);
    } else {
      fs.unlinkSync(hookPath);
      console.log(`Removed ${hookName} hook from "${template}".`);
    }
    return;
  }

  if (setContent) {
    writeHook(template, hookName, setContent);
    console.log(`Hook "${hookName}" set for template "${template}".`);
    return;
  }

  const hooks = listHooks(template);
  if (hooks.length === 0) {
    console.log(`No hooks defined for "${template}".`);
  } else {
    console.log(`Hooks for "${template}": ${hooks.join(', ')}`);
  }
};

module.exports = { command, describe, builder, handler };
