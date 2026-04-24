const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'badges-test-'));
  jest.resetModules();
  jest.doMock('./config', () => ({
    getConfigPath: () => path.join(tmpDir, 'config.json'),
  }));
  mod = require('./badges');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getBadges returns empty array for unknown template', () => {
  expect(mod.getBadges('tmpl')).toEqual([]);
});

test('addBadge adds a badge', () => {
  mod.addBadge('tmpl', 'featured');
  expect(mod.getBadges('tmpl')).toContain('featured');
});

test('addBadge does not duplicate', () => {
  mod.addBadge('tmpl', 'featured');
  mod.addBadge('tmpl', 'featured');
  expect(mod.getBadges('tmpl').length).toBe(1);
});

test('removeBadge removes a badge', () => {
  mod.addBadge('tmpl', 'featured');
  mod.removeBadge('tmpl', 'featured');
  expect(mod.getBadges('tmpl')).not.toContain('featured');
});

test('clearBadges removes all badges for template', () => {
  mod.addBadge('tmpl', 'featured');
  mod.addBadge('tmpl', 'new');
  mod.clearBadges('tmpl');
  expect(mod.getBadges('tmpl')).toEqual([]);
});

test('searchByBadge returns matching templates', () => {
  mod.addBadge('tmpl1', 'featured');
  mod.addBadge('tmpl2', 'new');
  mod.addBadge('tmpl3', 'featured');
  const results = mod.searchByBadge('featured');
  expect(results).toContain('tmpl1');
  expect(results).toContain('tmpl3');
  expect(results).not.toContain('tmpl2');
});
