import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listCommand } from './list.js';
import * as templates from '../templates.js';

vi.mock('../templates.js');

const mockMeta = {
  displayName: 'React App',
  description: 'A basic React starter.',
  version: '1.0.0',
  tags: ['react', 'frontend'],
  author: 'stacksnap',
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

describe('listCommand', () => {
  it('prints message when no templates exist', async () => {
    templates.listTemplates.mockResolvedValue([]);
    await listCommand();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No templates found'));
  });

  it('lists templates with metadata', async () => {
    templates.listTemplates.mockResolvedValue(['react-app']);
    templates.loadTemplateMeta.mockResolvedValue(mockMeta);

    await listCommand();

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('React App');
    expect(calls).toContain('A basic React starter.');
    expect(calls).toContain('1 template(s) available');
  });

  it('shows author in verbose mode', async () => {
    templates.listTemplates.mockResolvedValue(['react-app']);
    templates.loadTemplateMeta.mockResolvedValue(mockMeta);

    await listCommand({ verbose: true });

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('Author:');
    expect(calls).toContain('stacksnap');
  });

  it('handles missing metadata gracefully', async () => {
    templates.listTemplates.mockResolvedValue(['broken-template']);
    templates.loadTemplateMeta.mockRejectedValue(new Error('not found'));

    await listCommand();

    const calls = console.log.mock.calls.flat().join(' ');
    expect(calls).toContain('broken-template');
    expect(calls).toContain('metadata unavailable');
  });
});
