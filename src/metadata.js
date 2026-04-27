const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

function getMetaPath(templateName) {
  return path.join(getTemplatesDir(), templateName, 'meta.json');
}

function loadMeta(templateName) {
  const metaPath = getMetaPath(templateName);
  if (!fs.existsSync(metaPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveMeta(templateName, meta) {
  const metaPath = getMetaPath(templateName);
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
}

function getMetaField(templateName, field) {
  const meta = loadMeta(templateName);
  return meta[field] ?? null;
}

function setMetaField(templateName, field, value) {
  const meta = loadMeta(templateName);
  meta[field] = value;
  saveMeta(templateName, meta);
}

function removeMetaField(templateName, field) {
  const meta = loadMeta(templateName);
  delete meta[field];
  saveMeta(templateName, meta);
}

function listMetaFields(templateName) {
  return Object.keys(loadMeta(templateName));
}

module.exports = {
  getMetaPath,
  loadMeta,
  saveMeta,
  getMetaField,
  setMetaField,
  removeMetaField,
  listMetaFields,
};
