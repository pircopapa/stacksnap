const { getTemplatesDir } = require('../config');
const { listTemplates, loadTemplateMeta } = require('../templates');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const command = 'duplicates';
const desc = 'Find templates with identical or near-identical content';

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Generates a fingerprint for a template directory by hashing the names and
 * contents of all top-level files. Directories are noted but not recursed into.
 * @param {string} templatePath - Absolute path to the template directory.
 * @returns {string} MD5 hex digest representing the template's content.
 */
function getTemplateFingerprint(templatePath) {
  const files = fs.readdirSync(templatePath).sort();
  const hashes = files.map((f) => {
    const full = path.join(templatePath, f);
    if (fs.statSync(full).isFile()) {
      return `${f}:${hashFile(full)}`;
    }
    return `${f}:dir`;
  });
  return crypto.createHash('md5').update(hashes.join('|')).digest('hex');
}

async function handler(argv) {
  const templatesDir = getTemplatesDir();
  const templates = listTemplates(templatesDir);

  if (templates.length === 0) {
    console.log('No templates found.');
    return;
  }

  const fingerprintMap = {};

  for (const name of templates) {
    const templatePath = path.join(templatesDir, name);
    try {
      const fp = getTemplateFingerprint(templatePath);
      if (!fingerprintMap[fp]) fingerprintMap[fp] = [];
      fingerprintMap[fp].push(name);
    } catch (err) {
      if (argv.verbose) console.warn(`  Skipping ${name}: ${err.message}`);
    }
  }

  const groups = Object.values(fingerprintMap).filter((g) => g.length > 1);

  if (groups.length === 0) {
    console.log('No duplicate templates found.');
    return;
  }

  console.log(`Found ${groups.length} group(s) of duplicate templates:\n`);
  groups.forEach((group, i) => {
    console.log(`  Group ${i + 1}:`);
    group.forEach((name) => console.log(`    - ${name}`));
  });
}

module.exports = { command, desc, handler, getTemplateFingerprint };
