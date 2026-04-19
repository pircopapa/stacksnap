const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

/**
 * List all available templates by scanning the templates directory.
 * @returns {string[]} array of template names
 */
function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) {
    return [];
  }
  return fs.readdirSync(TEMPLATES_DIR).filter((entry) => {
    const stat = fs.statSync(path.join(TEMPLATES_DIR, entry));
    return stat.isDirectory();
  });
}

/**
 * Load metadata for a given template from its template.json file.
 * @param {string} templateName
 * @returns {object} metadata object or empty object if not found
 */
function loadTemplateMeta(templateName) {
  const metaPath = path.join(TEMPLATES_DIR, templateName, 'template.json');
  if (!fs.existsSync(metaPath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(metaPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Warning: could not parse metadata for template "${templateName}": ${err.message}`);
    return {};
  }
}

/**
 * Check whether a template exists.
 * @param {string} templateName
 * @returns {boolean}
 */
function templateExists(templateName) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  return fs.existsSync(templatePath) && fs.statSync(templatePath).isDirectory();
}

/**
 * Get the absolute path to a template directory.
 * @param {string} templateName
 * @returns {string}
 */
function getTemplatePath(templateName) {
  return path.join(TEMPLATES_DIR, templateName);
}

module.exports = { listTemplates, loadTemplateMeta, templateExists, getTemplatePath };
