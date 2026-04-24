const path = require('path');
const fs = require('fs');
const { getConfigPath } = require('./config');

function getRatingsPath() {
  return path.join(path.dirname(getConfigPath()), 'ratings.json');
}

function loadRatings() {
  const p = getRatingsPath();
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function saveRatings(ratings) {
  fs.writeFileSync(getRatingsPath(), JSON.stringify(ratings, null, 2));
}

function setRating(templateName, score) {
  if (score < 1 || score > 5) throw new Error('Rating must be between 1 and 5');
  const ratings = loadRatings();
  ratings[templateName] = { score, updatedAt: new Date().toISOString() };
  saveRatings(ratings);
  return ratings[templateName];
}

function getRating(templateName) {
  const ratings = loadRatings();
  return ratings[templateName] || null;
}

function removeRating(templateName) {
  const ratings = loadRatings();
  if (!ratings[templateName]) return false;
  delete ratings[templateName];
  saveRatings(ratings);
  return true;
}

function getTopRated(limit = 5) {
  const ratings = loadRatings();
  return Object.entries(ratings)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

module.exports = { getRatingsPath, loadRatings, setRating, getRating, removeRating, getTopRated };
