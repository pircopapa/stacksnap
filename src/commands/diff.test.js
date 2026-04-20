import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './diff.js';
import * as templates from '../templates.js';
import * as preview from './preview.js';
import fs from 'fs';

vi.mock('../templates.js');
vi.mock('./preview.js');
vi.mock('fs');

describe('diff command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  it('exits if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    await expect(handler({ template: 'ghost', target: './myapp', filesOnly: false })).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('exits if target directory does not exist', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/node');
    fs.existsSync.mockReturnValue(false);
    await expect(handler({ template: 'node', target: './missing', filesOnly: false })).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
  });

  it('shows files only in template', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/node');
    fs.existsSync.mockReturnValue(true);
    preview.walkDir
      .mockReturnValueOnce(['/templates/node/index.js', '/templates/node/README.md'])
      .mockReturnValueOnce(['/target/index.js']);
    fs.readFileSync.mockReturnValue('same content');
    await handler({ template: 'node', target: '/target', filesOnly: false });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('README.md'));
  });

  it('shows no differences when directories match', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/node');
    fs.existsSync.mockReturnValue(true);
    preview.walkDir
      .mockReturnValueOnce(['/templates/node/index.js'])
      .mockReturnValueOnce(['/target/index.js']);
    fs.readFileSync.mockReturnValue('same content');
    await handler({ template: 'node', target: '/target', filesOnly: false });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No file differences'));
  });

  it('skips content diff when --files-only is set', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/node');
    fs.existsSync.mockReturnValue(true);
    preview.walkDir
      .mockReturnValueOnce(['/templates/node/index.js'])
      .mockReturnValueOnce(['/target/index.js']);
    await handler({ template: 'node', target: '/target', filesOnly: true });
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });
});
