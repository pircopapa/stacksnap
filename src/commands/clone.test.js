const mockFs = require('mock-fs');
const path = require('path');
const fs = require('fs');

jest.mock('../templates');
jest.mock('../config');

const { templateExists, getTemplatePath } = require('../templates');
const { getTemplatesDir } = require('../config');
const { handler, copyDirRecursive } = require('./clone');

const TEMPLATES_DIR = '/mock/templates';
const SOURCE = 'my-template';
const DEST = 'my-clone';

beforeEach(() => {
  getTemplatesDir.mockReturnValue(TEMPLATES_DIR);
  getTemplatePath.mockImplementation((name) => path.join(TEMPLATES_DIR, name));
  mockFs({
    [`${TEMPLATES_DIR}/${SOURCE}/meta.json`]: JSON.stringify({ name: SOURCE, description: 'A template' }),
    [`${TEMPLATES_DIR}/${SOURCE}/files/index.js`]: 'console.log("hello");',
  });
});

afterEach(() => {
  mockFs.restore();
  jest.clearAllMocks();
});

test('clones a template to a new name', async () => {
  templateExists.mockImplementation((name) => name === SOURCE);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ source: SOURCE, destination: DEST, overwrite: false });
  expect(fs.existsSync(path.join(TEMPLATES_DIR, DEST, 'meta.json'))).toBe(true);
  const meta = JSON.parse(fs.readFileSync(path.join(TEMPLATES_DIR, DEST, 'meta.json'), 'utf8'));
  expect(meta.name).toBe(DEST);
  expect(meta.clonedFrom).toBe(SOURCE);
  consoleSpy.mockRestore();
});

test('exits if source does not exist', async () => {
  templateExists.mockReturnValue(false);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(handler({ source: 'nope', destination: DEST, overwrite: false })).rejects.toThrow('exit');
  expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
  errorSpy.mockRestore();
  exitSpy.mockRestore();
});

test('exits if destination exists and overwrite is false', async () => {
  templateExists.mockReturnValue(true);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(handler({ source: SOURCE, destination: DEST, overwrite: false })).rejects.toThrow('exit');
  expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('already exists'));
  errorSpy.mockRestore();
  exitSpy.mockRestore();
});

test('copyDirRecursive copies nested directories', () => {
  mockFs({
    '/src/a.txt': 'hello',
    '/src/sub/b.txt': 'world',
  });
  copyDirRecursive('/src', '/dst');
  expect(fs.readFileSync('/dst/a.txt', 'utf8')).toBe('hello');
  expect(fs.readFileSync('/dst/sub/b.txt', 'utf8')).toBe('world');
});
