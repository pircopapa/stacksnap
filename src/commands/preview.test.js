import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './preview.js';
import * as templates from '../templates.js';
import fs from 'fs';

vi.mock('../templates.js');
vi.mock('fs');

describe('preview command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  it('exits if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    await expect(handler({ template: 'ghost' })).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('prints template info and file tree', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.loadTemplateMeta.mockReturnValue({ name: 'React App', description: 'A react starter' });
    templates.getTemplatePath.mockReturnValue('/templates/react');
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue([
      { name: 'index.js', isDirectory: () => false },
      { name: 'src', isDirectory: () => true },
    ]);

    await handler({ template: 'react' });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('React App'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('A react starter'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('index.js'));
  });

  it('handles missing files directory gracefully', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.loadTemplateMeta.mockReturnValue({ name: 'Empty' });
    templates.getTemplatePath.mockReturnValue('/templates/empty');
    fs.existsSync.mockReturnValue(false);

    await handler({ template: 'empty' });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('no files directory found'));
  });
});
