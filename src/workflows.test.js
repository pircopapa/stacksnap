const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
let mod;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-workflows-'));
  jest.resetModules();
  jest.mock('./config', () => ({ getTemplatesDir: () => tmpDir }));
  fs.mkdirSync(path.join(tmpDir, 'my-template'), { recursive: true });
  mod = require('./workflows');
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('loadWorkflows returns empty object when no file', () => {
  expect(mod.loadWorkflows('my-template')).toEqual({});
});

test('addWorkflow persists a workflow with steps', () => {
  mod.addWorkflow('my-template', 'build', ['npm install', 'npm run build']);
  const wf = mod.getWorkflow('my-template', 'build');
  expect(wf).not.toBeNull();
  expect(wf.steps).toEqual(['npm install', 'npm run build']);
  expect(wf.createdAt).toBeDefined();
});

test('listWorkflows returns workflow names', () => {
  mod.addWorkflow('my-template', 'deploy', ['npm run deploy']);
  mod.addWorkflow('my-template', 'test', ['npm test']);
  const names = mod.listWorkflows('my-template');
  expect(names).toContain('deploy');
  expect(names).toContain('test');
});

test('removeWorkflow deletes a workflow and returns true', () => {
  mod.addWorkflow('my-template', 'ci', ['echo ok']);
  const result = mod.removeWorkflow('my-template', 'ci');
  expect(result).toBe(true);
  expect(mod.getWorkflow('my-template', 'ci')).toBeNull();
});

test('removeWorkflow returns false when workflow does not exist', () => {
  expect(mod.removeWorkflow('my-template', 'ghost')).toBe(false);
});

test('getWorkflow returns null for unknown workflow', () => {
  expect(mod.getWorkflow('my-template', 'nope')).toBeNull();
});
