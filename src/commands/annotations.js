const { loadConfig } = require('../config');
const { listTemplates } = require('../templates');

const command = 'annotations';
const desc = 'List all template annotations';

const builder = (yargs) => {
  yargs.option('filter', {
    alias: 'f',
    describe: 'Filter annotations by keyword',
    type: 'string',
  });
};

const handler = async (argv) => {
  const { filter } = argv;
  const config = loadConfig();
  const annotations = config.annotations || {};
  const templates = listTemplates();

  const entries = Object.entries(annotations).filter(([name, note]) => {
    if (!templates.includes(name)) return false;
    if (filter) {
      return name.includes(filter) || note.toLowerCase().includes(filter.toLowerCase());
    }
    return true;
  });

  if (entries.length === 0) {
    console.log('No annotations found.');
    return;
  }

  console.log('Template Annotations:\n');
  for (const [name, note] of entries) {
    console.log(`  ${name}`);
    console.log(`    ${note}`);
  }
};

module.exports = { command, desc, builder, handler };
