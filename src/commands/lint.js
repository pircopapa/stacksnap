const { loadTemplateMeta, templateExists, getTemplatePath } = require('../templates');
const { getTemplatesDir } = require('../config');
const fs = require('fs');
const path = require('path');

const VALID_META_FIELDS = ['name', 'description', 'version', 'tags', 'author', 'files'];
const REQUIRED_META_FIELDS = ['name', 'description'];

function lintTemplate(templateName) {
  const warnings = [];
  const errors = [];

  if (!templateExists(templateName)) {
    errors.push(`Template "${templateName}" does not exist.`);
    return { warnings, errors };
  }

  let meta;
  try {
    meta = loadTemplateMeta(templateName);
  } catch (e) {
    errors.push(`Failed to parse meta.json: ${e.message}`);
    return { warnings, errors };
  }

  for (const field of REQUIRED_META_FIELDS) {
    if (!meta[field] || String(meta[field]).trim() === '') {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  for (const key of Object.keys(meta)) {
    if (!VALID_META_FIELDS.includes(key)) {
      warnings.push(`Unknown meta field: "${key}"`);
    }
  }

  if (meta.version && !/^\d+\.\d+\.\d+$/.test(meta.version)) {
    warnings.push(`Field "version" does not follow semver format (e.g. 1.0.0).`);
  }

  if (meta.tags && !Array.isArray(meta.tags)) {
    errors.push(`Field "tags" must be an array.`);
  }

  const templateDir = getTemplatePath(templateName);
  const filesInDir = fs.readdirSync(templateDir).filter(f => f !== 'meta.json');
  if (filesInDir.length === 0) {
    warnings.push(`Template has no files besides meta.json.`);
  }

  return { warnings, errors };
}

const command = 'lint <template>';
const describe = 'Lint a template for common issues and metadata problems';
const builder = {};

function handler({ template }) {
  const { warnings, errors } = lintTemplate(template);

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`✅ Template "${template}" passed lint with no issues.`);
    return;
  }

  errors.forEach(e => console.error(`❌ ERROR: ${e}`));
  warnings.forEach(w => console.warn(`⚠️  WARN: ${w}`));

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

module.exports = { command, describe, builder, handler, lintTemplate };
