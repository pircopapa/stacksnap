const { loadConfig, saveConfig } = require('./config');

async function getFavorites() {
  const config = await loadConfig();
  return config.favorites || [];
}

async function addFavorite(template) {
  const config = await loadConfig();
  const favorites = config.favorites || [];
  if (favorites.includes(template)) return false;
  favorites.push(template);
  config.favorites = favorites;
  await saveConfig(config);
  return true;
}

async function removeFavorite(template) {
  const config = await loadConfig();
  const favorites = config.favorites || [];
  const index = favorites.indexOf(template);
  if (index === -1) return false;
  favorites.splice(index, 1);
  config.favorites = favorites;
  await saveConfig(config);
  return true;
}

async function isFavorite(template) {
  const favorites = await getFavorites();
  return favorites.includes(template);
}

module.exports = { getFavorites, addFavorite, removeFavorite, isFavorite };
