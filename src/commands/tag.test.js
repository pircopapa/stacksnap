import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './tag.js';
import * as templates from '../templates.js';
import * as config from '../config.js';

vi.mock('../templates.js');
vi.mock('../config.js');

describe('tag command', () => {
  let mockConfig;

  beforeEach(() => {
    mockConfig = { tags: { myapp: ['frontend'] } };
    vi.spyOn(templates, 'templateExists').mockReturnValue(true);
    vi.spyOn(config, 'loadConfig').mockReturnValue(mockConfig);
    vi.spyOn(config, 'saveConfig').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('lists tags for a template', async () => {
    await handler({ action: 'list', template: 'myapp', tags: [] });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('frontend'));
  });

  it('shows message when no tags exist', async () => {
    mockConfig.tags = {};
    await handler({ action: 'list', template: 'myapp', tags: [] });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No tags'));
  });

  it('adds tags to a template', async () => {
    await handler({ action: 'add', template: 'myapp', tags: ['backend', 'node'] });
    expect(config.saveConfig).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Added'));
  });

  it('does not duplicate existing tags on add', async () => {
    await handler({ action: 'add', template: 'myapp', tags: ['frontend'] });
    expect(mockConfig.tags['myapp'].filter((t) => t === 'frontend').length).toBe(1);
  });

  it('removes tags from a template', async () => {
    await handler({ action: 'remove', template: 'myapp', tags: ['frontend'] });
    expect(config.saveConfig).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Removed'));
  });

  it('exits if template does not exist', async () => {
    vi.spyOn(templates, 'templateExists').mockReturnValue(false);
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handler({ action: 'add', template: 'ghost', tags: ['x'] })).rejects.toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
  });

  it('exits if no tags provided for add', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handler({ action: 'add', template: 'myapp', tags: [] })).rejects.toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
  });
});
