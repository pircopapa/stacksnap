const { loadConfig, saveConfig } = require('../config');

const MAX_HISTORY = 20;

const command = 'history';
const describe = 'Show recently used templates';

const builder = (yargs) => {
  yargs
    .option('clear', {
      type: 'boolean',
      describe: 'Clear usage history',
      default: false,
    })
    .option('limit', {
      alias: 'n',
      type: 'number',
      describe: 'Number of entries to show',
      default: 10,
    });
};

const recordUsage = (templateName) => {
  const config = loadConfig();
  const history = config.history || [];
  const entry = { template: templateName, usedAt: new Date().toISOString() };
  const updated = [entry, ...history.filter((h) => h.template !== templateName)].slice(0, MAX_HISTORY);
  saveConfig({ ...config, history: updated });
};

const handler = (argv) => {
  const { clear, limit } = argv;
  const config = loadConfig();

  if (clear) {
    saveConfig({ ...config, history: [] });
    console.log('Usage history cleared.');
    return;
  }

  const history = (config.history || []).slice(0, limit);

  if (history.length === 0) {
    console.log('No template usage history found.');
    return;
  }

  console.log('Recent template usage:\n');
  history.forEach((entry, i) => {
    const date = new Date(entry.usedAt).toLocaleString();
    console.log(`  ${i + 1}. ${entry.template} — ${date}`);
  });
};

module.exports = { command, describe, builder, handler, recordUsage };
