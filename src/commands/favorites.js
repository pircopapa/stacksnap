const { loadConfig, saveConfig } = require('../config');

const command = 'favorites';
const desc = 'List all favorited templates';

const builder = {};

async function handler() {
  const config = await loadConfig();
  const favorites = config.favorites || [];

  if (favorites.length === 0) {
    console.log('No favorites saved. Use `stacksnap favorite <template>` to add one.');
    return;
  }

  console.log('Favorited templates:');
  favorites.forEach((name, i) => {
    console.log(`  ${i + 1}. ${name}`);
  });
}

module.exports = { command, desc, builder, handler };
