import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler, builder } from './export.js';
import * as templates from '../templates.js';
import fs from 'fs';
import archiver from 'archiver';

vi.mock('../templates.js');
vi.mock('archiver');
vi.mock('fs');

describe('export command', () => {
  const mockArchive = {
    pipe: vi.fn(),
    directory: vi.fn(),
    finalize: vi.fn(),
    on: vi.fn(),
  };

  const mockOutputStream = {
    on: vi.fn((event, cb) => {
      if (event === 'close') cb();
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/my-template');
    templates.loadTemplateMeta.mockReturnValue({ description: 'A test template' });
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue(undefined);
    fs.createWriteStream.mockReturnValue(mockOutputStream);
    fs.statSync.mockReturnValue({ size: 2048 });
    archiver.mockReturnValue(mockArchive);
    mockArchive.on.mockImplementation((event, cb) => mockArchive);
  });

  it('exits with error if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(handler({ name: 'missing', dest: '/out' })).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('missing'));
    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('creates dest directory if it does not exist', async () => {
    fs.existsSync.mockReturnValue(false);
    await handler({ name: 'my-template', dest: '/new-dir' });
    expect(fs.mkdirSync).toHaveBeenCalledWith('/new-dir', { recursive: true });
  });

  it('uses custom output filename when provided', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ name: 'my-template', dest: '/out', output: 'custom-name' });
    expect(fs.createWriteStream).toHaveBeenCalledWith(expect.stringContaining('custom-name.zip'));
    logSpy.mockRestore();
  });

  it('logs success message with size info', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ name: 'my-template', dest: '/out' });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('my-template'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('KB'));
    logSpy.mockRestore();
  });

  it('builder registers name, dest, and output options', () => {
    const yargs = { positional: vi.fn().mockReturnThis(), option: vi.fn().mockReturnThis() };
    builder(yargs);
    expect(yargs.positional).toHaveBeenCalledWith('name', expect.any(Object));
    expect(yargs.positional).toHaveBeenCalledWith('dest', expect.any(Object));
    expect(yargs.option).toHaveBeenCalledWith('output', expect.any(Object));
  });
});
