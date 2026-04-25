const { getTemplatesDir, loadConfig } = require('../config');
const { templateExists } = require('../templates');
const {
  setVisibility,
  getVisibility,
  clearVisibility,
  VALID_VISIBILITY
} = require('../visibility');

const command = 'visibility <template> [level]';
const desc = 'Get or set the visibility level of a template';

const builder = (yargs) => {
  yargs
    .positional('template', {
      describe: 'Template name',
      type: 'string'
    })
    .positional('level', {
      describe: `Visibility level (${VALID_VISIBILITY.join(', ')})`,
      type: 'string'
    })
    .option('reset', {
      alias: 'r',
      describe: 'Reset visibility to default (public)',
      type: 'boolean',
      default: false
    });
};

async function handler(argv) {
  const { template, level, reset } = argv;
  const config = loadConfig();
  const templatesDir = getTemplatesDir(config);

  if (!templateExists(templatesDir, template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (reset) {
    clearVisibility(templatesDir, template);
    console.log(`Visibility for "${template}" reset to public.`);
    return;
  }

  if (!level) {
    const current = getVisibility(templatesDir, template);
    console.log(`${template}: ${current}`);
    return;
  }

  try {
    setVisibility(templatesDir, template, level);
    console.log(`Visibility for "${template}" set to "${level}".`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { command, desc, builder, handler };
