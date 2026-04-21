const path = require('path');
const fs = require('fs');
const { getTemplatesDir, loadConfig } = require('../config');
const { listTemplates, loadTemplateMeta } = require('../templates');

exports.command = 'prune';
exports.desc = 'Remove templates that have not been used within a given number of days';

exports.builder = (yargs) =>
  yargs
    .option('days', {
      alias: 'd',
      type: 'number',
      default: 90,
      describe: 'Templates unused for this many days will be removed',
    })
    .option('dry-run', {
      alias: 'n',
      type: 'boolean',
      default: false,
      describe: 'Show what would be removed without deleting',
    });

exports.handler = async (argv) => {
  const { days, dryRun } = argv;
  const config = loadConfig();
  const history = config.history || [];
  const templatesDir = getTemplatesDir();
  const templates = listTemplates(templatesDir);

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  const lastUsed = {};
  for (const entry of history) {
    if (!lastUsed[entry.template] || new Date(entry.date).getTime() > lastUsed[entry.template]) {
      lastUsed[entry.template] = new Date(entry.date).getTime();
    }
  }

  const candidates = templates.filter((name) => {
    const ts = lastUsed[name];
    return ts === undefined || ts < cutoff;
  });

  if (candidates.length === 0) {
    console.log('No templates eligible for pruning.');
    return;
  }

  console.log(`Templates unused for more than ${days} days:`);
  for (const name of candidates) {
    console.log(`  - ${name}`);
  }

  if (dryRun) {
    console.log(`\nDry run — ${candidates.length} template(s) would be removed.`);
    return;
  }

  for (const name of candidates) {
    const templatePath = path.join(templatesDir, name);
    fs.rmSync(templatePath, { recursive: true, force: true });
  }

  console.log(`\nRemoved ${candidates.length} template(s).`);
};
