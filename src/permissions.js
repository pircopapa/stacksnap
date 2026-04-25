const fs = require('fs');
const path = require('path');
const { getConfigPath } = require('./config');

function getPermissionsPath() {
  return path.join(path.dirname(getConfigPath()), 'permissions.json');
}

function loadPermissions() {
  const p = getPermissionsPath();
  if (!fs.existsSync(p)) return {};
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return {};
  }
}

function savePermissions(data) {
  fs.writeFileSync(getPermissionsPath(), JSON.stringify(data, null, 2));
}

function setPermission(templateName, permission) {
  const valid = ['read-only', 'writable', 'locked'];
  if (!valid.includes(permission)) {
    throw new Error(`Invalid permission: ${permission}. Must be one of: ${valid.join(', ')}`);
  }
  const data = loadPermissions();
  data[templateName] = permission;
  savePermissions(data);
}

function getPermission(templateName) {
  const data = loadPermissions();
  return data[templateName] || 'writable';
}

function removePermission(templateName) {
  const data = loadPermissions();
  delete data[templateName];
  savePermissions(data);
}

function isWritable(templateName) {
  return getPermission(templateName) !== 'read-only' && getPermission(templateName) !== 'locked';
}

function listPermissions() {
  return loadPermissions();
}

module.exports = {
  getPermissionsPath,
  loadPermissions,
  savePermissions,
  setPermission,
  getPermission,
  removePermission,
  isWritable,
  listPermissions,
};
