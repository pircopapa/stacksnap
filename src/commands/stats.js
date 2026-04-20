import { loadConfig } from '../config.js';
import { listTemplates, loadTemplateMeta } from '../templates.js';
import path from 'path';
import fs from 'fs';

export const command = 'stats';
export const desc = 'Show usage statistics for templates';

export const builder = (yargs) =>
  yargs.option('template', {
    alias: 't',
    type: 'string',
    description: 'Show stats for a specific template',
  });

function getHistory(config) {
  return config.history || [];
}

function buildStats(history, templates) {
  const counts = {};
  for (const entry of history) {
    const name = entry.template;
    counts[name] = (counts[name] || 0) + 1;
  }
  return templates.map((t) => ({
    name: t,
    uses: counts[t] || 0,
    lastUsed: history
      .filter((e) => e.template === t)
      .map((e) => e.date)
      .sort()
      .reverse()[0] || null,
  }));
}

export const handler = async (argv) => {
  const config = await loadConfig();
  const history = getHistory(config);
  const templates = await listTemplates(config);

  if (argv.template) {
    const entries = history.filter((e) => e.template === argv.template);
    console.log(`Stats for template: ${argv.template}`);
    console.log(`  Total uses : ${entries.length}`);
    const last = entries.map((e) => e.date).sort().reverse()[0];
    console.log(`  Last used  : ${last || 'never'}`);
    return;
  }

  const stats = buildStats(history, templates);
  if (stats.length === 0) {
    console.log('No templates found.');
    return;
  }

  console.log('Template usage statistics:\n');
  const sorted = stats.sort((a, b) => b.uses - a.uses);
  for (const s of sorted) {
    const last = s.lastUsed ? `last used ${s.lastUsed}` : 'never used';
    console.log(`  ${s.name.padEnd(30)} ${String(s.uses).padStart(4)} use(s)  (${last})`);
  }
};
