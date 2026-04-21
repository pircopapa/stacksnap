import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler, resolveAlias } from './alias.js';
import * as config from '../config.js';
import * as templates from '../templates.js';

vi.mock('../config.js');
vi.mock('../templates.js');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('alias command', () => {
  it('lists aliases when none exist', async () => {
    config.loadConfig.mockReturnValue({ aliases: {} });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ action: 'list' });
    expect(log).toHaveBeenCalledWith('No aliases defined.');
  });

  it('lists existing aliases', async () => {
    config.loadConfig.mockReturnValue({ aliases: { myapp: 'react-ts' } });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ action: 'list' });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('myapp -> react-ts'));
  });

  it('sets a new alias', async () => {
    config.loadConfig.mockReturnValue({ aliases: {} });
    config.saveConfig.mockImplementation(() => {});
    templates.templateExists.mockReturnValue(true);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ action: 'set', name: 'myapp', template: 'react-ts' });
    expect(config.saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({ aliases: { myapp: 'react-ts' } })
    );
    expect(log).toHaveBeenCalledWith(expect.stringContaining('saved'));
  });

  it('errors when setting alias for missing template', async () => {
    config.loadConfig.mockReturnValue({ aliases: {} });
    templates.templateExists.mockReturnValue(false);
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handler({ action: 'set', name: 'bad', template: 'nonexistent' })).rejects.toThrow();
    expect(err).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
  });

  it('removes an existing alias', async () => {
    config.loadConfig.mockReturnValue({ aliases: { myapp: 'react-ts' } });
    config.saveConfig.mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ action: 'remove', name: 'myapp' });
    expect(config.saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({ aliases: {} })
    );
    expect(log).toHaveBeenCalledWith(expect.stringContaining('removed'));
  });

  it('errors when removing nonexistent alias', async () => {
    config.loadConfig.mockReturnValue({ aliases: {} });
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handler({ action: 'remove', name: 'ghost' })).rejects.toThrow();
    expect(err).toHaveBeenCalledWith(expect.stringContaining('not found'));
  });
});

describe('resolveAlias', () => {
  it('resolves a known alias', () => {
    config.loadConfig.mockReturnValue({ aliases: { myapp: 'react-ts' } });
    expect(resolveAlias('myapp')).toBe('react-ts');
  });

  it('returns original name if no alias found', () => {
    config.loadConfig.mockReturnValue({ aliases: {} });
    expect(resolveAlias('react-ts')).toBe('react-ts');
  });
});
