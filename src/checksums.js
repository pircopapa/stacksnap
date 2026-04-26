const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getTemplatesDir } = require('./config');

function getChecksumsPath(templateName) {
  return path.join(getTemplatesDir(), templateName, '.checksums.json');
}

function loadChecksums(templateName) {
  const p = getChecksumsPath(templateName);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveChecksums(templateName, checksums) {
  const p = getChecksumsPath(templateName);
  fs.writeFileSync(p, JSON.stringify(checksums, null, 2));
}

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function computeChecksums(templateName) {
  const dir = path.join(getTemplatesDir(), templateName);
  const result = {};
  function walk(current) {
    for (const entry of fs.readdirSync(current)) {
      if (entry === '.checksums.json') continue;
      const full = path.join(current, entry);
      const rel = path.relative(dir, full);
      if (fs.statSync(full).isDirectory()) {
        walk(full);
      } else {
        result[rel] = hashFile(full);
      }
    }
  }
  walk(dir);
  return result;
}

function verifyChecksums(templateName) {
  const stored = loadChecksums(templateName);
  const current = computeChecksums(templateName);
  const issues = [];
  for (const [file, hash] of Object.entries(stored)) {
    if (!current[file]) {
      issues.push({ file, status: 'missing' });
    } else if (current[file] !== hash) {
      issues.push({ file, status: 'modified' });
    }
  }
  for (const file of Object.keys(current)) {
    if (!stored[file]) {
      issues.push({ file, status: 'untracked' });
    }
  }
  return issues;
}

module.exports = {
  getChecksumsPath,
  loadChecksums,
  saveChecksums,
  computeChecksums,
  verifyChecksums,
  hashFile,
};
