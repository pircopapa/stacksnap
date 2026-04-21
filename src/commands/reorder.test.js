const fs = require('fs');
const path = require('path');
const os = require('os');
const { handler, resolveNewName } = require('./reorder');

jest.mock('../config');
jest.mock('../templates');

const { getTemplatesDir } = require('../config');
const { templateExists } = require('../templates');

describe('resolveNewName', () => {
  it('prefixes base name when to is numeric', () => {
    expect(resolveNewName('01-setup.md', '03')).toBe('03-setup.md');
  });

  it('strips existing numeric prefix before applying new one', () => {
    expect(resolveNewName('02_config.js', '05')).toBe('05-config.js');
  });

  it('uses to as-is when not purely numeric', () => {
    expect(resolveNewName('01-setup.md', 'intro.md')).toBe('intro.md');
  });
});

describe('reorder handler', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reorder-test-'));
    getTemplatesDir.mockResolvedValue(tmpDir);
    templateExists.mockResolvedValue(true);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('renames file in template directory', async () => {
    const tplDir = path.join(tmpDir, 'mytpl');
    fs.mkdirSync(tplDir);
    fs.writeFileSync(path.join(tplDir, '01-setup.md'), 'content');

    await handler({ template: 'mytpl', from: '01-setup.md', to: '03', dryRun: false });

    expect(fs.existsSync(path.join(tplDir, '03-setup.md'))).toBe(true);
    expect(fs.existsSync(path.join(tplDir, '01-setup.md'))).toBe(false);
  });

  it('dry-run does not rename file', async () => {
    const tplDir = path.join(tmpDir, 'mytpl');
    fs.mkdirSync(tplDir);
    fs.writeFileSync(path.join(tplDir, '01-setup.md'), 'content');

    await handler({ template: 'mytpl', from: '01-setup.md', to: '03', dryRun: true });

    expect(fs.existsSync(path.join(tplDir, '01-setup.md'))).toBe(true);
  });

  it('exits if template does not exist', async () => {
    templateExists.mockResolvedValue(false);
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handler({ template: 'ghost', from: 'a.md', to: '2', dryRun: false })).rejects.toThrow('exit');
    exit.mockRestore();
  });

  it('exits if source file does not exist', async () => {
    const tplDir = path.join(tmpDir, 'mytpl');
    fs.mkdirSync(tplDir);
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handler({ template: 'mytpl', from: 'missing.md', to: '2', dryRun: false })).rejects.toThrow('exit');
    exit.mockRestore();
  });
});
