const { getTemplateFingerprint, handler } = require('./duplicates');
const { listTemplates } = require('../templates');
const { getTemplatesDir } = require('../config');
const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('../templates');
jest.mock('../config');

describe('duplicates command', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stacksnap-dup-'));
    getTemplatesDir.mockReturnValue(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    jest.clearAllMocks();
  });

  function makeTemplate(name, files) {
    const dir = path.join(tmpDir, name);
    fs.mkdirSync(dir);
    for (const [fname, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, fname), content);
    }
    return dir;
  }

  test('getTemplateFingerprint returns consistent hash for same content', () => {
    const dir1 = makeTemplate('t1', { 'index.js': 'hello' });
    const dir2 = makeTemplate('t2', { 'index.js': 'hello' });
    expect(getTemplateFingerprint(dir1)).toBe(getTemplateFingerprint(dir2));
  });

  test('getTemplateFingerprint differs for different content', () => {
    const dir1 = makeTemplate('t3', { 'index.js': 'hello' });
    const dir2 = makeTemplate('t4', { 'index.js': 'world' });
    expect(getTemplateFingerprint(dir1)).not.toBe(getTemplateFingerprint(dir2));
  });

  test('handler reports no templates when list is empty', async () => {
    listTemplates.mockReturnValue([]);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handler({});
    expect(spy).toHaveBeenCalledWith('No templates found.');
    spy.mockRestore();
  });

  test('handler reports no duplicates when all templates are unique', async () => {
    makeTemplate('alpha', { 'a.js': 'aaa' });
    makeTemplate('beta', { 'b.js': 'bbb' });
    listTemplates.mockReturnValue(['alpha', 'beta']);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handler({});
    expect(spy).toHaveBeenCalledWith('No duplicate templates found.');
    spy.mockRestore();
  });

  test('handler detects duplicate templates', async () => {
    makeTemplate('dup1', { 'index.js': 'same' });
    makeTemplate('dup2', { 'index.js': 'same' });
    listTemplates.mockReturnValue(['dup1', 'dup2']);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handler({});
    const calls = spy.mock.calls.map((c) => c[0]);
    expect(calls.some((c) => typeof c === 'string' && c.includes('1 group'))).toBe(true);
    spy.mockRestore();
  });
});
