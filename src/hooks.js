const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

const HOOK_NAMES = ['pre-create', 'post-create', 'pre-delete', 'post-delete'];

function getHooksDir(templateName) {
  return path.join(getTemplatesDir(), templateName, '.hooks');
}

function getHookPath(templateName, hookName) {
  return path.join(getHooksDir(templateName), `${hookName}.js`);
}

function hookExists(templateName, hookName) {
  return fs.existsSync(getHookPath(templateName, hookName));
}

function listHooks(templateName) {
  const hooksDir = getHooksDir(templateName);
  if (!fs.existsSync(hooksDir)) return [];
  return fs.readdirSync(hooksDir)
    .filter(f => f.endsWith('.js'))
    .map(f => f.replace('.js', ''));
}

async function runHook(templateName, hookName, context = {}) {
  const hookPath = getHookPath(templateName, hookName);
  if (!fs.existsSync(hookPath)) return { ran: false };
  try {
    const hook = require(hookPath);
    if (typeof hook === 'function') {
      await hook(context);
    } else if (typeof hook.run === 'function') {
      await hook.run(context);
    }
    return { ran: true, hook: hookName };
  } catch (err) {
    return { ran: false, error: err.message };
  }
}

function writeHook(templateName, hookName, content) {
  if (!HOOK_NAMES.includes(hookName)) {
    throw new Error(`Unknown hook: ${hookName}. Valid hooks: ${HOOK_NAMES.join(', ')}`);
  }
  const hooksDir = getHooksDir(templateName);
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(getHookPath(templateName, hookName), content, 'utf8');
}

module.exports = { HOOK_NAMES, getHooksDir, getHookPath, hookExists, listHooks, runHook, writeHook };
