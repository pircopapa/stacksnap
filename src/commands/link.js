const { templateExists } = require('../templates');
const { addLink, removeLink, getLinks } = require('../links');

const command = 'link <template>';
const describe = 'Manage reference links for a template';

function builder(yargs) {
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .option('add', { alias: 'a', type: 'string', describe: 'Label for the link' })
    .option('url', { alias: 'u', type: 'string', describe: 'URL to associate with label' })
    .option('remove', { alias: 'r', type: 'string', describe: 'Label of link to remove' })
    .option('list', { alias: 'l', type: 'boolean', describe: 'List all links' });
}

function handler(argv) {
  const { template, add, url, remove, list } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (add) {
    if (!url) {
      console.error('--url is required when using --add');
      process.exit(1);
    }
    addLink(template, add, url);
    console.log(`Link "${add}" -> ${url} added to "${template}".`);
    return;
  }

  if (remove) {
    const ok = removeLink(template, remove);
    if (!ok) {
      console.error(`Link "${remove}" not found on "${template}".`);
      process.exit(1);
    }
    console.log(`Link "${remove}" removed from "${template}".`);
    return;
  }

  if (list || (!add && !remove)) {
    const links = getLinks(template);
    const entries = Object.entries(links);
    if (entries.length === 0) {
      console.log(`No links for "${template}".`);
      return;
    }
    console.log(`Links for "${template}":`);
    for (const [label, linkUrl] of entries) {
      console.log(`  ${label}: ${linkUrl}`);
    }
  }
}

module.exports = { command, describe, builder, handler };
