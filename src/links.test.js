const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('./config', () => ({
  getTemplatesDir: () => tmpDir,
}));

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-links-'));
  fs.mkdirSync(path.join(tmpDir, 'my-template'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const { addLink, removeLink, getLinks, getLink, getLinksPath } = require('./links');

test('getLinksPath returns correct path', () => {
  const p = getLinksPath('my-template');
  expect(p).toContain('my-template');
  expect(p).toContain('.links.json');
});

test('getLinks returns empty object when no links file', () => {
  expect(getLinks('my-template')).toEqual({});
});

test('addLink stores a link', () => {
  addLink('my-template', 'docs', 'https://example.com/docs');
  expect(getLinks('my-template')).toEqual({ docs: 'https://example.com/docs' });
});

test('addLink overwrites existing label', () => {
  addLink('my-template', 'docs', 'https://old.com');
  addLink('my-template', 'docs', 'https://new.com');
  expect(getLink('my-template', 'docs')).toBe('https://new.com');
});

test('getLink returns null for missing label', () => {
  expect(getLink('my-template', 'nonexistent')).toBeNull();
});

test('removeLink deletes a link and returns true', () => {
  addLink('my-template', 'repo', 'https://github.com/org/repo');
  const result = removeLink('my-template', 'repo');
  expect(result).toBe(true);
  expect(getLink('my-template', 'repo')).toBeNull();
});

test('removeLink returns false when label does not exist', () => {
  const result = removeLink('my-template', 'ghost');
  expect(result).toBe(false);
});

test('multiple links coexist', () => {
  addLink('my-template', 'docs', 'https://docs.io');
  addLink('my-template', 'ci', 'https://ci.io');
  const links = getLinks('my-template');
  expect(Object.keys(links)).toHaveLength(2);
});
