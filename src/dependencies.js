const fs = require('fs');
const path = require('path');
const { getTemplatesDir } = require('./config');

function getDepsPath(templateName) {
  return path.join(getTemplatesDir(), templateName, '.deps.json');
}

function loadDeps(templateName) {
  const depsPath = getDepsPath(templateName);
  if (!fs.existsSync(depsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(depsPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveDeps(templateName, deps) {
  const depsPath = getDepsPath(templateName);
  fs.writeFileSync(depsPath, JSON.stringify(deps, null, 2));
}

function addDependency(templateName, depName, version = '*') {
  const deps = loadDeps(templateName);
  deps[depName] = version;
  saveDeps(templateName, deps);
  return deps;
}

function removeDependency(templateName, depName) {
  const deps = loadDeps(templateName);
  delete deps[depName];
  saveDeps(templateName, deps);
  return deps;
}

function getDependencies(templateName) {
  return loadDeps(templateName);
}

function hasDependency(templateName, depName) {
  const deps = loadDeps(templateName);
  return Object.prototype.hasOwnProperty.call(deps, depName);
}

module.exports = {
  getDepsPath,
  loadDeps,
  saveDeps,
  addDependency,
  removeDependency,
  getDependencies,
  hasDependency,
};
