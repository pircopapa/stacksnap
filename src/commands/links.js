const { getTemplatesDir } = require('../config');
const { templateExists } = require('../templates');
const { getLinks } = require('../links');
const path = require('path');

const command = 'links <template>';
const desc = 'List all links associated with a template';

const builder = (yargs) =>
  yargs.positional('template', {
    describe: 'Template name',
    type: 'string',
  });

const handler = async (argv) => {
  const { template } = argv;
  const templatesDir = getTemplatesDir();
  const templatePath = path.join(templatesDir, template);

  if (!templateExists(templatePath)) {
    console.error(`Template "${template}" does not exist.`);
    process.exit(1);
  }

  const links = getLinks(templatePath);

  if (links.length === 0) {
    console.log(`No links found for template "${template}".`);
    return;
  }

  console.log(`Links for "${template}":`);
  links.forEach((entry, i) => {
    const label = entry.label ? ` (${entry.label})` : '';
    console.log(`  ${i + 1}. ${entry.url}${label}`);
  });
};

module.exports = { command, desc, builder, handler };
