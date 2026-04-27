const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;

jest.mock('./config', () => ({
  getTemplatesDir: () => tmpDir,
}));

const {
  loadMeta,
  saveMeta,
  getMetaField,
  setMetaField,
  removeMetaField,
  listMetaFields,
} = require('./metadata');

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-meta-'));
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadMeta returns empty object if no meta file', () => {
  expect(loadMeta('mytemplate')).toEqual({});
});

test('saveMeta and loadMeta round-trip', () => {
  saveMeta('mytemplate', { author: 'alice', version: '1.0' });
  expect(loadMeta('mytemplate')).toEqual({ author: 'alice', version: '1.0' });
});

test('getMetaField returns null for missing field', () => {
  expect(getMetaField('mytemplate', 'author')).toBeNull();
});

test('setMetaField sets a field', () => {
  setMetaField('mytemplate', 'author', 'bob');
  expect(getMetaField('mytemplate', 'author')).toBe('bob');
});

test('setMetaField preserves existing fields', () => {
  saveMeta('mytemplate', { version: '2.0' });
  setMetaField('mytemplate', 'author', 'carol');
  expect(loadMeta('mytemplate')).toEqual({ version: '2.0', author: 'carol' });
});

test('removeMetaField deletes a field', () => {
  saveMeta('mytemplate', { author: 'dave', version: '3.0' });
  removeMetaField('mytemplate', 'author');
  expect(getMetaField('mytemplate', 'author')).toBeNull();
  expect(getMetaField('mytemplate', 'version')).toBe('3.0');
});

test('listMetaFields returns all keys', () => {
  saveMeta('mytemplate', { a: 1, b: 2, c: 3 });
  expect(listMetaFields('mytemplate').sort()).toEqual(['a', 'b', 'c']);
});

test('loadMeta returns empty object on malformed JSON', () => {
  const metaPath = path.join(tmpDir, 'mytemplate', 'meta.json');
  fs.writeFileSync(metaPath, 'not json');
  expect(loadMeta('mytemplate')).toEqual({});
});
