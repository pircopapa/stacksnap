const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('../templates');
jest.mock('../config');

const { templateExists, getTemplatePath } = require('../templates');
const { getTemplatesDir } = require('../config');
const { handler, mergeMeta } = require('./merge');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-test-'));

  getTemplatesDir.mockReturnValue(tmpDir);

  // set up source1
  const s1 = path.join(tmpDir, 'tmpl-a');
  fs.mkdirSync(path.join(s1, 'files'), { recursive: true });
  fs.writeFileSync(path.join(s1, 'files', 'index.js'), 'console.log("a")');
  fs.writeFileSync(path.join(s1, 'meta.json'), JSON.stringify({ name: 'tmpl-a', tags: ['node'] }));

  // set up source2
  const s2 = path.join(tmpDir, 'tmpl-b');
  fs.mkdirSync(path.join(s2, 'files'), { recursive: true });
  fs.writeFileSync(path.join(s2, 'files', 'README.md'), '# B');
  fs.writeFileSync(path.join(s2, 'meta.json'), JSON.stringify({ name: 'tmpl-b', tags: ['docs'] }));

  templateExists.mockImplementation((n) => ['tmpl-a', 'tmpl-b'].includes(n));
  getTemplatePath.mockImplementation((n) => path.join(tmpDir, n));
});

afterEach(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

test('merges files from both templates into dest', () => {
  handler({ source1: 'tmpl-a', source2: 'tmpl-b', dest: 'merged', overwrite: false });
  const destFiles = path.join(tmpDir, 'merged', 'files');
  expect(fs.existsSync(path.join(destFiles, 'index.js'))).toBe(true);
  expect(fs.existsSync(path.join(destFiles, 'README.md'))).toBe(true);
});

test('writes merged meta.json', () => {
  handler({ source1: 'tmpl-a', source2: 'tmpl-b', dest: 'merged', overwrite: false });
  const meta = JSON.parse(fs.readFileSync(path.join(tmpDir, 'merged', 'meta.json'), 'utf8'));
  expect(meta.name).toBe('merged');
  expect(meta.mergedFrom).toEqual(['tmpl-a', 'tmpl-b']);
  expect(meta.tags).toContain('node');
  expect(meta.tags).toContain('docs');
});

test('refuses to overwrite without flag', () => {
  fs.mkdirSync(path.join(tmpDir, 'merged'), { recursive: true });
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  handler({ source1: 'tmpl-a', source2: 'tmpl-b', dest: 'merged', overwrite: false });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('already exists'));
  spy.mockRestore();
});

test('overwrites when flag is set', () => {
  fs.mkdirSync(path.join(tmpDir, 'merged', 'files'), { recursive: true });
  handler({ source1: 'tmpl-a', source2: 'tmpl-b', dest: 'merged', overwrite: true });
  expect(fs.existsSync(path.join(tmpDir, 'merged', 'meta.json'))).toBe(true);
});

test('mergeMeta deduplicates tags', () => {
  const result = mergeMeta({ name: 'a', tags: ['x', 'y'] }, { name: 'b', tags: ['y', 'z'] }, 'c');
  expect(result.tags).toEqual(['x', 'y', 'z']);
});

test('errors when source template missing', () => {
  templateExists.mockReturnValue(false);
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  handler({ source1: 'ghost', source2: 'tmpl-b', dest: 'out', overwrite: false });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('not found'));
  spy.mockRestore();
});
