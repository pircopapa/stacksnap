import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler, builder } from './copy.js';
import * as templates from '../templates.js';
import fs from 'fs-extra';

vi.mock('../templates.js');
vi.mock('fs-extra');

const mockYargs = { positional: vi.fn().mockReturnThis(), option: vi.fn().mockReturnThis() };

describe('copy command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  });

  it('builder registers expected options', () => {
    builder(mockYargs);
    expect(mockYargs.positional).toHaveBeenCalledWith('template', expect.any(Object));
    expect(mockYargs.positional).toHaveBeenCalledWith('destination', expect.any(Object));
    expect(mockYargs.option).toHaveBeenCalledWith('force', expect.any(Object));
  });

  it('exits if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    await expect(handler({ template: 'ghost', destination: 'out', force: false })).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });

  it('exits if destination exists and force is false', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/react');
    fs.existsSync.mockReturnValue(true);
    await expect(handler({ template: 'react', destination: 'out', force: false })).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('already exists'));
  });

  it('overwrites destination when force is true', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/react');
    fs.existsSync.mockReturnValue(true);
    fs.copy.mockResolvedValue();
    await handler({ template: 'react', destination: 'out', force: true });
    expect(fs.copy).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('copied to'));
  });

  it('copies template successfully', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/react');
    fs.existsSync.mockReturnValue(false);
    fs.copy.mockResolvedValue();
    await handler({ template: 'react', destination: 'my-template', force: false });
    expect(fs.copy).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('copied to'));
  });

  it('exits on copy failure', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/react');
    fs.existsSync.mockReturnValue(false);
    fs.copy.mockRejectedValue(new Error('disk full'));
    await expect(handler({ template: 'react', destination: 'out', force: false })).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('disk full'));
  });
});
