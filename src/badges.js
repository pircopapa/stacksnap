const fs = require('fs');
const path = require('path');
const { getConfigPath } = require('./config');

function getBadgesPath() {
  return path.join(path.dirname(getConfigPath()), 'badges.json');
}

function loadBadges() {
  const p = getBadgesPath();
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveBadges(badges) {
  fs.writeFileSync(getBadgesPath(), JSON.stringify(badges, null, 2));
}

function getBadges(templateName) {
  const badges = loadBadges();
  return badges[templateName] || [];
}

function addBadge(templateName, badge) {
  const badges = loadBadges();
  if (!badges[templateName]) badges[templateName] = [];
  if (!badges[templateName].includes(badge)) {
    badges[templateName].push(badge);
    saveBadges(badges);
  }
}

function removeBadge(templateName, badge) {
  const badges = loadBadges();
  if (!badges[templateName]) return;
  badges[templateName] = badges[templateName].filter(b => b !== badge);
  saveBadges(badges);
}

function clearBadges(templateName) {
  const badges = loadBadges();
  delete badges[templateName];
  saveBadges(badges);
}

function searchByBadge(badge) {
  const badges = loadBadges();
  return Object.entries(badges)
    .filter(([, list]) => list.includes(badge))
    .map(([name]) => name);
}

module.exports = { getBadgesPath, loadBadges, saveBadges, getBadges, addBadge, removeBadge, clearBadges, searchByBadge };
