const { templateExists } = require('../templates');
const { addLabel, removeLabel, getLabels } = require('../labels');

const command = 'label <template> [action] [labelName]';
const describe = 'Add, remove, or list labels on a template';

function builder(yargs) {
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('action', {
      describe: 'Action: add | remove | list',
      type: 'string',
      default: 'list',
    })
    .positional('labelName', { describe: 'Label to add or remove', type: 'string' })
    .example('$0 label my-tpl add frontend', 'Add label')
    .example('$0 label my-tpl remove frontend', 'Remove label')
    .example('$0 label my-tpl list', 'List labels');
}

function handler({ template, action, labelName }) {
  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (action === 'list') {
    const labels = getLabels(template);
    if (labels.length === 0) {
      console.log(`No labels for "${template}".`);
    } else {
      console.log(`Labels for "${template}": ${labels.join(', ')}`);
    }
    return;
  }

  if (!labelName) {
    console.error('A label name is required for add/remove.');
    process.exit(1);
  }

  if (action === 'add') {
    const added = addLabel(template, labelName);
    if (added) {
      console.log(`Label "${labelName}" added to "${template}".`);
    } else {
      console.log(`Label "${labelName}" already exists on "${template}".`);
    }
  } else if (action === 'remove') {
    const removed = removeLabel(template, labelName);
    if (removed) {
      console.log(`Label "${labelName}" removed from "${template}".`);
    } else {
      console.log(`Label "${labelName}" not found on "${template}".`);
    }
  } else {
    console.error(`Unknown action "${action}". Use add, remove, or list.`);
    process.exit(1);
  }
}

module.exports = { command, describe, builder, handler };
