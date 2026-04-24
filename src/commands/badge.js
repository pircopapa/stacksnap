const { templateExists } = require('../templates');
const { getBadges, addBadge, removeBadge, clearBadges, searchByBadge } = require('../badges');

const command = 'badge <action> [template] [badge]';
const describe = 'Manage badges on templates';

const builder = (yargs) => {
  yargs
    .positional('action', {
      describe: 'Action: add, remove, list, clear, search',
      type: 'string',
    })
    .positional('template', { type: 'string' })
    .positional('badge', { type: 'string' });
};

async function handler(argv) {
  const { action, template, badge } = argv;

  if (action === 'search') {
    if (!template) return console.error('Provide a badge name to search.');
    const results = searchByBadge(template);
    if (!results.length) return console.log(`No templates with badge "${template}".`);
    console.log(`Templates with badge "${template}":`);
    results.forEach(t => console.log(`  - ${t}`));
    return;
  }

  if (!template) return console.error('Template name is required.');
  if (!templateExists(template)) return console.error(`Template "${template}" not found.`);

  if (action === 'list') {
    const badges = getBadges(template);
    if (!badges.length) return console.log(`No badges on "${template}".`);
    console.log(`Badges for "${template}": ${badges.join(', ')}`);
  } else if (action === 'add') {
    if (!badge) return console.error('Badge name is required.');
    addBadge(template, badge);
    console.log(`Badge "${badge}" added to "${template}".`);
  } else if (action === 'remove') {
    if (!badge) return console.error('Badge name is required.');
    removeBadge(template, badge);
    console.log(`Badge "${badge}" removed from "${template}".`);
  } else if (action === 'clear') {
    clearBadges(template);
    console.log(`All badges cleared from "${template}".`);
  } else {
    console.error(`Unknown action "${action}". Use: add, remove, list, clear, search.`);
  }
}

module.exports = { command, describe, builder, handler };
