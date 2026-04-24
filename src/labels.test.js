const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('./config', () => ({
  getConfigPath: () => path.join(tmpDir, 'config.json'),
}));

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-labels-'));
  jest.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function getModule() {
  jest.mock('./config', () => ({ getConfigPath: () => path.join(tmpDir, 'config.json') }));
  return require('./labels');
}

test('getLabels returns empty array for unknown template', () => {
  const { getLabels } = getModule();
  expect(getLabels('nope')).toEqual([]);
});

test('addLabel adds a label to a template', () => {
  const { addLabel, getLabels } = getModule();
  const result = addLabel('my-tpl', 'frontend');
  expect(result).toBe(true);
  expect(getLabels('my-tpl')).toContain('frontend');
});

test('addLabel does not duplicate labels', () => {
  const { addLabel, getLabels } = getModule();
  addLabel('my-tpl', 'frontend');
  const result = addLabel('my-tpl', 'frontend');
  expect(result).toBe(false);
  expect(getLabels('my-tpl').filter(l => l === 'frontend').length).toBe(1);
});

test('removeLabel removes an existing label', () => {
  const { addLabel, removeLabel, getLabels } = getModule();
  addLabel('my-tpl', 'backend');
  const result = removeLabel('my-tpl', 'backend');
  expect(result).toBe(true);
  expect(getLabels('my-tpl')).not.toContain('backend');
});

test('removeLabel returns false for missing label', () => {
  const { removeLabel } = getModule();
  expect(removeLabel('ghost', 'nolabel')).toBe(false);
});

test('searchByLabel returns templates with that label', () => {
  const { addLabel, searchByLabel } = getModule();
  addLabel('tpl-a', 'react');
  addLabel('tpl-b', 'react');
  addLabel('tpl-c', 'vue');
  const results = searchByLabel('react');
  expect(results).toContain('tpl-a');
  expect(results).toContain('tpl-b');
  expect(results).not.toContain('tpl-c');
});
