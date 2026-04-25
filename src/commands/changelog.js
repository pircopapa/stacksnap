const { templateExists } = require('../templates');
const { addChangelogEntry, getChangelog, clearChangelog } = require('../changelog');

const command = 'changelog <template>';
const describe = 'View or add changelog entries for a template';

function builder(yargs) {
  return yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .option('add', { alias: 'a', type: 'string', describe: 'Add a new changelog entry' })
    .option('author', { type: 'string', describe: 'Author name for the entry', default: 'unknown' })
    .option('clear', { type: 'boolean', describe: 'Clear all changelog entries', default: false });
}

function handler(argv) {
  const { template, add, author, clear } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" does not exist.`);
    process.exit(1);
  }

  if (clear) {
    clearChangelog(template);
    console.log(`Changelog for "${template}" cleared.`);
    return;
  }

  if (add) {
    const entry = addChangelogEntry(template, add, author);
    console.log(`Entry added: [${entry.timestamp}] ${entry.author}: ${entry.message}`);
    return;
  }

  const entries = getChangelog(template);
  if (entries.length === 0) {
    console.log(`No changelog entries for "${template}".`);
    return;
  }

  console.log(`Changelog for "${template}":\n`);
  entries.forEach((e) => {
    console.log(`  [${e.timestamp}] ${e.author}: ${e.message}`);
  });
}

module.exports = { command, describe, builder, handler };
