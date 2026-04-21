const { handler } = require('./repair');
const { loadConfig, getTemplatesDir } = require('../config');
const { listTemplates, loadTemplateMeta } = require('../templates');
const fs = require('fs');
const path = require('path');

jest.mock('../config');
jest.mock('../templates');
jest.mock('./doctor');
jest.mock('fs');

describe('repair', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadConfig.mockReturnValue({});
    getTemplatesDir.mockReturnValue('/tmp/templates');
  });

  it('creates templates directory if missing', async () => {
    fs.existsSync.mockReturnValue(false);
    listTemplates.mockReturnValue([]);
    fs.mkdirSync.mockImplementation(() => {});

    await handler({ dryRun: false });
    expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/templates', { recursive: true });
  });

  it('does not create directory in dry-run mode', async () => {
    fs.existsSync.mockReturnValue(false);
    listTemplates.mockReturnValue([]);

    await handler({ dryRun: true });
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('patches missing meta fields', async () => {
    fs.existsSync.mockReturnValue(true);
    listTemplates.mockReturnValue(['my-template']);
    loadTemplateMeta.mockReturnValue({ name: 'my-template' });
    fs.writeFileSync.mockImplementation(() => {});

    await handler({ dryRun: false });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      path.join('/tmp/templates', 'my-template', 'meta.json'),
      expect.stringContaining('0.0.1')
    );
  });

  it('skips templates with complete meta', async () => {
    fs.existsSync.mockReturnValue(true);
    listTemplates.mockReturnValue(['good-template']);
    loadTemplateMeta.mockReturnValue({ name: 'good-template', description: 'A good one', version: '1.0.0' });

    await handler({ dryRun: false });
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('warns and skips on meta load error', async () => {
    fs.existsSync.mockReturnValue(true);
    listTemplates.mockReturnValue(['broken']);
    loadTemplateMeta.mockImplementation(() => { throw new Error('bad json'); });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await handler({ dryRun: false });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad json'));
    warn.mockRestore();
  });
});
