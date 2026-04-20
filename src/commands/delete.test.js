import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './delete.js';
import * as templates from '../templates.js';
import fs from 'fs-extra';
import inquirer from 'inquirer';

vi.mock('../templates.js');
vi.mock('fs-extra');
vi.mock('inquirer');
vi.mock('chalk', () => ({
  default: {
    red: (s) => s,
    green: (s) => s,
    yellow: (s) => s,
  },
}));

describe('delete command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exits with error if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    await handler({ name: 'ghost', force: true });
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('deletes template without prompt when --force is set', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/my-template');
    fs.remove = vi.fn().mockResolvedValue();

    await handler({ name: 'my-template', force: true });

    expect(fs.remove).toHaveBeenCalledWith('/templates/my-template');
    expect(inquirer.prompt).not.toHaveBeenCalled();
  });

  it('prompts for confirmation when --force is not set', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/my-template');
    fs.remove = vi.fn().mockResolvedValue();
    inquirer.prompt = vi.fn().mockResolvedValue({ confirmed: true });

    await handler({ name: 'my-template', force: false });

    expect(inquirer.prompt).toHaveBeenCalled();
    expect(fs.remove).toHaveBeenCalledWith('/templates/my-template');
  });

  it('cancels deletion if user declines confirmation', async () => {
    templates.templateExists.mockReturnValue(true);
    fs.remove = vi.fn();
    inquirer.prompt = vi.fn().mockResolvedValue({ confirmed: false });

    await handler({ name: 'my-template', force: false });

    expect(fs.remove).not.toHaveBeenCalled();
  });

  it('exits with error if fs.remove fails', async () => {
    templates.templateExists.mockReturnValue(true);
    templates.getTemplatePath.mockReturnValue('/templates/my-template');
    fs.remove = vi.fn().mockRejectedValue(new Error('permission denied'));
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    await handler({ name: 'my-template', force: true });

    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
