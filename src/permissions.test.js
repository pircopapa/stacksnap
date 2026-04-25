const fs = require('fs');
const path = require('path');

jest.mock('./config', () => ({
  getConfigPath: () => '/mock/.stacksnap/config.json',
}));

const PERMS_PATH = '/mock/.stacksnap/permissions.json';

jest.mock('fs');

let permissions;

beforeEach(() => {
  jest.resetModules();
  fs.existsSync.mockReturnValue(false);
  fs.readFileSync.mockReturnValue('{}');
  fs.writeFileSync.mockImplementation(() => {});
  permissions = require('./permissions');
});

test('getPermissionsPath returns correct path', () => {
  expect(permissions.getPermissionsPath()).toBe(PERMS_PATH);
});

test('loadPermissions returns empty object when file missing', () => {
  fs.existsSync.mockReturnValue(false);
  expect(permissions.loadPermissions()).toEqual({});
});

test('loadPermissions parses existing file', () => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue(JSON.stringify({ mytemplate: 'read-only' }));
  expect(permissions.loadPermissions()).toEqual({ mytemplate: 'read-only' });
});

test('setPermission writes valid permission', () => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue('{}');
  permissions.setPermission('mytemplate', 'read-only');
  expect(fs.writeFileSync).toHaveBeenCalledWith(
    PERMS_PATH,
    JSON.stringify({ mytemplate: 'read-only' }, null, 2)
  );
});

test('setPermission throws on invalid permission', () => {
  expect(() => permissions.setPermission('mytemplate', 'banana')).toThrow('Invalid permission');
});

test('getPermission returns writable by default', () => {
  fs.existsSync.mockReturnValue(false);
  expect(permissions.getPermission('unknown')).toBe('writable');
});

test('getPermission returns stored value', () => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue(JSON.stringify({ mytemplate: 'locked' }));
  expect(permissions.getPermission('mytemplate')).toBe('locked');
});

test('isWritable returns false for read-only', () => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue(JSON.stringify({ t: 'read-only' }));
  expect(permissions.isWritable('t')).toBe(false);
});

test('isWritable returns true for writable', () => {
  fs.existsSync.mockReturnValue(false);
  expect(permissions.isWritable('t')).toBe(true);
});

test('removePermission deletes entry', () => {
  fs.existsSync.mockReturnValue(true);
  fs.readFileSync.mockReturnValue(JSON.stringify({ t: 'locked' }));
  permissions.removePermission('t');
  expect(fs.writeFileSync).toHaveBeenCalledWith(PERMS_PATH, JSON.stringify({}, null, 2));
});
