const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('./config', () => ({
  getTemplatesDir: () => tmpDir,
}));

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'notes-test-'));
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.resetModules();
});

const getNotes = () => require('./notes');

test('returns empty array when no notes file exists', () => {
  const { getNotes } = require('./notes');
  expect(getNotes('mytemplate')).toEqual([]);
});

test('addNote creates a note with id, text, createdAt', () => {
  const { addNote, getNotes } = require('./notes');
  const note = addNote('mytemplate', 'first note');
  expect(note).toHaveProperty('id');
  expect(note.text).toBe('first note');
  expect(note).toHaveProperty('createdAt');
  expect(getNotes('mytemplate')).toHaveLength(1);
});

test('addNote accumulates multiple notes', () => {
  const { addNote, getNotes } = require('./notes');
  addNote('mytemplate', 'note one');
  addNote('mytemplate', 'note two');
  expect(getNotes('mytemplate')).toHaveLength(2);
});

test('removeNote removes by id and returns true', () => {
  const { addNote, removeNote, getNotes } = require('./notes');
  const note = addNote('mytemplate', 'to remove');
  const result = removeNote('mytemplate', note.id);
  expect(result).toBe(true);
  expect(getNotes('mytemplate')).toHaveLength(0);
});

test('removeNote returns false when id not found', () => {
  const { removeNote } = require('./notes');
  const result = removeNote('mytemplate', 99999);
  expect(result).toBe(false);
});
