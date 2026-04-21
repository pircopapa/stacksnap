const path = require('path');
const os = require('os');
const fs = require('fs');

const CONFIG_DIR = path.join(os.homedir(), '.stacksnap');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const TEMPLATES_DIR = path.join(CONFIG_DIR, 'templates');

const defaults = {
  templatesDir: TEMPLATES_DIR,
  defaultAuthor: '',
  colorOutput: true,
};

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  if (!fs.existsSync(TEMPLATES_DIR)) fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(CONFIG_FILE)) return { ...defaults };
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

function saveConfig(updates) {
  ensureConfigDir();
  const current = loadConfig();
  const next = { ...current, ...updates };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(next, null, 2));
  return next;
}

function getConfigPath() {
  return CONFIG_FILE;
}

function getTemplatesDir() {
  return loadConfig().templatesDir;
}

/**
 * Resets the config file back to default values.
 * Returns the default config object that was written.
 */
function resetConfig() {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaults, null, 2));
  return { ...defaults };
}

module.exports = { loadConfig, saveConfig, resetConfig, getConfigPath, getTemplatesDir, CONFIG_FILE, CONFIG_DIR };
