const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hook-cmd-test-'));
  jest.resetModules();
  jest.mock('../config', () => ({ getTemplatesDir: () => tmpDir }));
  jest.mock('../templates', () => ({ templateExists: (n) => fs.existsSync(path.join(tmpDir, n)) }));
});
afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

const getHandler = () => require('./hook').handler;

test('exits with error if template does not exist', () => {
  const spy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => getHandler()({ template: 'nope', 'hook-name': 'pre-create' })).toThrow('exit');
  spy.mockRestore();
});

test('exits with error for invalid hook name', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'));
  const spy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  expect(() => getHandler()({ template: 'mytemplate', 'hook-name': 'bad' })).toThrow('exit');
  spy.mockRestore();
});

test('set writes hook and logs confirmation', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'));
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  getHandler()({ template: 'mytemplate', 'hook-name': 'post-create', set: 'module.exports = () => {};' });
  expect(log).toHaveBeenCalledWith(expect.stringContaining('post-create'));
  log.mockRestore();
});

test('show prints hook content', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'));
  const { writeHook } = require('../hooks');
  writeHook('mytemplate', 'pre-delete', 'module.exports = () => 42;');
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  getHandler()({ template: 'mytemplate', 'hook-name': 'pre-delete', show: true });
  expect(log).toHaveBeenCalledWith(expect.stringContaining('42'));
  log.mockRestore();
});

test('remove deletes existing hook', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'));
  const { writeHook, hookExists } = require('../hooks');
  writeHook('mytemplate', 'post-delete', 'module.exports = () => {};');
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  getHandler()({ template: 'mytemplate', 'hook-name': 'post-delete', remove: true });
  expect(hookExists('mytemplate', 'post-delete')).toBe(false);
  log.mockRestore();
});

test('lists hooks when no flag given', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'));
  const { writeHook } = require('../hooks');
  writeHook('mytemplate', 'pre-create', 'module.exports = () => {};');
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  getHandler()({ template: 'mytemplate', 'hook-name': 'pre-create' });
  expect(log).toHaveBeenCalledWith(expect.stringContaining('pre-create'));
  log.mockRestore();
});
