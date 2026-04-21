const { handler, builder } = require('./annotate');

jest.mock('../templates');
jest.mock('../config');

const { templateExists } = require('../templates');
const { loadConfig, saveConfig } = require('../config');

describe('annotate command', () => {
  let mockConfig;

  beforeEach(() => {
    mockConfig = { annotations: {} };
    loadConfig.mockReturnValue(mockConfig);
    saveConfig.mockImplementation((c) => { Object.assign(mockConfig, c); });
    templateExists.mockReturnValue(true);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  afterEach(() => jest.restoreAllMocks());

  test('sets annotation when note is provided', async () => {
    await handler({ template: 'react-app', note: 'Great for SPAs', clear: false });
    expect(saveConfig).toHaveBeenCalled();
    expect(mockConfig.annotations['react-app']).toBe('Great for SPAs');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Great for SPAs'));
  });

  test('reads annotation when no note or clear', async () => {
    mockConfig.annotations['react-app'] = 'Existing note';
    await handler({ template: 'react-app', note: undefined, clear: false });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Existing note'));
  });

  test('reports no annotation when none set', async () => {
    await handler({ template: 'react-app', note: undefined, clear: false });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No annotation'));
  });

  test('clears annotation when --clear is set', async () => {
    mockConfig.annotations['react-app'] = 'to be removed';
    await handler({ template: 'react-app', note: undefined, clear: true });
    expect(mockConfig.annotations['react-app']).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('cleared'));
  });

  test('exits if template does not exist', async () => {
    templateExists.mockReturnValue(false);
    await expect(handler({ template: 'ghost', note: 'x', clear: false })).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });
});
