const { loadConfig, saveConfig, getConfigPath } = require('../config');

const command = 'config [key] [value]';
const desc = 'View or update stacksnap configuration';

const builder = (yargs) => {
  yargs
    .positional('key', { describe: 'Config key to get or set', type: 'string' })
    .positional('value', { describe: 'Value to set for the key', type: 'string' })
    .option('list', { alias: 'l', type: 'boolean', describe: 'List all config values', default: false })
    .option('reset', { type: 'boolean', describe: 'Reset a key to its default', default: false });
};

const handler = (argv) => {
  const { key, value, list } = argv;
  const cfg = loadConfig();

  if (list || (!key && !value)) {
    console.log(`Config file: ${getConfigPath()}\n`);
    Object.entries(cfg).forEach(([k, v]) => {
      console.log(`  ${k}: ${JSON.stringify(v)}`);
    });
    return;
  }

  if (key && value === undefined) {
    if (!(key in cfg)) {
      console.error(`Unknown config key: "${key}"`);
      process.exit(1);
    }
    console.log(`${key}: ${JSON.stringify(cfg[key])}`);
    return;
  }

  if (key && value !== undefined) {
    const parsed = value === 'true' ? true : value === 'false' ? false : value;
    const updated = saveConfig({ [key]: parsed });
    console.log(`✔ Set ${key} = ${JSON.stringify(updated[key])}`);
    return;
  }

  console.error('Usage: stacksnap config [key] [value]');
  process.exit(1);
};

module.exports = { command, desc, builder, handler };
