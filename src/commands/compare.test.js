import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compareTemplates, handler } from './compare.js';
import * as templates from '../templates.js';

vi.mock('../templates.js', () => ({
  templateExists: vi.fn(),
  loadTemplateMeta: vi.fn(),
  getTemplatePath: vi.fn(),
}));

vi.mock('fs', () => ({
  default: {
    readdirSync: vi.fn(() => ['index.js', 'README.md']),
    statSync: vi.fn(() => ({ isDirectory: () => false })),
  },
}));

describe('compareTemplates', () => {
  it('returns empty array when metas are identical', () => {
    const meta = { name: 'foo', version: '1.0.0' };
    expect(compareTemplates(meta, { ...meta })).toEqual([]);
  });

  it('detects changed values', () => {
    const diffs = compareTemplates({ version: '1.0.0' }, { version: '2.0.0' });
    expect(diffs).toHaveLength(1);
    expect(diffs[0].key).toBe('version');
  });

  it('detects missing keys', () => {
    const diffs = compareTemplates({ name: 'foo', tags: ['a'] }, { name: 'foo' });
    expect(diffs).toHaveLength(1);
    expect(diffs[0].key).toBe('tags');
  });

  it('detects extra keys in second meta', () => {
    const diffs = compareTemplates({ name: 'foo' }, { name: 'foo', author: 'bar' });
    expect(diffs).toHaveLength(1);
    expect(diffs[0].a).toBe('(none)');
  });
});

describe('handler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('errors if templateA does not exist', async () => {
    templates.templateExists.mockReturnValueOnce(false);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await handler({ templateA: 'a', templateB: 'b', meta: true, files: false });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('a'));
  });

  it('errors if templateB does not exist', async () => {
    templates.templateExists.mockReturnValueOnce(true).mockReturnValueOnce(false);
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await handler({ templateA: 'a', templateB: 'b', meta: true, files: false });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('b'));
  });

  it('logs identical when metas match', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.loadTemplateMeta.mockReturnValue({ name: 'x', version: '1.0.0' });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ templateA: 'a', templateB: 'b', meta: true, files: false });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('identical'));
  });
});
