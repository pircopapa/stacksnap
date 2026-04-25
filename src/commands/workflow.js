const { loadConfig, saveConfig } = require('../config');

const command = 'workflow <action> <name> [steps..]';
const desc = 'Manage template workflows (add, remove, run)';

const builder = (yargs) => {
  yargs
    .positional('action', {
      describe: 'Action to perform: add, remove, run',
      type: 'string',
      choices: ['add', 'remove', 'run'],
    })
    .positional('name', {
      describe: 'Workflow name',
      type: 'string',
    })
    .positional('steps', {
      describe: 'Ordered list of template names (for add)',
      type: 'string',
      array: true,
      default: [],
    });
};

async function handler({ action, name, steps }) {
  const config = await loadConfig();
  if (!config.workflows) config.workflows = {};

  if (action === 'add') {
    if (!steps || steps.length === 0) {
      console.error('Error: provide at least one step (template name).');
      process.exit(1);
    }
    config.workflows[name] = steps;
    await saveConfig(config);
    console.log(`Workflow "${name}" saved with ${steps.length} step(s): ${steps.join(' → ')}`);
    return;
  }

  if (action === 'remove') {
    if (!config.workflows[name]) {
      console.error(`Workflow "${name}" not found.`);
      process.exit(1);
    }
    delete config.workflows[name];
    await saveConfig(config);
    console.log(`Workflow "${name}" removed.`);
    return;
  }

  if (action === 'run') {
    const workflow = config.workflows[name];
    if (!workflow) {
      console.error(`Workflow "${name}" not found.`);
      process.exit(1);
    }
    console.log(`Running workflow "${name}" (${workflow.length} step(s))...`);
    for (const step of workflow) {
      console.log(`  → ${step}`);
    }
    console.log('Done. Use `stacksnap create <template>` for each step to scaffold them.');
  }
}

module.exports = { command, desc, builder, handler };
