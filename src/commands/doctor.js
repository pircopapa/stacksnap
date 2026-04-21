const { loadConfig, getTemplatesDir } = require('../config');
const { listTemplates, loadTemplateMeta } = require('../templates');
const fs = require('fs');
const path = require('path');

const command = 'doctor';
const desc = 'Check the health of your stacksnap setup';

const REQUIRED_META_FIELDS = ['name', 'description', 'version'];

async function runChecks() {
  const results = [];

  // Check config
  try {
    const config = loadConfig();
    results.push({ check: 'Config file readable', ok: true });
    const templatesDir = getTemplatesDir(config);
    const dirExists = fs.existsSync(templatesDir);
    results.push({ check: 'Templates directory exists', ok: dirExists, detail: templatesDir });
  } catch (e) {
    results.push({ check: 'Config file readable', ok: false, detail: e.message });
  }

  // Check templates
  try {
    const config = loadConfig();
    const templates = listTemplates(config);
    results.push({ check: `Templates found (${templates.length})`, ok: true });

    for (const name of templates) {
      try {
        const meta = loadTemplateMeta(name, config);
        const missing = REQUIRED_META_FIELDS.filter(f => !meta[f]);
        if (missing.length > 0) {
          results.push({ check: `Template "${name}" meta`, ok: false, detail: `Missing: ${missing.join(', ')}` });
        } else {
          results.push({ check: `Template "${name}" meta`, ok: true });
        }
      } catch (e) {
        results.push({ check: `Template "${name}" meta`, ok: false, detail: e.message });
      }
    }
  } catch (e) {
    results.push({ check: 'Templates readable', ok: false, detail: e.message });
  }

  return results;
}

async function handler(argv) {
  const results = await runChecks();
  let allOk = true;

  for (const r of results) {
    const icon = r.ok ? '✅' : '❌';
    const detail = r.detail ? ` (${r.detail})` : '';
    console.log(`${icon} ${r.check}${detail}`);
    if (!r.ok) allOk = false;
  }

  if (allOk) {
    console.log('\nAll checks passed!');
  } else {
    console.log('\nSome checks failed. Review the issues above.');
    process.exitCode = 1;
  }
}

module.exports = { command, desc, handler, runChecks };
