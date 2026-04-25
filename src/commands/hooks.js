const { listHooks } = require('../hooks');
const { templateExists, listTemplates } = require('../templates');

const command = 'hooks [template]';
const describe = 'List lifecycle hooks for a template or all templates';

const builder = (yargs) => {
  yargs.positional('template', { describe: 'Template name (optional)', type: 'string' });
};

const handler = (argv) => {
  const { template } = argv;

  if (template) {
    if (!templateExists(template)) {
      console.error(`Template "${template}" not found.`);
      process.exit(1);
    }
    const hooks = listHooks(template);
    if (hooks.length === 0) {
      console.log(`No hooks defined for "${template}".`);
    } else {
      console.log(`Hooks for "${template}":`);
      hooks.forEach(h => console.log(`  - ${h}`));
    }
    return;
  }

  const templates = listTemplates();
  if (templates.length === 0) {
    console.log('No templates found.');
    return;
  }

  let anyHooks = false;
  templates.forEach(t => {
    const hooks = listHooks(t);
    if (hooks.length > 0) {
      anyHooks = true;
      console.log(`${t}: ${hooks.join(', ')}`);
    }
  });

  if (!anyHooks) {
    console.log('No hooks defined across any templates.');
  }
};

module.exports = { command, describe, builder, handler };
