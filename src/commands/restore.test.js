import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import { restoreSnapshot } from './restore.js';
import * as templates from '../templates.js';

vi.mock('../templates.js');
vi.mock('fs');

const TEMPLATES_DIR = '/mock/templates';

beforeEach(() => {
  vi.clearAllMocks();
  templates.templateExists.mockReturnValue(true);
  fs.existsSync.mockReturnValue(true);
  fs.readdirSync.mockReturnValue([]);
  fs.rmSync.mockImplementation(() => {});
  fs.copyFileSync.mockImplementation(() => {});
  fs.cpSync.mockImplementation(() => {});
});

describe('restoreSnapshot', () => {
  it('throws if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    await expect(restoreSnapshot('missing', 'snap1', TEMPLATES_DIR)).rejects.toThrow('does not exist');
  });

  it('throws if snapshot does not exist', async () => {
    fs.existsSync.mockReturnValue(false);
    await expect(restoreSnapshot('tmpl', 'bad-snap', TEMPLATES_DIR)).rejects.toThrow('not found');
  });

  it('does not modify files in dry-run mode', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await restoreSnapshot('tmpl', 'snap1', TEMPLATES_DIR, true);
    expect(fs.rmSync).not.toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('removes old files and copies snapshot on restore', async () => {
    fs.readdirSync.mockImplementation((dir, opts) => {
      if (opts) return [{ name: 'file.txt', isDirectory: () => false }];
      return ['file.txt', '.snapshots'];
    });
    await restoreSnapshot('tmpl', 'snap1', TEMPLATES_DIR, false);
    expect(fs.rmSync).toHaveBeenCalled();
    expect(fs.copyFileSync).toHaveBeenCalled();
  });

  it('returns snapshotId on success', async () => {
    const result = await restoreSnapshot('tmpl', 'snap1', TEMPLATES_DIR, false);
    expect(result).toBe('snap1');
  });
});
