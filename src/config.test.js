const fs = require('fs');
const path = require('path');
const os = require('os');

jest.mock('fs');

describe('config module', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns defaults when config file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    const { loadConfig } = require('./config');
    const cfg = loadConfig();
    expect(cfg.colorOutput).toBe(true);
    expect(cfg.defaultAuthor).toBe('');
  });

  it('merges saved config with defaults', () => {
    fs.existsSync.mockImplementation((p) => p.endsWith('config.json'));
    fs.mkdirSync.mockImplementation(() => {});
    fs.readFileSync.mockReturnValue(JSON.stringify({ defaultAuthor: 'Alice' }));
    const { loadConfig } = require('./config');
    const cfg = loadConfig();
    expect(cfg.defaultAuthor).toBe('Alice');
    expect(cfg.colorOutput).toBe(true);
  });

  it('saves config and returns merged result', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({}));
    fs.writeFileSync.mockImplementation(() => {});
    const { saveConfig } = require('./config');
    const result = saveConfig({ defaultAuthor: 'Bob' });
    expect(result.defaultAuthor).toBe('Bob');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('getTemplatesDir returns configured path', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify({ templatesDir: '/custom/templates' }));
    const { getTemplatesDir } = require('./config');
    expect(getTemplatesDir()).toBe('/custom/templates');
  });
});
