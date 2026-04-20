const { handler } = require('./use');
const { templateExists, loadTemplateMeta, getTemplatePath } = require('../templates');
const { scaffold } = require('../scaffold');
const fs = require('fs');

jest.mock('../templates');
jest.mock('../scaffold');
jest.mock('fs');

describe('use command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exits if template does not exist', async () => {
    templateExists.mockReturnValue(false);
    await handler({ template: 'missing', destination: '.', overwrite: false, dryRun: false });
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith('Template "missing" not found.');
  });

  it('applies template to destination', async () => {
    templateExists.mockReturnValue(true);
    loadTemplateMeta.mockReturnValue({ description: 'A test template' });
    getTemplatePath.mockReturnValue('/templates/mytemplate');
    fs.existsSync.mockReturnValue(true);
    scaffold.mockResolvedValue();

    await handler({ template: 'mytemplate', destination: '/some/dest', overwrite: false, dryRun: false });

    expect(scaffold).toHaveBeenCalledWith('/templates/mytemplate', expect.any(String), { overwrite: false });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('applied'));
  });

  it('creates destination dir if missing', async () => {
    templateExists.mockReturnValue(true);
    loadTemplateMeta.mockReturnValue({});
    getTemplatePath.mockReturnValue('/templates/mytemplate');
    fs.existsSync.mockReturnValue(false);
    scaffold.mockResolvedValue();

    await handler({ template: 'mytemplate', destination: '/new/dir', overwrite: false, dryRun: false });

    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), { recursive: true });
  });

  it('logs dry-run output without scaffolding', async () => {
    templateExists.mockReturnValue(true);
    loadTemplateMeta.mockReturnValue({ description: 'Test' });
    getTemplatePath.mockReturnValue('/templates/mytemplate');
    fs.existsSync.mockReturnValue(true);

    await handler({ template: 'mytemplate', destination: '.', overwrite: false, dryRun: true });

    expect(scaffold).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[dry-run]'));
  });

  it('handles scaffold error gracefully', async () => {
    templateExists.mockReturnValue(true);
    loadTemplateMeta.mockReturnValue({});
    getTemplatePath.mockReturnValue('/templates/mytemplate');
    fs.existsSync.mockReturnValue(true);
    scaffold.mockRejectedValue(new Error('write error'));

    await handler({ template: 'mytemplate', destination: '.', overwrite: false, dryRun: false });

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('write error'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
