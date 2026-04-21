import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { createSnapshot } from './snapshot.js';
import * as templates from '../templates.js';
import * as config from '../config.js';

vi.mock('../config.js');
vi.mock('../templates.js');
vi.mock('fs');

const TEMPLATES_DIR = '/mock/templates';

beforeEach(() => {
  vi.clearAllMocks();
  config.loadConfig.mockResolvedValue({});
  config.getTemplatesDir.mockReturnValue(TEMPLATES_DIR);
  templates.templateExists.mockReturnValue(true);
  fs.mkdirSync.mockImplementation(() => {});
  fs.readdirSync.mockReturnValue([]);
  fs.statSync.mockReturnValue({ isDirectory: () => false });
  fs.copyFileSync.mockImplementation(() => {});
});

describe('createSnapshot', () => {
  it('throws if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    await expect(createSnapshot('missing', null)).rejects.toThrow('does not exist');
  });

  it('creates snapshot directory', async () => {
    await createSnapshot('mytemplate', null);
    expect(fs.mkdirSync).toHaveBeenCalled();
  });

  it('includes label in snapshot id when provided', async () => {
    const { snapshotId } = await createSnapshot('mytemplate', 'v1');
    expect(snapshotId).toContain('v1');
  });

  it('returns a snapshotId without label', async () => {
    const { snapshotId } = await createSnapshot('mytemplate', null);
    expect(typeof snapshotId).toBe('string');
    expect(snapshotId.length).toBeGreaterThan(0);
  });
});
