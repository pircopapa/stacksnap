import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './search-tags.js';
import * as templates from '../templates.js';
import * as config from '../config.js';

vi.mock('../templates.js');
vi.mock('../config.js');

describe('search-tags command', () => {
  beforeEach(() => {
    vi.spyOn(templates, 'listTemplates').mockReturnValue(['react-app', 'vue-app', 'express-api']);
    vi.spyOn(config, 'loadConfig').mockReturnValue({
      tags: {
        'react-app': ['frontend', 'react'],
        'vue-app': ['frontend', 'vue'],
        'express-api': ['backend', 'node'],
      },
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('finds templates matching any tag', async () => {
    await handler({ tags: ['frontend'], match: 'any' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('react-app'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('vue-app'));
  });

  it('finds templates matching all tags', async () => {
    await handler({ tags: ['frontend', 'react'], match: 'all' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('react-app'));
  });

  it('excludes templates that do not match all tags', async () => {
    await handler({ tags: ['frontend', 'node'], match: 'all' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No templates found'));
  });

  it('shows no results message when nothing matches', async () => {
    await handler({ tags: ['python'], match: 'any' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No templates found'));
  });

  it('handles templates with no tags gracefully', async () => {
    vi.spyOn(config, 'loadConfig').mockReturnValue({ tags: {} });
    await handler({ tags: ['frontend'], match: 'any' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No templates found'));
  });

  it('displays tags alongside template names in results', async () => {
    await handler({ tags: ['backend'], match: 'any' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('express-api'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('backend'));
  });
});
