const { loadConfig, saveConfig } = require('./config');
const { listTemplates } = require('./templates');

function getAnnotations() {
  const config = loadConfig();
  return config.annotations || {};
}

function setAnnotation(template, note) {
  const config = loadConfig();
  if (!config.annotations) config.annotations = {};
  config.annotations[template] = note;
  saveConfig(config);
}

function clearAnnotation(template) {
  const config = loadConfig();
  if (!config.annotations) return;
  delete config.annotations[template];
  saveConfig(config);
}

function getAnnotation(template) {
  const annotations = getAnnotations();
  return annotations[template] || null;
}

function searchAnnotations(keyword) {
  const annotations = getAnnotations();
  const templates = listTemplates();
  return Object.entries(annotations)
    .filter(([name, note]) => {
      if (!templates.includes(name)) return false;
      return (
        name.toLowerCase().includes(keyword.toLowerCase()) ||
        note.toLowerCase().includes(keyword.toLowerCase())
      );
    })
    .map(([name, note]) => ({ name, note }));
}

module.exports = { getAnnotations, setAnnotation, clearAnnotation, getAnnotation, searchAnnotations };
