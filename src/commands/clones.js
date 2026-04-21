const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('../config');
const { listTemplates, loadTemplateMeta } = require('../templates');

const command = 'clones [source]';
const desc = 'List all templates that were cloned from a given source, or show clone relationships for all templates';

const builder = (yargs) => {
  yargs.positional('source', {
    describe: 'Source template name to filter clones by',
    type: 'string',
  });
};

const handler = async (argv) => {
  const { source } = argv;
  const templates = listTemplates();

  const clones = templates
    .map((name) => {
      try {
        const meta = loadTemplateMeta(name);
        return meta.clonedFrom ? { name, clonedFrom: meta.clonedFrom } : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (clones.length === 0) {
    console.log('No cloned templates found.');
    return;
  }

  const filtered = source ? clones.filter((c) => c.clonedFrom === source) : clones;

  if (filtered.length === 0) {
    console.log(`No templates cloned from "${source}".`);
    return;
  }

  if (source) {
    console.log(`Templates cloned from "${source}":`);
  } else {
    console.log('Clone relationships:');
  }

  for (const { name, clonedFrom } of filtered) {
    console.log(`  ${name}  <--  ${clonedFrom}`);
  }
};

module.exports = { command, desc, builder, handler };
