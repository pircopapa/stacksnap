const { loadTemplateMeta, templateExists, getTemplatePath } = require('../templates');
const path = require('path');
const fs = require('fs');

const command = 'untag <template> <tag>';
const desc = 'Remove a tag from a template';

const builder = (yargs) => {
  yargs
    .positional('template', {
      describe: 'Template name',
      type: 'string',
    })
    .positional('tag', {
      describe: 'Tag to remove',
      type: 'string',
    });
};

const handler = async (argv) => {
  const { template, tag } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const meta = loadTemplateMeta(template);

  if (!Array.isArray(meta.tags) || !meta.tags.includes(tag)) {
    console.error(`Tag "${tag}" is not present on template "${template}".`);
    process.exit(1);
  }

  meta.tags = meta.tags.filter((t) => t !== tag);

  const metaPath = path.join(getTemplatePath(template), 'meta.json');
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));

  console.log(`Removed tag "${tag}" from template "${template}".`);
  if (meta.tags.length > 0) {
    console.log(`Remaining tags: ${meta.tags.join(', ')}`);
  } else {
    console.log('No tags remaining.');
  }
};

module.exports = { command, desc, builder, handler };
