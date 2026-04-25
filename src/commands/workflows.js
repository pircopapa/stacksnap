const { loadConfig } = require('../config');

const command = 'workflows';
const desc = 'List all saved workflows';

const builder = {};

async function handler() {
  const config = await loadConfig();
  const workflows = config.workflows || {};
  const names = Object.keys(workflows);

  if (names.length === 0) {
    console.log('No workflows saved. Use `stacksnap workflow add <name> <steps...>` to create one.');
    return;
  }

  console.log(`Saved workflows (${names.length}):`);
  for (const name of names) {
    const steps = workflows[name];
    console.log(`  ${name}`);
    steps.forEach((step, i) => console.log(`    ${i + 1}. ${step}`));
  }
}

module.exports = { command, desc, builder, handler };
