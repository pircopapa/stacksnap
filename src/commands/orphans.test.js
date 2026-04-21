import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './orphans.js';
import * as config from '../config.js';
import * as templates from '../templates.js';

vi.mock('../config.js');
vi.mock('../templates.js');

const mockTemplatesDir = '/mock/templates';

beforeEach(() => {
  vi.clearAllMocks();
  config.getTemplatesDir.mockReturnValue(mockTemplatesDir);
});

describe('orphans command', () => {
  it('prints message when no templates exist', async () => {
    config.loadConfig.mockReturnValue({});
    templates.listTemplates.mockReturnValue([]);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ verbose: false });

    expect(log).toHaveBeenCalledWith('No templates found.');
  });

  it('prints message when all templates are referenced', async () => {
    config.loadConfig.mockReturnValue({ pinned: ['react-base'], history: [] });
    templates.listTemplates.mockReturnValue(['react-base']);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ verbose: false });

    expect(log).toHaveBeenCalledWith('No orphaned templates found.');
  });

  it('identifies orphaned templates not in aliases, pins, or history', async () => {
    config.loadConfig.mockReturnValue({
      aliases: { r: 'react-base' },
      pinned: [],
      history: [{ template: 'vue-base' }],
    });
    templates.listTemplates.mockReturnValue(['react-base', 'vue-base', 'svelte-starter']);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ verbose: false });

    expect(log).toHaveBeenCalledWith('Found 1 orphaned template(s):\n');
    expect(log).toHaveBeenCalledWith('  svelte-starter');
  });

  it('shows meta details in verbose mode', async () => {
    config.loadConfig.mockReturnValue({ pinned: [], history: [], aliases: {} });
    templates.listTemplates.mockReturnValue(['svelte-starter']);
    templates.loadTemplateMeta.mockReturnValue({
      description: 'A svelte starter',
      version: '1.0.0',
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ verbose: true });

    expect(log).toHaveBeenCalledWith('  svelte-starter');
    expect(log).toHaveBeenCalledWith('    description: A svelte starter');
    expect(log).toHaveBeenCalledWith('    version:     1.0.0');
  });

  it('handles missing meta gracefully in verbose mode', async () => {
    config.loadConfig.mockReturnValue({});
    templates.listTemplates.mockReturnValue(['broken-template']);
    templates.loadTemplateMeta.mockImplementation(() => { throw new Error('no meta'); });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handler({ verbose: true });

    expect(log).toHaveBeenCalledWith('  broken-template (could not load meta)');
  });
});
