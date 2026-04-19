const mockTemplateExists = jest.fn();
const mockGetTemplatePath = jest.fn();
const mockRenameSync = jest.fn();

jest.mock('../templates', () => ({
  templateExists: mockTemplateExists,
  getTemplatePath: mockGetTemplatePath,
}));

jest.mock('fs', () => ({
  renameSync: mockRenameSync,
}));

const { handler } = require('./rename');

describe('rename command', () => {
  let exitSpy;
  let errorSpy;
  let logSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('exits if oldName template does not exist', async () => {
    mockTemplateExists.mockReturnValue(false);
    await handler({ oldName: 'ghost', newName: 'new-name' });
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits if newName template already exists', async () => {
    mockTemplateExists.mockImplementation((name) => name === 'old' || name === 'taken');
    await handler({ oldName: 'old', newName: 'taken' });
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('already exists'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits if newName has invalid characters', async () => {
    mockTemplateExists.mockImplementation((name) => name === 'old');
    await handler({ oldName: 'old', newName: 'Invalid Name!' });
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid template name'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('renames template successfully', async () => {
    mockTemplateExists.mockImplementation((name) => name === 'old');
    mockGetTemplatePath.mockImplementation((name) => `/templates/${name}`);
    await handler({ oldName: 'old', newName: 'new-name' });
    expect(mockRenameSync).toHaveBeenCalledWith('/templates/old', '/templates/new-name');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('renamed to "new-name"'));
  });

  it('exits if fs.renameSync throws', async () => {
    mockTemplateExists.mockImplementation((name) => name === 'old');
    mockGetTemplatePath.mockReturnValue('/templates/old');
    mockRenameSync.mockImplementation(() => { throw new Error('permission denied'); });
    await handler({ oldName: 'old', newName: 'new-name' });
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('permission denied'));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
