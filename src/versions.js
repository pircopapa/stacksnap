const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

function getVersionsPath(templateName) {
  return path.join(getTemplatesDir(), templateName, '.versions.json');
}

function loadVersions(templateName) {
  const filePath = getVersionsPath(templateName);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function saveVersions(templateName, versions) {
  const filePath = getVersionsPath(templateName);
  fs.writeFileSync(filePath, JSON.stringify(versions, null, 2));
}

function addVersion(templateName, version, note = '') {
  const versions = loadVersions(templateName);
  const entry = { version, note, createdAt: new Date().toISOString() };
  versions.push(entry);
  saveVersions(templateName, versions);
  return entry;
}

function getVersions(templateName) {
  return loadVersions(templateName);
}

function getLatestVersion(templateName) {
  const versions = loadVersions(templateName);
  return versions.length ? versions[versions.length - 1] : null;
}

function removeVersion(templateName, version) {
  const versions = loadVersions(templateName);
  const filtered = versions.filter(v => v.version !== version);
  if (filtered.length === versions.length) return false;
  saveVersions(templateName, filtered);
  return true;
}

module.exports = {
  getVersionsPath,
  loadVersions,
  saveVersions,
  addVersion,
  getVersions,
  getLatestVersion,
  removeVersion,
};
