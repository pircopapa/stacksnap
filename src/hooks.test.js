const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('./config', () => ({ getTemplatesDir: () => tmpDir }));

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hooks-test-'));
  jest.resetModules();
});
afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

const getModule = () => require('./hooks');

test('listHooks returns empty array when no hooks dir', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
  const { listHooks } = getModule();
  expect(listHooks('mytemplate')).toEqual([]);
});

test('hookExists returns false for missing hook', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
  const { hookExists } = getModule();
  expect(hookExists('mytemplate', 'pre-create')).toBe(false);
});

test('writeHook throws on unknown hook name', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
  const { writeHook } = getModule();
  expect(() => writeHook('mytemplate', 'bad-hook', '')).toThrow('Unknown hook');
});

test('writeHook creates hook file and listHooks returns it', () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
  const { writeHook, listHooks, hookExists } = getModule();
  writeHook('mytemplate', 'post-create', 'module.exports = () => {};');
  expect(hookExists('mytemplate', 'post-create')).toBe(true);
  expect(listHooks('mytemplate')).toContain('post-create');
});

test('runHook returns ran:false when hook does not exist', async () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
  const { runHook } = getModule();
  const result = await runHook('mytemplate', 'pre-delete', {});
  expect(result.ran).toBe(false);
});

test('runHook executes function hook and returns ran:true', async () => {
  fs.mkdirSync(path.join(tmpDir, 'mytemplate'), { recursive: true });
  const { writeHook, runHook } = getModule();
  writeHook('mytemplate', 'pre-create', 'module.exports = (ctx) => { ctx.called = true; };');
  const ctx = {};
  const result = await runHook('mytemplate', 'pre-create', ctx);
  expect(result.ran).toBe(true);
  expect(ctx.called).toBe(true);
});
