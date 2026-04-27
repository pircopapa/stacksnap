const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
let versions;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-versions-'));
  jest.resetModules();
  jest.mock('./config', () => ({ getTemplatesDir: () => tmpDir }));
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
  versions = require('./versions');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.resetModules();
});

test('loadVersions returns empty array when no file exists', () => {
  expect(versions.loadVersions('mytemplate')).toEqual([]);
});

test('addVersion adds a version entry', () => {
  const entry = versions.addVersion('mytemplate', '1.0.0', 'initial release');
  expect(entry.version).toBe('1.0.0');
  expect(entry.note).toBe('initial release');
  expect(entry.createdAt).toBeDefined();
});

test('getVersions returns all versions', () => {
  versions.addVersion('mytemplate', '1.0.0');
  versions.addVersion('mytemplate', '1.1.0', 'patch');
  const all = versions.getVersions('mytemplate');
  expect(all).toHaveLength(2);
  expect(all[1].version).toBe('1.1.0');
});

test('getLatestVersion returns last added version', () => {
  versions.addVersion('mytemplate', '1.0.0');
  versions.addVersion('mytemplate', '2.0.0', 'major bump');
  const latest = versions.getLatestVersion('mytemplate');
  expect(latest.version).toBe('2.0.0');
});

test('getLatestVersion returns null when no versions exist', () => {
  expect(versions.getLatestVersion('mytemplate')).toBeNull();
});

test('removeVersion removes a specific version', () => {
  versions.addVersion('mytemplate', '1.0.0');
  versions.addVersion('mytemplate', '1.1.0');
  const result = versions.removeVersion('mytemplate', '1.0.0');
  expect(result).toBe(true);
  expect(versions.getVersions('mytemplate')).toHaveLength(1);
});

test('removeVersion returns false if version not found', () => {
  versions.addVersion('mytemplate', '1.0.0');
  expect(versions.removeVersion('mytemplate', '9.9.9')).toBe(false);
});
