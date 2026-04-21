import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './pinned.js';
import * as config from '../config.js';
import * as templates from '../templates.js';

vi.mock('../config.js');
vi.mock('../templates.js');

describe('pinned command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows message when no pinned templates', async () => {
    config.loadConfig.mockReturnValue({ pinned: [] });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ verbose: false });
    expect(spy).toHaveBeenCalledWith(
      'No pinned templates. Use `stacksnap pin <template>` to pin one.'
    );
  });

  it('lists pinned templates', async () => {
    config.loadConfig.mockReturnValue({ pinned: ['react-app', 'node-api'] });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ verbose: false });
    expect(spy).toHaveBeenCalledWith('  📌 react-app');
    expect(spy).toHaveBeenCalledWith('  📌 node-api');
  });

  it('shows descriptions in verbose mode', async () => {
    config.loadConfig.mockReturnValue({ pinned: ['react-app'] });
    templates.loadTemplateMeta.mockReturnValue({ description: 'A React starter' });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ verbose: true });
    expect(spy).toHaveBeenCalledWith('  📌 react-app — A React starter');
  });

  it('handles missing meta in verbose mode gracefully', async () => {
    config.loadConfig.mockReturnValue({ pinned: ['mystery'] });
    templates.loadTemplateMeta.mockImplementation(() => { throw new Error('not found'); });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ verbose: true });
    expect(spy).toHaveBeenCalledWith('  📌 mystery — (metadata unavailable)');
  });

  it('handles missing pinned key in config', async () => {
    config.loadConfig.mockReturnValue({});
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ verbose: false });
    expect(spy).toHaveBeenCalledWith(
      'No pinned templates. Use `stacksnap pin <template>` to pin one.'
    );
  });
});
