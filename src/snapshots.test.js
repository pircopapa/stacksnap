const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-snapshots-'));
  jest.resetModules();
  jest.mock('./config', () => ({
    getConfigPath: () => path.join(tmpDir, 'config.json'),
  }));
  mod = require('./snapshots');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('listSnapshots returns empty array when no snapshots exist', () => {
  expect(mod.listSnapshots('my-template')).toEqual([]);
});

test('snapshotExists returns false when snapshot missing', () => {
  expect(mod.snapshotExists('my-template', 'v1')).toBe(false);
});

test('saveSnapshotMeta and getSnapshotMeta round-trip', () => {
  mod.saveSnapshotMeta('my-template', 'v1', { createdAt: '2024-01-01', note: 'initial' });
  const meta = mod.getSnapshotMeta('my-template', 'v1');
  expect(meta.note).toBe('initial');
  expect(meta.createdAt).toBe('2024-01-01');
});

test('snapshotExists returns true after saving meta', () => {
  mod.saveSnapshotMeta('my-template', 'v2', { createdAt: '2024-02-01' });
  expect(mod.snapshotExists('my-template', 'v2')).toBe(true);
});

test('listSnapshots returns saved snapshot names', () => {
  mod.saveSnapshotMeta('my-template', 'v1', {});
  mod.saveSnapshotMeta('my-template', 'v2', {});
  const list = mod.listSnapshots('my-template');
  expect(list).toContain('v1');
  expect(list).toContain('v2');
});

test('deleteSnapshot removes the snapshot directory', () => {
  mod.saveSnapshotMeta('my-template', 'v1', {});
  mod.deleteSnapshot('my-template', 'v1');
  expect(mod.snapshotExists('my-template', 'v1')).toBe(false);
});

test('deleteSnapshot throws when snapshot does not exist', () => {
  expect(() => mod.deleteSnapshot('my-template', 'ghost')).toThrow("Snapshot 'ghost' not found");
});

test('getSnapshotMeta returns empty object when _meta.json missing', () => {
  const snapPath = mod.getSnapshotPath('my-template', 'v1');
  fs.mkdirSync(snapPath, { recursive: true });
  expect(mod.getSnapshotMeta('my-template', 'v1')).toEqual({});
});
