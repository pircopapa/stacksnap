import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './info.js';
import * as templates from '../templates.js';

vi.mock('../templates.js');
vi.mock('chalk', () => ({
  default: {
    red: s => s,
    dim: s => s,
    bold: { cyan: s => s },
    white: s => s,
    yellow: s => s,
    green: s => s,
    cyan: s => s,
  },
}));

const mockMeta = {
  name: 'React App',
  description: 'A basic React application template',
  version: '1.0.0',
  author: 'stacksnap',
  tags: ['react', 'frontend'],
  files: ['src/index.jsx', 'package.json', 'vite.config.js'],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

describe('info command handler', () => {
  it('prints template details when template exists', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.loadTemplateMeta.mockReturnValue(mockMeta);
    templates.getTemplatePath.mockReturnValue('/templates/react-app');

    await handler({ template: 'react-app' });

    expect(templates.loadTemplateMeta).toHaveBeenCalledWith('react-app');
    expect(console.log).toHaveBeenCalled();
  });

  it('exits with error when template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);

    await expect(handler({ template: 'nonexistent' })).rejects.toThrow('exit');

    expect(console.error).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('handles meta without optional fields', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.loadTemplateMeta.mockReturnValue({ name: 'Minimal' });
    templates.getTemplatePath.mockReturnValue('/templates/minimal');

    await handler({ template: 'minimal' });

    expect(console.log).toHaveBeenCalled();
  });
});
