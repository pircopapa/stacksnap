import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from './pin.js';
import * as config from '../config.js';
import * as templates from '../templates.js';

vi.mock('../config.js');
vi.mock('../templates.js');

describe('pin command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    templates.templateExists.mockReturnValue(true);
    config.loadConfig.mockReturnValue({ pinned: [] });
  });

  it('pins a template', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ template: 'react-app', unpin: false });
    expect(config.saveConfig).toHaveBeenCalledWith({ pinned: ['react-app'] });
    expect(spy).toHaveBeenCalledWith('Pinned template "react-app".');
  });

  it('does not pin duplicate', async () => {
    config.loadConfig.mockReturnValue({ pinned: ['react-app'] });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ template: 'react-app', unpin: false });
    expect(config.saveConfig).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('Template "react-app" is already pinned.');
  });

  it('unpins a template', async () => {
    config.loadConfig.mockReturnValue({ pinned: ['react-app'] });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ template: 'react-app', unpin: true });
    expect(config.saveConfig).toHaveBeenCalledWith({ pinned: [] });
    expect(spy).toHaveBeenCalledWith('Unpinned template "react-app".');
  });

  it('handles unpin when not pinned', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await handler({ template: 'react-app', unpin: true });
    expect(config.saveConfig).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('Template "react-app" is not pinned.');
  });

  it('exits if template does not exist', async () => {
    templates.templateExists.mockReturnValue(false);
    const spy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await handler({ template: 'ghost', unpin: false });
    expect(spy).toHaveBeenCalledWith(1);
  });
});
