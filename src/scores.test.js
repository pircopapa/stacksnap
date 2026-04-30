const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;

jest.mock('./config', () => ({
  getConfigPath: () => path.join(tmpDir, 'config.json'),
}));

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-scores-'));
  jest.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function getModule() {
  return require('./scores');
}

test('getScoresPath returns path inside config dir', () => {
  const { getScoresPath } = getModule();
  expect(getScoresPath()).toContain('scores.json');
});

test('loadScores returns empty object when file missing', () => {
  const { loadScores } = getModule();
  expect(loadScores()).toEqual({});
});

test('setScore and getScore round-trip', () => {
  const { setScore, getScore } = getModule();
  setScore('my-template', 87);
  const result = getScore('my-template');
  expect(result.score).toBe(87);
  expect(result.updatedAt).toBeDefined();
});

test('setScore throws on invalid score', () => {
  const { setScore } = getModule();
  expect(() => setScore('t', 150)).toThrow('Score must be a number between 0 and 100');
  expect(() => setScore('t', -1)).toThrow();
  expect(() => setScore('t', 'high')).toThrow();
});

test('getScore returns null for unknown template', () => {
  const { getScore } = getModule();
  expect(getScore('unknown')).toBeNull();
});

test('removeScore removes existing score', () => {
  const { setScore, removeScore, getScore } = getModule();
  setScore('alpha', 50);
  expect(removeScore('alpha')).toBe(true);
  expect(getScore('alpha')).toBeNull();
});

test('removeScore returns false for missing template', () => {
  const { removeScore } = getModule();
  expect(removeScore('ghost')).toBe(false);
});

test('topScored returns sorted results', () => {
  const { setScore, topScored } = getModule();
  setScore('a', 30);
  setScore('b', 90);
  setScore('c', 60);
  const top = topScored(2);
  expect(top[0].name).toBe('b');
  expect(top[1].name).toBe('c');
  expect(top.length).toBe(2);
});
