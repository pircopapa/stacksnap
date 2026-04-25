const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('./config', () => ({
  getTemplatesDir: () => require('path').join(require('os').tmpdir(), 'ss-changelog-test-' + process.pid)
}));

const {
  addChangelogEntry,
  getChangelog,
  clearChangelog,
  getChangelogPath
} = require('./changelog');

const { getTemplatesDir } = require('./config');

beforeEach(() => {
  const dir = path.join(getTemplatesDir(), 'mytemplate');
  fs.mkdirSync(dir, { recursive: true });
  const p = getChangelogPath('mytemplate');
  if (fs.existsSync(p)) fs.unlinkSync(p);
});

afterAll(() => {
  fs.rmSync(getTemplatesDir(), { recursive: true, force: true });
});

test('returns empty array when no changelog exists', () => {
  expect(getChangelog('mytemplate')).toEqual([]);
});

test('addChangelogEntry adds an entry', () => {
  const entry = addChangelogEntry('mytemplate', 'initial release', 'alice');
  expect(entry.message).toBe('initial release');
  expect(entry.author).toBe('alice');
  expect(entry.timestamp).toBeDefined();
});

test('entries are stored in reverse chronological order', () => {
  addChangelogEntry('mytemplate', 'first');
  addChangelogEntry('mytemplate', 'second');
  const log = getChangelog('mytemplate');
  expect(log[0].message).toBe('second');
  expect(log[1].message).toBe('first');
});

test('clearChangelog empties the log', () => {
  addChangelogEntry('mytemplate', 'something');
  clearChangelog('mytemplate');
  expect(getChangelog('mytemplate')).toEqual([]);
});

test('defaults author to unknown', () => {
  const entry = addChangelogEntry('mytemplate', 'no author');
  expect(entry.author).toBe('unknown');
});
