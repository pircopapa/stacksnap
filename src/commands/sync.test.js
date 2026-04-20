import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './sync.js';
import * as templates from '../templates.js';
import * as preview from './preview.js';
import fs from 'fs';

vi.mock('../templates.js');
vi.mock('./preview.js');
vi.mock('fs');

describe('sync command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  it('exits if template not found', async () => {
    templates.templateExists.mockReturnValue(false);
    await expect(handler({ template: 'ghost', target: '.', dryRun: false, overwrite: false })).rejects.toThrow('exit');
  });

  it('exits if target does not exist', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/node');
    fs.existsSync.mockReturnValue(false);
    await expect(handler({ template: 'node', target: './nope', dryRun: false, overwrite: false })).rejects.toThrow('exit');
  });

  it('skips existing files when overwrite is false', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/node');
    fs.existsSync.mockReturnValue(true);
    preview.walkDir.mockReturnValue(['/templates/node/index.js']);
    await handler({ template: 'node', target: '/target', dryRun: false, overwrite: false });
    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('0 file(s)'));
  });

  it('copies new files', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/node');
    fs.existsSync.mockImplementation((p) => p === '/target');
    preview.walkDir.mockReturnValue(['/templates/node/index.js']);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});
    await handler({ template: 'node', target: '/target', dryRun: false, overwrite: false });
    expect(fs.copyFileSync).toHaveBeenCalled();
  });

  it('logs but does not copy in dry-run mode', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/node');
    fs.existsSync.mockImplementation((p) => p === '/target');
    preview.walkDir.mockReturnValue(['/templates/node/index.js']);
    await handler({ template: 'node', target: '/target', dryRun: true, overwrite: false });
    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('[dry-run]'));
  });
});
