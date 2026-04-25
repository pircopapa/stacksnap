const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

const VALID_VISIBILITY = ['public', 'private', 'hidden'];

function getVisibilityPath(templatesDir) {
  return path.join(templatesDir, '.visibility.json');
}

function loadVisibility(templatesDir) {
  const filePath = getVisibilityPath(templatesDir);
  if (!fs.existsSync(filePath)) return {};
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function saveVisibility(templatesDir, data) {
  const filePath = getVisibilityPath(templatesDir);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function setVisibility(templatesDir, templateName, level) {
  if (!VALID_VISIBILITY.includes(level)) {
    throw new Error(`Invalid visibility level "${level}". Must be one of: ${VALID_VISIBILITY.join(', ')}`);
  }
  const data = loadVisibility(templatesDir);
  data[templateName] = level;
  saveVisibility(templatesDir, data);
}

function getVisibility(templatesDir, templateName) {
  const data = loadVisibility(templatesDir);
  return data[templateName] || 'public';
}

function clearVisibility(templatesDir, templateName) {
  const data = loadVisibility(templatesDir);
  delete data[templateName];
  saveVisibility(templatesDir, data);
}

function filterByVisibility(templatesDir, templateNames, allowedLevels = ['public', 'private']) {
  const data = loadVisibility(templatesDir);
  return templateNames.filter(name => {
    const level = data[name] || 'public';
    return allowedLevels.includes(level);
  });
}

module.exports = {
  getVisibilityPath,
  loadVisibility,
  saveVisibility,
  setVisibility,
  getVisibility,
  clearVisibility,
  filterByVisibility,
  VALID_VISIBILITY
};
