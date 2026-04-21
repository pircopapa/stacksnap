import { loadConfig, saveConfig } from '../config.js';
import { templateExists } from '../templates.js';

export const command = 'pin <template>';
export const desc = 'Pin a template to your favorites list';

export const builder = (yargs) => {
  yargs
    .positional('template', {
      describe: 'Template name to pin',
      type: 'string',
    })
    .option('unpin', {
      alias: 'u',
      type: 'boolean',
      description: 'Unpin the template instead',
      default: false,
    });
};

export const handler = async (argv) => {
  const { template, unpin } = argv;

  if (!templateExists(template)) {
    console.error(`Template "${template}" does not exist.`);
    process.exit(1);
  }

  const config = loadConfig();
  const pinned = config.pinned || [];

  if (unpin) {
    const index = pinned.indexOf(template);
    if (index === -1) {
      console.log(`Template "${template}" is not pinned.`);
      return;
    }
    pinned.splice(index, 1);
    saveConfig({ ...config, pinned });
    console.log(`Unpinned template "${template}".`);
  } else {
    if (pinned.includes(template)) {
      console.log(`Template "${template}" is already pinned.`);
      return;
    }
    pinned.push(template);
    saveConfig({ ...config, pinned });
    console.log(`Pinned template "${template}".`);
  }
};
