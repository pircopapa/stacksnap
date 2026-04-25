const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('./config', () => ({
  getTemplatesDir: () => tmpDir,
}));

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-deps-'));
  fs.mkdirSync(path.join(tmpDir, 'my-template'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const {
  addDependency,
  removeDependency,
  getDependencies,
  hasDependency,
  getDepsPath,
} = require('./dependencies');

test('getDepsPath returns correct path', () => {
  const p = getDepsPath('my-template');
  expect(p).toContain(path.join('my-template', '.deps.json'));
});

test('getDependencies returns empty object when no deps file', () => {
  const deps = getDependencies('my-template');
  expect(deps).toEqual({});
});

test('addDependency adds a dep with default version', () => {
  addDependency('my-template', 'react');
  const deps = getDependencies('my-template');
  expect(deps['react']).toBe('*');
});

test('addDependency adds a dep with specific version', () => {
  addDependency('my-template', 'express', '^4.18.0');
  const deps = getDependencies('my-template');
  expect(deps['express']).toBe('^4.18.0');
});

test('removeDependency removes an existing dep', () => {
  addDependency('my-template', 'lodash', '^4.0.0');
  removeDependency('my-template', 'lodash');
  const deps = getDependencies('my-template');
  expect(deps['lodash']).toBeUndefined();
});

test('hasDependency returns true when dep exists', () => {
  addDependency('my-template', 'axios', '^1.0.0');
  expect(hasDependency('my-template', 'axios')).toBe(true);
});

test('hasDependency returns false when dep does not exist', () => {
  expect(hasDependency('my-template', 'nonexistent')).toBe(false);
});
