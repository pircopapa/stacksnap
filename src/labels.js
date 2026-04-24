const fs = require('fs');
const path = require('path');
const { getConfigPath } = require('./config');

function getLabelsPath() {
  return path.join(path.dirname(getConfigPath()), 'labels.json');
}

function loadLabels() {
  const labelsPath = getLabelsPath();
  if (!fs.existsSync(labelsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveLabels(labels) {
  const labelsPath = getLabelsPath();
  fs.writeFileSync(labelsPath, JSON.stringify(labels, null, 2));
}

function getLabels(templateName) {
  const labels = loadLabels();
  return labels[templateName] || [];
}

function addLabel(templateName, label) {
  const labels = loadLabels();
  if (!labels[templateName]) labels[templateName] = [];
  if (!labels[templateName].includes(label)) {
    labels[templateName].push(label);
    saveLabels(labels);
    return true;
  }
  return false;
}

function removeLabel(templateName, label) {
  const labels = loadLabels();
  if (!labels[templateName]) return false;
  const idx = labels[templateName].indexOf(label);
  if (idx === -1) return false;
  labels[templateName].splice(idx, 1);
  if (labels[templateName].length === 0) delete labels[templateName];
  saveLabels(labels);
  return true;
}

function searchByLabel(label) {
  const labels = loadLabels();
  return Object.entries(labels)
    .filter(([, lbls]) => lbls.includes(label))
    .map(([name]) => name);
}

module.exports = { getLabelsPath, getLabels, addLabel, removeLabel, searchByLabel };
