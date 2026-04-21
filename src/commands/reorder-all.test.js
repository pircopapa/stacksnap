const fs = require('fs');
const path = require('path');
const os = require('os');
const { handler } = require('./reorder-all');

jest.mock('../config');
jest.mock('../templates');

const { getTemplatesDir } = require('../config');
const { templateExists } = require('../templates');

describe('reorder-all handler', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reorder-all-test-'));
    getTemplatesDir.mockResolvedValue(tmpDir);
    templateExists.mockResolvedValue(true);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('renames files with sequential prefixes', async () => {
    const tplDir = path.join(tmpDir, 'mytpl');
    fs.mkdirSync(tplDir);
    fs.writeFileSync(path.join(tplDir, 'setup.md'), '');
    fs.writeFileSync(path.join(tplDir, 'config.js'), '');

    await handler({ template: 'mytpl', order: ['setup.md', 'config.js'], dryRun: false });

    expect(fs.existsSync(path.join(tplDir, '01-setup.md'))).toBe(true);
    expect(fs.existsSync(path.join(tplDir, '02-config.js'))).toBe(true);
  });

  it('dry-run does not apply renames', async () => {
    const tplDir = path.join(tmpDir, 'mytpl');
    fs.mkdirSync(tplDir);
    fs.writeFileSync(path.join(tplDir, 'setup.md'), '');

    await handler({ template: 'mytpl', order: ['setup.md'], dryRun: true });

    expect(fs.existsSync(path.join(tplDir, 'setup.md'))).toBe(true);
    expect(fs.existsSync(path.join(tplDir, '01-setup.md'))).toBe(false);
  });

  it('skips missing files with a warning', async () => {
    const tplDir = path.join(tmpDir, 'mytpl');
    fs.mkdirSync(tplDir);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await handler({ template: 'mytpl', order: ['ghost.md'], dryRun: false });

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ghost.md'));
    warn.mockRestore();
  });

  it('exits if template does not exist', async () => {
    templateExists.mockResolvedValue(false);
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handler({ template: 'nope', order: ['a.md'], dryRun: false })).rejects.toThrow('exit');
    exit.mockRestore();
  });

  it('logs no renames needed when order already matches', async () => {
    const tplDir = path.join(tmpDir, 'mytpl');
    fs.mkdirSync(tplDir);
    fs.writeFileSync(path.join(tplDir, '01-setup.md'), '');
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ template: 'mytpl', order: ['01-setup.md'], dryRun: false });

    expect(log).toHaveBeenCalledWith('No renames needed.');
    log.mockRestore();
  });
});
