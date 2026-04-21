const path = require('path');
const fs = require('fs');
const { templateExists, loadTemplateMeta, getTemplatePath } = require('../templates');
const { saveConfig, loadConfig } = require('../config');

const command = 'annotate <template>';
const desc = 'Add or update a note/annotation on a template';

const builder = (yargs) => {
  yargs
    .positional('template', {
      describe: 'Template name to annotate',
      type: 'string',
    })
    .option('note', {
      alias: 'n',
      describe: 'Annotation text to set',
      type: 'string',
    })
    .option('clear', {
      describe: 'Clear the existing annotation',
      type: 'boolean',
      default: false,
    });
};

const handler = async (argv) => {
  const { template, note, clear } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" not found.`);
    process.exit(1);
  }

  const config = loadConfig();
  if (!config.annotations) config.annotations = {};

  if (clear) {
    delete config.annotations[template];
    saveConfig(config);
    console.log(`Annotation cleared for "${template}".`);
    return;
  }

  if (!note) {
    const existing = config.annotations[template];
    if (existing) {
      console.log(`Annotation for "${template}": ${existing}`);
    } else {
      console.log(`No annotation set for "${template}".`);
    }
    return;
  }

  config.annotations[template] = note;
  saveConfig(config);
  console.log(`Annotation set for "${template}": ${note}`);
};

module.exports = { command, desc, builder, handler };
