const { handler } = require('./links');
const { templateExists } = require('../templates');
const { getLinks } = require('../links');
const { getTemplatesDir } = require('../config');

jest.mock('../templates');
jest.mock('../links');
jest.mock('../config');

describe('links command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getTemplatesDir.mockReturnValue('/mock/templates');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
    process.exit.mockRestore();
  });

  it('exits if template does not exist', async () => {
    templateExists.mockReturnValue(false);
    await expect(handler({ template: 'ghost' })).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
  });

  it('prints message when no links found', async () => {
    templateExists.mockReturnValue(true);
    getLinks.mockReturnValue([]);
    await handler({ template: 'mytemplate' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No links found'));
  });

  it('lists links with labels', async () => {
    templateExists.mockReturnValue(true);
    getLinks.mockReturnValue([
      { url: 'https://example.com', label: 'Docs' },
      { url: 'https://github.com/repo', label: '' },
    ]);
    await handler({ template: 'mytemplate' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('https://example.com'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Docs'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('https://github.com/repo'));
  });

  it('lists links without labels gracefully', async () => {
    templateExists.mockReturnValue(true);
    getLinks.mockReturnValue([{ url: 'https://no-label.com' }]);
    await handler({ template: 'mytemplate' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('https://no-label.com'));
  });
});
