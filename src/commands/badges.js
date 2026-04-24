const { listTemplates } = require('../templates');
const { getBadges } = require('../badges');

const command = 'badges';
const describe = 'List all templates and their badges';

const builder = (yargs) => {
  yargs.option('filter', {
    alias: 'f',
    type: 'string',
    describe: 'Only show templates with this badge',
  });
};

async function handler(argv) {
  const { filter } = argv;
  const templates = listTemplates();

  if (!templates.length) {
    console.log('No templates found.');
    return;
  }

  let found = false;
  for (const name of templates) {
    const badges = getBadges(name);
    if (filter && !badges.includes(filter)) continue;
    found = true;
    const label = badges.length ? badges.join(', ') : '(none)';
    console.log(`  ${name}: ${label}`);
  }

  if (!found) {
    console.log(filter ? `No templates with badge "${filter}".` : 'No badge data found.');
  }
}

module.exports = { command, describe, builder, handler };
