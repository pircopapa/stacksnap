import { loadTemplateMeta, templateExists, getTemplatePath } from '../templates.js';
import { loadConfig, saveConfig } from '../config.js';
import path from 'path';
import fs from 'fs';

export const command = 'tag <action> <template> [tags..]';
export const desc = 'Add, remove, or list tags on a template';

export const builder = (yargs) => {
  yargs
    .positional('action', {
      describe: 'Action to perform',
      choices: ['add', 'remove', 'list'],
    })
    .positional('template', {
      describe: 'Template name',
      type: 'string',
    })
    .positional('tags', {
      describe: 'Tags to add or remove',
      type: 'array',
      default: [],
    });
};

export const handler = async (argv) => {
  const { action, template, tags } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const config = loadConfig();
  if (!config.tags) config.tags = {};
  if (!config.tags[template]) config.tags[template] = [];

  if (action === 'list') {
    const currentTags = config.tags[template];
    if (currentTags.length === 0) {
      console.log(`No tags for template "${template}".`);
    } else {
      console.log(`Tags for "${template}": ${currentTags.join(', ')}`);
    }
    return;
  }

  if (!tags || tags.length === 0) {
    console.error('No tags provided.');
    process.exit(1);
  }

  if (action === 'add') {
    const added = [];
    for (const tag of tags) {
      if (!config.tags[template].includes(tag)) {
        config.tags[template].push(tag);
        added.push(tag);
      }
    }
    saveConfig(config);
    console.log(`Added tags [${added.join(', ')}] to "${template}".`);
  } else if (action === 'remove') {
    config.tags[template] = config.tags[template].filter((t) => !tags.includes(t));
    saveConfig(config);
    console.log(`Removed tags [${tags.join(', ')}] from "${template}".`);
  }
};
