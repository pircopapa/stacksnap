const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

function getChangelogPath(templateName) {
  return path.join(getTemplatesDir(), templateName, 'CHANGELOG.json');
}

function loadChangelog(templateName) {
  const p = getChangelogPath(templateName);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveChangelog(templateName, entries) {
  const p = getChangelogPath(templateName);
  fs.writeFileSync(p, JSON.stringify(entries, null, 2));
}

function addChangelogEntry(templateName, message, author = 'unknown') {
  const entries = loadChangelog(templateName);
  const entry = {
    id: Date.now(),
    message,
    author,
    timestamp: new Date().toISOString()
  };
  entries.unshift(entry);
  saveChangelog(templateName, entries);
  return entry;
}

function getChangelog(templateName) {
  return loadChangelog(templateName);
}

function clearChangelog(templateName) {
  saveChangelog(templateName, []);
}

module.exports = {
  getChangelogPath,
  loadChangelog,
  saveChangelog,
  addChangelogEntry,
  getChangelog,
  clearChangelog
};
