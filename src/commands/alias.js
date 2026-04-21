import fs from 'fs';
import path from 'path';
import { loadConfig, saveConfig } from '../config.js';
import { templateExists } from '../templates.js';

export const command = 'alias <action>';
export const desc = 'Manage template aliases';

export const builder = (yargs) => {
  yargs
    .positional('action', {
      describe: 'Action to perform: set, remove, list',
      type: 'string',
      choices: ['set', 'remove', 'list'],
    })
    .option('name', {
      alias: 'n',
      type: 'string',
      describe: 'Alias name',
    })
    .option('template', {
      alias: 't',
      type: 'string',
      describe: 'Template to alias',
    });
};

export const handler = async (argv) => {
  const { action, name, template } = argv;
  const config = loadConfig();

  if (!config.aliases) {
    config.aliases = {};
  }

  if (action === 'list') {
    const aliases = Object.entries(config.aliases);
    if (aliases.length === 0) {
      console.log('No aliases defined.');
      return;
    }
    console.log('Defined aliases:');
    for (const [alias, tmpl] of aliases) {
      console.log(`  ${alias} -> ${tmpl}`);
    }
    return;
  }

  if (action === 'set') {
    if (!name || !template) {
      console.error('Error: --name and --template are required for set action.');
      process.exit(1);
    }
    if (!templateExists(template)) {
      console.error(`Error: Template "${template}" does not exist.`);
      process.exit(1);
    }
    config.aliases[name] = template;
    saveConfig(config);
    console.log(`Alias "${name}" -> "${template}" saved.`);
    return;
  }

  if (action === 'remove') {
    if (!name) {
      console.error('Error: --name is required for remove action.');
      process.exit(1);
    }
    if (!config.aliases[name]) {
      console.error(`Error: Alias "${name}" not found.`);
      process.exit(1);
    }
    delete config.aliases[name];
    saveConfig(config);
    console.log(`Alias "${name}" removed.`);
  }
};

export const resolveAlias = (nameOrTemplate) => {
  const config = loadConfig();
  const aliases = config.aliases || {};
  return aliases[nameOrTemplate] || nameOrTemplate;
};
