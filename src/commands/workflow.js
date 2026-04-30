const { templateExists } = require('../templates');
const {
  addWorkflow,
  removeWorkflow,
  getWorkflow,
  listWorkflows,
} = require('../workflows');

const command = 'workflow <template> <action> [name]';
const describe = 'Manage workflows for a template';

function builder(yargs) {
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('action', {
      describe: 'Action: add | remove | get | list',
      choices: ['add', 'remove', 'get', 'list'],
    })
    .positional('name', { describe: 'Workflow name', type: 'string' })
    .option('steps', {
      alias: 's',
      describe: 'Comma-separated list of steps (for add)',
      type: 'string',
    });
}

function handler(argv) {
  const { template, action, name, steps } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (action === 'list') {
    const names = listWorkflows(template);
    if (names.length === 0) {
      console.log(`No workflows defined for "${template}".`);
    } else {
      console.log(`Workflows for "${template}":`);
      names.forEach((n) => console.log(`  - ${n}`));
    }
    return;
  }

  if (!name) {
    console.error('Workflow name is required for this action.');
    process.exit(1);
  }

  if (action === 'add') {
    if (!steps) {
      console.error('Provide --steps for add action.');
      process.exit(1);
    }
    const stepList = steps.split(',').map((s) => s.trim()).filter(Boolean);
    addWorkflow(template, name, stepList);
    console.log(`Workflow "${name}" added to "${template}" with ${stepList.length} step(s).`);
  } else if (action === 'remove') {
    const removed = removeWorkflow(template, name);
    if (removed) {
      console.log(`Workflow "${name}" removed from "${template}".`);
    } else {
      console.error(`Workflow "${name}" not found on "${template}".`);
      process.exit(1);
    }
  } else if (action === 'get') {
    const wf = getWorkflow(template, name);
    if (!wf) {
      console.error(`Workflow "${name}" not found on "${template}".`);
      process.exit(1);
    }
    console.log(`Workflow "${name}" (created: ${wf.createdAt}):`);
    wf.steps.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  }
}

module.exports = { command, describe, builder, handler };
