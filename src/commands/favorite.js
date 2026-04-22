const { loadConfig, saveConfig } = require('../config');
const { templateExists } = require('../templates');

const command = 'favorite <template>';
const desc = 'Mark or unmark a template as a favorite';

const builder = {
  remove: {
    alias: 'r',
    type: 'boolean',
    description: 'Remove from favorites',
    default: false,
  },
};

async function handler(argv) {
  const { template, remove } = argv;

  if (!(await templateExists(template))) {
    console.error(`Template "${template}" does not exist.`);
    process.exit(1);
  }

  const config = await loadConfig();
  const favorites = config.favorites || [];

  if (remove) {
    const index = favorites.indexOf(template);
    if (index === -1) {
      console.log(`"${template}" is not in your favorites.`);
      return;
    }
    favorites.splice(index, 1);
    config.favorites = favorites;
    await saveConfig(config);
    console.log(`Removed "${template}" from favorites.`);
  } else {
    if (favorites.includes(template)) {
      console.log(`"${template}" is already in your favorites.`);
      return;
    }
    favorites.push(template);
    config.favorites = favorites;
    await saveConfig(config);
    console.log(`Added "${template}" to favorites.`);
  }
}

module.exports = { command, desc, builder, handler };
