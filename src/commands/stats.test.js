import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './stats.js';
import * as config from '../config.js';
import * as templates from '../templates.js';

vi.mock('../config.js');
vi.mock('../templates.js');

const mockConfig = {
  history: [
    { template: 'react-app', date: '2024-01-10' },
    { template: 'react-app', date: '2024-02-01' },
    { template: 'express-api', date: '2024-01-15' },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  config.loadConfig.mockResolvedValue(mockConfig);
  templates.listTemplates.mockResolvedValue(['react-app', 'express-api', 'vue-app']);
});

describe('stats command', () => {
  it('prints stats for all templates sorted by usage', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({});
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('react-app');
    expect(output).toContain('express-api');
    expect(output).toContain('vue-app');
    spy.mockRestore();
  });

  it('shows react-app with 2 uses', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({});
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toMatch(/react-app.*2/);
    spy.mockRestore();
  });

  it('shows single template stats when --template flag given', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ template: 'react-app' });
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('react-app');
    expect(output).toContain('2');
    spy.mockRestore();
  });

  it('shows never used for unknown template', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ template: 'vue-app' });
    const output = spy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('never');
    spy.mockRestore();
  });

  it('handles empty template list gracefully', async () => {
    templates.listTemplates.mockResolvedValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({});
    expect(spy).toHaveBeenCalledWith('No templates found.');
    spy.mockRestore();
  });
});
