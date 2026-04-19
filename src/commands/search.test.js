import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './search.js';
import * as templates from '../templates.js';

vi.mock('../templates.js');

const mockTemplates = [
  { name: 'react-app', description: 'A React starter', tags: ['react', 'frontend'] },
  { name: 'express-api', description: 'Express REST API', tags: ['node', 'backend'] },
  { name: 'react-native', description: 'Mobile app template', tags: ['react', 'mobile'] },
];

beforeEach(() => {
  vi.clearAllMocks();
  templates.listTemplates.mockReturnValue(mockTemplates.map((t) => t.name));
  templates.loadTemplateMeta.mockImplementation((name) =>
    mockTemplates.find((t) => t.name === name)
  );
});

describe('search command handler', () => {
  it('returns all templates when query matches broadly', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ query: 'react' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2 template(s)'));
    spy.mockRestore();
  });

  it('filters by tag', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ query: '', tag: 'backend' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('1 template(s)'));
    spy.mockRestore();
  });

  it('shows no results message when nothing matches', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ query: 'nonexistent' });
    expect(spy).toHaveBeenCalledWith('No templates matched your search.');
    spy.mockRestore();
  });

  it('matches on description', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ query: 'Mobile' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('react-native'));
    spy.mockRestore();
  });

  it('is case-insensitive for tag filter', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ query: '', tag: 'REACT' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2 template(s)'));
    spy.mockRestore();
  });
});
