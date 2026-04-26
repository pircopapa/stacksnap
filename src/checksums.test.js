const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;

jest.mock('./config', () => ({
  getTemplatesDir: () => tmpDir,
}));

const {
  getChecksumsPath,
  loadChecksums,
  saveChecksums,
  computeChecksums,
  verifyChecksums,
} = require('./checksums');

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'checksums-test-'));
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('getChecksumsPath returns correct path', () => {
  const p = getChecksumsPath('mytemplate');
  expect(p).toBe(path.join(tmpDir, 'mytemplate', '.checksums.json'));
});

test('loadChecksums returns empty object when file missing', () => {
  expect(loadChecksums('mytemplate')).toEqual({});
});

test('saveChecksums and loadChecksums round-trip', () => {
  const data = { 'file.txt': 'abc123' };
  saveChecksums('mytemplate', data);
  expect(loadChecksums('mytemplate')).toEqual(data);
});

test('computeChecksums hashes all files excluding .checksums.json', () => {
  fs.writeFileSync(path.join(tmpDir, 'mytemplate', 'index.js'), 'hello');
  fs.writeFileSync(path.join(tmpDir, 'mytemplate', '.checksums.json'), '{}');
  const result = computeChecksums('mytemplate');
  expect(Object.keys(result)).toContain('index.js');
  expect(Object.keys(result)).not.toContain('.checksums.json');
});

test('verifyChecksums reports no issues when files match stored checksums', () => {
  fs.writeFileSync(path.join(tmpDir, 'mytemplate', 'a.txt'), 'content');
  const computed = computeChecksums('mytemplate');
  saveChecksums('mytemplate', computed);
  expect(verifyChecksums('mytemplate')).toEqual([]);
});

test('verifyChecksums reports modified file', () => {
  fs.writeFileSync(path.join(tmpDir, 'mytemplate', 'a.txt'), 'original');
  const computed = computeChecksums('mytemplate');
  saveChecksums('mytemplate', computed);
  fs.writeFileSync(path.join(tmpDir, 'mytemplate', 'a.txt'), 'changed');
  const issues = verifyChecksums('mytemplate');
  expect(issues).toContainEqual({ file: 'a.txt', status: 'modified' });
});

test('verifyChecksums reports missing and untracked files', () => {
  saveChecksums('mytemplate', { 'ghost.txt': 'deadbeef' });
  fs.writeFileSync(path.join(tmpDir, 'mytemplate', 'new.txt'), 'hi');
  const issues = verifyChecksums('mytemplate');
  expect(issues).toContainEqual({ file: 'ghost.txt', status: 'missing' });
  expect(issues).toContainEqual({ file: 'new.txt', status: 'untracked' });
});
