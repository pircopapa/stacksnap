const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-dep-cmd-'));
  fs.mkdirSync(path.join(tmpDir, 'my-tpl'), { recursive: true });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  jest.resetModules();
});

function getHandler() {
  jest.mock('../config', () => ({ getTemplatesDir: () => tmpDir }));
  jest.mock('../templates', () => ({
    templateExists: (name) => fs.existsSync(path.join(tmpDir, name)),
  }));
  return require('./dep');
}

test('list shows no deps message when empty', async () => {
  const { handler } = getHandler();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ template: 'my-tpl', action: 'list' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('No dependencies'));
  spy.mockRestore();
});

test('add then list shows the dependency', async () => {
  const { handler } = getHandler();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ template: 'my-tpl', action: 'add', name: 'react', version: '^18.0.0' });
  await handler({ template: 'my-tpl', action: 'list' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('react@^18.0.0'));
  spy.mockRestore();
});

test('remove deletes a dependency', async () => {
  const { handler } = getHandler();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handler({ template: 'my-tpl', action: 'add', name: 'lodash', version: '^4.0.0' });
  await handler({ template: 'my-tpl', action: 'remove', name: 'lodash' });
  await handler({ template: 'my-tpl', action: 'list' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('No dependencies'));
  spy.mockRestore();
});

test('exits with error for unknown template', async () => {
  const { handler } = getHandler();
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(handler({ template: 'ghost', action: 'list' })).rejects.toThrow('exit');
  expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  errSpy.mockRestore();
  exitSpy.mockRestore();
});
