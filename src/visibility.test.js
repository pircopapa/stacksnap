const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  getVisibilityPath,
  loadVisibility,
  setVisibility,
  getVisibility,
  clearVisibility,
  filterByVisibility,
  VALID_VISIBILITY
} = require('./visibility');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-vis-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getVisibilityPath returns correct path', () => {
  expect(getVisibilityPath(tmpDir)).toBe(path.join(tmpDir, '.visibility.json'));
});

test('loadVisibility returns empty object when file missing', () => {
  expect(loadVisibility(tmpDir)).toEqual({});
});

test('setVisibility and getVisibility round-trip', () => {
  setVisibility(tmpDir, 'my-template', 'private');
  expect(getVisibility(tmpDir, 'my-template')).toBe('private');
});

test('getVisibility defaults to public when not set', () => {
  expect(getVisibility(tmpDir, 'unknown')).toBe('public');
});

test('setVisibility throws on invalid level', () => {
  expect(() => setVisibility(tmpDir, 'my-template', 'secret')).toThrow('Invalid visibility level');
});

test('VALID_VISIBILITY contains expected levels', () => {
  expect(VALID_VISIBILITY).toEqual(expect.arrayContaining(['public', 'private', 'hidden']));
});

test('clearVisibility removes entry and defaults to public', () => {
  setVisibility(tmpDir, 'my-template', 'hidden');
  clearVisibility(tmpDir, 'my-template');
  expect(getVisibility(tmpDir, 'my-template')).toBe('public');
});

test('filterByVisibility excludes hidden templates by default', () => {
  setVisibility(tmpDir, 'alpha', 'hidden');
  setVisibility(tmpDir, 'beta', 'private');
  const result = filterByVisibility(tmpDir, ['alpha', 'beta', 'gamma']);
  expect(result).toEqual(['beta', 'gamma']);
});

test('filterByVisibility respects custom allowedLevels', () => {
  setVisibility(tmpDir, 'alpha', 'hidden');
  setVisibility(tmpDir, 'beta', 'private');
  const result = filterByVisibility(tmpDir, ['alpha', 'beta', 'gamma'], ['hidden']);
  expect(result).toEqual(['alpha']);
});
