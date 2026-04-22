const { handler } = require('./favorite');
const { loadConfig, saveConfig } = require('../config');
const { templateExists } = require('../templates');

jest.mock('../config');
jest.mock('../templates');

describe('favorite command', () => {
  let consoleSpy;
  let errorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('exits if template does not exist', async () => {
    templateExists.mockResolvedValue(false);
    await expect(handler({ template: 'ghost', remove: false })).rejects.toThrow();
  });

  test('adds a template to favorites', async () => {
    templateExists.mockResolvedValue(true);
    loadConfig.mockResolvedValue({ favorites: [] });
    saveConfig.mockResolvedValue();
    await handler({ template: 'react-app', remove: false });
    expect(saveConfig).toHaveBeenCalledWith({ favorites: ['react-app'] });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Added'));
  });

  test('notifies if template already favorited', async () => {
    templateExists.mockResolvedValue(true);
    loadConfig.mockResolvedValue({ favorites: ['react-app'] });
    await handler({ template: 'react-app', remove: false });
    expect(saveConfig).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already'));
  });

  test('removes a template from favorites', async () => {
    templateExists.mockResolvedValue(true);
    loadConfig.mockResolvedValue({ favorites: ['react-app', 'node-api'] });
    saveConfig.mockResolvedValue();
    await handler({ template: 'react-app', remove: true });
    expect(saveConfig).toHaveBeenCalledWith({ favorites: ['node-api'] });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Removed'));
  });

  test('notifies if template not in favorites on remove', async () => {
    templateExists.mockResolvedValue(true);
    loadConfig.mockResolvedValue({ favorites: ['node-api'] });
    await handler({ template: 'react-app', remove: true });
    expect(saveConfig).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not in'));
  });
});
