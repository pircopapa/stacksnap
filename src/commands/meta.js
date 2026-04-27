const { templateExists } = require('../templates');
const {
  loadMeta,
  getMetaField,
  setMetaField,
  removeMetaField,
  listMetaFields,
} = require('../metadata');

const command = 'meta <template> [field] [value]';
const describe = 'Read or write metadata fields on a template';

const builder = (yargs) =>
  yargs
    .positional('template', { describe: 'Template name', type: 'string' })
    .positional('field', { describe: 'Field name to get or set', type: 'string' })
    .positional('value', { describe: 'Value to set (omit to read)', type: 'string' })
    .option('remove', {
      alias: 'r',
      type: 'boolean',
      description: 'Remove the specified field',
    })
    .option('list', {
      alias: 'l',
      type: 'boolean',
      description: 'List all metadata fields',
    });

function handler(argv) {
  const { template, field, value, remove, list } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  if (list || (!field && !value && !remove)) {
    const meta = loadMeta(template);
    const keys = Object.keys(meta);
    if (keys.length === 0) {
      console.log(`No metadata set for "${template}".`);
    } else {
      keys.forEach((k) => console.log(`${k}: ${JSON.stringify(meta[k])}`));
    }
    return;
  }

  if (!field) {
    console.error('A field name is required.');
    process.exit(1);
  }

  if (remove) {
    removeMetaField(template, field);
    console.log(`Removed field "${field}" from "${template}".`);
    return;
  }

  if (value !== undefined) {
    setMetaField(template, field, value);
    console.log(`Set "${field}" = "${value}" on "${template}".`);
  } else {
    const result = getMetaField(template, field);
    if (result === null) {
      console.log(`Field "${field}" not set on "${template}".`);
    } else {
      console.log(`${field}: ${JSON.stringify(result)}`);
    }
  }
}

module.exports = { command, describe, builder, handler };
