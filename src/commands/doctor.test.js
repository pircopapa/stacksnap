const { runChecks } = require('./doctor');
const { loadConfig, getTemplatesDir } = require('../config');
const { listTemplates, loadTemplateMeta } = require('../templates');
const fs = require('fs');

jest.mock('../config');
jest.mock('../templates');
jest.mock('fs');

describe('doctor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns ok when config and templates are healthy', async () => {
    loadConfig.mockReturnValue({ templatesDir: '/tmp/templates' });
    getTemplatesDir.mockReturnValue('/tmp/templates');
    fs.existsSync.mockReturnValue(true);
    listTemplates.mockReturnValue(['react-app']);
    loadTemplateMeta.mockReturnValue({ name: 'react-app', description: 'A React app', version: '1.0.0' });

    const results = await runChecks();
    expect(results.every(r => r.ok)).toBe(true);
  });

  it('flags missing templates directory', async () => {
    loadConfig.mockReturnValue({});
    getTemplatesDir.mockReturnValue('/missing/dir');
    fs.existsSync.mockReturnValue(false);
    listTemplates.mockReturnValue([]);

    const results = await runChecks();
    const dirCheck = results.find(r => r.check.includes('Templates directory exists'));
    expect(dirCheck.ok).toBe(false);
  });

  it('flags template with missing meta fields', async () => {
    loadConfig.mockReturnValue({});
    getTemplatesDir.mockReturnValue('/tmp/templates');
    fs.existsSync.mockReturnValue(true);
    listTemplates.mockReturnValue(['bad-template']);
    loadTemplateMeta.mockReturnValue({ name: 'bad-template' });

    const results = await runChecks();
    const metaCheck = results.find(r => r.check.includes('bad-template') && r.check.includes('meta'));
    expect(metaCheck.ok).toBe(false);
    expect(metaCheck.detail).toContain('description');
    expect(metaCheck.detail).toContain('version');
  });

  it('handles config load error gracefully', async () => {
    loadConfig.mockImplementation(() => { throw new Error('no config'); });

    const results = await runChecks();
    const configCheck = results.find(r => r.check.includes('Config file readable'));
    expect(configCheck.ok).toBe(false);
    expect(configCheck.detail).toBe('no config');
  });

  it('handles meta load error per template', async () => {
    loadConfig.mockReturnValue({});
    getTemplatesDir.mockReturnValue('/tmp/templates');
    fs.existsSync.mockReturnValue(true);
    listTemplates.mockReturnValue(['broken']);
    loadTemplateMeta.mockImplementation(() => { throw new Error('parse error'); });

    const results = await runChecks();
    const metaCheck = results.find(r => r.check.includes('broken'));
    expect(metaCheck.ok).toBe(false);
  });
});
