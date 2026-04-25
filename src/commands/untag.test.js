const mockWriteFileSync = jest.fn();
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

jest.mock('../templates', () => ({
  templateExists: jest.fn(),
  loadTemplateMeta: jest.fn(),
  getTemplatePath: jest.fn(() => '/mock/templates/my-template'),
}));

jest.mock('fs', () => ({
  writeFileSync: mockWriteFileSync,
}));

const { templateExists, loadTemplateMeta, getTemplatePath } = require('../templates');
const { handler } = require('./untag');

describe('untag command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('removes a tag from a template', async () => {
    templateExists.mockReturnValue(true);
    loadTemplateMeta.mockReturnValue({ tags: ['node', 'express', 'api'] });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ template: 'my-template', tag: 'express' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/mock/templates/my-template/meta.json',
      JSON.stringify({ tags: ['node', 'api'] }, null, 2)
    );
    expect(consoleSpy).toHaveBeenCalledWith('Removed tag "express" from template "my-template".');
    consoleSpy.mockRestore();
  });

  it('shows remaining tags after removal', async () => {
    templateExists.mockReturnValue(true);
    loadTemplateMeta.mockReturnValue({ tags: ['node', 'api'] });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ template: 'my-template', tag: 'node' });

    expect(consoleSpy).toHaveBeenCalledWith('Remaining tags: api');
    consoleSpy.mockRestore();
  });

  it('shows no tags remaining when last tag is removed', async () => {
    templateExists.mockReturnValue(true);
    loadTemplateMeta.mockReturnValue({ tags: ['solo'] });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ template: 'my-template', tag: 'solo' });

    expect(consoleSpy).toHaveBeenCalledWith('No tags remaining.');
    consoleSpy.mockRestore();
  });

  it('exits if template does not exist', async () => {
    templateExists.mockReturnValue(false);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(handler({ template: 'ghost', tag: 'node' })).rejects.toThrow('exit');
    expect(consoleSpy).toHaveBeenCalledWith('Template "ghost" not found.');
    consoleSpy.mockRestore();
  });

  it('exits if tag is not present on template', async () => {
    templateExists.mockReturnValue(true);
    loadTemplateMeta.mockReturnValue({ tags: ['node'] });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(handler({ template: 'my-template', tag: 'react' })).rejects.toThrow('exit');
    expect(consoleSpy).toHaveBeenCalledWith('Tag "react" is not present on template "my-template".');
    consoleSpy.mockRestore();
  });
});
